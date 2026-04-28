/* =========================================================================
   AuthProvider — Google sign-in + RTDB progress sync.
   Feature-flagged: inert unless window.MELAKHIM_AUTH_ENABLED === true.
   Config source: JSON in localStorage["melakhim_firebase_config"] —
   {apiKey, authDomain, databaseURL, projectId, appId}.
   Progress sync: users/{uid}/progress on RTDB (same instance as leaderboard).
   This commit: skeleton only — config read, flag gate, window namespace.
   No SDK load, no UI, no sync yet (each lands in its own commit).
   Exposes: window.MelakhimAuth, window.AuthButtonComponent.
   ========================================================================= */
(function(){
  const CONFIG_KEY = "melakhim_firebase_config";
  const { useState, useEffect } = React;

  // ---- status enum ----
  // "disabled"       — feature flag off
  // "no-config"      — flag on, no config in localStorage
  // "loading"        — SDK loading
  // "ready"          — SDK loaded, no user
  // "signed-in"      — user present
  // "error"          — init or sign-in failed

  const state = {
    status: "disabled",
    user: null,
    config: null,
    listeners: new Set(),
    error: null,
    userClass: null,            // 'יא1' | 'יא2' | 'יא3' | 'יא6' | 'מורה' | null
    classLoaded: false,
    classModalOpen: false
  };

  // Allowed class codes for the bagrut grade.
  const CLASSES = ['יא1', 'יא2', 'יא3', 'יא6'];
  const CLASS_OPTIONS = [...CLASSES, 'מורה'];

  function readConfig(){
    try {
      const r = localStorage.getItem(CONFIG_KEY);
      if (!r) return null;
      const cfg = JSON.parse(r);
      if (!cfg || !cfg.apiKey || !cfg.databaseURL) return null;
      return cfg;
    } catch { return null; }
  }

  function emit(){
    state.listeners.forEach(fn => { try { fn({...state}); } catch {} });
  }

  function setStatus(s, extra){
    state.status = s;
    if (extra) Object.assign(state, extra);
    emit();
  }

  const FIREBASE_VERSION = "10.12.0";
  const SDK_URLS = [
    `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app-compat.js`,
    `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth-compat.js`
  ];

  function loadScript(src){
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[data-firebase-sdk="${src}"]`)) { resolve(); return; }
      const s = document.createElement("script");
      s.src = src;
      s.async = false;
      s.dataset.firebaseSdk = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("failed to load "+src));
      document.head.appendChild(s);
    });
  }

  async function loadFirebaseSDK(){
    for (const u of SDK_URLS) await loadScript(u);
    if (!window.firebase || !window.firebase.auth) throw new Error("firebase SDK missing after load");
  }

  async function initFirebase(cfg){
    await loadFirebaseSDK();
    if (!window.firebase.apps.length) {
      window.firebase.initializeApp(cfg);
    }
    // Persistence best-effort; Safari private mode can fail — don't block.
    try { await window.firebase.auth().setPersistence(window.firebase.auth.Auth.Persistence.LOCAL); } catch {}
    window.firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        setStatus("signed-in", { user, error: null, classLoaded: false, userClass: null });
        try { await pullAndMerge(user); } catch (e) { console.warn("[auth] pull+merge failed", e); }
        startSyncLoop();
        try { await loadUserClass(user); } catch (e) { console.warn("[auth] class load failed", e); }
      } else {
        stopSyncLoop();
        setStatus("ready", { user: null, userClass: null, classLoaded: false, classModalOpen: false });
      }
    });
  }

  // ---- Class selection (יא1/יא2/יא3/יא6/מורה) -----------------------------
  async function loadUserClass(user){
    if (!user || !dbBase()) return;
    try {
      const r = await authedFetch(`/users/${user.uid}/class.json`, { method: "GET" });
      if (r.ok) {
        const cls = await r.json();
        if (typeof cls === 'string' && cls) {
          state.userClass = cls;
          state.classLoaded = true;
          state.classModalOpen = false;
          emit();
          return;
        }
      }
    } catch {}
    // No class on record — open the picker.
    state.classLoaded = true;
    state.classModalOpen = true;
    emit();
  }

  async function setUserClass(cls){
    if (!state.user || !cls) return false;
    if (CLASS_OPTIONS.indexOf(cls) < 0) return false;
    try {
      const r = await authedFetch(`/users/${state.user.uid}/class.json`, {
        method: "PUT",
        body: JSON.stringify(cls)
      });
      if (!r.ok) { console.warn("[auth] class PUT failed", r.status); return false; }
      state.userClass = cls;
      state.classModalOpen = false;
      emit();
      return true;
    } catch (e) {
      console.warn("[auth] class PUT error", e);
      return false;
    }
  }

  function openClassPicker(){ state.classModalOpen = true; emit(); }
  function closeClassPicker(){ state.classModalOpen = false; emit(); }

  // ---- RTDB sync (debounced 2s) ----
  const PREFIXES = ["jarvis.", "melakhim_pro_"];
  const DEBOUNCE_MS = 2000;
  let syncBuffer = {};   // key → value (latest)
  let debounceTimer = null;
  let writeListener = null;

  function encodeKey(k){ return k.replace(/[.#$/\[\]]/g, "_"); }

  function dbBase(){
    const cfg = state.config;
    const url = (cfg && cfg.databaseURL) || "";
    return url.replace(/\/+$/, "");
  }

  async function authedFetch(path, init){
    const user = state.user;
    if (!user || !dbBase()) throw new Error("not ready");
    const token = await user.getIdToken();
    const url = `${dbBase()}${path}${path.indexOf("?")>=0?"&":"?"}auth=${encodeURIComponent(token)}`;
    return fetch(url, init);
  }

  async function pushBuffer(){
    if (!state.user) { syncBuffer = {}; return; }
    const pending = syncBuffer;
    syncBuffer = {};
    const uid = state.user.uid;
    const payload = {};
    Object.keys(pending).forEach(k => { payload[encodeKey(k)] = pending[k]; });
    try {
      const r = await authedFetch(`/users/${uid}/progress.json`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      });
      if (!r.ok) console.warn("[auth] sync PATCH failed", r.status);
    } catch (e) {
      console.warn("[auth] sync failed, re-queueing", e);
      // re-queue keys that weren't already replaced
      Object.keys(pending).forEach(k => { if (!(k in syncBuffer)) syncBuffer[k] = pending[k]; });
    }
  }

  function scheduleSync(){
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => { debounceTimer = null; pushBuffer(); }, DEBOUNCE_MS);
  }

  function onLocalWrite(ev){
    const d = ev && ev.detail; if (!d) return;
    const { key, value } = d;
    if (!key || !PREFIXES.some(p => key.indexOf(p) === 0)) return;
    syncBuffer[key] = value;
    scheduleSync();
  }

  function startSyncLoop(){
    if (writeListener) return;
    writeListener = onLocalWrite;
    window.addEventListener("mb-local-write", writeListener);
    window.addEventListener("mb-local-write", _onProgressWrite);
  }

  function stopSyncLoop(){
    if (writeListener) window.removeEventListener("mb-local-write", writeListener);
    window.removeEventListener("mb-local-write", _onProgressWrite);
    writeListener = null;
    if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
    if (lbTimer)       { clearTimeout(lbTimer);       lbTimer = null; }
    syncBuffer = {};
    lbPending = null;
  }

  async function pullAndMerge(user){
    if (!dbBase()) return;
    const uid = user.uid;
    let remote = null;
    try {
      const r = await authedFetch(`/users/${uid}/progress.json`, { method: "GET" });
      if (r.ok) remote = await r.json();
    } catch {}
    if (!remote || typeof remote !== "object") return;

    // Merge: remote value wins iff local is missing for that key (conservative —
    // avoids clobbering fresh local edits). Local-only keys are pushed up.
    const toPushUp = {};
    Object.keys(remote).forEach(encKey => {
      // we can't reliably invert encodeKey (replacement is lossy); carry as-is.
      // Local keys that never appeared remote will be pushed below.
      const raw = remote[encKey];
      // try a best-effort restore of the common dots → dots pattern (jarvis.X.Y)
      const candidate = encKey.replace(/_/g, ".");
      if (localStorage.getItem(candidate) == null && typeof raw === "string") {
        try { localStorage.setItem(candidate, raw); } catch {}
      }
    });
    // Push any local progress-prefixed key that is not in remote.
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !PREFIXES.some(p => k.indexOf(p) === 0)) continue;
        const enc = encodeKey(k);
        if (!(enc in (remote || {}))) toPushUp[enc] = localStorage.getItem(k);
      }
    } catch {}
    if (Object.keys(toPushUp).length) {
      try {
        await authedFetch(`/users/${uid}/progress.json`, {
          method: "PATCH", body: JSON.stringify(toPushUp)
        });
      } catch {}
    }
  }

  // ---- Leaderboard publish (throttled 1/sec) ------------------------------
  // Writes /leaderboard/{class}/{uid} = { display_name, xp, units_completed,
  // exam_avg, last_active }. Coalesces bursts; never blocks the caller.
  let lbPending = null;
  let lbLastWriteTs = 0;
  let lbTimer = null;

  function _readLocal(key, def){
    try { const v = localStorage.getItem(key); return v == null ? def : v; }
    catch { return def; }
  }
  function _readJSON(key, def){
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }
    catch { return def; }
  }
  function _readXP(){
    const cands = ['jarvis.melakhim.xp', 'melakhim_pro_xp'];
    for (const k of cands){
      const n = parseInt(_readLocal(k, ''), 10);
      if (isFinite(n)) return n;
    }
    // fallback: try unified state object
    const s = _readJSON('jarvis.melakhim.state', null);
    if (s && typeof s.xp === 'number') return s.xp;
    return 0;
  }
  function _readUnitsCompleted(){
    let n = 0;
    try {
      for (let i = 1; i <= 6; i++){
        const p = parseInt(_readLocal('jarvis.melakhim.progress.unit' + i, '0'), 10);
        if (isFinite(p) && p >= 100) n += 1;
      }
    } catch {}
    return n;
  }
  function _readExamAvg(){
    const list = _readJSON('jarvis.melakhim.exam2551.attempts', []);
    if (!Array.isArray(list) || !list.length) return 0;
    let sum = 0, c = 0;
    list.forEach(a => { if (a && typeof a.total === 'number'){ sum += a.total; c++; } });
    return c ? Math.round((sum/c) * 10) / 10 : 0;
  }

  function _displayName(){
    const u = state.user;
    if (u){
      if (u.displayName) return u.displayName;
      if (u.email) return u.email.split('@')[0];
    }
    const local = _readLocal('jarvis.melakhim.profile.name', '') || _readLocal('melakhim_pro_name', '');
    return local || 'תלמיד/ה';
  }

  function _buildSnapshot(){
    return {
      display_name: _displayName(),
      xp: _readXP(),
      units_completed: _readUnitsCompleted(),
      exam_avg: _readExamAvg(),
      last_active: Date.now()
    };
  }

  async function _flushLeaderboard(){
    lbTimer = null;
    const u = state.user;
    if (!u || !state.userClass) { lbPending = null; return; }
    const snap = lbPending || _buildSnapshot();
    lbPending = null;
    lbLastWriteTs = Date.now();
    const cls = encodeURIComponent(state.userClass);
    const uid = encodeURIComponent(u.uid);
    try {
      const r = await authedFetch(`/leaderboard/${cls}/${uid}.json`, {
        method: "PUT",
        body: JSON.stringify(snap)
      });
      if (!r.ok) console.warn("[auth] leaderboard PUT failed", r.status);
    } catch (e) {
      console.warn("[auth] leaderboard PUT error", e);
    }
  }

  function publishLeaderboard(extra){
    if (!state.user || !state.userClass) return;
    const snap = _buildSnapshot();
    if (extra && typeof extra === 'object') Object.assign(snap, extra);
    lbPending = snap;
    const since = Date.now() - lbLastWriteTs;
    const wait = since >= 1000 ? 0 : (1000 - since);
    if (lbTimer) return;
    lbTimer = setTimeout(_flushLeaderboard, wait);
  }

  // Auto-publish on local progress writes (xp/exam/unit), throttled.
  function _onProgressWrite(ev){
    const d = ev && ev.detail; if (!d || !d.key) return;
    if (!/xp|attempt|exam|unit/i.test(d.key)) return;
    publishLeaderboard();
  }

  // ---- Share helper -------------------------------------------------------
  // Uses Web Share API where available, otherwise copies to clipboard.
  async function shareApp(){
    const uid = (state.user && state.user.uid) || 'guest';
    const url = `https://yairgbrous.github.io/melakhim-bagrut/?ref=${encodeURIComponent(uid)}#/home`;
    const data = { title: 'אתר בגרות מלכים 2551', text: 'תלמדו איתי!', url };
    try {
      if (navigator.share){
        await navigator.share(data);
        return 'shared';
      }
    } catch (e) {
      // user cancelled — silent
      if (e && e.name === 'AbortError') return 'cancelled';
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText){
        await navigator.clipboard.writeText(url);
        if (typeof window !== 'undefined' && typeof window.showToast === 'function'){
          window.showToast('🔗 הקישור הועתק', 'success');
        }
        return 'copied';
      }
    } catch (e) { /* fall through */ }
    try { window.prompt('העתק את הקישור:', url); } catch {}
    return 'prompt';
  }

  // ---- Public read of leaderboard (no auth required) ---------------------
  async function getLeaderboard(classId){
    if (!dbBase() || !classId) return null;
    const cls = encodeURIComponent(classId);
    try {
      const r = await fetch(`${dbBase()}/leaderboard/${cls}.json`);
      if (!r.ok) return null;
      return await r.json();
    } catch { return null; }
  }

  async function getAllLeaderboard(){
    if (!dbBase()) return null;
    try {
      const r = await fetch(`${dbBase()}/leaderboard.json`);
      if (!r.ok) return null;
      return await r.json();
    } catch { return null; }
  }

  async function init(){
    if (typeof window === "undefined") return;
    if (!window.MELAKHIM_AUTH_ENABLED) { setStatus("disabled"); return; }
    const cfg = readConfig();
    if (!cfg) { setStatus("no-config"); return; }
    state.config = cfg;
    setStatus("loading");
    try {
      await initFirebase(cfg);
      // onAuthStateChanged will transition to "ready" or "signed-in".
    } catch (e) {
      console.warn("[auth] init failed", e);
      setStatus("error", { error: (e && e.message) || String(e) });
    }
  }

  async function signIn(){
    try {
      if (!window.firebase || !window.firebase.auth) throw new Error("auth not initialized");
      const provider = new window.firebase.auth.GoogleAuthProvider();
      await window.firebase.auth().signInWithPopup(provider);
      // onAuthStateChanged updates the state.
    } catch (e) {
      console.warn("[auth] signIn failed", e);
      setStatus("error", { error: (e && e.message) || String(e) });
    }
  }

  async function signOut(){
    try {
      if (window.firebase && window.firebase.auth) await window.firebase.auth().signOut();
    } catch (e) { console.warn("[auth] signOut failed", e); }
  }

  const MelakhimAuth = {
    init,
    signIn,
    signOut,
    subscribe: (fn) => { state.listeners.add(fn); fn({...state}); return () => state.listeners.delete(fn); },
    getState: () => ({...state}),
    // class selection
    classes: CLASSES,
    classOptions: CLASS_OPTIONS,
    setUserClass,
    openClassPicker,
    closeClassPicker,
    // leaderboard
    publishLeaderboard,
    getLeaderboard,
    getAllLeaderboard,
    getDbBase: dbBase,
    // share
    shareApp
  };

  function AuthButton(){
    const [s, setS] = useState(() => ({...state}));
    useEffect(() => MelakhimAuth.subscribe(setS), []);

    if (s.status === "disabled") return null;

    const label = s.status === "no-config"  ? "🔒 הזנת הגדרות Firebase נדרשת"
                : s.status === "loading"    ? "טוען..."
                : s.status === "error"      ? "⚠ שגיאת התחברות"
                : s.status === "signed-in"  ? `👋 ${s.userClass ? s.userClass + ' · ' : ''}${(s.user && (s.user.displayName||s.user.email))||"מחובר"}`
                : "🔑 התחבר";

    const disabled = s.status === "no-config" || s.status === "loading";

    const onClick = () => {
      if (disabled) return;
      if (s.status === "signed-in") MelakhimAuth.signOut();
      else MelakhimAuth.signIn();
    };

    return (
      <>
        <button
          onClick={onClick}
          disabled={disabled}
          title={s.error || label}
          className={`text-xs px-2 py-1 rounded-lg border transition ${disabled?"bg-slate-800 border-slate-700 text-on-parchment-meta cursor-not-allowed":"bg-amber-900/40 border-amber-500/40 text-on-parchment hover:bg-amber-800/60"}`}
        >
          {label}
        </button>
        <ClassPickerModal s={s}/>
      </>
    );
  }

  function ClassPickerModal({ s }){
    const [busy, setBusy] = useState(false);
    if (!s || s.status !== "signed-in") return null;
    if (!s.classModalOpen) return null;
    const pick = async (cls) => {
      if (busy) return;
      setBusy(true);
      const ok = await MelakhimAuth.setUserClass(cls);
      setBusy(false);
      if (!ok && typeof window !== "undefined" && typeof window.showToast === "function"){
        window.showToast('שמירת הכיתה נכשלה — נסה שוב', 'error');
      }
    };
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mb-class-picker-title"
        className="mb-class-picker-backdrop"
        style={{
          position:'fixed', inset:0, background:'rgba(10,8,4,.78)',
          display:'flex', alignItems:'center', justifyContent:'center',
          zIndex:9999, padding:'16px', direction:'rtl'
        }}
      >
        <div
          className="parchment"
          style={{
            maxWidth:420, width:'100%', borderRadius:18, padding:'22px 22px 18px',
            border:'2px solid #D4A574',
            boxShadow:'0 18px 60px rgba(0,0,0,.55)'
          }}
        >
          <h2
            id="mb-class-picker-title"
            className="font-display"
            style={{margin:0, color:'#1A1611', fontSize:22, fontWeight:900, textAlign:'center'}}
          >
            בחר את הכיתה שלך
          </h2>
          <p style={{margin:'6px 0 14px', textAlign:'center', fontSize:13, color:'#4A3829'}}>
            הבחירה ננעלת לאחר שמירה. שינוי דרך מורה/אדמין בלבד.
          </p>
          <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:10}}>
            {CLASS_OPTIONS.map(c => (
              <button
                key={c}
                type="button"
                disabled={busy}
                onClick={()=>pick(c)}
                aria-label={'בחר ' + c}
                style={{
                  padding:'14px 10px', borderRadius:14, fontSize:18, fontWeight:900,
                  border:'1.5px solid #8B6F1F', background:'rgba(247,241,225,.65)',
                  color:'#1A1611', cursor: busy ? 'wait' : 'pointer',
                  transition:'all .18s'
                }}
              >
                {c}
              </button>
            ))}
          </div>
          <div style={{textAlign:'center', marginTop:14}}>
            <button
              type="button"
              onClick={()=>MelakhimAuth.closeClassPicker()}
              disabled={busy}
              style={{
                fontSize:12, color:'#6B5639', background:'transparent',
                border:'none', cursor:'pointer', textDecoration:'underline'
              }}
            >
              דלג כעת
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (typeof window !== "undefined") {
    window.MelakhimAuth = MelakhimAuth;
    window.AuthButtonComponent = AuthButton;
    window.ClassPickerModalComponent = ClassPickerModal;
    // auto-init on script load; index.html can re-init after flipping the flag.
    try { init(); } catch (e) { console.warn("[auth] init failed", e); }
  }
})();
