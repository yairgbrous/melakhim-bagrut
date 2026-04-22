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
    {
      id:"rq-u2-001", unit:2, type:"short_answer", difficulty:"קל",
      prompt_niqqud:"מָה הָיְתָה בַּקָּשַׁת הָעָם מֵרְחַבְעָם בִּשְׁכֶם וּמָה הָיְתָה תְּשׁוּבָתוֹ?",
      answer_points:[
        "העם ביקש להקל מעול העבודה הכבד ששם אביו שלמה",
        "רחבעם התייעץ עם הזקנים והם יעצו להקל",
        "התייעץ גם עם הילדים שגדלו איתו — יעצו לענות בקשיחות",
        "תשובתו: ״קטני עבה ממתני אבי... אבי ייסר אתכם בשוטים ואני ייסר אתכם בעקרבים״"
      ],
      related_entities:["char:rechavam","event:kinus_shchem","place:shchem"]
    },
    {
      id:"rq-u2-002", unit:2, type:"mi_amar_lemi", difficulty:"בינוני",
      prompt_niqqud:"״מַה לָּנוּ חֵלֶק בְּדָוִד וְלֹא נַחֲלָה בְּבֶן יִשַׁי, לְאֹהָלֶיךָ יִשְׂרָאֵל״ — מִי אָמַר לְמִי?",
      answer_points:[
        "עשרת השבטים, באמצעות ירבעם או מנהיגיהם, אמרו לרחבעם",
        "בשכם, מיד לאחר תשובתו הקשה של רחבעם",
        "ביטוי להפרדה מוחלטת מבית דוד",
        "נקודת הפילוג הסופית בין יהודה לישראל"
      ],
      related_entities:["char:rechavam","char:yarovam","event:pilug","place:shchem"]
    },
    {
      id:"rq-u2-003", unit:2, type:"place_events", difficulty:"קל",
      prompt_niqqud:"מָה עָשָׂה יָרָבְעָם בְּבֵית אֵל וּבְדָן לְאַחַר שֶׁהוּמְלַךְ?",
      answer_points:[
        "הקים עגלי זהב כדי למנוע עלייה של העם לירושלים",
        'אמר: "הנה אלהיך ישראל אשר העלוך מארץ מצרים"',
        "חידש כהונה — כהני במות שאינם מבני לוי",
        "קבע חג בחודש השמיני ״מלבו״ במקום חג הסוכות"
      ],
      related_entities:["char:yarovam","place:beit_el","place:dan","event:eglei_zahav"]
    },
    {
      id:"rq-u2-004", unit:2, type:"be_eize_hekhsher", difficulty:"בינוני",
      prompt_niqqud:"״כִּי הָיְתָה סִבָּה מֵעִם ה׳ לְמַעַן הָקִים אֶת דְּבָרוֹ״ — בְּאֵיזֶה הֶקְשֵׁר?",
      answer_points:[
        "לאחר שרחבעם דחה את בקשת העם בשכם",
        "הכתוב מסביר שזו היתה ״סיבה״ אלוקית",
        "למען קיום דבר ה׳ ביד אחיה השילוני — הקריעה",
        "דוגמה מרכזית לעקרון הסיבתיות הכפולה"
      ],
      related_entities:["char:rechavam","event:pilug","char:achiya_hashiloni"]
    },
    {
      id:"rq-u2-005", unit:2, type:"character_details", difficulty:"בינוני",
      prompt_niqqud:"מִי הָיָה שְׁמַעְיָה אִישׁ הָאֱלֹהִים וּמָה הָיָה תַּפְקִידוֹ?",
      answer_points:[
        "איש אלהים (נביא) בימי רחבעם",
        "ביקש מרחבעם לא להילחם נגד ישראל לאחר הפילוג",
        "אמר: ״לא תעלו ולא תלחמו כי מאתי נהיה הדבר הזה״",
        "רחבעם שמע בקולו — מנע מלחמת אחים מיידית"
      ],
      related_entities:["char:shmaya","char:rechavam","event:pilug"]
    },
    {
      id:"rq-u2-006", unit:2, type:"al_mi_neemar", difficulty:"בינוני",
      prompt_niqqud:"עַל מִי נֶאֱמַר: ״וַיֵּעֶזְבוּ אֶת כָּל מִצְוַת ה׳ אֱלֹהֵיהֶם, וַיַּעֲשׂוּ לָהֶם מַסֵּכָה שְׁנֵי עֲגָלִים״?",
      answer_points:[
        "על ממלכת ישראל — דור אחר דור שהלכו בחטאי ירבעם",
        "מתייחס לשני עגלי הזהב של ירבעם",
        "עם ציון גם של חטאים נוספים: אשרה, עבודת הבעל",
        "הדברים נאמרים במעין סיכום לפני נפילת שומרון (מל״ב י״ז)"
      ],
      related_entities:["char:yarovam","event:eglei_zahav","event:nefilat_shomron"]
    },
    {
      id:"rq-u2-007", unit:2, type:"short_answer", difficulty:"קל",
      prompt_niqqud:"מָה הָיָה מַסַּע שִׁישַׁק מֶלֶךְ מִצְרַיִם וּמָה הַשְׁפָּעָתוֹ?",
      answer_points:[
        "בשנה החמישית למלכות רחבעם",
        "עלה על ירושלים וכבש אותה",
        "לקח את אוצרות בית ה׳ ואת אוצרות בית המלך",
        "לקח את מגני הזהב — רחבעם החליפם במגני נחושת"
      ],
      related_entities:["char:shishak","char:rechavam","event:masa_shishak","place:yerushalayim"]
    },
    {
      id:"rq-u2-008", unit:2, type:"mi_amar_lemi", difficulty:"קשה",
      prompt_niqqud:"״בָּא זֶה הַפּוֹטֵר... הוּא יִתֵּן לְךָ בֵּן״ — מִי אָמַר לְמִי?",
      answer_points:[
        "אחיה השילוני לאשת ירבעם (שבאה מחופשת)",
        "התנבא על מות בנה אביה בעת שובה לביתה",
        "חלק מנבואת הכיליון על בית ירבעם",
        "בגלל חטאי העגלים והבמות"
      ],
      related_entities:["char:achiya_hashiloni","char:yarovam"]
    },
    {
      id:"rq-u2-009", unit:2, type:"character_details", difficulty:"בינוני",
      prompt_niqqud:"מִי הָיָה אָסָא מֶלֶךְ יְהוּדָה וּמָה עָשָׂה בְּרֵאשִׁית מַלְכוּתוֹ?",
      answer_points:[
        "בן אבים, נכד רחבעם",
        "״עשה הישר בעיני ה׳״ — הסיר את הקדשים מן הארץ",
        "גם מעכה אמו (הגבירה) הוריד מלהיות גבירה",
        "שרף את מפלצתה בנחל קדרון"
      ],
      related_entities:["char:asa","char:maacha","event:srefat_mifletzet"]
    },
    {
      id:"rq-u2-010", unit:2, type:"be_eize_hekhsher", difficulty:"בינוני",
      prompt_niqqud:"״וַיִּקַּח אָסָא אֶת כָּל הַכֶּסֶף וְהַזָּהָב הַנּוֹתָרִים בְּאוֹצְרוֹת בֵּית ה׳״ — בְּאֵיזֶה הֶקְשֵׁר?",
      answer_points:[
        "בעשא מלך ישראל בנה את הרמה כדי לסגור את יהודה",
        "אסא שלח את האוצרות לבן־הדד מלך ארם",
        "כדי להפר את בריתו עם בעשא ולתקוף את ישראל",
        "בן־הדד הפציץ ערים בצפון ישראל — בעשא חזר מהרמה"
      ],
      related_entities:["char:asa","char:baasha","char:ben_hadad","place:rama"]
    },
    {
      id:"rq-u2-011", unit:2, type:"place_events", difficulty:"קשה",
      prompt_niqqud:"מָה הָיוּ הָעָרִים שֶׁבָּנָה אָסָא לְאַחַר שֶׁבַּעְשָׁא נֶאֱלַץ לַעֲזֹב אֶת הָרָמָה?",
      answer_points:[
        "גבע בנימין ומצפה",
        "לקח את אבני הרמה שבנה בעשא",
        "חיזק את גבול בנימין מצפון לירושלים",
        "רקע גאוגרפי חשוב: גבול יהודה־ישראל"
      ],
      related_entities:["char:asa","place:geva","place:mitzpe","place:rama"]
    },
    {
      id:"rq-u2-012", unit:2, type:"character_details", difficulty:"בינוני",
      prompt_niqqud:"מִי הָיָה זִמְרִי וּמָה הָיְתָה תְּקוּפַת מַלְכוּתוֹ?",
      answer_points:[
        "שר חצי הרכב של אלה בן בעשא",
        "מרד והרג את אלה בבית ארצא (אחד משריו)",
        "מלך רק 7 ימים בתרצה",
        "כאשר עמרי שר הצבא עלה — התאבד בשריפת ארמון המלך"
      ],
      related_entities:["char:zimri","char:ela","char:omri","place:tirtza"]
    },
    {
      id:"rq-u2-013", unit:2, type:"al_mi_neemar", difficulty:"בינוני",
      prompt_niqqud:"עַל מִי נֶאֱמַר ״וַיַּרְבֶּה עָמְרִי לַעֲשׂוֹת הָרַע בְּעֵינֵי ה׳ מִכֹּל אֲשֶׁר לְפָנָיו״?",
      answer_points:[
        "על עמרי מלך ישראל (אבי אחאב)",
        "יסד שושלת חזקה: עמרי ואחאב",
        "בנה את שומרון, בירת הממלכה",
        "מבחינה מדינית: חזק; מבחינה דתית: נחשב לרשע מאוד"
      ],
      related_entities:["char:omri","event:bnianat_shomron","place:shomron"]
    },
    {
      id:"rq-u2-014", unit:2, type:"short_answer", difficulty:"קל",
      prompt_niqqud:"לָמָּה קָנָה עָמְרִי אֶת הַר שֹׁמְרוֹן?",
      answer_points:[
        "קנה מ״שמר״ בעלי ההר ב־2 כיכר כסף",
        "מיקום אסטרטגי — הר גבוה בלב הממלכה",
        "נקראה על שם שמר — ״שומרון״",
        "הפכה לבירת ישראל עד חורבנה"
      ],
      related_entities:["char:omri","place:shomron","event:bnianat_shomron"]
    },
    {
      id:"rq-u2-015", unit:2, type:"mi_amar_lemi", difficulty:"בינוני",
      prompt_niqqud:"״קָרֹעַ אֶקְרַע אֶת הַמַּמְלָכָה מֵעָלֶיךָ וּנְתַתִּיהָ לְעֶבֶד״ — מִי לְמִי?",
      answer_points:[
        "ה׳ לשלמה (דבר הנבואה)",
        "בנבואת הכיליון לאחר חטאיו",
        "ה״עבד״ הוא ירבעם בן נבט",
        "מקדים את נבואת אחיה השילוני"
      ],
      related_entities:["char:shlomo","char:yarovam","event:gzirat_pilug"]
    },
    {
      id:"rq-u2-016", unit:2, type:"be_eize_hekhsher", difficulty:"קשה",
      prompt_niqqud:"״וַיִּבֶן עָמְרִי אֶת שֹׁמְרוֹן״ — בְּאֵיזֶה הֶקְשֵׁר וּמָה חֲשִׁיבוּת הָאִירוּעַ?",
      answer_points:[
        "לאחר מלחמת שש שנים עם תבני בן גינת על המלוכה",
        "עמרי יוסד שושלת חזקה במיוחד בשושלות ישראל",
        "שומרון הפכה לסמל גאווה וכוח של מלכי ישראל",
        "״אבן מישע״ מזכירה את עמרי — עדות חוץ־מקראית"
      ],
      related_entities:["char:omri","event:bnianat_shomron","place:shomron"]
    },
    {
      id:"rq-u2-017", unit:2, type:"character_details", difficulty:"בינוני",
      prompt_niqqud:"מִי הָיָה יְהוֹשָׁפָט מֶלֶךְ יְהוּדָה וְאֵיךְ מַעֲרִיךְ אוֹתוֹ הַסֵּפֶר?",
      answer_points:[
        "בן אסא; מלך 25 שנה (״עשה הישר בעיני ה׳״)",
        "כרת ברית עם אחאב מלך ישראל — נישואי בנו יהורם לעתליה",
        "הצטרף לאחאב במלחמת רמות גלעד — כמעט נהרג",
        "כישרון מדיני: שלום עם ישראל אך הערכה אמבילנטית על הברית"
      ],
      related_entities:["char:yehoshafat","char:achav","event:milchemet_ramot_gilad"]
    },
    {
      id:"rq-u2-018", unit:2, type:"short_answer", difficulty:"בינוני",
      prompt_niqqud:"מָה הָיְתָה דֶרֶךְ הַעֲרָכָה שֶׁל הַכָּתוּב לְמַלְכֵי יְהוּדָה וְיִשְׂרָאֵל בְּיוֹסֵף הַפִּלּוּג?",
      answer_points:[
        "מלכי יהודה מוערכים לפי ״עשה הישר/הרע בעיני ה׳״",
        "מלכי ישראל כמעט כולם ״עשה הרע״ — הלכו בחטאת ירבעם",
        "ביהודה מעט מלכים צדיקים (אסא, יהושפט)",
        "נקודת המוצא — דוד המלך כמודל אידאלי"
      ],
      related_entities:["event:pilug","char:david"]
    },
    {
      id:"rq-u2-019", unit:2, type:"al_mi_neemar", difficulty:"קל",
      prompt_niqqud:"עַל מִי נֶאֱמַר: ״אֲשֶׁר הֶחֱטִיא אֶת יִשְׂרָאֵל״?",
      answer_points:[
        "על ירבעם בן נבט — ביטוי חוזר בכל הערכת מלכי ישראל",
        "הכוונה לחטאי העגלים בבית אל ובדן",
        "כל מלך שלא הסיר אותם נחשב ממשיכו",
        "גם יהוא — שהשמיד את הבעל — לא הסיר את עגלי ירבעם"
      ],
      related_entities:["char:yarovam","event:eglei_zahav"]
    },
    {
      id:"rq-u2-020", unit:2, type:"place_events", difficulty:"קשה",
      prompt_niqqud:"מָה הָיוּ שָׁלֹשׁ עָרִים שֶׁבָּנָה יָרָבְעָם וְלָמָּה הָיוּ חֲשׁוּבוֹת?",
      answer_points:[
        "שכם (בירה ראשונה)",
        "פנואל בעבר הירדן (בירה חלופית)",
        "קבע גם את בית אל ודן כערי פולחן",
        "יצר בסיס גאוגרפי ודתי להפרדה מיהודה"
      ],
      related_entities:["char:yarovam","place:shchem","place:pnuel","place:beit_el","place:dan"]
    },
    // === יחידה ג — אליהו ואחאב ===
    {
      id:"rq-u3-001", unit:3, type:"mi_amar_lemi", difficulty:"קל",
      prompt_niqqud:"״חַי ה׳ אֱלֹהֵי יִשְׂרָאֵל אֲשֶׁר עָמַדְתִּי לְפָנָיו, אִם יִהְיֶה הַשָּׁנִים הָאֵלֶּה טַל וּמָטָר כִּי אִם לְפִי דְּבָרִי״ — מִי לְמִי?",
      answer_points:[
        "אליהו התשבי לאחאב מלך ישראל",
        "מכריז בצורת בעונש על עבודת הבעל",
        "פתיחת הסיפור של אליהו במל״א י״ז",
        "מטרת הבצורת: להוכיח שלא הבעל ממטיר — אלא ה׳"
      ],
      related_entities:["char:eliyahu","char:achav","event:batzoret"]
    },
    {
      id:"rq-u3-002", unit:3, type:"character_details", difficulty:"קל",
      prompt_niqqud:"מִי הָיְתָה אִיזֶבֶל וּמָה הִשְׁפִּיעָה עַל אַחְאָב?",
      answer_points:[
        "בת אתבעל מלך צידון",
        "נישאה לאחאב — חלק מקשרי חוץ של בית עמרי",
        "הכניסה את עבודת הבעל למלכות ישראל",
        "רדפה אחר נביאי ה׳ והעמידה 450 נביאי הבעל ו־400 נביאי האשרה בחצר"
      ],
      related_entities:["char:izevel","char:achav","event:avodat_habaal"]
    },
    {
      id:"rq-u3-003", unit:3, type:"place_events", difficulty:"בינוני",
      prompt_niqqud:"מָה הִתְרַחֵשׁ בְּנַחַל כְּרִית וּבְצָרְפַת בִּימֵי אֵלִיָּהוּ?",
      answer_points:[
        "בנחל כרית: אליהו מתחבא בתקופת הבצורת",
        "עורבים מביאים לו לחם ובשר בוקר וערב",
        "בצרפת: אלמנה מכלכלת אותו; נס צפחת השמן וכד הקמח",
        "אליהו גם מחיה את בנה המת — נס תחיית המתים הראשון בספר"
      ],
      related_entities:["char:eliyahu","place:nachal_krit","place:tzarfat","event:tzfachat_hashemen"]
    },
    {
      id:"rq-u3-004", unit:3, type:"short_answer", difficulty:"בינוני",
      prompt_niqqud:"תָאֵר אֶת הָעִמּוּת בְּהַר הַכַּרְמֶל — עִקָּרִים וּתוֹצָאוֹת.",
      answer_points:[
        "אליהו מכנס את העם, 450 נביאי הבעל ו־400 נביאי האשרה",
        "שואל: ״עד מתי אתם פוסחים על שתי הסעיפים״",
        "מבחן: אשר יענה באש הוא האלהים. הבעל לא ענה; ה׳ שלח אש ״ותאכל העולה״",
        "העם קורא ״ה׳ הוא האלהים״; אליהו שוחט את נביאי הבעל בנחל קישון"
      ],
      related_entities:["char:eliyahu","place:karmel","event:imut_karmel","event:shchitat_neviei_habaal"]
    },
    {
      id:"rq-u3-005", unit:3, type:"be_eize_hekhsher", difficulty:"בינוני",
      prompt_niqqud:"״וַיִּגַּשׁ אֵלִיָּהוּ אֶל כָּל הָעָם וַיֹּאמֶר עַד מָתַי אַתֶּם פֹּסְחִים עַל שְׁתֵּי הַסְּעִפִּים״ — הֶסְבֵּר.",
      answer_points:[
        "פתיחת המבחן בהר הכרמל",
        "״פוסחים״ = מהססים בין שני אלים",
        "אם ה׳ — לכו אחריו; אם הבעל — אחריו",
        "קוראה לעם לבחירה ברורה, ללא דו־דתיות"
      ],
      related_entities:["char:eliyahu","place:karmel","event:imut_karmel"]
    },
    {
      id:"rq-u3-006", unit:3, type:"al_mi_neemar", difficulty:"קל",
      prompt_niqqud:"עַל מִי נֶאֱמַר: ״וְהוּא הָלַךְ אֶל בְּאֵר שֶׁבַע... וַיֵּשֶׁב תַּחַת רֹתֶם אֶחָד״?",
      answer_points:[
        "על אליהו הנביא",
        "לאחר איום איזבל להרגו בעקבות שחיטת נביאי הבעל",
        "בורח לאר שבע (שבמלכות יהודה — מחוץ לתחום איזבל)",
        "משם ממשיך 40 יום ו־40 לילה לחורב"
      ],
      related_entities:["char:eliyahu","char:izevel","place:beer_sheva","event:ma_lecha_po"]
    },
    {
      id:"rq-u3-007", unit:3, type:"short_answer", difficulty:"קשה",
      prompt_niqqud:"מָה אֵרַע לְאֵלִיָּהוּ בְּחוֹרֵב? מָה מַשְׁמָעוּת הַהִתְגַּלּוּת?",
      answer_points:[
        "ה׳ מעביר לפניו: רוח, רעש, אש — ואינו בהם",
        "ואחר כך ״קול דממה דקה״ — שם מתגלה ה׳",
        "מסר: דרך ה׳ אינה בכוחניות אלא בסבלנות ובפעולה שקטה",
        "ה׳ מטיל עליו 3 משימות: למשוח חזאל, יהוא ואלישע"
      ],
      related_entities:["char:eliyahu","place:chorev","event:kol_dmama_daka"]
    },
    {
      id:"rq-u3-008", unit:3, type:"character_details", difficulty:"בינוני",
      prompt_niqqud:"מִי הָיָה נָבוֹת הַיִּזְרְעֵאלִי וּמָה הָיָה גּוֹרָלוֹ?",
      answer_points:[
        "בעל כרם בצד ארמון אחאב ביזרעאל",
        "אחאב ביקש לקנות/להחליף את הכרם — סרב (״חלילה לי מה׳ מתתי נחלת אבתי״)",
        "איזבל סידרה עדי שקר; נבות נסקל",
        "אחאב יורד לרשת; אליהו בא — ״הרצחת וגם ירשת?״"
      ],
      related_entities:["char:navot","char:achav","char:izevel","event:kerem_navot"]
    },
    {
      id:"rq-u3-009", unit:3, type:"mi_amar_lemi", difficulty:"בינוני",
      prompt_niqqud:"״הֲרָצַחְתָּ וְגַם יָרָשְׁתָּ״ — מִי לְמִי?",
      answer_points:[
        "אליהו הנביא לאחאב מלך ישראל",
        "בכרם נבות, לאחר שירד לרשתו",
        "מכאן — נבואת הכיליון על בית אחאב",
        '"במקום אשר לקקו הכלבים את דם נבות ילקו הכלבים את דמך"'
      ],
      related_entities:["char:eliyahu","char:achav","event:kerem_navot"]
    },
    {
      id:"rq-u3-010", unit:3, type:"short_answer", difficulty:"קשה",
      prompt_niqqud:"מָה הַכֶּשֶׁר בֵּין נְבוּאַת הָאֱוִיל בִּנְפִילַת אַחְאָב בְּרָמוֹת גִּלְעָד וְעֶקְרוֹן הַסִּבָּתִיּוּת הַכְּפוּלָה?",
      answer_points:[
        "הנבואה: ״במקום אשר לקקו הכלבים את דם נבות ילקו הכלבים את דמך״",
        "אחאב הלך לרמות גלעד בניגוד לדברי מיכיהו",
        "התחפש — אך ״איש משך בקשת לתמו״",
        "פגע בדיוק באחאב. הסיבה הגלויה — מקרה; הנסתרת — דבר ה׳"
      ],
      related_entities:["char:achav","char:michayahu","event:milchemet_ramot_gilad"]
    },
    {
      id:"rq-u3-011", unit:3, type:"character_details", difficulty:"בינוני",
      prompt_niqqud:"מִי הָיָה מִיכָיְהוּ בֶּן יִמְלָה?",
      answer_points:[
        "נביא אמת בחצר אחאב — מבודד מול 400 נביאי שקר",
        "לפני מלחמת רמות גלעד, יהושפט ביקש ״עוד נביא לה׳״",
        "בשם ה׳ נבא: ״ראיתי את כל ישראל נפצים על ההרים״",
        "אחאב כועס — שולח אותו לכלא עד שובו בשלום. לא שב"
      ],
      related_entities:["char:michayahu","char:achav","char:yehoshafat","event:milchemet_ramot_gilad"]
    },
    {
      id:"rq-u3-012", unit:3, type:"be_eize_hekhsher", difficulty:"בינוני",
      prompt_niqqud:"״אֲשִׁיבֵם אִישׁ בְּשָׁלוֹם אֶל בֵּיתוֹ״ — בְּאֵיזֶה הֶקְשֵׁר?",
      answer_points:[
        "אחאב שואל את 400 הנביאים לפני מלחמת רמות גלעד",
        "כולם מנבאים טוב — כל אחד בשם ה׳ (או בשם אחר)",
        "אחאב מבקש מיכיהו וזה מנבא רעה",
        "הצגה של נבואות השקר שליוו את חצר המלך"
      ],
      related_entities:["char:achav","char:michayahu","event:milchemet_ramot_gilad"]
    },
    {
      id:"rq-u3-013", unit:3, type:"place_events", difficulty:"בינוני",
      prompt_niqqud:"מָה הִתְרַחֵשׁ בְּאָפֵק בִּמְלֶחֶת בֶּן־הֲדַד הַשְּׁנִיָּה?",
      answer_points:[
        "הארמים אמרו ״אלהי הרים הוא״ וערכו מערכה בעמק",
        "ישראל כ״שני חשפי עזים״, ארם מילאה את הארץ",
        "ה׳ נתן נצחון מוחלט — 100,000 איש וקיר אפק נפל",
        "בן־הדד נכנע; אחאב חמל עליו — כעס הנביא על הפטור"
      ],
      related_entities:["char:achav","char:ben_hadad","place:afek"]
    },
    {
      id:"rq-u3-014", unit:3, type:"al_mi_neemar", difficulty:"קשה",
      prompt_niqqud:"עַל מִי נֶאֱמַר: ״רַק לֹא הָיָה כְאַחְאָב אֲשֶׁר הִתְמַכֵּר לַעֲשׂוֹת הָרַע״?",
      answer_points:[
        "על אחאב בן עמרי",
        "הדגש החזק ביותר על רוע מלכותי בספר",
        "״התמכר״ = מכר את עצמו; ״אשר הסתה אתו איזבל אשתו״",
        "הביטוי הזה מוצג בסיכום אישיותו לאחר כרם נבות"
      ],
      related_entities:["char:achav","char:izevel","event:kerem_navot"]
    },
    {
      id:"rq-u3-015", unit:3, type:"mi_amar_lemi", difficulty:"קשה",
      prompt_niqqud:"״הֲמָצָאתַנִי אֹיְבִי״ — מִי אָמַר לְמִי?",
      answer_points:[
        "אחאב לאליהו הנביא",
        "בכרם נבות לאחר שאליהו הגיע בנבואת הכיליון",
        "מגלה את היחס העוין בין שני הצדדים",
        "אליהו עונה: ״מצאתי יען התמכרך לעשות הרע בעיני ה׳״"
      ],
      related_entities:["char:achav","char:eliyahu","event:kerem_navot"]
    },
    {
      id:"rq-u3-016", unit:3, type:"short_answer", difficulty:"בינוני",
      prompt_niqqud:"מָה הָיְתָה חֲשִׁיבוּת הָעוֹרְבִים בְּנַחַל כְּרִית?",
      answer_points:[
        "ה׳ צווה עליהם לכלכל את אליהו",
        "עורבים טמאים — אך משרתים בדבר ה׳",
        "לחם ובשר בוקר וערב — כפל של אוכל",
        "מוטיב ההשגחה: ה׳ מפרנס עבדו בצרה"
      ],
      related_entities:["char:eliyahu","place:nachal_krit"]
    },
    {
      id:"rq-u3-017", unit:3, type:"be_eize_hekhsher", difficulty:"קשה",
      prompt_niqqud:"״וַיִּתְכַּסֶּה בְּשַׂק וַיָּלֶן בַּשָּׂק״ — בְּאֵיזֶה הֶקְשֵׁר?",
      answer_points:[
        "אחאב לאחר נבואת הכיליון של אליהו (כרם נבות)",
        "נכנע, קרע בגדיו, לבש שק וצם",
        "ה׳ מגיב: בגלל ההכנעה — אני ידחה רעה לבנו",
        "דוגמה מעניינת למלך רשע שמכיר בחטא בעת משבר"
      ],
      related_entities:["char:achav","char:eliyahu","event:kerem_navot"]
    },
    {
      id:"rq-u3-018", unit:3, type:"character_details", difficulty:"בינוני",
      prompt_niqqud:"מִי הָיָה עוֹבַדְיָהוּ בֶּן בֵּית אַחְאָב?",
      answer_points:[
        "אשר על הבית של אחאב — ״ירא את ה׳ מאד״",
        "בימי בצורת ורדיפות איזבל הסתיר 100 נביאים במערות",
        "פרנס אותם בלחם ומים",
        "נפגש עם אליהו לפני מעמד הכרמל — אליהו שלחו להודיע לאחאב"
      ],
      related_entities:["char:ovadyahu","char:eliyahu","char:achav","char:izevel"]
    },
    {
      id:"rq-u3-019", unit:3, type:"place_events", difficulty:"בינוני",
      prompt_niqqud:"מָה הָיוּ 3 הַמְּשִׂימוֹת שֶׁהֵטִיל ה׳ עַל אֵלִיָּהוּ בַּחוֹרֵב?",
      answer_points:[
        "למשוח את חזאל למלך על ארם",
        "למשוח את יהוא בן נמשי למלך על ישראל",
        "למשוח את אלישע בן שפט לנביא תחתיו",
        "הבטחה: מי שימלט מחרב חזאל ימית יהוא; ומחרב יהוא — אלישע"
      ],
      related_entities:["char:eliyahu","char:chazael","char:yehu","char:elisha","place:chorev"]
    },
    {
      id:"rq-u3-020", unit:3, type:"al_mi_neemar", difficulty:"קשה",
      prompt_niqqud:"עַל מִי נֶאֱמַר: ״וַיַּעַל אֵלִיָּהוּ בַּסְעָרָה הַשָּׁמָיִם״?",
      answer_points:[
        "על אליהו — במסעו האחרון מגלגל־ברית אל עבר הירדן",
        "אלישע רואה; ״רכב ישראל ופרשיו״ — רכב אש וסוסי אש",
        "קורע את בגדיו; מרים אדרת אליהו; שב וחוצה את הירדן",
        "אליהו לא מת — דוגמה מיוחדת בתנך. ״הנני שולח לכם את אליה הנביא״ (מלאכי)"
      ],
      related_entities:["char:eliyahu","char:elisha","place:yarden","event:aliyat_eliyahu"]
    },
    // === יחידה ד — מהפכות ותמורות ===
    // questions inserted incrementally (3 at a time)
  ];
  if (typeof window !== 'undefined'){
    window.REVIEW_QUESTIONS = QUESTIONS;
  }
  if (typeof module !== 'undefined' && module.exports){
    module.exports = QUESTIONS;
  }
})();
