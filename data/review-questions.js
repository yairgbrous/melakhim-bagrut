/* =========================================================================
   data/review-questions.js — 120+ review questions for ספר מלכים bagrut prep.
   Target: 20 per unit × 6 units.

   Schema per question:
     id               — "rq-u{unit}-{nnn}"
     unit             — 1..6
     type             — "short_answer" | "mi_amar_lemi" | "be_eize_hekhsher"
                        | "al_mi_neemar" | "character_details" | "place_events"
     prompt_niqqud    — question text with niqqud
     answer_points    — array of key answer points (student should hit N of them)
     difficulty       — "קל" | "בינוני" | "קשה"
     related_entities — array of "type:id" strings (king|char|event|place)

   Exposes: window.REVIEW_QUESTIONS  (consumed by QuizEngine / ExamSim)
   ========================================================================= */
(function(){
  const QUESTIONS = [
    // questions inserted incrementally (3 at a time)
  ];
  if (typeof window !== 'undefined'){
    window.REVIEW_QUESTIONS = QUESTIONS;
  }
  if (typeof module !== 'undefined' && module.exports){
    module.exports = QUESTIONS;
  }
})();
