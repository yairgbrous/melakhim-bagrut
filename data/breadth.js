/* =========================================================================
   data/breadth.js — exposes the 7 breadth-topic IDs as window.BREADTH_DATA.

   These IDs are already authored in components/BreadthPage.js (full prose,
   key instances, questions). This file mirrors only the ID + title pair so
   that:
     1. data/_entity-index.js can populate idx.breadth (consumed by
        EntityLink chips and CharacterPage breadth chips).
     2. scripts/audit-entity-links.js can resolve every related_breadth
        reference in characters/events/places against a real bucket.

   Pure additive: no prose, no schema invention, no app-behaviour change.
   The full breadth-topic content remains the source-of-truth in
   BreadthPage.js. If a topic is added there, mirror its id+title here.
   ========================================================================= */
window.BREADTH_DATA = [
  { id: "sibatiyut_kfula", title: "עקרון הסיבתיות הכפולה" },
  { id: "manhig",          title: "מנהיג ומנהיגות"        },
  { id: "mikdash",         title: "בית המקדש"             },
  { id: "melech_navi",     title: "מלך ונביא"              },
  { id: "israel_goyim",    title: "ישראל והעמים"           },
  { id: "ahdut_pilug",     title: "אחדות ופילוג"           },
  { id: "ruchani_medini",  title: "מצב רוחני — מצב מדיני"  },
];
