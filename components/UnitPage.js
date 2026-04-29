/* =========================================================================
   UnitPage — /#/unit/:N
   Three tabs:
     לימוד    — full deep summary from window.UNIT_DEEP_SUMMARIES (intro
                paragraph, turning points, significance, breadth themes,
                recurring items).
     תרגול    — review questions for the unit, one at a time, with hints
                and reveal of the model answer points.
     מבחן     — 10 random questions, scored, with a results screen.

   Sidebar: "🔗 קשרים ליחידה" — 8-12 EntityLink chips of kings, characters,
   events, and places that match the unit. We use unit.related_* fields
   when present; otherwise we derive from era/keyword/chapter heuristics
   so the sidebar populates even before the data files grow new fields.

   Progress: each tab persists to localStorage as
       jarvis.melakhim.progress.unit{N}.{learn|practice|exam}
   storing { pct: number, ts: number, ... }, mirrored at the top of the
   page as three mini progress bars.

   Exposes: window.UnitPageComponent
   ========================================================================= */
(function(){
  const { useState, useMemo, useEffect, useCallback } = React;

  // -----------------------------------------------------------------
  // localStorage progress helpers — schema: jarvis.melakhim.progress.unit{N}.{tab}
  // -----------------------------------------------------------------
  const KEY = (n, tab) => "jarvis.melakhim.progress.unit" + n + "." + tab;

  function readPct(unitId, tab){
    try {
      const raw = localStorage.getItem(KEY(unitId, tab));
      if (!raw) return 0;
      const obj = JSON.parse(raw);
      const pct = +(obj && obj.pct);
      return Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) : 0;
    } catch (e) { return 0; }
  }
  function writePct(unitId, tab, pct, extra){
    try {
      const payload = Object.assign({ pct: Math.max(0, Math.min(100, pct)), ts: Date.now() }, extra || {});
      localStorage.setItem(KEY(unitId, tab), JSON.stringify(payload));
    } catch (e) {}
  }

  // -----------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------
  function findDeep(unitId){
    const arr = (typeof window !== "undefined" && Array.isArray(window.UNIT_DEEP_SUMMARIES)) ? window.UNIT_DEEP_SUMMARIES : [];
    return arr.find(u => +u.unit === +unitId) || null;
  }
  function findUnit(unitId){
    const md = (typeof MELAKHIM_DATA !== "undefined") ? MELAKHIM_DATA : null;
    if (md && Array.isArray(md.units)) return md.units.find(x => +x.id === +unitId) || null;
    return null;
  }
  function reviewQuestionsForUnit(unitId){
    const all = (typeof window !== "undefined" && Array.isArray(window.REVIEW_QUESTIONS)) ? window.REVIEW_QUESTIONS : [];
    return all.filter(q => +q.unit === +unitId);
  }

  // Build the connections list — union of the deep summary's
  // turning_points (kings/characters/events/places), the unit's
  // declared related_* (if any), plus an era-based fallback for kings.
  function connectionsForUnit(unitId, deep, unit){
    const idx = (typeof window !== "undefined" && window.__ENTITY_INDEX__) || {};
    const seen = { king: new Set(), character: new Set(), event: new Set(), place: new Set() };

    // 1. From deep summary turning points.
    (deep && deep.turning_points || []).forEach(tp => {
      (tp.participants || []).forEach(pid => {
        if (idx.king && idx.king[pid])           seen.king.add(pid);
        else if (idx.character && idx.character[pid]) seen.character.add(pid);
      });
      (tp.places || []).forEach(p => seen.place.add(p));
      (tp.events || []).forEach(e => seen.event.add(e));
    });

    // 2. Era-based fallback: every king whose .era matches the unit.
    if (Array.isArray(window.KINGS_DATA)) {
      window.KINGS_DATA.filter(k => +k.era === +unitId).forEach(k => seen.king.add(k.id));
    }

    // 3. Unit's hand-authored related_* if present.
    if (unit) {
      (unit.related_kings || []).forEach(x => seen.king.add(x));
      (unit.related_characters || []).forEach(x => seen.character.add(x));
      (unit.related_events || []).forEach(x => seen.event.add(x));
      (unit.related_places || []).forEach(x => seen.place.add(x));
    }

    return {
      kings:      Array.from(seen.king),
      characters: Array.from(seen.character),
      events:     Array.from(seen.event),
      places:     Array.from(seen.place)
    };
  }

  // Round-robin sample to keep all four types represented.
  function sampleConnections(conn, max){
    const groups = [
      { type: "king",      ids: conn.kings },
      { type: "character", ids: conn.characters },
      { type: "event",     ids: conn.events },
      { type: "place",     ids: conn.places }
    ];
    const out = [];
    const pos = groups.map(() => 0);
    let active = groups.filter(g => g.ids.length).length;
    while (out.length < max && active > 0) {
      active = 0;
      for (let gi = 0; gi < groups.length; gi++) {
        const g = groups[gi];
        if (pos[gi] >= g.ids.length) continue;
        out.push({ type: g.type, id: g.ids[pos[gi]] });
        pos[gi]++;
        if (pos[gi] < g.ids.length) active++;
        if (out.length >= max) return out;
      }
    }
    return out;
  }

  // Strip {{type:id|label}} bio tokens for plain rendering.
  function stripTokens(t){
    if (typeof t !== "string") return t || "";
    return t.replace(/\{\{[a-zA-Zא-ת_]+:[^|}]+\|([^}]+)\}\}/g, "$1");
  }

  // -----------------------------------------------------------------
  // Sub-components
  // -----------------------------------------------------------------
  function ProgressBar({ label, pct, color }){
    const p = Math.max(0, Math.min(100, +pct || 0));
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-on-parchment">{label}</span>
          <span className="text-on-parchment-muted" dir="ltr">{p}%</span>
        </div>
        <div style={{height:8, background:"rgba(212,165,116,.18)", borderRadius:999, overflow:"hidden"}}>
          <div style={{height:"100%", width:p+"%", background:color, transition:"width .3s ease"}}/>
        </div>
      </div>
    );
  }

  function Connections({ unitId, deep, unit, setRoute }){
    const conn = useMemo(() => connectionsForUnit(unitId, deep, unit), [unitId, deep, unit]);
    const total = conn.kings.length + conn.characters.length + conn.events.length + conn.places.length;
    if (total === 0) return null;
    const picked = sampleConnections(conn, 12);
    const EL = window.EntityLinkComponent;
    return (
      <section className="card rounded-2xl p-4">
        <h3 className="font-display text-base font-bold text-on-parchment mb-2">🔗 קשרים ליחידה</h3>
        <div className="flex flex-wrap gap-0">
          {EL && picked.map((c, i) => (
            <EL key={c.type+":"+c.id+":"+i} type={c.type} id={c.id} setRoute={setRoute}/>
          ))}
        </div>
      </section>
    );
  }

  // Era band colors per unit (gold for unit 1, etc.)
  const UNIT_BAND = {1:"#D4A574",2:"#A83240",3:"#3E8E7E",4:"#6B5B95",5:"#8B4513",6:"#2C3E50"};

  // Curated key quotes per unit. Refs follow ספר/פרק/פסוק form.
  const KEY_QUOTES = {
    1: [
      { text: "וְנָתַתָּ לְעַבְדְּךָ לֵב שֹׁמֵעַ לִשְׁפֹּט אֶת־עַמְּךָ", ref: "מלכים-א ג, ט" },
      { text: "כִּי מָלֵא כְבוֹד ה' אֶת בֵּית ה'", ref: "מלכים-א ח, יא" },
      { text: "וַיֶּאֱהַב הַמֶּלֶךְ שְׁלֹמֹה נָשִׁים נָכְרִיּוֹת רַבּוֹת", ref: "מלכים-א יא, א" }
    ],
    2: [
      { text: "אָבִי הִכְבִּיד אֶת עֻלְּכֶם וַאֲנִי אוֹסִיף עַל עֻלְּכֶם", ref: "מלכים-א יב, יד" },
      { text: "מַה לָּנוּ חֵלֶק בְּדָוִד וְלֹא נַחֲלָה בְּבֶן יִשַׁי", ref: "מלכים-א יב, טז" },
      { text: "כִּי מֵאִתִּי נִהְיָה הַדָּבָר הַזֶּה", ref: "מלכים-א יב, כד" }
    ],
    3: [
      { text: "ה' הוּא הָאֱלֹהִים, ה' הוּא הָאֱלֹהִים", ref: "מלכים-א יח, לט" },
      { text: "וְאַחַר הָאֵשׁ — קוֹל דְּמָמָה דַקָּה", ref: "מלכים-א יט, יב" },
      { text: "הֲרָצַחְתָּ וְגַם יָרָשְׁתָּ", ref: "מלכים-א כא, יט" }
    ],
    4: [
      { text: "אָבִי אָבִי רֶכֶב יִשְׂרָאֵל וּפָרָשָׁיו", ref: "מלכים-ב ב, יב" },
      { text: "הֲשָׁלוֹם זִמְרִי הֹרֵג אֲדֹנָיו", ref: "מלכים-ב ט, לא" },
      { text: "וַיְהִי בִּשְׁנַת שֶׁבַע לְיֵהוּא מָלַךְ יְהוֹאָשׁ", ref: "מלכים-ב יב, ב" }
    ],
    5: [
      { text: "וְלֹא הֶאֱמִינוּ בַּה' אֱלֹהֵיהֶם", ref: "מלכים-ב יז, יד" },
      { text: "וַיִּגֶל יִשְׂרָאֵל מֵעַל אַדְמָתוֹ אַשּׁוּרָה", ref: "מלכים-ב יז, כג" },
      { text: "וַיִּתְאַנַּף ה' מְאֹד בְּיִשְׂרָאֵל וַיְסִירֵם מֵעַל פָּנָיו", ref: "מלכים-ב יז, יח" }
    ],
    6: [
      { text: "סֵפֶר הַתּוֹרָה מָצָאתִי בְּבֵית ה'", ref: "מלכים-ב כב, ח" },
      { text: "וְכָמֹהוּ לֹא הָיָה לְפָנָיו מֶלֶךְ אֲשֶׁר שָׁב אֶל ה'", ref: "מלכים-ב כג, כה" },
      { text: "אַךְ לֹא שָׁב ה' מֵחֲרוֹן אַפּוֹ הַגָּדוֹל", ref: "מלכים-ב כג, כו" }
    ]
  };

  // Split a long Hebrew paragraph into 3-4 paragraphs by sentence boundaries,
  // grouping sentences so each paragraph is ~roughly balanced.
  function splitParagraphs(text){
    const clean = String(text || "").trim();
    if (!clean) return [];
    // Split on sentence terminators (. ! ?) followed by whitespace.
    const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (sentences.length <= 1) return [clean];
    const target = Math.min(4, Math.max(2, Math.ceil(sentences.length / 3)));
    const perGroup = Math.ceil(sentences.length / target);
    const out = [];
    for (let i = 0; i < sentences.length; i += perGroup) {
      out.push(sentences.slice(i, i + perGroup).join(" "));
    }
    return out;
  }

  function ChipCard({ icon, title, items, type, setRoute }){
    const EL = window.EntityLinkComponent;
    const [open, setOpen] = useState(true);
    if (!items || items.length === 0) return null;
    return (
      <section className="card rounded-2xl overflow-hidden" style={{border:"1px solid rgba(212,165,116,.45)"}}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          className="w-full px-4 py-3 flex items-center justify-between gap-2 text-right transition hover:bg-amber-500/10">
          <span className="font-display text-base md:text-lg font-bold text-on-parchment">
            <span className="ms-2">{icon}</span>{title}
          </span>
          <span className="text-xs font-mono text-on-parchment-muted" dir="ltr">
            {items.length} {open ? "▾" : "▸"}
          </span>
        </button>
        {open && (
          <div className="px-3 pb-3 pt-1 flex flex-wrap gap-0">
            {EL && items.map((it, i) => {
              const t = type || it.type;
              const id = typeof it === "string" ? it : it.id;
              return <EL key={t+":"+id+":"+i} type={t} id={id} setRoute={setRoute}/>;
            })}
          </div>
        )}
      </section>
    );
  }

  function LearnTab({ deep, unit, unitId, setRoute, onComplete }){
    if (!deep) {
      return (
        <div className="card rounded-xl p-4 text-on-parchment-muted text-sm">
          סיכום מעמיק ליחידה זו טרם הוזן ל-<code>window.UNIT_DEEP_SUMMARIES</code>.
        </div>
      );
    }

    const band = UNIT_BAND[+unitId] || "#D4A574";
    const idx = (typeof window !== "undefined" && window.__ENTITY_INDEX__) || {};

    // Build clickable chip lists from turning_points + unit.related_*.
    const peopleMap = new Map();   // id -> {type:"king"|"character", id}
    const eventsSet = new Set();
    const placesSet = new Set();
    (deep.turning_points || []).forEach(tp => {
      (tp.participants || []).forEach(pid => {
        if (peopleMap.has(pid)) return;
        const isKing = idx.king && idx.king[pid];
        peopleMap.set(pid, { type: isKing ? "king" : "character", id: pid });
      });
      (tp.events || []).forEach(e => eventsSet.add(e));
      (tp.places || []).forEach(p => placesSet.add(p));
    });
    if (unit) {
      (unit.related_kings      || []).forEach(x => { if (!peopleMap.has(x)) peopleMap.set(x, { type:"king",      id:x }); });
      (unit.related_characters || []).forEach(x => { if (!peopleMap.has(x)) peopleMap.set(x, { type:"character", id:x }); });
      (unit.related_events     || []).forEach(x => eventsSet.add(x));
      (unit.related_places     || []).forEach(x => placesSet.add(x));
    }
    const people  = Array.from(peopleMap.values());
    const events  = Array.from(eventsSet).map(id => ({ type:"event", id }));
    const places  = Array.from(placesSet).map(id => ({ type:"place", id }));
    const breadth = (Array.isArray(deep.breadth_themes) ? deep.breadth_themes : []).map(id => ({ type:"breadth", id }));

    const summaryParas = splitParagraphs(stripTokens(deep.intro));
    const quotes = KEY_QUOTES[+unitId] || [];

    return (
      <div className="space-y-5 unit-learn-tab">
        {/* Hero — era band, big title, subtitle, reference badge */}
        <section
          className="parchment rounded-2xl p-6 md:p-8"
          style={{borderTop:"6px solid "+band, position:"relative"}}>
          <div
            className="text-xs font-bold px-3 py-1 rounded-full inline-block mb-3"
            style={{background: band, color:"#fff", letterSpacing:".02em"}}>
            יחידה <span dir="ltr">{unitId}</span>
          </div>
          <h2 className="font-display font-black text-amber-900" style={{fontSize:"clamp(28px,4vw,40px)", lineHeight:1.15}}>
            {deep.title}
          </h2>
          {unit && unit.subtitle && (
            <p className="text-amber-800 mt-2" style={{fontSize:"clamp(15px,1.6vw,19px)", fontWeight:500}}>
              {unit.subtitle}
            </p>
          )}
          {unit && unit.range && (
            <span
              className="inline-block mt-4 text-sm font-mono px-3 py-1 rounded-full"
              style={{background:"rgba(212,165,116,.18)", color:"#7c4a08", border:"1px solid "+band+"88"}}>
              📚 {unit.range}
            </span>
          )}
        </section>

        {/* Summary card */}
        {summaryParas.length > 0 && (
          <section
            className="parchment rounded-2xl p-6 md:p-8 mx-auto"
            style={{maxWidth:"720px"}}>
            <h3 className="font-display text-xl md:text-2xl font-bold text-amber-900 mb-4">
              📜 תקציר היחידה
            </h3>
            <div className="hebrew text-amber-950" style={{fontSize:"17px", lineHeight:1.7}}>
              {summaryParas.map((p, i) => (
                <p key={i} className="mb-4 last:mb-0">{p}</p>
              ))}
            </div>
          </section>
        )}

        {/* 4 entity cards in 2x2 grid (stacks on mobile) */}
        <div className="grid gap-4 md:grid-cols-2">
          <ChipCard icon="👑" title="דמויות מפתח"          items={people}  setRoute={setRoute}/>
          <ChipCard icon="📜" title="אירועים"               items={events}  setRoute={setRoute}/>
          <ChipCard icon="📍" title="מקומות"                items={places}  setRoute={setRoute}/>
          <ChipCard icon="🌐" title="נושאי רוחב לשאלה"      items={breadth} setRoute={setRoute}/>
        </div>

        {/* Significance — short editorial paragraph */}
        {deep.significance && (
          <section className="card rounded-2xl p-5">
            <h3 className="font-display text-base font-bold text-on-parchment mb-2">✨ משמעות לספר</h3>
            <p className="hebrew text-on-parchment-muted leading-relaxed">{stripTokens(deep.significance)}</p>
          </section>
        )}

        {/* Recurring items chips — keep accessible */}
        {Array.isArray(deep.recurring_items) && deep.recurring_items.length > 0 && (
          <ChipCard icon="🔁" title="פריטים חוזרים"
            items={deep.recurring_items.map(id => ({ type:"recurringItem", id }))}
            setRoute={setRoute}/>
        )}

        {/* Key quotes — gold border, easy to scan */}
        {quotes.length > 0 && (
          <section
            className="rounded-2xl p-5 md:p-6"
            style={{
              background:"linear-gradient(135deg,#FFF8E7 0%,#FCEFC9 100%)",
              border:"2px solid #D4A574",
              boxShadow:"0 4px 16px rgba(212,165,116,.25)"
            }}>
            <h3 className="font-display text-xl md:text-2xl font-bold text-amber-900 mb-4">
              📖 ציטוטי מפתח
            </h3>
            <ul className="space-y-3">
              {quotes.map((q, i) => (
                <li
                  key={i}
                  className="hebrew leading-relaxed"
                  style={{
                    fontSize:"17px",
                    paddingInlineStart:"16px",
                    borderInlineStart:"4px solid #D4A574",
                    color:"#3a2410"
                  }}>
                  <div className="font-bold" style={{lineHeight:1.6}}>״{q.text}״</div>
                  <div className="text-sm font-mono mt-1" style={{color:"#7c4a08"}}>{q.ref}</div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <button
          onClick={onComplete}
          className="gold-btn w-full py-3 rounded-xl text-base font-bold">
          ✅ סמן כנלמד
        </button>
      </div>
    );
  }

  function PracticeTab({ unitId, setRoute, onProgress }){
    const all = useMemo(() => reviewQuestionsForUnit(unitId), [unitId]);
    const [diffFilter, setDiffFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [i, setI] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [seen, setSeen] = useState(new Set());

    const TYPE_HEBREW = {
      short_answer:      "תשובה קצרה",
      mi_amar_lemi:      "מי אמר למי",
      be_eize_hekhsher:  "באיזה הקשר",
      al_mi_neemar:      "על מי נאמר",
      character_details: "פרטי דמות",
      place_events:      "אירועים במקום",
      multiple_choice:   "רב־ברירה"
    };
    const [mcPick, setMcPick] = useState(null);
    const typeLabel = (t) => {
      if (!t) return "שאלה";
      const rdn = (typeof window !== "undefined" && typeof window.resolveDisplayName === "function") ? window.resolveDisplayName : null;
      if (TYPE_HEBREW[t]) return TYPE_HEBREW[t];
      if (rdn) {
        const r = rdn(t);
        if (r && r !== t) return r;
      }
      return String(t).replace(/_/g, " ");
    };
    const matchesTypeFilter = (q, f) => {
      if (f === "all") return true;
      if (q.type === f || q.question_type === f || q.category === f) return true;
      return false;
    };

    const typeCounts = useMemo(() => {
      const c = {};
      all.forEach(q => { const k = q.type || "other"; c[k] = (c[k] || 0) + 1; });
      return c;
    }, [all]);

    const filtered = useMemo(() => all.filter(q =>
      (diffFilter === 'all' || q.difficulty === diffFilter) &&
      matchesTypeFilter(q, typeFilter)
    ), [all, diffFilter, typeFilter]);

    useEffect(() => { setI(0); setRevealed(false); setMcPick(null); }, [diffFilter, typeFilter]);

    if (all.length === 0) {
      return (
        <div className="card rounded-xl p-4 text-on-parchment-muted text-sm">
          אין שאלות תרגול ליחידה זו. ודא ש-<code>data/review-questions.js</code> נטען.
        </div>
      );
    }

    const DiffPill = ({value, label}) => (
      <button type="button"
        onClick={()=>setDiffFilter(value)}
        className={"text-sm px-3 py-1.5 rounded-full font-bold border transition " +
          (diffFilter === value
            ? "bg-amber-500 text-amber-950 border-amber-600"
            : "card border-amber-700/30 text-on-parchment hover:scale-[1.02]")
        }>
        {label}
      </button>
    );
    const TypePill = ({value, label, count}) => (
      <button type="button"
        onClick={()=>setTypeFilter(value)}
        className={"text-sm px-3 py-1.5 rounded-full font-bold border transition " +
          (typeFilter === value
            ? "bg-amber-500 text-amber-950 border-amber-600"
            : "card border-amber-700/30 text-on-parchment hover:scale-[1.02]")
        }>
        {label}{typeof count === "number" ? ` (${count})` : ""}
      </button>
    );

    const filterRows = (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-sm font-bold text-on-parchment-muted ms-1">רמה:</span>
          <DiffPill value="all"    label="כל הרמות"/>
          <DiffPill value="קל"     label="קל"/>
          <DiffPill value="בינוני" label="בינוני"/>
          <DiffPill value="קשה"    label="קשה"/>
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-sm font-bold text-on-parchment-muted ms-1">סוג:</span>
          <TypePill value="all"               label="כל הסוגים" count={all.length}/>
          <TypePill value="multiple_choice"   label="רב־ברירה" count={typeCounts.multiple_choice}/>
          <TypePill value="short_answer"      label="תשובה קצרה" count={typeCounts.short_answer}/>
          <TypePill value="mi_amar_lemi"      label="מי אמר למי" count={typeCounts.mi_amar_lemi}/>
          <TypePill value="be_eize_hekhsher"  label="באיזה הקשר" count={typeCounts.be_eize_hekhsher}/>
          <TypePill value="al_mi_neemar"      label="על מי נאמר" count={typeCounts.al_mi_neemar}/>
          <TypePill value="character_details" label="פרטי דמות" count={typeCounts.character_details}/>
          <TypePill value="place_events"      label="אירועים במקום" count={typeCounts.place_events}/>
          <TypePill value="רוחב"              label="רוחב"/>
        </div>
        <div className="text-sm text-on-parchment-muted">
          מציג <span dir="ltr">{filtered.length}</span> שאלות מתוך <span dir="ltr">{all.length}</span>
        </div>
      </div>
    );

    if (filtered.length === 0) {
      return (
        <div className="space-y-3 unit-page-polish">
          {filterRows}
          <div className="card rounded-xl p-4 text-on-parchment-muted text-sm text-center">
            אין שאלות לרמה/סוג זה.
          </div>
        </div>
      );
    }

    const safeI = i % filtered.length;
    const q = filtered[safeI];
    const isMC = q.type === "multiple_choice" && Array.isArray(q.options) && q.options.length > 0;
    const goNext = () => {
      const nextSeen = new Set(seen); nextSeen.add(q.id);
      setSeen(nextSeen);
      setRevealed(false);
      setMcPick(null);
      setI((safeI + 1) % filtered.length);
      const pct = Math.round((nextSeen.size / all.length) * 100);
      onProgress && onProgress(pct, { lastQuestionId: q.id, seen: Array.from(nextSeen) });
    };
    const pickMC = (idx) => {
      setMcPick(idx);
      setRevealed(true);
    };

    const seenCount = seen.size;
    const pct = Math.round((seenCount / all.length) * 100);
    const EL = window.EntityLinkComponent;

    return (
      <div className="space-y-4 unit-page-polish">
        {filterRows}
        <div className="flex items-center justify-between text-xs text-on-parchment-muted">
          <span>שאלה <span dir="ltr">{safeI + 1}</span> מתוך <span dir="ltr">{filtered.length}</span></span>
          <span>נצפו: <span dir="ltr">{seenCount}</span> ({pct}%)</span>
        </div>
        <section className="parchment rounded-2xl p-5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-700 text-amber-100 font-bold">{typeLabel(q.type)}</span>
            <span className="text-xs text-amber-900 font-bold">{q.difficulty || ""}</span>
          </div>
          <p className="hebrew text-amber-950 leading-loose text-base">{q.prompt_niqqud || q.prompt}</p>
        </section>

        {isMC && (
          <div className="space-y-2">
            {q.options.map((opt, j) => {
              const picked = mcPick === j;
              const correct = q.correct_index === j;
              let cls = "w-full text-right card rounded-xl p-3 text-base font-bold border transition hebrew leading-relaxed ";
              if (revealed) {
                if (correct) cls += "bg-emerald-500/30 border-emerald-500 text-emerald-100";
                else if (picked) cls += "bg-red-500/30 border-red-500 text-red-100";
                else cls += "border-amber-700/30 text-on-parchment opacity-80";
              } else {
                cls += "border-amber-700/30 text-on-parchment hover:scale-[1.01]";
              }
              return (
                <button key={j} type="button"
                  disabled={revealed}
                  onClick={() => pickMC(j)}
                  className={cls}>
                  <span className="text-xs ms-2 opacity-70">{j+1}.</span> {opt}
                  {revealed && correct && <span className="ms-2">✅</span>}
                  {revealed && picked && !correct && <span className="ms-2">❌</span>}
                </button>
              );
            })}
            {revealed && (
              <div className={"text-sm font-bold p-3 rounded-xl " + (mcPick === q.correct_index
                ? "bg-emerald-500/20 text-emerald-200"
                : "bg-red-500/20 text-red-200")}>
                {mcPick === q.correct_index
                  ? "✅ כל הכבוד! תשובה נכונה."
                  : `❌ התשובה הנכונה: ${q.options[q.correct_index]}`}
              </div>
            )}
          </div>
        )}

        {!isMC && !revealed && (
          <button onClick={() => setRevealed(true)} className="gold-btn w-full py-3 rounded-xl text-base font-bold">
            🔎 גלה תשובה
          </button>
        )}

        {revealed && (
          <section className="card rounded-2xl p-4">
            <h4 className="text-sm font-bold text-on-parchment-accent mb-2">נקודות בתשובה הצפויה</h4>
            <ul className="space-y-1.5 text-sm text-on-parchment hebrew list-disc pr-5">
              {(q.answer_points || []).map((p, j) => <li key={j}>{p}</li>)}
            </ul>
            {Array.isArray(q.related_entities) && q.related_entities.length > 0 && EL && (
              <div className="mt-3 pt-3 border-t border-amber-700/30">
                <div className="text-xs font-bold text-on-parchment-accent mb-1.5">🔗 ישויות קשורות</div>
                <div className="flex flex-wrap gap-0">
                  {q.related_entities.map((tag, k) => {
                    const [t, id] = String(tag).split(":");
                    const type = t === "char" ? "character" : t;
                    return id ? <EL key={k} type={type} id={id} setRoute={setRoute}/> : null;
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        <button onClick={goNext} className="card rounded-xl p-3 w-full text-center text-on-parchment-accent font-bold hover:scale-[1.01] transition">
          ← השאלה הבאה
        </button>
      </div>
    );
  }

  function shuffle(arr){
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function ExamTab({ unitId, setRoute, onComplete }){
    const pool = useMemo(() => reviewQuestionsForUnit(unitId), [unitId]);
    const [run, setRun] = useState(null); // {questions:[], answers:[], i, done}

    const start = () => {
      const qs = shuffle(pool).slice(0, Math.min(10, pool.length));
      setRun({ questions: qs, answers: qs.map(() => null), i: 0, done: false });
    };

    if (pool.length === 0) {
      return (
        <div className="card rounded-xl p-4 text-on-parchment-muted text-sm">
          אין שאלות מבחן ליחידה זו. ודא ש-<code>data/review-questions.js</code> נטען.
        </div>
      );
    }
    if (!run) {
      return (
        <div className="space-y-3">
          <div className="card rounded-2xl p-4">
            <h3 className="font-display text-base font-bold text-on-parchment mb-1">📝 מבחן יחידה</h3>
            <p className="text-sm text-on-parchment-muted">10 שאלות אקראיות מבנק יחידה זו. בכל שאלה — דרג את עצמך לאחר חשיפת התשובה.</p>
          </div>
          <button onClick={start} className="gold-btn w-full py-3 rounded-xl text-base font-bold">⚔️ התחל מבחן</button>
        </div>
      );
    }
    if (run.done) {
      const correct = run.answers.filter(a => a === true).length;
      const pct = Math.round((correct / run.questions.length) * 100);
      onComplete && onComplete(pct, { score: correct, total: run.questions.length });
      return (
        <div className="space-y-3">
          <section className="parchment rounded-2xl p-5 text-center">
            <div className="font-display text-2xl font-bold text-amber-900 mb-1">תוצאה</div>
            <div className="font-display text-4xl font-black text-amber-900" dir="ltr">{correct} / {run.questions.length}</div>
            <div className="text-amber-950 text-sm mt-1" dir="ltr">{pct}%</div>
          </section>
          <button onClick={start} className="gold-btn w-full py-3 rounded-xl text-base font-bold">🔁 מבחן חדש</button>
          <button onClick={() => setRun(null)} className="card rounded-xl p-3 w-full text-on-parchment-accent font-bold">→ חזרה</button>
        </div>
      );
    }

    const q = run.questions[run.i];
    const grade = (correct) => {
      const next = run.answers.slice();
      next[run.i] = correct;
      const ni = run.i + 1;
      if (ni >= run.questions.length) setRun({ ...run, answers: next, done: true });
      else                            setRun({ ...run, answers: next, i: ni });
    };

    return (
      <div className="space-y-3">
        <div className="text-xs text-on-parchment-muted text-center">
          שאלה <span dir="ltr">{run.i + 1}</span> מתוך <span dir="ltr">{run.questions.length}</span>
        </div>
        <section className="parchment rounded-2xl p-5">
          <p className="hebrew text-amber-950 leading-loose">{q.prompt_niqqud || q.prompt}</p>
        </section>
        <details className="card rounded-2xl p-4">
          <summary className="cursor-pointer font-bold text-on-parchment-accent">🔎 גלה תשובה צפויה</summary>
          <ul className="mt-2 space-y-1.5 text-sm text-on-parchment hebrew list-disc pr-5">
            {(q.answer_points || []).map((p, j) => <li key={j}>{p}</li>)}
          </ul>
        </details>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => grade(false)}
            className="card rounded-xl p-3 text-center font-bold border border-red-500/40 text-red-200 hover:scale-[1.01] transition">
            ❌ לא ידעתי
          </button>
          <button onClick={() => grade(true)}
            className="card rounded-xl p-3 text-center font-bold border border-emerald-500/40 text-emerald-200 hover:scale-[1.01] transition">
            ✅ ידעתי
          </button>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // Top-level UnitPage
  // -----------------------------------------------------------------
  function UnitPage(props){
    const unitId = props && props.unitId;
    const setRoute = (props && props.setRoute) || (typeof window !== "undefined" ? (window.__appSetRoute__ || window.__setRoute) : null);

    const deep = useMemo(() => findDeep(unitId), [unitId]);
    const unit = useMemo(() => findUnit(unitId), [unitId]);
    const [tab, setTab] = useState("learn");

    const [pct, setPct] = useState({
      learn:    readPct(unitId, "learn"),
      practice: readPct(unitId, "practice"),
      exam:     readPct(unitId, "exam")
    });
    useEffect(() => {
      setTab("learn");
      setPct({
        learn:    readPct(unitId, "learn"),
        practice: readPct(unitId, "practice"),
        exam:     readPct(unitId, "exam")
      });
    }, [unitId]);

    const onTabClick = useCallback((e, id) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      setTab(id);
    }, []);

    const updatePct = useCallback((key, value, extra) => {
      writePct(unitId, key, value, extra);
      setPct(prev => Object.assign({}, prev, { [key]: Math.max(prev[key] || 0, value) }));
    }, [unitId]);

    if (!unitId) {
      return <div className="text-on-parchment-muted text-sm p-4">חסר מזהה יחידה.</div>;
    }

    const headerColor = ({1:"#D4A574",2:"#A83240",3:"#3E8E7E",4:"#6B5B95",5:"#8B4513",6:"#2C3E50"})[unitId] || "#D4A574";
    const title = (deep && deep.title) || (unit && unit.title) || ("יחידה " + unitId);

    return (
      <div className="max-w-3xl mx-auto space-y-4 p-2">
        <button onClick={() => setRoute && setRoute({ page: "path" })} className="text-on-parchment-accent text-sm">→ חזרה למסלול</button>

        <header className="card rounded-2xl p-5" style={{borderColor: headerColor + "55"}}>
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold px-2.5 py-0.5 rounded-full inline-block mb-2" style={{background: headerColor, color:"#fff"}}>
                יחידה <span dir="ltr">{unitId}</span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-on-parchment">{title}</h1>
              {unit && unit.subtitle && <p className="text-sm text-on-parchment-muted mt-1">{unit.subtitle}</p>}
              {unit && unit.range && <p className="text-xs text-on-parchment-muted mt-1 font-mono">{unit.range}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <ProgressBar label="לימוד"   pct={pct.learn}    color="#3E8E7E"/>
            <ProgressBar label="תרגול"   pct={pct.practice} color="#D4A574"/>
            <ProgressBar label="מבחן"    pct={pct.exam}     color="#A83240"/>
          </div>
        </header>

        <Connections unitId={unitId} deep={deep} unit={unit} setRoute={setRoute}/>

        <div role="tablist" aria-label="לשוניות יחידה" className="grid grid-cols-3 gap-2 sticky top-0 z-20 py-1" style={{background:"linear-gradient(180deg,rgba(10,22,40,.85),rgba(10,22,40,.65))",backdropFilter:"blur(6px)"}}>
          {[
            { id: "learn",    label: "📖 לימוד" },
            { id: "practice", label: "🔁 תרגול" },
            { id: "exam",     label: "📝 מבחן"  }
          ].map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} type="button" role="tab"
                aria-selected={active} aria-controls={"tabpanel-" + t.id}
                id={"tab-" + t.id}
                onClick={(e) => onTabClick(e, t.id)}
                className={"px-3 py-2 rounded-xl text-sm font-bold border transition relative " +
                  (active
                    ? "tab-active border-amber-500 ring-2 ring-amber-400/60"
                    : "card border-amber-700/30 text-on-parchment hover:scale-[1.01]")
                }>
                {t.label}
              </button>
            );
          })}
        </div>

        <div role="tabpanel" id={"tabpanel-" + tab} aria-labelledby={"tab-" + tab} key={"panel-" + unitId + "-" + tab}>
          {tab === "learn" && (
            <LearnTab
              deep={deep} unit={unit} unitId={unitId} setRoute={setRoute}
              onComplete={() => updatePct("learn", 100, { completedAt: Date.now() })}
            />
          )}
          {tab === "practice" && (
            <PracticeTab
              unitId={unitId} setRoute={setRoute}
              onProgress={(p, extra) => updatePct("practice", p, extra)}
            />
          )}
          {tab === "exam" && (
            <ExamTab
              unitId={unitId} setRoute={setRoute}
              onComplete={(p, extra) => updatePct("exam", p, extra)}
            />
          )}
        </div>
      </div>
    );
  }

  if (typeof window !== "undefined") window.UnitPageComponent = UnitPage;
})();
