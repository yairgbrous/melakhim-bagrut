/* =========================================================================
   MapsPage — 19 named maps (book pp. 213-214) with numbered pin overlays.
   Each map: title, era_label, caption, inline-SVG geography, numbered pins,
   and a legend (pin # → named place). Pin click navigates to /place/:id.

   Data sources (in order of preference):
     1. MAPS_19 hardcoded fallback (this file, below)  ← authoritative for v2
     2. window.BAGRUT_MAPS_19  (data/maps.js — Tab A)
     3. window.__ENTITY_INDEX__.map
     4. legacy BAGRUT_MAPS from index.html

   Exposes: window.MapsPageComponent
   ========================================================================= */
(function(){
  const { useState, useEffect, useMemo } = React;

  const UNIT_COLOR = {
    1: "#D4A574", 2: "#A83240", 3: "#3E8E7E",
    4: "#6B5B95", 5: "#8B4513", 6: "#2C3E50"
  };
  const UNIT_TITLE = {
    1: "יחידה א · מלכות שלמה",
    2: "יחידה ב · פילוג הממלכה",
    3: "יחידה ג · אליהו ואחאב",
    4: "יחידה ד · מהפכות ותמורות",
    5: "יחידה ה · הכיבוש האשורי",
    6: "יחידה ו · חורבן יהודה"
  };

  // -------------------------------------------------------------------------
  // MAPS_19 — 19 authoritative maps. Populated incrementally (3 at a time).
  // Coord system: x,y in 0..100 (percentage of canvas).
  // -------------------------------------------------------------------------
  const MAPS_19 = [
    {
      id:"pilug_yerovam",
      number:2, unit:2,
      title:"פילוג הממלכה וערי הפולחן של ירבעם",
      era_label:"ירבעם בן נבט, ~931 לפנה״ס",
      caption:"יהודה בדרום, ישראל בצפון. ירבעם מקים עגלי זהב בבית אל ובדן, ופנואל לבירה בעבר הירדן.",
      pins:[
        {n:1, place:"ירושלים", placeId:"yerushalayim", x:40, y:70},
        {n:2, place:"שכם", placeId:"shchem", x:44, y:48},
        {n:3, place:"בית אל", placeId:"beit_el", x:41, y:60},
        {n:4, place:"דן", placeId:"dan", x:55, y:12},
        {n:5, place:"פנואל", placeId:"pnuel", x:78, y:52}
      ],
      notes:["4 סיכות בבגרות (מתכונת תשפ״ו): בית אל, דן, פנואל ושכם"],
      book_page:213
    },
    {
      id:"sancheriv_701",
      number:11, unit:6,
      title:"מסע סנחריב על יהודה 701 לפנה״ס",
      era_label:"חזקיהו מלך יהודה",
      caption:"סנחריב יורד לכיבוש ערי יהודה הבצורות, צר על לכיש ועל ירושלים; רבשקה משמיע נאומו מ״שדה כובס״.",
      pins:[
        {n:1, place:"ירושלים", placeId:"yerushalayim", x:40, y:70},
        {n:2, place:"לכיש", placeId:"lachish", x:30, y:78},
        {n:3, place:"גת", placeId:"gat", x:25, y:75},
        {n:4, place:"עקרון", placeId:"ekron", x:22, y:68},
        {n:5, place:"לבנה", placeId:"livna", x:28, y:82},
        {n:6, place:"ניניוה (אשור)", placeId:"ninveh", x:92, y:6},
        {n:7, place:"מצרים", placeId:"mitzrayim", x:8, y:94}
      ],
      notes:["מפת שיא הכיבוש האשורי ומפת נס ההצלה של חזקיהו"],
      book_page:214
    },
    {
      id:"yoshiyahu_megido",
      number:12, unit:6,
      title:"יאשיהו במגידו — 609 לפנה״ס",
      era_label:"יאשיהו מלך יהודה, פרעה נכה",
      caption:"פרעה נכה עולה דרך חוף הים לעזרת אשור בכרכמיש; יאשיהו חוצה לו דרך ונהרג במגידו.",
      pins:[
        {n:1, place:"ירושלים", placeId:"yerushalayim", x:40, y:70},
        {n:2, place:"מגידו", placeId:"megido", x:42, y:38},
        {n:3, place:"כרכמיש", placeId:"karkemish", x:80, y:6},
        {n:4, place:"מצרים", placeId:"mitzrayim", x:8, y:94},
        {n:5, place:"נהר פרת", placeId:"prat", x:88, y:20}
      ],
      notes:["נקודת המפנה מאשור לבבל; מות יאשיהו סוגר את עידן הצדק"],
      book_page:214
    },
    {
      id:"shlomo_memlacha",
      number:1, unit:1,
      title:"ממלכת שלמה וקשרי החוץ",
      era_label:"שלמה בן דוד, שיא הממלכה המאוחדת",
      caption:"ממלכה נרחבת ״מלבוא חמת עד נחל מצרים״; בניין המקדש בירושלים, קשרים עם חירם מלך צור, ועם מלכת שבא.",
      pins:[
        {n:1, place:"ירושלים", placeId:"yerushalayim", x:40, y:70},
        {n:2, place:"גבעון", placeId:"givon", x:41, y:66},
        {n:3, place:"צור", placeId:"tzor", x:38, y:22},
        {n:4, place:"מגידו", placeId:"megido", x:42, y:38},
        {n:5, place:"חצור", placeId:"chatzor", x:52, y:26},
        {n:6, place:"עציון גבר", placeId:"etzion_gever", x:46, y:97},
        {n:7, place:"תפסח (נחל פרת)", placeId:"tifsach", x:88, y:14},
        {n:8, place:"מצרים", placeId:"mitzrayim", x:8, y:94}
      ],
      notes:["קשרי המסחר: צור בצפון, עציון גבר בדרום; גבול מזרחי עד תפסח"],
      book_page:213
    },
    {
      id:"asa_baasha_gvul",
      number:3, unit:2,
      title:"אסא ובעשא — מלחמת הגבול בבנימין",
      era_label:"אסא מלך יהודה ובעשא מלך ישראל",
      caption:"בעשא בונה את הרמה לחסום את יציאת יהודה צפונה. אסא שוכר את בן־הדד הארמי, ובעקבות זאת בונה את גבע ואת מצפה.",
      pins:[
        {n:1, place:"ירושלים", placeId:"yerushalayim", x:40, y:70},
        {n:2, place:"הרמה", placeId:"harama", x:41, y:64},
        {n:3, place:"גבע בנימין", placeId:"geva_binyamin", x:43, y:65},
        {n:4, place:"מצפה", placeId:"mitzpe", x:40, y:62},
        {n:5, place:"דמשק (ארם)", placeId:"damesek", x:76, y:18},
        {n:6, place:"עיון", placeId:"iyon", x:58, y:18},
        {n:7, place:"דן", placeId:"dan", x:55, y:12}
      ],
      notes:["אסא מוריד אוצרות בית ה׳ לשלוחם לבן־הדד"],
      book_page:213
    },
    {
      id:"ahab_aram",
      number:4, unit:3,
      title:"מלחמות אחאב בארם — אפק ורמות גלעד",
      era_label:"אחאב מלך ישראל, בן־הדד מלך ארם",
      caption:"ניצחונות ישראל בשומרון ובאפק; בברית אחאב־יהושפט העלייה לרמות גלעד נגמרת בנפילת אחאב.",
      pins:[
        {n:1, place:"שומרון", placeId:"shomron", x:42, y:42},
        {n:2, place:"אפק", placeId:"afek", x:64, y:38},
        {n:3, place:"רמות גלעד", placeId:"ramot_gilad", x:72, y:45},
        {n:4, place:"יזרעאל", placeId:"yizrael", x:47, y:35},
        {n:5, place:"דמשק (ארם)", placeId:"damesek", x:76, y:18},
        {n:6, place:"ירושלים (יהושפט)", placeId:"yerushalayim", x:40, y:70}
      ],
      notes:["באפק: נצחון ישראל ונבואה על חייו של בן־הדד; ברמות גלעד: חץ ״לתומו״"],
      book_page:213
    },
    {
      id:"misha_moav",
      number:5, unit:4,
      title:"מסע מישע מלך מואב",
      era_label:"יהורם בן אחאב, יהושפט ומלך אדום",
      caption:"יהורם, יהושפט ומלך אדום יוצאים דרך מדבר אדום נגד מואב. אלישע מורה לכרות בורות; ניצחון מוגבל.",
      pins:[
        {n:1, place:"שומרון", placeId:"shomron", x:42, y:42},
        {n:2, place:"ירושלים", placeId:"yerushalayim", x:40, y:70},
        {n:3, place:"קיר חרשת", placeId:"kir_hareshet", x:64, y:85},
        {n:4, place:"דיבון", placeId:"divon", x:62, y:78},
        {n:5, place:"מדבר אדום", placeId:"edom", x:52, y:95}
      ],
      notes:["״אבן מישע״ הארכיאולוגית — העדות החוץ־מקראית"],
      book_page:213
    },
    {
      id:"yehu_yizrael",
      number:6, unit:4,
      title:"מרד יהוא — יזרעאל ושומרון",
      era_label:"יהוא בן נמשי מחסל את בית אחאב",
      caption:"אלישע שולח נער למשוח את יהוא ברמות גלעד. יהוא עולה ליזרעאל, הורג את יורם ואיזבל; לאחר מכן משמיד את עובדי הבעל בשומרון.",
      pins:[
        {n:1, place:"רמות גלעד", placeId:"ramot_gilad", x:72, y:45},
        {n:2, place:"יזרעאל", placeId:"yizrael", x:47, y:35},
        {n:3, place:"שומרון", placeId:"shomron", x:42, y:42},
        {n:4, place:"בית עקד הרעים", placeId:"beit_eked", x:45, y:44},
        {n:5, place:"מגידו", placeId:"megido", x:42, y:38}
      ],
      notes:["אחזיה מלך יהודה נמלט דרך גור־אבלעם ומת במגידו"],
      book_page:213
    },
    {
      id:"yehoash_chazael",
      number:7, unit:4,
      title:"חזאל ארם מאיים על יהודה — גת",
      era_label:"יהואש מלך יהודה, חזאל מלך ארם",
      caption:"חזאל עולה מארם, כובש את גת, ופונה לירושלים. יהואש מסיר אוצרות בית ה׳ ובית המלך ושולחם אליו כדי לסור.",
      pins:[
        {n:1, place:"דמשק (ארם)", placeId:"damesek", x:76, y:18},
        {n:2, place:"גת", placeId:"gat", x:25, y:75},
        {n:3, place:"ירושלים", placeId:"yerushalayim", x:40, y:70},
        {n:4, place:"לוד", placeId:"lod", x:28, y:65}
      ],
      notes:["יהואש נרצח ע״י עבדיו לאחר הכניעה לחזאל"],
      book_page:213
    },
    {
      id:"yerovam_sheni_gvulot",
      number:8, unit:5,
      title:"שיבת גבולות ירבעם השני",
      era_label:"ירבעם בן יואש מלך ישראל",
      caption:"״הוא השיב את גבול ישראל מלבוא חמת עד ים הערבה״ — שיא גאוגרפי של ישראל, אך שפל דתי.",
      pins:[
        {n:1, place:"שומרון", placeId:"shomron", x:42, y:42},
        {n:2, place:"לבוא חמת", placeId:"levoa_chamat", x:72, y:6},
        {n:3, place:"ים הערבה (ים המלח)", placeId:"yam_haarava", x:52, y:80},
        {n:4, place:"דמשק", placeId:"damesek", x:76, y:18},
        {n:5, place:"נינווה", placeId:"ninveh", x:92, y:6}
      ],
      notes:["״וירא ה׳ את עני ישראל... ויושיעם ביד ירבעם״"],
      book_page:213
    },
    {
      id:"tiglat_pileser",
      number:9, unit:5,
      title:"גלויות תגלת פלאסר — 733-732 לפנה״ס",
      era_label:"פקח מלך ישראל, אחז מלך יהודה",
      caption:"תגלת פלאסר כובש את הגליל ועבר הירדן ומגלה את השבטים. אחז שכר אותו בכסף אוצרות בית ה׳.",
      pins:[
        {n:1, place:"דן", placeId:"dan", x:55, y:12},
        {n:2, place:"אבל בית מעכה", placeId:"avel_beit_maacha", x:56, y:14},
        {n:3, place:"חצור", placeId:"chatzor", x:52, y:26},
        {n:4, place:"קדש", placeId:"kadesh", x:54, y:22},
        {n:5, place:"גלעד", placeId:"gilad", x:72, y:48},
        {n:6, place:"גליל", placeId:"galil", x:48, y:30},
        {n:7, place:"אשור (נינווה)", placeId:"ninveh", x:92, y:6}
      ],
      notes:["גלות ראשונה — השבטים בצפון ובעבר הירדן"],
      book_page:213
    },
    {
      id:"nefilat_shomron",
      number:10, unit:5,
      title:"נפילת שומרון — 722 לפנה״ס",
      era_label:"הושע בן אלה, שלמנאסר וסרגון",
      caption:"שלמנאסר עולה לאחר שהושע כרת ברית עם סוא מצרים. מצור על שומרון 3 שנים; סרגון מגלה את יתר העם לחלח וחבור.",
      pins:[
        {n:1, place:"שומרון", placeId:"shomron", x:42, y:42},
        {n:2, place:"חלח", placeId:"chalach", x:88, y:8},
        {n:3, place:"חבור נהר גוזן", placeId:"chabor_gozan", x:85, y:10},
        {n:4, place:"ערי מדי", placeId:"madai", x:95, y:18},
        {n:5, place:"מצרים (סוא)", placeId:"mitzrayim", x:8, y:94},
        {n:6, place:"נינווה (אשור)", placeId:"ninveh", x:92, y:6}
      ],
      notes:["סוף ממלכת ישראל; מיקום הגלות לחלח וחבור"],
      book_page:214
    },
    {
      id:"galut_yehoyachin",
      number:13, unit:6,
      title:"גלות יהויכין — 597 לפנה״ס",
      era_label:"יהויכין מלך יהודה, נבוכדנאצר מלך בבל",
      caption:"הגלות הראשונה לבבל: עשרת אלפים שרים, החרש והמסגר; ״לא נשאר זולת דלת עם הארץ״.",
      pins:[
        {n:1, place:"ירושלים", placeId:"yerushalayim", x:40, y:70},
        {n:2, place:"בבל", placeId:"bavel", x:92, y:22},
        {n:3, place:"ריבלה", placeId:"rivla", x:72, y:10},
        {n:4, place:"נהר פרת", placeId:"prat", x:88, y:20}
      ],
      notes:["יחזקאל ודניאל גלו בגלות זו"],
      book_page:214
    },
    {
      id:"churban_yerushalayim",
      number:14, unit:6,
      title:"חורבן ירושלים — 586 לפנה״ס",
      era_label:"צדקיהו מלך יהודה, נבוזראדן רב טבחים",
      caption:"מרד צדקיהו; מצור שנתיים וחצי. נבוזראדן שורף את המקדש ובית המלך; צדקיהו נתפס במדבר יריחו.",
      pins:[
        {n:1, place:"ירושלים", placeId:"yerushalayim", x:40, y:70},
        {n:2, place:"ערבות יריחו", placeId:"arvot_yericho", x:55, y:72},
        {n:3, place:"ריבלה", placeId:"rivla", x:72, y:10},
        {n:4, place:"בבל", placeId:"bavel", x:92, y:22},
        {n:5, place:"מצפה (גדליה)", placeId:"mitzpe", x:40, y:62},
        {n:6, place:"מצרים (פליטי יהודה)", placeId:"mitzrayim", x:8, y:94}
      ],
      notes:["גדליה בן אחיקם נרצח במצפה; הפליטה גולה למצרים"],
      book_page:214
    },
    {
      id:"arei_miklat",
      number:15, unit:1,
      title:"שש ערי המקלט",
      era_label:"נחלות השבטים — במדבר ל״ה, יהושע כ׳",
      caption:"שלוש בעבר הירדן המזרחי ושלוש בארץ כנען, מפוזרות לצפון/מרכז/דרום — ״נכון הדרך״.",
      pins:[
        {n:1, place:"קדש (גליל)", placeId:"kadesh", x:54, y:22},
        {n:2, place:"שכם (אפרים)", placeId:"shchem", x:44, y:48},
        {n:3, place:"חברון (יהודה)", placeId:"chevron", x:38, y:80},
        {n:4, place:"בצר (ראובן)", placeId:"betzer", x:68, y:74},
        {n:5, place:"רמות גלעד (גד)", placeId:"ramot_gilad", x:72, y:45},
        {n:6, place:"גולן (מנשה)", placeId:"golan", x:62, y:30}
      ],
      notes:["מפה רקע להבנת גיאוגרפיית הארץ"],
      book_page:213
    },
    {
      id:"shvatim_12",
      number:16, unit:1,
      title:"נחלות שנים עשר השבטים",
      era_label:"רקע — יהושע י״ג-י״ט",
      caption:"רקע גאוגרפי לספר מלכים: תפרוסת השבטים שממנה פורשת ממלכת ישראל (10 שבטים) וממנה נשארת יהודה.",
      pins:[
        {n:1, place:"דן (צפון)", placeId:"dan", x:55, y:12},
        {n:2, place:"נפתלי", placeId:"naftali", x:52, y:22},
        {n:3, place:"אשר", placeId:"asher", x:38, y:24},
        {n:4, place:"זבולון", placeId:"zvulun", x:45, y:30},
        {n:5, place:"יששכר", placeId:"yissachar", x:50, y:36},
        {n:6, place:"מנשה", placeId:"menashe", x:46, y:44},
        {n:7, place:"אפרים", placeId:"efraim", x:44, y:52},
        {n:8, place:"בנימין", placeId:"binyamin", x:42, y:64},
        {n:9, place:"יהודה", placeId:"yehuda", x:38, y:78},
        {n:10, place:"שמעון", placeId:"shimon", x:28, y:88},
        {n:11, place:"ראובן-גד-חצי מנשה (עבר הירדן)", placeId:"ever_hayarden", x:72, y:55}
      ],
      notes:["10 שבטים לישראל; יהודה ובנימין לממלכת יהודה; לוי מפוזר"],
      book_page:213
    },
    {
      id:"masai_eliyahu",
      number:17, unit:3,
      title:"מסעי אליהו הנביא",
      era_label:"אליהו התשבי, ימי אחאב",
      caption:"נחל כרית → צרפת (אלמנה) → הר הכרמל (נביאי הבעל) → חורב (״קול דממה דקה״) → עליה בסערה מן הירדן.",
      pins:[
        {n:1, place:"גלעד (תשבי)", placeId:"tishbi", x:70, y:50},
        {n:2, place:"נחל כרית", placeId:"kerit", x:68, y:55},
        {n:3, place:"צרפת (צידון)", placeId:"tzarfat", x:36, y:18},
        {n:4, place:"הר הכרמל", placeId:"karmel", x:38, y:36},
        {n:5, place:"יזרעאל", placeId:"yizrael", x:47, y:35},
        {n:6, place:"באר שבע", placeId:"beer_sheva", x:32, y:87},
        {n:7, place:"הר חורב", placeId:"chorev", x:46, y:100},
        {n:8, place:"ירדן (עליה לשמים)", placeId:"yarden", x:65, y:58}
      ],
      notes:["אליהו מחולל נסים בגבולות הממלכה ומחוצה לה"],
      book_page:213
    },
    {
      id:"masai_elisha",
      number:18, unit:4,
      title:"מסעי אלישע",
      era_label:"אלישע בן שפט, ימי יהורם ויהוא",
      caption:"זירות הנסים: ירדן (מים מרים), יריחו, דותן (סנוורים לארמים), שונם (בן השונמית), שומרון (מצור ורווחה), דמשק (חזאל).",
      pins:[
        {n:1, place:"ירדן / יריחו", placeId:"yericho", x:55, y:72},
        {n:2, place:"אבל מחולה", placeId:"avel_mechola", x:60, y:52},
        {n:3, place:"גלגל", placeId:"gilgal", x:52, y:68},
        {n:4, place:"דותן", placeId:"dotan", x:42, y:46},
        {n:5, place:"שונם", placeId:"shunem", x:48, y:37},
        {n:6, place:"הר הכרמל", placeId:"karmel", x:38, y:36},
        {n:7, place:"שומרון", placeId:"shomron", x:42, y:42},
        {n:8, place:"דמשק", placeId:"damesek", x:76, y:18}
      ],
      notes:["אלישע נע בין ישראל לארם; פעילותו מחוץ לחצר המלך"],
      book_page:214
    },
    {
      id:"medinot_saviv",
      number:19, unit:5,
      title:"המדינות סביב — מצרים, אשור, בבל, ארם ועמי הארץ",
      era_label:"מעצמות וממלכות סביב ישראל ויהודה",
      caption:"מעצמות גדולות בצפון ובדרום; ממלכות קטנות בגבול (ארם, פלשת, מואב, עמון, אדום) — סיבה מתמדת לעימותים.",
      pins:[
        {n:1, place:"מצרים", placeId:"mitzrayim", x:8, y:94},
        {n:2, place:"אשור (נינווה)", placeId:"ninveh", x:92, y:6},
        {n:3, place:"בבל", placeId:"bavel", x:92, y:22},
        {n:4, place:"ארם (דמשק)", placeId:"damesek", x:76, y:18},
        {n:5, place:"פלשת (עזה)", placeId:"plishtim", x:18, y:82},
        {n:6, place:"מואב", placeId:"moav", x:62, y:78},
        {n:7, place:"עמון (רבת)", placeId:"amon", x:72, y:62},
        {n:8, place:"אדום (בצרה)", placeId:"edom", x:52, y:95},
        {n:9, place:"צור/צידון", placeId:"tzor", x:38, y:22}
      ],
      notes:["רקע דיפלומטי וצבאי לכל מסעות המלחמה בספר"],
      book_page:214
    }
  ];

  function normalizeMap(m, idx){
    const required_places = m.required_places || (m.pins || []).map(p => ({
      id: p.placeId || p.place,
      name: p.place || p.name || '',
      description: p.description || '',
      required_for_exam: true
    })) || (m.locs || []).map(l => ({
      name: l.n || l.name || '',
      description: l.d || l.description || '',
      required_for_exam: (l.required_for_exam !== false)
    }));
    return {
      id: m.id || ('map-' + idx),
      number: m.number || m.map_number || (idx + 1),
      unit: m.unit || 1,
      title: m.title || m.name || 'מפה',
      subtitle: m.subtitle || m.content_description || '',
      era_label: m.era_label || m.era || '',
      caption: m.caption || '',
      pins: Array.isArray(m.pins) ? m.pins : null,
      required_places,
      notes: [].concat(m.notes || m.bagrut_notes || []).filter(Boolean),
      book_page: m.book_page || m.page || null,
      required_for_exam: m.required_for_exam !== false
    };
  }

  function pickMapsData(){
    if (Array.isArray(MAPS_19) && MAPS_19.length > 0){
      return MAPS_19.map(normalizeMap);
    }
    if (typeof window.BAGRUT_MAPS_19 !== 'undefined' && Array.isArray(window.BAGRUT_MAPS_19) && window.BAGRUT_MAPS_19.length > 0){
      return window.BAGRUT_MAPS_19.map(normalizeMap);
    }
    const idx = (typeof window!=='undefined' && window.__ENTITY_INDEX__) || {};
    if (idx.map && Object.keys(idx.map).length > 0){
      return Object.values(idx.map).map(normalizeMap);
    }
    const legacy = (typeof BAGRUT_MAPS !== 'undefined' && Array.isArray(BAGRUT_MAPS)) ? BAGRUT_MAPS : [];
    return legacy.map(normalizeMap);
  }

  function goToPlace(placeIdOrName){
    const setRoute = window.__setRoute;
    if (setRoute && placeIdOrName){ setRoute({page:'place', id:placeIdOrName}); return; }
    try{ window.dispatchEvent(new CustomEvent('navigate-study', {detail:{tab:'place', focusId:placeIdOrName}})); }catch(e){}
    try{ window.location.hash = '#study-place-' + encodeURIComponent(placeIdOrName || ''); }catch(e){}
  }

  // Pseudo-random fallback positions (only used when a map has no explicit pins)
  function hashString(s){
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) & 0xffffffff;
    return Math.abs(h);
  }
  function pinPos(name, i){
    const h1 = hashString(name + ':x:' + i);
    const h2 = hashString(name + ':y:' + i);
    return { x: 10 + (h1 % 80), y: 15 + (h2 % 70) };
  }

  function MapFullView({map, onBack}){
    const color = UNIT_COLOR[map.unit] || "#D4A574";
    const hasPins = Array.isArray(map.pins) && map.pins.length > 0;
    return (
      <div className="mp-full">
        <div className="mp-full-head" style={{background:color}}>
          <button onClick={onBack} className="mp-back">→ חזור</button>
          <div className="mp-full-title-wrap">
            <div className="mp-full-num">מפה {map.number}</div>
            <h2 className="font-display mp-full-title">{map.title}</h2>
            {map.era_label && <div className="mp-full-era" style={{fontSize:12,opacity:.9,marginTop:2}}>{map.era_label}</div>}
            {(map.caption || map.subtitle) && <p className="mp-full-sub">{map.caption || map.subtitle}</p>}
          </div>
        </div>
        <div className="mp-canvas-wrap">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mp-canvas">
            <defs>
              <linearGradient id={'mpGrad-' + map.id} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
                <stop offset="100%" stopColor={color} stopOpacity="0.08"/>
              </linearGradient>
              <pattern id={'mpGrid-' + map.id} width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke={color} strokeOpacity="0.18" strokeWidth="0.3"/>
              </pattern>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill={'url(#mpGrad-' + map.id + ')'}/>
            <rect x="0" y="0" width="100" height="100" fill={'url(#mpGrid-' + map.id + ')'}/>
            {/* Mediterranean coastline (west) */}
            <path d="M 20 0 Q 30 30 22 60 T 35 100"
                  stroke={color} strokeOpacity="0.55" strokeWidth="0.6" fill="none" strokeDasharray="1.2 1.2"/>
            {/* Jordan river (east of center) */}
            <path d="M 72 8 Q 70 35 75 60 T 78 95"
                  stroke={color} strokeOpacity="0.55" strokeWidth="0.6" fill="none" strokeDasharray="1.2 1.2"/>
            <text x="6" y="96" fontSize="3" fill={color} fillOpacity="0.7">ים התיכון</text>
            <text x="80" y="50" fontSize="3" fill={color} fillOpacity="0.7">ירדן</text>
          </svg>
          {hasPins ? map.pins.map((pin, i) => (
            <button key={i}
              className="mp-pin mp-pin-numbered"
              style={{left: pin.x + '%', top: pin.y + '%', borderColor: color}}
              onClick={()=>goToPlace(pin.placeId || pin.place)}
              title={pin.place}
            >
              <span className="mp-pin-dot" style={{background: color, color:'#fff', fontWeight:900, fontSize:11, width:22, height:22, display:'inline-flex', alignItems:'center', justifyContent:'center', borderRadius:'50%'}}>{pin.n}</span>
              <span className="mp-pin-label">{pin.place}</span>
            </button>
          )) : map.required_places.map((p, i) => {
            const pos = pinPos(p.name || p.id || ('p' + i), i);
            return (
              <button key={i}
                className="mp-pin"
                style={{left: pos.x + '%', top: pos.y + '%', borderColor: color}}
                onClick={()=>goToPlace(p.id || p.name)}
                title={p.description || p.name}
              >
                <span className="mp-pin-dot" style={{background: color}}/>
                <span className="mp-pin-label">📍 {p.name}</span>
              </button>
            );
          })}
        </div>
        <div className="mp-full-list">
          <h3 className="mp-full-list-h">{hasPins ? 'מקרא המפה' : 'מקומות לבגרות'}</h3>
          <div className="mp-full-list-grid">
            {hasPins ? map.pins.map((pin, i) => (
              <button key={i} onClick={()=>goToPlace(pin.placeId || pin.place)}
                className="mp-place-pill" style={{borderColor: color, display:'flex', alignItems:'center', gap:8}}>
                <span style={{background:color, color:'#fff', fontWeight:900, width:24, height:24, display:'inline-flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', flexShrink:0}}>{pin.n}</span>
                <span className="mp-place-name">{pin.place}</span>
              </button>
            )) : map.required_places.map((p, i) => (
              <button key={i} onClick={()=>goToPlace(p.id || p.name)}
                className="mp-place-pill" style={{borderColor: color}}>
                <span className="mp-place-name">📍 {p.name}</span>
                {p.description && <span className="mp-place-desc">{p.description}</span>}
              </button>
            ))}
          </div>
          {map.notes.length > 0 && (
            <div className="mp-notes">
              {map.notes.map((n, i) => (
                <div key={i} className="mp-note-callout">💡 {n}</div>
              ))}
            </div>
          )}
          {map.book_page && (
            <div className="mp-book-ref">📖 עיון בספר — עמוד {map.book_page}</div>
          )}
        </div>
      </div>
    );
  }

  function MapCard({map, onOpen}){
    const color = UNIT_COLOR[map.unit] || "#D4A574";
    const hasPins = Array.isArray(map.pins) && map.pins.length > 0;
    const chips = hasPins ? map.pins.map(p=>p.place) : map.required_places.map(p=>p.name);
    return (
      <button onClick={onOpen} className="mp-card" style={{borderColor: color}}>
        <div className="mp-card-band" style={{background: color}}>
          <span className="mp-card-num">{map.number}</span>
          <span className="mp-card-unit">יחידה {map.unit}</span>
        </div>
        <div className="mp-card-body">
          <h3 className="font-display mp-card-title">{map.title}</h3>
          {map.era_label && <div style={{fontSize:11,opacity:.7,marginTop:2}}>{map.era_label}</div>}
          {(map.caption || map.subtitle) && <p className="mp-card-sub">{map.caption || map.subtitle}</p>}
          <div className="mp-card-places">
            {chips.slice(0, 6).map((name, i) =>
              <span key={i} className="mp-place-chip">📍 {name}</span>
            )}
            {chips.length > 6 &&
              <span className="mp-place-chip mp-place-more">+{chips.length - 6}</span>
            }
          </div>
          {map.notes.length > 0 && (
            <div className="mp-card-note">💡 {map.notes[0]}</div>
          )}
          {map.book_page && (
            <div className="mp-card-page">עמוד {map.book_page}</div>
          )}
        </div>
      </button>
    );
  }

  function MapsPage(){
    const [ready, setReady] = useState(!!window.__ENTITY_INDEX_READY__);
    useEffect(()=>{
      if (ready) return;
      const onReady = ()=>setReady(true);
      window.addEventListener('entity-index-ready', onReady);
      const id = setInterval(()=>{ if (window.__ENTITY_INDEX_READY__) setReady(true); }, 250);
      const bail = setTimeout(()=>setReady(true), 2500);
      return ()=>{
        window.removeEventListener('entity-index-ready', onReady);
        clearInterval(id); clearTimeout(bail);
      };
    }, [ready]);

    const [unitFilter, setUnitFilter] = useState(0);
    const [examOnly, setExamOnly]     = useState(false);
    const [openMap, setOpenMap]       = useState(null);

    const maps = useMemo(() => pickMapsData(), [ready]);

    const filtered = useMemo(() => {
      let list = maps;
      if (unitFilter) list = list.filter(m => m.unit === unitFilter);
      if (examOnly) list = list.filter(m => m.required_places.some(p => p.required_for_exam));
      return list;
    }, [maps, unitFilter, examOnly]);

    const byUnit = useMemo(() => {
      const g = {};
      filtered.forEach(m => { (g[m.unit] = g[m.unit] || []).push(m); });
      return g;
    }, [filtered]);

    if (openMap){
      return <MapFullView map={openMap} onBack={()=>setOpenMap(null)}/>;
    }

    return (
      <div className="mp-wrap">
        <div className="mp-header">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-amber-300">🗺️ 19 מפות הבגרות</h1>
          <p className="text-amber-100/70 text-sm mt-1">
            המפות שבבגרות (לפי הספר עמ׳ 213-214). לחץ על מפה לתצוגה מלאה עם סיכות ממוספרות.
          </p>
          <div className="parchment rounded-2xl p-4 mp-tip">
            <p className="text-amber-900 text-sm">
              💡 <strong>טיפ לבגרות:</strong> בבחינה לוקחים תנ״ך שלם ללא פירושים. סמן את המקומות במפות שבסוף התנ״ך.
            </p>
          </div>
        </div>

        <div className="mp-filters">
          <div className="mp-filters-row">
            <button onClick={()=>setUnitFilter(0)}
              className={'mp-filter-chip ' + (unitFilter===0?'active':'')}>הכל</button>
            {[1,2,3,4,5,6].map(u => (
              <button key={u} onClick={()=>setUnitFilter(u)}
                className={'mp-filter-chip ' + (unitFilter===u?'active':'')}
                style={unitFilter===u ? {background: UNIT_COLOR[u], color:'#fff'} : null}>
                יחידה {u}
              </button>
            ))}
          </div>
          <label className="mp-toggle">
            <input type="checkbox" checked={examOnly} onChange={e=>setExamOnly(e.target.checked)}/>
            <span>מפות חובה לבגרות בלבד</span>
          </label>
        </div>

        {filtered.length === 0 ? (
          <div className="mp-empty">
            <div style={{fontSize:48, marginBottom:8}}>🗺️</div>
            <div>לא נמצאו מפות בסינון זה.</div>
          </div>
        ) : Object.keys(byUnit).sort((a,b)=>+a-+b).map(unitId => (
          <section key={unitId} className="mp-section">
            <h2 className="mp-section-h" style={{color: UNIT_COLOR[unitId]}}>
              <span className="mp-section-bar" style={{background: UNIT_COLOR[unitId]}}/>
              {UNIT_TITLE[unitId]}
              <span className="mp-section-count">{byUnit[unitId].length} מפות</span>
            </h2>
            <div className="mp-grid">
              {byUnit[unitId].map(m =>
                <MapCard key={m.id} map={m} onOpen={()=>setOpenMap(m)}/>
              )}
            </div>
          </section>
        ))}

        <div className="mp-total">
          סה״כ {maps.length} מפות · מציג {filtered.length}
        </div>
      </div>
    );
  }

  window.MapsPageComponent = MapsPage;
})();
