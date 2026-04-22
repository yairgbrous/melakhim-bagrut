/* =========================================================================
   EventPage — /event/:id
   Reads window.EVENTS_DATA (array of {id, title, unit, chapters, summary,
   significance, participants[], places[], related_breadth[],
   related_recurring_items[]}). All chips are clickable; clicking a
   participant → /character/:id, place → /place/:id, breadth/recurring →
   /themes (with #hash).
   "⚔️ תרגל על אירוע זה" dispatches window 'practice-entity' CustomEvent.
   Exposes: window.EventPage
   ========================================================================= */
(function(){
  function Chip({ label, onClick, color }){
    const styles = {
      king:       "bg-amber-500/20 border-amber-500/40 text-amber-100",
      character:  "bg-orange-500/20 border-orange-500/40 text-orange-100",
      place:      "bg-emerald-500/20 border-emerald-500/40 text-emerald-100",
      breadth:    "bg-purple-500/20 border-purple-500/40 text-purple-100",
      recurring:  "bg-pink-500/20 border-pink-500/40 text-pink-100"
    };
    const cls = styles[color] || "bg-amber-500/20 border-amber-500/40 text-amber-100";
    return (
      <button onClick={onClick}
        className={`px-2.5 py-1 rounded-full text-xs font-bold border transition hover:scale-105 ${cls}`}>
        {label}
      </button>
    );
  }

  function EventPage(props){
    const id = props && props.id;
    const setRoute = props && props.setRoute;
    const ev = (window.EVENTS_DATA || []).find(x => x.id === id) || { title: id };
    const hasData = !!ev && !!(ev.summary || ev.significance || ev.participants || ev.places);

    const go = (page, extra) => setRoute && setRoute({ page, ...(extra||{}) });

    const onPractice = () => {
      const detail = { type: "event", id: ev.id || id };
      try { window.dispatchEvent(new CustomEvent("practice-entity", { detail })); } catch {}
      go("quiz");
    };

    return (
      <div className="max-w-2xl mx-auto space-y-4 p-2">
        <button onClick={()=>go("study")} className="text-amber-300 text-sm">→ חזרה לאזור הלימוד</button>

        <header className="card rounded-2xl p-5">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-amber-300">
            ⚔️ {ev.title || ev.name_hebrew || id}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
            {ev.unit && <span className="px-2 py-0.5 rounded-full bg-amber-700 text-amber-100 font-bold">יחידה {ev.unit}</span>}
            {ev.chapters && <span className="text-amber-200/70">{ev.chapters}</span>}
          </div>
        </header>

        {!hasData && (
          <div className="card rounded-xl p-4 text-amber-100/70 text-sm">
            יוצג בקרוב · נתוני האירוע טרם הוזנו ל-<code>window.EVENTS_DATA</code>.
          </div>
        )}

        {ev.summary && (
          <section className="parchment rounded-2xl p-5">
            <h2 className="font-display text-base font-bold text-amber-900 mb-2">תקציר</h2>
            <p className="hebrew text-amber-950 leading-relaxed">{ev.summary}</p>
          </section>
        )}

        {ev.significance && (
          <section className="card rounded-xl p-4">
            <h2 className="font-display text-base font-bold text-amber-200 mb-2">משמעות</h2>
            <p className="hebrew text-amber-100/90 leading-relaxed">{ev.significance}</p>
          </section>
        )}

        {Array.isArray(ev.participants) && ev.participants.length > 0 && (
          <section>
            <h3 className="text-xs font-bold text-amber-200 mb-2">👤 דמויות באירוע</h3>
            <div className="flex flex-wrap gap-1.5">
              {ev.participants.map(p => {
                const pid = typeof p === "string" ? p : p.id;
                const label = typeof p === "string" ? p : (p.name || p.label || p.id);
                return <Chip key={pid} color="character" label={label} onClick={()=>go("character", {id: pid})}/>;
              })}
            </div>
          </section>
        )}

        {Array.isArray(ev.places) && ev.places.length > 0 && (
          <section>
            <h3 className="text-xs font-bold text-amber-200 mb-2">📍 מקומות</h3>
            <div className="flex flex-wrap gap-1.5">
              {ev.places.map(p => {
                const pid = typeof p === "string" ? p : p.id;
                const label = typeof p === "string" ? p : (p.name_niqqud || p.name || p.label || p.id);
                return <Chip key={pid} color="place" label={label} onClick={()=>go("place", {id: pid})}/>;
              })}
            </div>
          </section>
        )}

        {Array.isArray(ev.related_breadth) && ev.related_breadth.length > 0 && (
          <section>
            <h3 className="text-xs font-bold text-amber-200 mb-2">🌐 נושאי רוחב</h3>
            <div className="flex flex-wrap gap-1.5">
              {ev.related_breadth.map(t => {
                const tid = typeof t === "string" ? t : t.id;
                const label = typeof t === "string" ? t : (t.label || t.title || t.id);
                return <Chip key={tid} color="breadth" label={label} onClick={()=>go("themes", {hash: tid})}/>;
              })}
            </div>
          </section>
        )}

        {Array.isArray(ev.related_recurring_items) && ev.related_recurring_items.length > 0 && (
          <section>
            <h3 className="text-xs font-bold text-amber-200 mb-2">🔁 פריטים חוזרים</h3>
            <div className="flex flex-wrap gap-1.5">
              {ev.related_recurring_items.map(t => {
                const tid = typeof t === "string" ? t : t.id;
                const label = typeof t === "string" ? t : (t.label || t.title || t.id);
                return <Chip key={tid} color="recurring" label={label} onClick={()=>go("themes", {hash: "recurring-"+tid})}/>;
              })}
            </div>
          </section>
        )}

        <button onClick={onPractice} className="gold-btn w-full py-3 rounded-xl text-base font-bold">
          ⚔️ תרגל על אירוע זה
        </button>
      </div>
    );
  }

  if (typeof window !== "undefined") window.EventPage = EventPage;
})();
