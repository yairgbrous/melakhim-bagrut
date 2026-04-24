/* =========================================================================
   BookChapter — /#/book/:chapter
   Renders a curated excerpt from a מלכים chapter stored in
   window.TANAKH_EXCERPTS[key] where key is "K1-12" / "K2-23" etc.
   Accepts props.chapter as the key (e.g. "K1-12") or {book,ch}.
   Fallback: if key not found, shows a "הפרק עוד לא נטען" card with
   deep links to Sefaria / מכון ממרא / חב״ד for the requested chapter.
   "שאל על הפרק הזה" dispatches practice-entity + navigates to /quizPlay
   with mode="chapter" and chapterKey so QuizEngine can scope to 5 qs.
   Exposes: window.BookChapter
   ========================================================================= */
(function(){
  const { useMemo } = React;

  function parseKey(raw){
    if (!raw) return null;
    if (typeof raw === "object" && raw.book && raw.ch) {
      const b = String(raw.book) === "2" ? "K2" : "K1";
      return b + "-" + String(raw.ch);
    }
    const s = String(raw).toUpperCase().replace(/^#?\/?BOOK\/?/, "");
    const m = /^K?([12])[-\/_](\d{1,2})$/.exec(s) || /^([12])[-\/_](\d{1,2})$/.exec(s);
    if (!m) return null;
    return "K" + m[1] + "-" + parseInt(m[2], 10);
  }

  function sefariaSlug(book){ return book === "2" ? "II_Kings" : "I_Kings"; }
  function mamreCode(book){ return book === "2" ? "k9b" : "k9a"; }
  function chabadAid(book){ return book === "2" ? 15786 : 15785; }

  function ExternalLinks({book, chapter}){
    const ch = chapter;
    const ch2 = String(ch).padStart(2,"0");
    const urls = {
      sefaria: `https://www.sefaria.org.il/${sefariaSlug(book)}.${ch}?lang=he`,
      mamre:   `https://mechon-mamre.org/i/t/t${mamreCode(book)}${ch2}.htm`,
      chabad:  `https://www.chabad.org/library/bible_cdo/aid/${chabadAid(book)}/jewish/Chapter-${ch}.htm`
    };
    const cls = "gold-btn rounded-xl py-2.5 px-3 text-sm font-bold flex items-center justify-center gap-1 no-underline";
    return (
      <div className="grid grid-cols-3 gap-2">
        <a href={urls.sefaria} target="_blank" rel="noopener noreferrer" className={cls}>📚 ספריא</a>
        <a href={urls.mamre}   target="_blank" rel="noopener noreferrer" className={cls}>🕯 מכון ממרא</a>
        <a href={urls.chabad}  target="_blank" rel="noopener noreferrer" className={cls}>✡️ חב״ד</a>
      </div>
    );
  }

  function BookChapter(props){
    const setRoute = props && props.setRoute;
    const rawKey = props && (props.chapter || props.id || props.key_);
    const key = useMemo(()=>parseKey(rawKey), [rawKey]);
    const entry = useMemo(()=>{
      const all = (typeof window !== "undefined" && window.TANAKH_EXCERPTS) || {};
      return key ? (all[key] || null) : null;
    }, [key]);

    const book = key ? key.slice(1,2) : "1";
    const ch   = key ? parseInt(key.split("-")[1], 10) : null;
    const bookName = book === "2" ? "מְלָכִים ב׳" : "מְלָכִים א׳";

    const go = (page, extra) => setRoute && setRoute({ page, ...(extra||{}) });

    const onPractice = () => {
      if (!key) return;
      const detail = { type: "chapter", id: key, book, chapter: ch, count: 5 };
      try { window.dispatchEvent(new CustomEvent("practice-entity", { detail })); } catch {}
      go("quizPlay", { mode: "chapter", chapterKey: key, count: 5 });
    };

    if (!key) {
      return (
        <div className="max-w-2xl mx-auto space-y-4 p-2">
          <button onClick={()=>go("home")} className="text-on-parchment-accent text-sm">→ חזרה לדף הבית</button>
          <div className="card rounded-xl p-4 text-on-parchment-muted text-sm">
            מזהה פרק שגוי. נסה <code>/#/book/K1-12</code> או <code>/#/book/K2-17</code>.
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto space-y-4 p-2">
        <button onClick={()=>go("home")} className="text-on-parchment-accent text-sm">→ חזרה לדף הבית</button>

        <header className="card rounded-2xl p-5">
          <div className="text-xs text-on-parchment-muted uppercase tracking-wider mb-1">מקור מקראי</div>
          <h1 className="font-display text-2xl md:text-3xl font-black text-on-parchment-accent hebrew">
            📖 {bookName} · פֶּרֶק {ch}
          </h1>
          {entry && entry.title && (
            <div className="hebrew text-lg font-bold text-on-parchment mt-2">{entry.title}</div>
          )}
          {entry && entry.significance && (
            <p className="text-on-parchment-muted text-sm mt-2 leading-relaxed">{entry.significance}</p>
          )}
        </header>

        {entry && Array.isArray(entry.verses) && entry.verses.length > 0 ? (
          <section className="parchment rounded-2xl p-5">
            <div className="hebrew text-lg leading-loose text-amber-950" style={{fontFamily:"'Frank Ruhl Libre', serif"}}>
              {entry.verses.map((v,i) => (
                <p key={i} className="mb-3" style={{textIndent:0}}>
                  <span className="al ms-2" style={{fontWeight:700, color:'#6B4A1F'}}>{v.num}</span>
                  {v.text}
                </p>
              ))}
            </div>
          </section>
        ) : (
          <div className="card rounded-xl p-4 text-on-parchment-muted text-sm hebrew">
            הפרק עוד לא נטען לקובץ הציטוטים המקומי. אפשר לקרוא את הפרק המלא בקישורים החיצוניים למטה ↓
          </div>
        )}

        <section className="card rounded-xl p-4">
          <h3 className="text-xs font-bold text-on-parchment mb-2">קרא במקורות</h3>
          <ExternalLinks book={book} chapter={ch}/>
        </section>

        <button onClick={onPractice} className="gold-btn w-full py-3 rounded-xl text-base font-bold">
          ⚔️ שאל על הפרק הזה · 5 שאלות
        </button>
      </div>
    );
  }

  if (typeof window !== "undefined") window.BookChapter = BookChapter;
})();
