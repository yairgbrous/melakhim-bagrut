/* =========================================================================
   KingsTable — kings register sourced from window.KINGS_DATA
   ---------------------------------------------------------------------------
   Steps so far:
     (a) data wiring + loading state + ErrorBoundary
     (b) two-column RTL layout (יהודה ימין · ישראל שמאל) + horizontal
         era timeline + per-card color coding (good=emerald, bad=ruby,
         mixed=amber).
     (c) prophet chips under each king card, sourced via
         KingsUtils.prophets_by_reign with the FALLBACK_PROPHETS table.
         Clicking a chip navigates to the prophet's CharacterPage; broken
         IDs are rerouted through window.__ENTITY_ALIASES__ so they still
         resolve via _id-aliases.js.

   Click a king card → setRoute({page:'character', id:king.id}). Falls back
   to window.__appSetRoute__ / mb-navigate event when the prop isn't passed.

   Exposes: window.KingsTableComponent
   ========================================================================= */
(function(){
  const { useState, useEffect, useMemo } = React;

  // ---- Color palette per assessment (good=emerald, bad=ruby, mixed=amber) --
  const ASSESS_TONE = {
    good:  { bg:'linear-gradient(135deg,#10b981 0%,#047857 100%)',
             ring:'#34d399', fg:'#ecfdf5', label:'צדיק' },
    bad:   { bg:'linear-gradient(135deg,#f43f5e 0%,#9f1239 100%)',
             ring:'#fb7185', fg:'#fff1f2', label:'רשע'  },
    mixed: { bg:'linear-gradient(135deg,#f59e0b 0%,#b45309 100%)',
             ring:'#fbbf24', fg:'#fef3c7', label:'מעורב' }
  };

  function assessKey(k){
    const KU = window.KingsUtils;
    if (KU && KU.assessmentKind) {
      const v = KU.assessmentKind(k);
      if (v === 'tzadik') return 'good';
      if (v === 'rasha')  return 'bad';
      return 'mixed';
    }
    if (k.assessment === 'צדיק' || k.good === true)  return 'good';
    if (k.assessment === 'רשע'  || k.good === false) return 'bad';
    return 'mixed';
  }

  // Era → label + span (BCE), used by horizontal era bar.
  const ERA_BANDS = [
    { id:1, name:'תור הזהב',     start:970, end:931 },
    { id:2, name:'הפילוג',        start:931, end:874 },
    { id:3, name:'אליהו ואחאב',   start:874, end:842 },
    { id:4, name:'מהפכת יהוא',   start:842, end:782 },
    { id:5, name:'עליית אשור',   start:782, end:716 },
    { id:6, name:'יהודה לבדה',   start:716, end:586 }
  ];

  function injectStyles(){
    if (typeof document === 'undefined') return;
    if (document.getElementById('kt2-styles')) return;
    const s = document.createElement('style');
    s.id = 'kt2-styles';
    s.textContent = `
      .kt2-wrap{direction:rtl;display:flex;flex-direction:column;gap:14px;padding:8px}
      .kt2-head{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:10px}
      .kt2-title{font-family:'Frank Ruhl Libre',serif;font-size:24px;font-weight:900;color:#F4D58D}
      html[data-theme='light'] .kt2-title{color:#5A4517}
      .kt2-sub{font-size:13px;opacity:.78}

      .kt2-era-bar{display:grid;grid-template-columns:repeat(6,1fr);gap:4px;direction:rtl;
        background:rgba(10,22,40,.55);border:1px solid rgba(212,165,116,.3);border-radius:12px;padding:6px}
      html[data-theme='light'] .kt2-era-bar{background:rgba(247,241,225,.55)}
      .kt2-era{padding:8px 6px;border-radius:8px;text-align:center;font-size:12px;font-weight:800;
        background:rgba(212,165,116,.14);color:#F5D670;border:1px solid rgba(212,165,116,.3);cursor:pointer;transition:transform .12s}
      .kt2-era:hover{transform:translateY(-1px);background:rgba(212,165,116,.22)}
      .kt2-era.on{background:linear-gradient(135deg,#D4A574,#8B6F47);color:#1A1611;border-color:#F4D58D}
      .kt2-era-yrs{display:block;font-size:10px;font-weight:600;opacity:.78;margin-top:2px;direction:ltr}
      html[data-theme='light'] .kt2-era{color:#5A4517;background:rgba(212,165,116,.18)}

      .kt2-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;direction:rtl}
      .kt2-col{display:flex;flex-direction:column;gap:10px;min-width:0}
      .kt2-col-head{position:sticky;top:0;z-index:2;backdrop-filter:blur(4px);
        background:rgba(10,22,40,.85);padding:8px 12px;border-radius:10px;
        border:1px solid rgba(212,165,116,.3);font-weight:900;font-size:16px;
        color:#F5D670;text-align:center;font-family:'Frank Ruhl Libre',serif}
      html[data-theme='light'] .kt2-col-head{background:rgba(247,241,225,.92);color:#5A4517}
      .kt2-col-head .kt2-col-icon{margin-inline-end:6px}
      .kt2-col-head-count{font-size:11px;opacity:.78;font-weight:600;margin-inline-start:6px}

      .kt2-king{position:relative;border-radius:14px;padding:12px 14px;cursor:pointer;
        transition:transform .12s,box-shadow .15s;border:1px solid transparent;
        box-shadow:0 4px 14px -6px rgba(0,0,0,.45);min-width:0}
      .kt2-king:hover{transform:translateY(-2px);box-shadow:0 8px 22px -8px rgba(0,0,0,.55)}
      .kt2-king:focus-visible{outline:3px solid #C89B3C;outline-offset:2px}
      .kt2-king-row{display:flex;align-items:baseline;justify-content:space-between;gap:8px;flex-wrap:wrap}
      .kt2-king-name{font-family:'Frank Ruhl Libre',serif;font-weight:900;font-size:22px;line-height:1.15;letter-spacing:.01em}
      .kt2-king-meta{display:flex;align-items:center;gap:6px;font-size:12px;opacity:.92;flex-wrap:wrap}
      .kt2-king-yrs{font-variant-numeric:tabular-nums;direction:ltr;display:inline-block;
        background:rgba(0,0,0,.18);padding:2px 8px;border-radius:999px;font-weight:700;font-size:11px}
      .kt2-king-icon{font-size:13px;opacity:.85}
      .kt2-king-role{margin-top:6px;font-size:13px;line-height:1.35;opacity:.95;
        display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
      .kt2-pill{display:inline-block;padding:1px 8px;border-radius:999px;font-size:10px;
        font-weight:800;letter-spacing:.02em;background:rgba(0,0,0,.25)}

      .kt2-prophets{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}
      .kt2-prophet-chip{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;
        border-radius:999px;background:rgba(124,58,237,.28);color:#e9d5ff;
        border:1px solid rgba(124,58,237,.55);font-size:11px;font-weight:700;cursor:pointer;
        transition:transform .1s,background .15s}
      .kt2-prophet-chip:hover{background:rgba(124,58,237,.5);transform:scale(1.04)}
      .kt2-prophet-chip[disabled]{opacity:.55;cursor:not-allowed}
      html[data-theme='light'] .kt2-prophet-chip{background:rgba(124,58,237,.18);color:#4c1d95;border-color:rgba(124,58,237,.45)}

      .kt2-loading,.kt2-error,.kt2-empty{padding:40px 18px;text-align:center;
        border-radius:14px;border:1px solid rgba(212,165,116,.3);
        background:rgba(10,22,40,.45);color:#F5D670;font-weight:600}
      html[data-theme='light'] .kt2-loading,html[data-theme='light'] .kt2-error,html[data-theme='light'] .kt2-empty{background:rgba(247,241,225,.55);color:#5A4517}
      .kt2-loading-dot{display:inline-block;width:10px;height:10px;border-radius:50%;
        background:#F4D58D;margin:0 3px;animation:kt2pulse 1.2s infinite ease-in-out}
      .kt2-loading-dot:nth-child(2){animation-delay:.2s}
      .kt2-loading-dot:nth-child(3){animation-delay:.4s}
      @keyframes kt2pulse{0%,100%{opacity:.3;transform:scale(.85)}50%{opacity:1;transform:scale(1.1)}}

      @media (max-width:768px){
        .kt2-grid{grid-template-columns:1fr}
        .kt2-era-bar{grid-template-columns:repeat(3,1fr)}
        .kt2-king-name{font-size:20px}
      }
    `;
    document.head.appendChild(s);
  }

  function resolveKingId(id){
    if (!id) return id;
    const aliases = (window.__ENTITY_ALIASES__ || {});
    const m = aliases.king || aliases.character || {};
    if (Object.prototype.hasOwnProperty.call(m, id)) {
      const v = m[id];
      if (typeof v === 'string') return v;
    }
    return id;
  }

  function navTo(setRoute, page, id){
    const r = { page, id: resolveKingId(id) };
    if (typeof setRoute === 'function') { setRoute(r); return; }
    if (window.__appSetRoute__) { try { window.__appSetRoute__(r); return; } catch(e){} }
    try { window.dispatchEvent(new CustomEvent('mb-navigate', { detail:r })); } catch(e){}
    try { window.location.hash = '#' + page + '-' + encodeURIComponent(id); } catch(e){}
  }

  // Resolve a prophet id to a display label, preferring the live entity index
  // (data/characters.js) and falling back to KingsUtils.FALLBACK_PROPHETS.
  function prophetLabel(pid){
    const idx = (window.__ENTITY_INDEX__ || {}).character || {};
    const c = idx[pid];
    if (c) return c.name_niqqud || c.name || c.heading || pid;
    const KU = window.KingsUtils;
    if (KU && KU.FALLBACK_PROPHETS) {
      const f = KU.FALLBACK_PROPHETS.find(p => p.id === pid);
      if (f) return f.name;
    }
    return pid;
  }

  // Does the prophet id resolve through the entity index *or* the alias map?
  // Used to distinguish broken refs (rendered disabled) from live links.
  function prophetExists(pid){
    const idx = (window.__ENTITY_INDEX__ || {}).character || {};
    if (idx[pid]) return true;
    const aliases = (window.__ENTITY_ALIASES__ || {}).character || {};
    if (Object.prototype.hasOwnProperty.call(aliases, pid)) return true;
    const KU = window.KingsUtils;
    if (KU && KU.FALLBACK_PROPHETS && KU.FALLBACK_PROPHETS.some(p => p.id === pid)) return true;
    return false;
  }

  function ProphetChip({pid, label, setRoute}){
    const exists  = prophetExists(pid);
    const display = label || prophetLabel(pid);
    const onClick = (e) => {
      e.stopPropagation();
      if (!exists) return;
      navTo(setRoute, 'character', pid);
    };
    return (
      <button
        type="button"
        className="kt2-prophet-chip"
        onClick={onClick}
        disabled={!exists}
        title={exists ? ('דף הנביא ' + display) : (display + ' (אין דף עדיין)')}
        aria-label={'דף הנביא ' + display}
      >
        🔮 {display}
      </button>
    );
  }

  function gatherProphets(k){
    const KU = window.KingsUtils;
    if (KU && KU.prophets_by_reign){
      const chars = Object.values(((window.__ENTITY_INDEX__||{}).character)||{});
      const list = KU.prophets_by_reign(chars, k) || [];
      if (list.length) return list;
    }
    return (k.related_prophets || []).map(pid => ({ id:pid, name:prophetLabel(pid) }));
  }

  function KingCard({k, setRoute}){
    const ak   = assessKey(k);
    const tone = ASSESS_TONE[ak];
    const isJudah = (k.kingdom === 'יהודה' || k.kingdom === 'מאוחדת');
    const icon = isJudah ? '👑' : '⚔️';
    const role = (k.kingdom === 'מאוחדת')
      ? 'מלך הממלכה המאוחדת'
      : (isJudah ? 'מלך יהודה · ' + (k.dynasty || 'בית דוד')
                 : 'מלך ישראל · ' + (k.dynasty || ''));
    const yrs = (k.reign_start_bce && k.reign_end_bce)
      ? (k.reign_start_bce + '–' + k.reign_end_bce)
      : (k.reign_years ? (k.reign_years + ' שנ׳') : '');

    const onCardClick = () => navTo(setRoute, 'character', k.id);
    const onKey = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCardClick(); } };

    return (
      <div
        className="kt2-king"
        role="button"
        tabIndex={0}
        onClick={onCardClick}
        onKeyDown={onKey}
        aria-label={k.name_niqqud + ' · ' + tone.label + ' · ' + role}
        title={role + (yrs ? ' · ' + yrs + ' לפנה״ס' : '')}
        style={{ background: tone.bg, color: tone.fg, borderColor: tone.ring }}
      >
        <div className="kt2-king-row">
          <div className="kt2-king-name hebrew">
            <span className="kt2-king-icon" aria-hidden="true">{icon}</span> {k.name_niqqud || k.id}
          </div>
          <div className="kt2-king-meta">
            {yrs && <span className="kt2-king-yrs">{yrs}</span>}
            <span className="kt2-pill">{tone.label}</span>
          </div>
        </div>
        <div className="kt2-king-role">{role}</div>
        {(() => {
          const prophets = gatherProphets(k);
          if (!prophets.length) return null;
          return (
            <div className="kt2-prophets" onClick={(e)=>e.stopPropagation()}>
              {prophets.slice(0, 6).map(p => (
                <ProphetChip key={p.id} pid={p.id} label={p.name} setRoute={setRoute}/>
              ))}
            </div>
          );
        })()}
      </div>
    );
  }

  function KingsTableInner({setRoute}){
    useEffect(injectStyles, []);

    const [loading, setLoading] = useState(!Array.isArray(window.KINGS_DATA) || window.KINGS_DATA.length === 0);
    const [kings,   setKings]   = useState(Array.isArray(window.KINGS_DATA) ? window.KINGS_DATA : []);
    const [error,   setError]   = useState(null);
    const [activeEra, setActiveEra] = useState(null);

    useEffect(() => {
      if (!loading) return;
      let cancelled = false;
      const tryLoad = () => {
        const data = window.KINGS_DATA;
        if (Array.isArray(data) && data.length > 0 && !cancelled){
          setKings(data); setLoading(false);
          return true;
        }
        return false;
      };
      if (tryLoad()) return;
      const onReady = () => tryLoad();
      window.addEventListener('entity-index-ready', onReady);
      const tick = setInterval(() => { if (tryLoad()) clearInterval(tick); }, 200);
      const bail = setTimeout(() => {
        if (!tryLoad() && !cancelled){
          setError('כשל בטעינת נתוני המלכים. רענן את העמוד או נסה שוב.');
          setLoading(false);
        }
        clearInterval(tick);
      }, 6000);
      return () => {
        cancelled = true;
        window.removeEventListener('entity-index-ready', onReady);
        clearInterval(tick);
        clearTimeout(bail);
      };
    }, [loading]);

    const judah = useMemo(() => {
      return kings
        .filter(k => k.kingdom === 'יהודה' || k.kingdom === 'מאוחדת')
        .filter(k => activeEra == null || k.era === activeEra)
        .sort((a,b) => (b.reign_start_bce||0) - (a.reign_start_bce||0));
    }, [kings, activeEra]);

    const israel = useMemo(() => {
      return kings
        .filter(k => k.kingdom === 'ישראל')
        .filter(k => activeEra == null || k.era === activeEra)
        .sort((a,b) => (b.reign_start_bce||0) - (a.reign_start_bce||0));
    }, [kings, activeEra]);

    if (loading) {
      return (
        <div className="kt2-wrap">
          <div className="kt2-loading">
            <div style={{fontSize:48,marginBottom:8}}>📜</div>
            <div>טוען טבלת מלכים…</div>
            <div style={{marginTop:10}}>
              <span className="kt2-loading-dot"/><span className="kt2-loading-dot"/><span className="kt2-loading-dot"/>
            </div>
          </div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="kt2-wrap">
          <div className="kt2-error">
            <div style={{fontSize:48,marginBottom:8}}>⚠️</div>
            <div>{error}</div>
          </div>
        </div>
      );
    }
    if (!kings.length) {
      return (
        <div className="kt2-wrap">
          <div className="kt2-empty">
            <div style={{fontSize:48,marginBottom:8}}>📜</div>
            <div>לא נמצאו מלכים. בדוק את data/kings.js.</div>
          </div>
        </div>
      );
    }

    return (
      <div className="kt2-wrap">
        <div className="kt2-head">
          <div>
            <h1 className="kt2-title">📜 ציר המלכים</h1>
            <p className="kt2-sub">מלכי יהודה מימין · מלכי ישראל משמאל · {kings.length} מלכים בסך הכול</p>
          </div>
        </div>

        <div className="kt2-era-bar" role="tablist" aria-label="תקופות">
          {ERA_BANDS.map(b => (
            <button
              key={b.id}
              role="tab"
              aria-selected={activeEra === b.id}
              className={'kt2-era ' + (activeEra === b.id ? 'on' : '')}
              onClick={() => setActiveEra(activeEra === b.id ? null : b.id)}
              title={'יחידה ' + b.id + ' · ' + b.start + '–' + b.end + ' לפנה״ס'}
            >
              <span>יח׳ {b.id} · {b.name}</span>
              <span className="kt2-era-yrs">{b.start}–{b.end}</span>
            </button>
          ))}
        </div>

        <div className="kt2-grid">
          <div className="kt2-col">
            <div className="kt2-col-head">
              <span className="kt2-col-icon" aria-hidden="true">👑</span>
              מלכי יהודה
              <span className="kt2-col-head-count">({judah.length})</span>
            </div>
            {judah.map(k => <KingCard key={k.id} k={k} setRoute={setRoute}/>)}
            {judah.length === 0 && (
              <div className="kt2-empty">אין מלכי יהודה בתקופה זו.</div>
            )}
          </div>

          <div className="kt2-col">
            <div className="kt2-col-head">
              <span className="kt2-col-icon" aria-hidden="true">⚔️</span>
              מלכי ישראל
              <span className="kt2-col-head-count">({israel.length})</span>
            </div>
            {israel.map(k => <KingCard key={k.id} k={k} setRoute={setRoute}/>)}
            {israel.length === 0 && (
              <div className="kt2-empty">אין מלכי ישראל בתקופה זו.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function KingsTable(props){
    const EB = (typeof window !== 'undefined') && window.ErrorBoundaryComponent;
    const inner = React.createElement(KingsTableInner, props);
    return EB ? React.createElement(EB, {}, inner) : inner;
  }

  window.KingsTableComponent = KingsTable;
})();
