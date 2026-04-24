/* =========================================================================
   Home — homepage, mounts as window.HomeComponent.
   Sections (added incrementally): HERO → PROGRESS → QUICK ACTIONS → TODAY'S FOCUS → STATS.
   Props: S (session/user), setRoute, level, nextLv.
   Uses globals: MELAKHIM_DATA, EXAM_DATE, daysTo, QUESTIONS (all defined in index.html).
   ========================================================================= */
(function(){
  const { useState, useEffect, useMemo } = React;

  function heDays(d){ return d===0?'היום':d===1?'יום אחד':d===2?'יומיים':(d+' ימים'); }

  // ---- HERO SECTION ------------------------------------------------------
  function Hero({S, setRoute, dExam, currentUnit}){
    return (
      <section className="relative overflow-hidden rounded-3xl parchment p-5 md:p-8 hero-parchment">
        <div className="absolute top-0 left-0 text-[160px] opacity-[.05] select-none pointer-events-none leading-none">📜</div>
        <div className="relative text-center md:text-right md:flex md:items-center md:gap-6">
          <div className="flex-1">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 hero-countdown">
              ⏰ נותרו {heDays(dExam)} לבגרות · 30.4.2026
            </div>
            <h1 className="font-display text-2xl md:text-4xl font-black leading-tight text-on-parchment">
              שלום {S.name || 'יאיר'} {S.avatar || '👑'}
            </h1>
            <p className="text-on-parchment-muted text-sm md:text-base mt-1.5 font-medium">
              בגרות 2551 · ספר מלכים · י״א 5 יח״ל
            </p>
            {currentUnit && (
              <p className="text-on-parchment-muted text-xs md:text-sm mt-1 opacity-90">
                היחידה הנוכחית: <strong className="text-on-parchment">יחידה {currentUnit.num} · {currentUnit.title}</strong>
              </p>
            )}
          </div>
          <div className="mt-4 md:mt-0 md:shrink-0">
            <button
              onClick={()=>setRoute({page:"unit", unitId: (currentUnit && currentUnit.id) || 1})}
              className="gold-btn w-full md:w-auto md:px-10 py-4 rounded-2xl text-lg md:text-xl glow font-bold"
              aria-label="המשך מסלול">
              🗺 המשך מסלול ←
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ---- PROGRESS STRIP ----------------------------------------------------
  function ProgressStrip({units, S, setRoute, currentUnit}){
    if (!units || !units.length) return null;
    const pctFor = (u) => {
      const score = (S.quizScores||{})[u.id];
      if (typeof score === 'number') return Math.max(5, Math.min(100, score));
      return (u.id === (currentUnit && currentUnit.id)) ? 45 : 0;
    };
    const overallDone = units.filter(u => (S.quizScores||{})[u.id]).length;
    const overallPct = Math.round((overallDone / units.length) * 100);
    return (
      <section className="progress-strip-wrap">
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="font-display text-base md:text-lg font-bold text-on-parchment">🧭 התקדמות במסלול</h2>
          <span className="text-xs md:text-sm text-on-parchment-muted font-semibold">
            יחידה {currentUnit ? currentUnit.num : 'א'} · {overallPct}% סה״כ
          </span>
        </div>
        <div className="progress-strip-rail">
          {units.map(u => {
            const p = pctFor(u);
            const isCurrent = currentUnit && u.id === currentUnit.id;
            const done = p >= 100;
            return (
              <button key={u.id}
                onClick={()=>setRoute({page:'unit', unitId:u.id})}
                className={'progress-strip-node ' + (isCurrent?'current ':'') + (done?'done':'')}
                aria-label={'יחידה ' + u.num + ' · ' + u.title}>
                <span className="progress-strip-fill" style={{width: p+'%'}} aria-hidden="true"/>
                <span className="progress-strip-num">{u.num}</span>
                <span className="progress-strip-title">{u.title}</span>
                <span className="progress-strip-pct">{p}%</span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  // ---- QUICK ACTIONS ROW -------------------------------------------------
  function QuickAction({icon, title, subtitle, onClick, accent}){
    return (
      <button type="button" onClick={onClick}
        className={'quick-action-card ' + (accent || '')}
        aria-label={title}>
        <div className="quick-action-icon" aria-hidden="true">{icon}</div>
        <div className="quick-action-title">{title}</div>
        <div className="quick-action-sub">{subtitle}</div>
      </button>
    );
  }

  function QuickActions({setRoute}){
    const openBook = () => {
      const pool = (typeof window !== 'undefined' && window.__ENTITY_INDEX__ && window.__ENTITY_INDEX__.quote) || {};
      const quotes = Object.values(pool);
      if (quotes.length){
        const q = quotes[Math.floor(Math.random() * quotes.length)];
        setRoute({page:'quotes', focusId: q.id});
      } else {
        setRoute({page:'quotes'});
      }
    };
    return (
      <section className="quick-actions-wrap">
        <h2 className="font-display text-base md:text-lg font-bold text-on-parchment mb-2 px-1">⚡ פעולות מהירות</h2>
        <div className="quick-actions-grid">
          <QuickAction icon="⚡" title="חידון מהיר" subtitle="10 שאלות אקראיות"
            onClick={()=>setRoute({page:'quizPlay', mode:'quick'})} accent="qa-gold"/>
          <QuickAction icon="📝" title="סימולציה מלאה" subtitle="שעתיים · 100 נקודות"
            onClick={()=>setRoute({page:'exam'})} accent="qa-crimson"/>
          <QuickAction icon="☀️" title="אתגר היום" subtitle="שאלה אחת · פעם ביום"
            onClick={()=>setRoute({page:'quizPlay', mode:'daily'})} accent="qa-purple"/>
          <QuickAction icon="📖" title="פתיחת ספר" subtitle="ציטוט אקראי מהספר"
            onClick={openBook} accent="qa-emerald"/>
        </div>
      </section>
    );
  }

  // ---- TODAY'S FOCUS -----------------------------------------------------
  // Pulls weak areas from jarvis.quiz.* keys in localStorage.
  // Key convention: jarvis.quiz.miss.<entityType>.<entityId> → numeric miss count.
  function readWeakAreas(){
    const out = [];
    try{
      if (typeof localStorage === 'undefined') return out;
      for (let i = 0; i < localStorage.length; i++){
        const k = localStorage.key(i);
        if (!k || !k.startsWith('jarvis.quiz.miss.')) continue;
        const parts = k.split('.');
        if (parts.length < 5) continue;
        const type = parts[3];
        const id = parts.slice(4).join('.');
        const count = parseInt(localStorage.getItem(k), 10) || 0;
        if (count > 0) out.push({type, id, count});
      }
    } catch(e){}
    return out.sort((a,b)=>b.count - a.count);
  }

  function resolveEntityName(type, id){
    const idx = (typeof window !== 'undefined' && window.__ENTITY_INDEX__) || {};
    const bucket = idx[type] || {};
    const ent = bucket[id];
    if (ent && (ent.name || ent.title)) return ent.name || ent.title;
    // Fallback heuristic: humanize id
    return (id || '').replace(/_/g, ' ');
  }

  function routeForEntity(type, id){
    if (type === 'character' || type === 'char' || type === 'king') return {page:'character', id};
    if (type === 'event') return {page:'event', id};
    if (type === 'place') return {page:'place', id};
    if (type === 'theme') return {page:'themes', focusId:id};
    return {page:'quiz'};
  }

  function TodayFocus({setRoute}){
    const weak = useMemo(() => readWeakAreas().slice(0, 3), []);

    const fallback = [
      {type:'character', id:'chizkiyahu', label:'עליך לחזור על חזקיהו', sub:'מלך יהודה · מרכזי בבגרות'},
      {type:'event',     id:'imut_karmel', label:'אירוע חסר ידע: מעמד הר הכרמל', sub:'אליהו מול נביאי הבעל'},
      {type:'theme',     id:'melech_navi', label:'נושא רוחב חלש: מלך ונביא', sub:'יחסי מלך־נביא לאורך הספר'}
    ];

    const items = weak.length
      ? weak.map(w => ({
          type: w.type, id: w.id,
          label: 'עליך לחזור על ' + resolveEntityName(w.type, w.id),
          sub: w.count + ' טעויות בחידונים · לחץ למידע מלא'
        }))
      : fallback;

    return (
      <section className="today-focus-wrap">
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="font-display text-base md:text-lg font-bold text-on-parchment">🎯 מיקוד להיום</h2>
          <span className="text-xs text-on-parchment-muted">
            {weak.length ? 'מבוסס על טעויות בחידונים' : 'המלצה כללית'}
          </span>
        </div>
        <div className="today-focus-list">
          {items.map((it, i) => (
            <button key={i} type="button"
              onClick={()=>setRoute(routeForEntity(it.type, it.id))}
              className="today-focus-card">
              <div className="today-focus-rank" aria-hidden="true">{i+1}</div>
              <div className="today-focus-body">
                <div className="today-focus-title">{it.label}</div>
                <div className="today-focus-sub">{it.sub}</div>
              </div>
              <div className="today-focus-arrow" aria-hidden="true">←</div>
            </button>
          ))}
        </div>
      </section>
    );
  }

  // ---- STATS STRIP -------------------------------------------------------
  function readStats(S){
    const streakDays = (S && typeof S.streak === 'number') ? S.streak : 0;
    let total = 0, correct = 0;
    if (S && typeof S.quizTotal === 'number') total = S.quizTotal;
    if (S && typeof S.quizCorrect === 'number') correct = S.quizCorrect;

    if (!total){
      try {
        if (typeof localStorage !== 'undefined'){
          const t = parseInt(localStorage.getItem('jarvis.quiz.total'), 10) || 0;
          const c = parseInt(localStorage.getItem('jarvis.quiz.correct'), 10) || 0;
          total = t; correct = c;
        }
      } catch(e){}
    }
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { streakDays, total, accuracy };
  }

  function StatCell({icon, value, label, accent}){
    return (
      <div className={'stats-cell ' + (accent || '')}>
        <div className="stats-icon" aria-hidden="true">{icon}</div>
        <div className="stats-value">{value}</div>
        <div className="stats-label">{label}</div>
      </div>
    );
  }

  function StatsStrip({S}){
    const { streakDays, total, accuracy } = readStats(S);
    return (
      <section className="stats-strip-wrap">
        <div className="stats-strip-grid">
          <StatCell icon="🔥" value={streakDays} label="ימים ברצף" accent="stats-streak"/>
          <StatCell icon="📊" value={total} label="שאלות שנענו" accent="stats-total"/>
          <StatCell icon="🎯" value={accuracy + '%'} label="דיוק ממוצע" accent="stats-accuracy"/>
        </div>
      </section>
    );
  }

  // ---- MAIN ---------------------------------------------------------------
  function Home({S, setRoute, level, nextLv}){
    const [tick, setTick] = useState(0);
    useEffect(()=>{ const id=setInterval(()=>setTick(t=>t+1),60000); return ()=>clearInterval(id); },[]);

    const dExam = (typeof daysTo === 'function' && typeof EXAM_DATE !== 'undefined') ? daysTo(EXAM_DATE) : 0;
    const units = (typeof MELAKHIM_DATA !== 'undefined' && MELAKHIM_DATA.units) ? MELAKHIM_DATA.units : [];
    const currentUnit = units.find(u => !(S.quizScores||{})[u.id]) || units[0];

    return (
      <div className="space-y-5">
        <Hero S={S} setRoute={setRoute} dExam={dExam} currentUnit={currentUnit}/>
        <ProgressStrip units={units} S={S} setRoute={setRoute} currentUnit={currentUnit}/>
        <QuickActions setRoute={setRoute}/>
        <TodayFocus setRoute={setRoute}/>
        <StatsStrip S={S}/>
        {typeof window!=="undefined" && window.XpStatsComponent ? (
          <section className="mt-2"><window.XpStatsComponent/></section>
        ) : null}
        {/* QUICK ACTIONS — added in commit 3 */}
        {/* TODAY'S FOCUS — added in commit 4 */}
        {/* STATS STRIP — added in commit 5 */}
      </div>
    );
  }

  if (typeof window !== 'undefined'){
    window.HomeComponent = Home;
  }
})();
