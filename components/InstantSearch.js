/* =========================================================================
   InstantSearch — Ctrl/Cmd+K global search across every entity in the app.

   Opens on:
     - Ctrl+K / Cmd+K anywhere on the page
     - window.dispatchEvent(new CustomEvent("mb-open-search")) (for header button)

   Searches:
     window.__ENTITY_INDEX__ — character / king / place / event / breadth /
     recurringItem / flashcard / keyConcept / story (anything bootEntityIndex
     and the extra backfill have populated).

   Also injects synthetic unit entries {id: "unit-N", heading: "יחידה N"}
   for navigating straight to /unit/:id.

   Fuzzy match: normalises Hebrew niqqud, strips punctuation, scores by
   prefix match → substring match → subsequence match. Results grouped by
   type, each group capped, overall 12 visible.

   Keyboard: ↑/↓ navigate, Enter goes, Esc closes. Mouse click equivalent.

   Exposes: window.InstantSearchComponent (rendered once in the app), and
   window.openInstantSearch() as an imperative trigger.
   ========================================================================= */
(function(){
  const { useState, useEffect, useMemo, useRef, useCallback } = React;

  const GROUP_META = [
    // order matters — this is the display order
    { type: "unit",          label: "יחידות",         icon: "📚", routeType: "unit"      },
    { type: "character",     label: "דמויות",          icon: "👤", routeType: "character" },
    { type: "king",          label: "מלכים",            icon: "👑", routeType: "character" },
    { type: "place",         label: "מקומות",           icon: "📍", routeType: "place"     },
    { type: "event",         label: "אירועים",          icon: "⚔️", routeType: "event"     },
    { type: "breadth",       label: "נושאי רוחב",       icon: "🌐", routeType: "themes"    },
    { type: "recurringItem", label: "פריטים חוזרים",   icon: "🔁", routeType: "themes"    },
    { type: "flashcard",     label: "כרטיסיות",         icon: "🃏", routeType: "flashcards"},
    { type: "keyConcept",    label: "מושגים",           icon: "💡", routeType: "character" }
  ];
  const PER_GROUP_CAP = 6;
  const TOTAL_CAP     = 12;

  // Hebrew-aware normaliser: strip niqqud, lowercase, remove punctuation.
  function norm(s){
    if (!s) return "";
    return String(s)
      .normalize("NFKD")
      .replace(/[֑-ׇ]/g, "")          // cantillation + niqqud
      .replace(/["׳״'`.,;:!?(){}\[\]<>\/\\-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  // Subsequence check + score: lower = better.
  function matchScore(hay, needle){
    if (!needle) return 0;
    if (!hay) return Infinity;
    if (hay.startsWith(needle)) return 0;
    const i = hay.indexOf(needle);
    if (i === 0)  return 0;
    if (i > 0)    return i + 1;
    // subsequence
    let pi = 0, gaps = 0, last = -1;
    for (let i2 = 0; i2 < needle.length; i2++){
      const c = needle[i2];
      const at = hay.indexOf(c, last + 1);
      if (at < 0) return Infinity;
      if (last >= 0) gaps += at - last - 1;
      last = at;
      pi = i2;
    }
    return 200 + gaps;
  }

  function buildCandidates(){
    const idx = (typeof window !== "undefined" && window.__ENTITY_INDEX__) || {};
    const out = [];
    GROUP_META.forEach(g => {
      if (g.type === "unit") return; // synthetic
      const bucket = idx[g.type] || {};
      Object.keys(bucket).forEach(id => {
        const e = bucket[id] || {};
        const heading = e.heading || e.name_niqqud || e.name || e.title || e.label || id;
        const summary = e.summary || e.significance || e.description || "";
        out.push({
          type: g.type,
          id,
          heading,
          summary,
          hay: norm([heading, summary, id].join(" "))
        });
      });
    });
    // synthetic units 1..6
    for (let u = 1; u <= 6; u++){
      out.push({
        type: "unit",
        id: String(u),
        heading: `יחידה ${u}`,
        summary: "קפוץ ישירות ליחידה זו",
        hay: norm(`יחידה ${u} unit`)
      });
    }
    return out;
  }

  function search(candidates, query){
    const q = norm(query);
    if (!q) return [];
    const tokens = q.split(" ").filter(Boolean);
    const scored = [];
    for (const c of candidates){
      let score = 0;
      for (const t of tokens){
        const s = matchScore(c.hay, t);
        if (!isFinite(s)) { score = Infinity; break; }
        score += s;
      }
      if (isFinite(score)) scored.push({ ...c, score });
    }
    scored.sort((a,b) => a.score - b.score);

    // group + cap
    const grouped = {};
    scored.forEach(r => {
      const arr = grouped[r.type] = grouped[r.type] || [];
      if (arr.length < PER_GROUP_CAP) arr.push(r);
    });

    const out = [];
    GROUP_META.forEach(g => (grouped[g.type] || []).forEach(r => { if (out.length < TOTAL_CAP) out.push(r); }));
    return out;
  }

  function navigateFor(result){
    const gm = GROUP_META.find(g => g.type === result.type);
    if (!gm) return null;
    if (gm.routeType === "unit")       return { page: "unit",       unitId: parseInt(result.id, 10) };
    if (gm.routeType === "themes" && result.type === "recurringItem") {
      return { page: "themes", hash: "recurring-" + result.id };
    }
    if (gm.routeType === "themes")     return { page: "themes",     hash: result.id };
    if (gm.routeType === "flashcards") return { page: "flashcards" };
    return { page: gm.routeType, id: result.id };
  }

  function InstantSearch(props){
    const setRoute = props && props.setRoute;
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");
    const [cursor, setCursor] = useState(0);
    const [candidates, setCandidates] = useState(() => buildCandidates());
    const inputRef = useRef(null);

    // Rebuild candidates when the index fires "ready" events.
    useEffect(() => {
      const reload = () => setCandidates(buildCandidates());
      window.addEventListener("entity-index-ready", reload);
      window.addEventListener("entity-index-extra-ready", reload);
      return () => {
        window.removeEventListener("entity-index-ready", reload);
        window.removeEventListener("entity-index-extra-ready", reload);
      };
    }, []);

    // Global Ctrl+K / Cmd+K + custom trigger.
    useEffect(() => {
      const onKey = (e) => {
        const isK = (e.key === "k" || e.key === "K");
        if (isK && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          setOpen(v => !v);
          setCursor(0);
          return;
        }
        if (open && e.key === "Escape") { e.preventDefault(); setOpen(false); return; }
      };
      const onTrigger = () => { setOpen(true); setCursor(0); };
      window.addEventListener("keydown", onKey);
      window.addEventListener("mb-open-search", onTrigger);
      return () => {
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("mb-open-search", onTrigger);
      };
    }, [open]);

    useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);

    const results = useMemo(() => search(candidates, q), [candidates, q]);

    const go = useCallback((r) => {
      const route = navigateFor(r);
      if (route && typeof setRoute === "function") setRoute(route);
      else if (route) {
        try { window.dispatchEvent(new CustomEvent("mb-entity-navigate", { detail: route })); } catch {}
      }
      setOpen(false);
      setQ("");
    }, [setRoute]);

    const onInputKey = useCallback((e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setCursor(c => Math.min(results.length - 1, c + 1)); }
      else if (e.key === "ArrowUp")   { e.preventDefault(); setCursor(c => Math.max(0, c - 1)); }
      else if (e.key === "Enter")     { e.preventDefault(); const r = results[cursor]; if (r) go(r); }
    }, [results, cursor, go]);

    if (!open) return null;

    // Render
    const groups = [];
    GROUP_META.forEach(g => {
      const hits = results.filter(r => r.type === g.type);
      if (hits.length) groups.push({ ...g, hits });
    });

    const shownIds = [];
    results.forEach(r => shownIds.push(r.type + ":" + r.id));

    return (
      <div
        dir="rtl"
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] p-4"
        style={{ background: "rgba(0,0,0,.62)" }}
        onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
      >
        <div className="w-full max-w-xl card rounded-2xl overflow-hidden shadow-2xl border border-amber-500/40">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-amber-500/20 bg-slate-900/80">
            <span className="text-amber-300 text-lg" aria-hidden="true">🔍</span>
            <input
              ref={inputRef}
              dir="rtl"
              value={q}
              onChange={e => { setQ(e.target.value); setCursor(0); }}
              onKeyDown={onInputKey}
              placeholder="חפש דמות, מקום, אירוע, יחידה, ציטוט..."
              className="flex-1 bg-transparent outline-none text-amber-100 placeholder:text-amber-200/40 text-base"
            />
            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded border border-amber-500/30 text-[10px] text-amber-200/70">Esc</kbd>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {q && results.length === 0 && (
              <div className="px-4 py-6 text-center text-amber-100/60 text-sm">
                אין תוצאות · נסה ניסוח אחר
              </div>
            )}
            {!q && (
              <div className="px-4 py-6 text-center text-amber-100/60 text-xs space-y-1">
                <div>התחל להקליד לחיפוש מהיר</div>
                <div>↑ / ↓ לניווט · Enter לבחירה · Esc לסגירה</div>
              </div>
            )}
            {groups.map(g => (
              <div key={g.type} className="py-1">
                <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-amber-200/60">
                  {g.icon} {g.label}
                </div>
                {g.hits.map(r => {
                  const key = r.type + ":" + r.id;
                  const active = shownIds[cursor] === key;
                  return (
                    <button
                      key={key}
                      onMouseEnter={() => setCursor(shownIds.indexOf(key))}
                      onClick={() => go(r)}
                      className={`w-full text-right px-3 py-2 flex flex-col items-stretch transition ${active ? "bg-amber-500/20" : "hover:bg-amber-500/10"}`}
                    >
                      <div className="text-amber-100 font-bold text-sm hebrew">{r.heading}</div>
                      {r.summary && (
                        <div className="text-amber-200/60 text-xs hebrew truncate">{r.summary}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="px-3 py-1.5 border-t border-amber-500/20 bg-slate-900/60 text-[10px] text-amber-200/60 flex items-center justify-between">
            <span>{results.length} תוצאות · מקסימום {TOTAL_CAP}</span>
            <span>
              <kbd className="px-1 py-0.5 rounded border border-amber-500/30">Ctrl</kbd>
              <span className="mx-0.5">+</span>
              <kbd className="px-1 py-0.5 rounded border border-amber-500/30">K</kbd>
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (typeof window !== "undefined") {
    window.InstantSearchComponent = InstantSearch;
    window.openInstantSearch = () => {
      try { window.dispatchEvent(new CustomEvent("mb-open-search")); } catch {}
    };
  }
})();
