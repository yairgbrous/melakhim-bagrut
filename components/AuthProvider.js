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
    error: null
  };

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
        setStatus("signed-in", { user, error: null });
        try { await pullAndMerge(user); } catch (e) { console.warn("[auth] pull+merge failed", e); }
        startSyncLoop();
      } else {
        stopSyncLoop();
        setStatus("ready", { user: null });
      }
    });
  }

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
  }

  function stopSyncLoop(){
    if (writeListener) window.removeEventListener("mb-local-write", writeListener);
    writeListener = null;
    if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
    syncBuffer = {};
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
    getState: () => ({...state})
  };

  function AuthButton(){
    const [s, setS] = useState(() => ({...state}));
    useEffect(() => MelakhimAuth.subscribe(setS), []);

    if (s.status === "disabled") return null;

    const label = s.status === "no-config"  ? "🔒 הזנת הגדרות Firebase נדרשת"
                : s.status === "loading"    ? "טוען..."
                : s.status === "error"      ? "⚠ שגיאת התחברות"
                : s.status === "signed-in"  ? `👋 ${(s.user && (s.user.displayName||s.user.email))||"מחובר"}`
                : "🔑 התחבר";

    const disabled = s.status === "no-config" || s.status === "loading";

    const onClick = () => {
      if (disabled) return;
      if (s.status === "signed-in") MelakhimAuth.signOut();
      else MelakhimAuth.signIn();
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        title={s.error || label}
        className={`text-xs px-2 py-1 rounded-lg border transition ${disabled?"bg-slate-800 border-slate-700 text-amber-100/50 cursor-not-allowed":"bg-amber-900/40 border-amber-500/40 text-amber-200 hover:bg-amber-800/60"}`}
      >
        {label}
      </button>
    );
  }

  if (typeof window !== "undefined") {
    window.MelakhimAuth = MelakhimAuth;
    window.AuthButtonComponent = AuthButton;
    // auto-init on script load; index.html can re-init after flipping the flag.
    try { init(); } catch (e) { console.warn("[auth] init failed", e); }
  }
})();
