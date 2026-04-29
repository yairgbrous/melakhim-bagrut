/* =========================================================================
   EventPage — /event/:id · full-screen rich view
   ---------------------------------------------------------------------------
   STICKY HEADER · HERO · BODY (תקציר · משמעות · משתתפים · מקומות · נושאי
   רוחב · פריטים חוזרים · מקורות). Uses window.EntityLinkComponent for all
   cross-links so navigation + alias fallback are consistent with the rest
   of the app. Exposes: window.EventPage
   ========================================================================= */
(function(){
  const { useMemo } = React;

  function slug(s){
    if (!s || typeof s !== "string") return "";
    return s.trim().toLowerCase().replace(/[\s_]+/g, "-").replace(/[^֐-׿a-z0-9-]/g, "");
  }

  function shareEntity(type, id, label){
    const base = (window.location.origin || '') + window.location.pathname.replace(/[^/]*$/, '');
    const url = base + '#/' + type + '/' + encodeURIComponent(id);
    const text = (label || '') + ' · ספר מלכים · בגרות 2551';
    const data = { title: label || 'ספר מלכים', text, url };
    if (navigator.share){ navigator.share(data).catch(()=>{}); return; }
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(url).then(() => {
        if (typeof window.showToast === 'function') window.showToast('📋 הקישור הועתק ללוח', 'success');
      }).catch(()=>{});
    } else { window.prompt('העתק את הקישור:', url); }
  }

  function resolveEvent(id){
    if (!id) return null;
    const pool = window.EVENTS_DATA || [];
    const direct = pool.find(x => x && x.id === id);
    if (direct) return direct;
    const aliases = (window.__ENTITY_ALIASES__ || {}).event || {};
    if (Object.prototype.hasOwnProperty.call(aliases, id)) {
      const aliased = aliases[id];
      if (aliased === null) return { id, __stub: true };
      const hit = pool.find(x => x && x.id === aliased);
      if (hit) return hit;
    }
    const swapped = id.indexOf("_")>=0 ? id.replace(/_/g,"-") : id.replace(/-/g,"_");
    const swap = pool.find(x => x && x.id === swapped);
    if (swap) return swap;
    // Fallback: __ENTITY_INDEX__.event populated even if EVENTS_DATA missed.
    const idx = (window.__ENTITY_INDEX__ || {}).event || {};
    if (idx[id]) return idx[id];
    if (idx[swapped]) return idx[swapped];
    return null;
  }

  function nearestEvents(id){
    const pool = window.EVENTS_DATA || [];
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

  // book_ref → /#/book/:chapter
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
    const resolved = (typeof window.resolveDisplayName === "function") ? window.resolveDisplayName(id) : null;
    const finalLabel = label || resolved || id;
    if (!EL) return <span className="kt-chip">{finalLabel}</span>;
    return <EL type={type} id={id} label={finalLabel} setRoute={setRoute}/>;
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

  // Pull up to 5 quotes from window.QUOTES_DATA whose context_event_id matches.
  function quotesForEvent(eventId){
    const pool = (window.QUOTES_DATA || []);
    if (!eventId || !pool.length) return [];
    return pool.filter(q => q && q.context_event_id === eventId).slice(0, 5);
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
                {q.book_ref && <span className="ml-auto"><BookRefLink ref={q.book_ref}/></span>}
              </div>
            </blockquote>
          ))}
        </div>
      </Section>
    );
  }

  function Section({ title, children, tone }){
    const cls = tone === "parchment" ? "parchment rounded-2xl p-5 md:p-6 event-section" : "card rounded-2xl p-4 md:p-5 event-section";
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
          <a href="#/study" className="hover:text-on-parchment-accent">{crumb.section}</a>
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

  function Hero({ title, subtitle, breadthIds, setRoute }){
    return (
      <header className="px-4 md:px-6 pt-5 pb-4 event-hero">
        <div className="text-xs text-on-parchment-muted mb-1">⚔️ אירוע</div>
        <h1 className="font-display text-3xl md:text-5xl font-black text-on-parchment-accent hebrew leading-tight"
            style={{textShadow:"0 2px 8px rgba(200,155,60,.15)"}}>
          {title}
        </h1>
        {subtitle && <div className="text-sm md:text-base text-on-parchment mt-2 hebrew">{subtitle}</div>}
        {Array.isArray(breadthIds) && breadthIds.length>0 && (
          <div className="mt-3"><ChipList ids={breadthIds} type="breadth" setRoute={setRoute}/></div>
        )}
      </header>
    );
  }

  function NotFound({ id, setRoute }){
    const suggestions = useMemo(()=>nearestEvents(id), [id]);
    return (
      <div className="min-h-screen flex flex-col">
        <StickyHeader crumb={{section:"אירועים", leaf:"לא נמצא"}} setRoute={setRoute}/>
        <div className="max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
          <div className="parchment rounded-2xl p-6 text-center">
            <div className="text-5xl mb-3">🔎</div>
            <h2 className="font-display text-xl text-amber-900 font-bold mb-2">אירוע לא נמצא</h2>
            <div className="text-sm text-amber-800">מזהה שחיפשת: <code className="px-2 py-0.5 bg-black/5 rounded">{id||"—"}</code></div>
          </div>
          {suggestions.length>0 && (
            <Section title="💡 אירועים דומים">
              <ChipList ids={suggestions.map(s=>s.id)} type="event" setRoute={setRoute}/>
            </Section>
          )}
          <button onClick={()=>setRoute && setRoute({page:"home"})}
            className="w-full gold-btn py-3 rounded-xl font-bold">חזרה לדף הראשי</button>
        </div>
      </div>
    );
  }

  function EventPage(props){
    const { setRoute } = props;
    const id = props.eventId || props.id;
    const ev = useMemo(()=>resolveEvent(id), [id]);
    if (!ev || ev.__stub) return <NotFound id={id} setRoute={setRoute}/>;

    const title = ev.title_niqqud || ev.title || ev.name_hebrew || (typeof window.resolveDisplayName === 'function' ? window.resolveDisplayName(ev.id) : ev.id);
    const subtitleBits = [
      ev.unit != null ? `יחידה ${ev.unit}` : null,
      ev.chapter_ref || ev.chapters || null,
    ].filter(Boolean);

    const participants = ev.participants || [];
    const places = ev.places || [];
    const relatedChars = ev.related_characters || [];
    const relatedBreadth = ev.related_breadth || [];
    const relatedRecurring = ev.related_recurring_items || [];
    const bookRefs = ev.book_refs || [];
    const quotes = useMemo(()=>quotesForEvent(ev.id), [ev.id]);

    const onPractice = () => {
      try { window.dispatchEvent(new CustomEvent("practice-entity", {detail:{type:"event", id:ev.id}})); } catch {}
      setRoute && setRoute({page:"quiz"});
    };

    return (
      <div className="min-h-screen flex flex-col">
        <StickyHeader crumb={{section:"אירועים", leaf:title}} setRoute={setRoute}/>
        <main className="max-w-3xl mx-auto w-full pb-24">
          <Hero title={title} subtitle={subtitleBits.join(" · ")} breadthIds={relatedBreadth} setRoute={setRoute}/>

          <div className="px-4 md:px-6 -mt-2 mb-2 flex justify-end">
            <button onClick={()=>shareEntity('event', ev.id, title)} className="mb-share-btn" aria-label="שתף">
              <span aria-hidden="true">🔗</span><span>שתף</span>
            </button>
          </div>
          <div className="px-4 md:px-6 space-y-4">
            {ev.summary && (
              <Section title="📖 תקציר" tone="parchment">
                <p className="hebrew text-amber-950 leading-relaxed whitespace-pre-line">{ev.summary}</p>
              </Section>
            )}

            {ev.significance && (
              <Section title="✨ משמעות">
                <p className="hebrew text-on-parchment leading-relaxed">{ev.significance}</p>
              </Section>
            )}

            <QuotesSection quotes={quotes} setRoute={setRoute}/>

            {(participants.length>0 || places.length>0 || relatedChars.length>0 || relatedRecurring.length>0) && (
              <Section title="🔗 קשרים">
                {participants.length>0 && (
                  <div className="mb-2">
                    <div className="text-xs text-on-parchment-muted mb-1">👤 דמויות באירוע</div>
                    <ChipList ids={participants} type="character" setRoute={setRoute}/>
                  </div>
                )}
                {relatedChars.length>0 && (
                  <div className="mb-2">
                    <div className="text-xs text-on-parchment-muted mb-1">👤 דמויות קשורות</div>
                    <ChipList ids={relatedChars} type="character" setRoute={setRoute}/>
                  </div>
                )}
                {places.length>0 && (
                  <div className="mb-2">
                    <div className="text-xs text-on-parchment-muted mb-1">📍 מקומות</div>
                    <ChipList ids={places} type="place" setRoute={setRoute}/>
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
              ⚔️ תרגל על אירוע זה
            </button>
          </div>

          {window.RelatedSectionComponent && (
            <div className="px-4 md:px-6 mt-4">
              <window.RelatedSectionComponent type="event" id={ev.id} setRoute={setRoute}/>
            </div>
          )}
        </main>
      </div>
    );
  }

  if (typeof window !== "undefined") window.EventPage = EventPage;
})();
