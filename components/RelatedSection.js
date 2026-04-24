/* =========================================================================
   RelatedSection — "קשור ל:" bottom-of-page connectivity block.

   Renders 8-15 EntityLink chips sampled across kings, characters,
   events, places, breadth topics, maps, and quotes for the given
   entity. Reads from window.getRelatedEntities() (provided by
   data/_entity-index.js), which returns the uniform related_* shape.

   Usage:
     <window.RelatedSectionComponent type="event" id="mishpat-shlomo" setRoute={setRoute}/>

   Exposes: window.RelatedSectionComponent
   ========================================================================= */
(function(){
  const MIN_CHIPS = 8;
  const MAX_CHIPS = 15;

  // Round-robin sample so every type present gets some representation,
  // until we've hit MAX_CHIPS.
  function sampleAcross(groups, max){
    const out  = [];
    const pos  = groups.map(() => 0);
    let active = groups.filter(g => g.ids && g.ids.length).length;
    if (!active) return out;
    while (out.length < max && active > 0) {
      active = 0;
      for (let gi = 0; gi < groups.length; gi++) {
        const g = groups[gi];
        if (!g.ids || pos[gi] >= g.ids.length) continue;
        out.push({ type: g.type, id: g.ids[pos[gi]] });
        pos[gi]++;
        if (pos[gi] < g.ids.length) active++;
        if (out.length >= max) return out;
      }
    }
    return out;
  }

  function MapChip({ n, setRoute }){
    return (
      <button type="button"
        onClick={() => setRoute && setRoute({ page: "map", id: String(n) })}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border bg-sky-500/20 border-sky-500/40 text-sky-100 hover:scale-105 transition mr-1 mb-1"
        title={`מפה #${n}`}>
        🗺 מפה {n}
      </button>
    );
  }

  function RelatedSection({ type, id, setRoute }){
    const get = typeof window !== "undefined" ? window.getRelatedEntities : null;
    const rel = (get && type && id) ? get(type, id) : null;
    if (!rel) return null;

    // Don't re-suggest the entity itself.
    const drop = (ids) => (ids || []).filter(x => x !== id);

    const groups = [
      { type: "king",      ids: drop(rel.kings) },
      { type: "character", ids: drop(rel.characters) },
      { type: "event",     ids: drop(rel.events) },
      { type: "place",     ids: drop(rel.places) },
      { type: "breadth",   ids: drop(rel.breadth_topics) },
      { type: "quote",     ids: drop(rel.quotes) }
    ];
    const picked = sampleAcross(groups, MAX_CHIPS);
    const maps   = (rel.maps || []).slice(0, Math.max(0, MIN_CHIPS - picked.length));

    if (picked.length === 0 && maps.length === 0) return null;

    const EL = window.EntityLinkComponent;

    return (
      <section className="card rounded-2xl p-4 mt-4">
        <h3 className="font-display text-base font-bold text-on-parchment mb-2">🔗 קשור ל:</h3>
        <div className="flex flex-wrap gap-0">
          {EL && picked.map((c, i) => (
            <EL key={c.type + ":" + c.id + ":" + i} type={c.type} id={c.id} setRoute={setRoute}/>
          ))}
          {maps.map(n => <MapChip key={"map:" + n} n={n} setRoute={setRoute}/>)}
        </div>
      </section>
    );
  }

  if (typeof window !== "undefined") {
    window.RelatedSectionComponent = RelatedSection;
  }
})();
