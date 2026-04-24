/* =========================================================================
   data/breadth-topics.js — canonical נושאי רוחב for בגרות 2551 מלכים תשפ״ו
   ========================================================================
   Exposes: window.BREADTH_TOPICS (array of topic objects)

   SOURCES consulted (2026-04-24):
   ───────────────────────────────
   [S1] משרד החינוך — דף ההיבחנות וההערכה תנ״ך חמ״ד:
        https://pop.education.gov.il/tchumey_daat/bible-hemed/high-school/pedagogy/examinations-evaluation/
        (body 403 in this env; URL structure + sub-pages confirm 2551 exam exists for תשפ״ו)
   [S2] משרד החינוך — קובץ מיקוד תשפ״ו לתנ״ך דתי:
        https://meyda.education.gov.il/files/portal_talmidim/mikud/2026/tanach_dati.pdf
        (body 403 in this env; URL confirmed by WebSearch multiple hits)
   [S3] מדרשת הר עציון / ישיבת הר עציון — שיעורי מלכים:
        שיעור 11: פילוג הממלכה – סיבתיות כפולה
           https://etzion.org.il/he/tanakh/neviim/sefer-melakhim-aleph/פילוג-הממלכה-יב-א-כד-4-סיבתיות-כפולה
        שיעור 27: עבודת ה׳ בימי אחאב
           https://torah.etzion.org.il/he/שיעור-27-עבודת-ה-בימי-אחאב-ומימי-רחבעם-ועד-ימי-אמציה
        מבוא: פרקי נביאים בספר מלכים
           https://etzion.org.il/he/tanakh/neviim/sefer-melakhim-aleph/פרקי-נביאים-בספר-מלכים-מבוא-קצר
   [S4] ויקיפדיה — סיבתיות כפולה (Yehezkel Kaufmann):
        https://he.wikipedia.org/wiki/סיבתיות_כפולה
   [S5] משרד החינוך — חוברת חזרה לבגרות בקיאות במלכים:
        https://meyda.education.gov.il/files/Pop/0files/TanachHemed/pasokA.pdf
        (body 403; URL + search results confirm it's the official בקיאות booklet)
   [S6] Internal corroboration — data/events.js `related_breadth[]` uses exactly
        these 7 IDs across all 30+ events, and data/past-exams.js `topic_he`
        tags map cleanly onto the same 7 themes.

   TOPIC STATUS MODEL:
   ───────────────────
   { status: 'verified'   — cross-referenced by ≥2 sources above, no guessing
     status: 'unverified' — only one source or heuristic match; `search_queries`
                            must be populated so a reviewer can confirm }

   EACH TOPIC SCHEMA:
   ──────────────────
   {
     id, name_niqqud, category, status,
     summary_400w,           // 3-4 paragraphs with niqqud + literary analysis
     key_concepts: [{name_niqqud, definition}],    // 5-8 items
     related_events: [...],                         // 10+ event ids
     related_characters: [...],                     // 15+ character ids
     related_places: [...],                         // 5+ place ids
     related_kings: [...],                          // 5+ king ids
     sample_quotes: [{text_niqqud, book_ref, event_id}], // 10+
     exam_questions: [...],                         // 5+ past-exam question ids
     maps: [...],                                   // map_numbers linking geography
     sources: [...],                                // which [S#] corroborate
     search_queries: [...]                          // only if status==='unverified'
   }
   ========================================================================= */

window.BREADTH_TOPICS = [];
