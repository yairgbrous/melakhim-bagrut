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
        {/* PROGRESS STRIP — added in commit 2 */}
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
