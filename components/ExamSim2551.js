/* =========================================================================
   ExamSim2551 — authentic בגרות מתכונת תשפ"ו for ספר מלכים (שאלון 2551).
   Real structure from Yair's uploaded מתכונת:
     Part A (בקיאות)       : answer 5 of 8       @ 9 pts each → 45
     Parts B+C combined    : answer 7 of 14      @ 8 pts each → 56
     Total                                                    = 101
   Duration: 2:15 standard; 2:35 with 15% accommodation (Yair's).
   Allowed: תנ"ך שלם בלי פירושים.

   This commit: intro screen + Shabbat guard (Fri 18:30 – Sat 19:30 Israel).
   Subsequent commits: accommodation toggle, selection UI, auto-save / resume,
   self-grading screen + attempt history.

   Exposes: window.ExamSim2551
   ========================================================================= */
(function(){
  const { useState, useEffect } = React;

  // --- Shabbat guard (Fri 18:30 IL → Sat 19:30 IL) ---
  function isInShabbat(){
    const now = new Date();
    const isrTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }));
    const day = isrTime.getDay();             // 0=Sun ... 5=Fri, 6=Sat
    const min = isrTime.getHours()*60 + isrTime.getMinutes();
    if (day === 5 && min >= 18*60 + 30) return true;
    if (day === 6 && min <  19*60 + 30) return true;
    return false;
  }
  // expose for testability
  if (typeof window !== "undefined") window.__isInShabbat = isInShabbat;

  function ShabbatModal({ onDismiss }){
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,.7)"}}>
        <div className="parchment rounded-2xl p-6 max-w-md text-center space-y-3">
          <div className="text-6xl">🕯</div>
          <h2 className="font-display text-2xl font-bold text-amber-900">שבת שלום</h2>
          <p className="text-amber-950 hebrew leading-relaxed">
            השבת נכנסת — לא ניתן להתחיל את הסימולציה כעת.
            הבחינה תחזור להיות זמינה במוצאי שבת בשעה 19:30.
          </p>
          {onDismiss && (
            <button onClick={onDismiss} className="gold-btn px-5 py-2 rounded-lg">הבנתי</button>
          )}
        </div>
      </div>
    );
  }

  function ExamIntro({ onStart, setRoute }){
    const [shabbat, setShabbat] = useState(() => isInShabbat());
    useEffect(() => {
      const iv = setInterval(() => setShabbat(isInShabbat()), 60*1000);
      return () => clearInterval(iv);
    }, []);

    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {shabbat && <ShabbatModal onDismiss={()=>setRoute && setRoute({page:"quiz"})}/>}

        <h1 className="font-display text-2xl md:text-3xl font-bold text-amber-300">
          📝 מתכונת בגרות · שאלון 2551 · תשפ"ו
        </h1>

        <div className="parchment rounded-2xl p-5 md:p-7 space-y-3">
          <h2 className="font-display text-xl font-bold text-amber-900">ספר מלכים · מתכונת מלאה</h2>
          <div className="text-sm text-amber-950 space-y-1.5">
            <div><strong>⏱ זמן:</strong> שעתיים ורבע (2:15) · עם התאמה 15% = 2:35</div>
            <div><strong>📊 ניקוד:</strong> 101 נק׳</div>
            <div><strong>📖 חומר עזר:</strong> תנ"ך שלם בלי פירושים (ניתן למרקר)</div>
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
        </div>

        <div className="card rounded-xl p-4 text-sm text-amber-100/80 space-y-1">
          <div>💡 <strong>כללים:</strong></div>
          <div>· הסימולציה מדמה בחינה מלאה — נסה לא לעצור באמצע.</div>
          <div>· מצב שבת: הסימולציה חסומה מיום ו׳ 18:30 עד מוצ״ש 19:30 (שעון ישראל).</div>
          <div>· לאחר ההגשה תוכל לדרג את עצמך מול תשובות מצופות מהספר.</div>
        </div>

        <button
          onClick={onStart}
          disabled={shabbat}
          className={`w-full py-4 rounded-2xl text-lg font-bold ${shabbat?"bg-slate-700 text-slate-400 cursor-not-allowed":"gold-btn glow"}`}
        >
          {shabbat ? "🕯 חסום בשבת" : "🚀 התחל סימולציה"}
        </button>
      </div>
    );
  }

  function ExamSim2551(props){
    const setRoute = props && props.setRoute;
    const [phase, setPhase] = useState("intro");

    if (phase === "intro") {
      return <ExamIntro setRoute={setRoute} onStart={()=>setPhase("running")}/>;
    }
    // running / done — subsequent commits fill these in.
    return (
      <div className="max-w-xl mx-auto text-center py-12 space-y-3">
        <div className="text-5xl">🏗</div>
        <p className="text-amber-200">הבחינה בפיתוח — יתווסף בקומיט הבא.</p>
        <button onClick={()=>setPhase("intro")} className="gold-btn px-4 py-2 rounded-lg">חזרה</button>
      </div>
    );
  }

  if (typeof window !== "undefined") {
    window.ExamSim2551 = ExamSim2551;
  }
})();
