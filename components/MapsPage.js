/* =========================================================================
   MapsPage — 19-maps list grouped by unit with full-screen map view.
   Book reference: חוברת_מלכים.pdf pp. 213-214 (רשימת 19 המפות למיקוד תשפ״ו).

   Data sources (in order of preference):
     1. window.BAGRUT_MAPS_19   (from data/maps.js — Tab A delivers)
     2. window.__ENTITY_INDEX__.map
     3. BAGRUT_MAPS (6 legacy entries from index.html — graceful fallback)

   Exposes: window.MapsPageComponent
   ========================================================================= */
(function(){
  const { useState, useEffect, useMemo } = React;

  const UNIT_COLOR = {
    1: "#D4A574", 2: "#A83240", 3: "#3E8E7E",
    4: "#6B5B95", 5: "#8B4513", 6: "#2C3E50"
  };
  const UNIT_TITLE = {
    1: "יחידה א · מלכות שלמה",
    2: "יחידה ב · פילוג הממלכה",
    3: "יחידה ג · אליהו ואחאב",
    4: "יחידה ד · מהפכות ותמורות",
    5: "יחידה ה · הכיבוש האשורי",
    6: "יחידה ו · חורבן יהודה"
  };

  function normalizeMap(m, idx){
    // Accept either rich maps (data/maps.js) or legacy BAGRUT_MAPS entries.
    const required_places = m.required_places || (m.locs || []).map(l => ({
      name: l.n || l.name || '',
      description: l.d || l.description || '',
      required_for_exam: (l.required_for_exam !== false)
    }));
    return {
      id: m.id || ('map-' + idx),
      number: m.number || m.map_number || (idx + 1),
      unit: m.unit || 1,
      title: m.title || m.name || 'מפה',
      subtitle: m.subtitle || m.content_description || '',
      required_places,
      notes: [].concat(m.notes || m.bagrut_notes || []).filter(Boolean),
      book_page: m.book_page || m.page || null,
      required_for_exam: m.required_for_exam !== false
    };
  }

  function pickMapsData(){
    if (typeof window.BAGRUT_MAPS_19 !== 'undefined' && Array.isArray(window.BAGRUT_MAPS_19) && window.BAGRUT_MAPS_19.length > 0){
      return window.BAGRUT_MAPS_19.map(normalizeMap);
    }
    const idx = (typeof window!=='undefined' && window.__ENTITY_INDEX__) || {};
    if (idx.map && Object.keys(idx.map).length > 0){
      return Object.values(idx.map).map(normalizeMap);
    }
    const legacy = (typeof BAGRUT_MAPS !== 'undefined' && Array.isArray(BAGRUT_MAPS)) ? BAGRUT_MAPS : [];
    return legacy.map(normalizeMap);
  }

  function goToStudyPlace(placeId){
    try{ window.dispatchEvent(new CustomEvent('navigate-study', {detail:{tab:'place', focusId:placeId}})); }catch(e){}
    try{ window.location.hash = '#study-place-' + encodeURIComponent(placeId || ''); }catch(e){}
  }

  // Deterministic pseudo-random positions for pins based on place name.
  function hashString(s){
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) & 0xffffffff;
    return Math.abs(h);
  }
  function pinPos(name, i){
    const h1 = hashString(name + ':x:' + i);
    const h2 = hashString(name + ':y:' + i);
    const x = 10 + (h1 % 80); // 10..90 %
    const y = 15 + (h2 % 70); // 15..85 %
    return {x, y};
  }

  function MapFullView({map, onBack}){
    const color = UNIT_COLOR[map.unit] || "#D4A574";
    return (
      <div className="mp-full">
        <div className="mp-full-head" style={{background:color}}>
          <button onClick={onBack} className="mp-back">→ חזור</button>
          <div className="mp-full-title-wrap">
            <div className="mp-full-num">מפה {map.number}</div>
            <h2 className="font-display mp-full-title">{map.title}</h2>
            {map.subtitle && <p className="mp-full-sub">{map.subtitle}</p>}
          </div>
        </div>
        <div className="mp-canvas-wrap">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mp-canvas">
            <defs>
              <linearGradient id={'mpGrad-' + map.id} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
                <stop offset="100%" stopColor={color} stopOpacity="0.08"/>
              </linearGradient>
              <pattern id={'mpGrid-' + map.id} width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke={color} strokeOpacity="0.18" strokeWidth="0.3"/>
              </pattern>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill={'url(#mpGrad-' + map.id + ')'}/>
            <rect x="0" y="0" width="100" height="100" fill={'url(#mpGrid-' + map.id + ')'}/>
            <path d="M 20 0 Q 30 30 22 60 T 35 100"
                  stroke={color} strokeOpacity="0.55" strokeWidth="0.6" fill="none" strokeDasharray="1.2 1.2"/>
            <path d="M 0 72 Q 40 65 100 78"
                  stroke={color} strokeOpacity="0.55" strokeWidth="0.6" fill="none" strokeDasharray="1.2 1.2"/>
          </svg>
          {map.required_places.map((p, i) => {
            const pos = pinPos(p.name || p.id || ('p' + i), i);
            return (
              <button key={i}
                className="mp-pin"
                style={{left: pos.x + '%', top: pos.y + '%', borderColor: color}}
                onClick={()=>goToStudyPlace(p.id || p.name)}
                title={p.description || p.name}
              >
                <span className="mp-pin-dot" style={{background: color}}/>
                <span className="mp-pin-label">📍 {p.name}</span>
              </button>
            );
          })}
        </div>
        <div className="mp-full-list">
          <h3 className="mp-full-list-h">מקומות לבגרות</h3>
          <div className="mp-full-list-grid">
            {map.required_places.map((p, i) => (
              <button key={i} onClick={()=>goToStudyPlace(p.id || p.name)}
                className="mp-place-pill" style={{borderColor: color}}>
                <span className="mp-place-name">📍 {p.name}</span>
                {p.description && <span className="mp-place-desc">{p.description}</span>}
              </button>
            ))}
          </div>
          {map.notes.length > 0 && (
            <div className="mp-notes">
              {map.notes.map((n, i) => (
                <div key={i} className="mp-note-callout">💡 {n}</div>
              ))}
            </div>
          )}
          {map.book_page && (
            <div className="mp-book-ref">📖 עיון בספר — עמוד {map.book_page}</div>
          )}
        </div>
      </div>
    );
  }

  function MapCard({map, onOpen}){
    const color = UNIT_COLOR[map.unit] || "#D4A574";
    return (
      <button onClick={onOpen} className="mp-card" style={{borderColor: color}}>
        <div className="mp-card-band" style={{background: color}}>
          <span className="mp-card-num">{map.number}</span>
          <span className="mp-card-unit">יחידה {map.unit}</span>
        </div>
        <div className="mp-card-body">
          <h3 className="font-display mp-card-title">{map.title}</h3>
          {map.subtitle && <p className="mp-card-sub">{map.subtitle}</p>}
          <div className="mp-card-places">
            {map.required_places.slice(0, 6).map((p, i) =>
              <span key={i} className="mp-place-chip">📍 {p.name}</span>
            )}
            {map.required_places.length > 6 &&
              <span className="mp-place-chip mp-place-more">+{map.required_places.length - 6}</span>
            }
          </div>
          {map.notes.length > 0 && (
            <div className="mp-card-note">💡 {map.notes[0]}</div>
          )}
          {map.book_page && (
            <div className="mp-card-page">עמוד {map.book_page}</div>
          )}
        </div>
      </button>
    );
  }

  function MapsPage(){
    const [ready, setReady] = useState(!!window.__ENTITY_INDEX_READY__);
    useEffect(()=>{
      if (ready) return;
      const onReady = ()=>setReady(true);
      window.addEventListener('entity-index-ready', onReady);
      const id = setInterval(()=>{ if (window.__ENTITY_INDEX_READY__) setReady(true); }, 250);
      const bail = setTimeout(()=>setReady(true), 2500);
      return ()=>{
        window.removeEventListener('entity-index-ready', onReady);
        clearInterval(id); clearTimeout(bail);
      };
    }, [ready]);

    const [unitFilter, setUnitFilter] = useState(0); // 0 = all
    const [examOnly, setExamOnly]     = useState(false);
    const [openMap, setOpenMap]       = useState(null);

    const maps = useMemo(() => pickMapsData(), [ready]);

    const filtered = useMemo(() => {
      let list = maps;
      if (unitFilter) list = list.filter(m => m.unit === unitFilter);
      if (examOnly) list = list.filter(m => m.required_places.some(p => p.required_for_exam));
      return list;
    }, [maps, unitFilter, examOnly]);

    const byUnit = useMemo(() => {
      const g = {};
      filtered.forEach(m => { (g[m.unit] = g[m.unit] || []).push(m); });
      return g;
    }, [filtered]);

    if (openMap){
      return <MapFullView map={openMap} onBack={()=>setOpenMap(null)}/>;
    }

    return (
      <div className="mp-wrap">
        <div className="mp-header">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-amber-300">🗺️ מפות הבגרות</h1>
          <p className="text-amber-100/70 text-sm mt-1">
            רשימת המפות למיקוד תשפ״ו — מאורגנת לפי היחידות. לחץ על מפה לתצוגת מלאה עם סיכות.
          </p>
          <div className="parchment rounded-2xl p-4 mp-tip">
            <p className="text-amber-900 text-sm">
              💡 <strong>טיפ לבגרות:</strong> בבחינה לוקחים תנ״ך שלם ללא פירושים.
              סמן את המקומות החשובים במפות שבסוף התנ״ך.
            </p>
          </div>
        </div>

        <div className="mp-filters">
          <div className="mp-filters-row">
            <button onClick={()=>setUnitFilter(0)}
              className={'mp-filter-chip ' + (unitFilter===0?'active':'')}>הכל</button>
            {[1,2,3,4,5,6].map(u => (
              <button key={u} onClick={()=>setUnitFilter(u)}
                className={'mp-filter-chip ' + (unitFilter===u?'active':'')}
                style={unitFilter===u ? {background: UNIT_COLOR[u], color:'#fff'} : null}>
                יחידה {u}
              </button>
            ))}
          </div>
          <label className="mp-toggle">
            <input type="checkbox" checked={examOnly} onChange={e=>setExamOnly(e.target.checked)}/>
            <span>מפות חובה לבגרות בלבד</span>
          </label>
        </div>

        {filtered.length === 0 ? (
          <div className="mp-empty">
            <div style={{fontSize:48, marginBottom:8}}>🗺️</div>
            <div>לא נמצאו מפות בסינון זה.</div>
          </div>
        ) : Object.keys(byUnit).sort((a,b)=>+a-+b).map(unitId => (
          <section key={unitId} className="mp-section">
            <h2 className="mp-section-h" style={{color: UNIT_COLOR[unitId]}}>
              <span className="mp-section-bar" style={{background: UNIT_COLOR[unitId]}}/>
              {UNIT_TITLE[unitId]}
              <span className="mp-section-count">{byUnit[unitId].length} מפות</span>
            </h2>
            <div className="mp-grid">
              {byUnit[unitId].map(m =>
                <MapCard key={m.id} map={m} onOpen={()=>setOpenMap(m)}/>
              )}
            </div>
          </section>
        ))}

        <div className="mp-total">
          סה״כ {maps.length} מפות · מציג {filtered.length}
        </div>
      </div>
    );
  }

  window.MapsPageComponent = MapsPage;
})();
