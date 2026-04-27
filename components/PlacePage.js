/* =========================================================================
   PlacePage — /place/:id · full-screen rich view
   ---------------------------------------------------------------------------
   STICKY HEADER · HERO · BODY (משמעות · קשרים · מפה · מקורות). Inline mini
   map card links to the full maps page. Uses window.EntityLinkComponent for
   all cross-links. Exposes: window.PlacePage
   ========================================================================= */
(function(){
  const { useMemo } = React;

  function slug(s){
    if (!s || typeof s !== "string") return "";
    return s.trim().toLowerCase().replace(/[\s_]+/g, "-").replace(/[^֐-׿a-z0-9-]/g, "");
  }

  function findMapForPlace(placeId){
    const maps = (typeof window !== "undefined" && Array.isArray(window.MAPS_19)) ? window.MAPS_19 : [];
    for (const m of maps) {
      const pins = Array.isArray(m.pins) ? m.pins : [];
      const pin  = pins.find(p => p && p.placeId === placeId);
      if (pin) return { map: m, pin };
    }
    return null;
  }

  function MiniMap({ placeId, onOpen }){
    const hit = findMapForPlace(placeId);
    if (!hit) return null;
    const { map, pin } = hit;
    const palette = (typeof window !== "undefined" && window.MAPS_UNIT_COLOR) || {};
    const color = palette[map.unit] || "#D4A574";
    return (
      <section className="card rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-display text-base font-bold text-on-parchment">🗺 במפה {map.number}</h3>
            <div className="text-xs text-on-parchment-muted">{map.title}</div>
          </div>
          <button onClick={onOpen} className="text-xs font-bold text-on-parchment-accent hover:underline">פתח מפה מלאה →</button>
        </div>
        <div style={{position:"relative", width:"100%", paddingTop:"60%", background:`linear-gradient(135deg, ${color}22, ${color}08)`, border:`1px solid ${color}55`, borderRadius:12, overflow:"hidden"}}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none"
               style={{position:"absolute", inset:0, width:"100%", height:"100%"}}>
            <path d="M 20 0 Q 30 30 22 60 T 35 100"
                  stroke={color} strokeOpacity="0.55" strokeWidth="0.6" fill="none" strokeDasharray="1.2 1.2"/>
            <path d="M 72 8 Q 70 35 75 60 T 78 95"
                  stroke={color} strokeOpacity="0.55" strokeWidth="0.6" fill="none" strokeDasharray="1.2 1.2"/>
          </svg>
          {(map.pins || []).map((p, i) => {
            const isSelf = p.placeId === placeId;
            return (
              <span key={i}
                style={{
                  position:"absolute",
                  left: p.x + "%", top: p.y + "%",
                  transform: "translate(-50%, -50%)",
                  background: isSelf ? color : "#fff",
                  color: isSelf ? "#fff" : color,
                  border: `2px solid ${color}`,
                  borderRadius: "50%",
                  width: isSelf ? 26 : 18, height: isSelf ? 26 : 18,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 900, fontSize: isSelf ? 12 : 10,
                  boxShadow: isSelf ? `0 0 0 4px ${color}33` : "none"
                }}
                title={p.place}>{p.n}</span>
            );
          })}
        </div>
      </section>
    );
  }

  function resolvePlace(id){
    if (!id) return null;
    const pool = window.PLACES_DATA || [];
    const direct = pool.find(x => x && x.id === id);
    if (direct) return direct;
    const aliases = (window.__ENTITY_ALIASES__ || {}).place || {};
    if (Object.prototype.hasOwnProperty.call(aliases, id)) {
      const aliased = aliases[id];
      if (aliased === null) return { id, __stub: true };
      const hit = pool.find(x => x && x.id === aliased);
      if (hit) return hit;
    }
    const swapped = id.indexOf("_")>=0 ? id.replace(/_/g,"-") : id.replace(/-/g,"_");
    const swap = pool.find(x => x && x.id === swapped);
    if (swap) return swap;
    return null;
  }

  function nearestPlaces(id){
    const pool = window.PLACES_DATA || [];
    if (!id || !pool.length) return pool.slice(0, 6);
    const s = slug(id);
    return pool
      .map(x => {
        const xs = slug(x.id || "");
        let score = 0;
        if (xs.startsWith(s) || s.startsWith(xs)) score += 50;
        if (xs.includes(s) || s.includes(xs)) score += 30;
        const common = [...new Set(s.split("-"))].filter(p=>p&&xs.includes(p)).length;
        score += common*10;
        return { x, score };
      })
      .sort((a,b)=>b.score-a.score).slice(0,6).map(o=>o.x);
  }

  function bookRefSlug(ref){
    if (!ref || typeof ref !== "string") return null;
    const r = ref.replace(/[״׳]/g,"").trim();
    const m = r.match(/^(?:מלכים|מל)\s*(א|ב)\s+([א-ת0-9א-ת]+)/);
    if (!m) return null;
    return `melachim-${m[1]}-${m[2]}`;
  }
  function BookRefLink({ ref }){
    const h = bookRefSlug(ref);
    if (!h) return <span>{ref}</span>;
    return <a href={`#/book/${h}`} className="text-on-parchment-accent underline hover:opacity-80" title={`פתח ${ref}`}>{ref}</a>;
  }

  function Chip({ type, id, label, setRoute }){
    const EL = window.EntityLinkComponent;
    if (!EL) return <span className="kt-chip">{label || id}</span>;
    return <EL type={type} id={id} label={label} setRoute={setRoute}/>;
  }
  function ChipList({ ids, type, setRoute }){
    if (!Array.isArray(ids) || !ids.length) return null;
    return (
      <div className="flex flex-wrap gap-0">
        {ids.map((raw,i)=>{
          const id = typeof raw==="string" ? raw : (raw && raw.id);
          if (!id) return null;
          const label = typeof raw==="object" ? (raw.label||raw.name||raw.name_niqqud) : null;
          return <Chip key={i+":"+id} type={type} id={id} label={label} setRoute={setRoute}/>;
        })}
      </div>
    );
  }

  // Up to 5 quotes whose context_event_id is one of the place's related_events.
  function quotesForPlace(pl){
    const events = (pl && Array.isArray(pl.related_events)) ? pl.related_events.map(e => typeof e==="string"?e:(e&&e.id)).filter(Boolean) : [];
    if (!events.length) return [];
    const pool = (window.QUOTES_DATA || []);
    const eventSet = new Set(events);
    return pool.filter(q => q && eventSet.has(q.context_event_id)).slice(0, 5);
  }

  function QuotesSection({ quotes, setRoute }){
    if (!Array.isArray(quotes) || !quotes.length) return null;
    return (
      <Section title="💬 ציטוטים חשובים">
        <div className="space-y-3">
          {quotes.map((q,i)=>(
            <blockquote key={q.id||i}
              className="hebrew text-on-parchment border-r-4 border-amber-500/50 pr-4 py-2 leading-relaxed"
              style={{background:"rgba(212,165,116,.08)", borderRadius:6, padding:"10px 14px"}}>
              <div className="text-base">{q.text_niqqud || q.text || ""}</div>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-on-parchment-muted">
                {q.speaker_id && <Chip type="character" id={q.speaker_id} setRoute={setRoute}/>}
                {q.addressee_id && (<><span aria-hidden="true">→</span><Chip type="character" id={q.addressee_id} setRoute={setRoute}/></>)}
                {q.context_event_id && <Chip type="event" id={q.context_event_id} setRoute={setRoute}/>}
                {q.book_ref && <span className="ml-auto"><BookRefLink ref={q.book_ref}/></span>}
              </div>
            </blockquote>
          ))}
        </div>
      </Section>
    );
  }

  function Section({ title, children, tone }){
    const cls = tone === "parchment" ? "parchment rounded-2xl p-5 md:p-6" : "card rounded-2xl p-4 md:p-5";
    return (
      <section className={cls}>
        {title && <h2 className="font-display text-base md:text-lg font-bold text-on-parchment-accent mb-3 hebrew">{title}</h2>}
        {children}
      </section>
    );
  }

  function StickyHeader({ crumb, setRoute }){
    const goBack = () => {
      try { if (window.history.length > 1) return window.history.back(); } catch {}
      if (setRoute) setRoute({ page: "home" });
    };
    return (
      <div className="sticky top-0 z-30 backdrop-blur bg-[var(--bg-surface,#0A1628)]/85 border-b border-amber-500/20 px-3 py-2 flex items-center justify-between">
        <nav className="text-xs md:text-sm hebrew text-on-parchment-muted truncate">
          <a href="#/home" className="hover:text-on-parchment-accent">ראשי</a>
          <span className="mx-2 opacity-60">›</span>
          <a href="#/maps" className="hover:text-on-parchment-accent">{crumb.section}</a>
          <span className="mx-2 opacity-60">›</span>
          <span className="text-on-parchment-accent font-bold">{crumb.leaf}</span>
        </nav>
        <button onClick={goBack}
          className="shrink-0 px-3 py-1.5 rounded-lg border border-amber-500/40 text-on-parchment-accent text-sm font-bold hover:bg-amber-500/10">
          ← חזור
        </button>
      </div>
    );
  }

  function Hero({ name, subtitle, breadthIds, setRoute }){
    return (
      <header className="px-4 md:px-6 pt-5 pb-4">
        <div className="text-xs text-on-parchment-muted mb-1">📍 מקום</div>
        <h1 className="font-display text-3xl md:text-5xl font-black text-on-parchment-accent hebrew leading-tight"
            style={{textShadow:"0 2px 8px rgba(200,155,60,.15)"}}>
          {name}
        </h1>
        {subtitle && <div className="text-sm md:text-base text-on-parchment mt-2 hebrew">{subtitle}</div>}
        {Array.isArray(breadthIds) && breadthIds.length>0 && (
          <div className="mt-3"><ChipList ids={breadthIds} type="breadth" setRoute={setRoute}/></div>
        )}
      </header>
    );
  }

  function MiniMap({ mapNumbers, name, setRoute }){
    if (!Array.isArray(mapNumbers) || !mapNumbers.length) return null;
    const primary = mapNumbers[0];
    const go = (n) => setRoute && setRoute({ page:"maps", hash:String(n) });
    return (
      <Section title="🗺 מפה">
        <div className="relative rounded-xl overflow-hidden border border-emerald-500/30"
             style={{background:"linear-gradient(135deg, rgba(16,73,54,.8), rgba(10,60,40,.95))"}}>
          <div className="aspect-[4/3] flex items-center justify-center relative">
            <div className="absolute inset-0 opacity-20"
                 style={{backgroundImage:"radial-gradient(circle at 30% 40%, #a3d9a5 0%, transparent 40%), radial-gradient(circle at 70% 60%, #6fbf6f 0%, transparent 35%)"}}/>
            <button onClick={()=>go(primary)}
              className="relative z-10 flex flex-col items-center gap-2 hover:scale-110 transition"
              title={`פתח את מפה #${primary} עם ${name}`}>
              <div className="text-5xl drop-shadow-lg animate-pulse">📍</div>
              <div className="text-emerald-100 text-sm font-bold bg-black/30 backdrop-blur px-3 py-1 rounded-full hebrew">
                {name}
              </div>
            </button>
          </div>
          <div className="bg-black/40 backdrop-blur px-3 py-2 flex items-center justify-between">
            <div className="text-xs text-emerald-100 hebrew">
              מופיע ב-{mapNumbers.length} {mapNumbers.length === 1 ? "מפה" : "מפות"}
            </div>
            <div className="flex flex-wrap gap-1">
              {mapNumbers.slice(0, 8).map(n => (
                <button key={n} onClick={()=>go(n)}
                  className="px-2 py-0.5 text-xs rounded bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-50 font-bold border border-emerald-500/40">
                  #{n}
                </button>
              ))}
              {mapNumbers.length > 8 && <span className="text-xs text-emerald-100/70 px-1">…</span>}
            </div>
          </div>
        </div>
      </Section>
    );
  }

  function NotFound({ id, setRoute }){
    const suggestions = useMemo(()=>nearestPlaces(id), [id]);
    return (
      <div className="min-h-screen flex flex-col">
        <StickyHeader crumb={{section:"מקומות", leaf:"לא נמצא"}} setRoute={setRoute}/>
        <div className="max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
          <div className="parchment rounded-2xl p-6 text-center">
            <div className="text-5xl mb-3">🔎</div>
            <h2 className="font-display text-xl text-amber-900 font-bold mb-2">מקום לא נמצא</h2>
            <div className="text-sm text-amber-800">מזהה שחיפשת: <code className="px-2 py-0.5 bg-black/5 rounded">{id||"—"}</code></div>
          </div>
          {suggestions.length>0 && (
            <Section title="💡 מקומות דומים">
              <ChipList ids={suggestions.map(s=>s.id)} type="place" setRoute={setRoute}/>
            </Section>
          )}
          <button onClick={()=>setRoute && setRoute({page:"home"})}
            className="w-full gold-btn py-3 rounded-xl font-bold">חזרה לדף הראשי</button>
        </div>
      </div>
    );
  }

  function PlacePage({ id, setRoute }){
    const pl = useMemo(()=>resolvePlace(id), [id]);
    if (!pl || pl.__stub) return <NotFound id={id} setRoute={setRoute}/>;

    const name = pl.name_niqqud || pl.name || pl.id;
    const subtitleBits = [
      pl.type,
      pl.region,
      pl.kingdom ? `ממלכה: ${pl.kingdom}` : null,
      pl.unit != null ? `יחידה ${pl.unit}` : null,
      pl.required_for_exam ? "⭐ נדרש למבחן" : null,
    ].filter(Boolean);

    const relatedEvents = pl.related_events || [];
    const relatedChars = pl.related_characters || [];
    const relatedRecurring = pl.recurring_items || pl.related_recurring_items || [];
    const relatedBreadth = pl.related_breadth || pl.themes || [];
    const bookRefs = pl.book_refs || [];
    const mapNumbers = pl.map_numbers || [];
    const quotes = useMemo(()=>quotesForPlace(pl), [pl.id]);

    const onPractice = () => {
      try { window.dispatchEvent(new CustomEvent("practice-entity", {detail:{type:"place", id:pl.id}})); } catch {}
      setRoute && setRoute({page:"quiz"});
    };

    return (
      <div className="min-h-screen flex flex-col">
        <StickyHeader crumb={{section:"מקומות", leaf:name}} setRoute={setRoute}/>
        <main className="max-w-3xl mx-auto w-full pb-24">
          <Hero name={name} subtitle={subtitleBits.join(" · ")} breadthIds={relatedBreadth} setRoute={setRoute}/>

          <div className="px-4 md:px-6 space-y-4">
            {pl.significance && (
              <Section title="✨ משמעות" tone="parchment">
                <p className="hebrew text-amber-950 leading-relaxed whitespace-pre-line">{pl.significance}</p>
              </Section>
            )}

            <QuotesSection quotes={quotes} setRoute={setRoute}/>

            <MiniMap mapNumbers={mapNumbers} name={name} setRoute={setRoute}/>

            {(relatedEvents.length>0 || relatedChars.length>0 || relatedRecurring.length>0) && (
              <Section title="🔗 קשרים">
                {relatedEvents.length>0 && (
                  <div className="mb-2">
                    <div className="text-xs text-on-parchment-muted mb-1">⚔️ אירועים קשורים</div>
                    <ChipList ids={relatedEvents} type="event" setRoute={setRoute}/>
                  </div>
                )}
                {relatedChars.length>0 && (
                  <div className="mb-2">
                    <div className="text-xs text-on-parchment-muted mb-1">👤 דמויות קשורות</div>
                    <ChipList ids={relatedChars} type="character" setRoute={setRoute}/>
                  </div>
                )}
                {relatedRecurring.length>0 && (
                  <div className="mb-2">
                    <div className="text-xs text-on-parchment-muted mb-1">🔁 פריטים חוזרים</div>
                    <ChipList ids={relatedRecurring} type="recurring" setRoute={setRoute}/>
                  </div>
                )}
              </Section>
            )}

            {bookRefs.length>0 && (
              <Section title="📚 מקורות בספר מלכים">
                <ul className="text-sm hebrew text-on-parchment-muted" style={{columnCount:2, columnGap:20, listStyle:"none", padding:0, margin:0}}>
                  {bookRefs.map((r,i)=><li key={i} style={{breakInside:"avoid", marginBottom:4}}>• <BookRefLink ref={r}/></li>)}
                </ul>
              </Section>
            )}

            <button onClick={onPractice}
              className="w-full gold-btn py-3 rounded-xl text-base font-bold mt-4">
              ⚔️ תרגל על מקום זה
            </button>
          </div>

          {window.RelatedSectionComponent && (
            <div className="px-4 md:px-6 mt-4">
              <window.RelatedSectionComponent type="place" id={pl.id} setRoute={setRoute}/>
            </div>
          )}
        </main>
      </div>
    );
  }

  if (typeof window !== "undefined") window.PlacePage = PlacePage;
})();
