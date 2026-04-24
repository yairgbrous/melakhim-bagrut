/* =========================================================================
   Tanakh excerpts for the /#/book/:chapter route — offline-first.
   Each entry: { book: '1'|'2', chapter: number, title, verses: [{num,text}],
                 significance, book_refs? }
   Key is "K1-<ch>" for מלכים א or "K2-<ch>" for מלכים ב.
   Niqqud transcribed from standard Masoretic text (Koren/מקרא מלא).
   Only a curated set of verses per chapter — enough to anchor study;
   a "קרא את כל הפרק" link sends users to Sefaria for the full text.
   ========================================================================= */
window.TANAKH_EXCERPTS = {};
