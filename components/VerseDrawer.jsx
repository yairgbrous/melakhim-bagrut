import React, { useEffect, useRef } from 'react';

const BOOK_CODES = {
  'מלכים א': { mamre: 'k9a', sefaria: 'I_Kings', chabad: 15785 },
  'מלכים ב': { mamre: 'k9b', sefaria: 'II_Kings', chabad: 15786 },
  "מלכים א'": { mamre: 'k9a', sefaria: 'I_Kings', chabad: 15785 },
  "מלכים ב'": { mamre: 'k9b', sefaria: 'II_Kings', chabad: 15786 },
};

export default function VerseDrawer({
  book,
  chapter,
  verseStart,
  verseEnd,
  onClose,
  verses = [],
}) {
  const drawerRef = useRef(null);
  const end = verseEnd || verseStart;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    drawerRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const codes = BOOK_CODES[book] || BOOK_CODES['מלכים א'];
  const ch2 = String(chapter).padStart(2, '0');
  const mamre = `https://mechon-mamre.org/i/t/t${codes.mamre}${ch2}.htm`;
  const sefariaVerse = `https://www.sefaria.org/${codes.sefaria}.${chapter}.${verseStart}?lang=he`;
  const sefariaChapter = `https://www.sefaria.org/${codes.sefaria}.${chapter}?lang=he`;
  const chabad = `https://www.chabad.org/library/bible_cdo/aid/${codes.chabad}/jewish/Chapter-${chapter}.htm`;

  const refText =
    end && end !== verseStart
      ? `${book} ${chapter}:${verseStart}-${end}`
      : `${book} ${chapter}:${verseStart}`;

  const before = verses.filter((v) => v.num < verseStart && v.num >= verseStart - 2);
  const main = verses.filter((v) => v.num >= verseStart && v.num <= end);
  const after = verses.filter((v) => v.num > end && v.num <= end + 2);

  const ctxCls = 'hebrew text-sm leading-loose ps-3 border-s-2 border-amber-500/20 opacity-70';
  const mainCls =
    'hebrew text-xl leading-loose p-4 rounded-xl bg-amber-500/10 border border-amber-500/40';
  const extBtn =
    'gold-btn rounded-xl py-3 px-2 text-sm font-bold flex flex-col items-center gap-1 no-underline';

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        style={{ animation: 'fadeUp .25s ease-out' }}
        aria-hidden="true"
      />
      <aside
        ref={drawerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="verse-drawer-title"
        dir="rtl"
        className="fixed top-0 bottom-0 end-0 w-full sm:w-[460px] max-w-full z-50 card fancy-scroll overflow-y-auto shadow-2xl"
        style={{ animation: 'vdSlide .3s cubic-bezier(.2,.8,.2,1)' }}
      >
        <header className="sticky top-0 z-10 backdrop-blur-md bg-inherit p-5 border-b border-amber-500/30 flex items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-amber-200/70 mb-1">
              מקור מקראי
            </div>
            <h2
              id="verse-drawer-title"
              className="font-display text-3xl font-black text-amber-200"
            >
              {refText}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="סגור"
            className="text-2xl leading-none text-amber-100 hover:text-amber-300 w-9 h-9 rounded-full flex items-center justify-center"
          >
            ×
          </button>
        </header>

        <div className="p-5 space-y-4">
          {before.length > 0 && (
            <div className={ctxCls}>
              {before.map((v) => (
                <p key={v.num} className="mb-1">
                  <span className="al ms-2">{v.num}</span>
                  {v.text}
                </p>
              ))}
            </div>
          )}

          {main.length > 0 ? (
            <div className={mainCls}>
              {main.map((v) => (
                <p key={v.num} className="mb-2">
                  <span className="al ms-2">{v.num}</span>
                  {v.text}
                </p>
              ))}
            </div>
          ) : (
            <div className={`${mainCls} italic opacity-80`}>
              טקסט הפסוק לא נטען מקומית. עיין במקורות החיצוניים למטה ↓
            </div>
          )}

          {after.length > 0 && (
            <div className={ctxCls}>
              {after.map((v) => (
                <p key={v.num} className="mb-1">
                  <span className="al ms-2">{v.num}</span>
                  {v.text}
                </p>
              ))}
            </div>
          )}

          <div className="divider my-3" />

          <div className="grid grid-cols-3 gap-2">
            <a href={mamre} target="_blank" rel="noopener noreferrer" className={extBtn}>
              <span className="text-xl">📖</span>
              <span>מכון ממרא</span>
            </a>
            <a href={sefariaVerse} target="_blank" rel="noopener noreferrer" className={extBtn}>
              <span className="text-xl">📚</span>
              <span>ספריא</span>
            </a>
            <a href={chabad} target="_blank" rel="noopener noreferrer" className={extBtn}>
              <span className="text-xl">✡️</span>
              <span>חב״ד</span>
            </a>
          </div>

          <a
            href={sefariaChapter}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full gold-btn rounded-xl py-3 text-center font-black text-lg no-underline glow"
          >
            קרא את כל הפרק ←
          </a>
        </div>

        <style>{`
          @keyframes vdSlide{from{transform:translateX(-100%);opacity:.5}to{transform:translateX(0);opacity:1}}
          html[data-theme="light"] aside[role="dialog"]{background:linear-gradient(135deg,#F7F1E1 0%,#EEE2C4 100%);color:#1A1611}
          html[data-theme="light"] aside[role="dialog"] h2{color:#6B4A1F}
          html[data-theme="light"] aside[role="dialog"] .text-amber-100,html[data-theme="light"] aside[role="dialog"] .text-amber-200{color:#1A1611!important}
        `}</style>
      </aside>
    </>
  );
}
