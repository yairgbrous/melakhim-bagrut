/* =========================================================================
   PlacePage — /place/:id
   Reads window.PLACES_DATA (array of {id, name, name_niqqud, type,
   required_for_exam, significance, related_events[], related_characters[],
   map_numbers[]}).

   Entity chips are rendered through window.EntityLinkComponent:
     related_events[]      → type="event"
     related_characters[]  → type="character"

   map_numbers[] are not entity ids (they are pin indices on MapsPage), so
   they use a small local MapPinChip that navigates to /maps with the pin
   number as hash. EntityLinkComponent is not touched to add a "map" type.

   "📍 מצא במפה" routes to /maps with the first map_number as hash.
   Exposes: window.PlacePage
   ========================================================================= */
(function(){
  function MapPinChip({ n, onClick }){
    return (
      <button onClick={onClick}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border bg-emerald-500/20 border-emerald-500/40 text-emerald-100 transition hover:scale-105 mr-1 mb-1"
        title={`סימון מפה #${n}`}>
        <span>#{n}</span>
      </button>
    );
  }

  function EntityList({ items, type, setRoute }){
    if (!Array.isArray(items) || items.length === 0) return null;
    const EL = (typeof window !== "undefined" && window.EntityLinkComponent) || null;
    return (
      <div className="flex flex-wrap gap-0">
        {items.map((raw, i) => {
          const id    = typeof raw === "string" ? raw : (raw && raw.id);
          const label = typeof raw === "string"
            ? null
            : (raw && (raw.name_niqqud || raw.name || raw.label || raw.title)) || null;
          if (!id) return null;
          if (!EL) {
            return <span key={i+":"+id} className="px-2 py-0.5 mr-1 mb-1 text-xs text-on-parchment-muted">{label || id}</span>;
          }
          return <EL key={i+":"+id} type={type} id={id} label={label} setRoute={setRoute}/>;
        })}
      </div>
    );
  }

  function Section({ title, children }){
    return (
      <section>
        <h3 className="text-xs font-bold text-on-parchment mb-2">{title}</h3>
        {children}
      </section>
    );
  }

  function PlacePage(props){
    const id = props && props.id;
    const setRoute = props && props.setRoute;
    const pl = (window.PLACES_DATA || []).find(x => x.id === id) || null;
    const hasData = !!pl;

    const go = (page, extra) => setRoute && setRoute({ page, ...(extra||{}) });

    const primaryMapNum = (pl && Array.isArray(pl.map_numbers) && pl.map_numbers.length > 0) ? pl.map_numbers[0] : null;

    const onFindOnMap = () => {
      if (primaryMapNum != null) go("maps", { hash: String(primaryMapNum) });
      else go("maps");
    };

    const headingLabel = (pl && (pl.name_niqqud || pl.name)) || id || "מקום";
    const bookRefs = (pl && Array.isArray(pl.book_refs)) ? pl.book_refs : [];

    return (
      <div className="max-w-2xl mx-auto space-y-4 p-2">
        <button onClick={()=>go("study")} className="text-on-parchment-accent text-sm">→ חזרה לאזור הלימוד</button>

        <header className="card rounded-2xl p-5">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-on-parchment-accent hebrew">
            📍 {headingLabel}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
            {pl && pl.type && <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-emerald-100 font-bold">{pl.type}</span>}
            {pl && pl.required_for_exam && (
              <span className="px-2 py-0.5 rounded-full bg-red-700 text-red-100 font-bold">⭐ נדרש למבחן</span>
            )}
            {pl && pl.kingdom && <span className="text-on-parchment">ממלכה: {pl.kingdom}</span>}
            {pl && pl.region && <span className="text-on-parchment-muted">אזור: {pl.region}</span>}
            {pl && pl.unit && <span className="text-on-parchment">יחידה {pl.unit}</span>}
          </div>
        </header>

        {!hasData && (
          <div className="card rounded-xl p-4 text-on-parchment-muted text-sm">
            יוצג בקרוב · המקום <code>{id}</code> טרם הוזן ל-<code>window.PLACES_DATA</code>.
          </div>
        )}

        {pl && pl.significance && (
          <section className="parchment rounded-2xl p-5">
            <h2 className="font-display text-base font-bold text-amber-900 mb-2">משמעות</h2>
            <p className="hebrew text-amber-950 leading-relaxed">{pl.significance}</p>
          </section>
        )}

        {pl && Array.isArray(pl.related_events) && pl.related_events.length > 0 && (
          <Section title="⚔️ אירועים קשורים">
            <EntityList items={pl.related_events} type="event" setRoute={setRoute}/>
          </Section>
        )}

        {pl && Array.isArray(pl.related_characters) && pl.related_characters.length > 0 && (
          <Section title="👤 דמויות קשורות">
            <EntityList items={pl.related_characters} type="character" setRoute={setRoute}/>
          </Section>
        )}

        {pl && Array.isArray(pl.recurring_items) && pl.recurring_items.length > 0 && (
          <Section title="🔁 פריטים חוזרים">
            <EntityList items={pl.recurring_items} type="recurring" setRoute={setRoute}/>
          </Section>
        )}

        {pl && Array.isArray(pl.map_numbers) && pl.map_numbers.length > 0 && (
          <Section title="🗺 סימון במפה">
            <div className="flex flex-wrap gap-0">
              {pl.map_numbers.map(n => (
                <MapPinChip key={n} n={n} onClick={()=>go("maps", {hash: String(n)})}/>
              ))}
            </div>
          </Section>
        )}

        {bookRefs.length > 0 && (
          <section className="card rounded-xl p-4">
            <h3 className="text-xs font-bold text-on-parchment mb-2">📚 מקורות בספר מלכים</h3>
            <ul className="text-sm text-on-parchment-muted hebrew" style={{columnCount:2,columnGap:18,listStyle:'none',padding:0,margin:0}}>
              {bookRefs.map((r,i)=><li key={i} style={{breakInside:'avoid',marginBottom:4}}>• {r}</li>)}
            </ul>
          </section>
        )}

        {hasData && (
          <button onClick={onFindOnMap} className="gold-btn w-full py-3 rounded-xl text-base font-bold">
            📍 מצא במפה{primaryMapNum!=null ? ` (#${primaryMapNum})` : ""}
          </button>
        )}
      </div>
    );
  }

  if (typeof window !== "undefined") window.PlacePage = PlacePage;
})();
