/* =========================================================================
   NotFound — 404 page for unrecognised routes.
   Header "הפסוק לא נמצא" + search bar + quick links back to home.

   Routed from index.html when route.page does not match a known page slug.
   Exposes: window.NotFoundComponent
   ========================================================================= */
(function(){
  const { useState } = React;

  function NotFound({ setRoute, attemptedRoute }){
    const [q, setQ] = useState('');

    const go = (page, extra) => {
      if (typeof setRoute !== 'function') return;
      setRoute(Object.assign({ page }, extra || {}));
    };

    const openSearchWithQuery = (value) => {
      if (value != null && typeof window !== 'undefined' && window.__mbPendingSearch !== undefined){
        window.__mbPendingSearch = value;
      }
      if (typeof window !== 'undefined' && typeof window.openInstantSearch === 'function'){
        window.openInstantSearch();
      }
    };

    const onSubmit = (e) => {
      e.preventDefault();
      openSearchWithQuery(q.trim());
    };

    const suggestedRoute = typeof attemptedRoute === 'string' ? attemptedRoute : '';

    return (
      <div className="max-w-xl mx-auto p-3 space-y-4 text-center">
        <div className="parchment rounded-2xl p-6 md:p-8 space-y-4">
          <div className="text-6xl" aria-hidden="true">📜</div>
          <h1 className="font-display text-2xl md:text-3xl font-black text-on-parchment-accent hebrew">
            הפסוק לא נמצא
          </h1>
          <p className="text-on-parchment-muted hebrew text-sm">
            הדף שחיפשת לא קיים. {suggestedRoute ? ('הנתיב "' + suggestedRoute + '" לא זוהה.') : ''}
          </p>

          <form onSubmit={onSubmit} className="flex items-center gap-2">
            <input
              type="search"
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              placeholder="🔍 חפש דמות, מקום, אירוע…"
              className="flex-1 px-3 py-2.5 rounded-xl border border-amber-700/40 bg-white/60 text-amber-950 hebrew"
              aria-label="חיפוש בתוכן"
            />
            <button type="submit" className="gold-btn px-4 py-2.5 rounded-xl font-bold">חפש</button>
          </form>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={()=>go('home')} className="gold-btn py-3 rounded-xl font-bold">🏠 לעמוד הבית</button>
            <button onClick={()=>go('study')} className="card py-3 rounded-xl text-on-parchment font-bold">📚 מרכז הלמידה</button>
            <button onClick={()=>go('timeline')} className="card py-3 rounded-xl text-on-parchment font-bold">📜 ציר המלכים</button>
            <button onClick={()=>go('maps')} className="card py-3 rounded-xl text-on-parchment font-bold">🗺️ מפות</button>
          </div>
        </div>
      </div>
    );
  }

  if (typeof window !== 'undefined'){
    window.NotFoundComponent = NotFound;
  }
})();
