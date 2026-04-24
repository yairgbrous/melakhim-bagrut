/* components/FlashcardDrill.js
   כרטיסיות זיכרון לאזור הבחינה (/quiz). פר מיקוד משרד החינוך תשפ"ו.
   Mounts as window.FlashcardDrillComponent.
   Data source: window.__ENTITY_INDEX__.flashcard (loaded by bootEntityIndex from data/flashcards.js).
   Fallback: tiny built-in sample if index not ready yet.
   Progress persisted via update() into S.flashcardProgress.
   TODO: rewire to data/review-questions.js flashcard slice once Tab A ships it.
*/
(function(){
  const {useState, useMemo, useEffect, useCallback} = React;

  // ============ SM-2 (spaced repetition) ==================================
  // Per-card state: {ease, interval (days), repetitions, dueDate (ms), lastGrade}.
  // Persisted in localStorage['jarvis.flashcards.sm2.' + cardId] as JSON.
  // Grading: Hard → ease-=0.2, interval=1 (reset streak).
  //          Good → ease stays, interval *= ease (round).
  //          Easy → ease+=0.15, interval *= ease*1.3 (round).
  const SM2_KEY = (id) => 'jarvis.flashcards.sm2.' + id;
  const DAY_MS = 86400000;
  function sm2Default(){ return { ease: 2.5, interval: 0, repetitions: 0, dueDate: Date.now(), lastGrade: null }; }
  function sm2Load(id){
    try{
      if (typeof localStorage === 'undefined') return null;
      const s = localStorage.getItem(SM2_KEY(id));
      if (!s) return null;
      const o = JSON.parse(s);
      if (o && typeof o.ease === 'number') return o;
      return null;
    }catch(e){ return null; }
  }
  function sm2Save(id, state){
    try{
      if (typeof localStorage !== 'undefined') localStorage.setItem(SM2_KEY(id), JSON.stringify(state));
    }catch(e){}
  }
  function sm2Grade(prev, grade){
    const p = prev || sm2Default();
    let { ease, interval, repetitions } = p;
    const isNew = !(interval >= 1);
    if (grade === 'hard'){
      ease = Math.max(1.3, +(ease - 0.2).toFixed(2));
      interval = 1;
      repetitions = 0;
    } else if (grade === 'good'){
      interval = isNew ? 1 : Math.max(1, Math.round(interval * ease));
      repetitions = (repetitions|0) + 1;
    } else if (grade === 'easy'){
      ease = +(ease + 0.15).toFixed(2);
      interval = isNew ? 3 : Math.max(1, Math.round(interval * ease * 1.3));
      repetitions = (repetitions|0) + 1;
    } else {
      // unknown grade → no-op
      return p;
    }
    return { ease, interval, repetitions, dueDate: Date.now() + interval * DAY_MS, lastGrade: grade };
  }
  function sm2AllDeckIds(){
    const idx = (typeof window !== 'undefined') && window.__ENTITY_INDEX__ && window.__ENTITY_INDEX__.flashcard;
    if (idx && typeof idx === 'object') return Object.keys(idx);
    return [];
  }
  // Count cards that are either unseen OR whose dueDate is <= now.
  function sm2CountDue(deckIds){
    const ids = Array.isArray(deckIds) && deckIds.length ? deckIds : sm2AllDeckIds();
    if (!ids.length) return 0;
    const now = Date.now();
    let n = 0;
    for (let i = 0; i < ids.length; i++){
      const s = sm2Load(ids[i]);
      if (!s || !s.dueDate || s.dueDate <= now) n++;
    }
    return n;
  }
  // Days until next review for each grade (preview for button labels).
  function sm2Preview(prev){
    return {
      hard: 1,
      good: (() => { const p = prev || sm2Default(); const isNew = !(p.interval >= 1); return isNew ? 1 : Math.max(1, Math.round(p.interval * p.ease)); })(),
      easy: (() => { const p = prev || sm2Default(); const isNew = !(p.interval >= 1); const e = p.ease + 0.15; return isNew ? 3 : Math.max(1, Math.round(p.interval * e * 1.3)); })(),
    };
  }

  if (typeof window !== 'undefined'){
    window.FlashcardSM2 = {
      load: sm2Load,
      save: sm2Save,
      grade: sm2Grade,
      countDue: sm2CountDue,
      allIds: sm2AllDeckIds,
      preview: sm2Preview,
      KEY_PREFIX: 'jarvis.flashcards.sm2.',
    };
  }
  // ========================================================================

  const FALLBACK = [
    {id:"fb-1", front:'"וְנָתַתָּ לְעַבְדְּךָ לֵב שֹׁמֵעַ"', back:"בקשת שלמה בחלום גבעון — מל״א ג׳ ט. חכמה לשפוט במקום עושר.", category:"verse"},
    {id:"fb-2", front:"הר הכרמל", back:"זירת העימות בין אליהו לנביאי הבעל (מל״א יח).", category:"place"},
    {id:"fb-3", front:"עגלי ירבעם", back:'שני עגלי זהב בבית־אל ובדן: "הִנֵּה אֱלֹהֶיךָ יִשְׂרָאֵל" (מל״א יב׳ כח).', category:"concept"}
  ];

  function loadDeck(){
    const idx = (typeof window!=="undefined") && window.__ENTITY_INDEX__ && window.__ENTITY_INDEX__.flashcard;
    if (idx && typeof idx === "object"){
      const arr = Object.values(idx);
      if (arr.length) return arr.map(c => ({
        id: c.id, front: c.front || c.heading, back: c.back || c.summary || "",
        category: c.category || "", tags: c.tags || [], difficulty: c.difficulty || 1
      }));
    }
    return FALLBACK.slice();
  }

  function shuffle(arr){
    const a = arr.slice();
    for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
    return a;
  }

  function Stats({deck, progress}){
    const counts = useMemo(()=>{
      const c = {new:0, learning:0, mastered:0};
      deck.forEach(card => {
        const p = progress[card.id];
        if (!p || p.bucket==="new") c.new++;
        else if (p.bucket==="learning") c.learning++;
        else if (p.bucket==="mastered") c.mastered++;
      });
      return c;
    }, [deck, progress]);
    return (
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="card rounded-lg p-2"><div className="text-on-parchment">חדש</div><div className="font-bold text-on-parchment-muted text-lg" dir="ltr">{counts.new}</div></div>
        <div className="card rounded-lg p-2"><div className="text-on-parchment">בלימוד</div><div className="font-bold text-on-parchment-accent text-lg" dir="ltr">{counts.learning}</div></div>
        <div className="card rounded-lg p-2"><div className="text-on-parchment">יודע</div><div className="font-bold text-emerald-400 text-lg" dir="ltr">{counts.mastered}</div></div>
      </div>
    );
  }

  function FlashcardDrill(props){
    const S = props.S || {};
    const update = props.update || (()=>{});
    const setRoute = props.setRoute;

    const [deck, setDeck] = useState(()=>shuffle(loadDeck()));
    const [idx, setIdx] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [filter, setFilter] = useState("due"); // due | all | new | learning
    // SM-2 state bumper — increment after each grade to force re-compute of
    // the "due" filter + per-card state read. (localStorage isn't reactive.)
    const [sm2Tick, setSm2Tick] = useState(0);

    useEffect(()=>{
      if (deck.length) return;
      const onReady = () => setDeck(shuffle(loadDeck()));
      window.addEventListener("entity-index-ready", onReady, {once:true});
      return () => window.removeEventListener("entity-index-ready", onReady);
    }, [deck.length]);

    const progress = S.flashcardProgress || {};

    const visible = useMemo(()=>{
      if (filter==="all") return deck;
      if (filter==="due"){
        const now = Date.now();
        // SM-2-due cards: never seen OR past/equal dueDate.
        const due = deck.filter(c => { const s = sm2Load(c.id); return !s || !s.dueDate || s.dueDate <= now; });
        // If everything is done for today, fall back to the full deck.
        return due.length ? due : deck;
      }
      return deck.filter(c => {
        const p = progress[c.id];
        if (filter==="new") return !p || p.bucket==="new";
        if (filter==="learning") return p && p.bucket==="learning";
        return true;
      });
    }, [deck, progress, filter, sm2Tick]);

    const dueCount = useMemo(() => {
      const now = Date.now();
      return deck.filter(c => { const s = sm2Load(c.id); return !s || !s.dueDate || s.dueDate <= now; }).length;
    }, [deck, sm2Tick]);

    const card = visible[idx % Math.max(1, visible.length)];

    const setBucket = useCallback((bucket) => {
      if (!card) return;
      update(p => ({
        ...p,
        flashcardProgress: {
          ...(p.flashcardProgress||{}),
          [card.id]: {bucket, seen: Date.now()}
        }
      }));
      setFlipped(false);
      setIdx(i => (i + 1) % Math.max(1, visible.length));
    }, [card, update, visible.length]);

    // SM-2 grade: Hard / Good / Easy. Updates localStorage + legacy bucket.
    const gradeSM2 = useCallback((grade) => {
      if (!card) return;
      const prev = sm2Load(card.id);
      const next = sm2Grade(prev, grade);
      sm2Save(card.id, next);
      // Map SM-2 grade to legacy bucket for Stats: Hard→learning, Good/Easy→mastered.
      const bucket = grade === 'hard' ? 'learning' : 'mastered';
      update(p => ({
        ...p,
        flashcardProgress: {
          ...(p.flashcardProgress||{}),
          [card.id]: { bucket, seen: Date.now(), ease: next.ease, interval: next.interval }
        }
      }));
      setFlipped(false);
      setSm2Tick(t => t + 1);
      setIdx(i => (i + 1) % Math.max(1, visible.length));
    }, [card, update, visible.length]);

    const sm2Prev = card ? sm2Load(card.id) : null;
    const preview = card ? sm2Preview(sm2Prev) : { hard:1, good:1, easy:3 };

    const prev = () => { setFlipped(false); setIdx(i => (i - 1 + visible.length) % Math.max(1, visible.length)); };
    const next = () => { setFlipped(false); setIdx(i => (i + 1) % Math.max(1, visible.length)); };
    const reshuffle = () => { setDeck(shuffle(deck)); setIdx(0); setFlipped(false); };

    if (!card){
      return (
        <div className="max-w-xl mx-auto py-8 text-center space-y-3">
          <div className="text-6xl">🃏</div>
          <p className="text-on-parchment">אין כרטיסיות זמינות בסינון הזה.</p>
          <button onClick={()=>setFilter("all")} className="gold-btn px-4 py-2 rounded-lg">הצג הכל</button>
          {setRoute && <button onClick={()=>setRoute({page:"quiz"})} className="card px-4 py-2 rounded-lg text-on-parchment mr-2">חזרה</button>}
        </div>
      );
    }

    const bucket = (progress[card.id] && progress[card.id].bucket) || "new";
    const bucketLabel = {new:"🆕 חדש", learning:"📖 בלימוד", mastered:"✅ יודע"}[bucket];

    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-on-parchment-accent">🃏 כרטיסיות זיכרון</h1>
          {setRoute && <button onClick={()=>setRoute({page:"quiz"})} className="text-on-parchment-accent text-sm">→ חזרה</button>}
        </div>

        <Stats deck={deck} progress={progress}/>

        <div className="flex gap-2 flex-wrap">
          {[["due","🔔 לחזור היום · "+dueCount],["all","הכל"],["new","חדש"],["learning","בלימוד"]].map(([f,label]) => (
            <button key={f} onClick={()=>{setFilter(f); setIdx(0); setFlipped(false);}}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border ${filter===f?"bg-amber-500/30 border-amber-400 text-on-parchment-muted":"border-amber-500/30 text-on-parchment"}`}>
              {label}
            </button>
          ))}
          <button onClick={reshuffle} className="px-3 py-1.5 rounded-full text-xs font-bold border border-amber-500/30 text-on-parchment mr-auto">🔀 ערבב</button>
        </div>

        <div className="text-center text-xs text-on-parchment-meta">
          <span dir="ltr">{(idx%visible.length)+1}/{visible.length}</span> · {bucketLabel}
        </div>

        <div onClick={()=>setFlipped(f=>!f)} role="button" tabIndex={0}
          onKeyDown={e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault(); setFlipped(f=>!f);}}}
          className="parchment rounded-2xl p-6 md:p-10 min-h-[220px] md:min-h-[280px] flex items-center justify-center text-center cursor-pointer select-none transition hover:shadow-xl">
          <div className="w-full">
            {!flipped ? (
              <>
                <div className="text-[10px] uppercase tracking-wide text-amber-800/70 mb-3">{card.category || "צד א"}</div>
                <div className="font-display text-xl md:text-2xl font-bold text-amber-950 leading-snug hebrew">{card.front}</div>
                <div className="mt-6 text-xs text-amber-800/60">👆 הקש להפיכה</div>
              </>
            ) : (
              <>
                <div className="text-[10px] uppercase tracking-wide text-amber-800/70 mb-3">תשובה</div>
                <div className="text-base md:text-lg text-amber-950 leading-relaxed hebrew">{card.back}</div>
                {card.tags && card.tags.length>0 && (
                  <div className="mt-4 flex flex-wrap gap-1 justify-center">
                    {card.tags.map((t,i) => <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-700/20 text-amber-900">{t}</span>)}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {flipped ? (
          <div>
            <div className="text-center text-[11px] text-on-parchment-meta mb-1.5">דרג את הזיכרון שלך · קלפים יחזרו לפי אלגוריתם SM-2</div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={()=>gradeSM2('hard')}
                className="card border-red-500/40 rounded-xl py-3 font-bold text-red-100 hover:bg-red-500/10 flex flex-col items-center">
                <span>😤 קשה</span>
                <span className="text-[10px] font-normal opacity-75 mt-0.5">חזור ב-{preview.hard} יום</span>
              </button>
              <button onClick={()=>gradeSM2('good')}
                className="card border-amber-500/40 rounded-xl py-3 font-bold text-on-parchment hover:bg-amber-500/10 flex flex-col items-center">
                <span>👍 טוב</span>
                <span className="text-[10px] font-normal opacity-75 mt-0.5">חזור בעוד {preview.good} ימים</span>
              </button>
              <button onClick={()=>gradeSM2('easy')}
                className="gold-btn rounded-xl py-3 font-bold flex flex-col items-center">
                <span>✨ קל</span>
                <span className="text-[10px] font-normal opacity-80 mt-0.5">חזור בעוד {preview.easy} ימים</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={prev} className="card rounded-xl py-3 text-on-parchment">→ הקודמת</button>
            <button onClick={next} className="card rounded-xl py-3 text-on-parchment">הבאה ←</button>
          </div>
        )}
      </div>
    );
  }

  if (typeof window !== "undefined") {
    window.FlashcardDrillComponent = FlashcardDrill;
  }
})();
