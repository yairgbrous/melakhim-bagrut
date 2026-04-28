/* =========================================================================
   Home — clean landing page. Mounts as window.HomeComponent.
   Layout (top→bottom):
     1. Header strip   — title + countdown + XP badge + search
     2. Hero card      — parchment + gold border + primary/secondary CTA
     3. 6-unit grid    — unit cards with progress bar
     4. Quick actions  — 7 horizontal tiles (scroll on mobile)
     5. Daily strip    — today's challenge teaser
     6. Recent         — last 3 items from localStorage "mb.recent"
   Reads: window.MELAKHIM_DATA, window.KINGS_DATA, window.EVENTS_DATA,
          window.__ENTITY_INDEX__, localStorage (progress + recent).
   ========================================================================= */
(function(){
  const { useState, useEffect, useMemo } = React;

  // ---- helpers -----------------------------------------------------------
  function heDays(d){
    if (d === 0) return 'היום';
    if (d === 1) return 'יום אחד';
    if (d === 2) return 'יומיים';
    return d + ' ימים';
  }

  function readUnitProgress(unitId){
    try {
      const raw = localStorage.getItem('jarvis.melakhim.progress.unit' + unitId);
      const n = parseInt(raw, 10);
      if (isFinite(n)) return Math.max(0, Math.min(100, n));
    } catch(e){}
    return 0;
  }

  function readRecent(){
    try {
      const raw = localStorage.getItem('mb.recent');
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch(e){ return []; }
  }

  // Deterministic daily entity pick — mirrors DailyChallenge.pickForDate.
  function ilDay(t){
    return new Date(t || Date.now()).toLocaleDateString('en-CA', { timeZone:'Asia/Jerusalem' });
  }
  function hashStr(s){
    let h = 2166136261;
    for (let i=0; i<s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function pickDailyPreview(date){
    const idx = (typeof window !== 'undefined' && window.__ENTITY_INDEX__) || {};
    const pool = [];
    const push = (bucket, type) => {
      if (!bucket) return;
      for (const id of Object.keys(bucket)){
        const e = bucket[id];
        if (e && (e.heading || e.name || e.name_niqqud)) pool.push({ type, id, entry: e });
      }
    };
    push(idx.king, 'king');
    push(idx.character, 'character');
    if (!pool.length) return null;
    return pool[hashStr(date + ':melakhim-daily:v1') % pool.length];
  }

  // ---- 1. HEADER STRIP ---------------------------------------------------
  function HeaderStrip({dExam}){
    const openSearch = () => {
      if (typeof window !== 'undefined' && typeof window.openInstantSearch === 'function'){
        window.openInstantSearch();
      }
    };
    const XpBadge = (typeof window !== 'undefined') ? window.XpBadgeComponent : null;
    return (
      <header className="mb-home-header ui-hero">
        <div className="mb-home-header-title">
          <h1 className="font-display">ספר מלכים · בגרות 2551</h1>
          <div className="mb-home-countdown hero-countdown">
            ⏰ {heDays(dExam)} עד הבחינה · 30.4.2026
          </div>
        </div>
        <div className="mb-home-header-right">
          {XpBadge ? <XpBadge compact/> : null}
          <button
            type="button"
            onClick={openSearch}
            className="mb-home-search-btn"
            aria-label="חיפוש מהיר">
            🔍
          </button>
        </div>
      </header>
    );
  }

  // ---- 2. HERO CARD ------------------------------------------------------
  function HeroCard({setRoute}){
    return (
      <section className="mb-home-hero parchment hero-parchment">
        <div className="mb-home-hero-inner">
          <h2 className="font-display">המבחן שלך, המידע שלך</h2>
          <p className="mb-home-hero-sub">
            מסלול למידה שלם לבגרות 2551 · יחידות, דמויות, מפות, חידונים ומתכונות
          </p>
          <div className="mb-home-hero-ctas">
            <button
              type="button"
              onClick={()=>setRoute({page:'study'})}
              className="gold-btn mb-home-hero-cta-primary"
              aria-label="התחל ללמוד">
              🎓 התחל ללמוד ←
            </button>
            <button
              type="button"
              onClick={()=>setRoute({page:'exam-sim'})}
              className="mb-home-hero-cta-secondary"
              aria-label="תרגל מתכונת">
              📝 תרגל מתכונת
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ---- 3. 6-UNIT GRID ----------------------------------------------------
  function UnitCard({unit, progress, onClick}){
    const title = unit.title_niqqud || unit.title;
    return (
      <button
        type="button"
        onClick={onClick}
        className="mb-home-unit-card parchment"
        aria-label={'יחידה ' + unit.num + ' · ' + title}>
        <div className="mb-home-unit-head">
          <span className="mb-home-unit-num font-display">{unit.num}</span>
          <span className="mb-home-unit-icon" aria-hidden="true">{unit.icon}</span>
        </div>
        <h3 className="mb-home-unit-title font-display">{title}</h3>
        <div className="mb-home-unit-range">{unit.range}</div>
        <div className="mb-home-progress" aria-label={'התקדמות ' + progress + ' אחוז'}>
          <div className="mb-home-progress-fill" style={{width: progress + '%'}} aria-hidden="true"/>
        </div>
        <div className="mb-home-unit-pct">
          <span>{progress}%</span>
          <span className="mb-home-unit-arrow" aria-hidden="true">←</span>
        </div>
      </button>
    );
  }

  function UnitGrid({units, setRoute}){
    if (!units || !units.length) return null;
    return (
      <section className="mb-home-section">
        <h2 className="mb-home-section-title font-display">📚 יחידות הלימוד</h2>
        <div className="mb-home-unit-grid">
          {units.map(u => (
            <UnitCard
              key={u.id}
              unit={u}
              progress={readUnitProgress(u.id)}
              onClick={()=>setRoute({page:'unit', unitId:u.id})}
            />
          ))}
        </div>
      </section>
    );
  }

  // ---- 4. QUICK ACTIONS ROW ----------------------------------------------
  function QuickActions({setRoute}){
    const openSearch = () => {
      if (typeof window !== 'undefined' && typeof window.openInstantSearch === 'function'){
        window.openInstantSearch();
      }
    };
    const tiles = [
      { icon:'👑', label:'טבלת מלכים', onClick:()=>setRoute({page:'timeline'}) },
      { icon:'🗺', label:'מפות',        onClick:()=>setRoute({page:'maps'}) },
      { icon:'👥', label:'דמויות',      onClick:openSearch },
      { icon:'🌐', label:'נושאי רוחב',  onClick:()=>setRoute({page:'themes'}) },
      { icon:'🃏', label:'פלאשקארדס',   onClick:()=>setRoute({page:'flashcards'}) }
    ];
    return (
      <section className="mb-home-section">
        <h2 className="mb-home-section-title font-display">⚡ פעולות מהירות</h2>
        <div className="mb-home-quick-scroll">
          {tiles.map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={t.onClick}
              className="mb-home-quick-tile parchment"
              aria-label={t.label}>
              <span className="mb-home-quick-icon" aria-hidden="true">{t.icon}</span>
              <span className="mb-home-quick-label">{t.label}</span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  // ---- 5. DAILY CHALLENGE STRIP ------------------------------------------
  function DailyStrip({setRoute}){
    const today = useMemo(() => ilDay(), []);
    const [pick, setPick] = useState(() => pickDailyPreview(today));
    useEffect(() => {
      if (pick) return;
      const retry = () => setPick(pickDailyPreview(today));
      window.addEventListener('entity-index-ready', retry);
      const t = setTimeout(retry, 600);
      return () => {
        window.removeEventListener('entity-index-ready', retry);
        clearTimeout(t);
      };
    }, [today, pick]);

    const heading = pick && pick.entry
      ? (pick.entry.heading || pick.entry.name_niqqud || pick.entry.name || pick.id)
      : null;
    const teaser = heading
      ? 'שאלה על ' + heading + ' · 5 שאלות'
      : '5 שאלות על ישות אחת · קבוע לפי התאריך';

    return (
      <section className="mb-home-section">
        <div className="mb-home-daily parchment">
          <div className="mb-home-daily-body">
            <div className="mb-home-daily-label">☀️ אתגר היום</div>
            <div className="mb-home-daily-teaser">{teaser}</div>
            <div className="mb-home-daily-date" dir="ltr">{today}</div>
          </div>
          <button
            type="button"
            onClick={()=>setRoute({page:'daily'})}
            className="gold-btn mb-home-daily-cta"
            aria-label="התחל את האתגר">
            התחל ←
          </button>
        </div>
      </section>
    );
  }

  // ---- 6. RECENT ACTIVITY ------------------------------------------------
  function RecentActivity({setRoute}){
    const [items, setItems] = useState(() => readRecent());
    useEffect(() => {
      const refresh = () => setItems(readRecent());
      window.addEventListener('focus', refresh);
      window.addEventListener('storage', refresh);
      return () => {
        window.removeEventListener('focus', refresh);
        window.removeEventListener('storage', refresh);
      };
    }, []);

    const last3 = items.slice(-3).reverse();
    if (!last3.length) return null;

    const EntityLink = (typeof window !== 'undefined') ? window.EntityLinkComponent : null;

    return (
      <section className="mb-home-section">
        <h2 className="mb-home-section-title font-display">🕘 פריטים אחרונים</h2>
        <div className="mb-home-recent-list">
          {last3.map((it, i) => {
            if (!it || !it.type || !it.id) return null;
            if (EntityLink){
              return (
                <div key={i} className="mb-home-recent-row parchment">
                  <EntityLink type={it.type} id={it.id} label={it.label} setRoute={setRoute}/>
                </div>
              );
            }
            return (
              <button
                key={i}
                type="button"
                onClick={()=>setRoute({page:it.type, id:it.id})}
                className="mb-home-recent-row parchment">
                {it.label || it.id}
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  // ---- MAIN --------------------------------------------------------------
  function Home({S, setRoute}){
    const [, setTick] = useState(0);
    useEffect(() => {
      const id = setInterval(() => setTick(t => t + 1), 60000);
      return () => clearInterval(id);
    }, []);

    const dExam = (typeof daysTo === 'function' && typeof EXAM_DATE !== 'undefined') ? daysTo(EXAM_DATE) : 0;
    const units = (typeof MELAKHIM_DATA !== 'undefined' && MELAKHIM_DATA.units) ? MELAKHIM_DATA.units : [];

    return (
      <div className="mb-home-root home-polish">
        <HeaderStrip dExam={dExam}/>
        <HeroCard setRoute={setRoute}/>
        <UnitGrid units={units} setRoute={setRoute}/>
        <QuickActions setRoute={setRoute}/>
        <DailyStrip setRoute={setRoute}/>
        <RecentActivity setRoute={setRoute}/>
      </div>
    );
  }

  // ---- styles (scoped) ---------------------------------------------------
  // Injected once on load. Kept here so the redesign is self-contained.
  function ensureStyles(){
    if (typeof document === 'undefined') return;
    if (document.getElementById('mb-home-styles')) return;
    const css = `
.mb-home-root{display:flex;flex-direction:column;gap:20px;direction:rtl}
.mb-home-root *{box-sizing:border-box}

/* 1. Header strip */
.mb-home-header{min-height:72px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 4px}
.mb-home-header-title h1{font-size:20px;line-height:1.2;font-weight:900;color:#F4D58D;margin:0}
.mb-home-countdown{display:inline-block;margin-top:4px;padding:2px 10px;border-radius:999px;background:linear-gradient(135deg,#D4A574,#8B6F47);color:#1A1611;font-size:11px;font-weight:800}
.mb-home-header-right{display:flex;align-items:center;gap:8px;flex-shrink:0}
.mb-home-search-btn{width:40px;height:40px;border-radius:999px;border:1px solid rgba(212,165,116,.55);background:rgba(247,241,225,.06);color:#F4D58D;font-size:18px;cursor:pointer;transition:all .18s}
.mb-home-search-btn:hover{background:rgba(212,165,116,.18);transform:scale(1.05)}
@media (min-width:640px){
  .mb-home-header-title h1{font-size:24px}
  .mb-home-countdown{font-size:12px}
}

/* 2. Hero card */
.mb-home-hero{border-radius:22px;padding:22px 20px;border:2px solid #D4A574;position:relative;overflow:hidden}
.mb-home-hero::before{content:"📜";position:absolute;top:-20px;inset-inline-start:-20px;font-size:160px;opacity:.05;pointer-events:none;line-height:1}
.mb-home-hero-inner{position:relative;text-align:center}
.mb-home-hero h2{font-size:26px;font-weight:900;line-height:1.2;margin:0 0 8px;color:#1A1611}
.mb-home-hero-sub{font-size:13px;color:#4A3829;margin:0 0 16px;font-weight:500}
.mb-home-hero-ctas{display:flex;flex-direction:column;gap:10px;align-items:stretch}
.mb-home-hero-cta-primary{padding:14px 20px;border-radius:16px;font-size:16px;font-weight:800;cursor:pointer}
.mb-home-hero-cta-secondary{padding:12px 20px;border-radius:16px;font-size:15px;font-weight:700;cursor:pointer;background:transparent;border:1.5px solid #8B6F1F;color:#8B6F1F;transition:all .18s}
.mb-home-hero-cta-secondary:hover{background:rgba(212,165,116,.12)}
@media (min-width:640px){
  .mb-home-hero{padding:32px 28px}
  .mb-home-hero h2{font-size:32px}
  .mb-home-hero-sub{font-size:14px}
  .mb-home-hero-ctas{flex-direction:row;justify-content:center;gap:12px}
  .mb-home-hero-cta-primary,.mb-home-hero-cta-secondary{padding:14px 28px;min-width:200px}
}

/* Section */
.mb-home-section{display:flex;flex-direction:column;gap:10px}
.mb-home-section-title{font-size:16px;font-weight:800;color:#F4D58D;margin:0;padding:0 4px}
@media (min-width:640px){ .mb-home-section-title{font-size:18px} }

/* 3. Unit grid — 1 col mobile, 2 col md, 3 col lg */
.mb-home-unit-grid{display:grid;grid-template-columns:1fr;gap:12px}
@media (min-width:640px){ .mb-home-unit-grid{grid-template-columns:repeat(2,1fr);gap:14px} }
@media (min-width:1024px){ .mb-home-unit-grid{grid-template-columns:repeat(3,1fr)} }
.mb-home-unit-card{display:flex;flex-direction:column;gap:8px;padding:16px;border-radius:18px;text-align:start;cursor:pointer;transition:all .18s;border:1px solid rgba(212,165,116,.5)}
.mb-home-unit-card:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(0,0,0,.45);border-color:#D4A574}
.mb-home-unit-head{display:flex;align-items:center;justify-content:space-between}
.mb-home-unit-num{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#F5D670,#8B6F1F);color:#1A1611;font-weight:900;font-size:20px;border:2px solid #C89B3C;box-shadow:inset 0 0 6px rgba(255,255,255,.3)}
.mb-home-unit-icon{font-size:28px;line-height:1}
.mb-home-unit-title{font-size:18px;font-weight:900;color:#1A1611;margin:0;line-height:1.3}
.mb-home-unit-range{font-size:12px;color:#6B5639;font-weight:500}
.mb-home-progress{height:8px;border-radius:999px;background:rgba(139,111,31,.18);overflow:hidden;margin-top:4px}
.mb-home-progress-fill{height:100%;background:linear-gradient(90deg,#8B6F1F,#D4A574);transition:width .4s ease}
.mb-home-unit-pct{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#4A3829;font-weight:700}
.mb-home-unit-arrow{color:#8B6F1F;font-weight:900}

/* 4. Quick actions — horizontal scroll on mobile, wrap on larger */
.mb-home-quick-scroll{display:flex;gap:10px;overflow-x:auto;padding:4px 2px 10px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch}
.mb-home-quick-scroll::-webkit-scrollbar{height:4px}
.mb-home-quick-scroll::-webkit-scrollbar-thumb{background:rgba(212,165,116,.4);border-radius:2px}
.mb-home-quick-tile{flex:0 0 110px;scroll-snap-align:start;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:14px 10px;border-radius:16px;cursor:pointer;transition:all .18s;border:1px solid rgba(212,165,116,.45);min-height:88px}
.mb-home-quick-tile:hover{transform:translateY(-2px);border-color:#D4A574;box-shadow:0 8px 18px rgba(0,0,0,.3)}
.mb-home-quick-icon{font-size:26px;line-height:1}
.mb-home-quick-label{font-size:12px;font-weight:800;color:#1A1611;text-align:center;line-height:1.2}
@media (min-width:640px){
  .mb-home-quick-scroll{flex-wrap:wrap;overflow-x:visible;gap:12px}
  .mb-home-quick-tile{flex:1 1 calc((100% - 72px)/7);min-width:110px}
}

/* 5. Daily strip */
.mb-home-daily{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px;border-radius:18px;border:1px solid rgba(212,165,116,.5)}
.mb-home-daily-body{flex:1;min-width:0}
.mb-home-daily-label{font-size:13px;font-weight:900;color:#8B6F1F;margin-bottom:4px}
.mb-home-daily-teaser{font-size:15px;font-weight:700;color:#1A1611;line-height:1.3}
.mb-home-daily-date{font-size:11px;color:#6B5639;margin-top:4px}
.mb-home-daily-cta{padding:10px 18px;border-radius:14px;font-size:14px;font-weight:800;cursor:pointer;white-space:nowrap}

/* 6. Recent */
.mb-home-recent-list{display:flex;flex-direction:column;gap:8px}
.mb-home-recent-row{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:14px;border:1px solid rgba(212,165,116,.4);color:#1A1611;text-align:start;cursor:pointer}
.mb-home-recent-row:hover{border-color:#D4A574}
`;
    const style = document.createElement('style');
    style.id = 'mb-home-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  if (typeof window !== 'undefined'){
    ensureStyles();
    window.HomeComponent = Home;
  }
})();
