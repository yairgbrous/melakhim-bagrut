/* =========================================================================
   KingsTable — kings register sourced from window.KINGS_DATA
   ---------------------------------------------------------------------------
   Step (a): data wiring + loading state + ErrorBoundary wrap.

   Reads window.KINGS_DATA (40+ kings from data/kings.js). If the global is
   not yet populated, listens for `entity-index-ready` + polls briefly with a
   useEffect fallback. Falls back to an error message after 6s. The default
   export is wrapped in window.ErrorBoundaryComponent at render time.

   Exposes: window.KingsTableComponent
   ========================================================================= */
(function(){
  const { useState, useEffect, useMemo } = React;

  function injectStyles(){
    if (typeof document === 'undefined') return;
    if (document.getElementById('kt2-styles')) return;
    const s = document.createElement('style');
    s.id = 'kt2-styles';
    s.textContent = `
      .kt2-wrap{direction:rtl;display:flex;flex-direction:column;gap:14px;padding:8px}
      .kt2-title{font-family:'Frank Ruhl Libre',serif;font-size:24px;font-weight:900;color:#F4D58D}
      html[data-theme='light'] .kt2-title{color:#5A4517}
      .kt2-sub{font-size:13px;opacity:.78}
      .kt2-loading,.kt2-error,.kt2-empty{padding:40px 18px;text-align:center;
        border-radius:14px;border:1px solid rgba(212,165,116,.3);
        background:rgba(10,22,40,.45);color:#F5D670;font-weight:600}
      html[data-theme='light'] .kt2-loading,html[data-theme='light'] .kt2-error,html[data-theme='light'] .kt2-empty{background:rgba(247,241,225,.55);color:#5A4517}
      .kt2-loading-dot{display:inline-block;width:10px;height:10px;border-radius:50%;
        background:#F4D58D;margin:0 3px;animation:kt2pulse 1.2s infinite ease-in-out}
      .kt2-loading-dot:nth-child(2){animation-delay:.2s}
      .kt2-loading-dot:nth-child(3){animation-delay:.4s}
      @keyframes kt2pulse{0%,100%{opacity:.3;transform:scale(.85)}50%{opacity:1;transform:scale(1.1)}}
      .kt2-list{display:flex;flex-direction:column;gap:6px;margin-top:8px}
      .kt2-row{padding:8px 12px;border-radius:10px;background:rgba(10,22,40,.55);
        border:1px solid rgba(212,165,116,.25);direction:rtl;display:flex;justify-content:space-between;gap:12px}
      html[data-theme='light'] .kt2-row{background:rgba(247,241,225,.7)}
      .kt2-row-name{font-family:'Frank Ruhl Libre',serif;font-weight:800;font-size:18px}
      .kt2-row-meta{font-size:12px;opacity:.78;direction:ltr}
    `;
    document.head.appendChild(s);
  }

  function KingsTableInner(){
    useEffect(injectStyles, []);

    const [loading, setLoading] = useState(!Array.isArray(window.KINGS_DATA) || window.KINGS_DATA.length === 0);
    const [kings,   setKings]   = useState(Array.isArray(window.KINGS_DATA) ? window.KINGS_DATA : []);
    const [error,   setError]   = useState(null);

    useEffect(() => {
      if (!loading) return;
      let cancelled = false;
      const tryLoad = () => {
        const data = window.KINGS_DATA;
        if (Array.isArray(data) && data.length > 0 && !cancelled){
          setKings(data); setLoading(false);
          return true;
        }
        return false;
      };
      if (tryLoad()) return;
      const onReady = () => tryLoad();
      window.addEventListener('entity-index-ready', onReady);
      const tick = setInterval(() => { if (tryLoad()) clearInterval(tick); }, 200);
      const bail = setTimeout(() => {
        if (!tryLoad() && !cancelled){
          setError('כשל בטעינת נתוני המלכים. רענן את העמוד או נסה שוב.');
          setLoading(false);
        }
        clearInterval(tick);
      }, 6000);
      return () => {
        cancelled = true;
        window.removeEventListener('entity-index-ready', onReady);
        clearInterval(tick);
        clearTimeout(bail);
      };
    }, [loading]);

    if (loading) {
      return (
        <div className="kt2-wrap">
          <div className="kt2-loading">
            <div style={{fontSize:48,marginBottom:8}}>📜</div>
            <div>טוען טבלת מלכים…</div>
            <div style={{marginTop:10}}>
              <span className="kt2-loading-dot"/><span className="kt2-loading-dot"/><span className="kt2-loading-dot"/>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="kt2-wrap">
          <div className="kt2-error">
            <div style={{fontSize:48,marginBottom:8}}>⚠️</div>
            <div>{error}</div>
          </div>
        </div>
      );
    }

    if (!kings.length) {
      return (
        <div className="kt2-wrap">
          <div className="kt2-empty">
            <div style={{fontSize:48,marginBottom:8}}>📜</div>
            <div>לא נמצאו מלכים. בדוק את data/kings.js.</div>
          </div>
        </div>
      );
    }

    return (
      <div className="kt2-wrap">
        <div>
          <h1 className="kt2-title">📜 ציר המלכים</h1>
          <p className="kt2-sub">{kings.length} מלכים נטענו מ־data/kings.js</p>
        </div>
        <div className="kt2-list">
          {kings.map(k => (
            <div key={k.id} className="kt2-row">
              <span className="kt2-row-name hebrew">{k.name_niqqud || k.id}</span>
              <span className="kt2-row-meta">{k.kingdom} · {k.reign_start_bce}–{k.reign_end_bce}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function KingsTable(props){
    const EB = (typeof window !== 'undefined') && window.ErrorBoundaryComponent;
    const inner = React.createElement(KingsTableInner, props);
    return EB ? React.createElement(EB, {}, inner) : inner;
  }

  window.KingsTableComponent = KingsTable;
})();
