/* =========================================================================
   PlacePage — /place/:id
   Reads window.PLACES_DATA (array of {id, name, name_niqqud, type,
   required_for_exam, significance, related_events[], related_characters[],
   map_numbers[]}). Chips navigate: related_events → /event/:id,
   related_characters → /character/:id, map_numbers → /maps#N.
   "📍 מצא במפה" routes to /maps with the first map_number as hash.
   Exposes: window.PlacePage
   ========================================================================= */
(function(){
  function Chip({ label, onClick, color }){
    const styles = {
      event:     "bg-red-500/20 border-red-500/40 text-red-100",
      character: "bg-orange-500/20 border-orange-500/40 text-orange-100",
      map:       "bg-emerald-500/20 border-emerald-500/40 text-emerald-100"
    };
    const cls = styles[color] || "bg-amber-500/20 border-amber-500/40 text-amber-100";
    return (
      <button onClick={onClick}
        className={`px-2.5 py-1 rounded-full text-xs font-bold border transition hover:scale-105 ${cls}`}>
        {label}
      </button>
    );
  }

  function PlacePage(props){
    const id = props && props.id;
    const setRoute = props && props.setRoute;
    const pl = (window.PLACES_DATA || []).find(x => x.id === id) || { name_niqqud: id };
    const hasData = !!(pl && (pl.significance || pl.related_events || pl.related_characters || pl.map_numbers));

    const go = (page, extra) => setRoute && setRoute({ page, ...(extra||{}) });

    const primaryMapNum = Array.isArray(pl.map_numbers) && pl.map_numbers.length > 0 ? pl.map_numbers[0] : null;

    const onFindOnMap = () => {
      if (primaryMapNum != null) go("maps", { hash: String(primaryMapNum) });
      else go("maps");
    };

    return (
      <div className="max-w-2xl mx-auto space-y-4 p-2">
        <button onClick={()=>go("study")} className="text-amber-300 text-sm">→ חזרה לאזור הלימוד</button>

        <header className="card rounded-2xl p-5">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-amber-300 hebrew">
            📍 {pl.name_niqqud || pl.name || id}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
            {pl.type && <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-emerald-100 font-bold">{pl.type}</span>}
            {pl.required_for_exam && (
              <span className="px-2 py-0.5 rounded-full bg-red-700 text-red-100 font-bold">⭐ נדרש למבחן</span>
            )}
            {pl.unit && <span className="text-amber-200/70">יחידה {pl.unit}</span>}
          </div>
        </header>

        {!hasData && (
          <div className="card rounded-xl p-4 text-amber-100/70 text-sm">
            יוצג בקרוב · נתוני המקום טרם הוזנו ל-<code>window.PLACES_DATA</code>.
          </div>
        )}

        {pl.significance && (
          <section className="parchment rounded-2xl p-5">
            <h2 className="font-display text-base font-bold text-amber-900 mb-2">משמעות</h2>
            <p className="hebrew text-amber-950 leading-relaxed">{pl.significance}</p>
          </section>
        )}

        {Array.isArray(pl.related_events) && pl.related_events.length > 0 && (
          <section>
            <h3 className="text-xs font-bold text-amber-200 mb-2">⚔️ אירועים קשורים</h3>
            <div className="flex flex-wrap gap-1.5">
              {pl.related_events.map(e => {
                const eid = typeof e === "string" ? e : e.id;
                const label = typeof e === "string" ? e : (e.title || e.label || e.id);
                return <Chip key={eid} color="event" label={label} onClick={()=>go("event", {id: eid})}/>;
              })}
            </div>
          </section>
        )}

        {Array.isArray(pl.related_characters) && pl.related_characters.length > 0 && (
          <section>
            <h3 className="text-xs font-bold text-amber-200 mb-2">👤 דמויות קשורות</h3>
            <div className="flex flex-wrap gap-1.5">
              {pl.related_characters.map(c => {
                const cid = typeof c === "string" ? c : c.id;
                const label = typeof c === "string" ? c : (c.name || c.label || c.id);
                return <Chip key={cid} color="character" label={label} onClick={()=>go("character", {id: cid})}/>;
              })}
            </div>
          </section>
        )}

        {Array.isArray(pl.map_numbers) && pl.map_numbers.length > 0 && (
          <section>
            <h3 className="text-xs font-bold text-amber-200 mb-2">🗺 סימון במפה</h3>
            <div className="flex flex-wrap gap-1.5">
              {pl.map_numbers.map(n => (
                <Chip key={n} color="map" label={`#${n}`} onClick={()=>go("maps", {hash: String(n)})}/>
              ))}
            </div>
          </section>
        )}

        <button onClick={onFindOnMap} className="gold-btn w-full py-3 rounded-xl text-base font-bold">
          📍 מצא במפה{primaryMapNum!=null ? ` (#${primaryMapNum})` : ""}
        </button>
      </div>
    );
  }

  if (typeof window !== "undefined") window.PlacePage = PlacePage;
})();
