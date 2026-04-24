/* =========================================================================
   EventPage — /event/:id
   Reads window.EVENTS_DATA (array of {id, title, unit, chapters, summary,
   significance, participants[], places[], related_characters[],
   related_breadth[], related_recurring_items[]}).

   All entity chips are rendered through window.EntityLinkComponent so
   routing, dead-link fallback, and tone are consistent with the rest of
   the app. Types used:
     participants[], related_characters[]  → type="character"
     places[]                               → type="place"
     related_breadth[]                      → type="breadth"
     related_recurring_items[]              → type="recurring"

   "⚔️ תרגל על אירוע זה" dispatches window 'practice-entity' CustomEvent.
   Exposes: window.EventPage
   ========================================================================= */
(function(){
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

  function Section({ title, items, type, setRoute }){
    if (!Array.isArray(items) || items.length === 0) return null;
    return (
      <section>
        <h3 className="text-xs font-bold text-on-parchment mb-2">{title}</h3>
        <EntityList items={items} type={type} setRoute={setRoute}/>
      </section>
    );
  }

  function EventPage(props){
    const id = props && props.id;
    const setRoute = props && props.setRoute;
    const ev = (window.EVENTS_DATA || []).find(x => x.id === id) || null;
    const hasData = !!ev;

    const go = (page, extra) => setRoute && setRoute({ page, ...(extra||{}) });

    const onPractice = () => {
      const detail = { type: "event", id: (ev && ev.id) || id };
      try { window.dispatchEvent(new CustomEvent("practice-entity", { detail })); } catch {}
      go("quiz");
    };

    const headingLabel = (ev && (ev.title_niqqud || ev.title || ev.name_hebrew)) || id || "אירוע";
    const bookRefs = (ev && Array.isArray(ev.book_refs)) ? ev.book_refs : [];

    return (
      <div className="max-w-2xl mx-auto space-y-4 p-2">
        <button onClick={()=>go("study")} className="text-on-parchment-accent text-sm">→ חזרה לאזור הלימוד</button>

        <header className="card rounded-2xl p-5">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-on-parchment-accent hebrew">
            ⚔️ {headingLabel}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
            {ev && ev.unit != null && <span className="px-2 py-0.5 rounded-full bg-amber-700 text-on-parchment-muted font-bold">יחידה {ev.unit}</span>}
            {ev && (ev.chapter_ref || ev.chapters) && <span className="text-on-parchment">{ev.chapter_ref || ev.chapters}</span>}
            {ev && ev.date_bce != null && <span className="text-on-parchment-muted">~{ev.date_bce} לפנה״ס</span>}
          </div>
        </header>

        {!hasData && (
          <div className="card rounded-xl p-4 text-on-parchment-muted text-sm">
            יוצג בקרוב · האירוע <code>{id}</code> טרם הוזן ל-<code>window.EVENTS_DATA</code>.
          </div>
        )}

        {ev && ev.summary && (
          <section className="parchment rounded-2xl p-5">
            <h2 className="font-display text-base font-bold text-amber-900 mb-2">תקציר</h2>
            <p className="hebrew text-amber-950 leading-relaxed">{ev.summary}</p>
          </section>
        )}

        {ev && ev.significance && (
          <section className="card rounded-xl p-4">
            <h2 className="font-display text-base font-bold text-on-parchment mb-2">משמעות</h2>
            <p className="hebrew text-on-parchment-muted leading-relaxed">{ev.significance}</p>
          </section>
        )}

        {ev && <Section title="👤 דמויות באירוע"       items={ev.participants}             type="character" setRoute={setRoute}/>}
        {ev && <Section title="👤 דמויות קשורות"       items={ev.related_characters}       type="character" setRoute={setRoute}/>}
        {ev && <Section title="📍 מקומות"              items={ev.places}                   type="place"     setRoute={setRoute}/>}
        {ev && <Section title="🌐 נושאי רוחב"          items={ev.related_breadth}          type="breadth"   setRoute={setRoute}/>}
        {ev && <Section title="🔁 פריטים חוזרים"       items={ev.related_recurring_items}  type="recurring" setRoute={setRoute}/>}

        {bookRefs.length > 0 && (
          <section className="card rounded-xl p-4">
            <h3 className="text-xs font-bold text-on-parchment mb-2">📚 מקורות בספר מלכים</h3>
            <ul className="text-sm text-on-parchment-muted hebrew" style={{columnCount:2,columnGap:18,listStyle:'none',padding:0,margin:0}}>
              {bookRefs.map((r,i)=><li key={i} style={{breakInside:'avoid',marginBottom:4}}>• {r}</li>)}
            </ul>
          </section>
        )}

        {hasData && window.RelatedSectionComponent && (
          <window.RelatedSectionComponent type="event" id={ev.id} setRoute={setRoute}/>
        )}

        {hasData && (
          <button onClick={onPractice} className="gold-btn w-full py-3 rounded-xl text-base font-bold">
            ⚔️ תרגל על אירוע זה
          </button>
        )}
      </div>
    );
  }

  if (typeof window !== "undefined") window.EventPage = EventPage;
})();
