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
    window.firebase.auth().onAuthStateChanged(user => {
      if (user) setStatus("signed-in", { user, error: null });
      else      setStatus("ready",     { user: null });
    });
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
