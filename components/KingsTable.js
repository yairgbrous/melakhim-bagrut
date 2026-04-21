/* =========================================================================
   KingsTable — authentic book-style kings table (מלכי יהודה | מלכי ישראל | מעצמות)
   Book layout reference: חוברת_מלכים.pdf pp. 66 / 142 / 178.
   RTL: [יחידה] [מלכי יהודה right] [מלכי ישראל left] [מעצמות האזור leftmost]

   Data sources (in order of preference):
     1. window.__ENTITY_INDEX__.king   (from data/kings.js — Tab A)
     2. MELAKHIM_DATA.timeline         (fallback, already in index.html)

   Exposes: window.KingsTableComponent
   ========================================================================= */
(function(){
  const { useState, useEffect, useMemo } = React;

  // Unit → theme color + empire label for מעצמות column
  const UNIT_META = {
    1: {name:"שלמה",              color:"#D4A574", empire:"מצרים"},
    2: {name:"פילוג",              color:"#A83240", empire:"מצרים · ארם"},
    3: {name:"אליהו ואחאב",        color:"#3E8E7E", empire:"ארם"},
    4: {name:"מהפכות",             color:"#6B5B95", empire:"ארם · אשור עולה"},
    5: {name:"אשור",               color:"#8B4513", empire:"אשור"},
    6: {name:"בבל",                color:"#2C3E50", empire:"בבל"}
  };

  // timeline.period → unit id
  const PERIOD_TO_UNIT = {
    "תור הזהב":     1,
    "פילוג":        2,
    "אליהו":        3,
    "מהפכות":       4,
    "שלפני אשור":   4,
    "אשור":         5,
    "בבל":          6
  };

  // Dynasty markers for Judah / Israel rows (coarse groupings, colored stripe)
  const ISRAEL_DYN = [
    {id:"yarov",   name:"בית ירבעם",    color:"#7A1F2A", kings:["ירבעם בן נבט","נדב"]},
    {id:"bashaa",  name:"בית בעשא",     color:"#4A2C6F", kings:["בעשא","אלה"]},
    {id:"zimri",   name:"זמרי",         color:"#5C1010", kings:["זמרי"]},
    {id:"omri",    name:"בית עמרי",     color:"#1E4D7A", kings:["עמרי","אחאב","אחזיה בן אחאב","יורם בן אחאב"]},
    {id:"yehu",    name:"בית יהוא",     color:"#4E6B2E", kings:["יהוא","יהואחז","יואש (ישראל)","ירבעם השני","זכריה בן ירבעם"]},
    {id:"shalom",  name:"שלום בן יבש",  color:"#5C1010", kings:["שלום בן יבש"]},
    {id:"menahem", name:"בית מנחם",     color:"#5C3A1F", kings:["מנחם בן גדי","פקחיה"]},
    {id:"pekah",   name:"פקח בן רמליהו",color:"#5C1010", kings:["פקח בן רמליהו"]},
    {id:"hoshea",  name:"הושע בן אלה",  color:"#5C1010", kings:["הושע בן אלה"]}
  ];
  const JUDAH_DYN = {name:"בית דוד", color:"#8B6F1F"};

  // Good/bad assessment icon
  const assessmentIcon = (k) => {
    const v = (k.assessment || '').toLowerCase();
    if (k.good === true || v === 'righteous' || v === 'good')  return "👑";
    if (k.good === false || v === 'wicked' || v === 'bad')     return "⚠";
    return "➖";
  };

  const dynastyOf = (dyn, name) => {
    if (dyn === "יהודה") return JUDAH_DYN;
    const d = ISRAEL_DYN.find(d => d.kings.includes(name));
    return d || {name:"ישראל", color:"#5C3A1F"};
  };

  // Resolve related entities from the live entity index.
  function gatherRelated(kingEntry){
    const idx = (typeof window!=='undefined' && window.__ENTITY_INDEX__) || {};
    const name = kingEntry.name;
    const match = (arr) => (arr||[]).filter(x => {
      const ids = [].concat(x.related_kings||[], x.kings||[], x.associated_kings||[]);
      if (ids.some(v => v===name || v===kingEntry.id)) return true;
      const s = (x.summary||'') + ' ' + (x.heading||'') + ' ' + (x.description_hebrew||'') + ' ' + (x.bio||'');
      return s.includes(name);
    });
    const prophets = match(Object.values(idx.character||{})).filter(c =>
      /נביא|הרואה|איש האלוקים/.test((c.role||'') + ' ' + (c.tags||[]).join(' '))
    );
    const places   = match(Object.values(idx.archaeology||{}));
    const events   = match(Object.values(idx.story||{}));
    return {prophets, places, events};
  }

  function pickKingsData(){
    const idx = (typeof window!=='undefined' && window.__ENTITY_INDEX__) || {};
    const live = idx.king ? Object.values(idx.king) : [];
    if (live.length > 0){
      return live.map(k => ({
        id: k.id,
        name: k.name || k.heading || k.id,
        dynasty: k.kingdom === 'israel' ? 'ישראל' : (k.kingdom === 'judah' ? 'יהודה' : (k.dynasty || 'יהודה')),
        good: k.assessment === 'righteous' ? true : (k.assessment === 'wicked' ? false : !!k.good),
        assessment: k.assessment,
        years: k.reign_years || k.years || '',
        period: k.period || '',
        unitId: k.unit || PERIOD_TO_UNIT[k.period] || 1,
        notes: k.summary || k.heading_note || k.notes || '',
        bio: k.bio || k.summary_hebrew || '',
        key_actions: k.key_actions || [],
        related_prophets: k.related_prophets || [],
        related_places:   k.related_places   || [],
        related_events:   k.related_events   || []
      }));
    }
    // Fallback: MELAKHIM_DATA.timeline
    const tl = (typeof MELAKHIM_DATA !== 'undefined' && MELAKHIM_DATA.timeline) || [];
    return tl.map((k,i) => ({
      id: 'tl-' + i + '-' + k.name.replace(/\s/g,'-'),
      name: k.name,
      dynasty: k.dynasty,
      good: !!k.good,
      years: k.years,
      period: k.period,
      unitId: PERIOD_TO_UNIT[k.period] || 1,
      notes: k.notes,
      bio: '', key_actions: [], related_prophets: [], related_places: [], related_events: []
    }));
  }

  // Interleave Judah + Israel kings into rows, grouping by unit.
  // Strategy: walk the chronologically-ordered list and emit one row per king.
  // Rows get rowspan on the יחידה column when consecutive same-unit rows.
  function buildRows(kings){
    const rows = kings.map((k, i) => ({...k, _row: i}));
    // Pre-compute rowspans for the יחידה column
    const unitSpans = {};
    let runStart = 0;
    for (let i = 1; i <= rows.length; i++){
      if (i === rows.length || rows[i].unitId !== rows[runStart].unitId){
        unitSpans[runStart] = i - runStart;
        runStart = i;
      }
    }
    return rows.map((r, i) => ({...r, _unitSpan: unitSpans[i] || 0}));
  }

  function navigateToStudyTab(tab, focusId){
    try{
      window.dispatchEvent(new CustomEvent('navigate-study', {detail:{tab, focusId}}));
    }catch(e){}
    // Best-effort: also set hash to let other listeners pick it up.
    try{ window.location.hash = '#study-' + tab + (focusId?('-'+focusId):''); }catch(e){}
  }

  function firePractice(kingId){
    try{
      window.dispatchEvent(new CustomEvent('practice-entity', {detail:{type:'king', id:kingId}}));
    }catch(e){}
  }

  function KingCell({k, side}){
    const dyn = dynastyOf(k.dynasty, k.name);
    const icon = assessmentIcon(k);
    const borderSide = side === 'judah' ? {borderRightWidth:'4px'} : {borderLeftWidth:'4px'};
    return (
      <div className="kt-king" style={{...borderSide, borderColor: dyn.color}} title={dyn.name}>
        <div className="kt-king-name hebrew">{k.name}</div>
        <div className="kt-king-meta">
          <span className="kt-badge" title="שנות מלכות">{k.years}</span>
          <span className="kt-assess" aria-label={icon==='👑'?'צדיק':icon==='⚠'?'רשע':'בינוני'}>{icon}</span>
        </div>
        {k.notes && <div className="kt-king-note">{k.notes}</div>}
      </div>
    );
  }

  function ExpandedRow({k, onPractice}){
    const rel = useMemo(() => gatherRelated(k), [k.id, k.name]);
    const chipsProphets = (k.related_prophets.length ? k.related_prophets.map(p => ({id:p, label:p})) : rel.prophets.map(c => ({id:c.id, label:c.heading||c.name}))).slice(0, 12);
    const chipsPlaces   = (k.related_places.length ? k.related_places.map(p => ({id:p, label:p})) : rel.places.map(c => ({id:c.id, label:c.heading||c.name_hebrew||c.id}))).slice(0, 12);
    const chipsEvents   = (k.related_events.length ? k.related_events.map(p => ({id:p, label:p})) : rel.events.map(c => ({id:c.id, label:c.heading||c.title||c.id}))).slice(0, 12);

    return (
      <div className="kt-expanded">
        {k.bio && (
          <div className="kt-sect">
            <div className="kt-sect-h">📖 ביוגרפיה</div>
            <p className="kt-bio">{k.bio}</p>
          </div>
        )}
        {!k.bio && k.notes && (
          <div className="kt-sect">
            <div className="kt-sect-h">📖 תקציר</div>
            <p className="kt-bio">{k.notes}</p>
          </div>
        )}
        {k.key_actions && k.key_actions.length > 0 && (
          <div className="kt-sect">
            <div className="kt-sect-h">⚡ מעשים מרכזיים</div>
            <ul className="kt-actions">{k.key_actions.map((a,i) => <li key={i}>{a}</li>)}</ul>
          </div>
        )}
        {chipsProphets.length > 0 && (
          <div className="kt-sect">
            <div className="kt-sect-h">🔮 נביאים בעת מלכותו</div>
            <div className="kt-chips">{chipsProphets.map(c =>
              <button key={c.id} className="kt-chip kt-chip-prophet" onClick={()=>navigateToStudyTab('character', c.id)}>{c.label}</button>
            )}</div>
          </div>
        )}
        {chipsPlaces.length > 0 && (
          <div className="kt-sect">
            <div className="kt-sect-h">📍 מקומות</div>
            <div className="kt-chips">{chipsPlaces.map(c =>
              <button key={c.id} className="kt-chip kt-chip-place" onClick={()=>navigateToStudyTab('place', c.id)}>{c.label}</button>
            )}</div>
          </div>
        )}
        {chipsEvents.length > 0 && (
          <div className="kt-sect">
            <div className="kt-sect-h">📜 אירועים</div>
            <div className="kt-chips">{chipsEvents.map(c =>
              <button key={c.id} className="kt-chip kt-chip-event" onClick={()=>navigateToStudyTab('event', c.id)}>{c.label}</button>
            )}</div>
          </div>
        )}
        <div className="kt-actions-row">
          <button className="gold-btn kt-practice-btn" onClick={()=>onPractice(k.id)}>
            ⚔️ תרגל על מלך זה
          </button>
        </div>
      </div>
    );
  }

  function KingsTable(){
    const [ready, setReady] = useState(!!window.__ENTITY_INDEX_READY__);
    useEffect(()=>{
      if (ready) return;
      const onReady = ()=>setReady(true);
      window.addEventListener('entity-index-ready', onReady);
      const id = setInterval(()=>{ if (window.__ENTITY_INDEX_READY__) setReady(true); }, 250);
      const bail = setTimeout(()=>setReady(true), 2500); // never block past 2.5s — we have fallback data
      return ()=>{
        window.removeEventListener('entity-index-ready', onReady);
        clearInterval(id); clearTimeout(bail);
      };
    }, [ready]);

    const [filter, setFilter]   = useState('all');
    const [onlyGood, setOnly]   = useState(false);
    const [expanded, setExpand] = useState(null);

    const all = useMemo(() => pickKingsData(), [ready]);

    const filtered = useMemo(() => {
      let list = all;
      if (filter === 'united')       list = list.filter(k => k.unitId === 1);
      else if (filter === 'split')   list = list.filter(k => k.unitId >= 2);
      else if (filter === 'preisr')  list = list.filter(k => k.unitId >= 2 && k.unitId <= 5);
      else if (filter === 'prejud')  list = list.filter(k => k.unitId >= 2 && k.unitId <= 6);
      if (onlyGood) list = list.filter(k => k.good);
      return list;
    }, [all, filter, onlyGood]);

    const rows = useMemo(() => buildRows(filtered), [filtered]);

    if (rows.length === 0){
      return (
        <div className="kt-wrap">
          <div className="kt-empty">
            <div style={{fontSize:48, marginBottom:8}}>📜</div>
            <div>לא נמצאו מלכים בסינון זה. נסה להרחיב את הסינון.</div>
          </div>
        </div>
      );
    }

    return (
      <div className="kt-wrap">
        <div className="kt-header">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-amber-300">📜 ציר המלכים</h1>
          <p className="text-amber-100/70 text-sm mt-1">
            טבלה אותנטית בעקבות חוברת מלכים — מלכי יהודה מימין, מלכי ישראל משמאל, מעצמות האזור בקצה.
          </p>
        </div>

        <div className="kt-filters">
          {[
            {v:'all',    l:'הכל'},
            {v:'united', l:'ממלכה מאוחדת'},
            {v:'split',  l:'אחרי הפילוג'},
            {v:'preisr', l:'עד חורבן ישראל'},
            {v:'prejud', l:'עד חורבן יהודה'}
          ].map(f => (
            <button key={f.v} onClick={()=>setFilter(f.v)}
              className={'kt-filter-chip ' + (filter===f.v?'active':'')}>{f.l}</button>
          ))}
          <label className="kt-toggle">
            <input type="checkbox" checked={onlyGood} onChange={e=>setOnly(e.target.checked)}/>
            <span>הצג רק צדיקים</span>
          </label>
        </div>

        <div className="kt-scroll">
          <table className="kt-table">
            <thead>
              <tr>
                <th className="kt-th kt-th-unit">יחידה</th>
                <th className="kt-th kt-th-judah">👑 מלכי יהודה</th>
                <th className="kt-th kt-th-israel">✂️ מלכי ישראל</th>
                <th className="kt-th kt-th-empire">🌍 מעצמות האזור</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((k, i) => {
                const unitMeta = UNIT_META[k.unitId] || UNIT_META[1];
                const prevUnit = i>0 ? rows[i-1].unitId : null;
                const showUnitCell = k.unitId !== prevUnit;
                const isExpanded = expanded === k.id;
                return (
                  <React.Fragment key={k.id}>
                    <tr
                      className={'kt-row ' + (isExpanded?'kt-row-expanded':'')}
                      onClick={()=>setExpand(isExpanded ? null : k.id)}
                    >
                      {showUnitCell && (
                        <td rowSpan={k._unitSpan || 1} className="kt-td kt-td-unit"
                            style={{background:unitMeta.color + '33', borderInlineEndColor:unitMeta.color}}>
                          <div className="kt-unit-band" style={{background:unitMeta.color}}/>
                          <div className="kt-unit-num">{k.unitId}</div>
                          <div className="kt-unit-name">{unitMeta.name}</div>
                        </td>
                      )}
                      <td className="kt-td kt-td-judah">
                        {k.dynasty === 'יהודה' ? <KingCell k={k} side="judah"/> : <span className="kt-empty-cell">·</span>}
                      </td>
                      <td className="kt-td kt-td-israel">
                        {k.dynasty === 'ישראל' ? <KingCell k={k} side="israel"/> : <span className="kt-empty-cell">·</span>}
                      </td>
                      {showUnitCell && (
                        <td rowSpan={k._unitSpan || 1} className="kt-td kt-td-empire"
                            style={{background:unitMeta.color + '18'}}>
                          <div className="kt-empire">{unitMeta.empire}</div>
                        </td>
                      )}
                    </tr>
                    {isExpanded && (
                      <tr className="kt-row-detail">
                        <td colSpan={4} className="kt-td-detail">
                          <ExpandedRow k={k} onPractice={firePractice}/>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="kt-legend">
          <span><span className="kt-leg-dot" style={{background:JUDAH_DYN.color}}/> בית דוד</span>
          <span><span className="kt-leg-dot" style={{background:"#1E4D7A"}}/> בית עמרי</span>
          <span><span className="kt-leg-dot" style={{background:"#4E6B2E"}}/> בית יהוא</span>
          <span>👑 צדיק · ⚠ רשע · ➖ בינוני</span>
        </div>
      </div>
    );
  }

  window.KingsTableComponent = KingsTable;
})();
