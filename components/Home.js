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
