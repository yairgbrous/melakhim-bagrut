/* =========================================================================
   XpBadge — XP, streak, and tier computation for Home stats + header badge.

   Storage keys (all under the "jarvis." prefix so they flow through the
   existing localStorage → RTDB sync hook from AuthProvider):
     jarvis.xp                 : number  — cumulative XP
     jarvis.streak.days        : number  — current consecutive-day streak
     jarvis.streak.lastDay     : "YYYY-MM-DD" (Asia/Jerusalem)
     jarvis.xp.grades_seen     : {qid: grade} — so we don't double-award
     jarvis.xp.attempts_seen   : number  — last seen attempts.length
     jarvis.xp.units_seen      : [unitId, ...] — awarded unit completions

   Award table (per task):
     quiz grade "know"          → +10    (treated as correct)
     quiz grade "partial"       → +5
     quiz grade "dont"          → +2     (wrong, but shows up)
     exam submit                → +100
     unit completion            → +250

   Tiers (inclusive lower bound):
     0     → נער
     500   → תלמיד
     1500  → לומד
     3000  → חכם
     5000  → בוגר

   Exposes:
     window.MelakhimXP = { getXP, getStreak, getTier, award, subscribe }
     window.XpBadgeComponent  — tier badge for the header
     window.XpStatsComponent  — 3-cell strip for Home replacement (xp, streak, tier)
   ========================================================================= */
(function(){
  const { useState, useEffect } = React;

  const TIERS = [
    { min: 0,    name: "נער",   icon: "🌱" },
    { min: 500,  name: "תלמיד", icon: "📘" },
    { min: 1500, name: "לומד",  icon: "📜" },
    { min: 3000, name: "חכם",   icon: "✡️" },
    { min: 5000, name: "בוגר",  icon: "👑" }
  ];

  const AWARDS = {
    quiz_know:    10,
    quiz_partial: 5,
    quiz_dont:    2,
    exam_submit:  100,
    unit_done:    250
  };

  const listeners = new Set();

  function readNum(key){ try { return parseInt(localStorage.getItem(key), 10) || 0; } catch { return 0; } }
  function readJSON(key, fb){ try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fb; } catch { return fb; } }
  function writeJSON(key, v){ try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }
  function writeStr(key, v){ try { localStorage.setItem(key, String(v)); } catch {} }

  function ilDay(ts){
    const d = new Date(ts || Date.now());
    return d.toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" }); // YYYY-MM-DD
  }

  function getXP(){ return readNum("jarvis.xp"); }
  function getStreak(){ return readNum("jarvis.streak.days"); }
  function getTier(xp){
    const n = typeof xp === "number" ? xp : getXP();
    let t = TIERS[0];
    for (const tier of TIERS) if (n >= tier.min) t = tier;
    const idx = TIERS.indexOf(t);
    const next = TIERS[idx + 1] || null;
    const progress = next ? Math.min(1, (n - t.min) / (next.min - t.min)) : 1;
    return { ...t, next, progress, xp: n };
  }

  function notify(){
    const snap = { xp: getXP(), streak: getStreak(), tier: getTier() };
    listeners.forEach(fn => { try { fn(snap); } catch {} });
  }

  function award(reason, amount){
    const delta = typeof amount === "number" ? amount : (AWARDS[reason] || 0);
    if (!delta) return;
    const before = getXP();
    writeStr("jarvis.xp", before + delta);
    notify();
  }

  function touchStreak(){
    const today = ilDay();
    const last = localStorage.getItem("jarvis.streak.lastDay");
    if (last === today) return;
    const days = getStreak();
    if (!last) {
      writeStr("jarvis.streak.days", 1);
    } else {
      const gap = Math.round((new Date(today) - new Date(last)) / 86400000);
      if (gap === 1) writeStr("jarvis.streak.days", days + 1);
      else if (gap > 1) writeStr("jarvis.streak.days", 1);
    }
    try { localStorage.setItem("jarvis.streak.lastDay", today); } catch {}
    notify();
  }

  // ---- observer: react to mb-local-write without touching any page code ----
  function onLocalWrite(ev){
    const d = ev && ev.detail; if (!d || !d.key) return;
    const { key, value } = d;
    touchStreak();

    // Quiz grades: award the delta between seen and current.
    if (/^jarvis\.quiz\.[^.]+\.progress$/.test(key)) {
      let parsed = null;
      try { parsed = JSON.parse(value); } catch { parsed = null; }
      if (!parsed || typeof parsed !== "object") return;
      const seen = readJSON("jarvis.xp.grades_seen", {});
      let delta = 0;
      Object.keys(parsed).forEach(qid => {
        const rec = parsed[qid];
        const g = rec && rec.grade;
        if (!g || seen[qid] === g) return;
        if (g === "know")    delta += AWARDS.quiz_know;
        if (g === "partial") delta += AWARDS.quiz_partial;
        if (g === "dont")    delta += AWARDS.quiz_dont;
        seen[qid] = g;
      });
      writeJSON("jarvis.xp.grades_seen", seen);
      if (delta) award(null, delta);
      return;
    }

    // Exam attempts: award +100 per new attempt.
    if (key === "jarvis.exam.attempts") {
      let arr = null;
      try { arr = JSON.parse(value); } catch { arr = null; }
      if (!Array.isArray(arr)) return;
      const seen = readNum("jarvis.xp.attempts_seen");
      if (arr.length > seen) {
        award("exam_submit", (arr.length - seen) * AWARDS.exam_submit);
        writeStr("jarvis.xp.attempts_seen", arr.length);
      }
      return;
    }

    // Unit completion: legacy profile blob mentions it (melakhim_pro_v2).
    if (key === "melakhim_pro_v2") {
      let p = null;
      try { p = JSON.parse(value); } catch { p = null; }
      if (!p || !p.quizScores) return;
      const done = Object.keys(p.quizScores).filter(u => (p.quizScores[u]||0) >= 80);
      const seen = readJSON("jarvis.xp.units_seen", []);
      const fresh = done.filter(u => seen.indexOf(u) < 0);
      if (fresh.length) {
        award("unit_done", fresh.length * AWARDS.unit_done);
        writeJSON("jarvis.xp.units_seen", seen.concat(fresh));
      }
      return;
    }
  }

  function subscribe(fn){
    listeners.add(fn);
    fn({ xp: getXP(), streak: getStreak(), tier: getTier() });
    return () => listeners.delete(fn);
  }

  // ---- UI ----
  function XpBadge(props){
    const compact = !!(props && props.compact);
    const [snap, setSnap] = useState(() => ({ xp: getXP(), streak: getStreak(), tier: getTier() }));
    useEffect(() => subscribe(setSnap), []);
    const t = snap.tier;
    return (
      <span
        title={`XP ${snap.xp}${t.next ? ` · הדרגה הבאה: ${t.next.name} (${t.next.min})` : " · דרגה מרבית"}`}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border border-amber-500/40 bg-amber-900/30 text-amber-200"
      >
        <span aria-hidden="true">{t.icon}</span>
        <span>{t.name}</span>
        {!compact && <span dir="ltr" className="text-amber-100/70">· {snap.xp}</span>}
      </span>
    );
  }

  function XpStats(){
    const [snap, setSnap] = useState(() => ({ xp: getXP(), streak: getStreak(), tier: getTier() }));
    useEffect(() => subscribe(setSnap), []);
    const t = snap.tier;
    return (
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="card rounded-lg p-2">
          <div className="text-amber-200/70">🔥 ימים ברצף</div>
          <div className="font-bold text-amber-300 text-lg" dir="ltr">{snap.streak}</div>
        </div>
        <div className="card rounded-lg p-2">
          <div className="text-amber-200/70">⭐ XP</div>
          <div className="font-bold text-amber-300 text-lg" dir="ltr">{snap.xp}</div>
        </div>
        <div className="card rounded-lg p-2">
          <div className="text-amber-200/70">{t.icon} דרגה</div>
          <div className="font-bold text-amber-300 text-lg">{t.name}</div>
        </div>
      </div>
    );
  }

  if (typeof window !== "undefined") {
    window.MelakhimXP        = { getXP, getStreak, getTier, award, subscribe, TIERS, AWARDS };
    window.XpBadgeComponent  = XpBadge;
    window.XpStatsComponent  = XpStats;
    // Wire the observer once.
    try { window.addEventListener("mb-local-write", onLocalWrite); } catch {}
    // Touch streak on load (opening the app counts as engagement).
    try { touchStreak(); } catch {}
  }
})();
