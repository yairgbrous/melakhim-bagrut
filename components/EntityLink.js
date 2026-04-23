/* =========================================================================
   EntityLink — reusable chip component that resolves an entity id+type to
   a clickable navigation chip. Single source of truth for cross-entity
   connectivity across CharacterPage / EventPage / PlacePage / KingProfile.

   Usage:
     <window.EntityLinkComponent type="character" id="achiya_hashiloni"/>
     <window.EntityLinkComponent type="place"  id="har_carmel" label="הר הכרמל"/>
     <window.EntityLinkComponent type="event"  id="kriat_yam_suf" setRoute={setRoute}/>

   Types and their destinations:
     character → {page:"character", id}
     king      → {page:"character", id}   (kings render via CharacterPage)
     place     → {page:"place",     id}
     event     → {page:"event",     id}
     breadth   → {page:"themes",    hash:id}
     recurringItem, recurring → {page:"themes", hash:"recurring-"+id}

   If id is not in window.__ENTITY_INDEX__[type], the chip still renders but
   with a "(אין דף עדיין)" tooltip and suppressed click. Never throws.

   Exposes: window.EntityLinkComponent
   ========================================================================= */
(function(){
  const { useCallback } = React;

  // Color/tone per type — consistent across pages.
  const TONE = {
    character:     { bg:"bg-orange-500/20",  bd:"border-orange-500/40",  fg:"text-orange-100"  },
    king:          { bg:"bg-amber-500/20",   bd:"border-amber-500/40",   fg:"text-amber-100"   },
    place:         { bg:"bg-emerald-500/20", bd:"border-emerald-500/40", fg:"text-emerald-100" },
    event:         { bg:"bg-red-500/20",     bd:"border-red-500/40",     fg:"text-red-100"     },
    breadth:       { bg:"bg-purple-500/20",  bd:"border-purple-500/40",  fg:"text-purple-100"  },
    recurringItem: { bg:"bg-pink-500/20",    bd:"border-pink-500/40",    fg:"text-pink-100"    },
    recurring:     { bg:"bg-pink-500/20",    bd:"border-pink-500/40",    fg:"text-pink-100"    }
  };

  function routeFor(type, id){
    if (type === "character" || type === "king")  return { page: "character", id };
    if (type === "place")                          return { page: "place",     id };
    if (type === "event")                          return { page: "event",     id };
    if (type === "breadth")                        return { page: "themes",    hash: id };
    if (type === "recurringItem" || type === "recurring") {
      return { page: "themes", hash: "recurring-" + id };
    }
    return null;
  }

  function resolve(type, id){
    if (!id) return null;
    const idx = (typeof window !== "undefined" && window.__ENTITY_INDEX__) || {};
    const bucket = idx[type] || (type === "king" ? idx.king || idx.character : null);
    if (!bucket) return null;
    return bucket[id] || null;
  }

  function go(setRoute, r){
    if (typeof setRoute === "function") { setRoute(r); return; }
    // Fallback: dispatch a custom event so index.html App can pick up.
    try { window.dispatchEvent(new CustomEvent("mb-entity-navigate", { detail: r })); } catch {}
  }

  function EntityLink(props){
    const type  = props.type  || "character";
    const id    = props.id;
    const label = props.label || null;
    const setRoute = props.setRoute;

    const entry   = resolve(type, id);
    const exists  = !!entry;
    const display = label || (entry && (entry.heading || entry.name_niqqud || entry.name || entry.title)) || id || "—";
    const title   = exists ? (entry.summary || display) : "(אין דף עדיין)";

    const tone = TONE[type] || TONE.character;

    const onClick = useCallback((e) => {
      if (!exists) { e.preventDefault(); return; }
      const r = routeFor(type, id);
      if (!r) return;
      go(setRoute, r);
    }, [exists, type, id, setRoute]);

    const base = `inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition mr-1 mb-1`;
    const live = `${tone.bg} ${tone.bd} ${tone.fg} hover:scale-105 cursor-pointer`;
    const dead = `bg-slate-700/40 border-slate-600/40 text-slate-300 cursor-not-allowed opacity-70`;

    return (
      <button type="button"
        onClick={onClick}
        disabled={!exists}
        title={title}
        aria-label={display + (exists ? "" : " — " + title)}
        data-entity-type={type}
        data-entity-id={id}
        className={`${base} ${exists ? live : dead}`}>
        <span>{display}</span>
        {!exists && <span aria-hidden="true" className="text-[10px]">·</span>}
      </button>
    );
  }

  // Helper: render a list of ids as EntityLinks, with a header.
  function EntityLinkList(props){
    const ids  = props.ids  || [];
    const type = props.type || "character";
    const setRoute = props.setRoute;
    if (!ids.length) return null;
    return (
      <div className="flex flex-wrap gap-0">
        {ids.map((raw, i) => {
          const id    = typeof raw === "string" ? raw : (raw && raw.id);
          const label = typeof raw === "string" ? null : (raw && (raw.label || raw.name));
          if (!id) return null;
          return <EntityLink key={i + ":" + id} type={type} id={id} label={label} setRoute={setRoute}/>;
        })}
      </div>
    );
  }

  if (typeof window !== "undefined") {
    window.EntityLinkComponent     = EntityLink;
    window.EntityLinkListComponent = EntityLinkList;
  }
})();
