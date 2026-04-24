/* =========================================================================
   Timeline — interactive chronological chart 931→586 BCE.
   ---------------------------------------------------------------------------
   - Top track    : Judah kings     (emerald=צדיק, ruby=רשע, amber=מעורב)
   - Middle track : 14 prophets as labeled dots
   - Bottom track : Israel kings    (same color code)
   - Overlay flags: 931 פילוג · 722 חורבן שומרון · 586 חורבן ירושלים
   - Mobile pinch-zoom via CSS transform scale; desktop horizontal scroll
   - "עכשיו לומדים: יחידה N" marker reads localStorage
       jarvis.melakhim.currentUnit → draws pulsing band over that span
   - Click king/prophet → setRoute({page:"character", id})
   Exposes: window.TimelineComponent
   ========================================================================= */
(function(){
  const { useMemo, useRef, useState, useEffect } = React;

  // ---- Thiele-chronology regnal dates (conventional, BCE) -----------------
  const JUDAH = [
    ["rehavam",        931, 913, "רשע"],
    ["aviyam",         913, 911, "רשע"],
    ["asa",            911, 870, "צדיק"],
    ["yehoshafat",     870, 849, "צדיק"],
    ["yoram_yehuda",   849, 842, "רשע"],
    ["achaziah_yehuda",842, 841, "רשע"],
    ["atalyah_char",   841, 835, "רשע"],
    ["yehoash_yehuda", 835, 796, "צדיק"],
    ["amatzya",        796, 767, "צדיק"],
    ["uziyahu",        767, 740, "צדיק"],
    ["yotam",          740, 732, "צדיק"],
    ["achaz",          732, 716, "רשע"],
    ["chizkiyahu",     716, 687, "צדיק"],
    ["menashe",        687, 642, "רשע"],
    ["amon",           642, 640, "רשע"],
    ["yoshiyahu",      640, 609, "צדיק"],
    ["yehoachaz_yehuda",609,609, "רשע"],
    ["yehoyakim",      609, 598, "רשע"],
    ["yehoyachin",     598, 597, "רשע"],
    ["tzidkiyahu",     597, 586, "רשע"],
  ];
  const ISRAEL = [
    ["yarovam",           931, 910, "רשע"],
    ["nadav",             910, 909, "רשע"],
    ["basha",             909, 886, "רשע"],
    ["ela",               886, 885, "רשע"],
    ["zimri",             885, 885, "רשע"],
    ["omri",              885, 874, "רשע"],
    ["achav",             874, 853, "רשע"],
    ["achaziah_yisrael",  853, 852, "רשע"],
    ["yoram_yisrael",     852, 841, "רשע"],
    ["yehu",              841, 814, "רשע"],
    ["yehoachaz_yisrael", 814, 798, "רשע"],
    ["yoash_yisrael",     798, 782, "רשע"],
    ["yarovam_beit",      793, 753, "רשע"],
    ["zacharia",          753, 752, "רשע"],
    ["shalum",            752, 752, "רשע"],
    ["menachem",          752, 742, "רשע"],
    ["pekachya",          742, 740, "רשע"],
    ["pekach",            740, 732, "רשע"],
    ["hoshea",            732, 722, "רשע"],
  ];
  const PROPHETS = [
    ["achiya_hashiloni",    "אֲחִיָּה",    930, 925],
    ["eliyahu",             "אֵלִיָּהוּ",  870, 850],
    ["elisha",              "אֱלִישָׁע",   850, 800],
    ["ovadyahu_asher_al_habayit", "עוֹבַדְיָהוּ", 870, 850],
    ["yona_ben_amittai",    "יוֹנָה",     785, 760],
    ["amos",                "עָמוֹס",    760, 750],
    ["hoshea_hanavi",       "הוֹשֵׁעַ",   755, 725],
    ["yeshayahu",           "יְשַׁעְיָהוּ",740, 690],
    ["micha",               "מִיכָה",    735, 700],
    ["nachum",              "נַחוּם",    660, 630],
    ["tzfanya",             "צְפַנְיָה",  635, 625],
    ["chavakuk",            "חֲבַקּוּק",  620, 605],
    ["yoel",                "יוֹאֵל",    830, 820],
    ["chulda",              "חֻלְדָּה",   625, 620],
    ["yirmiyahu",           "יִרְמְיָהוּ", 627, 586],
  ];
  const EVENTS = [
    [931, "פִּילוּג הַמַּמְלָכָה", "amber"],
    [722, "חֻרְבַּן שׁוֹמְרוֹן", "ruby"],
    [586, "חֻרְבַּן יְרוּשָׁלַיִם", "ruby"],
  ];

  // Approximate unit time spans (matches unit-deep-summaries)
  const UNIT_SPANS = {
    1: [971, 931], // Solomon era (conceptual, clipped to chart start 931)
    2: [931, 870], // Split through early Judah kings
    3: [874, 842], // House of Omri + Elijah cycle
    4: [841, 782], // Jehu + Elisha cycle
    5: [782, 716], // Fall of Samaria + middle Judah kings
    6: [716, 586], // Hezekiah, Manasseh, Josiah, destruction
  };

  const TONES = {
    "צדיק":  { bg:"#047857", fg:"#ecfdf5", bd:"#10b981" },
    "רשע":   { bg:"#9f1239", fg:"#fff1f2", bd:"#f43f5e" },
    "מעורב": { bg:"#a16207", fg:"#fef3c7", bd:"#d97706" },
  };

  // ---- layout constants ---------------------------------------------------
  const START_YEAR = 945;        // a little air before 931
  const END_YEAR   = 582;        // a little air after 586
  const SPAN       = START_YEAR - END_YEAR; // 363
  const PX_PER_YEAR = 9;         // desktop baseline; zoom scales this
  const CHART_WIDTH = SPAN * PX_PER_YEAR; // ~3267px
  const KING_ROW_H  = 44;
  const PROPHET_ROW_H = 64;

  // Convert BCE year → x pixel (right-to-left visually, but LTR axis internally).
  // We keep positive x = earlier year, negative-ish = later. Since the whole
  // chart is RTL via dir="rtl" on the page, and we render absolutely, use
  // simple math: x(y) = (START_YEAR - y) * PX_PER_YEAR.
  const x = y => (START_YEAR - y) * PX_PER_YEAR;

  // ---- king lookup for CharacterPage navigation ---------------------------
  function resolveId(id){
    const aliases = (window.__ENTITY_ALIASES__ || {});
    const m = aliases.character || aliases.king;
    if (m && Object.prototype.hasOwnProperty.call(m, id)) {
      const v = m[id];
      if (typeof v === "string") return v;
    }
    return id;
  }
  function goCharacter(setRoute, id){
    if (setRoute) setRoute({ page:"character", id: resolveId(id) });
  }

  // ---- sub-components -----------------------------------------------------
  function YearAxis(){
    const ticks = [];
    for (let y = 940; y >= 580; y -= 20) ticks.push(y);
    return (
      <div className="absolute inset-x-0 top-0 h-5 border-b border-amber-500/20"
           style={{width:CHART_WIDTH}}>
        {ticks.map(y => (
          <div key={y} className="absolute top-0 text-[10px] text-on-parchment-muted"
               style={{right: x(y), transform:"translateX(50%)"}}>
            <div className="w-px h-2 bg-amber-500/30 mx-auto"></div>
            <div dir="ltr">{y}</div>
          </div>
        ))}
      </div>
    );
  }

  function KingBar({ row, track, onClick }){
    const [id, start, end, assess] = row;
    const tone = TONES[assess] || TONES["מעורב"];
    const left  = x(start);
    const width = Math.max(8, (start - end) * PX_PER_YEAR);
    const entry = ((window.CHARACTERS_DATA || []).concat(window.KINGS_DATA || []))
      .find(r => r && r.id === id);
    const label = (entry && (entry.name_niqqud || entry.name)) || id;
    const top = track === "top" ? 28 : 28 + KING_ROW_H + PROPHET_ROW_H;
    return (
      <button
        onClick={() => onClick(id)}
        title={`${label} · ${start}–${end} לפנה״ס`}
        className="absolute rounded-md text-xs font-bold flex items-center justify-center hebrew transition hover:scale-[1.04] hover:z-20"
        style={{
          right: left,
          width,
          top,
          height: KING_ROW_H - 6,
          background: tone.bg,
          color: tone.fg,
          border: `1px solid ${tone.bd}`,
          boxShadow: "0 1px 3px rgba(0,0,0,.3)",
          overflow: "hidden",
          padding: "0 4px",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}>
        {label}
      </button>
    );
  }

  function ProphetDot({ row, onClick, onHover }){
    const [id, label, from, to] = row;
    const mid = (from + to) / 2;
    const left = x(mid);
    const width = Math.max(2, (from - to) * PX_PER_YEAR);
    const top = 28 + KING_ROW_H + 6;
    return (
      <button
        onClick={() => onClick(id)}
        title={`${label} · ${from}–${to}`}
        className="absolute flex flex-col items-center transition hover:scale-110 hover:z-20"
        style={{ right: left - width/2, width, top, height: PROPHET_ROW_H - 12 }}>
        <div style={{
          width: "100%", height: 4, borderRadius: 9999,
          background: "linear-gradient(90deg, #7c3aed, #c084fc, #7c3aed)",
          boxShadow: "0 0 6px rgba(192,132,252,.6)",
        }}/>
        <div style={{
          width: 10, height: 10, marginTop: 2, borderRadius: "50%",
          background: "#c084fc", border: "2px solid #7c3aed",
          boxShadow: "0 0 8px rgba(192,132,252,.8)",
        }}/>
        <div className="hebrew text-[10px] mt-1 text-purple-200 font-bold" style={{whiteSpace:"nowrap"}}>
          {label}
        </div>
      </button>
    );
  }

  function EventFlag({ year, label, tone }){
    const color = tone === "ruby" ? "#f43f5e" : "#d97706";
    const bg    = tone === "ruby" ? "rgba(244,63,94,.9)" : "rgba(217,119,6,.9)";
    return (
      <div className="absolute z-10 pointer-events-none"
           style={{ right: x(year), top: 20, transform:"translateX(50%)" }}>
        <div style={{width:2, height: KING_ROW_H*2 + PROPHET_ROW_H + 20, background: color, boxShadow:`0 0 8px ${color}`, margin:"0 auto"}}/>
        <div className="hebrew text-[10px] font-bold px-2 py-0.5 rounded mt-1"
             style={{background: bg, color: "#fff", whiteSpace:"nowrap", boxShadow:"0 2px 6px rgba(0,0,0,.3)"}}>
          {label}
          <div className="text-[9px] font-normal opacity-80" dir="ltr">{year}</div>
        </div>
      </div>
    );
  }

  function UnitBand({ unit }){
    const span = UNIT_SPANS[unit];
    if (!span) return null;
    const [from, to] = span;
    const clampedFrom = Math.min(from, 945);
    const left = x(clampedFrom);
    const width = Math.max(20, (clampedFrom - to) * PX_PER_YEAR);
    const topY = 24;
    const botY = 28 + KING_ROW_H*2 + PROPHET_ROW_H + 10;
    return (
      <div className="absolute pointer-events-none"
           style={{
             right: left, width,
             top: topY, height: botY - topY,
             background: "rgba(217,119,6,.12)",
             border: "2px dashed rgba(217,119,6,.5)",
             borderRadius: 8,
             zIndex: 5,
             animation: "mbPulse 2.6s ease-in-out infinite",
           }}>
        <div className="absolute -top-6 right-2 text-[11px] font-bold hebrew px-2 py-0.5 rounded"
             style={{background: "rgba(217,119,6,.95)", color: "#fff"}}>
          ⏳ עכשיו לומדים: יחידה {unit}
        </div>
      </div>
    );
  }

  function Legend(){
    return (
      <div className="flex flex-wrap items-center gap-3 text-xs hebrew text-on-parchment-muted pb-2">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{background:TONES["צדיק"].bg}}/>צדיק</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{background:TONES["רשע"].bg}}/>רשע</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{background:TONES["מעורב"].bg}}/>מעורב</span>
        <span className="flex items-center gap-1"><span className="w-3 h-1 rounded-full" style={{background:"#c084fc"}}/>נביא</span>
        <span className="flex items-center gap-1"><span className="w-px h-3" style={{background:"#f43f5e"}}/>חורבן</span>
      </div>
    );
  }

  // ---- main component -----------------------------------------------------
  function Timeline({ setRoute }){
    const scrollRef = useRef(null);
    const [zoom, setZoom] = useState(1);
    const [currentUnit, setCurrentUnit] = useState(null);

    useEffect(() => {
      try {
        const raw = localStorage.getItem("jarvis.melakhim.currentUnit");
        if (raw) {
          const n = parseInt(raw, 10);
          if (n>=1 && n<=6) setCurrentUnit(n);
        }
      } catch {}
    }, []);

    // Pinch-zoom support (mobile)
    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;
      let start = 0, startZoom = 1;
      const onTouchStart = e => {
        if (e.touches.length !== 2) return;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        start = Math.hypot(dx,dy);
        startZoom = zoom;
      };
      const onTouchMove = e => {
        if (e.touches.length !== 2) return;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx,dy);
        const z = Math.max(0.5, Math.min(2.5, startZoom * dist / start));
        setZoom(z);
      };
      el.addEventListener("touchstart", onTouchStart, { passive: true });
      el.addEventListener("touchmove",  onTouchMove,  { passive: true });
      return () => {
        el.removeEventListener("touchstart", onTouchStart);
        el.removeEventListener("touchmove",  onTouchMove);
      };
    }, [zoom]);

    const onKing = id => goCharacter(setRoute, id);

    const chartH = 28 + KING_ROW_H + PROPHET_ROW_H + KING_ROW_H + 20;

    return (
      <div className="max-w-5xl mx-auto p-3 md:p-5 space-y-3">
        <header className="flex items-end justify-between flex-wrap gap-2">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-black text-on-parchment-accent hebrew">
              ציר הזמן של ספר מלכים
            </h1>
            <div className="text-xs text-on-parchment-muted mt-1 hebrew">
              931–586 לפנה״ס · מפילוג הממלכה עד חורבן הבית · לחץ על מלך/נביא לדף המלא
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={()=>setZoom(z=>Math.max(0.5,z-0.2))}
              className="px-2 py-1 text-xs rounded border border-amber-500/40 text-on-parchment">−</button>
            <span className="text-xs text-on-parchment-muted px-2">{Math.round(zoom*100)}%</span>
            <button onClick={()=>setZoom(z=>Math.min(2.5,z+0.2))}
              className="px-2 py-1 text-xs rounded border border-amber-500/40 text-on-parchment">+</button>
          </div>
        </header>

        <Legend/>

        <div ref={scrollRef}
          className="rounded-2xl border border-amber-500/20 bg-[rgba(10,22,40,.6)] overflow-x-auto overflow-y-hidden"
          style={{touchAction:"pan-x", WebkitOverflowScrolling:"touch"}}
          dir="ltr">
          <div className="relative"
               style={{
                 width: CHART_WIDTH,
                 height: chartH,
                 transform: `scaleX(${zoom})`,
                 transformOrigin: "top right",
                 minHeight: chartH,
               }}>
            <YearAxis/>
            {currentUnit && <UnitBand unit={currentUnit}/>}

            {/* Track labels */}
            <div className="absolute right-1 text-[10px] text-emerald-300 font-bold hebrew"
                 style={{top: 32, zIndex: 1}}>יהודה</div>
            <div className="absolute right-1 text-[10px] text-purple-300 font-bold hebrew"
                 style={{top: 28 + KING_ROW_H + 4, zIndex: 1}}>נביאים</div>
            <div className="absolute right-1 text-[10px] text-rose-300 font-bold hebrew"
                 style={{top: 28 + KING_ROW_H + PROPHET_ROW_H + 2, zIndex: 1}}>ישראל</div>

            {JUDAH.map(r => <KingBar key={r[0]} row={r} track="top"    onClick={onKing}/>)}
            {ISRAEL.map(r => <KingBar key={r[0]} row={r} track="bottom" onClick={onKing}/>)}
            {PROPHETS.map(r => <ProphetDot key={r[0]} row={r} onClick={onKing}/>)}
            {EVENTS.map(([y,l,t],i) => <EventFlag key={i} year={y} label={l} tone={t}/>)}
          </div>
        </div>

        <div className="text-xs text-on-parchment-muted hebrew text-center pt-2">
          💡 נייד: צבוט לזום · שולחן עבודה: גרור אופקית
        </div>

        <style>{`
          @keyframes mbPulse {
            0%,100% { box-shadow: 0 0 0 0 rgba(217,119,6,.4); }
            50%     { box-shadow: 0 0 0 6px rgba(217,119,6,.0); }
          }
        `}</style>
      </div>
    );
  }

  if (typeof window !== "undefined") window.TimelineComponent = Timeline;
})();
