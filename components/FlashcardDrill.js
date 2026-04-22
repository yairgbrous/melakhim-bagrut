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
    const [filter, setFilter] = useState("all"); // all | new | learning

    useEffect(()=>{
      if (deck.length) return;
      const onReady = () => setDeck(shuffle(loadDeck()));
      window.addEventListener("entity-index-ready", onReady, {once:true});
      return () => window.removeEventListener("entity-index-ready", onReady);
    }, [deck.length]);

    const progress = S.flashcardProgress || {};

    const visible = useMemo(()=>{
      if (filter==="all") return deck;
      return deck.filter(c => {
        const p = progress[c.id];
        if (filter==="new") return !p || p.bucket==="new";
        if (filter==="learning") return p && p.bucket==="learning";
        return true;
      });
    }, [deck, progress, filter]);

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
          {["all","new","learning"].map(f => (
            <button key={f} onClick={()=>{setFilter(f); setIdx(0); setFlipped(false);}}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border ${filter===f?"bg-amber-500/30 border-amber-400 text-on-parchment-muted":"border-amber-500/30 text-on-parchment"}`}>
              {f==="all"?"הכל":f==="new"?"חדש":"בלימוד"}
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
          <div className="grid grid-cols-2 gap-2">
            <button onClick={()=>setBucket("learning")} className="card border-amber-500/40 rounded-xl py-3 font-bold text-on-parchment hover:bg-amber-500/10">⚠ חזרה שוב</button>
            <button onClick={()=>setBucket("mastered")} className="gold-btn rounded-xl py-3 font-bold">✅ אני יודע</button>
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
