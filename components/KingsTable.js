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
  const { useState, useEffect, useMemo, useRef } = React;

  // ---------- Inject assess-* palette + extra KT styles (idempotent) --------
  (function injectStyles(){
    if (typeof document === 'undefined') return;
    if (document.getElementById('kt-assess-styles')) return;
    const s = document.createElement('style');
    s.id = 'kt-assess-styles';
    s.textContent = `
      .kt-king.assess-tzadik{background:linear-gradient(135deg,#d4f5d4,#a8e6a1);border-color:#2d7a2d;color:#1a4d1a}
      .kt-king.assess-rasha {background:linear-gradient(135deg,#fad4d4,#e6a1a1);border-color:#8b2d2d;color:#4d1a1a}
      .kt-king.assess-mixed {background:linear-gradient(135deg,#f5e8b8,#e6d184);border-color:#8b6d2d;color:#4d3e1a}
      .kt-king.assess-tzadik .kt-king-name,.kt-king.assess-rasha .kt-king-name,.kt-king.assess-mixed .kt-king-name{color:inherit}
      .kt-king-dyn{font-size:11px;font-weight:700;opacity:.85;line-height:1.1;margin-top:-2px}
      .kt-assess-pill{display:inline-block;padding:1px 7px;border-radius:999px;font-size:10px;font-weight:800;letter-spacing:.02em}
      .kt-assess-pill.assess-tzadik{background:#2d7a2d;color:#d4f5d4}
      .kt-assess-pill.assess-rasha {background:#8b2d2d;color:#fad4d4}
      .kt-assess-pill.assess-mixed {background:#8b6d2d;color:#f5e8b8}
      .kt-th-prophets{width:160px}
      .kt-td-prophets{text-align:center;font-size:12px;padding:6px;border-inline-start:1px solid rgba(212,165,116,.15);border-inline-end:1px solid rgba(212,165,116,.15)}
      .kt-td-prophets .kt-chip{display:inline-block;margin:2px 2px}
      .kt-foreign-chip{display:inline-block;margin:2px 0;padding:3px 8px;border-radius:999px;background:rgba(168,50,64,.25);color:#F1B5BE;border:1px solid rgba(168,50,64,.5);font-size:11px;font-weight:700;cursor:default}
      .kt-foreign-chip + .kt-foreign-chip{margin-top:3px}
      html[data-theme='light'] .kt-td-prophets{color:#3a2a0d}
      .kt-kill-chip{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:999px;background:rgba(139,45,45,.25);color:#ffd6d6;border:1px solid rgba(139,45,45,.55);font-size:11px;font-weight:700;cursor:pointer}
      .kt-kill-chip:hover{background:rgba(139,45,45,.4)}
      .kt-kill-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:4px 0 2px}
      .kt-kill-row-label{font-size:12px;font-weight:800;color:#C89B3C}
      .kt-full-link{display:inline-block;margin-inline-start:8px;padding:8px 14px;border-radius:12px;background:rgba(107,91,149,.25);color:#C9B8E0;border:1px solid #6B5B95;font-weight:800;text-decoration:none;cursor:pointer}
      .kt-full-link:hover{background:rgba(107,91,149,.45)}
      .kt-chain-toggle{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:rgba(139,45,45,.2);border:1px solid rgba(139,45,45,.6);color:#ffd6d6;font-size:12px;font-weight:800;cursor:pointer}
      .kt-chain-toggle.on{background:rgba(139,45,45,.6);color:#fff}
      .kt-chain-svg{position:absolute;inset:0;pointer-events:none;z-index:4}
      .kt-table-rel{position:relative}
      .kt-quote-cite{font-family:'Frank Ruhl Libre',serif;font-size:13.5px;line-height:1.55;padding:6px 10px;border-inline-start:3px solid #C89B3C;background:rgba(212,165,116,.08);border-radius:6px;color:inherit}
      /* ---- timeline grid ---- */
      .kt-tl{position:relative;display:grid;direction:rtl;gap:0;padding:12px 8px;background:rgba(10,22,40,.6);border:1px solid rgba(212,165,116,.25);border-radius:14px;overflow:hidden}
      html[data-theme='light'] .kt-tl{background:rgba(247,241,225,.55)}
      .kt-tl-head{position:sticky;top:0;z-index:3;display:grid;background:rgba(10,22,40,.92);backdrop-filter:blur(6px);border-bottom:1px solid rgba(212,165,116,.4);font-weight:800;color:#F5D670}
      html[data-theme='light'] .kt-tl-head{background:rgba(247,241,225,.95);color:#5A4517}
      .kt-tl-head > div{padding:8px 6px;text-align:center;font-size:13px;border-inline-start:1px solid rgba(212,165,116,.25)}
      .kt-tl-head > div:first-child{border-inline-start:none}
      .kt-tl-year{display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:800;color:rgba(245,214,112,.75);position:relative;border-inline-start:1px dashed rgba(212,165,116,.18)}
      .kt-tl-year::after{content:'';position:absolute;inset-inline:-2000px 0;top:50%;border-top:1px dashed rgba(212,165,116,.12);z-index:0}
      html[data-theme='light'] .kt-tl-year{color:#8B6F1F}
      .kt-tl-king{margin:1px 3px;display:flex;flex-direction:column;justify-content:flex-start;padding:6px 8px;border-radius:8px;border:1px solid rgba(212,165,116,.4);overflow:hidden;cursor:pointer;min-width:0;position:relative;z-index:1}
      .kt-tl-king .kt-king-name{font-family:'Frank Ruhl Libre',serif;font-weight:900;font-size:15px;line-height:1.15;color:inherit}
      .kt-tl-king .kt-king-dyn{font-size:10.5px;font-weight:700;opacity:.82;margin-top:1px}
      .kt-tl-king .kt-king-yrs{font-size:10px;opacity:.75;margin-top:2px;font-variant-numeric:tabular-nums;direction:ltr;display:inline-block}
      .kt-tl-king .kt-assess-pill{align-self:flex-start;margin-top:3px;font-size:9.5px;padding:0 6px}
      .kt-tl-king.kt-tl-short{padding:3px 6px}
      .kt-tl-king.kt-tl-short .kt-king-name{font-size:11.5px}
      .kt-tl-king.kt-tl-short .kt-king-dyn,.kt-tl-king.kt-tl-short .kt-king-yrs,.kt-tl-king.kt-tl-short .kt-assess-pill{display:none}
      .kt-tl-empty{border:1px dashed rgba(212,165,116,.18);border-radius:6px;margin:2px 4px;background:rgba(0,0,0,.06);opacity:.55;display:flex;align-items:center;justify-content:center;color:rgba(245,214,112,.35);font-size:11px;z-index:0}
      html[data-theme='light'] .kt-tl-empty{color:rgba(90,69,23,.4);background:rgba(255,255,255,.25)}
      .kt-tl-prophet-group{margin:2px 4px;display:flex;flex-wrap:wrap;gap:3px;align-content:flex-start;padding:3px 4px;border-radius:6px;background:rgba(107,91,149,.10);border:1px dashed rgba(107,91,149,.35);overflow:hidden;z-index:1}
      .kt-tl-prophet-group .kt-chip{font-size:10.5px;padding:2px 7px}
      .kt-tl-foreign-group{margin:2px 4px;display:flex;flex-direction:column;gap:3px;padding:3px 5px;border-radius:6px;background:rgba(168,50,64,.10);border:1px dashed rgba(168,50,64,.35);overflow:hidden;z-index:1}
      .kt-tl-foreign-group .kt-foreign-chip{font-size:10.5px;padding:2px 7px}
      .kt-tl-decade-line{grid-column:1 / -1;height:0;border-top:1px solid rgba(212,165,116,.22);z-index:0;pointer-events:none}
      .kt-tl-era-sep{grid-column:1 / -1;height:0;border-top:2px solid rgba(212,165,116,.45);z-index:0;pointer-events:none}
      .kt-tl-king-selected{box-shadow:0 0 0 3px #C89B3C, 0 0 16px rgba(200,155,60,.55)}
    `;
    document.head.appendChild(s);
  })();

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

  // Assessment → class + hex color (NO EMOJIS). Delegates to KingsUtils when
  // present so the same rule applies across table + character pages.
  const assessmentClass = (k) => {
    const KU = (typeof window!=='undefined') && window.KingsUtils;
    if (KU && KU.assessmentColor) return KU.assessmentColor(k);
    const v = (k.assessment || '').toLowerCase();
    if (k.good === true  || v === 'righteous' || v === 'good')
      return { hex:'#2d7a2d', cls:'assess-tzadik' };
    if (k.good === false || v === 'wicked'    || v === 'bad')
      return { hex:'#8b2d2d', cls:'assess-rasha' };
    return { hex:'#8b6d2d', cls:'assess-mixed' };
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

  // Normalize kingdom strings from either 'judah/israel/united' or Hebrew.
  function normKingdom(kk){
    const v = (kk.kingdom || '').toLowerCase();
    if (v === 'judah' || kk.kingdom === 'יהודה') return 'יהודה';
    if (v === 'israel' || kk.kingdom === 'ישראל') return 'ישראל';
    if (v === 'united' || kk.kingdom === 'מאוחדת') return 'יהודה'; // Solomon renders in Judah column
    return kk.kingdom || 'יהודה';
  }
  function assessmentToGood(a){
    if (a === 'צדיק' || a === 'righteous' || a === 'good') return true;
    if (a === 'רשע'  || a === 'wicked'    || a === 'bad')  return false;
    return null; // מעורב / mixed
  }
  // era 1..6 → MELAKHIM_DATA.units.id is 1..6, so unitId = era directly.
  function pickKingsData(){
    const raw = (typeof window!=='undefined' && window.KINGS_DATA) || [];
    if (raw.length > 0){
      return raw.map(k => ({
        id: k.id,
        name: k.name_niqqud || k.name || k.id,
        name_niqqud: k.name_niqqud || '',
        dynasty: normKingdom(k),              // 'יהודה' | 'ישראל'
        house:   k.dynasty || '',             // 'בית דוד' | 'בית עמרי' | …
        good: assessmentToGood(k.assessment),
        assessment: k.assessment,
        assessment_quote: k.assessment_quote || '',
        years: k.reign_years != null ? (k.reign_years + ' שנ׳') : '',
        period: '',                           // period label not used when era present
        unitId: k.era || 1,
        era: k.era || 1,
        notes: (k.short_summary || '').split('.').slice(0,1).join('.') + '.',
        bio: k.short_summary || '',
        short_summary: k.short_summary || '',
        key_actions: [],
        related_prophets: k.related_prophets || [],
        related_places:   k.related_places   || [],
        related_events:   k.related_events   || [],
        killed:    k.killed || [],
        killed_by: k.killed_by || null,
        succession_type: k.succession_type || '',
        book_page: k.book_page || null,
        reign_start_bce: k.reign_start_bce,
        reign_end_bce:   k.reign_end_bce,
        reign_years:     k.reign_years
      }));
    }
    // Legacy fallback: __ENTITY_INDEX__.king (if kings.js not yet loaded)
    const idx = (typeof window!=='undefined' && window.__ENTITY_INDEX__) || {};
    const live = idx.king ? Object.values(idx.king) : [];
    if (live.length > 0){
      return live.map(k => ({
        id: k.id,
        name: k.name || k.heading || k.id,
        dynasty: normKingdom(k),
        house: k.dynasty || '',
        good: assessmentToGood(k.assessment),
        assessment: k.assessment,
        assessment_quote: k.assessment_quote || '',
        years: k.reign_years || k.years || '',
        period: k.period || '',
        unitId: k.era || k.unit || PERIOD_TO_UNIT[k.period] || 1,
        era: k.era || 1,
        notes: k.summary || k.heading_note || k.notes || '',
        bio: k.short_summary || k.bio || '',
        short_summary: k.short_summary || '',
        key_actions: k.key_actions || [],
        related_prophets: k.related_prophets || [],
        related_places:   k.related_places   || [],
        related_events:   k.related_events   || [],
        killed:    k.killed || [],
        killed_by: k.killed_by || null
      }));
    }
    // Last-resort fallback: MELAKHIM_DATA.timeline (pre-kings.js shape).
    const tl = (typeof MELAKHIM_DATA !== 'undefined' && MELAKHIM_DATA.timeline) || [];
    return tl.map((k,i) => ({
      id: 'tl-' + i + '-' + k.name.replace(/\s/g,'-'),
      name: k.name, dynasty: k.dynasty, good: !!k.good,
      years: k.years, period: k.period, unitId: PERIOD_TO_UNIT[k.period] || 1,
      era: PERIOD_TO_UNIT[k.period] || 1, notes: k.notes,
      bio: '', key_actions: [], related_prophets: [], related_places: [], related_events: [],
      killed: [], killed_by: null
    }));
  }

  // Build rows by ERA. kings.js lists all 20 Judah kings first and then all
  // 19 Israel kings, so the old "pair-adjacent" heuristic never paired anything
  // and the Israel column appeared empty next to Judah kings. Instead: for each
  // era (1..6), bucket kings by kingdom, then emit max(|judah|,|israel|) rows
  // pairing by positional index (רחבעם #0 ↔ ירבעם #0, אביה #1 ↔ נדב #1, …).
  // After era 5 Israel is gone so only Judah cells remain.
  function buildRows(kings){
    const byEra = new Map();
    kings.forEach(k => {
      const e = k.unitId || k.era || 1;
      if (!byEra.has(e)) byEra.set(e, {judah:[], israel:[]});
      const b = byEra.get(e);
      if (k.dynasty === 'ישראל') b.israel.push(k);
      else b.judah.push(k);   // Judah + united (Solomon) render in Judah column.
    });
    const eras = [...byEra.keys()].sort((a,b)=>a-b);
    const out = [];
    eras.forEach(era => {
      const {judah, israel} = byEra.get(era);
      const n = Math.max(judah.length, israel.length, 1);
      for (let i = 0; i < n; i++){
        const j = judah[i]  || null;
        const s = israel[i] || null;
        const primary = j || s;
        if (!primary) continue;
        out.push({ ...primary, unitId: era, era, _j: j, _s: s, _paired: !!(j && s) });
      }
    });
    // Rowspan for the יחידה column per era run (rows are already era-sorted).
    const unitSpans = {};
    let runStart = 0;
    for (let i = 1; i <= out.length; i++){
      if (i === out.length || out[i].unitId !== out[runStart].unitId){
        unitSpans[runStart] = i - runStart;
        runStart = i;
      }
    }
    return out.map((r,i)=>({...r, _unitSpan: unitSpans[i] || 0}));
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
    const KU = (typeof window!=='undefined') && window.KingsUtils;
    const dyn = (KU && KU.dynastyBadge) ? KU.dynastyBadge(k) : dynastyOf(k.dynasty, k.name);
    const col = assessmentClass(k);
    const borderSide = side === 'judah' ? {borderRightWidth:'5px'} : {borderLeftWidth:'5px'};
    const kindLabel = col.cls==='assess-tzadik' ? 'צדיק' : col.cls==='assess-rasha' ? 'רשע' : 'מעורב';
    return (
      <div
        className={"kt-king " + col.cls}
        data-kid={k.id}
        style={{...borderSide, borderColor: dyn.color}}
        title={dyn.name + ' · ' + kindLabel}
        aria-label={k.name + ' · ' + kindLabel}
      >
        <div className="kt-king-name hebrew">{k.name}</div>
        <div className="kt-king-dyn" style={{color:dyn.color}}>{dyn.name}</div>
        <div className="kt-king-meta">
          <span className="kt-badge" title="שנות מלכות">{k.years}</span>
          <span className={"kt-assess-pill " + col.cls}>{kindLabel}</span>
        </div>
        {k.notes && <div className="kt-king-note">{k.notes}</div>}
      </div>
    );
  }

  function ExpandedRow({k, onPractice, allKings}){
    const KU = window.KingsUtils;
    const killedBy = useMemo(()=> (KU && allKings) ? KU.killed_by(allKings, k.id) : [], [k.id, allKings]);
    const killedOf = useMemo(()=> (KU && allKings) ? KU.killed(allKings, k.id)    : [], [k.id, allKings]);
    const foreign  = useMemo(()=> (KU ? KU.foreign_event_for(k) : null), [k.id]);
    const openFull = () => { if (KU) KU.navigateToCharacter(k.id); };
    const goKing = (id) => { if (id && KU) KU.navigateToCharacter(id); };
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
              <button key={c.id} className="kt-chip kt-chip-prophet" onClick={()=>{ const KU=window.KingsUtils; if(KU) KU.navigateToCharacter(c.id); else navigateToStudyTab('character', c.id); }}>{c.label}</button>
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
        {(killedBy.length>0 || killedOf.length>0) && (
          <div className="kt-sect">
            <div className="kt-sect-h">⚔️ שרשרת רצח / ירושה בכוח</div>
            {killedBy.length>0 && (
              <div className="kt-kill-row">
                <span className="kt-kill-row-label">נהרג על ידי:</span>
                {killedBy.map((p,i)=>(
                  <span key={i} className="kt-kill-chip" onClick={(e)=>{e.stopPropagation(); goKing(p.killer_id);}}>
                    {p.killer_name}{p.note?` · ${p.note}`:''}
                  </span>
                ))}
              </div>
            )}
            {killedOf.length>0 && (
              <div className="kt-kill-row">
                <span className="kt-kill-row-label">הרג את:</span>
                {killedOf.map((p,i)=>(
                  <span key={i} className="kt-kill-chip" onClick={(e)=>{e.stopPropagation(); goKing(p.victim_id);}}>
                    {p.victim_name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        {foreign && (
          <div className="kt-sect">
            <div className="kt-sect-h">🌍 מעצמה זרה</div>
            <div className="kt-foreign-chip" style={{display:'inline-block'}}>
              <strong>{foreign.name}</strong> ({foreign.empire}) — {foreign.event}
              {foreign.book_ref && <span style={{opacity:.7}}> · {foreign.book_ref}</span>}
            </div>
          </div>
        )}
        <div className="kt-actions-row" style={{flexWrap:'wrap',gap:10}}>
          <button className="gold-btn kt-practice-btn" onClick={(e)=>{e.stopPropagation(); onPractice(k.id);}}>
            ⚔️ תרגל על מלך זה
          </button>
          <button className="kt-full-link" onClick={(e)=>{e.stopPropagation(); openFull();}}>
            📖 פתח דף מלא
          </button>
        </div>
      </div>
    );
  }

  function ProphetsCell({k}){
    const KU = window.KingsUtils;
    if (!KU || !KU.prophets_by_reign) return <span className="kt-empty-cell">·</span>;
    const chars = Object.values(((window.__ENTITY_INDEX__||{}).character)||{});
    const list = KU.prophets_by_reign(chars, k);
    if (!list.length) return <span className="kt-empty-cell" aria-hidden="true">·</span>;
    const go = (id) => { try { KU.navigateToCharacter(id); } catch(e){} };
    return (
      <div onClick={e=>e.stopPropagation()}>
        {list.slice(0,6).map(p => (
          <button key={p.id} className="kt-chip kt-chip-prophet" onClick={()=>go(p.id)}>{p.name}</button>
        ))}
      </div>
    );
  }

  function ForeignCell({k}){
    const KU = window.KingsUtils;
    if (!KU || !KU.foreign_event_for) return null;
    const f = KU.foreign_event_for(k);
    if (!f) return null;
    return (
      <div className="kt-foreign-chip" title={f.book_ref}>
        <div style={{fontWeight:800}}>{f.name} <span style={{opacity:.8,fontWeight:600}}>({f.empire})</span></div>
        <div style={{fontSize:10.5,lineHeight:1.3,marginTop:2}}>{f.event}</div>
        {f.book_ref && <div style={{fontSize:10,opacity:.7,marginTop:2}}>{f.book_ref}</div>}
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
    const [showChain, setShowChain] = useState(false);
    const [chainLines, setChainLines] = useState([]);
    const tableWrapRef = useRef(null);

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

    useEffect(() => {
      if (!showChain) { setChainLines([]); return; }
      const KU = window.KingsUtils;
      if (!KU) return;
      const recompute = () => {
        const wrap = tableWrapRef.current;
        if (!wrap) return;
        const wbox = wrap.getBoundingClientRect();
        const byId = {};
        wrap.querySelectorAll('[data-kid]').forEach(el => { byId[el.getAttribute('data-kid')] = el; });
        const chain = KU.succession_chain(all).filter(p => p.killer_id && p.killer_id !== p.victim_id);
        const lines = chain.map(p => {
          const v = byId[p.victim_id], k = byId[p.killer_id];
          if (!v || !k) return null;
          const vb = v.getBoundingClientRect(), kb = k.getBoundingClientRect();
          return {
            id: p.victim_id+'>'+p.killer_id,
            x1: vb.left + vb.width/2 - wbox.left,
            y1: vb.top  + vb.height/2 - wbox.top,
            x2: kb.left + kb.width/2 - wbox.left,
            y2: kb.top  + kb.height/2 - wbox.top,
            label: p.killer_name + ' ← ' + p.victim_name
          };
        }).filter(Boolean);
        setChainLines(lines);
      };
      recompute();
      const onR = () => recompute();
      window.addEventListener('resize', onR);
      const wrap = tableWrapRef.current;
      wrap && wrap.addEventListener('scroll', onR, {passive:true});
      return () => {
        window.removeEventListener('resize', onR);
        wrap && wrap.removeEventListener('scroll', onR);
      };
    }, [showChain, rows, expanded, all]);

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
          <h1 className="font-display text-2xl md:text-3xl font-bold text-on-parchment-accent">📜 ציר המלכים</h1>
          <p className="text-on-parchment-muted text-sm mt-1">
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
          <button
            onClick={()=>setShowChain(v=>!v)}
            className={"kt-chain-toggle " + (showChain?'on':'')}
            aria-pressed={showChain}
            title="הצג קווי רצח בין מלכים"
          >
            {showChain ? '✕ הסתר שרשרת רצח' : '⚔️ הצג שרשרת הרצח'}
          </button>
        </div>

        {(() => {
          // ---------- Timeline view (proportional reign heights) ----------
          const kingsWithDates = filtered.filter(k => k.reign_start_bce != null && k.reign_end_bce != null);
          if (kingsWithDates.length === 0) return null;
          const topY = Math.max(...kingsWithDates.map(k => k.reign_start_bce));
          const botY = Math.min(...kingsWithDates.map(k => k.reign_end_bce));
          const PX  = 14;                                          // px per year
          const rowOf = (y) => topY - y + 1;                        // BCE → grid row
          const totalRows = topY - botY + 1;
          const GRID_COLS = '55px 1fr 160px 1fr 130px';
          const KU = window.KingsUtils;
          const decades = [];
          for (let y = Math.floor(topY/10)*10; y >= botY; y -= 10) if (y <= topY) decades.push(y);
          const chars = Object.values(((window.__ENTITY_INDEX__||{}).character)||{});
          const toggle = (id) => setExpand(expanded === id ? null : id);

          return (
            <div className="kt-tl-wrap" ref={tableWrapRef} style={{position:'relative'}}>
              {showChain && chainLines.length > 0 && (
                <svg className="kt-chain-svg" width="100%" height="100%"
                     style={{position:'absolute',inset:0,overflow:'visible',pointerEvents:'none',zIndex:5}}>
                  <defs>
                    <marker id="kt-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#d94444"/>
                    </marker>
                  </defs>
                  {chainLines.map(L => (
                    <line key={L.id} x1={L.x1} y1={L.y1} x2={L.x2} y2={L.y2}
                          stroke="#d94444" strokeWidth="2.5" strokeDasharray="6 4"
                          markerEnd="url(#kt-arrow)" opacity="0.9">
                      <title>{L.label}</title>
                    </line>
                  ))}
                </svg>
              )}
              <div className="kt-tl-head" style={{gridTemplateColumns:GRID_COLS}}>
                <div>שנה לפנה״ס</div>
                <div>מלכי יהודה</div>
                <div>נביאים</div>
                <div>מלכי ישראל</div>
                <div>מעצמות</div>
              </div>
              <div className="kt-tl" style={{gridTemplateColumns:GRID_COLS, gridTemplateRows:`repeat(${totalRows}, ${PX}px)`}}>
                {decades.map(y => (
                  <div key={'yr'+y} className="kt-tl-year"
                       style={{gridColumn:1, gridRow:`${rowOf(y)} / ${rowOf(y)+1}`}}>
                    {y}
                  </div>
                ))}
                {kingsWithDates.map(k => {
                  const isJudah = k.dynasty === 'יהודה';
                  const startR  = rowOf(k.reign_start_bce);
                  const endR    = rowOf(k.reign_end_bce) + 1;
                  const span    = Math.max(1, endR - startR);
                  const short   = span < 3;
                  const col     = isJudah ? 2 : 4;
                  const ci      = KU ? KU.assessmentColor(k) : {cls:'assess-mixed', hex:'#8b6d2d'};
                  const dyn     = KU ? KU.dynastyBadge(k) : null;
                  const lbl     = ci.cls==='assess-tzadik' ? 'צדיק' : ci.cls==='assess-rasha' ? 'רשע' : 'מעורב';
                  return (
                    <div
                      key={k.id}
                      data-kid={k.id}
                      className={'kt-tl-king ' + ci.cls + (short?' kt-tl-short':'') + (expanded===k.id?' kt-tl-king-selected':'')}
                      style={{
                        gridColumn: col,
                        gridRow: `${startR} / ${startR + span}`,
                        borderInlineEndWidth: isJudah ? '5px' : '1px',
                        borderInlineStartWidth: isJudah ? '1px' : '5px',
                        borderColor: (dyn && dyn.color) || ci.hex
                      }}
                      onClick={()=>toggle(k.id)}
                      title={k.name + ' · ' + lbl + ' · ' + k.reign_start_bce + '–' + k.reign_end_bce + ' לפנה״ס · ' + (k.reign_years||'?') + ' שנים'}
                    >
                      <div className="kt-king-name hebrew">{k.name}</div>
                      {!short && dyn && <div className="kt-king-dyn" style={{color:dyn.color}}>{dyn.name}</div>}
                      {!short && <div className="kt-king-yrs">{k.reign_start_bce}–{k.reign_end_bce} · {k.reign_years||'?'} שנ׳</div>}
                      {!short && <span className={'kt-assess-pill ' + ci.cls}>{lbl}</span>}
                    </div>
                  );
                })}
                {kingsWithDates.map(k => {
                  const list = KU ? KU.prophets_by_reign(chars, k) : [];
                  if (!list.length) return null;
                  const startR = rowOf(k.reign_start_bce);
                  const endR   = rowOf(k.reign_end_bce) + 1;
                  return (
                    <div key={'p-'+k.id} className="kt-tl-prophet-group"
                         style={{gridColumn:3, gridRow:`${startR} / ${Math.max(startR+1,endR)}`}}
                         onClick={e=>e.stopPropagation()}>
                      {list.slice(0,6).map(p => (
                        <button key={p.id} className="kt-chip kt-chip-prophet"
                                onClick={()=>{ if(KU) KU.navigateToCharacter(p.id); }}>
                          {p.name}
                        </button>
                      ))}
                    </div>
                  );
                })}
                {kingsWithDates.map(k => {
                  const f = KU ? KU.foreign_event_for(k) : null;
                  if (!f) return null;
                  const startR = rowOf(k.reign_start_bce);
                  const endR   = rowOf(k.reign_end_bce) + 1;
                  return (
                    <div key={'f-'+k.id} className="kt-tl-foreign-group"
                         style={{gridColumn:5, gridRow:`${startR} / ${Math.max(startR+1,endR)}`}}>
                      <div className="kt-foreign-chip" title={f.book_ref||''}>
                        <strong>{f.name}</strong>
                        <div style={{fontSize:10,opacity:.85}}>{f.empire}</div>
                        <div style={{fontSize:10,opacity:.7,lineHeight:1.25,marginTop:2}}>{f.event}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {expanded && (() => {
                const ek = kingsWithDates.find(x => x.id === expanded);
                if (!ek) return null;
                return (
                  <div className="kt-row-detail" style={{marginTop:8,borderRadius:14,overflow:'hidden',border:'1px solid rgba(212,165,116,.35)'}}>
                    <ExpandedRow k={ek} onPractice={firePractice} allKings={all}/>
                  </div>
                );
              })()}
            </div>
          );
        })()}

        <div className="kt-legend">
          <span><span className="kt-leg-dot" style={{background:"#2d7a2d"}}/> צדיק</span>
          <span><span className="kt-leg-dot" style={{background:"#8b2d2d"}}/> רשע</span>
          <span><span className="kt-leg-dot" style={{background:"#8b6d2d"}}/> מעורב / מעשיו דו־משמעיים</span>
          <span><span className="kt-leg-dot" style={{background:JUDAH_DYN.color}}/> בית דוד</span>
          <span><span className="kt-leg-dot" style={{background:"#1E4D7A"}}/> בית עמרי</span>
          <span><span className="kt-leg-dot" style={{background:"#4E6B2E"}}/> בית יהוא</span>
        </div>
      </div>
    );
  }

  window.KingsTableComponent = KingsTable;
})();
