/* =========================================================================
   ExamSim2551 — authentic בגרות מתכונת תשפ"ו for ספר מלכים (שאלון 2551).
   Real structure (canonical 2551 תשפ"ו spec):
     Part A (בקיאות)    : 5 of 9     @ 9 pts each → 45
     Parts B+C          : 7 of 14    @ 8 pts each → 56
     Total                                         = 101
   Duration: 2:15 standard (8100s) / 2:35 with 15% accommodation (≈9315s).
   NO-INVENTION RULE: questions come from data/past-exams.js EXAM_2551_DATA.
   If A pool < 9, render what exists + TODO warning. Don't fake.

   This commit: selection state + Part A render (5-of-8) with hardcoded pool
   per Yair's uploaded מתכונת. Questions wired to clickable toggle cards with
   "X/5 נבחרו" counter. Parts B+C + start-gate + exam flow come next.

   Exposes: window.ExamSim2551
   ========================================================================= */
(function(){
  const { useState, useEffect } = React;

  const DURATION_STANDARD = 2*3600 + 15*60;
  const DURATION_EXTENDED = Math.round(DURATION_STANDARD * 1.15);
  const ACCOMMODATION_KEY = "jarvis.exam.accommodation";
  const IN_PROGRESS_KEY  = "jarvis.exam.in_progress";
  const ATTEMPTS_KEY     = "jarvis.exam.attempts";

  function loadInProgress(){
    try { const r = localStorage.getItem(IN_PROGRESS_KEY); return r ? JSON.parse(r) : null; }
    catch { return null; }
  }
  function saveInProgress(obj){
    try { localStorage.setItem(IN_PROGRESS_KEY, JSON.stringify(obj)); } catch {}
  }
  function clearInProgress(){
    try { localStorage.removeItem(IN_PROGRESS_KEY); } catch {}
  }

  // --- adapter: build question pools from window.EXAM_2551_DATA (data/past-exams.js).
  //     Shape coming in:  {id,part,points,topic_he,prompt_he,answer_points[],verbatim_quotes?,book_refs?,source_note}
  //     Shape consumed:   {id,n,part,title,prompt,points,expected_points,verbatim_quotes?,book_refs?}
  function buildPools(){
    const data = (typeof window !== "undefined" && window.EXAM_2551_DATA) || null;
    if (!data || !Array.isArray(data.questions)) return { A: [], BC: [] };
    const A = [], BC = [];
    let nA = 0, nBC = 0;
    data.questions.forEach(q => {
      const isA = q.part === "A";
      const n = isA ? ++nA : ++nBC + 8;
      const adapted = {
        id: q.id,
        n,
        part: q.part,
        title: q.topic_he || "",
        prompt: q.prompt_he || "",
        points: q.points || (isA ? 9 : 8),
        expected_points: Array.isArray(q.answer_points) ? q.answer_points : [],
        verbatim_quotes: Array.isArray(q.verbatim_quotes) ? q.verbatim_quotes : null,
        book_refs: Array.isArray(q.book_refs) ? q.book_refs : []
      };
      if (isA) A.push(adapted); else BC.push(adapted);
    });
    return { A, BC };
  }
  let _POOLS = null;
  function getPools(){
    if (_POOLS) return _POOLS;
    _POOLS = buildPools();
    return _POOLS;
  }
  function partAList(){ const p = getPools().A; return p.length ? p : PART_A_POOL_FALLBACK; }
  function partBCList(){ const p = getPools().BC; return p.length ? p : PART_BC_POOL_FALLBACK; }

  // --- Practice Mode helpers ---
  // Topic→unit heuristic. Uses word-level keyword match on q.title (topic_he).
  // Source: unit-deep-summaries.js: 1=שלמה, 2=פילוג, 3=אליהו/אלישע, 4=מהפכות,
  // 5=אשורי, 6=חורבן.
  const UNIT_KEYWORDS = {
    1: ["שלמה","גבעון","מקדש","חכמה","מלכת שבא","חירם","משפט שלמה","חלום","יכין","בועז","ארון"],
    2: ["פילוג","ירבעם","רחבעם","שכם","עגל","בית־אל","בית-אל","דן","אחיה","נבט","אסא","פנואל"],
    3: ["אליהו","אלישע","איזבל","כרמל","נבות","חורב","צרפית","שונמית","נעמן","צפחת","בעל"],
    4: ["יהוא","מהפכ","חזאל","יואש","עתליה","אמציה","דמי יזרעאל"],
    5: ["חזקיהו","סנחריב","רבשקה","ישעיהו","נקבה","השילוח","אשור","הושע בן אלה","שומרון","תגלת"],
    6: ["יאשיהו","חולדה","מנשה","ספר התורה","חורבן","צדקיהו","נבוכדנאצר","יהויכין","גלות","יהויקים","חלקיהו","שפן"]
  };
  function unitForQuestion(q){
    const hay = `${q.title||""} ${q.prompt||""}`;
    for (const u of [1,2,3,4,5,6]) {
      const kws = UNIT_KEYWORDS[u];
      for (const k of kws) if (hay.indexOf(k) !== -1) return u;
    }
    return null;
  }
  // Heuristic difficulty by part: A (recall) = קל, B (knowledge) = בינוני, C (analysis) = קשה.
  function difficultyForQuestion(q){
    if (q.part === "A") return 1;
    if (q.part === "B") return 2;
    if (q.part === "C") return 3;
    return 2;
  }
  // Practice "type" derived from part: A→bekiut, B→yeda, C→rohav.
  function typeForQuestion(q){
    if (q.part === "A") return "bekiut";
    if (q.part === "B") return "yeda";
    if (q.part === "C") return "rohav";
    return "other";
  }
  function buildPracticePool(){
    return [...partAList(), ...partBCList()];
  }
  function applyPracticeFilters(pool, filters){
    return pool.filter(q => {
      if (filters.difficulty !== "all" && difficultyForQuestion(q) !== filters.difficulty) return false;
      if (filters.type !== "all" && typeForQuestion(q) !== filters.type) return false;
      if (filters.unit !== "all" && unitForQuestion(q) !== filters.unit) return false;
      return true;
    });
  }
  function shuffleSample(arr, n){
    const a = [...arr];
    for (let i = a.length-1; i>0; i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]] = [a[j],a[i]];
    }
    return a.slice(0, Math.min(n, a.length));
  }

  // --- legacy hardcoded fallback kept only if window.EXAM_2551_DATA is absent ---
  const PART_A_POOL_FALLBACK = [
    {id:"a1", n:1, title:"מלכות שלמה",
      prompt:"תאר/י שני מאפיינים מרכזיים של תקופת מלכות שלמה, והבא/י פסוק התומך בכל אחד מהם.",
      points:9, expected_points:["חכמה ובקשת לב שומע (מל״א ג׳)","בניין המקדש ושגשוג כלכלי (מל״א ו׳–י׳)"]},
    {id:"a2", n:2, title:"מלכות אחאב",
      prompt:"הסבר/י את יחסי אחאב עם ממלכת ארם ועם אליהו הנביא. תן/י שתי דוגמאות.",
      points:9, expected_points:["מלחמות אפק ורמות גלעד מול בן הדד","עימות עם אליהו בכרמל + כרם נבות"]},
    {id:"a3", n:3, title:"נאום רבשקה",
      prompt:"תאר/י את מטרות נאום רבשקה באוזני אנשי ירושלים והסבר/י את תגובת חזקיהו.",
      points:9, expected_points:["הנמכת אמון באלוהים ובחזקיהו","שליחת בקשה לישעיהו ותפילה במקדש (מל״ב יט׳)"]},
    {id:"a4", n:4, title:"מלכות יהויכין וגלות יהודה",
      prompt:"תאר/י את נסיבות גלות יהויכין ואת השפעתה על ממלכת יהודה.",
      points:9, expected_points:["הגליית יהויכין + האומנים (מל״ב כד׳)","החלשת יהודה לקראת חורבן בית ראשון"]},
    {id:"a5", n:5, title:"רב-נושא — קרעים/צפחת/אשרה/ספר התורה",
      prompt:"בחר/י שניים מהבאים והסבר/י את משמעותם: עשרה קרעים, צפחת השמן, שריפת מפלצת האשרה, מציאת ספר התורה.",
      points:9, expected_points:["עשרה קרעים — נבואת אחיה השילוני על פילוג הממלכה (מל״א יא׳)","מציאת ספר התורה — רפורמת יאשיהו (מל״ב כב׳)"]},
    {id:"a6", n:6, title:"סדר אירועים",
      prompt:"סדר/י את האירועים הבאים לפי הזמן: חורבן המקדש, חנוכת המקדש, הסתלקות אליהו, פילוג הממלכה, גלות ישראל, מעמד הר הכרמל.",
      points:9, expected_points:["חנוכת המקדש → פילוג → הר הכרמל → הסתלקות אליהו → גלות ישראל → חורבן המקדש"]},
    {id:"a7", n:7, title:"מי אמר למי",
      prompt:'זהה/י דובר, נמען והקשר לכל אחד: (1) "ונטיתי על ירושלים את קו שומרון ואת משקלת בית אחאב" (2) "ולא האמנתי לדברים..." (3) "מה לנו חלק בדוד..." (4) "ויהי נא פי שניים ברוחך אלי".',
      points:9, expected_points:[
        "(1) ה׳ ביד ישעיהו על חורבן ירושלים (מל״ב כא׳)",
        "(2) מלכת שבא לשלמה (מל״א י׳)",
        "(3) שבע בן בכרי / העם לרחבעם (מל״א יב׳)",
        "(4) אלישע לאליהו לפני הסתלקותו (מל״ב ב׳)"
      ]},
    {id:"a8", n:8, title:"שאלת מפה",
      prompt:"על המפה המצורפת (בית אל, דן, פנואל, שומרון) שבצו 4 מקומות ל-5 מספרים — אחד מיותר.",
      points:9, expected_points:[
        "בית אל — עגל הזהב הדרומי של ירבעם",
        "דן — עגל הזהב הצפוני של ירבעם",
        "פנואל — בירה נוספת שבנה ירבעם בעבר הירדן",
        "שומרון — בירת ישראל מעמרי ואילך"
      ]}
  ];

  const PART_BC_POOL_FALLBACK = [
    {id:"b1",  n:9,  part:"B", title:"פילוג הממלכה",
      prompt:"ציין/י שתי סיבות לפילוג הממלכה ותן/י פסוק לכל סיבה.",
      points:8, expected_points:["עונש על נשות שלמה הנוכריות (מל״א יא׳)","תגובת רחבעם לבקשת הקלת עול (מל״א יב׳)"]},
    {id:"b2",  n:10, part:"B", title:"ממלכת אשור וישראל",
      prompt:"תאר/י את תהליך נפילת ממלכת ישראל לפני אשור בשתי תחנות מרכזיות.",
      points:8, expected_points:["מס תגלת פלאסר בימי מנחם (מל״ב טו׳)","מצור שלמנאסר + נפילת שומרון בימי הושע (מל״ב יז׳)"]},
    {id:"b3",  n:11, part:"B", title:"יחס מלכי יהודה לע״ז",
      prompt:"השווה/י בין מדיניות שני מלכי יהודה בנושא עבודה זרה.",
      points:8, expected_points:["חזקיהו — הסיר במות, שבר נחש הנחושת (מל״ב יח׳)","יאשיהו — ביעור אשרה + חידוש הברית (מל״ב כג׳)"]},
    {id:"b4",  n:12, part:"B", title:"הכרתת בית אחאב",
      prompt:"תאר/י כיצד הוגשמה נבואת אליהו על הכרתת בית אחאב.",
      points:8, expected_points:["מינוי יהוא והמהפכה ביזרעאל","הריגת יורם, איזבל ושבעים בני אחאב (מל״ב ט׳–י׳)"]},
    {id:"c1",  n:13, part:"C", title:"ישראל והעמים — כבוד",
      prompt:"ציין/י דוגמה שבה יחסי ישראל ועם אחר מביעים כבוד, והסבר/י מדוע.",
      points:8, expected_points:["ברית שלמה וחירם — אחווה פוליטית וכלכלית (מל״א ה׳)"]},
    {id:"c2",  n:14, part:"C", title:"ישראל והעמים — עוינות",
      prompt:"ציין/י דוגמה שבה יחסי ישראל ועם אחר מביעים עוינות, והסבר/י.",
      points:8, expected_points:["מלחמות אחאב עם בן הדד (מל״א כ׳)"]},
    {id:"c3",  n:15, part:"C", title:"אחדות ופילוג — הפילוג",
      prompt:"הבא/י דוגמה לגילוי של המוטיב 'אחדות ופילוג' בתיאור הפילוג עצמו.",
      points:8, expected_points:["שכם — תביעת העם להקלה, תשובת רחבעם (מל״א יב׳)"]},
    {id:"c4",  n:16, part:"C", title:"אחדות ופילוג — שלמה",
      prompt:"הבא/י דוגמה לגילוי של המוטיב 'אחדות ופילוג' בימי שלמה.",
      points:8, expected_points:["חנוכת המקדש כהתאספות כלל-ישראלית (מל״א ח׳)"]},
    {id:"c5",  n:17, part:"C", title:"נביא ומלך — אליהו",
      prompt:"תאר/י עימות בין נביא למלך בימי אחאב והסבר/י את משמעותו.",
      points:8, expected_points:["כרם נבות — תוכחת 'הרצחת וגם ירשת' (מל״א כא׳)"]},
    {id:"c6",  n:18, part:"C", title:"נביא ומלך — ישעיהו/חזקיהו",
      prompt:"תאר/י מפגש בין נביא למלך בימי חזקיהו.",
      points:8, expected_points:["ישעיהו מכריז על נסיגת סנחריב (מל״ב יט׳)"]},
    {id:"c7",  n:19, part:"C", title:"בית המקדש",
      prompt:"ציין/י שני אירועים מרכזיים הקשורים לבית המקדש בספר מלכים.",
      points:8, expected_points:["חנוכת המקדש ותפילת שלמה (מל״א ח׳)","מציאת ספר התורה וחידוש הברית (מל״ב כב׳–כג׳)"]},
    {id:"c8",  n:20, part:"C", title:"שכר ועונש",
      prompt:"הבא/י דוגמה לשכר ודוגמה לעונש במלכי יהודה/ישראל.",
      points:8, expected_points:["שכר — חזקיהו וצליחת מצור אשור","עונש — מנשה והגזירה על חורבן (מל״ב כא׳)"]},
    {id:"c9",  n:21, part:"C", title:"עבודה זרה בישראל",
      prompt:"הסבר/י את חטא ירבעם ואת המשכו בקרב מלכי ישראל.",
      points:8, expected_points:["עגלי הזהב בבית-אל ובדן (מל״א יב׳)","'חטאת ירבעם' כמוטיב חוזר (מל״ב יז׳)"]},
    {id:"c10", n:22, part:"C", title:"סוף ממלכת יהודה",
      prompt:"תאר/י שני אירועים שהובילו לחורבן בית ראשון.",
      points:8, expected_points:["מרד צדקיהו בנבוכדנאצר (מל״ב כה׳)","חורבן המקדש וגלות בבל (מל״ב כה׳)"]}
  ];

  const MAX_A = 5;
  const MAX_BC = 7;
  const SPEC_A_TOTAL = 9;   // canonical 2551 spec (5 of 9)
  const SPEC_BC_TOTAL = 14; // canonical 2551 spec (7 of 14)

  function loadAccommodation(){ try { return localStorage.getItem(ACCOMMODATION_KEY)==="1"; } catch { return false; } }
  function saveAccommodation(v){ try { localStorage.setItem(ACCOMMODATION_KEY, v?"1":"0"); } catch {} }

  function fmtHMS(sec){ const h=Math.floor(sec/3600), m=Math.floor((sec%3600)/60), s=sec%60; return `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`; }

  function isInShabbat(){
    const now = new Date();
    const isrTime = new Date(now.toLocaleString("en-US", { timeZone:"Asia/Jerusalem" }));
    const day = isrTime.getDay();
    const min = isrTime.getHours()*60 + isrTime.getMinutes();
    if (day===5 && min>=18*60+30) return true;
    if (day===6 && min<19*60+30)  return true;
    return false;
  }
  if (typeof window!=="undefined") window.__isInShabbat = isInShabbat;

  function ShabbatModal({ onDismiss }){
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,.7)"}}>
        <div className="parchment rounded-2xl p-6 max-w-md text-center space-y-3">
          <div className="text-6xl">🕯</div>
          <h2 className="font-display text-2xl font-bold text-amber-900">שבת שלום</h2>
          <p className="text-amber-950 hebrew leading-relaxed">
            השבת נכנסת — לא ניתן להתחיל את הסימולציה כעת. חזור במוצ״ש אחרי 19:30.
          </p>
          {onDismiss && <button onClick={onDismiss} className="gold-btn px-5 py-2 rounded-lg">הבנתי</button>}
        </div>
      </div>
    );
  }

  // --- VerbatimQuotes: renders the 4 Tanakh verses from Q A1 (niqqud-aware).
  //     Quotes are Biblical text (public domain) and are displayed exactly as
  //     supplied in window.EXAM_2551_DATA.questions[A1].verbatim_quotes.
  function VerbatimQuotes({ quotes }){
    if (!Array.isArray(quotes) || quotes.length === 0) return null;
    return (
      <div className="space-y-2">
        {quotes.map((q, i) => (
          <blockquote key={i}
            className="parchment-inset rounded-lg p-3 border-r-4 border-amber-700/60 hebrew"
            style={{background:"rgba(244,213,141,.28)"}}>
            <div className="text-amber-950 leading-relaxed" style={{fontSize:"1.05rem"}}>
              <span className="font-bold text-amber-900 ml-1" dir="ltr">({i+1})</span>
              {" "}"{q.text_he}"
            </div>
            {q.book_ref && <div className="text-[11px] text-amber-800 mt-1">{q.book_ref}</div>}
          </blockquote>
        ))}
      </div>
    );
  }

  function AccommodationToggle({ value, onChange }){
    return (
      <label className="flex items-start gap-3 cursor-pointer rounded-xl p-3 bg-white/50 border-2 border-amber-700/30 hover:border-amber-700/60 transition">
        <input type="checkbox" checked={!!value} onChange={e=>onChange(e.target.checked)} className="mt-1 w-5 h-5 accent-amber-700"/>
        <div className="flex-1 text-right">
          <div className="font-bold text-amber-950 text-sm">הפעל התאמות 15% (תוספת זמן)</div>
          <div className="text-xs text-amber-800 mt-0.5">
            משך: {value ? <strong>2:35 שעות</strong> : <>2:15 שעות</>} {" · "}
            {value ? <span className="text-emerald-800 font-bold">פעיל</span> : <span className="text-amber-700">רגיל</span>}
          </div>
        </div>
      </label>
    );
  }

  function SelectionCard({ q, selected, onToggle, disabled }){
    const cls = selected
      ? "bg-amber-500/30 border-amber-400 text-amber-950"
      : disabled
        ? "bg-white/30 border-amber-700/10 text-amber-900/50 cursor-not-allowed"
        : "bg-white/60 border-amber-700/30 text-amber-900 hover:bg-amber-500/10";
    const hasQuotes = Array.isArray(q.verbatim_quotes) && q.verbatim_quotes.length > 0;
    return (
      <button onClick={onToggle} disabled={disabled && !selected}
        className={`w-full text-right rounded-xl border-2 p-3 transition ${cls}`}>
        <div className="flex items-start gap-2">
          <span className={`shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${selected?"bg-amber-600 text-white":"bg-amber-700/20 text-amber-800"}`} dir="ltr">
            {selected ? "✓" : q.n}
          </span>
          <div className="flex-1 min-w-0 text-right">
            <div className="font-bold text-sm hebrew">{q.title}</div>
            {hasQuotes && (
              <div className="text-[11px] mt-1 text-amber-900/80 hebrew">
                כולל {q.verbatim_quotes.length} ציטוטי מקרא (בניקוד)
              </div>
            )}
            <div className="text-xs mt-0.5 hebrew leading-relaxed opacity-80">{q.prompt}</div>
            <div className="text-[10px] mt-1 opacity-70">{q.points} נק׳</div>
          </div>
        </div>
      </button>
    );
  }

  function PartStepBar({ step, doneA, countA, countBC }){
    const steps = [
      { id: "A",  label: "פרק א׳ · בקיאות",        n: countA,  max: MAX_A,  done: doneA },
      { id: "BC", label: "פרק ב+ג · ידע ורוחב",   n: countBC, max: MAX_BC, done: countBC===MAX_BC }
    ];
    return (
      <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-900/60 border border-amber-700/30">
        {steps.map(s => {
          const active = step === s.id;
          const cls = active
            ? "bg-amber-600 text-white font-bold"
            : s.done ? "bg-emerald-700/60 text-white" : "bg-white/10 text-on-parchment";
          return (
            <div key={s.id} className={`text-xs md:text-sm px-2 py-1.5 rounded-lg ${cls}`}>
              <div className="hebrew leading-tight">{s.done ? "✓ " : ""}{s.label}</div>
              <div className="text-[10px] opacity-90" dir="ltr">נבחרו {s.n}/{s.max}</div>
            </div>
          );
        })}
      </div>
    );
  }

  function PartASelect({ selected, onToggle }){
    const count = selected.length;
    const full = count >= MAX_A;
    return (
      <section className="space-y-2">
        <div className="flex items-center justify-between sticky top-[108px] z-10 bg-slate-900/90 backdrop-blur-sm rounded-xl p-3 border border-amber-500/30">
          <div className="font-display text-base font-bold text-on-parchment">פרק א — בקיאות</div>
          <div className={`text-sm font-bold ${full?"text-emerald-400":"text-on-parchment-accent"}`}>
            נבחרו <span dir="ltr">{count}/{MAX_A}</span>
          </div>
        </div>
        <div className="space-y-2">
          {partAList().map(q => (
            <SelectionCard key={q.id} q={q} selected={selected.includes(q.id)}
              onToggle={()=>onToggle(q.id)} disabled={full}/>
          ))}
        </div>
      </section>
    );
  }

  function PartBCSelect({ selected, onToggle }){
    const count = selected.length;
    const full = count >= MAX_BC;
    const partB = partBCList().filter(q => q.part === "B");
    const partC = partBCList().filter(q => q.part === "C");
    return (
      <section className="space-y-2">
        <div className="flex items-center justify-between sticky top-[108px] z-10 bg-slate-900/90 backdrop-blur-sm rounded-xl p-3 border border-purple-500/30">
          <div className="font-display text-base font-bold text-purple-200">פרק ב + ג — ידע ורוחב</div>
          <div className={`text-sm font-bold ${full?"text-emerald-400":"text-purple-300"}`}>
            נבחרו <span dir="ltr">{count}/{MAX_BC}</span>
          </div>
        </div>
        <div className="text-[10px] text-on-parchment-meta mt-2">פרק ב — ידע (4 סעיפים)</div>
        <div className="space-y-2">
          {partB.map(q => (
            <SelectionCard key={q.id} q={q} selected={selected.includes(q.id)}
              onToggle={()=>onToggle(q.id)} disabled={full}/>
          ))}
        </div>
        <div className="text-[10px] text-on-parchment-meta mt-3">פרק ג — ידע ונושאי רוחב (10 סעיפים)</div>
        <div className="space-y-2">
          {partC.map(q => (
            <SelectionCard key={q.id} q={q} selected={selected.includes(q.id)}
              onToggle={()=>onToggle(q.id)} disabled={full}/>
          ))}
        </div>
      </section>
    );
  }

  function ExamIntro({ onStart, onStartPractice, setRoute }){
    const [shabbat, setShabbat] = useState(() => isInShabbat());
    const [accommodation, setAccommodation] = useState(() => loadAccommodation());
    const [mode, setMode] = useState("full"); // "full" | "practice"
    useEffect(() => {
      const iv = setInterval(() => setShabbat(isInShabbat()), 60*1000);
      return () => clearInterval(iv);
    }, []);
    const durationSec = accommodation ? DURATION_EXTENDED : DURATION_STANDARD;
    const poolA  = partAList();
    const poolBC = partBCList();
    const missingA  = Math.max(0, SPEC_A_TOTAL  - poolA.length);
    const missingBC = Math.max(0, SPEC_BC_TOTAL - poolBC.length);
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {shabbat && <ShabbatModal onDismiss={()=>setRoute && setRoute({page:"quiz"})}/>}
        <h1 className="font-display text-2xl md:text-3xl font-bold text-on-parchment-accent">📝 מתכונת בגרות · שאלון 2551 · תשפ"ו</h1>
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-900/60 border border-amber-700/30">
          <button onClick={()=>setMode("full")} type="button"
            className={`text-xs md:text-sm px-3 py-2 rounded-lg transition hebrew ${mode==="full"?"bg-amber-600 text-white font-bold":"bg-white/10 text-on-parchment hover:bg-white/20"}`}>
            🏛 מתכונת מלאה
          </button>
          <button onClick={()=>setMode("practice")} type="button"
            className={`text-xs md:text-sm px-3 py-2 rounded-lg transition hebrew ${mode==="practice"?"bg-amber-600 text-white font-bold":"bg-white/10 text-on-parchment hover:bg-white/20"}`}>
            ⚡ תרגול קצר
          </button>
        </div>
        {mode === "practice" && (
          <PracticeConfig onStart={onStartPractice}/>
        )}
        {mode !== "practice" && (
        <>
        <div className="text-sm md:text-base text-on-parchment hebrew leading-relaxed" style={{background:"rgba(0,0,0,.25)",padding:"0.75rem 1rem",borderRadius:"0.75rem"}}>
          בחינת מתכונת תשפ״ו · בחר 5 מתוך 9 בפרק א · 7 מתוך 14 בפרקים ב+ג · 101 נק׳ · 2:15 (או 2:35 בהתאמת 15%)
        </div>
        <div className="parchment rounded-2xl p-5 md:p-7 space-y-3">
          <h2 className="font-display text-xl font-bold text-amber-900">ספר מלכים · מתכונת מלאה</h2>
          <div className="text-sm text-amber-950 space-y-1.5">
            <div><strong>⏱ זמן מוקצה:</strong> <span dir="ltr">{fmtHMS(durationSec)}</span></div>
            <div><strong>📊 ניקוד מקסימלי:</strong> 101 נק׳</div>
            <div><strong>📖 חומר עזר:</strong> תנ"ך שלם בלי פירושים</div>
          </div>
          <div className="divider"/>
          <div className="space-y-2">
            <div className="bg-white/50 rounded-lg p-3" style={{borderRight:"4px solid #D4A574"}}>
              <div className="font-bold text-amber-950">פרק א — בקיאות</div>
              <div className="text-xs text-amber-800">ענה על 5 מתוך 9 שאלות · 9 נק׳ לשאלה × 5 = 45 נק׳</div>
              {missingA > 0 && (
                <div className="text-[11px] mt-1 px-2 py-1 rounded bg-red-100 text-red-900 font-mono" dir="ltr">
                  {`// TODO: need ${missingA} more bekiut question${missingA>1?"s":""} in past-exams.js (have ${poolA.length}/${SPEC_A_TOTAL})`}
                </div>
              )}
            </div>
            <div className="bg-white/50 rounded-lg p-3" style={{borderRight:"4px solid #6B5B95"}}>
              <div className="font-bold text-amber-950">פרק ב + ג — ידע ונושאי רוחב</div>
              <div className="text-xs text-amber-800">ענה על 7 מתוך 14 סעיפים · 8 נק׳ לסעיף × 7 = 56 נק׳</div>
              {missingBC > 0 && (
                <div className="text-[11px] mt-1 px-2 py-1 rounded bg-red-100 text-red-900 font-mono" dir="ltr">
                  {`// TODO: need ${missingBC} more yeda+rohav question${missingBC>1?"s":""} in past-exams.js (have ${poolBC.length}/${SPEC_BC_TOTAL})`}
                </div>
              )}
            </div>
          </div>
          <div className="pt-2">
            <AccommodationToggle value={accommodation} onChange={v=>{setAccommodation(v); saveAccommodation(v);}}/>
          </div>
        </div>
        <button onClick={()=>onStart({accommodation, durationSec})} disabled={shabbat}
          className={`w-full py-4 rounded-2xl text-lg font-bold ${shabbat?"bg-slate-700 text-slate-400 cursor-not-allowed":"gold-btn glow"}`}>
          {shabbat ? "🕯 חסום בשבת" : `🚀 התחל סימולציה · ${fmtHMS(durationSec)}`}
        </button>
        </>
        )}
      </div>
    );
  }

  function PracticeConfig({ onStart }){
    const [difficulty, setDifficulty] = useState("all"); // 1|2|3|"all"
    const [type, setType]             = useState("all"); // bekiut|yeda|rohav|all
    const [unit, setUnit]             = useState("all"); // 1..6|all
    const [count, setCount]           = useState(10);    // 5|10|15|25
    const filters = { difficulty, type, unit };
    const pool = applyPracticeFilters(buildPracticePool(), filters);
    const available = pool.length;
    const willGet = Math.min(count, available);
    const opts = (label, val, current, set, vals) => (
      <div>
        <div className="text-[11px] text-amber-900 font-bold mb-1 hebrew">{label}</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
          {vals.map(v => (
            <button key={String(v.id)} type="button" onClick={()=>set(v.id)}
              className={`text-xs px-2 py-2 rounded-lg font-bold transition ${current===v.id?"bg-amber-700 text-white":"bg-white/60 text-amber-900 hover:bg-amber-200"}`}>
              {v.label}
            </button>
          ))}
        </div>
      </div>
    );
    const start = () => {
      const sample = shuffleSample(pool, count);
      if (sample.length === 0) return;
      onStart && onStart({ filters, count: sample.length, questions: sample });
    };
    return (
      <div className="parchment rounded-2xl p-5 md:p-7 space-y-3">
        <h2 className="font-display text-xl font-bold text-amber-900">⚡ תרגול קצר</h2>
        <p className="text-xs text-amber-800 hebrew">בחר מסננים ומספר שאלות. אין מגבלת זמן.</p>
        {opts("רמה", difficulty, difficulty, setDifficulty, [
          {id:"all", label:"הכל"},
          {id:1,     label:"קל"},
          {id:2,     label:"בינוני"},
          {id:3,     label:"קשה"}
        ])}
        {opts("סוג", type, type, setType, [
          {id:"all",    label:"הכל"},
          {id:"bekiut", label:"בקיאות"},
          {id:"yeda",   label:"ידע"},
          {id:"rohav",  label:"רוחב"}
        ])}
        {opts("יחידה", unit, unit, setUnit, [
          {id:"all", label:"הכל"},
          {id:1,     label:"1 · שלמה"},
          {id:2,     label:"2 · פילוג"},
          {id:3,     label:"3 · אליהו ואלישע"},
          {id:4,     label:"4 · מהפכות"},
          {id:5,     label:"5 · אשור"},
          {id:6,     label:"6 · חורבן"}
        ])}
        {opts("מספר שאלות", count, count, setCount, [
          {id:5,  label:"5"},
          {id:10, label:"10"},
          {id:15, label:"15"},
          {id:25, label:"25"}
        ])}
        <div className="text-xs text-amber-900 hebrew">
          זמינות עם המסננים: <span dir="ltr" className="font-bold">{available}</span> שאלות
          {willGet < count && available > 0 && (
            <span className="text-red-700"> · רק {willGet} זמינות</span>
          )}
        </div>
        <button onClick={start} disabled={available === 0}
          className={`w-full py-3 rounded-2xl text-base font-bold ${available===0?"bg-slate-300 text-slate-500 cursor-not-allowed":"gold-btn glow"}`}>
          {available === 0 ? "אין שאלות מתאימות" : `▶ התחל תרגול · ${willGet} שאלות`}
        </button>
      </div>
    );
  }

  function ResumeModal({ draft, onResume, onDiscard }){
    const when = draft && draft.savedAt ? new Date(draft.savedAt).toLocaleString("he-IL", {timeZone:"Asia/Jerusalem"}) : "";
    const answered = draft && draft.answers ? Object.keys(draft.answers).filter(k => draft.answers[k] && draft.answers[k].trim()).length : 0;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,.7)"}}>
        <div className="parchment rounded-2xl p-6 max-w-md text-center space-y-3">
          <div className="text-5xl">📝</div>
          <h2 className="font-display text-xl font-bold text-amber-900">יש בחינה שלא הושלמה</h2>
          <p className="text-amber-950 hebrew text-sm">
            נשמרה אוטומטית ב-{when}. תשובות שנכתבו: <span dir="ltr" className="font-bold">{answered}</span>.
          </p>
          <p className="text-amber-950 hebrew text-sm">להמשיך מהמקום שבו עצרת?</p>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button onClick={onDiscard} className="rounded-lg py-2 bg-white/60 text-amber-900 font-bold">🗑 התחל מחדש</button>
            <button onClick={onResume}  className="gold-btn rounded-lg py-2 font-bold">▶ המשך</button>
          </div>
        </div>
      </div>
    );
  }

  function ExamSim2551(props){
    const setRoute = props && props.setRoute;
    const [phase, setPhase] = useState("intro");
    const [examCfg, setExamCfg] = useState(null);
    const [selectedA, setSelectedA] = useState([]);
    const [selectedBC, setSelectedBC] = useState([]);
    const [selectTab, setSelectTab] = useState("A");
    const [runTab, setRunTab] = useState("A");
    const [draft, setDraft] = useState(() => loadInProgress());
    const [resumeData, setResumeData] = useState(null);
    const [finalRun, setFinalRun] = useState(null);
    const [practiceCfg, setPracticeCfg] = useState(null);
    const [practiceFinal, setPracticeFinal] = useState(null);

    const startExam = (cfg) => { setExamCfg(cfg); setPhase("select"); };
    const startPractice = (cfg) => {
      setPracticeCfg(cfg);
      setPhase("practice-running");
    };

    const resumeDraft = () => {
      if (!draft) return;
      setSelectedA(draft.selectedA || []);
      setSelectedBC(draft.selectedBC || []);
      setExamCfg({ accommodation: !!draft.accommodation, durationSec: draft.durationSec || DURATION_STANDARD });
      setResumeData(draft);
      setDraft(null);
      setPhase("running");
    };
    const discardDraft = () => { clearInProgress(); setDraft(null); };

    const toggleA = (id) => setSelectedA(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= MAX_A) return prev;
      return [...prev, id];
    });

    const toggleBC = (id) => setSelectedBC(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= MAX_BC) return prev;
      return [...prev, id];
    });

    if (phase === "intro") {
      return (
        <>
          {draft && <ResumeModal draft={draft} onResume={resumeDraft} onDiscard={discardDraft}/>}
          <ExamIntro setRoute={setRoute} onStart={startExam} onStartPractice={startPractice}/>
        </>
      );
    }

    if (phase === "practice-running") {
      return <PracticeRunning
        questions={(practiceCfg&&practiceCfg.questions)||[]}
        filters={(practiceCfg&&practiceCfg.filters)||{}}
        onFinish={(payload)=>{ setPracticeFinal(payload); setPhase("practice-grade"); }}
        onExit={()=>{ setPracticeCfg(null); setPracticeFinal(null); setPhase("intro"); }}
      />;
    }

    if (phase === "practice-grade") {
      return <PracticeGrade
        questions={(practiceCfg&&practiceCfg.questions)||[]}
        answers={(practiceFinal&&practiceFinal.answers)||{}}
        onDone={()=>{
          setPracticeCfg(null); setPracticeFinal(null);
          setPhase("intro");
        }}
        onRetry={()=>{
          setPracticeCfg(null); setPracticeFinal(null);
          setPhase("intro");
        }}
      />;
    }

    if (phase === "select") {
      const step = selectTab === "BC" ? "BC" : "A";
      const partB = partBCList().filter(q => q.part === "B");
      const partC = partBCList().filter(q => q.part === "C");
      const poolA = partAList();
      const fullA  = selectedA.length  >= MAX_A;
      const fullBC = selectedBC.length >= MAX_BC;
      const aDone  = selectedA.length === MAX_A;
      const bcDone = selectedBC.length === MAX_BC;
      const missingA  = Math.max(0, SPEC_A_TOTAL  - poolA.length);
      const missingBC = Math.max(0, SPEC_BC_TOTAL - (partB.length + partC.length));

      return (
        <div className="max-w-2xl mx-auto space-y-4">
          <PartStepBar step={step} doneA={aDone} countA={selectedA.length} countBC={selectedBC.length}/>

          {step === "A" && (
            <section className="space-y-2">
              <div className={`sticky top-[108px] z-10 rounded-xl p-3 backdrop-blur-sm border flex items-center justify-between ${aDone?"bg-emerald-900/80 border-emerald-500/40":"bg-slate-900/90 border-amber-500/30"}`}>
                <div className="font-bold text-on-parchment hebrew text-sm">פרק א — בקיאות · בחר 5 מתוך 9</div>
                <div className={`text-sm font-bold ${aDone?"text-emerald-300":"text-amber-300"}`} dir="ltr">
                  נבחרו {selectedA.length}/{MAX_A}
                </div>
              </div>
              {missingA > 0 && (
                <div className="text-[11px] px-2 py-1 rounded bg-red-100 text-red-900 font-mono" dir="ltr">
                  {`// TODO: need ${missingA} more bekiut question${missingA>1?"s":""} in past-exams.js (have ${poolA.length}/${SPEC_A_TOTAL})`}
                </div>
              )}
              {poolA.map(q => (
                <SelectionCard key={q.id} q={q} selected={selectedA.includes(q.id)}
                  onToggle={()=>toggleA(q.id)} disabled={fullA}/>
              ))}
              <button onClick={()=>setSelectTab("BC")} disabled={!aDone}
                className={`w-full py-3 rounded-2xl text-base font-bold mt-2 ${aDone?"gold-btn glow":"bg-slate-700 text-slate-400 cursor-not-allowed"}`}>
                {aDone ? "המשך לפרק ב+ג ←" : `בחר עוד ${MAX_A-selectedA.length} שאלות כדי להמשיך`}
              </button>
            </section>
          )}

          {step === "BC" && (
            <section className="space-y-2">
              <div className={`sticky top-[108px] z-10 rounded-xl p-3 backdrop-blur-sm border flex items-center justify-between ${bcDone?"bg-emerald-900/80 border-emerald-500/40":"bg-slate-900/90 border-purple-500/30"}`}>
                <div className="font-bold text-on-parchment hebrew text-sm">פרק ב+ג — ידע ורוחב · בחר 7 מתוך 14</div>
                <div className={`text-sm font-bold ${bcDone?"text-emerald-300":"text-purple-300"}`} dir="ltr">
                  נבחרו {selectedBC.length}/{MAX_BC}
                </div>
              </div>
              {missingBC > 0 && (
                <div className="text-[11px] px-2 py-1 rounded bg-red-100 text-red-900 font-mono" dir="ltr">
                  {`// TODO: need ${missingBC} more yeda+rohav question${missingBC>1?"s":""} in past-exams.js`}
                </div>
              )}
              <div className="text-[10px] text-on-parchment-meta mt-2">פרק ב — ידע וזיכרון ({partB.length} סעיפים)</div>
              <div className="space-y-2">
                {partB.map(q => (
                  <SelectionCard key={q.id} q={q} selected={selectedBC.includes(q.id)}
                    onToggle={()=>toggleBC(q.id)} disabled={fullBC}/>
                ))}
              </div>
              <div className="text-[10px] text-on-parchment-meta mt-3">פרק ג — ניתוח ונושאי רוחב ({partC.length} סעיפים)</div>
              <div className="space-y-2">
                {partC.map(q => (
                  <SelectionCard key={q.id} q={q} selected={selectedBC.includes(q.id)}
                    onToggle={()=>toggleBC(q.id)} disabled={fullBC}/>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button onClick={()=>setSelectTab("A")}
                  className="card py-3 rounded-2xl text-on-parchment font-bold">
                  → חזרה לפרק א
                </button>
                <button onClick={()=>setPhase("running")} disabled={!bcDone}
                  className={`py-3 rounded-2xl text-base font-bold ${bcDone?"gold-btn glow":"bg-slate-700 text-slate-400 cursor-not-allowed"}`}>
                  {bcDone ? `🏁 התחל · ${fmtHMS(examCfg&&examCfg.durationSec||DURATION_STANDARD)}` : `בחר עוד ${MAX_BC-selectedBC.length}`}
                </button>
              </div>
            </section>
          )}
        </div>
      );
    }

    if (phase === "running") {
      return <ExamRunning
        selectedA={selectedA} selectedBC={selectedBC}
        tab={runTab} onTab={setRunTab}
        durationSec={(examCfg&&examCfg.durationSec)||DURATION_STANDARD}
        accommodation={!!(examCfg&&examCfg.accommodation)}
        resume={resumeData}
        onFinish={(payload)=>{ setFinalRun(payload); setResumeData(null); setPhase("grade"); }}
        onExit={()=>{ setResumeData(null); setPhase("intro"); }}
      />;
    }

    if (phase === "grade") {
      return <ExamGrade
        selectedA={selectedA} selectedBC={selectedBC}
        answers={(finalRun&&finalRun.answers)||{}}
        elapsedSec={(finalRun&&finalRun.elapsedSec)||0}
        accommodation={!!(examCfg&&examCfg.accommodation)}
        onDone={()=>{ setFinalRun(null); setPhase("done"); }}
      />;
    }

    if (phase === "done") {
      return (
        <div className="max-w-xl mx-auto text-center py-12 space-y-3">
          <div className="text-6xl">🎉</div>
          <p className="text-on-parchment">הבחינה הוגשה ונשמרה בהיסטוריית הניסיונות.</p>
          <button onClick={()=>{ setSelectedA([]); setSelectedBC([]); setExamCfg(null); setPhase("intro"); }} className="gold-btn px-4 py-2 rounded-lg">חזרה למסך הפתיחה</button>
        </div>
      );
    }
    return null;
  }

  function countWords(s){
    if (!s) return 0;
    const trimmed = String(s).trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }

  function ExamRunning({ selectedA, selectedBC, tab, onTab, durationSec, accommodation, resume, onFinish, onExit }){
    const [timeLeft, setTimeLeft] = useState(() => (resume && typeof resume.timeLeft === "number") ? resume.timeLeft : durationSec);
    const [answers, setAnswers]   = useState(() => (resume && resume.answers) || {});
    const [flagged, setFlagged]   = useState(() => (resume && resume.flagged) || {});
    const [startTime]             = useState(() => (resume && resume.startTime) || Date.now());
    const cardRefs                = React.useRef({});

    useEffect(() => {
      if (timeLeft <= 0) { onFinish({ answers, elapsedSec: durationSec }); return; }
      const t = setTimeout(() => setTimeLeft(x => x-1), 1000);
      return () => clearTimeout(t);
    }, [timeLeft, onFinish, answers, durationSec]);

    // auto-save every 30s
    useEffect(() => {
      const iv = setInterval(() => {
        saveInProgress({
          selectedA, selectedBC, answers, flagged,
          startTime, elapsedSec: durationSec - timeLeft,
          timeLeft, durationSec, accommodation, savedAt: Date.now()
        });
      }, 30*1000);
      return () => clearInterval(iv);
    }, [selectedA, selectedBC, answers, flagged, startTime, timeLeft, durationSec, accommodation]);

    const finish = () => {
      clearInProgress();
      onFinish({ answers, elapsedSec: durationSec - timeLeft });
    };

    const partAQs  = partAList().filter(q => selectedA.includes(q.id));
    const partBQs  = partBCList().filter(q => selectedBC.includes(q.id) && q.part === "B");
    const partCQs  = partBCList().filter(q => selectedBC.includes(q.id) && q.part === "C");
    const partBCQs = [...partBQs, ...partCQs];

    // Three-stage timer color: normal / amber-warn (≤30:00) / red-pulse (≤5:00).
    const timerStage = timeLeft <= 5*60 ? "crit" : timeLeft <= 30*60 ? "warn" : "normal";
    const timerCls   = `exam-timer-${timerStage}`;
    const hh = Math.floor(timeLeft/3600);
    const mm = Math.floor((timeLeft%3600)/60);
    const ss = timeLeft%60;
    const timerText = `${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}:${String(ss).padStart(2,"0")}`;

    const setAns = (id, v) => setAnswers(a => ({...a, [id]: v}));
    const toggleFlag = (id) => setFlagged(f => ({...f, [id]: !f[id]}));

    const allQs = [...partAQs, ...partBCQs];
    const answeredCount = allQs.filter(q => (answers[q.id]||"").trim()).length;

    const scrollToQ = (id) => {
      const el = cardRefs.current[id];
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({behavior:"smooth", block:"start"});
        const ta = el.querySelector("textarea");
        if (ta) setTimeout(() => ta.focus(), 350);
      }
    };
    const nextOf = (id) => {
      const idx = allQs.findIndex(q => q.id === id);
      if (idx >= 0 && idx < allQs.length-1) scrollToQ(allQs[idx+1].id);
    };

    function RunningCard({ q, isLast }){
      const isA = q.part === "A";
      const ans = answers[q.id] || "";
      const words = countWords(ans);
      const flag = !!flagged[q.id];
      const refs = Array.isArray(q.book_refs) ? q.book_refs : [];
      return (
        <div ref={el => { if (el) cardRefs.current[q.id] = el; }}
          className={`parchment rounded-xl p-4 space-y-3 ${flag ? "ring-2 ring-amber-400" : ""}`}>
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-white font-bold ${isA?"bg-amber-700":"bg-purple-700"}`}>
              {isA ? `שאלה ${q.n}` : `סעיף ${q.n}`}
            </span>
            <span className="text-amber-800 font-bold">{q.points} נק׳</span>
            <span className="text-amber-900 font-bold">
              {isA ? q.title : `פרק ${q.part} · ${q.title}`}
            </span>
            {refs.map((r, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">📖 {r}</span>
            ))}
            <button onClick={()=>toggleFlag(q.id)} type="button"
              className={`mr-auto px-2 py-0.5 rounded-full text-[11px] font-bold ${flag?"bg-amber-500 text-amber-950":"bg-white/60 text-amber-800 hover:bg-amber-200"}`}>
              {flag ? "🚩 מסומן לחזרה" : "סמן לחזרה"}
            </button>
          </div>
          {Array.isArray(q.verbatim_quotes) && q.verbatim_quotes.length > 0 && (
            <VerbatimQuotes quotes={q.verbatim_quotes}/>
          )}
          <div className="hebrew text-amber-950 leading-relaxed" style={{fontSize:"1.18rem"}}>{q.prompt}</div>
          <textarea value={ans} onChange={e=>setAns(q.id, e.target.value)}
            placeholder="כתוב את תשובתך כאן..."
            className="w-full px-3 py-2 rounded-lg bg-white/85 border border-amber-700/40 text-amber-950 hebrew leading-relaxed"
            style={{minHeight:"200px", resize:"vertical"}}/>
          <div className="flex items-center justify-between text-xs">
            <div className="text-amber-800" dir="ltr">{words} מילים</div>
            <button onClick={()=>nextOf(q.id)} type="button" disabled={isLast}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${isLast?"bg-slate-300 text-slate-500 cursor-not-allowed":"bg-amber-700 text-white hover:bg-amber-800"}`}>
              {isLast ? "השאלה האחרונה" : "💾 שמור והמשך ←"}
            </button>
          </div>
        </div>
      );
    }

    function NavPill({ q, isA }){
      const filled = !!(answers[q.id]||"").trim();
      const flag   = !!flagged[q.id];
      const base = isA ? "border-amber-600/40" : "border-purple-500/40";
      const fill = filled
        ? (isA ? "bg-amber-600 text-white" : "bg-purple-600 text-white")
        : "bg-white/10 text-on-parchment";
      const ring = flag ? "ring-2 ring-amber-300" : "";
      return (
        <button onClick={()=>scrollToQ(q.id)} type="button"
          className={`relative w-9 h-9 rounded-lg border ${base} ${fill} ${ring} text-xs font-bold transition hover:opacity-80`}
          title={q.title}>
          <span dir="ltr">{q.n}</span>
          {flag && <span className="absolute -top-1 -right-1 text-[10px]">🚩</span>}
        </button>
      );
    }

    return (
      <div className="max-w-3xl mx-auto space-y-4 exam-fullscreen exam-run-wrap">
        <div className="sticky top-[108px] z-20 card rounded-xl p-3 flex items-center justify-between gap-2 exam-sticky-bar exam-run-timer">
          <div className="text-sm text-on-parchment">
            נענו: <span dir="ltr" className="font-bold">{answeredCount}/{allQs.length}</span>
          </div>
          <div className={`font-mono font-bold text-xl exam-timer ${timerCls}`}>
            ⏱ <span dir="ltr">{timerText}</span>
            {timerStage === "warn" && <span className="text-xs font-normal mr-2 hebrew">· פחות מחצי שעה</span>}
            {timerStage === "crit" && <span className="text-xs font-normal mr-2 hebrew">· הגשה קרבה!</span>}
          </div>
          <button onClick={finish} className="px-3 py-1.5 rounded-lg bg-red-700 text-white text-xs font-bold">הגשה</button>
        </div>

        <div className="card rounded-xl p-3 space-y-2">
          <div className="text-[11px] text-on-parchment-meta hebrew">ניווט מהיר · לחץ על שאלה לקפיצה</div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-amber-300 font-bold">פרק א:</span>
            {partAQs.map(q => <NavPill key={q.id} q={q} isA={true}/>)}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-purple-300 font-bold">פרק ב+ג:</span>
            {partBCQs.map(q => <NavPill key={q.id} q={q} isA={false}/>)}
          </div>
        </div>

        <section className="space-y-3">
          {allQs.map((q, i) => (
            <RunningCard key={q.id} q={q} isLast={i === allQs.length-1}/>
          ))}
          {allQs.length === 0 && (
            <div className="text-center text-on-parchment-meta text-sm py-6 hebrew">
              לא נבחרו שאלות
            </div>
          )}
        </section>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={onExit} className="card py-3 rounded-xl text-on-parchment">← יציאה</button>
          <button onClick={finish} className="gold-btn py-3 rounded-xl font-bold">📤 הגש לבדיקה</button>
        </div>
      </div>
    );
  }

  // --- grading helpers ---
  function scoreForGrade(grade, maxPoints){
    if (grade === "know")    return maxPoints;
    if (grade === "partial") return maxPoints / 2;
    return 0;
  }

  function loadAttempts(){
    try { const r = localStorage.getItem(ATTEMPTS_KEY); return r ? JSON.parse(r) : []; }
    catch { return []; }
  }
  function pushAttempt(rec){
    const list = loadAttempts();
    list.push(rec);
    try { localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(list)); } catch {}
  }

  function gradeBand(score){
    if (score >= 90) return { label:"מעולה",    color:"#16a34a", emoji:"🏆" };
    if (score >= 80) return { label:"טוב מאוד", color:"#65a30d", emoji:"✨" };
    if (score >= 70) return { label:"טוב",      color:"#d97706", emoji:"👍" };
    if (score >= 60) return { label:"מספיק",    color:"#b45309", emoji:"⚖" };
    return { label:"נכשל", color:"#b91c1c", emoji:"⚠" };
  }

  function RubricList({ q }){
    const points = Array.isArray(q.expected_points) ? q.expected_points : [];
    if (points.length === 0) return (
      <div className="text-[11px] text-amber-800 hebrew italic">אין רובריקה זמינה לסעיף זה.</div>
    );
    return (
      <ul className="list-disc pr-5 text-xs text-emerald-950 hebrew leading-relaxed space-y-1">
        {points.map((p,i)=><li key={i}>{p}</li>)}
      </ul>
    );
  }

  function ExamGrade({ selectedA, selectedBC, answers, elapsedSec, accommodation, onDone }){
    const partAQs  = partAList().filter(q => selectedA.includes(q.id));
    const partBCQs = partBCList().filter(q => selectedBC.includes(q.id));
    const allQs = [...partAQs, ...partBCQs];

    const [editAnswers, setEditAnswers] = useState(() => ({...answers}));
    const [grades, setGrades] = useState({});
    const [openRubrics, setOpenRubrics] = useState({});
    const [saved, setSaved] = useState(false);

    const setGrade = (id, g) => setGrades(prev => ({...prev, [id]: g}));
    const setAns   = (id, v) => setEditAnswers(prev => ({...prev, [id]: v}));
    const toggleRubric = (id) => setOpenRubrics(prev => ({...prev, [id]: !prev[id]}));

    const partAScore  = partAQs.reduce((s,q)  => s + scoreForGrade(grades[q.id], q.points||9), 0);
    const partBCScore = partBCQs.reduce((s,q) => s + scoreForGrade(grades[q.id], q.points||8), 0);
    const total = partAScore + partBCScore;
    const totalRound = Math.round(total*10)/10;
    const allGraded = allQs.every(q => grades[q.id]);
    const band = gradeBand(totalRound);

    const weakTopics = allQs.filter(q => grades[q.id] === "dont").map(q => q.title);

    const submit = () => {
      const ts = Date.now();
      const rec = {
        ts,
        date: new Date(ts).toISOString(),
        total: totalRound,
        partA: Math.round(partAScore*10)/10,
        partBC: Math.round(partBCScore*10)/10,
        band: band.label,
        accommodation,
        elapsedSec,
        weakTopics,
        grades,
        answers: editAnswers,
        selectedA, selectedBC
      };
      pushAttempt(rec);
      try { localStorage.setItem(`jarvis.melakhim.exams.${ts}`, JSON.stringify(rec)); } catch {}
      setSaved(true);
      if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
        window.showToast(`💾 הבחינה נשמרה · ${totalRound}/101 (${band.label})`, 'success');
      }
    };

    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="card rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3"
          style={{borderTop:`4px solid ${band.color}`}}>
          <div>
            <h2 className="font-display text-xl font-bold text-on-parchment-accent">📝 ציון מלא · מתכונת 2551 תשפ"ו</h2>
            <div className="text-xs text-on-parchment">
              זמן שלקח: <span dir="ltr">{fmtHMS(elapsedSec)}</span> · מצב התאמה: {accommodation?"פעיל":"רגיל"}
            </div>
          </div>
          <div className="text-left">
            <div className="font-mono font-extrabold text-5xl md:text-6xl"
              dir="ltr"
              style={{color:"#F4D58D", textShadow:"0 2px 12px rgba(0,0,0,.45)"}}>
              {totalRound}<span className="text-2xl opacity-70">/101</span>
            </div>
            <div className="font-bold text-base mt-1" style={{color:band.color}}>
              {band.emoji} {band.label}
            </div>
            <div className="text-[10px] text-on-parchment-meta">
              א: <span dir="ltr">{Math.round(partAScore*10)/10}/45</span> · ב+ג: <span dir="ltr">{Math.round(partBCScore*10)/10}/56</span>
            </div>
          </div>
        </div>

        {allQs.map(q => {
          const g = grades[q.id];
          const gainedPts = scoreForGrade(g, q.points || (q.part==="A"?9:8));
          const open = !!openRubrics[q.id];
          return (
            <div key={q.id} className="parchment rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-white font-bold ${q.part==="A"?"bg-amber-700":"bg-purple-700"}`}>
                  {q.part==="A" ? `שאלה ${q.n}` : `סעיף ${q.n}`}
                </span>
                <span className="text-amber-800 font-bold">{q.points} נק׳</span>
                <span className="text-amber-900 font-bold">
                  {q.part==="A" ? q.title : `פרק ${q.part} · ${q.title}`}
                </span>
                {g && (
                  <span className="mr-auto px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 font-mono text-[11px]" dir="ltr">
                    +{gainedPts}/{q.points}
                  </span>
                )}
              </div>
              {Array.isArray(q.verbatim_quotes) && q.verbatim_quotes.length > 0 && (
                <VerbatimQuotes quotes={q.verbatim_quotes}/>
              )}
              <div className="hebrew text-amber-950 leading-relaxed" style={{fontSize:"1.05rem"}}>{q.prompt}</div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <div className="text-[10px] font-bold text-amber-800 mb-1">התשובה שלך:</div>
                  <textarea value={editAnswers[q.id]||""} onChange={e=>setAns(q.id, e.target.value)} rows={5}
                    placeholder="(לא נכתבה תשובה)"
                    className="w-full px-2 py-1.5 rounded-lg bg-white/85 border border-amber-700/40 text-amber-950 hebrew text-sm leading-relaxed"/>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-emerald-800 mb-1">תשובה מצופה (מהספר):</div>
                  <div className="bg-emerald-50/70 rounded-lg p-2">
                    <RubricList q={q}/>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                {[
                  {g:"know",    label:`✅ יודע (+${q.points})`,  cls:g==="know"   ?"bg-emerald-600 text-white":"bg-white/60 text-emerald-900"},
                  {g:"partial", label:`⚠ חלקי (+${q.points/2})`, cls:g==="partial"?"bg-amber-600 text-white":"bg-white/60 text-amber-900"},
                  {g:"dont",    label:"❌ לא יודע (+0)",          cls:g==="dont"   ?"bg-red-700 text-white":"bg-white/60 text-red-900"}
                ].map(b => (
                  <button key={b.g} onClick={()=>setGrade(q.id, b.g)}
                    className={`rounded-lg py-2 text-sm font-bold transition ${b.cls}`}>
                    {b.label}
                  </button>
                ))}
              </div>

              <button type="button" onClick={()=>toggleRubric(q.id)}
                className="w-full text-right text-xs px-2 py-1 rounded-lg bg-amber-50 text-amber-900 font-bold hover:bg-amber-100 transition">
                {open ? "▼ סגור רובריקה מלאה" : "▶ פתח רובריקה מלאה"}
              </button>
              {open && (
                <div className="rounded-lg bg-white/50 p-3 space-y-1 border border-amber-700/20">
                  <div className="text-[11px] font-bold text-amber-900">קריטריוני ניקוד:</div>
                  <RubricList q={q}/>
                  {Array.isArray(q.book_refs) && q.book_refs.length > 0 && (
                    <div className="text-[10px] text-amber-800 pt-1">
                      📖 הפניות: {q.book_refs.join(" · ")}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {!saved ? (
          <button onClick={submit} disabled={!allGraded}
            className={`w-full py-3 rounded-xl text-base font-bold ${allGraded?"gold-btn":"bg-slate-700 text-slate-400 cursor-not-allowed"}`}>
            {allGraded ? `💾 שמור ציון ${totalRound}/101 (${band.label}) בהיסטוריה` : "דרג את כל הסעיפים כדי לשמור"}
          </button>
        ) : (
          <div className="card rounded-xl p-4 space-y-2">
            <div className="text-emerald-400 font-bold text-center">✅ נשמר בהיסטוריית הניסיונות</div>
            {weakTopics.length > 0 && (
              <div>
                <div className="text-xs text-red-300 font-bold mb-1">🎯 נקודות חלשות לחזרה:</div>
                <ul className="list-disc pr-5 text-xs text-on-parchment-muted hebrew space-y-0.5">
                  {weakTopics.map((t,i)=><li key={i}>{t}</li>)}
                </ul>
              </div>
            )}
            <button onClick={onDone} className="gold-btn w-full py-2 rounded-lg font-bold mt-2">המשך</button>
          </div>
        )}
      </div>
    );
  }

  // ===== Practice Mode (no timer, no formal score band) =====
  function PracticeRunning({ questions, filters, onFinish, onExit }){
    const [answers, setAnswers] = useState({});
    const [flagged, setFlagged] = useState({});
    const cardRefs = React.useRef({});

    const setAns = (id, v) => setAnswers(a => ({...a, [id]: v}));
    const toggleFlag = (id) => setFlagged(f => ({...f, [id]: !f[id]}));
    const answeredCount = questions.filter(q => (answers[q.id]||"").trim()).length;

    const scrollToQ = (id) => {
      const el = cardRefs.current[id];
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({behavior:"smooth", block:"start"});
        const ta = el.querySelector("textarea");
        if (ta) setTimeout(() => ta.focus(), 350);
      }
    };
    const nextOf = (id) => {
      const idx = questions.findIndex(q => q.id === id);
      if (idx >= 0 && idx < questions.length-1) scrollToQ(questions[idx+1].id);
    };

    const submit = () => onFinish({ answers });

    return (
      <div className="max-w-3xl mx-auto space-y-4 exam-fullscreen exam-run-wrap">
        <div className="sticky top-[108px] z-20 card rounded-xl p-3 flex items-center justify-between gap-2 exam-sticky-bar exam-run-timer">
          <div className="text-sm text-on-parchment">
            ⚡ תרגול · נענו: <span dir="ltr" className="font-bold">{answeredCount}/{questions.length}</span>
          </div>
          <div className="text-xs text-on-parchment-meta hebrew">בלי הגבלת זמן</div>
          <button onClick={submit} className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-bold">סיים</button>
        </div>

        <div className="card rounded-xl p-3 space-y-1">
          <div className="text-[11px] text-on-parchment-meta hebrew">ניווט מהיר</div>
          <div className="flex items-center gap-2 flex-wrap">
            {questions.map((q, i) => {
              const filled = !!(answers[q.id]||"").trim();
              const flag = !!flagged[q.id];
              return (
                <button key={q.id} onClick={()=>scrollToQ(q.id)} type="button"
                  className={`relative w-9 h-9 rounded-lg border border-amber-600/40 text-xs font-bold transition hover:opacity-80 ${filled?"bg-amber-600 text-white":"bg-white/10 text-on-parchment"} ${flag?"ring-2 ring-amber-300":""}`}>
                  <span dir="ltr">{i+1}</span>
                  {flag && <span className="absolute -top-1 -right-1 text-[10px]">🚩</span>}
                </button>
              );
            })}
          </div>
        </div>

        <section className="space-y-3">
          {questions.map((q, i) => {
            const ans = answers[q.id]||"";
            const flag = !!flagged[q.id];
            const refs = Array.isArray(q.book_refs) ? q.book_refs : [];
            const isLast = i === questions.length-1;
            const typeLabel = typeForQuestion(q)==="bekiut" ? "בקיאות" : typeForQuestion(q)==="yeda" ? "ידע" : typeForQuestion(q)==="rohav" ? "רוחב" : "כללי";
            const u = unitForQuestion(q);
            return (
              <div key={q.id} ref={el => { if (el) cardRefs.current[q.id] = el; }}
                className={`parchment rounded-xl p-4 space-y-3 ${flag?"ring-2 ring-amber-400":""}`}>
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <span className="px-2 py-0.5 rounded-full bg-amber-700 text-white font-bold">שאלה {i+1}</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">{typeLabel}</span>
                  {u && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold">יחידה {u}</span>}
                  <span className="text-amber-900 font-bold">{q.title}</span>
                  {refs.map((r, j) => (
                    <span key={j} className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 text-[11px] font-bold">📖 {r}</span>
                  ))}
                  <button onClick={()=>toggleFlag(q.id)} type="button"
                    className={`mr-auto px-2 py-0.5 rounded-full text-[11px] font-bold ${flag?"bg-amber-500 text-amber-950":"bg-white/60 text-amber-800 hover:bg-amber-200"}`}>
                    {flag ? "🚩 מסומן" : "סמן לחזרה"}
                  </button>
                </div>
                {Array.isArray(q.verbatim_quotes) && q.verbatim_quotes.length > 0 && (
                  <VerbatimQuotes quotes={q.verbatim_quotes}/>
                )}
                <div className="hebrew text-amber-950 leading-relaxed" style={{fontSize:"1.18rem"}}>{q.prompt}</div>
                <textarea value={ans} onChange={e=>setAns(q.id, e.target.value)}
                  placeholder="כתוב את תשובתך כאן..."
                  className="w-full px-3 py-2 rounded-lg bg-white/85 border border-amber-700/40 text-amber-950 hebrew leading-relaxed"
                  style={{minHeight:"180px", resize:"vertical"}}/>
                <div className="flex items-center justify-between text-xs">
                  <div className="text-amber-800" dir="ltr">{countWords(ans)} מילים</div>
                  <button onClick={()=>nextOf(q.id)} type="button" disabled={isLast}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${isLast?"bg-slate-300 text-slate-500 cursor-not-allowed":"bg-amber-700 text-white hover:bg-amber-800"}`}>
                    {isLast ? "האחרונה" : "המשך ←"}
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={onExit} className="card py-3 rounded-xl text-on-parchment">← יציאה</button>
          <button onClick={submit} className="gold-btn py-3 rounded-xl font-bold">📤 בדוק תשובות</button>
        </div>
      </div>
    );
  }

  function PracticeGrade({ questions, answers, onDone, onRetry }){
    const [editAnswers, setEditAnswers] = useState(() => ({...answers}));
    const [grades, setGrades] = useState({});
    const [openRubrics, setOpenRubrics] = useState({});
    const setGrade = (id, g) => setGrades(prev => ({...prev, [id]: g}));
    const setAns   = (id, v) => setEditAnswers(prev => ({...prev, [id]: v}));
    const toggleRubric = (id) => setOpenRubrics(prev => ({...prev, [id]: !prev[id]}));

    const totalMax = questions.reduce((s,q) => s + (q.points || 8), 0);
    const totalGain = questions.reduce((s,q) => s + scoreForGrade(grades[q.id], q.points || 8), 0);
    const pctRound = totalMax === 0 ? 0 : Math.round(totalGain/totalMax*100);
    const allGraded = questions.every(q => grades[q.id]);
    const band = gradeBand(pctRound);

    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="card rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3"
          style={{borderTop:`4px solid ${band.color}`}}>
          <div>
            <h2 className="font-display text-xl font-bold text-on-parchment-accent">⚡ תרגול קצר · ציון</h2>
            <div className="text-xs text-on-parchment hebrew">{questions.length} שאלות · ללא מגבלת זמן</div>
          </div>
          <div className="text-left">
            <div className="font-mono font-extrabold text-5xl md:text-6xl"
              dir="ltr"
              style={{color:"#F4D58D", textShadow:"0 2px 12px rgba(0,0,0,.45)"}}>
              {Math.round(totalGain*10)/10}<span className="text-2xl opacity-70">/{totalMax}</span>
            </div>
            <div className="font-bold text-base mt-1" style={{color:band.color}}>
              {band.emoji} {pctRound}% · {band.label}
            </div>
          </div>
        </div>

        {questions.map((q, idx) => {
          const g = grades[q.id];
          const open = !!openRubrics[q.id];
          const points = q.points || 8;
          const gain = scoreForGrade(g, points);
          return (
            <div key={q.id} className="parchment rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-amber-700 text-white font-bold">שאלה {idx+1}</span>
                <span className="text-amber-900 font-bold">{q.title}</span>
                {g && (
                  <span className="mr-auto px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 font-mono text-[11px]" dir="ltr">
                    +{gain}/{points}
                  </span>
                )}
              </div>
              {Array.isArray(q.verbatim_quotes) && q.verbatim_quotes.length > 0 && (
                <VerbatimQuotes quotes={q.verbatim_quotes}/>
              )}
              <div className="hebrew text-amber-950 leading-relaxed" style={{fontSize:"1.05rem"}}>{q.prompt}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <div className="text-[10px] font-bold text-amber-800 mb-1">התשובה שלך:</div>
                  <textarea value={editAnswers[q.id]||""} onChange={e=>setAns(q.id, e.target.value)} rows={5}
                    placeholder="(לא נכתבה תשובה)"
                    className="w-full px-2 py-1.5 rounded-lg bg-white/85 border border-amber-700/40 text-amber-950 hebrew text-sm leading-relaxed"/>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-emerald-800 mb-1">תשובה מצופה:</div>
                  <div className="bg-emerald-50/70 rounded-lg p-2"><RubricList q={q}/></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2">
                {[
                  {g:"know",    label:`✅ יודע (+${points})`,   cls:g==="know"   ?"bg-emerald-600 text-white":"bg-white/60 text-emerald-900"},
                  {g:"partial", label:`⚠ חלקי (+${points/2})`,  cls:g==="partial"?"bg-amber-600 text-white":"bg-white/60 text-amber-900"},
                  {g:"dont",    label:"❌ לא יודע (+0)",         cls:g==="dont"   ?"bg-red-700 text-white":"bg-white/60 text-red-900"}
                ].map(b => (
                  <button key={b.g} onClick={()=>setGrade(q.id, b.g)}
                    className={`rounded-lg py-2 text-sm font-bold transition ${b.cls}`}>
                    {b.label}
                  </button>
                ))}
              </div>
              <button type="button" onClick={()=>toggleRubric(q.id)}
                className="w-full text-right text-xs px-2 py-1 rounded-lg bg-amber-50 text-amber-900 font-bold hover:bg-amber-100 transition">
                {open ? "▼ סגור רובריקה מלאה" : "▶ פתח רובריקה מלאה"}
              </button>
              {open && (
                <div className="rounded-lg bg-white/50 p-3 space-y-1 border border-amber-700/20">
                  <div className="text-[11px] font-bold text-amber-900">קריטריוני ניקוד:</div>
                  <RubricList q={q}/>
                  {Array.isArray(q.book_refs) && q.book_refs.length > 0 && (
                    <div className="text-[10px] text-amber-800 pt-1">📖 {q.book_refs.join(" · ")}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <div className="grid grid-cols-2 gap-2">
          <button onClick={onRetry} className="card py-3 rounded-xl text-on-parchment font-bold">⚡ תרגול נוסף</button>
          <button onClick={onDone} className="gold-btn py-3 rounded-xl font-bold">חזרה למסך הפתיחה</button>
        </div>
        {!allGraded && (
          <div className="text-center text-[11px] text-amber-300 hebrew">דרג את כל הסעיפים לקבלת ציון מלא</div>
        )}
      </div>
    );
  }

  if (typeof window !== "undefined") window.ExamSim2551 = ExamSim2551;
})();
