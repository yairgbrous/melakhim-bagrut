/* =========================================================================
   CharacterPage — /character/:id · full-screen rich view
   ---------------------------------------------------------------------------
   Structure:
     STICKY HEADER: back button + breadcrumb (ראשי › דמויות › {name})
     HERO:         name_niqqud · role/kingdom/era · breadth-topic chips
     BODY:         תקציר · תפקיד · ציטוטים · קשרים · מקורות
   Data:           window.CHARACTERS_DATA (union with kings.js via
                   alias resolver + slug-swap in components/EntityLink.js).
   No "יוצג בקרוב" fallback: unresolved ids show alias suggestions.
   Exposes: window.CharacterPageComponent
   ========================================================================= */
(function(){
  const { useMemo } = React;

  // ---- shared utilities ---------------------------------------------------
  function slug(s){
    if (!s || typeof s !== "string") return "";
    return s.trim().toLowerCase().replace(/[\s_]+/g, "-").replace(/[^֐-׿a-z0-9-]/g, "");
  }

  function shareEntity(type, id, label){
    const base = (window.location.origin || '') + window.location.pathname.replace(/[^/]*$/, '');
    const url = base + '#/' + type + '/' + encodeURIComponent(id);
    const text = (label || '') + ' · ספר מלכים · בגרות 2551';
    const data = { title: label || 'ספר מלכים', text, url };
    if (navigator.share){
      navigator.share(data).catch(()=>{});
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(url).then(() => {
        if (typeof window.showToast === 'function') window.showToast('📋 הקישור הועתק ללוח', 'success');
      }).catch(()=>{});
    } else {
      window.prompt('העתק את הקישור:', url);
    }
  }

  function resolveEntry(id){
    if (!id) return null;
    const cd = (window.CHARACTERS_DATA || []);
    const ks = (window.KINGS_DATA || (window.kings /* legacy */) || []);
    const pool = [...cd, ...(Array.isArray(ks)?ks:[])];
    const direct = pool.find(x => x && x.id === id);
    if (direct) return direct;
    // alias map (same strategy as EntityLink resolver)
    const aliases = (window.__ENTITY_ALIASES__ || {});
    const maps = [aliases.character, aliases.king].filter(Boolean);
    for (const m of maps) {
      if (Object.prototype.hasOwnProperty.call(m, id)) {
        const aliased = m[id];
        if (aliased === null) return { id, __stub: true };
        if (typeof aliased === "string") {
          const hit = pool.find(x => x && x.id === aliased);
          if (hit) return hit;
        }
      }
    }
    // underscore↔dash swap
    const swapped = id.indexOf("_")>=0 ? id.replace(/_/g,"-") : id.replace(/-/g,"_");
    const swap = pool.find(x => x && x.id === swapped);
    if (swap) return swap;
    // Fallback: __ENTITY_INDEX__ buckets are populated even when raw
    // CHARACTERS_DATA / KINGS_DATA globals fail to attach (dynamic import
    // succeeded but static <script> didn't on live).
    const idx = (window.__ENTITY_INDEX__ || {});
    const fromIdx = (idx.character && idx.character[id])
                 || (idx.king && idx.king[id])
                 || (idx.character && idx.character[swapped])
                 || (idx.king && idx.king[swapped]);
    if (fromIdx) return fromIdx;
    // Diagnostic — fires only when ALL lookup paths fail. Tells us, from the
    // user's actual browser, why resolveEntry returned null. Safe to leave in
    // production: only logs on miss, never on hit.
    try {
      console.warn('[CharacterPage.resolveEntry] miss', {
        id,
        swapped,
        CHARACTERS_DATA_len: (window.CHARACTERS_DATA || []).length,
        KINGS_DATA_len:      (window.KINGS_DATA || []).length,
        idx_character_count: idx.character ? Object.keys(idx.character).length : 0,
        idx_king_count:      idx.king ? Object.keys(idx.king).length : 0,
        has_alias_map:       !!(window.__ENTITY_ALIASES__ && (window.__ENTITY_ALIASES__.character || window.__ENTITY_ALIASES__.king)),
        first_5_char_ids:    (window.CHARACTERS_DATA || []).slice(0,5).map(x=>x && x.id),
        first_5_king_ids:    (window.KINGS_DATA || []).slice(0,5).map(x=>x && x.id),
      });
    } catch(e){}
    return null;
  }

  function nearestSuggestions(id){
    const pool = [...(window.CHARACTERS_DATA || []), ...(Array.isArray(window.KINGS_DATA)?window.KINGS_DATA:[])];
    if (!id || !pool.length) return pool.slice(0, 5);
    const s = slug(id);
    const scored = pool.map(x => {
      const xs = slug(x.id || "");
      let score = 0;
      if (xs.startsWith(s) || s.startsWith(xs)) score += 50;
      if (xs.includes(s) || s.includes(xs)) score += 30;
      const common = [...new Set(s.split("-"))].filter(p => p && xs.includes(p)).length;
      score += common * 10;
      return { x, score };
    });
    return scored.sort((a,b)=>b.score-a.score).slice(0, 6).map(o=>o.x);
  }

  // ---- book_ref → /#/book/:chapter link ----------------------------------
  // Accepts forms like "מלכים א ג ט" / "מל״א ג׳ ט" / "2Kings 21:13".
  function bookRefSlug(ref){
    if (!ref || typeof ref !== "string") return null;
    // Extract book marker (א/ב) and chapter number (Hebrew letters or digits).
    const r = ref.replace(/[״׳]/g, "").trim();
    // "מלכים א ג ט" or "מל״א ג׳ ט" → melachim-a-3 (or keep Hebrew: melachim-א-ג)
    const m = r.match(/^(?:מלכים|מל)\s*(א|ב)\s+([א-ת0-9א-ת]+)/);
    if (!m) return null;
    return `melachim-${m[1]}-${m[2]}`;
  }

  function BookRefLink({ ref }){
    const h = bookRefSlug(ref);
    if (!h) return <span>{ref}</span>;
    return (
      <a href={`#/book/${h}`}
         className="text-on-parchment-accent underline hover:opacity-80"
         title={`פתח ${ref} בתנ״ך`}>
        {ref}
      </a>
    );
  }

  // ---- EntityLink chip wrapper ------------------------------------------
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

  // Up to 5 quotes for this character: union of CHARACTERS_DATA.key_quotes (the
  // entity's own list) and QUOTES_DATA where speaker_id or addressee_id matches.
  // Deduped by text_niqqud / text. Order: own list first, fallback after.
  function quotesForCharacter(c){
    const own = Array.isArray(c.key_quotes) ? c.key_quotes : [];
    const ownNorm = own.map(q => typeof q === "string"
      ? { text_niqqud: q }
      : { text_niqqud: q.text_niqqud || q.text || "", book_ref: q.ref || q.book_ref });
    const pool = (window.QUOTES_DATA || []);
    const fb = pool.filter(q => q && (q.speaker_id === c.id || q.addressee_id === c.id));
    const seen = new Set(ownNorm.map(q => (q.text_niqqud||"").trim()).filter(Boolean));
    const merged = ownNorm.slice();
    for (const q of fb) {
      const key = (q.text_niqqud || q.text || "").trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      merged.push(q);
      if (merged.length >= 5) break;
    }
    return merged.slice(0, 5);
  }

  // ---- Section ----------------------------------------------------------
  function Section({ title, children, tone }){
    const cls = tone === "parchment"
      ? "parchment rounded-2xl p-5 md:p-6 char-section"
      : "card rounded-2xl p-4 md:p-5 char-section";
    return (
      <section className={cls}>
        {title && <h2 className="font-display text-base md:text-lg font-bold text-on-parchment-accent mb-3 hebrew">{title}</h2>}
        {children}
      </section>
    );
  }

  // ---- Sticky header ----------------------------------------------------
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

  // ---- Hero ------------------------------------------------------------
  function Hero({ name_niqqud, subtitle, breadthIds, setRoute }){
    return (
      <header className="px-4 md:px-6 pt-5 pb-4 char-hero">
        <h1 className="font-display text-3xl md:text-5xl font-black text-on-parchment-accent hebrew leading-tight"
            style={{textShadow:"0 2px 8px rgba(200,155,60,.15)"}}>
          {name_niqqud}
        </h1>
        {subtitle && <div className="text-sm md:text-base text-on-parchment mt-2 hebrew">{subtitle}</div>}
        {Array.isArray(breadthIds) && breadthIds.length>0 && (
          <div className="mt-3">
            <ChipList ids={breadthIds} type="breadth" setRoute={setRoute}/>
          </div>
        )}
      </header>
    );
  }

  // ---- Not-found state with suggestions -------------------------------
  function NotFound({ id, setRoute }){
    const suggestions = useMemo(()=>nearestSuggestions(id), [id]);
    return (
      <div className="min-h-screen flex flex-col">
        <StickyHeader crumb={{section:"דמויות", leaf:"לא נמצא"}} setRoute={setRoute}/>
        <div className="max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
          <div className="parchment rounded-2xl p-6 text-center">
            <div className="text-5xl mb-3">🔎</div>
            <h2 className="font-display text-xl text-amber-900 font-bold mb-2">דמות לא נמצאה</h2>
            <div className="text-sm text-amber-800">מזהה שחיפשת: <code className="px-2 py-0.5 bg-black/5 rounded">{id||"—"}</code></div>
          </div>
          {suggestions.length>0 && (
            <Section title="💡 דמויות דומות">
              <ChipList ids={suggestions.map(s=>s.id)} type="character" setRoute={setRoute}/>
            </Section>
          )}
          <button onClick={()=>setRoute && setRoute({page:"home"})}
            className="w-full gold-btn py-3 rounded-xl font-bold">חזרה לדף הראשי</button>
        </div>
      </div>
    );
  }

  // ---- Main component -------------------------------------------------
  function CharacterPage({ id, setRoute }){
    const c = useMemo(()=>resolveEntry(id), [id]);
    if (!c || c.__stub) return <NotFound id={id} setRoute={setRoute}/>;

    const isKing = /king|מלך/.test(c.role || "") || !!c.kingdom && c.reign_years != null;
    const name = c.name_niqqud || c.name || (typeof window.resolveDisplayName === 'function' ? window.resolveDisplayName(c.id) : c.id);

    const subtitleBits = [
      c.role,
      c.kingdom,
      c.era != null ? `יחידה ${c.era}` : null,
      c.reign_years != null ? `${c.reign_years} שנות מלוכה` : null,
      c.dynasty || null,
    ].filter(Boolean);

    const keyQuotes = useMemo(()=>quotesForCharacter(c), [c.id]);
    const assessQuote = c.assessment_quote || null;

    const relatedChars = c.related_characters || c.related_prophets || [];
    const relatedKings = c.related_kings || [];
    const relatedPlaces = c.related_places || [];
    const relatedEvents = c.related_events || [];
    const relatedBreadth = c.related_breadth || c.themes || [];
    const relatedRecurring = c.related_recurring_items || c.recurring_items || [];
    const bookRefs = c.book_refs || [];

    const bio = c.bio || c.short_summary || c.summary || "";
    const significance = c.significance || "";

    const onPractice = () => {
      try { window.dispatchEvent(new CustomEvent("practice-entity", {detail:{type:(isKing?"king":"character"), id:c.id}})); } catch {}
      setRoute && setRoute({page:"quiz"});
    };

    return (
      <div className="min-h-screen flex flex-col">
        <StickyHeader crumb={{section:"דמויות", leaf:name}} setRoute={setRoute}/>

        <main className="max-w-3xl mx-auto w-full pb-24">
          <Hero name_niqqud={name} subtitle={subtitleBits.join(" · ")} breadthIds={relatedBreadth} setRoute={setRoute}/>

          <div className="px-4 md:px-6 space-y-4">
            {significance && (
              <Section title="✨ משמעות" tone="parchment">
                <p className="hebrew text-amber-950 leading-relaxed">{significance}</p>
              </Section>
            )}

            {bio && (
              <Section title="📖 תקציר ותפקיד">
                <p className="hebrew text-on-parchment leading-relaxed whitespace-pre-line">{bio}</p>
              </Section>
            )}

            {assessQuote && (
              <Section title="🏛 פסוק הערכה">
                <blockquote className="hebrew text-amber-100/90 border-r-4 border-amber-500/60 pr-4 py-1 text-base leading-relaxed">
                  {assessQuote}
                </blockquote>
              </Section>
            )}

            {keyQuotes.length>0 && (
              <Section title="💬 ציטוטים חשובים">
                <div className="space-y-3">
                  {keyQuotes.map((q,i)=>{
                    const text = q.text_niqqud || q.text || "";
                    const ref  = q.book_ref || null;
                    const speaker   = q.speaker_id;
                    const addressee = q.addressee_id;
                    return (
                      <blockquote key={q.id||i}
                        className="hebrew text-on-parchment border-r-4 border-amber-500/50 pr-4 py-1 leading-relaxed"
                        style={{background:"rgba(212,165,116,.08)", borderRadius:6, padding:"10px 14px"}}>
                        <div>{text}</div>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-on-parchment-muted">
                          {speaker && <Chip type="character" id={speaker} setRoute={setRoute}/>}
                          {addressee && (<><span aria-hidden="true">→</span><Chip type="character" id={addressee} setRoute={setRoute}/></>)}
                          {ref && <span className="ml-auto"><BookRefLink ref={ref}/></span>}
                        </div>
                      </blockquote>
                    );
                  })}
                </div>
              </Section>
            )}

            {c.key_actions && c.key_actions.length>0 && (
              <Section title="⚡ מעשים מרכזיים">
                <ul className="list-disc pr-5 space-y-1 text-sm hebrew text-on-parchment">
                  {c.key_actions.map((a,i)=><li key={i}>{a}</li>)}
                </ul>
              </Section>
            )}

            {(relatedChars.length>0 || relatedKings.length>0 || relatedPlaces.length>0 || relatedEvents.length>0 || relatedRecurring.length>0) && (
              <Section title="🔗 קשרים">
                {relatedKings.length>0 && <div className="mb-2"><div className="text-xs text-on-parchment-muted mb-1">👑 מלכים</div><ChipList ids={relatedKings} type="king" setRoute={setRoute}/></div>}
                {relatedChars.length>0 && <div className="mb-2"><div className="text-xs text-on-parchment-muted mb-1">👤 דמויות</div><ChipList ids={relatedChars} type="character" setRoute={setRoute}/></div>}
                {relatedPlaces.length>0 && <div className="mb-2"><div className="text-xs text-on-parchment-muted mb-1">📍 מקומות</div><ChipList ids={relatedPlaces} type="place" setRoute={setRoute}/></div>}
                {relatedEvents.length>0 && <div className="mb-2"><div className="text-xs text-on-parchment-muted mb-1">⚔️ אירועים</div><ChipList ids={relatedEvents} type="event" setRoute={setRoute}/></div>}
                {relatedRecurring.length>0 && <div className="mb-2"><div className="text-xs text-on-parchment-muted mb-1">🔁 פריטים חוזרים</div><ChipList ids={relatedRecurring} type="recurring" setRoute={setRoute}/></div>}
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
              ⚔️ תרגל על דמות זו
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (typeof window !== "undefined") {
    window.CharacterPageComponent = CharacterPage;
    // Aliases for any consumer that looks up window.CharacterPage / window.KingPage.
    // Kings render through this same component (router's route.page==="king"
    // branch reuses window.CharacterPageComponent) so KingPage aliases it too.
    window.CharacterPage = CharacterPage;
    window.KingPage      = CharacterPage;
  }
})();
