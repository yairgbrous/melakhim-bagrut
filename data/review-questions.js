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
    // === יחידה א — מלכות שלמה ===
    {
      id:"rq-u1-001", unit:1, type:"mi_amar_lemi", difficulty:"קל",
      prompt_niqqud:"״יְחִי הַמֶּלֶךְ שְׁלֹמֹה״ — מִי אָמַר אֶת הַדְּבָרִים וְלְמִי?",
      answer_points:[
        "בניהו בן יהוידע ענה לדוד המלך",
        "התרחש בטקס המלכת שלמה בגיחון",
        "בתשובה לציווי דוד על המלכת שלמה בעקבות ניסיון ההמלכה של אדוניהו"
      ],
      related_entities:["char:bnayahu","char:david","char:shlomo","event:hamlachat_shlomo","place:gichon"]
    },
    {
      id:"rq-u1-002", unit:1, type:"short_answer", difficulty:"קל",
      prompt_niqqud:"מָה בִּקֵּשׁ שְׁלֹמֹה מֵה׳ בַּהִתְגַּלּוּת בְּגִבְעוֹן?",
      answer_points:[
        "״לב שומע לשפוט את עמך״",
        "יכולת להבחין בין טוב לרע",
        "לא ביקש עושר, כבוד או אריכות ימים",
        "ה׳ העניק לו את המבוקש וגם עושר וכבוד"
      ],
      related_entities:["char:shlomo","event:hitgalut_givon","place:givon"]
    },
    {
      id:"rq-u1-003", unit:1, type:"be_eize_hekhsher", difficulty:"בינוני",
      prompt_niqqud:"״וְנָתַתָּ לְעַבְדְּךָ לֵב שֹׁמֵעַ״ — בְּאֵיזֶה הֶקְשֵׁר נֶאֶמְרוּ הַדְּבָרִים?",
      answer_points:[
        "שלמה מבקש זאת בהתגלות ה׳ בגבעון",
        "לאחר שעלה למלוכה, בא לזבוח באחד הבמות הגדולות",
        "ה׳ נראה אליו בחלום וענה לבקשתו בברכה",
        "הוספה: עושר, כבוד, ואריכות ימים אם ילך בדרכי אביו דוד"
      ],
      related_entities:["char:shlomo","event:hitgalut_givon","place:givon"]
    },
    {
      id:"rq-u1-004", unit:1, type:"short_answer", difficulty:"קל",
      prompt_niqqud:"הַסְבֵּר אֶת הַמִּשְׁפָּט שֶׁל שְׁלֹמֹה — שְׁתֵּי הַנָּשִׁים וְהַתִּינוֹק.",
      answer_points:[
        "שתי נשים טענו לאמהות על תינוק חי",
        "שלמה ציווה לגזור את הילד לשניים",
        "האמא האמיתית ויתרה כדי להציל את חייו",
        "הראה את חכמתו של שלמה כשופט — הוכחת חכמה מעשית"
      ],
      related_entities:["char:shlomo","event:mishpat_shlomo"]
    },
    {
      id:"rq-u1-005", unit:1, type:"character_details", difficulty:"בינוני",
      prompt_niqqud:"מִי הָיָה חִירָם מֶלֶךְ צוֹר וּמָה תָּרָם לִבְנִיַּת הַמִּקְדָּשׁ?",
      answer_points:[
        "מלך צור, בעל ברית אוהב של דוד ושלמה",
        "סיפק ארזים וברושים מלבנון לבניית המקדש",
        "שלח חרשים — במיוחד חירם בן־אישה אלמנה — לעבודות הברונזה",
        "שלמה שילם לו חיטה ושמן מדי שנה"
      ],
      related_entities:["char:chiram","char:shlomo","event:breetl_chiram","place:tzor"]
    },
    {
      id:"rq-u1-006", unit:1, type:"place_events", difficulty:"בינוני",
      prompt_niqqud:"מָה הִתְרַחֵשׁ בַּמִּקְדָּשׁ בִּטֶקֶס הַחֲנוּכָּה?",
      answer_points:[
        "הארון הוכנס לקודש הקודשים",
        "ענן מילא את הבית עד שלא יכלו הכהנים לעמוד לשרת",
        "שלמה נשא תפילה ארוכה מעל במת הנחושת",
        "זיבח 22,000 בקר ו־120,000 צאן — חנוכה רבתי"
      ],
      related_entities:["place:mikdash","char:shlomo","event:chanukat_hamikdash"]
    },
    {
      id:"rq-u1-007", unit:1, type:"mi_amar_lemi", difficulty:"בינוני",
      prompt_niqqud:"״קָרֹעַ אֶקְרַע אֶת הַמַּמְלָכָה מֵעָלֶיךָ״ — מִי אָמַר לְמִי?",
      answer_points:[
        "ה׳ אומר לשלמה (בנבואה, לאחר חטאי הנשים)",
        "העונש: פילוג הממלכה ביד בנו",
        "בכל זאת יוותר שבט אחד למען דוד אביו",
        "מקום: לא פירטו — אך בתקופת סוף ימי שלמה"
      ],
      related_entities:["char:shlomo","event:gzirat_pilug"]
    },
    {
      id:"rq-u1-008", unit:1, type:"short_answer", difficulty:"בינוני",
      prompt_niqqud:"מָה הָיוּ שְׁלוֹשֶׁת הַחֲטָאִים שֶׁבְּגִינָם נִגְזְרָה גְּזֵרַת פִּלּוּג הַמַּמְלָכָה עַל שְׁלֹמֹה?",
      answer_points:[
        "ריבוי נשים נוכריות שהטו את לבבו אחר אלוהים אחרים",
        "בניית במות לכמוש אלהי מואב ולמלכום אלהי בני עמון",
        "עצמו עבד לעשתורת אלהי צידונים",
        "כל זה בניגוד לציווי התורה (דברים י״ז) על המלך"
      ],
      related_entities:["char:shlomo","event:cheta_shlomo"]
    },
    {
      id:"rq-u1-009", unit:1, type:"character_details", difficulty:"בינוני",
      prompt_niqqud:"מִי הָיְתָה מַלְכַּת שְׁבָא וּמָה הָיָה תַּפְקִידָהּ בַּסִּפּוּר?",
      answer_points:[
        "מלכת שבא (ממלכה דרומית, כנראה בדרום ערב)",
        "שמעה על חכמת שלמה ובאה לנסותו בחידות",
        "הביאה עמה אוצרות — זהב, בשמים, אבנים יקרות",
        "התרשמה עמוקות: ״לא היה בה עוד רוח״"
      ],
      related_entities:["char:malkat_sheva","char:shlomo","event:malkat_sheva_visit"]
    },
    {
      id:"rq-u1-010", unit:1, type:"be_eize_hekhsher", difficulty:"קשה",
      prompt_niqqud:"״אֶרֶץ כָּבוּל״ — בְּאֵיזֶה הֶקְשֵׁר?",
      answer_points:[
        "שלמה נותן לחירם 20 ערים בגליל תמורת ארזים, זהב וחומרי בניה",
        "חירם מגיע לראותן ואיננו מרוצה",
        "קורא להן ״ארץ כבול״ (כלומר ארץ לא־טובה)",
        "מדגיש עומק המורכבות בקשרי חוץ של שלמה"
      ],
      related_entities:["char:chiram","char:shlomo","place:eretz_kavul","place:galil"]
    },
    {
      id:"rq-u1-011", unit:1, type:"al_mi_neemar", difficulty:"קל",
      prompt_niqqud:"עַל מִי נֶאֱמַר: ״וַתֵּרַע בְּעֵינֵי ה׳ הַמַּעֲלָלִים אֲשֶׁר עָשָׂה שְׁלֹמֹה״?",
      answer_points:[
        "נאמר על שלמה עצמו, בסוף ימיו",
        "רמז על חטאיו: נשים נוכריות, עבודה זרה, במות",
        "לשון ״מעללים״ חריגה כלפי מלך דוגמה כשלמה",
        "המעבר הראשוני של הספר מהערכה חיובית להערכה ביקורתית"
      ],
      related_entities:["char:shlomo","event:cheta_shlomo"]
    },
    {
      id:"rq-u1-012", unit:1, type:"character_details", difficulty:"בינוני",
      prompt_niqqud:"מִי הָיָה יָרָבְעָם בֶּן נְבָט בִּימֵי שְׁלֹמֹה?",
      answer_points:[
        "עבד של שלמה ממשפחת אפרים",
        "מונה על סבל בית יוסף (מפעלי עבודות כפייה)",
        "אחיה השילוני מנבא לו על המלכה על 10 שבטים",
        "בורח למצרים אל שישק לאחר שנודע לשלמה"
      ],
      related_entities:["char:yarovam","char:shlomo","char:achiya_hashiloni","char:shishak"]
    },
    {
      id:"rq-u1-013", unit:1, type:"mi_amar_lemi", difficulty:"בינוני",
      prompt_niqqud:"״הִנֵּה אֲנִי קֹרֵעַ אֶת הַמַּמְלָכָה מִיַּד שְׁלֹמֹה וְנָתַתִּי לְךָ אֵת עֲשָׂרָה הַשְּׁבָטִים״ — מִי לְמִי?",
      answer_points:[
        "אחיה השילוני אומר לירבעם בן נבט",
        "פגש אותו בדרך כשהיה לבוש שלמה חדשה",
        "קרע את השלמה ל־12 קרעים, נתן לירבעם 10",
        "הבטחה מותנית — אם ישמור מצוות ה׳ ילך בדרך דוד"
      ],
      related_entities:["char:achiya_hashiloni","char:yarovam","event:aseret_kraim"]
    },
    {
      id:"rq-u1-014", unit:1, type:"short_answer", difficulty:"בינוני",
      prompt_niqqud:"הַסְבֵּר אֶת תַּפְקִיד בְּנָיָהוּ בֶּן יְהוֹיָדָע בִּתְקוּפַת שְׁלֹמֹה.",
      answer_points:[
        "שר הצבא של שלמה לאחר מות דוד",
        "החליף את יואב לאחר הריגתו במצוות דוד",
        "הרג את יואב בקרן המזבח — מילא שליחות קשה",
        "השתתף בטקס המלכת שלמה בגיחון"
      ],
      related_entities:["char:bnayahu","char:shlomo","char:yoav","event:hamlachat_shlomo"]
    },
    {
      id:"rq-u1-015", unit:1, type:"place_events", difficulty:"בינוני",
      prompt_niqqud:"מָה עוֹלֶה מֵהַהִתְגַּלּוּת הַשְּׁנִיָּה שֶׁל ה׳ לִשְׁלֹמֹה?",
      answer_points:[
        "התרחשה לאחר סיום בניין המקדש והיכל המלך",
        "ה׳ מאשר את התפילה — ״שמעתי את תפילתך״",
        "התנה את שימור המקדש בשמירת חוקי ה׳",
        "אזהרה חמורה: אם יפנה לאלוהים אחרים — ״הבית הזה יהיה עליון, כל עובר עליו ישם״"
      ],
      related_entities:["char:shlomo","event:hitgalut_shniya","place:mikdash"]
    },
    {
      id:"rq-u1-016", unit:1, type:"al_mi_neemar", difficulty:"קל",
      prompt_niqqud:"עַל מִי נֶאֱמַר ״הָיָה חָכָם מִכָּל הָאָדָם... וַיֹּאמֶר שְׁלֹשֶׁת אֲלָפִים מָשָׁל״?",
      answer_points:[
        "על שלמה — חכמתו המיוחדת",
        "3000 משל ושיר אחד ואלף (1005 שירים)",
        "מפרסם בכל הגויים סביב — מלכי מצרים וארץ קדם",
        "הביטוי ״חכם מכל האדם״ — שיא המעלה"
      ],
      related_entities:["char:shlomo","event:chachmat_shlomo"]
    },
    {
      id:"rq-u1-017", unit:1, type:"short_answer", difficulty:"קשה",
      prompt_niqqud:"מָה הַמַּשְׁמָעוּת שֶׁל חֻקַּת הַמֶּלֶךְ מִדְּבָרִים י״ז בַּהֲקֶרָה לִשְׁלֹמֹה?",
      answer_points:[
        "המלך לא ירבה לו סוסים, נשים או כסף וזהב",
        "עליו לקרוא בספר התורה כל ימי חייו",
        "שלמה עבר על כל שלושת האיסורים: נשים נכריות, סוסים ממצרים, עושר רב",
        "הפילוג והחטאים נתפסים בספר כעונש על הפרת חוקת המלך"
      ],
      related_entities:["char:shlomo","event:cheta_shlomo"]
    },
    {
      id:"rq-u1-018", unit:1, type:"character_details", difficulty:"בינוני",
      prompt_niqqud:"מִי הָיָה אֲדוֹנִיָּהוּ וּמָה עָלָה בְּגוֹרָלוֹ?",
      answer_points:[
        "בן דוד מחגית, אחיו הבכור של שלמה",
        "ניסה למלוך במקום אביו (מל״א א)",
        "לאחר המלכת שלמה ביקש את אבישג השונמית לאישה",
        "שלמה הבין זאת כמרד והרגו ביד בניהו בן יהוידע"
      ],
      related_entities:["char:adoniyahu","char:shlomo","char:bnayahu","char:avishag"]
    },
    {
      id:"rq-u1-019", unit:1, type:"be_eize_hekhsher", difficulty:"קשה",
      prompt_niqqud:"״וַיַּרְא ה׳ אֶל שְׁלֹמֹה שֵׁנִית כַּאֲשֶׁר נִרְאָה אֵלָיו בְּגִבְעוֹן״ — בְּאֵיזֶה הֶקְשֵׁר וְאֵיפֹה?",
      answer_points:[
        "לאחר סיום בניין הבית וההיכל — סוף מל״א ט׳",
        "ה׳ נראה לו שנית בירושלים (ולא בגבעון)",
        "אישר את תפילתו בחנוכת המקדש",
        "הזהיר ממפלה ציבורית אם תחליף אלוהים אחרים — ״יהיה הבית הזה לשמה״"
      ],
      related_entities:["char:shlomo","event:hitgalut_shniya","place:mikdash","place:yerushalayim"]
    },
    {
      id:"rq-u1-020", unit:1, type:"short_answer", difficulty:"קשה",
      prompt_niqqud:"מָה הַקֶּשֶׁר בֵּין הַמִּשְׁפָּט שֶׁל שְׁלֹמֹה (שְׁתֵּי הַנָּשִׁים) לְבֵין בַּקָּשָׁתוֹ בְּגִבְעוֹן?",
      answer_points:[
        "שלמה ביקש ״לב שומע״ לשפוט את העם",
        "מיד לאחר ההתגלות מובא סיפור המשפט כדוגמה",
        "המשפט מדגים את החכמה שקיבל — הבחנה בין טוב לרע",
        "העם שומע ״ויראו מפני המלך כי ראו כי חכמת אלהים בקרבו לעשות משפט״"
      ],
      related_entities:["char:shlomo","event:hitgalut_givon","event:mishpat_shlomo"]
    },
    // === יחידה ב — פילוג הממלכה ===
    // questions inserted incrementally (3 at a time)
  ];
  if (typeof window !== 'undefined'){
    window.REVIEW_QUESTIONS = QUESTIONS;
  }
  if (typeof module !== 'undefined' && module.exports){
    module.exports = QUESTIONS;
  }
})();
