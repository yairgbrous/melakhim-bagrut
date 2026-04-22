/* =========================================================================
   ExamSim2551 — authentic בגרות מתכונת תשפ"ו for ספר מלכים (שאלון 2551).
   Real structure:
     Part A (בקיאות)    : 5 of 8     @ 9 pts each → 45
     Parts B+C          : 7 of 14    @ 8 pts each → 56
     Total                                         = 101
   Duration: 2:15 standard (8100s) / 2:35 with 15% accommodation (≈9315s).

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

  // --- hardcoded מתכונת תשפ"ו question pool (fallback until data/past-exams.js extends) ---
  const PART_A_POOL = [
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

  const PART_BC_POOL = [
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
    return (
      <button onClick={onToggle} disabled={disabled && !selected}
        className={`w-full text-right rounded-xl border-2 p-3 transition ${cls}`}>
        <div className="flex items-start gap-2">
          <span className={`shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${selected?"bg-amber-600 text-white":"bg-amber-700/20 text-amber-800"}`} dir="ltr">
            {selected ? "✓" : q.n}
          </span>
          <div className="flex-1 min-w-0 text-right">
            <div className="font-bold text-sm hebrew">{q.title}</div>
            <div className="text-xs mt-0.5 hebrew leading-relaxed opacity-80">{q.prompt}</div>
            <div className="text-[10px] mt-1 opacity-70">{q.points} נק׳</div>
          </div>
        </div>
      </button>
    );
  }

  function PartASelect({ selected, onToggle }){
    const count = selected.length;
    const full = count >= MAX_A;
    return (
      <section className="space-y-2">
        <div className="flex items-center justify-between sticky top-[108px] z-10 bg-slate-900/90 backdrop-blur-sm rounded-xl p-3 border border-amber-500/30">
          <div className="font-display text-base font-bold text-amber-200">פרק א — בקיאות</div>
          <div className={`text-sm font-bold ${full?"text-emerald-400":"text-amber-300"}`}>
            נבחרו <span dir="ltr">{count}/{MAX_A}</span>
          </div>
        </div>
        <div className="space-y-2">
          {PART_A_POOL.map(q => (
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
    const partB = PART_BC_POOL.filter(q => q.part === "B");
    const partC = PART_BC_POOL.filter(q => q.part === "C");
    return (
      <section className="space-y-2">
        <div className="flex items-center justify-between sticky top-[108px] z-10 bg-slate-900/90 backdrop-blur-sm rounded-xl p-3 border border-purple-500/30">
          <div className="font-display text-base font-bold text-purple-200">פרק ב + ג — ידע ורוחב</div>
          <div className={`text-sm font-bold ${full?"text-emerald-400":"text-purple-300"}`}>
            נבחרו <span dir="ltr">{count}/{MAX_BC}</span>
          </div>
        </div>
        <div className="text-[10px] text-amber-200/60 mt-2">פרק ב — ידע (4 סעיפים)</div>
        <div className="space-y-2">
          {partB.map(q => (
            <SelectionCard key={q.id} q={q} selected={selected.includes(q.id)}
              onToggle={()=>onToggle(q.id)} disabled={full}/>
          ))}
        </div>
        <div className="text-[10px] text-amber-200/60 mt-3">פרק ג — ידע ונושאי רוחב (10 סעיפים)</div>
        <div className="space-y-2">
          {partC.map(q => (
            <SelectionCard key={q.id} q={q} selected={selected.includes(q.id)}
              onToggle={()=>onToggle(q.id)} disabled={full}/>
          ))}
        </div>
      </section>
    );
  }

  function ExamIntro({ onStart, setRoute }){
    const [shabbat, setShabbat] = useState(() => isInShabbat());
    const [accommodation, setAccommodation] = useState(() => loadAccommodation());
    useEffect(() => {
      const iv = setInterval(() => setShabbat(isInShabbat()), 60*1000);
      return () => clearInterval(iv);
    }, []);
    const durationSec = accommodation ? DURATION_EXTENDED : DURATION_STANDARD;
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {shabbat && <ShabbatModal onDismiss={()=>setRoute && setRoute({page:"quiz"})}/>}
        <h1 className="font-display text-2xl md:text-3xl font-bold text-amber-300">📝 מתכונת בגרות · שאלון 2551 · תשפ"ו</h1>
        <div className="parchment rounded-2xl p-5 md:p-7 space-y-3">
          <h2 className="font-display text-xl font-bold text-amber-900">ספר מלכים · מתכונת מלאה</h2>
          <div className="text-sm text-amber-950 space-y-1.5">
            <div><strong>⏱ זמן מוקצה:</strong> <span dir="ltr">{fmtHMS(durationSec)}</span></div>
            <div><strong>📊 ניקוד:</strong> 101 נק׳</div>
            <div><strong>📖 חומר עזר:</strong> תנ"ך שלם בלי פירושים</div>
          </div>
          <div className="divider"/>
          <div className="space-y-2">
            <div className="bg-white/50 rounded-lg p-3" style={{borderRight:"4px solid #D4A574"}}>
              <div className="font-bold text-amber-950">פרק א — בקיאות</div>
              <div className="text-xs text-amber-800">ענה על 5 מתוך 8 שאלות · 9 נק׳ לשאלה = 45 נק׳</div>
            </div>
            <div className="bg-white/50 rounded-lg p-3" style={{borderRight:"4px solid #6B5B95"}}>
              <div className="font-bold text-amber-950">פרק ב + ג — ידע ונושאי רוחב</div>
              <div className="text-xs text-amber-800">ענה על 7 מתוך 14 סעיפים · 8 נק׳ לסעיף = 56 נק׳</div>
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
      </div>
    );
  }

  function ExamSim2551(props){
    const setRoute = props && props.setRoute;
    const [phase, setPhase] = useState("intro");
    const [examCfg, setExamCfg] = useState(null);
    const [selectedA, setSelectedA] = useState([]);
    const [selectedBC, setSelectedBC] = useState([]);

    const startExam = (cfg) => { setExamCfg(cfg); setPhase("select"); };

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
      return <ExamIntro setRoute={setRoute} onStart={startExam}/>;
    }

    if (phase === "select") {
      return (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="card rounded-xl p-3 flex items-center justify-between text-sm">
            <div className="font-bold text-amber-200">שלב בחירת שאלות</div>
            <div className="text-xs text-amber-200/70">
              א: <span dir="ltr" className="font-bold">{selectedA.length}/{MAX_A}</span> · ב+ג: <span dir="ltr" className="font-bold">{selectedBC.length}/{MAX_BC}</span>
            </div>
          </div>
          <PartASelect selected={selectedA} onToggle={toggleA}/>
          <PartBCSelect selected={selectedBC} onToggle={toggleBC}/>
        </div>
      );
    }

    return (
      <div className="max-w-xl mx-auto text-center py-12 space-y-3">
        <div className="text-5xl">🏗</div>
        <p className="text-amber-200">שלב הבחינה בפיתוח.</p>
        <button onClick={()=>setPhase("intro")} className="gold-btn px-4 py-2 rounded-lg">חזרה</button>
      </div>
    );
  }

  if (typeof window !== "undefined") window.ExamSim2551 = ExamSim2551;
})();
