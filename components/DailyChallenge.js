/* =========================================================================
   DailyChallenge — /#/daily · "אתגר היום"

   Deterministic-per-day entity pick: the day key (Asia/Jerusalem ISO date)
   is hashed to index into a pool of kings + characters from
   window.__ENTITY_INDEX__, restricted to those with ≥3 matching review
   questions so the quiz is always well-fed.

   Phases:
     "intro"     — entity card + "התחל את האתגר"
     "running"   — window.QuizEngineComponent with 5 filtered questions
     "done"      — score + streak card

   Persists to localStorage["jarvis.daily.completions"]:
     { [isoDate]: { ok:true, score:number, entity:{type,id}, ts } }
   Streak = consecutive ISO days up to and including today.

   Also dispatches "practice-entity" on start, for consistency with
   CharacterPage / EventPage / KingsTable triggers.

   Exposes: window.DailyChallenge
   ========================================================================= */
(function(){
  const { useState, useMemo, useCallback } = React;

  const COMPLETIONS_KEY = "jarvis.daily.completions";
  const QUESTIONS_PER_RUN = 5;

  function ilDay(t){
    return new Date(t || Date.now()).toLocaleDateString("en-CA", { timeZone:"Asia/Jerusalem" });
  }

  function hashStr(s){
    let h = 2166136261;
    for (let i=0; i<s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function loadCompletions(){
    try { const r = localStorage.getItem(COMPLETIONS_KEY); return r ? JSON.parse(r) : {}; }
    catch { return {}; }
  }
  function saveCompletion(date, entry){
    const all = loadCompletions();
    all[date] = entry;
    try { localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(all)); } catch {}
    return all;
  }
  function streakFrom(completions, today){
    let n = 0;
    let cursor = today;
    while (completions[cursor]) {
      n++;
      const d = new Date(cursor + "T00:00:00Z");
      d.setUTCDate(d.getUTCDate() - 1);
      cursor = d.toISOString().slice(0,10);
    }
    return n;
  }

  // --- entity matcher on data/review-questions.js shape ---------------------
  // Questions tag related_entities as "char:id" / "king:id" / "place:id" / "event:id".
  function entityTagsFor(type, id){
    const aliases = type === "king"
      ? ["king:"+id, "char:"+id, "character:"+id]
      : type === "character"
        ? ["char:"+id, "character:"+id, "king:"+id]
        : [type+":"+id];
    return aliases.map(s => s.toLowerCase());
  }
  function qMatchesEntity(q, type, id){
    const tags = entityTagsFor(type, id);
    const list = Array.isArray(q.related_entities) ? q.related_entities : [];
    for (const t of list) { if (tags.indexOf(String(t).toLowerCase()) >= 0) return true; }
    return false;
  }
  function filteredQuestions(type, id){
    const pool = (typeof window!=="undefined" && window.REVIEW_QUESTIONS) || [];
    return pool.filter(q => qMatchesEntity(q, type, id));
  }

  // --- pick today's entity deterministically --------------------------------
  function buildEntityPool(){
    const idx = (typeof window!=="undefined" && window.__ENTITY_INDEX__) || {};
    const out = [];
    const pushBucket = (bucket, type) => {
      if (!bucket) return;
      Object.keys(bucket).forEach(id => {
        const entry = bucket[id];
        if (!entry) return;
        const matches = filteredQuestions(type, id);
        if (matches.length >= 3) out.push({ type, id, entry, matchCount: matches.length });
      });
    };
    pushBucket(idx.king,      "king");
    pushBucket(idx.character, "character");
    return out;
  }

  function pickForDate(date){
    const pool = buildEntityPool();
    if (pool.length === 0) return null;
    const h = hashStr(date + ":melakhim-daily:v1");
    return pool[h % pool.length];
  }

  // --- UI --------------------------------------------------------------------
  function TypeBadge({ type }){
    const map = {
      king:      { t:"מלך",   cls:"bg-amber-600 text-amber-50"  },
      character: { t:"דמות",  cls:"bg-orange-600 text-orange-50" }
    };
    const m = map[type] || map.character;
    return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${m.cls}`}>{m.t}</span>;
  }

  function Intro({ today, pick, streak, alreadyToday, onStart, onReplay }){
    if (!pick) {
      return (
        <div className="max-w-xl mx-auto p-3">
          <div className="card rounded-2xl p-5 text-on-parchment-muted text-sm">
            ☀️ אתגר היום טרם זמין — נתוני הישויות עדיין נטענים. נסה שוב בעוד רגע.
          </div>
        </div>
      );
    }
    const entry = pick.entry || {};
    const heading = entry.heading || entry.name_niqqud || entry.name || pick.id;
    const summary = entry.summary || entry.short_summary || "";
    return (
      <div className="max-w-xl mx-auto p-3 space-y-4">
        <header className="card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-on-parchment-accent">☀️ אתגר היום</h1>
            <div className="text-right text-xs text-on-parchment" dir="ltr">{today}</div>
          </div>
          <div className="text-xs text-on-parchment-muted hebrew">
            {QUESTIONS_PER_RUN} שאלות · ישות אחת לכל יום · קבוע לפי התאריך
          </div>
        </header>

        <section className="parchment rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2">
            <TypeBadge type={pick.type}/>
            <h2 className="font-display text-xl font-bold text-amber-900 hebrew">{heading}</h2>
          </div>
          {summary && <p className="hebrew text-amber-950 leading-relaxed text-sm">{summary}</p>}
          <div className="text-[11px] text-amber-800">
            בסבב הזה: <span dir="ltr" className="font-bold">{Math.min(pick.matchCount, QUESTIONS_PER_RUN)}/{QUESTIONS_PER_RUN}</span> שאלות מתוך מאגר הבגרות
          </div>
        </section>

        <section className="card rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="text-sm">
            <div className="text-on-parchment">🔥 רצף ימים</div>
            <div className="font-mono font-bold text-on-parchment-accent text-2xl" dir="ltr">{streak}</div>
          </div>
          <div className="text-xs text-on-parchment-muted text-left">
            {alreadyToday
              ? "סיימת את האתגר של היום — רצף נשמר. אפשר לשחק שוב לתרגול."
              : "השלם את האתגר היום כדי לשמור על הרצף."}
          </div>
        </section>

        {alreadyToday ? (
          <button onClick={onReplay} className="gold-btn w-full py-4 rounded-2xl text-base font-bold">
            🔁 תרגל שוב את אתגר היום
          </button>
        ) : (
          <button onClick={onStart} className="gold-btn glow w-full py-4 rounded-2xl text-lg font-bold">
            ⚔️ התחל את האתגר ({QUESTIONS_PER_RUN} שאלות)
          </button>
        )}
      </div>
    );
  }

  function DoneCard({ pick, score, streak, onBack, onReplay }){
    const heading = (pick && pick.entry && (pick.entry.heading || pick.entry.name)) || (pick && pick.id) || "";
    return (
      <div className="max-w-xl mx-auto p-3 space-y-4 text-center">
        <div className="text-6xl">🎉</div>
        <h2 className="font-display text-2xl font-bold text-on-parchment-accent hebrew">סיימת את אתגר היום</h2>
        <div className="card rounded-2xl p-5 space-y-2">
          <div className="text-sm text-on-parchment hebrew">ישות היום: <span className="font-bold">{heading}</span></div>
          {typeof score === "number" && (
            <div className="text-sm text-on-parchment">
              ציון: <span className="font-mono font-bold" dir="ltr">{Math.round(score)}%</span>
            </div>
          )}
          <div className="text-sm text-on-parchment">🔥 רצף: <span className="font-mono font-bold" dir="ltr">{streak}</span></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onReplay} className="card rounded-xl py-3 font-bold text-on-parchment">🔁 עוד סבב</button>
          <button onClick={onBack}   className="gold-btn rounded-xl py-3 font-bold">🏠 לעמוד הבית</button>
        </div>
      </div>
    );
  }

  // --- main component --------------------------------------------------------
  function DailyChallenge(props){
    const S        = (props && props.S) || {};
    const update   = props && props.update;
    const setRoute = props && props.setRoute;
    const awardXP  = props && props.awardXP;

    const today = useMemo(() => ilDay(), []);
    const pick  = useMemo(() => pickForDate(today), [today]);

    const [completions, setCompletions] = useState(() => loadCompletions());
    const alreadyToday = !!completions[today];
    const streak = useMemo(() => streakFrom(completions, today), [completions, today]);

    const [phase, setPhase] = useState("intro");
    const [lastScore, setLastScore] = useState(null);

    const questions = useMemo(() => {
      if (!pick) return [];
      const all = filteredQuestions(pick.type, pick.id);
      const shuffled = all.slice();
      // Shuffle deterministically per (date,entity) so repeats mid-day stay stable.
      const seed = hashStr(today + ":" + pick.type + ":" + pick.id);
      let s = seed || 1;
      for (let i = shuffled.length - 1; i > 0; i--) {
        s = (s * 1664525 + 1013904223) >>> 0;
        const j = s % (i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled.slice(0, QUESTIONS_PER_RUN);
    }, [pick, today]);

    const start = useCallback(() => {
      if (!pick) return;
      try { window.dispatchEvent(new CustomEvent("practice-entity", { detail: { type: pick.type, id: pick.id } })); } catch {}
      setPhase("running");
    }, [pick]);

    const onComplete = useCallback((payload) => {
      const score = (payload && typeof payload.score === "number")
        ? payload.score
        : (payload && payload.total ? (100 * (payload.correct||0) / payload.total) : null);
      setLastScore(score);
      const next = saveCompletion(today, {
        ok: true,
        score,
        entity: pick ? { type: pick.type, id: pick.id } : null,
        ts: Date.now()
      });
      setCompletions(next);
      if (awardXP) { try { awardXP(15); } catch {} }
      setPhase("done");
    }, [today, pick, awardXP]);

    if (phase === "running") {
      const Engine = window.QuizEngineComponent;
      if (!Engine) {
        return (
          <div className="max-w-xl mx-auto p-6 text-center text-on-parchment-muted">
            טוען את מנוע החידון...
          </div>
        );
      }
      if (questions.length === 0) {
        return (
          <div className="max-w-xl mx-auto p-6 text-center text-on-parchment-muted">
            אין שאלות מתאימות לישות של היום. <button onClick={()=>setPhase("intro")} className="underline">חזור</button>
          </div>
        );
      }
      return (
        <div className="max-w-2xl mx-auto p-3 space-y-3">
          <div className="text-xs text-on-parchment-muted hebrew">☀️ אתגר היום · {QUESTIONS_PER_RUN} שאלות</div>
          <Engine
            questions={questions}
            mode="daily"
            S={S}
            update={update}
            setRoute={setRoute}
            onComplete={onComplete}
          />
        </div>
      );
    }

    if (phase === "done") {
      return <DoneCard
        pick={pick}
        score={lastScore}
        streak={streakFrom(completions, today)}
        onBack={()=>setRoute && setRoute({page:"home"})}
        onReplay={()=>setPhase("running")}
      />;
    }

    return <Intro
      today={today}
      pick={pick}
      streak={streak}
      alreadyToday={alreadyToday}
      onStart={start}
      onReplay={start}
    />;
  }

  if (typeof window !== "undefined") window.DailyChallenge = DailyChallenge;
})();
