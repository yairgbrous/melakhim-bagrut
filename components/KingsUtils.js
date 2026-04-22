/* =========================================================================
   KingsUtils — shared helpers + fallback data for the Kings Table and
   Character pages. Safe to load as a plain <script> (no JSX, no imports).

   Exposes: window.KingsUtils = {
     assessmentColor, dynastyBadge, succession_chain,
     prophets_by_reign, foreign_event_for,
     stripTokens, getCharacter, navigateToCharacter,
     FALLBACK_PROPHETS, FALLBACK_KILLINGS, FALLBACK_FOREIGN,
     FALLBACK_DYNASTIES, MIXED_KINGS
   }
   ========================================================================= */
(function(){
  // -------- Assessment colors (no emojis) -----------------------------------
  // tzadik = green, rasha = red, mixed = amber. Returned as {hex, cls}.
  const COLORS = {
    tzadik: { hex:'#2d7a2d', cls:'assess-tzadik' },
    rasha:  { hex:'#8b2d2d', cls:'assess-rasha'  },
    mixed:  { hex:'#8b6d2d', cls:'assess-mixed'  }
  };

  // Kings the book treats as "mixed" (started well, ended badly — or vice-versa).
  // יואש יהודה (שמר מצוות כל ימי יהוידע, ולבסוף עזב ה׳ ונהרג בידי עבדיו),
  // אמציה (עשה הישר אך לא כמו אביו, נכשל מול יואש ישראל),
  // שלמה (צדיק בנעוריו, ובזקנותו נשיו הטו את לבבו).
  const MIXED_KINGS = new Set([
    'שלמה', 'יואש (יהודה)', 'אמציה'
  ]);

  // Additional righteous overrides beyond timeline.good===true (safety net).
  const RIGHTEOUS_OVERRIDES = new Set([
    'אסא','יהושפט','עזריה (עוזיה)','עוזיה','יותם','חזקיהו','יאשיהו'
  ]);

  function assessmentKind(k){
    if (!k) return 'rasha';
    const name = (k.name||'').trim();
    if (MIXED_KINGS.has(name)) return 'mixed';
    if (RIGHTEOUS_OVERRIDES.has(name)) return 'tzadik';
    if (k.good === true)  return 'tzadik';
    if (k.good === false) return 'rasha';
    const v = (k.assessment||'').toLowerCase();
    if (v === 'righteous' || v === 'good')  return 'tzadik';
    if (v === 'wicked'   || v === 'bad')    return 'rasha';
    if (v === 'mixed')                      return 'mixed';
    return 'rasha';
  }

  function assessmentColor(k){
    return COLORS[assessmentKind(k)];
  }

  // -------- Dynasty markers -------------------------------------------------
  const FALLBACK_DYNASTIES = {
    judah: { id:'beit-david', name:'בית דוד', color:'#8B6F1F' },
    israel: [
      { id:'yarov',   name:'בית ירבעם',     color:'#7A1F2A', kings:['ירבעם בן נבט','נדב'] },
      { id:'baasha',  name:'בית בעשא',      color:'#4A2C6F', kings:['בעשא','אלה'] },
      { id:'zimri',   name:'זמרי',          color:'#5C1010', kings:['זמרי'] },
      { id:'omri',    name:'בית עמרי',      color:'#1E4D7A', kings:['עמרי','אחאב','אחזיה בן אחאב','יורם בן אחאב'] },
      { id:'yehu',    name:'בית יהוא',      color:'#4E6B2E', kings:['יהוא','יהואחז','יואש (ישראל)','ירבעם השני','זכריה בן ירבעם'] },
      { id:'shalom',  name:'שלום בן יבש',   color:'#5C1010', kings:['שלום בן יבש'] },
      { id:'menahem', name:'בית מנחם',      color:'#5C3A1F', kings:['מנחם בן גדי','פקחיה'] },
      { id:'pekah',   name:'פקח בן רמליהו', color:'#5C1010', kings:['פקח בן רמליהו'] },
      { id:'hoshea',  name:'הושע בן אלה',   color:'#5C1010', kings:['הושע בן אלה'] }
    ]
  };

  function dynastyBadge(k){
    if (!k) return FALLBACK_DYNASTIES.judah;
    const name = (k.name||'').trim();
    if (k.dynasty === 'יהודה' || k.kingdom === 'judah') return FALLBACK_DYNASTIES.judah;
    const d = FALLBACK_DYNASTIES.israel.find(d => d.kings.includes(name));
    if (d) return d;
    return { id:'israel', name:'ישראל', color:'#5C3A1F' };
  }

  // -------- Succession / killings -------------------------------------------
  // By king name (Hebrew, as they appear in MELAKHIM_DATA.timeline). Killer may
  // be another king, a non-king character, or a descriptive phrase.
  // killer_kind: 'king' | 'character' | 'foreign' | 'internal' | 'self'
  const FALLBACK_KILLINGS = [
    { victim:'נדב',               killer:'בעשא',         killer_kind:'king'      },
    { victim:'אלה',               killer:'זמרי',         killer_kind:'king'      },
    { victim:'זמרי',              killer:'זמרי',         killer_kind:'self',     note:'התאבד באש' },
    { victim:'יורם בן אחאב',      killer:'יהוא',         killer_kind:'king'      },
    { victim:'אחזיה (יהודה)',     killer:'יהוא',         killer_kind:'king'      },
    { victim:'איזבל',             killer:'יהוא',         killer_kind:'king'      },
    { victim:'עתליה',             killer:'יהוידע',       killer_kind:'character' },
    { victim:'יואש (יהודה)',      killer:'עבדיו',        killer_kind:'internal'  },
    { victim:'אמציה',             killer:'מורדים',       killer_kind:'internal'  },
    { victim:'זכריה בן ירבעם',    killer:'שלום בן יבש',  killer_kind:'king'      },
    { victim:'שלום בן יבש',       killer:'מנחם בן גדי',  killer_kind:'king'      },
    { victim:'פקחיה',             killer:'פקח בן רמליהו', killer_kind:'king'     },
    { victim:'פקח בן רמליהו',     killer:'הושע בן אלה',  killer_kind:'king'      },
    { victim:'אמון',              killer:'עבדיו',        killer_kind:'internal'  },
    { victim:'יאשיהו',            killer:'פרעה נכה',     killer_kind:'foreign'   }
  ];

  // Build [{killer_id, victim_id, killer_kind, ...}] from normalized kings list.
  function succession_chain(all_kings){
    const byName = {};
    (all_kings||[]).forEach(k => { if (k && k.name) byName[k.name.trim()] = k; });
    const pairs = [];
    FALLBACK_KILLINGS.forEach(rec => {
      const victim = byName[rec.victim];
      if (!victim) return;
      const killer = byName[rec.killer];
      pairs.push({
        victim_id: victim.id,
        victim_name: victim.name,
        killer_id: killer ? killer.id : null,
        killer_name: rec.killer,
        killer_kind: rec.killer_kind,
        note: rec.note || ''
      });
    });
    return pairs;
  }

  // Reverse lookup: who did king X kill?
  function killed_by(all_kings, kingId){
    return succession_chain(all_kings).filter(p => p.victim_id === kingId);
  }
  function killed(all_kings, kingId){
    return succession_chain(all_kings).filter(p => p.killer_id === kingId);
  }

  // -------- Prophets by reign ----------------------------------------------
  // Light fallback: prophet name → kings whose reigns the prophet overlapped.
  // Built from the plain-reading of ספר מלכים (taught material).
  const FALLBACK_PROPHETS = [
    { id:'natan',      name:'נתן',            kings:['שלמה'] },
    { id:'gad',        name:'גד החוזה',       kings:['שלמה'] },
    { id:'achiya',     name:'אחיה השילוני',   kings:['שלמה','ירבעם בן נבט'] },
    { id:'shemaya',    name:'שמעיה איש האלוהים', kings:['רחבעם'] },
    { id:'ido',        name:'עידו',           kings:['רחבעם','אבים'] },
    { id:'chanani',    name:'חנני הרואה',     kings:['אסא'] },
    { id:'yehu_ben_chanani', name:'יהוא בן חנני', kings:['בעשא','יהושפט'] },
    { id:'eliyahu',    name:'אליהו',          kings:['אחאב','אחזיה בן אחאב','יורם בן אחאב','יהושפט'] },
    { id:'elisha',     name:'אלישע',          kings:['יורם בן אחאב','יהוא','יהואחז','יואש (ישראל)'] },
    { id:'michayahu',  name:'מיכיהו בן ימלה', kings:['אחאב','יהושפט'] },
    { id:'michah_hamorashti', name:'מיכה המורשתי', kings:['יותם','אחז','חזקיהו'] },
    { id:'yeshayahu',  name:'ישעיהו',         kings:['עזריה (עוזיה)','יותם','אחז','חזקיהו'] },
    { id:'hoshea_navi', name:'הושע בן בארי',  kings:['ירבעם השני','זכריה בן ירבעם','מנחם בן גדי','פקחיה','פקח בן רמליהו','הושע בן אלה'] },
    { id:'amos',       name:'עמוס',           kings:['ירבעם השני','עזריה (עוזיה)'] },
    { id:'yona',       name:'יונה בן אמיתי',  kings:['ירבעם השני'] },
    { id:'yoel',       name:'יואל',           kings:['יואש (יהודה)'] },
    { id:'yirmiyahu',  name:'ירמיהו',         kings:['יאשיהו','יהואחז','יהויקים','יהויכין','צדקיהו'] },
    { id:'tzefanya',   name:'צפניה',          kings:['יאשיהו'] },
    { id:'chuldah',    name:'חולדה הנביאה',   kings:['יאשיהו'] },
    { id:'chavakuk',   name:'חבקוק',          kings:['יהויקים'] },
    { id:'nachum',     name:'נחום',           kings:['מנשה'] },
    { id:'yechezkel',  name:'יחזקאל',         kings:['יהויכין','צדקיהו'] },
    { id:'ovadya',     name:'עבדיהו (הניצב על הבית)', kings:['אחאב'] }
  ];

  function prophets_by_reign(all_chars, king){
    const name = (typeof king === 'string') ? king : (king && king.name);
    if (!name) return [];
    const kingName = name.trim();
    const out = [];
    const seen = new Set();

    // 1) Try live entity-index characters (role contains נביא).
    (all_chars || []).forEach(c => {
      if (!c) return;
      const roleStr = (c.role||'') + ' ' + ((c.tags||[]).join(' '));
      if (!/נביא|הרואה|איש האלוהים|חוזה/.test(roleStr)) return;
      const associated = [].concat(c.related_kings||[], c.kings||[], c.associated_kings||[]);
      const hit = associated.some(v => v === kingName);
      if (hit && !seen.has(c.id)) {
        seen.add(c.id);
        out.push({ id:c.id, name:(c.name||c.heading||c.id), source:'index' });
      }
    });

    // 2) Fallback table.
    FALLBACK_PROPHETS.forEach(p => {
      if (p.kings.indexOf(kingName) < 0) return;
      if (seen.has(p.id)) return;
      seen.add(p.id);
      out.push({ id:p.id, name:p.name, source:'fallback' });
    });

    return out;
  }

  // -------- Foreign events per king ----------------------------------------
  // Keyed by king name. Returns {name, empire, event, book_ref} | null.
  const FALLBACK_FOREIGN = {
    'רחבעם':           { name:'שישק',           empire:'מצרים', event:'עלה על ירושלים ובזז את אוצרות המקדש', book_ref:'מל״א י״ד' },
    'בעשא':            { name:'בן הדד',          empire:'ארם',   event:'הוכה בידי בן הדד בעצת אסא',          book_ref:'מל״א ט״ו' },
    'אחאב':            { name:'בן הדד',          empire:'ארם',   event:'מלחמות ארם · קרב אפק · רמות גלעד',   book_ref:'מל״א כ׳, כ״ב' },
    'יהוא':            { name:'חזאל',            empire:'ארם',   event:'תחילת שעבוד לארם',                   book_ref:'מל״ב י׳' },
    'יהואחז':          { name:'חזאל',            empire:'ארם',   event:'חזאל ובן הדד הציקו לישראל',          book_ref:'מל״ב י״ג' },
    'יואש (ישראל)':    { name:'בן הדד בן חזאל',  empire:'ארם',   event:'שיבת הערים שלקח חזאל',                book_ref:'מל״ב י״ג' },
    'מנחם בן גדי':     { name:'פול (תגלת פלאסר)', empire:'אשור', event:'אלף כיכר כסף למלך אשור',             book_ref:'מל״ב ט״ו' },
    'פקח בן רמליהו':   { name:'תגלת פלאסר',      empire:'אשור',  event:'כבש את הגלעד והגליל והגלה',           book_ref:'מל״ב ט״ו' },
    'אחז':             { name:'תגלת פלאסר',      empire:'אשור',  event:'״עבדך ובנך אני״ · מזבח דמשק',          book_ref:'מל״ב ט״ז' },
    'הושע בן אלה':     { name:'שלמנאסר',         empire:'אשור',  event:'מצור שומרון · גלות עשרת השבטים',      book_ref:'מל״ב י״ז' },
    'חזקיהו':          { name:'סנחריב',          empire:'אשור',  event:'מצור ירושלים · מלאך ה׳ היכה במחנה',   book_ref:'מל״ב י״ח-י״ט' },
    'מנשה':            { name:'אסרחדון',         empire:'אשור',  event:'וסל נאמן למלכי אשור',                 book_ref:'מל״ב כ״א' },
    'יאשיהו':          { name:'פרעה נכה',        empire:'מצרים', event:'יצא לעצור את פרעה נכה ונהרג במגידו',  book_ref:'מל״ב כ״ג' },
    'יהואחז':          { name:'פרעה נכה',        empire:'מצרים', event:'אסרו ברבלה והגלהו למצרים',             book_ref:'מל״ב כ״ג' },
    'יהויקים':         { name:'נבוכדנצר',        empire:'בבל',   event:'מרד בבבל לאחר שלוש שנות עבדות',       book_ref:'מל״ב כ״ד' },
    'יהויכין':         { name:'נבוכדנצר',        empire:'בבל',   event:'גלות החרש והמסגר (597 לפנה״ס)',        book_ref:'מל״ב כ״ד' },
    'צדקיהו':          { name:'נבוכדנצר',        empire:'בבל',   event:'חורבן בית ראשון (586 לפנה״ס)',         book_ref:'מל״ב כ״ה' }
  };

  function foreign_event_for(kingOrId){
    if (!kingOrId) return null;
    const name = (typeof kingOrId === 'string') ? kingOrId : kingOrId.name;
    if (!name) return null;
    return FALLBACK_FOREIGN[name.trim()] || null;
  }

  // -------- Token helpers (keep short — index.html has full parseTokens) ----
  const STRIP_RE = /\{\{[a-zA-Zא-ת_]+:[^|}]+\|([^}]+)\}\}/g;
  function stripTokens(text){
    if (typeof text !== 'string' || text.indexOf('{{') < 0) return text || '';
    return text.replace(STRIP_RE, '$1');
  }

  // -------- Character lookup + navigation ----------------------------------
  function getCharacter(id){
    if (!id) return null;
    const idx = (typeof window !== 'undefined' && window.__ENTITY_INDEX__) || {};
    const c = (idx.character||{})[id];
    if (c) return c;
    // Fallback: prophet in our table
    const p = FALLBACK_PROPHETS.find(p => p.id === id);
    if (p) return { id:p.id, name:p.name, role:'נביא', _fallback:true };
    return null;
  }

  function navigateToCharacter(id){
    if (!id) return;
    try {
      if (typeof window.__appSetRoute__ === 'function'){
        window.__appSetRoute__({ page:'character', id });
        return;
      }
    } catch(e){}
    try {
      window.dispatchEvent(new CustomEvent('mb-navigate', { detail:{ page:'character', id } }));
    } catch(e){}
    try { window.location.hash = '#character-' + encodeURIComponent(id); } catch(e){}
  }

  window.KingsUtils = {
    assessmentColor, assessmentKind,
    dynastyBadge,
    succession_chain, killed_by, killed,
    prophets_by_reign, foreign_event_for,
    stripTokens, getCharacter, navigateToCharacter,
    FALLBACK_PROPHETS, FALLBACK_KILLINGS, FALLBACK_FOREIGN,
    FALLBACK_DYNASTIES, MIXED_KINGS
  };
})();
