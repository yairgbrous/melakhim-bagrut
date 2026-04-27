/* =========================================================================
   UnitPage — /#/unit/:N
   Three tabs:
     לימוד    — full deep summary from window.UNIT_DEEP_SUMMARIES (intro
                paragraph, turning points, significance, breadth themes,
                recurring items).
     תרגול    — review questions for the unit, one at a time, with hints
                and reveal of the model answer points.
     מבחן     — 10 random questions, scored, with a results screen.

   Sidebar: "🔗 קשרים ליחידה" — 8-12 EntityLink chips of kings, characters,
   events, and places that match the unit. We use unit.related_* fields
   when present; otherwise we derive from era/keyword/chapter heuristics
   so the sidebar populates even before the data files grow new fields.

   Progress: each tab persists to localStorage as
       jarvis.melakhim.progress.unit{N}.{learn|practice|exam}
   storing { pct: number, ts: number, ... }, mirrored at the top of the
   page as three mini progress bars.

   Exposes: window.UnitPageComponent
   ========================================================================= */
(function(){
  const { useState, useMemo, useEffect, useCallback } = React;

  // -----------------------------------------------------------------
  // localStorage progress helpers — schema: jarvis.melakhim.progress.unit{N}.{tab}
  // -----------------------------------------------------------------
  const KEY = (n, tab) => "jarvis.melakhim.progress.unit" + n + "." + tab;

  function readPct(unitId, tab){
    try {
      const raw = localStorage.getItem(KEY(unitId, tab));
      if (!raw) return 0;
      const obj = JSON.parse(raw);
      const pct = +(obj && obj.pct);
      return Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) : 0;
    } catch (e) { return 0; }
  }
  function writePct(unitId, tab, pct, extra){
    try {
      const payload = Object.assign({ pct: Math.max(0, Math.min(100, pct)), ts: Date.now() }, extra || {});
      localStorage.setItem(KEY(unitId, tab), JSON.stringify(payload));
    } catch (e) {}
  }

  // -----------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------
  function findDeep(unitId){
    const arr = (typeof window !== "undefined" && Array.isArray(window.UNIT_DEEP_SUMMARIES)) ? window.UNIT_DEEP_SUMMARIES : [];
    return arr.find(u => +u.unit === +unitId) || null;
  }
  function findUnit(unitId){
    const md = (typeof MELAKHIM_DATA !== "undefined") ? MELAKHIM_DATA : null;
    if (md && Array.isArray(md.units)) return md.units.find(x => +x.id === +unitId) || null;
    return null;
  }
  function reviewQuestionsForUnit(unitId){
    const all = (typeof window !== "undefined" && Array.isArray(window.REVIEW_QUESTIONS)) ? window.REVIEW_QUESTIONS : [];
    return all.filter(q => +q.unit === +unitId);
  }

  // Build the connections list — union of the deep summary's
  // turning_points (kings/characters/events/places), the unit's
  // declared related_* (if any), plus an era-based fallback for kings.
  function connectionsForUnit(unitId, deep, unit){
    const idx = (typeof window !== "undefined" && window.__ENTITY_INDEX__) || {};
    const seen = { king: new Set(), character: new Set(), event: new Set(), place: new Set() };

    // 1. From deep summary turning points.
    (deep && deep.turning_points || []).forEach(tp => {
      (tp.participants || []).forEach(pid => {
        if (idx.king && idx.king[pid])           seen.king.add(pid);
        else if (idx.character && idx.character[pid]) seen.character.add(pid);
      });
      (tp.places || []).forEach(p => seen.place.add(p));
      (tp.events || []).forEach(e => seen.event.add(e));
    });

    // 2. Era-based fallback: every king whose .era matches the unit.
    if (Array.isArray(window.KINGS_DATA)) {
      window.KINGS_DATA.filter(k => +k.era === +unitId).forEach(k => seen.king.add(k.id));
    }

    // 3. Unit's hand-authored related_* if present.
    if (unit) {
      (unit.related_kings || []).forEach(x => seen.king.add(x));
      (unit.related_characters || []).forEach(x => seen.character.add(x));
      (unit.related_events || []).forEach(x => seen.event.add(x));
      (unit.related_places || []).forEach(x => seen.place.add(x));
    }

    return {
      kings:      Array.from(seen.king),
      characters: Array.from(seen.character),
      events:     Array.from(seen.event),
      places:     Array.from(seen.place)
    };
  }

  // Round-robin sample to keep all four types represented.
  function sampleConnections(conn, max){
    const groups = [
      { type: "king",      ids: conn.kings },
      { type: "character", ids: conn.characters },
      { type: "event",     ids: conn.events },
      { type: "place",     ids: conn.places }
    ];
    const out = [];
    const pos = groups.map(() => 0);
    let active = groups.filter(g => g.ids.length).length;
    while (out.length < max && active > 0) {
      active = 0;
      for (let gi = 0; gi < groups.length; gi++) {
        const g = groups[gi];
        if (pos[gi] >= g.ids.length) continue;
        out.push({ type: g.type, id: g.ids[pos[gi]] });
        pos[gi]++;
        if (pos[gi] < g.ids.length) active++;
        if (out.length >= max) return out;
      }
    }
    return out;
  }

  // Strip {{type:id|label}} bio tokens for plain rendering.
  function stripTokens(t){
    if (typeof t !== "string") return t || "";
    return t.replace(/\{\{[a-zA-Zא-ת_]+:[^|}]+\|([^}]+)\}\}/g, "$1");
  }

  // -----------------------------------------------------------------
  // Sub-components
  // -----------------------------------------------------------------
  function ProgressBar({ label, pct, color }){
    const p = Math.max(0, Math.min(100, +pct || 0));
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-on-parchment">{label}</span>
          <span className="text-on-parchment-muted" dir="ltr">{p}%</span>
        </div>
        <div style={{height:8, background:"rgba(212,165,116,.18)", borderRadius:999, overflow:"hidden"}}>
          <div style={{height:"100%", width:p+"%", background:color, transition:"width .3s ease"}}/>
        </div>
      </div>
    );
  }

  function Connections({ unitId, deep, unit, setRoute }){
    const conn = useMemo(() => connectionsForUnit(unitId, deep, unit), [unitId, deep, unit]);
    const total = conn.kings.length + conn.characters.length + conn.events.length + conn.places.length;
    if (total === 0) return null;
    const picked = sampleConnections(conn, 12);
    const EL = window.EntityLinkComponent;
    return (
      <section className="card rounded-2xl p-4">
        <h3 className="font-display text-base font-bold text-on-parchment mb-2">🔗 קשרים ליחידה</h3>
        <div className="flex flex-wrap gap-0">
          {EL && picked.map((c, i) => (
            <EL key={c.type+":"+c.id+":"+i} type={c.type} id={c.id} setRoute={setRoute}/>
          ))}
        </div>
      </section>
    );
  }

  function LearnTab({ deep, unit, unitId, setRoute, onComplete }){
    if (!deep) {
      return (
        <div className="card rounded-xl p-4 text-on-parchment-muted text-sm">
          סיכום מעמיק ליחידה זו טרם הוזן ל-<code>window.UNIT_DEEP_SUMMARIES</code>.
        </div>
      );
    }
    const turning = Array.isArray(deep.turning_points) ? deep.turning_points : [];
    return (
      <div className="space-y-4">
        <section className="parchment rounded-2xl p-5 md:p-6">
          <h2 className="font-display text-xl font-bold text-amber-900 mb-2">{deep.title}</h2>
          <p className="hebrew text-amber-950 leading-loose text-base">{stripTokens(deep.intro)}</p>
        </section>

        {turning.length > 0 && (
          <section className="card rounded-2xl p-4">
            <h3 className="font-display text-base font-bold text-on-parchment mb-2">🔑 נקודות מפנה</h3>
            <ol className="space-y-2 list-decimal pr-5 text-sm text-on-parchment hebrew">
              {turning.map((tp, i) => (
                <li key={i} className="leading-relaxed">{stripTokens(tp.fact)}</li>
              ))}
            </ol>
          </section>
        )}

        {deep.significance && (
          <section className="card rounded-2xl p-4">
            <h3 className="font-display text-base font-bold text-on-parchment mb-2">✨ משמעות לספר</h3>
            <p className="hebrew text-on-parchment-muted leading-relaxed">{stripTokens(deep.significance)}</p>
          </section>
        )}

        {Array.isArray(deep.breadth_themes) && deep.breadth_themes.length > 0 && (
          <section className="card rounded-2xl p-4">
            <h3 className="font-display text-base font-bold text-on-parchment mb-2">🌐 נושאי רוחב</h3>
            <div className="flex flex-wrap gap-0">
              {window.EntityLinkComponent && deep.breadth_themes.map(b =>
                <window.EntityLinkComponent key={b} type="breadth" id={b} setRoute={setRoute}/>
              )}
            </div>
          </section>
        )}

        {Array.isArray(deep.recurring_items) && deep.recurring_items.length > 0 && (
          <section className="card rounded-2xl p-4">
            <h3 className="font-display text-base font-bold text-on-parchment mb-2">🔁 פריטים חוזרים</h3>
            <div className="flex flex-wrap gap-0">
              {window.EntityLinkComponent && deep.recurring_items.map(r =>
                <window.EntityLinkComponent key={r} type="recurringItem" id={r} setRoute={setRoute}/>
              )}
            </div>
          </section>
        )}

        <button
          onClick={onComplete}
          className="gold-btn w-full py-3 rounded-xl text-base font-bold">
          ✅ סמן כנלמד
        </button>
      </div>
    );
  }

  function PracticeTab({ unitId, setRoute, onProgress }){
    const all = useMemo(() => reviewQuestionsForUnit(unitId), [unitId]);
    const [i, setI] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [seen, setSeen] = useState(new Set());

    if (all.length === 0) {
      return (
        <div className="card rounded-xl p-4 text-on-parchment-muted text-sm">
          אין שאלות תרגול ליחידה זו. ודא ש-<code>data/review-questions.js</code> נטען.
        </div>
      );
    }

    const q = all[i];
    const goNext = () => {
      const nextSeen = new Set(seen); nextSeen.add(q.id);
      setSeen(nextSeen);
      setRevealed(false);
      setI((i + 1) % all.length);
      const pct = Math.round((nextSeen.size / all.length) * 100);
      onProgress && onProgress(pct, { lastQuestionId: q.id, seen: Array.from(nextSeen) });
    };

    const seenCount = seen.size;
    const pct = Math.round((seenCount / all.length) * 100);
    const EL = window.EntityLinkComponent;

    return (
      <div className="space-y-4 unit-page-polish">
        <div className="flex items-center justify-between text-xs text-on-parchment-muted">
          <span>שאלה <span dir="ltr">{i + 1}</span> מתוך <span dir="ltr">{all.length}</span></span>
          <span>נצפו: <span dir="ltr">{seenCount}</span> ({pct}%)</span>
        </div>
        <section className="parchment rounded-2xl p-5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-700 text-amber-100 font-bold">{q.type || "שאלה"}</span>
            <span className="text-xs text-amber-900 font-bold">{q.difficulty || ""}</span>
          </div>
          <p className="hebrew text-amber-950 leading-loose text-base">{q.prompt_niqqud || q.prompt}</p>
        </section>

        {!revealed && (
          <button onClick={() => setRevealed(true)} className="gold-btn w-full py-3 rounded-xl text-base font-bold">
            🔎 גלה תשובה
          </button>
        )}

        {revealed && (
          <section className="card rounded-2xl p-4">
            <h4 className="text-xs font-bold text-on-parchment-accent mb-2">נקודות בתשובה הצפויה</h4>
            <ul className="space-y-1.5 text-sm text-on-parchment hebrew list-disc pr-5">
              {(q.answer_points || []).map((p, j) => <li key={j}>{p}</li>)}
            </ul>
            {Array.isArray(q.related_entities) && q.related_entities.length > 0 && EL && (
              <div className="mt-3 pt-3 border-t border-amber-700/30">
                <div className="text-xs font-bold text-on-parchment-accent mb-1.5">🔗 ישויות קשורות</div>
                <div className="flex flex-wrap gap-0">
                  {q.related_entities.map((tag, k) => {
                    const [t, id] = String(tag).split(":");
                    const type = t === "char" ? "character" : t;
                    return id ? <EL key={k} type={type} id={id} setRoute={setRoute}/> : null;
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        <button onClick={goNext} className="card rounded-xl p-3 w-full text-center text-on-parchment-accent font-bold hover:scale-[1.01] transition">
          ← השאלה הבאה
        </button>
      </div>
    );
  }

  function shuffle(arr){
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function ExamTab({ unitId, setRoute, onComplete }){
    const pool = useMemo(() => reviewQuestionsForUnit(unitId), [unitId]);
    const [run, setRun] = useState(null); // {questions:[], answers:[], i, done}

    const start = () => {
      const qs = shuffle(pool).slice(0, Math.min(10, pool.length));
      setRun({ questions: qs, answers: qs.map(() => null), i: 0, done: false });
    };

    if (pool.length === 0) {
      return (
        <div className="card rounded-xl p-4 text-on-parchment-muted text-sm">
          אין שאלות מבחן ליחידה זו. ודא ש-<code>data/review-questions.js</code> נטען.
        </div>
      );
    }
    if (!run) {
      return (
        <div className="space-y-3">
          <div className="card rounded-2xl p-4">
            <h3 className="font-display text-base font-bold text-on-parchment mb-1">📝 מבחן יחידה</h3>
            <p className="text-sm text-on-parchment-muted">10 שאלות אקראיות מבנק יחידה זו. בכל שאלה — דרג את עצמך לאחר חשיפת התשובה.</p>
          </div>
          <button onClick={start} className="gold-btn w-full py-3 rounded-xl text-base font-bold">⚔️ התחל מבחן</button>
        </div>
      );
    }
    if (run.done) {
      const correct = run.answers.filter(a => a === true).length;
      const pct = Math.round((correct / run.questions.length) * 100);
      onComplete && onComplete(pct, { score: correct, total: run.questions.length });
      return (
        <div className="space-y-3">
          <section className="parchment rounded-2xl p-5 text-center">
            <div className="font-display text-2xl font-bold text-amber-900 mb-1">תוצאה</div>
            <div className="font-display text-4xl font-black text-amber-900" dir="ltr">{correct} / {run.questions.length}</div>
            <div className="text-amber-950 text-sm mt-1" dir="ltr">{pct}%</div>
          </section>
          <button onClick={start} className="gold-btn w-full py-3 rounded-xl text-base font-bold">🔁 מבחן חדש</button>
          <button onClick={() => setRun(null)} className="card rounded-xl p-3 w-full text-on-parchment-accent font-bold">→ חזרה</button>
        </div>
      );
    }

    const q = run.questions[run.i];
    const grade = (correct) => {
      const next = run.answers.slice();
      next[run.i] = correct;
      const ni = run.i + 1;
      if (ni >= run.questions.length) setRun({ ...run, answers: next, done: true });
      else                            setRun({ ...run, answers: next, i: ni });
    };

    return (
      <div className="space-y-3">
        <div className="text-xs text-on-parchment-muted text-center">
          שאלה <span dir="ltr">{run.i + 1}</span> מתוך <span dir="ltr">{run.questions.length}</span>
        </div>
        <section className="parchment rounded-2xl p-5">
          <p className="hebrew text-amber-950 leading-loose">{q.prompt_niqqud || q.prompt}</p>
        </section>
        <details className="card rounded-2xl p-4">
          <summary className="cursor-pointer font-bold text-on-parchment-accent">🔎 גלה תשובה צפויה</summary>
          <ul className="mt-2 space-y-1.5 text-sm text-on-parchment hebrew list-disc pr-5">
            {(q.answer_points || []).map((p, j) => <li key={j}>{p}</li>)}
          </ul>
        </details>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => grade(false)}
            className="card rounded-xl p-3 text-center font-bold border border-red-500/40 text-red-200 hover:scale-[1.01] transition">
            ❌ לא ידעתי
          </button>
          <button onClick={() => grade(true)}
            className="card rounded-xl p-3 text-center font-bold border border-emerald-500/40 text-emerald-200 hover:scale-[1.01] transition">
            ✅ ידעתי
          </button>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // Top-level UnitPage
  // -----------------------------------------------------------------
  function UnitPage(props){
    const unitId = props && props.unitId;
    const setRoute = (props && props.setRoute) || (typeof window !== "undefined" ? (window.__appSetRoute__ || window.__setRoute) : null);

    const deep = useMemo(() => findDeep(unitId), [unitId]);
    const unit = useMemo(() => findUnit(unitId), [unitId]);
    const [tab, setTab] = useState("learn");

    const [pct, setPct] = useState({
      learn:    readPct(unitId, "learn"),
      practice: readPct(unitId, "practice"),
      exam:     readPct(unitId, "exam")
    });
    useEffect(() => {
      setPct({
        learn:    readPct(unitId, "learn"),
        practice: readPct(unitId, "practice"),
        exam:     readPct(unitId, "exam")
      });
    }, [unitId]);

    const updatePct = useCallback((key, value, extra) => {
      writePct(unitId, key, value, extra);
      setPct(prev => Object.assign({}, prev, { [key]: Math.max(prev[key] || 0, value) }));
    }, [unitId]);

    if (!unitId) {
      return <div className="text-on-parchment-muted text-sm p-4">חסר מזהה יחידה.</div>;
    }

    const headerColor = ({1:"#D4A574",2:"#A83240",3:"#3E8E7E",4:"#6B5B95",5:"#8B4513",6:"#2C3E50"})[unitId] || "#D4A574";
    const title = (deep && deep.title) || (unit && unit.title) || ("יחידה " + unitId);

    return (
      <div className="max-w-3xl mx-auto space-y-4 p-2">
        <button onClick={() => setRoute && setRoute({ page: "path" })} className="text-on-parchment-accent text-sm">→ חזרה למסלול</button>

        <header className="card rounded-2xl p-5" style={{borderColor: headerColor + "55"}}>
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold px-2.5 py-0.5 rounded-full inline-block mb-2" style={{background: headerColor, color:"#fff"}}>
                יחידה <span dir="ltr">{unitId}</span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-on-parchment">{title}</h1>
              {unit && unit.subtitle && <p className="text-sm text-on-parchment-muted mt-1">{unit.subtitle}</p>}
              {unit && unit.range && <p className="text-xs text-on-parchment-muted mt-1 font-mono">{unit.range}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <ProgressBar label="לימוד"   pct={pct.learn}    color="#3E8E7E"/>
            <ProgressBar label="תרגול"   pct={pct.practice} color="#D4A574"/>
            <ProgressBar label="מבחן"    pct={pct.exam}     color="#A83240"/>
          </div>
        </header>

        <Connections unitId={unitId} deep={deep} unit={unit} setRoute={setRoute}/>

        <div role="tablist" className="grid grid-cols-3 gap-2">
          {[
            { id: "learn",    label: "📖 לימוד" },
            { id: "practice", label: "🔁 תרגול" },
            { id: "exam",     label: "📝 מבחן"  }
          ].map(t => (
            <button key={t.id} role="tab" aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={"px-3 py-2 rounded-xl text-sm font-bold border transition " +
                (tab === t.id
                  ? "tab-active border-amber-500"
                  : "card border-amber-700/30 text-on-parchment hover:scale-[1.01]")
              }>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "learn" && (
          <LearnTab
            deep={deep} unit={unit} unitId={unitId} setRoute={setRoute}
            onComplete={() => updatePct("learn", 100, { completedAt: Date.now() })}
          />
        )}
        {tab === "practice" && (
          <PracticeTab
            unitId={unitId} setRoute={setRoute}
            onProgress={(p, extra) => updatePct("practice", p, extra)}
          />
        )}
        {tab === "exam" && (
          <ExamTab
            unitId={unitId} setRoute={setRoute}
            onComplete={(p, extra) => updatePct("exam", p, extra)}
          />
        )}
      </div>
    );
  }

  if (typeof window !== "undefined") window.UnitPageComponent = UnitPage;
})();
