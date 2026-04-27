/* =========================================================================
   UnitPage — /#/unit/:N (N=1..6) · study · practice · test
   ---------------------------------------------------------------------------
   HERO:        number · title_niqqud · chapter range · time estimate
   TABS:        לימוד (deep summary) · תרגול (25 review questions) · מבחן (10q)
   SIDEBAR:     related kings · events · places · breadth-topics as chips
   PROGRESS:    per-tab bar; persists to localStorage key
                jarvis.melakhim.progress.unit{N}
   CTA:         הבא → navigates /#/unit/{N+1}
   Exposes:     window.UnitPageComponent
   ========================================================================= */
(function(){
  const { useMemo, useState, useEffect } = React;

  // ---- Unit metadata (chapter ranges, time estimates, titles override) ---
  const UNIT_META = {
    1: { title:"מַלְכוּת שְׁלֹמֹה",             chapters:"מל״א א–יא",   minutes:120 },
    2: { title:"פִּילוּג הַמַּמְלָכָה",         chapters:"מל״א יב–טז",  minutes:90  },
    3: { title:"בֵּית עָמְרִי וּמַחְזוֹר אֵלִיָּהוּ", chapters:"מל״א יז–כב",  minutes:150 },
    4: { title:"מַחְזוֹר אֱלִישָׁע וּמֶרֶד יֵהוּא",   chapters:"מל״ב א–יג",   minutes:150 },
    5: { title:"חֻרְבַּן שֹׁמְרוֹן וּמַלְכֵי יְהוּדָה", chapters:"מל״ב יד–כ",   minutes:120 },
    6: { title:"יֹאשִׁיָּהוּ וְחֻרְבַּן הַבַּיִת",   chapters:"מל״ב כא–כה",  minutes:150 },
  };

  function progressKey(n){ return `jarvis.melakhim.progress.unit${n}`; }
  function loadProgress(n){
    try {
      const raw = localStorage.getItem(progressKey(n));
      if (!raw) return { study:0, practice:0, test:0 };
      const j = JSON.parse(raw);
      return { study: j.study||0, practice: j.practice||0, test: j.test||0 };
    } catch { return { study:0, practice:0, test:0 }; }
  }
  function saveProgress(n, p){
    try {
      localStorage.setItem(progressKey(n), JSON.stringify(p));
      localStorage.setItem("jarvis.melakhim.currentUnit", String(n));
    } catch {}
  }

  // ---- aggregate related entity ids from turning_points -------------------
  function aggregateIds(unit){
    const tps = (unit && unit.turning_points) || [];
    const bag = { chars:new Set(), places:new Set(), events:new Set() };
    tps.forEach(tp => {
      (tp.participants || []).forEach(x => bag.chars.add(x));
      (tp.places || []).forEach(x => bag.places.add(x));
      (tp.events || []).forEach(x => bag.events.add(x));
    });
    return {
      chars:  [...bag.chars],
      places: [...bag.places],
      events: [...bag.events],
      breadth: (unit && (unit.breadth_themes || unit.related_breadth)) || [],
      recurring: (unit && unit.recurring_items) || [],
    };
  }

  // ---- tiny chip helpers --------------------------------------------------
  function Chip({ type, id, label, setRoute }){
    const EL = window.EntityLinkComponent;
    if (!EL) return <span className="kt-chip">{label || id}</span>;
    return <EL type={type} id={id} label={label} setRoute={setRoute}/>;
  }
  function ChipGroup({ title, ids, type, setRoute }){
    if (!Array.isArray(ids) || !ids.length) return null;
    return (
      <div>
        <div className="text-xs text-on-parchment-muted mb-1 hebrew">{title}</div>
        <div className="flex flex-wrap gap-0">
          {ids.map((raw,i) => {
            const id = typeof raw === "string" ? raw : (raw && raw.id);
            if (!id) return null;
            return <Chip key={i+":"+id} type={type} id={id} setRoute={setRoute}/>;
          })}
        </div>
      </div>
    );
  }

  // ---- progress bar -------------------------------------------------------
  function ProgressBar({ value }){
    const pct = Math.max(0, Math.min(100, Math.round(value||0)));
    return (
      <div className="w-full h-2 bg-amber-500/10 rounded-full overflow-hidden">
        <div className="h-full transition-all duration-500"
             style={{ width: `${pct}%`, background:"linear-gradient(90deg, #d97706, #f59e0b)" }}/>
      </div>
    );
  }

  // ---- tab content --------------------------------------------------------
  function StudyTab({ unit, progress, onAdvance }){
    if (!unit) return <div className="p-6 text-on-parchment-muted hebrew">אין סיכום ליחידה זו.</div>;
    const tps = unit.turning_points || [];
    const [read, setRead] = useState(Math.floor((progress||0)/100 * tps.length));
    useEffect(() => { onAdvance((read / Math.max(1,tps.length)) * 100); }, [read]);
    return (
      <div className="space-y-4">
        {unit.intro && (
          <section className="parchment rounded-2xl p-5">
            <h3 className="font-display text-base font-bold text-amber-900 mb-2 hebrew">📖 פתיחה</h3>
            <p className="hebrew text-amber-950 leading-relaxed">{stripTokens(unit.intro)}</p>
          </section>
        )}
        {tps.length > 0 && (
          <section className="card rounded-2xl p-4 md:p-5">
            <h3 className="font-display text-base font-bold text-on-parchment-accent mb-3 hebrew">⚡ נקודות מפנה</h3>
            <ol className="space-y-3">
              {tps.map((tp,i) => (
                <li key={i} className={`hebrew border-r-4 pr-3 py-2 ${i < read ? "border-emerald-500/70 opacity-100" : "border-amber-500/40 opacity-90"}`}>
                  <div className="text-sm text-on-parchment">{tp.fact}</div>
                </li>
              ))}
            </ol>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-on-parchment-muted hebrew">{read}/{tps.length} נקודות</div>
              <div className="flex gap-2">
                <button onClick={()=>setRead(Math.max(0, read-1))}
                  className="px-3 py-1 text-xs rounded border border-amber-500/40 text-on-parchment">← חזור</button>
                <button onClick={()=>setRead(Math.min(tps.length, read+1))}
                  className="gold-btn px-3 py-1 text-xs rounded font-bold">סמן כקראתי →</button>
              </div>
            </div>
          </section>
        )}
        {unit.significance && (
          <section className="card rounded-2xl p-4 md:p-5">
            <h3 className="font-display text-base font-bold text-on-parchment-accent mb-2 hebrew">✨ משמעות</h3>
            <p className="hebrew text-on-parchment leading-relaxed">{stripTokens(unit.significance)}</p>
          </section>
        )}
      </div>
    );
  }

  function stripTokens(t){
    if (typeof t !== "string") return t || "";
    return t.replace(/\{\{[a-zA-Zא-ת_]+:[^|}]+\|([^}]+)\}\}/g, "$1");
  }

  function PracticeTab({ unitN, progress, onAdvance, setRoute }){
    const questions = useMemo(() => {
      const all = (window.REVIEW_QUESTIONS_DATA || window.reviewQuestions || []);
      const pool = all.filter(q => q && (q.unit === unitN || (Array.isArray(q.units) && q.units.includes(unitN))));
      return pool.slice(0, 25);
    }, [unitN]);
    const [answered, setAnswered] = useState(Math.floor((progress||0)/100 * questions.length));
    useEffect(() => { onAdvance((answered / Math.max(1,questions.length)) * 100); }, [answered]);
    if (!questions.length) {
      return (
        <div className="card rounded-2xl p-6 text-center hebrew">
          <div className="text-3xl mb-2">📝</div>
          <div className="font-bold text-on-parchment-accent mb-2">אין עדיין שאלות תרגול ליחידה זו</div>
          <div className="text-sm text-on-parchment-muted">data/review-questions.js עדיין לא מסונן ליחידה {unitN}.</div>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {questions.map((q,i) => {
          const done = i < answered;
          const text = q.prompt || q.question || q.text || q.title || `שאלה ${i+1}`;
          return (
            <div key={q.id || i} className={`card rounded-xl p-4 hebrew ${done?"opacity-70":""}`}>
              <div className="text-xs text-on-parchment-muted mb-1">שאלה {i+1} / {questions.length}</div>
              <div className="text-on-parchment">{text}</div>
              {q.expected_answer_points && Array.isArray(q.expected_answer_points) && (
                <details className="mt-2">
                  <summary className="text-xs text-on-parchment-accent cursor-pointer">הצג תשובה מוסברת</summary>
                  <ul className="mt-2 list-disc pr-5 text-sm text-on-parchment-muted">
                    {q.expected_answer_points.map((p,j)=><li key={j}>{p}</li>)}
                  </ul>
                </details>
              )}
            </div>
          );
        })}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-on-parchment-muted hebrew">{answered}/{questions.length} תורגלו</div>
          <button onClick={()=>setAnswered(Math.min(questions.length, answered+1))}
            className="gold-btn px-4 py-2 text-sm rounded font-bold">סמן כתורגלה →</button>
        </div>
      </div>
    );
  }

  function TestTab({ unitN, progress, onAdvance, setRoute }){
    const questions = useMemo(() => {
      const all = (window.REVIEW_QUESTIONS_DATA || window.reviewQuestions || []);
      const pool = all.filter(q => q && (q.unit === unitN || (Array.isArray(q.units) && q.units.includes(unitN))));
      return pool.slice(0, 10);
    }, [unitN]);
    const onStart = () => {
      try { window.dispatchEvent(new CustomEvent("practice-entity", {detail:{type:"unit", id:`unit-${unitN}`, count:10}})); } catch {}
      onAdvance(Math.min(100, (progress||0)+10));
      if (setRoute) setRoute({ page:"quiz", hash:`unit/${unitN}` });
    };
    return (
      <div className="space-y-4">
        <section className="parchment rounded-2xl p-5 text-center">
          <div className="text-4xl mb-2">⚔️</div>
          <h3 className="font-display text-xl font-bold text-amber-900 hebrew">מבחן קצר · 10 שאלות</h3>
          <div className="text-sm text-amber-800 hebrew mt-1">{questions.length} שאלות זמינות ליחידה {unitN}</div>
          <button onClick={onStart}
            className="gold-btn mt-4 px-6 py-3 rounded-xl font-bold">התחל מבחן</button>
        </section>
        <div className="card rounded-xl p-4 hebrew text-sm text-on-parchment-muted">
          💡 המבחן יוצג בממשק QuizEngine; ציון יישמר והתקדמות היחידה תתעדכן אוטומטית.
        </div>
      </div>
    );
  }

  // ---- sticky header ------------------------------------------------------
  function StickyHeader({ n, setRoute }){
    const goBack = () => {
      try { if (window.history.length > 1) return window.history.back(); } catch {}
      if (setRoute) setRoute({ page: "home" });
    };
    return (
      <div className="sticky top-0 z-30 backdrop-blur bg-[var(--bg-surface,#0A1628)]/85 border-b border-amber-500/20 px-3 py-2 flex items-center justify-between">
        <nav className="text-xs md:text-sm hebrew text-on-parchment-muted truncate">
          <a href="#/home" className="hover:text-on-parchment-accent">ראשי</a>
          <span className="mx-2 opacity-60">›</span>
          <a href="#/study" className="hover:text-on-parchment-accent">לימוד</a>
          <span className="mx-2 opacity-60">›</span>
          <span className="text-on-parchment-accent font-bold">יחידה {n}</span>
        </nav>
        <button onClick={goBack}
          className="shrink-0 px-3 py-1.5 rounded-lg border border-amber-500/40 text-on-parchment-accent text-sm font-bold hover:bg-amber-500/10">
          ← חזור
        </button>
      </div>
    );
  }

  // ---- main component -----------------------------------------------------
  function UnitPage({ n, setRoute }){
    const unitN = Math.max(1, Math.min(6, parseInt(n, 10) || 1));
    const meta = UNIT_META[unitN];
    const unit = useMemo(() => {
      const arr = (window.UNIT_DEEP_SUMMARIES || window.unitDeepSummaries || []);
      return arr.find(u => u && u.unit === unitN) || null;
    }, [unitN]);
    const title = unit && unit.title ? unit.title : meta.title;

    const ids = useMemo(() => aggregateIds(unit), [unit]);

    const [progress, setProgress] = useState(() => loadProgress(unitN));
    useEffect(() => { saveProgress(unitN, progress); }, [unitN, progress]);
    // reset tab progress memory when unit changes
    useEffect(() => { setProgress(loadProgress(unitN)); }, [unitN]);

    const [tab, setTab] = useState("study");

    const overall = Math.round((progress.study + progress.practice + progress.test) / 3);

    const next = unitN < 6 ? unitN + 1 : null;
    const prev = unitN > 1 ? unitN - 1 : null;

    const onStudyAdvance    = v => setProgress(p => ({ ...p, study:    Math.max(p.study, Math.round(v)) }));
    const onPracticeAdvance = v => setProgress(p => ({ ...p, practice: Math.max(p.practice, Math.round(v)) }));
    const onTestAdvance     = v => setProgress(p => ({ ...p, test:     Math.max(p.test, Math.round(v)) }));

    return (
      <div className="min-h-screen flex flex-col unit-page-polish">
        <StickyHeader n={unitN} setRoute={setRoute}/>

        <main className="max-w-5xl mx-auto w-full pb-24 px-3 md:px-5">
          {/* HERO */}
          <header className="pt-5 pb-4">
            <div className="text-xs text-on-parchment-muted mb-1 hebrew">יחידה</div>
            <div className="flex items-end gap-3 flex-wrap">
              <div className="font-display text-6xl md:text-7xl font-black text-on-parchment-accent leading-none">
                {unitN}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-2xl md:text-4xl font-black text-on-parchment-accent hebrew leading-tight"
                    style={{textShadow:"0 2px 8px rgba(200,155,60,.15)"}}>
                  {title}
                </h1>
                <div className="text-sm text-on-parchment mt-2 hebrew">
                  {meta.chapters} · ⏱ {meta.minutes} דקות · התקדמות כוללת {overall}%
                </div>
              </div>
            </div>
            <div className="mt-3"><ProgressBar value={overall}/></div>
          </header>

          {/* layout: body + sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            <div className="lg:col-span-2 space-y-4">
              {/* TABS */}
              <nav className="flex gap-1 border-b border-amber-500/20" role="tablist" aria-label="מצבי לימוד">
                {[
                  { id:"study",    label:"📖 לימוד",    value: progress.study },
                  { id:"practice", label:"📝 תרגול",    value: progress.practice },
                  { id:"test",     label:"⚔️ מבחן",    value: progress.test },
                ].map(t => (
                  <button key={t.id}
                    role="tab" aria-selected={tab===t.id}
                    onClick={()=>setTab(t.id)}
                    className={`px-4 py-2 text-sm hebrew font-bold transition flex items-center gap-2 ${
                      tab===t.id
                        ? "border-b-2 border-amber-500 text-on-parchment-accent"
                        : "text-on-parchment-muted hover:text-on-parchment"
                    }`}>
                    <span>{t.label}</span>
                    <span className="text-[10px] opacity-70">{t.value}%</span>
                  </button>
                ))}
              </nav>

              <div className="space-y-4" role="tabpanel">
                {tab==="study"    && <StudyTab    unit={unit}   progress={progress.study}    onAdvance={onStudyAdvance}/>}
                {tab==="practice" && <PracticeTab unitN={unitN} progress={progress.practice} onAdvance={onPracticeAdvance} setRoute={setRoute}/>}
                {tab==="test"     && <TestTab     unitN={unitN} progress={progress.test}     onAdvance={onTestAdvance}     setRoute={setRoute}/>}
              </div>

              {/* prev / next */}
              <div className="flex items-center justify-between pt-4 border-t border-amber-500/20">
                {prev ? (
                  <a href={`#/unit/${prev}`} className="px-4 py-2 rounded-lg border border-amber-500/40 text-on-parchment hebrew text-sm">
                    ← יחידה {prev}
                  </a>
                ) : <span/>}
                {next ? (
                  <a href={`#/unit/${next}`} className="gold-btn px-5 py-3 rounded-xl font-bold hebrew">
                    הבא → יחידה {next}
                  </a>
                ) : (
                  <span className="text-sm text-on-parchment-muted hebrew">🎉 סיימת את כל היחידות</span>
                )}
              </div>
            </div>

            {/* SIDEBAR */}
            <aside className="lg:col-span-1 space-y-4">
              <section className="card rounded-2xl p-4">
                <h3 className="font-display text-base font-bold text-on-parchment-accent mb-3 hebrew">🔗 קשרים ליחידה</h3>
                <div className="space-y-3">
                  <ChipGroup title="👑 מלכים"           ids={ids.chars.filter(c => isKingId(c))} type="king"      setRoute={setRoute}/>
                  <ChipGroup title="👤 דמויות"          ids={ids.chars.filter(c => !isKingId(c))} type="character" setRoute={setRoute}/>
                  <ChipGroup title="⚔️ אירועים"         ids={ids.events}    type="event"     setRoute={setRoute}/>
                  <ChipGroup title="📍 מקומות"          ids={ids.places}    type="place"     setRoute={setRoute}/>
                  <ChipGroup title="🌐 נושאי רוחב"      ids={ids.breadth}   type="breadth"   setRoute={setRoute}/>
                  <ChipGroup title="🔁 פריטים חוזרים"   ids={ids.recurring} type="recurring" setRoute={setRoute}/>
                </div>
              </section>
              <section className="card rounded-2xl p-4 hebrew text-sm">
                <h3 className="font-display text-base font-bold text-on-parchment-accent mb-2">📊 התקדמות</h3>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span>📖 לימוד</span><span>{progress.study}%</span></div>
                    <ProgressBar value={progress.study}/>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span>📝 תרגול</span><span>{progress.practice}%</span></div>
                    <ProgressBar value={progress.practice}/>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span>⚔️ מבחן</span><span>{progress.test}%</span></div>
                    <ProgressBar value={progress.test}/>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>
    );
  }

  // quick heuristic: if id is in window.KINGS_DATA / kings sandbox, treat as king
  function isKingId(id){
    const ks = window.KINGS_DATA;
    if (Array.isArray(ks) && ks.some(k => k && k.id === id)) return true;
    // fallback: id matches known king-name pattern from kings.js
    const knownKings = ["shlomo","rehavam","aviyam","asa","yehoshafat","yoram_yehuda","achaziah_yehuda","atalyah_char",
      "yehoash_yehuda","amatzya","uziyahu","yotam","achaz","chizkiyahu","menashe","amon","yoshiyahu",
      "yehoachaz_yehuda","yehoyakim","yehoyachin","tzidkiyahu","yarovam","nadav","basha","ela","zimri",
      "omri","achav","achaziah_yisrael","yoram_yisrael","yehu","yehoachaz_yisrael","yoash_yisrael",
      "yarovam_beit","zacharia","shalum","menachem","pekachya","pekach","hoshea"];
    return knownKings.includes(id);
  }

  if (typeof window !== "undefined") window.UnitPageComponent = UnitPage;
})();
