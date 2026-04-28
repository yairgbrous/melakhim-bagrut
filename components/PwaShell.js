/* =========================================================================
   PwaShell — offline banner + install prompt card.
   Mounts once at app root (index.html). Does NOT touch Home.js.

   - Offline banner: listens to window "online"/"offline" + SW postMessage.
     Shows "מצב לא מקוון — תוכן זמין במטמון" when network is unavailable.
   - Install prompt: listens for "beforeinstallprompt" and, when localStorage
     mb.visits ≥ 3 and current hash route is #/ or #/home, shows a card with
     "התקן" + "אחר כך" buttons. Visit counter bumps once per sessionStorage
     session via localStorage "mb.visits".

   Exposes: window.PwaShellComponent
   ========================================================================= */
(function(){
  const { useState, useEffect } = React;

  const VISITS_KEY   = 'mb.visits';
  const DISMISS_KEY  = 'mb.installDismissed';
  const SESSION_KEY  = 'mb.visitCounted';

  function bumpVisits(){
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, '1');
      const n = parseInt(localStorage.getItem(VISITS_KEY) || '0', 10);
      localStorage.setItem(VISITS_KEY, String((isFinite(n) ? n : 0) + 1));
    } catch(e){}
  }

  function readVisits(){
    try { return parseInt(localStorage.getItem(VISITS_KEY) || '0', 10) || 0; }
    catch(e){ return 0; }
  }

  function isHomeRoute(){
    try {
      const h = (window.location.hash || '').replace(/^#\/?/, '').split('/')[0];
      return h === '' || h === 'home';
    } catch(e){ return true; }
  }

  function PwaShell(){
    const [offline, setOffline] = useState(() =>
      typeof navigator !== 'undefined' && navigator.onLine === false
    );
    const [deferred, setDeferred] = useState(null);
    const [showInstall, setShowInstall] = useState(false);

    useEffect(() => {
      bumpVisits();

      const onOnline  = () => setOffline(false);
      const onOffline = () => setOffline(true);
      window.addEventListener('online',  onOnline);
      window.addEventListener('offline', onOffline);

      const onSwMsg = (ev) => {
        if (!ev || !ev.data) return;
        if (ev.data.type === 'offline') setOffline(true);
        if (ev.data.type === 'online')  setOffline(false);
      };
      if (navigator.serviceWorker){
        navigator.serviceWorker.addEventListener('message', onSwMsg);
      }

      const onBip = (ev) => {
        ev.preventDefault();
        setDeferred(ev);
        const visits = readVisits();
        const dismissed = (() => { try { return !!localStorage.getItem(DISMISS_KEY); } catch(e){ return false; } })();
        if (visits >= 3 && !dismissed && isHomeRoute()){
          setShowInstall(true);
        }
      };
      window.addEventListener('beforeinstallprompt', onBip);

      const onHashChange = () => {
        if (deferred && !showInstall){
          const visits = readVisits();
          const dismissed = (() => { try { return !!localStorage.getItem(DISMISS_KEY); } catch(e){ return false; } })();
          if (visits >= 3 && !dismissed && isHomeRoute()){
            setShowInstall(true);
          } else if (!isHomeRoute()){
            setShowInstall(false);
          }
        }
      };
      window.addEventListener('hashchange', onHashChange);

      return () => {
        window.removeEventListener('online',  onOnline);
        window.removeEventListener('offline', onOffline);
        window.removeEventListener('beforeinstallprompt', onBip);
        window.removeEventListener('hashchange', onHashChange);
        if (navigator.serviceWorker){
          navigator.serviceWorker.removeEventListener('message', onSwMsg);
        }
      };
    }, [deferred, showInstall]);

    const install = async () => {
      if (!deferred) { setShowInstall(false); return; }
      try {
        deferred.prompt();
        await deferred.userChoice;
      } catch(e){}
      setDeferred(null);
      setShowInstall(false);
    };

    const dismissInstall = () => {
      try { localStorage.setItem(DISMISS_KEY, '1'); } catch(e){}
      setShowInstall(false);
    };

    return (
      <>
        <div
          className={'pwa-offline-banner' + (offline ? ' visible' : '')}
          role="status"
          aria-live="polite"
          aria-hidden={!offline}>
          📡 מצב לא מקוון — תוכן זמין במטמון
        </div>

        {showInstall && (
          <div className="pwa-install-card" role="dialog" aria-label="הצעה להתקנת האפליקציה">
            <div className="pwa-icon" aria-hidden="true">📲</div>
            <div className="pwa-body">
              <div className="pwa-title">התקן את מלכים בגרות</div>
              <div className="pwa-sub">הוסף למסך הבית לגישה מהירה ולשימוש במצב לא מקוון</div>
            </div>
            <div className="pwa-btns">
              <button type="button" onClick={install} className="pwa-btn">התקן</button>
              <button type="button" onClick={dismissInstall} className="pwa-btn pwa-btn-ghost">אחר כך</button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (typeof window !== 'undefined'){
    window.PwaShellComponent = PwaShell;
  }
})();
