/* =========================================================================
   QuizEngine — unified practice component for the 6 authentic book question
   types (per חוברת_מלכים.pdf · משרד החינוך · מיקוד תשפ"ו):
     1. short_answer        — שאלה קצרה / פתוחה
     2. mi_amar_lemi        — מי אמר למי ובאיזה הקשר
     3. be_eize_hekhsher    — באיזה הקשר נאמר/מוזכר
     4. al_mi_neemar        — על מי נאמר הפסוק
     5. character_details   — ציינו X פרטים על הדמות
     6. place_events        — מה קרה במקום

   Props: { questions, mode, duration?, S, update, setRoute, onComplete }
     - questions: array of authentic Q objects (see schema below)
     - mode: "fast" | "unit" | "big" | "flashcard" | "entity" | "lobby"
     - duration: optional seconds (big mode)

   Persists progress → localStorage["jarvis.quiz.{mode}.progress"]
   Self-grading → S.reviewScores[qid] = "know" | "partial" | "dont"
   Listens: window 'practice-entity' → filter by entity id
   Exposes: window.QuizEngineComponent
   ========================================================================= */
(function(){
  const { useState, useEffect, useMemo, useRef, useCallback } = React;

  const TYPE_LABEL = {
    short_answer:      "שאלה קצרה",
    mi_amar_lemi:      "מי אמר למי",
    be_eize_hekhsher:  "באיזה הקשר",
    al_mi_neemar:      "על מי נאמר",
    character_details: "פרטים על הדמות",
    place_events:      "אירועים במקום"
  };

  const GRADE_META = {
    know:    { icon:"✅", label:"היה לי",    color:"#059669" },
    partial: { icon:"⚠",  label:"חלקית",     color:"#D4A574" },
    dont:    { icon:"❌", label:"לא ידעתי",  color:"#A83240" }
  };

  function progressKey(mode){ return `jarvis.quiz.${mode||"default"}.progress`; }

  function loadProgress(mode){
    try { const r = localStorage.getItem(progressKey(mode)); return r ? JSON.parse(r) : {}; }
    catch { return {}; }
  }
  function saveProgress(mode, p){
    try { localStorage.setItem(progressKey(mode), JSON.stringify(p)); } catch {}
  }

  function fy(arr){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

  // Entity matcher: question filtered by entity_id / character / place / event tag
  function matchesEntity(q, ent){
    if (!ent || !ent.id) return true;
    const hay = [
      q.entity_id, q.character_id, q.place_id, q.event_id,
      q.character, q.place, q.speaker, q.about,
      Array.isArray(q.tags) ? q.tags.join(" ") : "",
      q.prompt || ""
    ].filter(Boolean).join(" ").toLowerCase();
    const needle = String(ent.id).toLowerCase();
    return hay.indexOf(needle) >= 0;
  }

  // ---- sub-renderers per question type ----
  function RenderPrompt({ q }){
    const type = q.type || "short_answer";
    if (type === "mi_amar_lemi"){
      return (
        <div className="space-y-2">
          <div className="text-sm text-amber-800 font-bold">מי אמר למי ובאיזה הקשר?</div>
          <blockquote className="parchment-inset rounded-lg p-4 border-r-4 border-amber-700/60 hebrew text-amber-950 text-lg leading-relaxed" style={{background:"rgba(244,213,141,.3)"}}>
            "{q.quote || q.prompt}"
            {q.chapter && <div className="text-xs text-amber-800 mt-2">({q.chapter})</div>}
          </blockquote>
        </div>
      );
    }
    if (type === "be_eize_hekhsher"){
      return (
        <div className="space-y-2">
          <div className="text-sm text-amber-800 font-bold">באיזה הקשר מוזכר/נאמר?</div>
          <div className="inline-block px-3 py-2 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-900 font-bold hebrew text-lg">
            {q.phrase || q.prompt}
          </div>
        </div>
      );
    }
    if (type === "al_mi_neemar"){
      return (
        <div className="space-y-2">
          <div className="text-sm text-amber-800 font-bold">על מי נאמר?</div>
          <blockquote className="parchment-inset rounded-lg p-4 border-r-4 border-amber-700/60 hebrew text-amber-950 leading-relaxed" style={{background:"rgba(244,213,141,.3)"}}>
            "{q.verse || q.prompt}"
            {q.chapter && <div className="text-xs text-amber-800 mt-2">({q.chapter})</div>}
          </blockquote>
        </div>
      );
    }
    if (type === "character_details"){
      const n = q.details_count || 2;
      return (
        <div className="space-y-2">
          <div className="text-sm text-amber-800 font-bold">ציינו {n} פרטים על הדמות:</div>
          <div className="inline-block px-4 py-2 rounded-full bg-amber-700/20 text-amber-900 font-bold hebrew text-lg">
            {q.character || q.prompt}
          </div>
        </div>
      );
    }
    if (type === "place_events"){
      return (
        <div className="space-y-2">
          <div className="text-sm text-amber-800 font-bold">מה קרה במקום הבא?</div>
          <div className="inline-block px-4 py-2 rounded-full bg-emerald-700/20 text-emerald-900 font-bold hebrew text-lg">
            📍 {q.place || q.prompt}
          </div>
        </div>
      );
    }
    // short_answer (default)
    return (
      <div className="space-y-2">
        <div className="text-sm text-amber-800 font-bold">שאלה:</div>
        <div className="hebrew text-amber-950 text-lg leading-relaxed">{q.prompt}</div>
        {q.chapter && <div className="text-xs text-amber-800">({q.chapter})</div>}
      </div>
    );
  }

  function ExpectedAnswer({ q }){
    const pts = q.expected_answer_points || q.expected_points || (q.answer ? [q.answer] : []);
    return (
      <div className="rounded-lg p-4 mt-3" style={{background:"rgba(167,220,164,.15)", border:"1px solid rgba(16,120,48,.3)"}}>
        <div className="text-sm font-bold text-emerald-900 mb-2">📖 תשובה מצופה (מהספר):</div>
        {pts.length > 0 ? (
          <ul className="list-disc pr-5 space-y-1 text-sm text-emerald-950 hebrew leading-relaxed">
            {pts.map((p,i)=><li key={i}>{p}</li>)}
          </ul>
        ) : (
          <div className="text-sm text-emerald-950 hebrew">{q.answer || "ללא תשובה מצוינת במקור."}</div>
        )}
      </div>
    );
  }

  function QuestionCard({ q, idx, total, onSubmit, S }){
    const [value, setValue] = useState("");
    // mi_amar sub-fields
    const [speakerV, setSpeakerV] = useState("");
    const [addresseeV, setAddresseeV] = useState("");
    const [contextV, setContextV] = useState("");
    const [revealed, setRevealed] = useState(false);
    const [grade, setGrade] = useState(null);

    useEffect(()=>{
      setValue(""); setSpeakerV(""); setAddresseeV(""); setContextV("");
      setRevealed(false); setGrade(null);
    }, [q && q.id]);

    const isMiAmar = q.type === "mi_amar_lemi";

    const reveal = () => setRevealed(true);

    const submitGrade = (g) => {
      setGrade(g);
      onSubmit && onSubmit({ qid: q.id, grade: g, value, speakerV, addresseeV, contextV });
    };

    const footerChips = () => {
      const chips = [];
      if (q.unit) chips.push({label:`יחידה ${q.unit}`, key:"u"});
      if (q.chapter) chips.push({label:q.chapter, key:"c"});
      if (q.character) chips.push({label:`👤 ${q.character}`, key:"ch"});
      if (q.place) chips.push({label:`📍 ${q.place}`, key:"pl"});
      if (q.event) chips.push({label:`⚔️ ${q.event}`, key:"ev"});
      return chips;
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-on-parchment-accent font-bold">
            {idx+1}/{total}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-900 text-on-parchment-muted text-[10px] font-bold">
            {TYPE_LABEL[q.type] || "שאלה"}
          </span>
          {q.points && <span className="text-on-parchment-meta text-[10px]">{q.points} נק׳</span>}
        </div>

        <div className="parchment rounded-2xl p-5 md:p-6">
          <RenderPrompt q={q}/>

          {!revealed && (
            <div className="mt-4 space-y-2">
              {isMiAmar ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input value={speakerV} onChange={e=>setSpeakerV(e.target.value)} placeholder="מי אמר?"
                    className="px-3 py-2 rounded-lg bg-white/80 border border-amber-700/40 text-amber-950 hebrew"/>
                  <input value={addresseeV} onChange={e=>setAddresseeV(e.target.value)} placeholder="למי אמר?"
                    className="px-3 py-2 rounded-lg bg-white/80 border border-amber-700/40 text-amber-950 hebrew"/>
                  <input value={contextV} onChange={e=>setContextV(e.target.value)} placeholder="באיזה הקשר?"
                    className="px-3 py-2 rounded-lg bg-white/80 border border-amber-700/40 text-amber-950 hebrew"/>
                </div>
              ) : (
                <textarea value={value} onChange={e=>setValue(e.target.value)}
                  placeholder="כתוב את תשובתך כאן (1–3 משפטים)..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-white/80 border border-amber-700/40 text-amber-950 hebrew leading-relaxed"/>
              )}
              <button onClick={reveal} className="gold-btn w-full py-3 rounded-xl font-bold">
                🔍 הצג תשובה מצופה
              </button>
            </div>
          )}

          {revealed && (
            <>
              {isMiAmar && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div className="rounded-lg p-2 bg-white/40">
                    <div className="text-[10px] text-amber-800 font-bold">שלך · מי:</div>
                    <div className="text-amber-950 hebrew">{speakerV||"—"}</div>
                    <div className="text-[10px] text-emerald-800 font-bold mt-1">תקין:</div>
                    <div className="text-emerald-900 hebrew font-bold">{q.speaker||"—"}</div>
                  </div>
                  <div className="rounded-lg p-2 bg-white/40">
                    <div className="text-[10px] text-amber-800 font-bold">שלך · למי:</div>
                    <div className="text-amber-950 hebrew">{addresseeV||"—"}</div>
                    <div className="text-[10px] text-emerald-800 font-bold mt-1">תקין:</div>
                    <div className="text-emerald-900 hebrew font-bold">{q.addressee||"—"}</div>
                  </div>
                  <div className="rounded-lg p-2 bg-white/40">
                    <div className="text-[10px] text-amber-800 font-bold">שלך · הקשר:</div>
                    <div className="text-amber-950 hebrew text-xs">{contextV||"—"}</div>
                    <div className="text-[10px] text-emerald-800 font-bold mt-1">תקין:</div>
                    <div className="text-emerald-900 hebrew text-xs">{q.context||(q.expected_answer_points&&q.expected_answer_points[0])||"—"}</div>
                  </div>
                </div>
              )}
              {!isMiAmar && value && (
                <div className="mt-4 rounded-lg p-3 bg-white/40">
                  <div className="text-[10px] text-amber-800 font-bold">התשובה שלך:</div>
                  <div className="text-amber-950 hebrew text-sm">{value}</div>
                </div>
              )}
              <ExpectedAnswer q={q}/>

              <div className="mt-4">
                <div className="text-xs text-amber-900 font-bold mb-2">דרג את עצמך:</div>
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(GRADE_META).map(g => {
                    const m = GRADE_META[g];
                    const sel = grade === g;
                    return (
                      <button key={g} onClick={()=>submitGrade(g)}
                        className={`rounded-xl py-3 text-sm font-bold border-2 transition ${sel?"bg-amber-500/30 border-amber-400 text-amber-950":"bg-white/60 border-amber-700/30 text-amber-900 hover:bg-amber-500/10"}`}>
                        <div className="text-lg">{m.icon}</div>
                        <div className="text-xs">{m.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {footerChips().length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
            <span className="text-on-parchment-meta">קשור ל:</span>
            {footerChips().map(c => (
              <span key={c.key} className="px-2 py-0.5 rounded-full bg-amber-900/40 border border-amber-500/20 text-on-parchment">
                {c.label}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  function Results({ answered, questions, onRestart, onExit }){
    const counts = useMemo(()=>{
      const c = { know:0, partial:0, dont:0 };
      Object.values(answered).forEach(a => { if (c[a.grade]!==undefined) c[a.grade]++; });
      return c;
    }, [answered]);

    const byType = useMemo(()=>{
      const m = {};
      questions.forEach(q => {
        const t = q.type || "short_answer";
        m[t] = m[t] || { total:0, know:0, partial:0, dont:0 };
        m[t].total++;
        const a = answered[q.id];
        if (a && m[t][a.grade]!==undefined) m[t][a.grade]++;
      });
      return m;
    }, [answered, questions]);

    const weak = useMemo(()=>{
      return questions.filter(q => { const a = answered[q.id]; return a && a.grade === "dont"; });
    }, [answered, questions]);

    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="text-center py-4">
          <div className="text-6xl mb-2">📊</div>
          <h2 className="font-display text-2xl font-bold text-on-parchment-accent">סיכום תרגול</h2>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="card rounded-xl p-3">
            <div className="text-2xl">✅</div>
            <div className="font-bold text-emerald-400 text-xl" dir="ltr">{counts.know}</div>
            <div className="text-xs text-on-parchment">היה לי</div>
          </div>
          <div className="card rounded-xl p-3">
            <div className="text-2xl">⚠</div>
            <div className="font-bold text-on-parchment-accent text-xl" dir="ltr">{counts.partial}</div>
            <div className="text-xs text-on-parchment">חלקית</div>
          </div>
          <div className="card rounded-xl p-3">
            <div className="text-2xl">❌</div>
            <div className="font-bold text-red-400 text-xl" dir="ltr">{counts.dont}</div>
            <div className="text-xs text-on-parchment">לא ידעתי</div>
          </div>
        </div>

        <div className="card rounded-xl p-4">
          <h3 className="font-bold text-on-parchment mb-2">ביצוע לפי סוג שאלה:</h3>
          <div className="space-y-1.5 text-xs">
            {Object.entries(byType).map(([t, s])=>(
              <div key={t} className="flex items-center gap-2">
                <span className="flex-1 text-on-parchment-muted">{TYPE_LABEL[t] || t}</span>
                <span className="text-emerald-400">✓ <span dir="ltr">{s.know}</span></span>
                <span className="text-on-parchment-accent">⚠ <span dir="ltr">{s.partial}</span></span>
                <span className="text-red-400">✗ <span dir="ltr">{s.dont}</span></span>
                <span className="text-on-parchment-meta w-10 text-left" dir="ltr">/{s.total}</span>
              </div>
            ))}
          </div>
        </div>

        {weak.length > 0 && (
          <div className="card rounded-xl p-4 border border-red-600/40">
            <h3 className="font-bold text-red-300 mb-2">🎯 נקודות חלשות — חזור עליהן:</h3>
            <ul className="text-sm text-on-parchment-muted space-y-1.5 list-disc pr-5">
              {weak.slice(0,8).map(q => (
                <li key={q.id} className="hebrew">
                  {q.prompt || q.quote || q.phrase || q.character || q.place || q.verse}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button onClick={onRestart} className="gold-btn py-3 rounded-xl font-bold">🔁 שוב</button>
          <button onClick={onExit} className="card py-3 rounded-xl text-on-parchment">🏠 יציאה</button>
        </div>
      </div>
    );
  }

  function QuizEngine(props){
    const { questions:rawQuestions, mode = "fast", duration, S = {}, update, setRoute, onComplete } = props || {};
    const [entityFilter, setEntityFilter] = useState(null);

    // practice-entity bridge
    useEffect(() => {
      const handler = (e) => {
        if (e && e.detail && e.detail.id) setEntityFilter({ type:e.detail.type, id:e.detail.id });
      };
      window.addEventListener("practice-entity", handler);
      return () => window.removeEventListener("practice-entity", handler);
    }, []);

    const pool = useMemo(() => {
      const base = Array.isArray(rawQuestions) ? rawQuestions.slice() : [];
      if (entityFilter){
        const filtered = base.filter(q => matchesEntity(q, entityFilter));
        return filtered.length >= 3 ? filtered : base; // fallback to full pool if too narrow
      }
      return base;
    }, [rawQuestions, entityFilter]);

    const [seed] = useState(()=>Date.now());
    const questions = useMemo(()=>fy(pool), [pool, seed]);
    const [idx, setIdx] = useState(0);
    const [answered, setAnswered] = useState(() => loadProgress(mode));
    const [done, setDone] = useState(false);
    const [timeLeft, setTimeLeft] = useState(duration || 0);

    useEffect(() => { saveProgress(mode, answered); }, [answered, mode]);

    // timer (big mode)
    useEffect(() => {
      if (!duration || done) return;
      if (timeLeft <= 0) { setDone(true); return; }
      const t = setTimeout(() => setTimeLeft(x => x - 1), 1000);
      return () => clearTimeout(t);
    }, [timeLeft, duration, done]);

    const onSubmit = useCallback(({ qid, grade, value, speakerV, addresseeV, contextV }) => {
      setAnswered(prev => ({ ...prev, [qid]: { grade, value, speakerV, addresseeV, contextV, ts: Date.now() } }));
      // mirror into S.reviewScores
      if (update) {
        update(p => ({ ...p, reviewScores: { ...(p.reviewScores||{}), [qid]: grade } }));
      }
      if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
        if (grade === 'know')       window.showToast('✅ יפה! יודע', 'success');
        else if (grade === 'partial') window.showToast('⚠️ כמעט — חלקי', 'info');
        else if (grade === 'dont')  window.showToast('❌ נסמן לחזרה', 'error');
      }
    }, [update]);

    const next = () => {
      if (idx + 1 >= questions.length) setDone(true);
      else setIdx(i => i + 1);
    };

    const restart = () => {
      setAnswered({});
      saveProgress(mode, {});
      setIdx(0);
      setDone(false);
    };

    const exit = () => {
      if (onComplete) onComplete();
      else if (setRoute) setRoute({ page: "quiz" });
    };

    if (!questions.length){
      return (
        <div className="max-w-xl mx-auto py-8 text-center space-y-3">
          <div className="text-5xl">🔍</div>
          <p className="text-on-parchment">אין שאלות זמינות.</p>
          {entityFilter && (
            <button onClick={()=>setEntityFilter(null)} className="gold-btn px-4 py-2 rounded-lg">הסר סינון</button>
          )}
          <button onClick={exit} className="card px-4 py-2 rounded-lg text-on-parchment mr-2">חזרה</button>
        </div>
      );
    }

    if (done){
      return <Results answered={answered} questions={questions} onRestart={restart} onExit={exit}/>;
    }

    const q = questions[idx];
    const currentAnswered = !!(q && answered[q.id]);
    const progress = ((idx + (currentAnswered?1:0)) / questions.length) * 100;

    const mins = Math.floor(timeLeft/60), secs = timeLeft%60;

    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="sticky top-[108px] z-20 card rounded-xl p-3">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-bold text-on-parchment" dir="ltr">{idx+1}/{questions.length}</span>
            {duration > 0 && (
              <span className={`font-mono font-bold ${timeLeft<30?"text-red-400":"text-on-parchment"}`}>
                ⏱ {String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}
              </span>
            )}
            <div className="flex items-center gap-2 text-xs">
              {entityFilter && (
                <button onClick={()=>setEntityFilter(null)} className="text-on-parchment-accent underline">✕ סינון</button>
              )}
              <button onClick={exit} className="text-on-parchment-accent">יציאה</button>
            </div>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-l from-amber-300 to-amber-600 transition-all" style={{width:progress+"%"}}/>
          </div>
        </div>

        <QuestionCard q={q} idx={idx} total={questions.length} onSubmit={onSubmit} S={S}/>

        {currentAnswered && (
          <button onClick={next} className="gold-btn w-full py-3 rounded-xl font-bold">
            {idx+1 >= questions.length ? "🏁 סיום ותוצאה" : "שאלה הבאה ←"}
          </button>
        )}
      </div>
    );
  }

  if (typeof window !== "undefined") {
    window.QuizEngineComponent = QuizEngine;
  }
})();
