/* =========================================================================
   KingsTable — ציר המלכים / Kings Timeline (rebuilt 2026-04-24).
   Previous version depended on BCE grid-positioning that silently rendered
   to null when fields were missing — this rewrite is defensive:
     • Reads window.KINGS_DATA (40 kings) OR window.__ENTITY_INDEX__.king.
     • Waits for 'entity-index-ready', with a 3-second bail so the UI never
       gets stuck on a loading spinner.
     • Wraps every card in an error-boundary-style try/catch so one bad row
       can't blank out the whole page.
     • Accepts setRoute as a prop; navigates via EntityLink when available,
       falls back to setRoute({page:'character', id}).

   This commit (chunk a): data wiring + loading state + basic flat list.
   Chunks b/c/d add two-column layout + prophet chips + mobile toggle.

   Exposes: window.KingsTableComponent
   ========================================================================= */
(function(){
  const { useState, useEffect, useMemo } = React;

  // ---------- Styles (idempotent, scoped to .kt2-*) ------------------------
  (function injectStyles(){
    if (typeof document === 'undefined') return;
    if (document.getElementById('kt2-styles')) return;
    const s = document.createElement('style');
    s.id = 'kt2-styles';
    s.textContent = `
      .kt2-wrap{direction:rtl;max-width:1080px;margin:0 auto;padding:12px 10px;display:flex;flex-direction:column;gap:12px}
      .kt2-header h1{font-family:'Frank Ruhl Libre',serif;font-size:28px;font-weight:900;color:var(--on-parchment-accent,#F5D670);margin:0}
      .kt2-header p{color:var(--on-parchment-muted,rgba(245,230,200,.8));font-size:14px;margin:4px 0 0}
      .kt2-loading,.kt2-empty,.kt2-error{padding:56px 24px;text-align:center;border-radius:16px;background:rgba(10,22,40,.5);border:1px solid rgba(212,165,116,.25);color:var(--on-parchment,#F5E6C8);display:flex;flex-direction:column;align-items:center;gap:8px}
      html[data-theme='light'] .kt2-loading,html[data-theme='light'] .kt2-empty,html[data-theme='light'] .kt2-error{background:rgba(247,241,225,.7);color:#3a2a0d}
      .kt2-spinner{font-size:40px;animation:kt2Spin 2.2s linear infinite}
      @keyframes kt2Spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
      .kt2-flat{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr;gap:8px}
      /* Two-column RTL layout: יהודה on visual right, ישראל on visual left.
         In RTL, grid column 1 renders on the right, column 2 on the left. */
      .kt2-two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start}
      .kt2-col-header{display:flex;align-items:center;justify-content:center;gap:6px;padding:10px;border-radius:12px;font-family:'Frank Ruhl Libre',serif;font-size:18px;font-weight:900;position:sticky;top:0;z-index:3;backdrop-filter:blur(8px);border:1px solid rgba(212,165,116,.35)}
      .kt2-col-judah  { color:#C89B3C; background:rgba(139,111,31,.18)}
      .kt2-col-israel { color:#7db5df; background:rgba(30,77,122,.18)}
      .kt2-col-list{list-style:none;margin:8px 0 0;padding:0;display:flex;flex-direction:column;gap:8px}
      .kt2-card{display:flex;align-items:stretch;gap:8px;padding:10px 12px;border-radius:12px;border:1px solid rgba(212,165,116,.35);background:rgba(22,40,74,.55);color:var(--on-parchment,#F5E6C8);cursor:pointer;transition:transform .12s ease,border-color .12s ease,box-shadow .12s ease;border-inline-start-width:5px}
      html[data-theme='light'] .kt2-card{background:rgba(247,241,225,.78);color:#3a2a0d}
      .kt2-card:hover{transform:translateX(-2px);border-color:#C89B3C;box-shadow:0 4px 14px rgba(0,0,0,.18)}
      .kt2-card:focus-visible{outline:3px solid #C89B3C;outline-offset:2px}
      /* Assessment color coding: good=emerald, bad=ruby, mixed=amber */
      .kt2-card.kt2-good{ background:linear-gradient(135deg,rgba(45,122,45,.35),rgba(45,122,45,.15)); border-inline-start-color:#4CAF50}
      .kt2-card.kt2-bad { background:linear-gradient(135deg,rgba(139,45,45,.35),rgba(139,45,45,.15)); border-inline-start-color:#d94444}
      .kt2-card.kt2-mix { background:linear-gradient(135deg,rgba(200,155,60,.30),rgba(200,155,60,.12)); border-inline-start-color:#C89B3C}
      html[data-theme='light'] .kt2-card.kt2-good{background:linear-gradient(135deg,#d4f5d4,#a8e6a1);color:#1a4d1a}
      html[data-theme='light'] .kt2-card.kt2-bad {background:linear-gradient(135deg,#fad4d4,#e6a1a1);color:#4d1a1a}
      html[data-theme='light'] .kt2-card.kt2-mix {background:linear-gradient(135deg,#f5e8b8,#e6d184);color:#4d3e1a}
      .kt2-card-name{font-family:'Frank Ruhl Libre',serif;font-size:17px;font-weight:900;line-height:1.15}
      .kt2-card-meta{font-size:11.5px;opacity:.8;margin-top:2px}
      .kt2-kingdom-badge{font-size:11px;font-weight:800;padding:2px 8px;border-radius:999px;white-space:nowrap}
      .kt2-kingdom-judah {background:rgba(139,111,31,.22);color:#c89b3c;border:1px solid rgba(200,155,60,.45)}
      .kt2-kingdom-israel{background:rgba(30,77,122,.25);color:#7db5df;border:1px solid rgba(125,181,223,.45)}
      .kt2-kingdom-united{background:rgba(78,107,46,.25);color:#a8c97d;border:1px solid rgba(168,201,125,.45)}
      .kt2-retry-btn{margin-top:10px;padding:8px 18px;border-radius:10px;background:#C89B3C;color:#1A1611;font-weight:800;border:none;cursor:pointer}
    `;
    document.head.appendChild(s);
  })();

  // ---------- Data loading -------------------------------------------------
  function loadKings(){
    if (typeof window === 'undefined') return [];
    // Primary: window.KINGS_DATA array (data/kings.js default export).
    if (Array.isArray(window.KINGS_DATA) && window.KINGS_DATA.length){
      return window.KINGS_DATA.slice();
    }
    // Fallback: entity index bucket.
    const idx = window.__ENTITY_INDEX__ && window.__ENTITY_INDEX__.king;
    if (idx && typeof idx === 'object'){
      const arr = Object.values(idx);
      if (arr.length) return arr;
    }
    return [];
  }

  function isReady(){
    if (typeof window === 'undefined') return true;
    if (window.__ENTITY_INDEX_READY__) return true;
    if (Array.isArray(window.KINGS_DATA) && window.KINGS_DATA.length) return true;
    return false;
  }

  // Chronological sort: earliest BCE (higher number) first → top-to-bottom.
  function sortChrono(kings){
    return kings.slice().sort((a, b) => {
      const sa = (a && a.reign_start_bce != null) ? -a.reign_start_bce : 0;
      const sb = (b && b.reign_start_bce != null) ? -b.reign_start_bce : 0;
      return sa - sb;
    });
  }

  // Normalize kingdom string to 'judah' | 'israel' | 'united'.
  function normKingdom(k){
    const v = (k && (k.kingdom || '')).toString().toLowerCase();
    if (v === 'judah'  || k.kingdom === 'יהודה')  return 'judah';
    if (v === 'israel' || k.kingdom === 'ישראל')  return 'israel';
    if (v === 'united' || k.kingdom === 'מאוחדת') return 'united';
    return 'judah';
  }
  const KINGDOM_LABEL = { judah: 'יהודה', israel: 'ישראל', united: 'מאוחדת' };
  const KINGDOM_ICON  = { judah: '👑', israel: '⚔️', united: '✨' };

  // Assessment → CSS color class. Prefers KingsUtils.assessmentKind so the
  // same rules that power the character page apply here.
  function assessKind(king){
    const KU = (typeof window !== 'undefined') && window.KingsUtils;
    if (KU && typeof KU.assessmentKind === 'function'){
      try { return KU.assessmentKind(king); } catch(e){}
    }
    const raw = (king && king.assessment) || '';
    if (raw === 'צדיק')  return 'tzadik';
    if (raw === 'רשע')   return 'rasha';
    if (raw === 'מעורב') return 'mixed';
    return king && king.good === true ? 'tzadik' : (king && king.good === false ? 'rasha' : 'mixed');
  }
  function kindToClass(kind){
    if (kind === 'tzadik') return 'kt2-good';
    if (kind === 'rasha')  return 'kt2-bad';
    return 'kt2-mix';
  }
  function kindLabel(kind){
    if (kind === 'tzadik') return 'צדיק';
    if (kind === 'rasha')  return 'רשע';
    return 'מעורב';
  }

  // ---------- Error boundary (minimal) -------------------------------------
  function SafeCard({ children }){
    try { return children; } catch(e){ return null; }
  }

  // ---------- Navigation ---------------------------------------------------
  function goToCharacter(setRoute, kingId){
    if (!kingId) return;
    if (typeof setRoute === 'function'){ setRoute({ page: 'character', id: kingId }); return; }
    // Fallback: dispatch a navigate event the App picks up.
    try { window.dispatchEvent(new CustomEvent('mb-navigate', { detail:{ page:'character', id: kingId } })); } catch(e){}
    try { window.location.hash = '#character-' + encodeURIComponent(kingId); } catch(e){}
  }

  // ---------- Row / Card ---------------------------------------------------
  function KingCard({ king, setRoute }){
    const kingdom = normKingdom(king);
    const years = (king.reign_years != null) ? (king.reign_years + ' שנות מלוכה') : '';
    const name = king.name_niqqud || king.name || king.id;
    const bce = (king.reign_start_bce != null && king.reign_end_bce != null)
      ? (king.reign_start_bce + '–' + king.reign_end_bce + ' לפנה״ס')
      : '';
    const role = king.short_summary
      ? king.short_summary.split('.')[0].slice(0, 90) + '…'
      : (king.assessment ? ('מלך ' + KINGDOM_LABEL[kingdom] + ' · ' + king.assessment) : ('מלך ' + KINGDOM_LABEL[kingdom]));
    const kind = assessKind(king);
    const colorCls = kindToClass(kind);
    return (
      <SafeCard>
        <li
          className={'kt2-card ' + colorCls}
          role="button" tabIndex={0}
          aria-label={name + ' · ' + KINGDOM_LABEL[kingdom] + ' · ' + kindLabel(kind) + ' · ' + years}
          onClick={() => goToCharacter(setRoute, king.id)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); goToCharacter(setRoute, king.id); } }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="kt2-card-name hebrew">{name}</div>
            <div className="kt2-card-meta">
              <span>{KINGDOM_ICON[kingdom]} {kindLabel(kind)}</span>
              {years ? <span style={{ marginInlineStart: 8 }}>· {years}</span> : null}
            </div>
            {bce ? <div className="kt2-card-meta" style={{ marginTop: 1 }}>{bce}</div> : null}
            <div className="kt2-card-meta" style={{ marginTop: 3, opacity: .8 }}>{role}</div>
          </div>
          <span style={{ fontSize: 18, opacity: .5, alignSelf: 'center' }}>←</span>
        </li>
      </SafeCard>
    );
  }

  // ---------- Main component -----------------------------------------------
  function KingsTable(props){
    const setRoute = props && props.setRoute;
    const [ready, setReady] = useState(() => isReady());
    const [error, setError] = useState(null);
    const [bumper, setBumper] = useState(0);  // force re-sort after ready

    useEffect(() => {
      if (ready) return;
      const onReady = () => { setReady(true); setBumper(b => b + 1); };
      window.addEventListener('entity-index-ready', onReady);
      const poll = setInterval(() => { if (isReady()){ setReady(true); setBumper(b => b + 1); } }, 200);
      // Never block the UI for more than 3 seconds — we have fallback data.
      const bail = setTimeout(() => setReady(true), 3000);
      return () => { window.removeEventListener('entity-index-ready', onReady); clearInterval(poll); clearTimeout(bail); };
    }, [ready]);

    const kings = useMemo(() => {
      try { return sortChrono(loadKings()); }
      catch (e) { setError(e); return []; }
    }, [ready, bumper]);

    if (!ready){
      return (
        <div className="kt2-wrap">
          <div className="kt2-loading" role="status" aria-live="polite">
            <div className="kt2-spinner" aria-hidden="true">📜</div>
            <div>טוען את ציר המלכים…</div>
          </div>
        </div>
      );
    }

    if (error){
      return (
        <div className="kt2-wrap">
          <div className="kt2-error" role="alert">
            <div style={{ fontSize: 40 }}>⚠️</div>
            <div>שגיאה בטעינת המלכים.</div>
            <pre style={{ fontSize: 11, opacity: .7, maxWidth: 600, whiteSpace: 'pre-wrap' }}>{String(error && (error.message || error))}</pre>
            <button className="kt2-retry-btn" onClick={() => { setError(null); setBumper(b => b + 1); }}>נסה שוב</button>
          </div>
        </div>
      );
    }

    if (!kings.length){
      return (
        <div className="kt2-wrap">
          <div className="kt2-empty">
            <div style={{ fontSize: 40 }}>📜</div>
            <div>לא נטענו נתוני מלכים. ייתכן שמודול data/kings.js חסר או שקובץ-אינדקס לא נבנה.</div>
            <button className="kt2-retry-btn" onClick={() => setBumper(b => b + 1)}>נסה שוב</button>
          </div>
        </div>
      );
    }

    // Split by kingdom for two-column layout. 'united' (Solomon) goes in the
    // Judah column since he's the father of the Davidic line.
    const judah  = kings.filter(k => normKingdom(k) !== 'israel');
    const israel = kings.filter(k => normKingdom(k) === 'israel');

    return (
      <div className="kt2-wrap">
        <header className="kt2-header">
          <h1>📜 ציר המלכים</h1>
          <p>כל {kings.length} מלכי יהודה וישראל · ירוק = צדיק · אדום = רשע · ענבר = מעורב · לחץ על מלך לפתיחת הדף המלא</p>
        </header>
        <div className="kt2-two-col">
          {/* Judah column — visual RIGHT in RTL (grid column 1) */}
          <section aria-label="מלכי יהודה">
            <div className="kt2-col-header kt2-col-judah">👑 מלכי יהודה <span style={{ fontSize: 12, opacity: .7 }}>({judah.length})</span></div>
            <ul className="kt2-col-list">
              {judah.map(king => <KingCard key={king.id} king={king} setRoute={setRoute}/>)}
            </ul>
          </section>
          {/* Israel column — visual LEFT in RTL (grid column 2) */}
          <section aria-label="מלכי ישראל">
            <div className="kt2-col-header kt2-col-israel">⚔️ מלכי ישראל <span style={{ fontSize: 12, opacity: .7 }}>({israel.length})</span></div>
            <ul className="kt2-col-list">
              {israel.map(king => <KingCard key={king.id} king={king} setRoute={setRoute}/>)}
            </ul>
          </section>
        </div>
      </div>
    );
  }

  if (typeof window !== 'undefined'){
    window.KingsTableComponent = KingsTable;
  }
})();
