/* =========================================================================
   data/quotes.js — verse quotes used across the bagrut prep site.

   !!! TODO source-needed — APPLIES TO EVERY ENTRY IN THIS FILE !!!
   ----------------------------------------------------------------------
   Each entry has a `book_ref` pointing to chapter/verse, but the niqqud
   in `text_niqqud` was NOT cross-checked against an authoritative Tanakh
   edition (Aleppo / Leningrad / Mossad HaRav Kook). Niqqud transcription
   errors are likely. The `significance` prose was composed by the site
   team and is editorial, not from any cited source.

   Several entries carry ids prefixed `q-matkonet-…` and significance
   text such as "ציטוט מתכונת תשפ״ו". The actual מתכונת תשפ״ו document is
   NOT present in this repository — the labels were applied without a
   verified source. Treat the matkonet prefix as aspirational, not as
   evidence of provenance.

   When a real source becomes available, add a `source_ref` field on each
   entry pointing to the exact citation.
   ========================================================================= */
window.QUOTES_DATA = [
  {
    id: "q-matkonet-1-kav-shomron",
    text_niqqud:
      "וְנָטִיתִי עַל־יְרוּשָׁלַיִם אֵת קָו שֹׁמְרוֹן וְאֶת־מִשְׁקֹלֶת בֵּית אַחְאָב",
    speaker_id: "god",
    addressee_id: "menashe",
    context_event_id: "nevuat_churban",
    book_ref: "מלכים ב כא יג",
    type: "prophecy",
    unit: 6,
    significance:
      "הגזרה הסופית על ירושלים בעקבות חטאי מנשה — אותו קנה-מידה שהחריב את שומרון יחריב את יהודה. ציטוט מתכונת תשפ״ו במסגרת ״מי אמר למי״.",
  },
  {
    id: "q-matkonet-2-chatzi-lo-hugad",
    text_niqqud:
      "וְלֹא־הֶאֱמַנְתִּי לַדְּבָרִים עַד אֲשֶׁר־בָּאתִי וַתִּרְאֶינָה עֵינַי וְהִנֵּה לֹא־הֻגַּד־לִי הַחֵצִי",
    speaker_id: "malkat_sheva",
    addressee_id: "shlomo",
    context_event_id: "malkat_sheva",
    book_ref: "מלכים א י ז",
    type: "confession",
    unit: 1,
    significance:
      "הכרת החכמה הבינלאומית בשלמה: אפילו השמועה לא הספיקה. ציטוט מתכונת תשפ״ו במסגרת ״מי אמר למי״.",
  },
  {
    id: "q-matkonet-3-ma-lanu-chelek",
    text_niqqud:
      "מַה־לָּנוּ חֵלֶק בְּדָוִד וְלֹא־נַחֲלָה בְּבֶן־יִשַׁי לְאֹהָלֶיךָ יִשְׂרָאֵל",
    speaker_id: "am",
    addressee_id: "rehavam",
    context_event_id: "pilug_bishchem",
    book_ref: "מלכים א יב טז",
    type: "rebuke",
    unit: 2,
    significance:
      "קריאת הפילוג בשכם — סיסמת מרד עשרת השבטים מבית דוד. ציטוט מתכונת תשפ״ו במסגרת ״מי אמר למי״.",
  },
  {
    id: "q-matkonet-4-pi-shnayim",
    text_niqqud: "וִיהִי־נָא פִּי־שְׁנַיִם בְּרוּחֲךָ אֵלָי",
    speaker_id: "elisha",
    addressee_id: "eliyahu",
    context_event_id: "aliyat_eliyahu",
    book_ref: "מלכים ב ב ט",
    type: "plea",
    unit: 4,
    significance:
      "בקשתו של אלישע המשותף־לנבואה לפני עליית אליהו בסערה. ציטוט מתכונת תשפ״ו במסגרת ״מי אמר למי״.",
  },
  {
    id: "q-avi-avi-rechev",
    text_niqqud: "אָבִי אָבִי רֶכֶב יִשְׂרָאֵל וּפָרָשָׁיו",
    speaker_id: "elisha",
    addressee_id: "eliyahu",
    context_event_id: "aliyat_eliyahu",
    book_ref: "מלכים ב ב יב",
    type: "confession",
    unit: 4,
    significance:
      "קריאת אלישע בעת עליית אליהו בסערה — הגדרת אליהו כצבא ישראל הרוחני. קובעת את מעמד הנביא כהגנה על האומה.",
  },
  {
    id: "q-achiya-ten-tribes",
    text_niqqud:
      "הִנְנִי קֹרֵעַ אֶת־הַמַּמְלָכָה מִיַּד שְׁלֹמֹה וְנָתַתִּי לְךָ אֵת עֲשָׂרָה הַשְּׁבָטִים",
    speaker_id: "achiya_hashiloni",
    addressee_id: "yarovam",
    context_event_id: "pilug_kingdom_prophecy",
    book_ref: "מלכים א יא לא",
    type: "prophecy",
    unit: 1,
    significance:
      "הלגיטימציה הנבואית לקריעת עשרת השבטים בגלל עבודה זרה של שלמה. נקודת המוצא של כל ממלכת ישראל.",
  },
  {
    id: "q-man-of-god-yoshiyahu",
    text_niqqud:
      "מִזְבֵּחַ מִזְבֵּחַ כֹּה אָמַר יְהוָה הִנֵּה־בֵן נוֹלָד לְבֵית־דָּוִד יֹאשִׁיָּהוּ שְׁמוֹ",
    speaker_id: "ish_haelohim_yehuda",
    addressee_id: "all",
    context_event_id: "mizbeach_beit_el",
    book_ref: "מלכים א יג ב",
    type: "prophecy",
    unit: 2,
    significance:
      "נבואה בשם מפורש שלוש מאות שנה לפני התקיימותה. דוגמה קלאסית לנבואה רחוקה שתתממש בימי יאשיהו.",
  },
  {
    id: "q-eliyahu-haratzachta",
    text_niqqud: "הֲרָצַחְתָּ וְגַם־יָרָשְׁתָּ",
    speaker_id: "eliyahu",
    addressee_id: "achav",
    context_event_id: "kerem_navot",
    book_ref: "מלכים א כא יט",
    type: "rebuke",
    unit: 3,
    significance:
      "שתי מילים שמגדירות את פשע אחאב ואיזבל על נבות. מכלילה את הרצח ואת השוד כמעשה אחד של אחאב אף שאיזבל היא היזמה.",
  },
  {
    id: "q-eliyahu-izevel-klavim",
    text_niqqud: "הַכְּלָבִים יֹאכְלוּ אֶת־אִיזֶבֶל בְּחֵל יִזְרְעֶאל",
    speaker_id: "eliyahu",
    addressee_id: "achav",
    context_event_id: "nevuat_eliyahu_achav",
    book_ref: "מלכים א כא כג",
    type: "prophecy",
    unit: 3,
    significance:
      "הגזרה הספציפית על איזבל — תתקיים בדיוק ביד יהוא ביזרעאל. סמל של התממשות נבואה באופן ציורי.",
  },
  {
    id: "q-shemaya-no-war",
    text_niqqud:
      "לֹא־תַעֲלוּ וְלֹא־תִלָּחֲמוּן עִם־אֲחֵיכֶם בְּנֵי־יִשְׂרָאֵל שׁוּבוּ אִישׁ לְבֵיתוֹ כִּי מֵאִתִּי נִהְיָה הַדָּבָר הַזֶּה",
    speaker_id: "shemaya_ish_haelohim",
    addressee_id: "rehavam",
    context_event_id: "milchemet_achim",
    book_ref: "מלכים א יב כד",
    type: "command",
    unit: 2,
    significance:
      "מניעת מלחמת אחים מיד לאחר הפילוג. מאשר שהפילוג הוא גזרת ה׳ ולא סתם מרד פוליטי.",
  },
  {
    id: "q-shlomo-lev-shomea",
    text_niqqud:
      "וְנָתַתָּ לְעַבְדְּךָ לֵב שֹׁמֵעַ לִשְׁפֹּט אֶת־עַמְּךָ לְהָבִין בֵּין־טוֹב לְרָע",
    speaker_id: "shlomo",
    addressee_id: "god",
    context_event_id: "hitgalut_givon",
    book_ref: "מלכים א ג ט",
    type: "plea",
    unit: 1,
    significance:
      "הבקשה שהגדירה את עידן הזהב של שלמה. במקום עושר או אריכות ימים — חכמת משפט. תגובת ה׳ לבקשה הזאת מעצבת את זכויותיו.",
  },
  {
    id: "q-shlomo-cut-baby",
    text_niqqud: "גִּזְרוּ אֶת־הַיֶּלֶד הַחַי לִשְׁנָיִם וּתְנוּ אֶת־הַחֲצִי לְאַחַת וְאֶת־הַחֲצִי לְאֶחָת",
    speaker_id: "shlomo",
    addressee_id: "all",
    context_event_id: "mishpat_shlomo",
    book_ref: "מלכים א ג כה",
    type: "command",
    unit: 1,
    significance:
      "הצו המבריק שחשף את האם האמיתית. המודל הפרדיגמטי לחכמת שלמה שהעם קיבל כ״חכמת אלוהים בקרבו״.",
  },
  {
    id: "q-real-mother",
    text_niqqud:
      "בִּי אֲדֹנִי תְּנוּ־לָהּ אֶת־הַיָּלוּד הַחַי וְהָמֵת אַל־תְּמִיתֻהוּ",
    speaker_id: "shtey_hanashim_hazonot",
    addressee_id: "shlomo",
    context_event_id: "mishpat_shlomo",
    book_ref: "מלכים א ג כו",
    type: "plea",
    unit: 1,
    significance:
      "תגובת האם האמיתית — אהבת הבן על פני אחיזה בצדק. הראיה לחכמת שלמה שהבחין בין אמת לשקר דרך רגש.",
  },
  {
    id: "q-bat-sheva-nishbata",
    text_niqqud:
      "אֲדֹנִי הַמֶּלֶךְ אַתָּה נִשְׁבַּעְתָּ בַּיהוָה אֱלֹהֶיךָ לַאֲמָתֶךָ כִּי־שְׁלֹמֹה בְנֵךְ יִמְלֹךְ אַחֲרָי וְהוּא יֵשֵׁב עַל־כִּסְאִי",
    speaker_id: "bat_sheva",
    addressee_id: "shlomo",
    context_event_id: "hamlachat_shlomo",
    book_ref: "מלכים א א יז",
    type: "plea",
    unit: 1,
    significance:
      "תחילתו של ספר מלכים — הזכרת בת שבע לדוד על שבועתו בשלמה. הפתח לכל הסיפור ההיסטורי של מלכי ישראל.",
  },
  {
    id: "q-david-chazak",
    text_niqqud: "חֲזַק וֶהְיֵה לְאִישׁ וְשָׁמַרְתָּ אֶת־מִשְׁמֶרֶת יְהוָה אֱלֹהֶיךָ",
    speaker_id: "shlomo",
    addressee_id: "shlomo",
    context_event_id: "hamlachat_shlomo",
    book_ref: "מלכים א ב ב",
    type: "command",
    unit: 1,
    significance:
      "הצוואה הרוחנית של דוד לשלמה. עקרון הברית הדויטרונומי — הליכה בדרכי ה׳ כתנאי להצלחת המלוכה. (דוד→שלמה)",
  },
  {
    id: "q-eliyahu-chay-hashem",
    text_niqqud:
      "חַי־יְהוָה אֱלֹהֵי יִשְׂרָאֵל אֲשֶׁר עָמַדְתִּי לְפָנָיו אִם־יִהְיֶה הַשָּׁנִים הָאֵלֶּה טַל וּמָטָר כִּי אִם־לְפִי דְבָרִי",
    speaker_id: "eliyahu",
    addressee_id: "achav",
    context_event_id: "batzoret_eliyahu",
    book_ref: "מלכים א יז א",
    type: "oath",
    unit: 3,
    significance:
      "הופעת אליהו — שבועת הבצורת. מפגן הראשוני של אליהו כמי שעומד לפני ה׳ ומחזיק בגורל הטבע.",
  },
  {
    id: "q-eliyahu-posschim",
    text_niqqud:
      "עַד־מָתַי אַתֶּם פֹּסְחִים עַל־שְׁתֵּי הַסְּעִפִּים אִם־יְהוָה הָאֱלֹהִים לְכוּ אַחֲרָיו",
    speaker_id: "eliyahu",
    addressee_id: "am",
    context_event_id: "maamad_har_carmel",
    book_ref: "מלכים א יח כא",
    type: "rebuke",
    unit: 3,
    significance:
      "האתגר של אליהו לעם בהר הכרמל — אין דרך אמצע בין ה׳ לבעל. דרישה להכרעה דתית חד־משמעית.",
  },
  {
    id: "q-am-hu-haelohim",
    text_niqqud: "יְהוָה הוּא הָאֱלֹהִים יְהוָה הוּא הָאֱלֹהִים",
    speaker_id: "am",
    addressee_id: "all",
    context_event_id: "maamad_har_carmel",
    book_ref: "מלכים א יח לט",
    type: "confession",
    unit: 3,
    significance:
      "קריאת העם אחרי נפילת האש — הכרעה ברורה באלוהי ישראל. זוהי השורה שסוגרת את נעילת יום הכיפורים.",
  },
  {
    id: "q-kol-dmama-daka",
    text_niqqud: "וְאַחַר הָאֵשׁ קוֹל דְּמָמָה דַקָּה",
    speaker_id: "god",
    addressee_id: "eliyahu",
    context_event_id: "hitgalut_chorev",
    book_ref: "מלכים א יט יב",
    type: "prophecy",
    unit: 3,
    significance:
      "ההתגלות בחורב — ה׳ נמצא בקול הדממה הדקה ולא ברעש וברוח. שינוי תפיסת ההתגלות מן הכוח הפיזי לאופן אחר.",
  },
  {
    id: "q-ma-lecha-po",
    text_niqqud: "מַה־לְּךָ פֹה אֵלִיָּהוּ",
    speaker_id: "god",
    addressee_id: "eliyahu",
    context_event_id: "hitgalut_chorev",
    book_ref: "מלכים א יט ט",
    type: "question",
    unit: 3,
    significance:
      "שאלת ה׳ לאליהו המסתתר במערה — שאלת אתגר לנביא: למה ברחת מעמדך? חוזרת פעמיים לפני ואחרי ההתגלות.",
  },
  {
    id: "q-yarovam-calves",
    text_niqqud: "הִנֵּה אֱלֹהֶיךָ יִשְׂרָאֵל אֲשֶׁר הֶעֱלוּךָ מֵאֶרֶץ מִצְרָיִם",
    speaker_id: "yarovam",
    addressee_id: "am",
    context_event_id: "egli_zahav",
    book_ref: "מלכים א יב כח",
    type: "command",
    unit: 2,
    significance:
      "הכרזת עגלי הזהב — הנוסחה שמהדהדת את חטא העגל במדבר. פתיחת חטאת ירבעם שתעוות את כל מלכי ישראל.",
  },
  {
    id: "q-navot-chalila",
    text_niqqud: "חָלִילָה לִּי מֵיְהוָה מִתִּתִּי אֶת־נַחֲלַת אֲבֹתַי לָךְ",
    speaker_id: "navot",
    addressee_id: "achav",
    context_event_id: "kerem_navot",
    book_ref: "מלכים א כא ג",
    type: "oath",
    unit: 3,
    significance:
      "סירוב נבות למכור את נחלת אבותיו — עמידה חוקית-דתית על חוק נחלת האבות. המוטיב שחותך את ההשקפה הכנענית של אחאב.",
  },
  {
    id: "q-izevel-kazek",
    text_niqqud:
      "כֹּה־יַעֲשׂוּן אֱלֹהִים וְכֹה יוֹסִפוּן כִּי־כָעֵת מָחָר אָשִׂים אֶת־נַפְשְׁךָ כְּנֶפֶשׁ אַחַד מֵהֶם",
    speaker_id: "izevel",
    addressee_id: "eliyahu",
    context_event_id: "maamad_har_carmel",
    book_ref: "מלכים א יט ב",
    type: "oath",
    unit: 3,
    significance:
      "איום איזבל על חיי אליהו אחרי הר הכרמל — זה שדוחף אותו לחורב. מדגים שיש כוח מעשי בחצר שהנביא אינו יכול לגבור בו.",
  },
  {
    id: "q-izevel-zimri",
    text_niqqud: "הֲשָׁלוֹם זִמְרִי הֹרֵג אֲדֹנָיו",
    speaker_id: "izevel",
    addressee_id: "yehu",
    context_event_id: "retsach_izevel",
    book_ref: "מלכים ב ט לא",
    type: "rebuke",
    unit: 4,
    significance:
      "דברי איזבל האחרונים — לעג לעג מעל חלון, משווה את יהוא לזמרי שהתאבד. השיא של אימפריית הדיבור שלה ממש לפני מותה.",
  },
  {
    id: "q-rehavam-asif-ol",
    text_niqqud:
      "אָבִי הֶעֱמִיס עֲלֵיכֶם עֹל כָּבֵד וַאֲנִי אֹסִיף עַל־עֻלְּכֶם אָבִי יִסַּר אֶתְכֶם בַּשּׁוֹטִים וַאֲנִי אֲיַסֵּר אֶתְכֶם בָּעַקְרַבִּים",
    speaker_id: "rehavam",
    addressee_id: "am",
    context_event_id: "pilug_bishchem",
    book_ref: "מלכים א יב יא",
    type: "rebuke",
    unit: 2,
    significance:
      "דברי רחבעם לעם — דחיית עצת הזקנים בלשון שעיבדה את עצמה להיות סיסמת הקיצוניות של השלטון. מיד אחריו הפילוג.",
  },
  {
    id: "q-elisha-widow",
    text_niqqud: "מַה־יֶּשׁ־לָךְ בַּבָּיִת",
    speaker_id: "elisha",
    addressee_id: "almanat_tzorefat",
    context_event_id: "nisey_elisha",
    book_ref: "מלכים ב ד ב",
    type: "question",
    unit: 4,
    significance:
      "שאלת אלישע לאלמנת אחד מבני הנביאים — הנס מתחיל ממה שקיים. העיקרון שהנס לא בא מן האין אלא מהמועט.",
  },
  {
    id: "q-shunamit-btoch-ami",
    text_niqqud: "בְּתוֹךְ עַמִּי אָנֹכִי יֹשָׁבֶת",
    speaker_id: "shunamit",
    addressee_id: "elisha",
    context_event_id: "nisey_elisha",
    book_ref: "מלכים ב ד יג",
    type: "confession",
    unit: 4,
    significance:
      "תשובת השונמית לאלישע — היא לא חסרה דבר חברתי. עצמאות אישית בולטת בהקשר הנשי של הספר.",
  },
  {
    id: "q-maid-achlei",
    text_niqqud:
      "אַחֲלֵי אֲדֹנִי לִפְנֵי הַנָּבִיא אֲשֶׁר בְּשֹׁמְרוֹן אָז יֶאֱסֹף אֹתוֹ מִצָּרַעְתּוֹ",
    speaker_id: "naara_ktana_miyisrael",
    addressee_id: "naaman",
    context_event_id: "ripuy_naaman",
    book_ref: "מלכים ב ה ג",
    type: "plea",
    unit: 4,
    significance:
      "משפט אחד של שפחה שבויה שמניע את כל סיפור ריפוי נעמן. דוגמה חזקה שהקטנים והחלשים יכולים לשנות מהלך היסטורי.",
  },
  {
    id: "q-naaman-ein-elohim",
    text_niqqud:
      "הִנֵּה־נָא יָדַעְתִּי כִּי אֵין אֱלֹהִים בְּכָל־הָאָרֶץ כִּי אִם־בְּיִשְׂרָאֵל",
    speaker_id: "naaman",
    addressee_id: "elisha",
    context_event_id: "ripuy_naaman",
    book_ref: "מלכים ב ה טו",
    type: "confession",
    unit: 4,
    significance:
      "וידוי נעמן הארמי אחרי ריפויו — הכרת ה׳ באופן בלעדי בישראל. מדגיש שהנס נועד גם להציג את ה׳ לגויים.",
  },
  {
    id: "q-metzoraim-yom-bsora",
    text_niqqud: "הַיּוֹם הַזֶּה יוֹם־בְּשֹׂרָה הוּא וַאֲנַחְנוּ מַחְשִׁים",
    speaker_id: "arbaat_hametzoraim",
    addressee_id: "arbaat_hametzoraim",
    context_event_id: "matziyat_shomron_bechol_haarba",
    book_ref: "מלכים ב ז ט",
    type: "command",
    unit: 4,
    significance:
      "מוסר עצמי של ארבעת המצורעים — אפילו פסולי חברה מכירים בחובת הפרסום של נס. הופכים מתחלואיים למבשרי גאולה.",
  },
  {
    id: "q-ravshake-mishenet",
    text_niqqud:
      "הִנֵּה בָטַחְתָּ לְּךָ עַל־מִשְׁעֶנֶת הַקָּנֶה הָרָצוּץ הַזֶּה עַל־מִצְרַיִם",
    speaker_id: "ravshake",
    addressee_id: "chizkiyahu",
    context_event_id: "matzor_sancheriv",
    book_ref: "מלכים ב יח כא",
    type: "rebuke",
    unit: 6,
    significance:
      "תעמולת רבשקה — ביקורת פוליטית על ברית יהודה עם מצרים. ציור ״משענת הקנה הרצוץ״ נזכר גם בנבואת ישעיהו.",
  },
  {
    id: "q-ravshake-al-yavtachchem",
    text_niqqud:
      "אַל־יַבְטַח אֶתְכֶם חִזְקִיָּהוּ אֶל־יְהוָה לֵאמֹר הַצֵּל יַצִּילֵנוּ יְהוָה",
    speaker_id: "ravshake",
    addressee_id: "am",
    context_event_id: "matzor_sancheriv",
    book_ref: "מלכים ב יח ל",
    type: "rebuke",
    unit: 6,
    significance:
      "רבשקה מנסה לערער את אמון העם על חזקיהו — פונה עברית מעל לראש המשלחת. דוגמת תעמולת פסיכולוגית.",
  },
  {
    id: "q-ravshake-elohei-goyim",
    text_niqqud:
      "הַהַצֵּל הִצִּילוּ אֱלֹהֵי הַגּוֹיִם אִישׁ אֶת־אַרְצוֹ מִיַּד מֶלֶךְ אַשּׁוּר",
    speaker_id: "ravshake",
    addressee_id: "am",
    context_event_id: "matzor_sancheriv",
    book_ref: "מלכים ב יח לג",
    type: "rebuke",
    unit: 6,
    significance:
      "שיא הגידוף של רבשקה — משווה את ה׳ לאלוהי הגויים. דיוק התיאולוגי שהצליח לחרות בלב חזקיהו ישעיהו לעמוד מולו.",
  },
  {
    id: "q-yeshayahu-ganoti",
    text_niqqud:
      "וְגַנּוֹתִי אֶל־הָעִיר הַזֹּאת לְהוֹשִׁיעָהּ לְמַעֲנִי וּלְמַעַן דָּוִד עַבְדִּי",
    speaker_id: "yeshayahu",
    addressee_id: "chizkiyahu",
    context_event_id: "nes_yerushalayim",
    book_ref: "מלכים ב יט לד",
    type: "prophecy",
    unit: 6,
    significance:
      "הבטחת ה׳ להציל את ירושלים מידי סנחריב בזכות שתי זכויות: שמו־הוא ובית דוד. מוטיב ״ברית דוד״ כמגן ליהודה.",
  },
  {
    id: "q-yeshayahu-bavel",
    text_niqqud:
      "הִנֵּה יָמִים בָּאִים וְנִשָּׂא כָּל־אֲשֶׁר בְּבֵיתֶךָ וַאֲשֶׁר אָצְרוּ אֲבֹתֶיךָ עַד־הַיּוֹם הַזֶּה בָּבֶלָה לֹא־יִוָּתֵר דָּבָר",
    speaker_id: "yeshayahu",
    addressee_id: "chizkiyahu",
    context_event_id: "shagirut_merodach_baladan",
    book_ref: "מלכים ב כ יז",
    type: "prophecy",
    unit: 6,
    significance:
      "הנבואה הראשונה המפורשת על הגלות הבבלית — בעקבות התפארות חזקיהו לפני שליחי מרודך בלאדן. יומן־הפוך של ההצלה.",
  },
  {
    id: "q-chilkiyahu-found",
    text_niqqud: "סֵפֶר הַתּוֹרָה מָצָאתִי בְּבֵית יְהוָה",
    speaker_id: "chilkiyahu_hakohen",
    addressee_id: "shafan_hasofer",
    context_event_id: "metziat_sefer_hatorah",
    book_ref: "מלכים ב כב ח",
    type: "report",
    unit: 6,
    significance:
      "המשפט שפתח את הרפורמה הגדולה של יאשיהו. מציאת ספר התורה במקדש — הזינוק של תחיית הברית.",
  },
  {
    id: "q-chulda-rech-bring-evil",
    text_niqqud:
      "כֹּה־אָמַר יְהוָה הִנְנִי מֵבִיא רָעָה אֶל־הַמָּקוֹם הַזֶּה וְעַל־יֹשְׁבָיו אֵת כָּל־דִּבְרֵי הַסֵּפֶר",
    speaker_id: "chulda",
    addressee_id: "yoshiyahu",
    context_event_id: "nevuat_chulda",
    book_ref: "מלכים ב כב טז",
    type: "prophecy",
    unit: 6,
    significance:
      "נבואת הרעה של חולדה לירושלים — הגזרה עומדת גם לאחר מציאת הספר וקריעת הבגדים של יאשיהו.",
  },
  {
    id: "q-chulda-shalom-yoshiyahu",
    text_niqqud:
      "הִנְנִי אֹסִפְךָ עַל־אֲבֹתֶיךָ וְנֶאֱסַפְתָּ אֶל־קִבְרֹתֶיךָ בְּשָׁלוֹם וְלֹא־תִרְאֶינָה עֵינֶיךָ בְּכֹל הָרָעָה",
    speaker_id: "chulda",
    addressee_id: "yoshiyahu",
    context_event_id: "nevuat_chulda",
    book_ref: "מלכים ב כב כ",
    type: "prophecy",
    unit: 6,
    significance:
      "נבואת השלום האישית של חולדה ליאשיהו — תיאסף בשלום. מותו במגידו לפני החורבן מקיים את הנבואה במובן המהותי.",
  },
  {
    id: "q-yoshiyahu-acharav-lo-kam",
    text_niqqud:
      "וְכָמֹהוּ לֹא־הָיָה לְפָנָיו מֶלֶךְ אֲשֶׁר־שָׁב אֶל־יְהוָה בְּכָל־לְבָבוֹ וּבְכָל־נַפְשׁוֹ וּבְכָל־מְאֹדוֹ",
    speaker_id: "god",
    addressee_id: "yoshiyahu",
    context_event_id: "reforma_kultit",
    book_ref: "מלכים ב כג כה",
    type: "confession",
    unit: 6,
    significance:
      "הערכת המקראי של יאשיהו — המלך המשיב בלב שלם ביותר. דיבור ישיר של המספר המלווה את שיא הרפורמה.",
  },
  {
    id: "q-matkonet-nevuat-kav",
    text_niqqud:
      "וַיְדַבֵּר יְהוָה בְּיַד עֲבָדָיו הַנְּבִיאִים יַעַן אֲשֶׁר עָשָׂה מְנַשֶּׁה מֶלֶךְ־יְהוּדָה הַתֹּעֵבוֹת הָאֵלֶּה",
    speaker_id: "god",
    addressee_id: "menashe",
    context_event_id: "nevuat_churban",
    book_ref: "מלכים ב כא י–יא",
    type: "prophecy",
    unit: 6,
    significance:
      "מבוא לגזרה על ירושלים — חטאי מנשה גרמו לגזרה שאין להשיבה גם בידי יאשיהו הצדיק. ההסבר התיאולוגי לחורבן.",
  },
  {
    id: "q-shlomo-tfila-hashamayim",
    text_niqqud:
      "הִנֵּה הַשָּׁמַיִם וּשְׁמֵי הַשָּׁמַיִם לֹא יְכַלְכְּלוּךָ אַף כִּי־הַבַּיִת הַזֶּה אֲשֶׁר בָּנִיתִי",
    speaker_id: "shlomo",
    addressee_id: "god",
    context_event_id: "chanukat_mikdash",
    book_ref: "מלכים א ח כז",
    type: "plea",
    unit: 1,
    significance:
      "לב תפילת חנוכת המקדש — הכרה שה׳ אינו נתון בגבולות בית מוחש, אבל הבית מבטא נוכחות סמלית. יסוד התיאולוגיה של המקדש.",
  },
  {
    id: "q-shlomo-baruch-menuchah",
    text_niqqud:
      "בָּרוּךְ יְהוָה אֲשֶׁר נָתַן מְנוּחָה לְעַמּוֹ יִשְׂרָאֵל כְּכֹל אֲשֶׁר דִּבֵּר לֹא־נָפַל דָּבָר אֶחָד מִכֹּל דְּבָרוֹ הַטּוֹב",
    speaker_id: "shlomo",
    addressee_id: "all",
    context_event_id: "chanukat_mikdash",
    book_ref: "מלכים א ח נו",
    type: "blessing",
    unit: 1,
    significance:
      "חיתום ברכת העם של שלמה — הברית התקיימה במלואה. ציר השיא של עידן הזהב, אחריו רק ירידה.",
  },
  {
    id: "q-chazael-ma-avdcha",
    text_niqqud: "וּמֶה עַבְדְּךָ הַכֶּלֶב כִּי יַעֲשֶׂה הַדָּבָר הַגָּדוֹל הַזֶּה",
    speaker_id: "chazael",
    addressee_id: "elisha",
    context_event_id: "shibud_chazael",
    book_ref: "מלכים ב ח יג",
    type: "question",
    unit: 4,
    significance:
      "מחאת חזאל כשאלישע ניבא שיעשה רעות לישראל. למחרת חנק חזאל את אדונו ומלך — הנבואה הפכה מציאות.",
  },
  {
    id: "q-yehu-yeshirah-lavavecha",
    text_niqqud:
      "הֲיֵשׁ אֶת־לְבָבְךָ יָשָׁר כַּאֲשֶׁר לְבָבִי עִם־לְבָבֶךָ...לְכָה אִתִּי וּרְאֵה בְּקִנְאָתִי לַיהוָה",
    speaker_id: "yehu",
    addressee_id: "yehonadav_ben_rechav",
    context_event_id: "mered_yehu",
    book_ref: "מלכים ב י טו–טז",
    type: "command",
    unit: 4,
    significance:
      "ברית יהוא עם יהונדב בן רכב — שילוב דתי-פוליטי במרד נגד בית אחאב. הסכם נאמנות דתית יחודי בספר.",
  },
  {
    id: "q-gedaliah-shvu-baaretz",
    text_niqqud:
      "אַל־תִּירְאוּ מֵעַבְדֵי הַכַּשְׂדִּים שְׁבוּ בָאָרֶץ וְעִבְדוּ אֶת־מֶלֶךְ בָּבֶל וְיִיטַב לָכֶם",
    speaker_id: "gedalya_ben_achikam",
    addressee_id: "all",
    context_event_id: "retsach_gedalya",
    book_ref: "מלכים ב כה כד",
    type: "command",
    unit: 6,
    significance:
      "הבטחת גדליהו לשארית יהודה — שיתוף פעולה עם בבל כדרך לרמוח יציבה. מיד אחריו נרצח. ציון של ״צום גדליהו״.",
  },
  {
    id: "q-michayahu-tzon-no-roe",
    text_niqqud:
      "רָאִיתִי אֶת־כָּל־יִשְׂרָאֵל נְפֹצִים אֶל־הֶהָרִים כַּצֹּאן אֲשֶׁר אֵין־לָהֶם רֹעֶה",
    speaker_id: "michayahu_ben_yimla",
    addressee_id: "achav",
    context_event_id: "nevuat_michayahu",
    book_ref: "מלכים א כב יז",
    type: "prophecy",
    unit: 3,
    significance:
      "נבואת מיכיהו על מפלת אחאב ברמות גלעד — משל צאן ללא רועה. חשיפת גזר דין מלכותי במפגן פומבי.",
  },
  {
    id: "q-michayahu-im-shov",
    text_niqqud: "אִם־שׁוֹב תָּשׁוּב בְּשָׁלוֹם לֹא־דִבֶּר יְהוָה בִּי",
    speaker_id: "michayahu_ben_yimla",
    addressee_id: "achav",
    context_event_id: "nevuat_michayahu",
    book_ref: "מלכים א כב כח",
    type: "oath",
    unit: 3,
    significance:
      "מבחן הנביא הציבורי — אם אחאב ישוב בשלום, אני שקרן. אחאב נהרג באותו יום. ממחיש את קריטריון הנבואה האמיתית.",
  },
  {
    id: "q-achaziah-mibli-ein-elohim",
    text_niqqud:
      "הֲמִבְּלִי אֵין־אֱלֹהִים בְּיִשְׂרָאֵל אַתֶּם הֹלְכִים לִדְרֹשׁ בְּבַעַל זְבוּב אֱלֹהֵי עֶקְרוֹן",
    speaker_id: "eliyahu",
    addressee_id: "achaziah_yisrael",
    context_event_id: "drisha_lebaal_zvuv",
    book_ref: "מלכים ב א ג",
    type: "rebuke",
    unit: 3,
    significance:
      "תוכחת אליהו על אחזיהו ששלח לדרוש בבעל זבוב אלוהי עקרון. הדיבור התקיף על ייחוד ה׳ מול פולחן זר.",
  },
  {
    id: "q-eliyahu-harei-avdcha",
    text_niqqud: "וְעַבְדְּךָ יָרֵא אֶת־יְהוָה מִנְּעֻרָי",
    speaker_id: "ovadyahu_asher_al_habayit",
    addressee_id: "eliyahu",
    context_event_id: "maamad_har_carmel",
    book_ref: "מלכים א יח יב",
    type: "confession",
    unit: 3,
    significance:
      "וידוי עובדיהו המכולכל של נביאי ה׳ — יראת ה׳ בפנים בית אחאב. דוגמת ירא ה׳ בחצר רשעה.",
  },
  {
    id: "q-eliyahu-kina-ka'ne'ti",
    text_niqqud: "קַנֹּא קִנֵּאתִי לַיהוָה אֱלֹהֵי צְבָאוֹת",
    speaker_id: "eliyahu",
    addressee_id: "god",
    context_event_id: "hitgalut_chorev",
    book_ref: "מלכים א יט י",
    type: "confession",
    unit: 3,
    significance:
      "טענת אליהו בחורב — ״קנאתי לה׳״ (פעמיים). חשיפת הייאוש של נביא שהרגיש יחיד. תיאור עצמי בעל מתח פנימי.",
  },
  {
    id: "q-shlomo-evyatar",
    text_niqqud:
      "לֵךְ עֲנָתוֹת עַל־שָׂדֶיךָ כִּי אִישׁ מָוֶת אָתָּה וּבַיּוֹם הַזֶּה לֹא אֲמִיתֶךָ כִּי נָשָׂאתָ אֶת־אֲרוֹן אֲדֹנָי יְהוִה",
    speaker_id: "shlomo",
    addressee_id: "evyatar_hakohen",
    context_event_id: "gerush_evyatar",
    book_ref: "מלכים א ב כו",
    type: "command",
    unit: 1,
    significance:
      "שלמה מגרש את אביתר מכהונה — זכר מפני שנשא את הארון לפני דוד. סוף בית עלי ככהני המשכן. מקיים גזרה עתיקה.",
  },
  {
    id: "q-yoav-kipo-amut",
    text_niqqud: "כִּי פֹה אָמוּת",
    speaker_id: "yoav",
    addressee_id: "benayahu_ben_yehoyada",
    context_event_id: "haracat_yoav",
    book_ref: "מלכים א ב ל",
    type: "oath",
    unit: 1,
    significance:
      "דברי יואב אחרי שנמלט אל קרנות המזבח — לא ייצא. שלמה פוקד להכותו שם. שבירת מסורת העמידה בקרנות המזבח.",
  },
  {
    id: "q-shlomo-shuv-raat-rashacha",
    text_niqqud: "תָּשׁוּב רָעָתְךָ בְּרֹאשֶׁךָ",
    speaker_id: "shlomo",
    addressee_id: "shimi_ben_gera",
    context_event_id: "haracat_shimi",
    book_ref: "מלכים א ב מד",
    type: "oath",
    unit: 1,
    significance:
      "דברי שלמה לשמעי כשהפר את האיסור לצאת מירושלים — סיגור חשבון מפני קללת דוד. עקרון של מידה כנגד מידה.",
  },
  {
    id: "q-yehoyada-brit",
    text_niqqud:
      "וַיִּכְרֹת יְהוֹיָדָע אֶת־הַבְּרִית בֵּין יְהוָה וּבֵין הַמֶּלֶךְ וּבֵין הָעָם לִהְיוֹת לְעָם לַיהוָה",
    speaker_id: "yehoyada_hakohen",
    addressee_id: "all",
    context_event_id: "hamlachat_yehoash",
    book_ref: "מלכים ב יא יז",
    type: "blessing",
    unit: 4,
    significance:
      "יהוידע הכהן כורת ברית שלושית — ה׳, מלך, עם. חידוש הברית אחרי עתליה. משחזר את ברית סיני המקראית.",
  },
  {
    id: "q-atalyah-kesher",
    text_niqqud: "קֶשֶׁר קָשֶׁר",
    speaker_id: "atalyah_char",
    addressee_id: "all",
    context_event_id: "haricat_atalya",
    book_ref: "מלכים ב יא יד",
    type: "rebuke",
    unit: 4,
    significance:
      "דברי עתליה האחרונים כשגילתה את הפיכת יהוידע. שתי מילים שמתארות את המהפך שבא אליה דרך נגיעה במציאות.",
  },
  {
    id: "q-chizkiyahu-lo-ka-mohu",
    text_niqqud:
      "בַּיהוָה אֱלֹהֵי־יִשְׂרָאֵל בָּטָח וְאַחֲרָיו לֹא־הָיָה כָמֹהוּ בְּכֹל מַלְכֵי יְהוּדָה",
    speaker_id: "god",
    addressee_id: "chizkiyahu",
    context_event_id: "taharat_mikdash",
    book_ref: "מלכים ב יח ה",
    type: "blessing",
    unit: 6,
    significance:
      "הערכת חזקיהו — הבטחון הדתי העליון בין מלכי יהודה. מעמדו הראשון בטור הצדיקים.",
  },
  {
    id: "q-shlomo-lev-lo-shalem",
    text_niqqud:
      "וַיְהִי לְעֵת זִקְנַת שְׁלֹמֹה נָשָׁיו הִטּוּ אֶת־לְבָבוֹ אַחֲרֵי אֱלֹהִים אֲחֵרִים וְלֹא־הָיָה לְבָבוֹ שָׁלֵם עִם־יְהוָה אֱלֹהָיו",
    speaker_id: "god",
    addressee_id: "shlomo",
    context_event_id: "pilug_kingdom_prophecy",
    book_ref: "מלכים א יא ד",
    type: "rebuke",
    unit: 1,
    significance:
      "הסיבה העמוקה לפילוג הממלכה — לב שלמה לא היה שלם עם ה׳. זהו הפסוק המנמק את גזרת הפילוג.",
  },
  {
    id: "q-yarovam-lechata'ot",
    text_niqqud:
      "וְהַדָּבָר הַזֶּה הָיָה לְחַטָּאת בֵּית יָרָבְעָם וּלְהַכְחִיד וּלְהַשְׁמִיד מֵעַל פְּנֵי הָאֲדָמָה",
    speaker_id: "god",
    addressee_id: "yarovam",
    context_event_id: "egli_zahav",
    book_ref: "מלכים א יג לד",
    type: "rebuke",
    unit: 2,
    significance:
      "הגנאי המקראי על עגלי הזהב — גזר דין על בית ירבעם. ציר מסגרת לכל הערכות מלכי ישראל הבאים.",
  },
  {
    id: "q-menashe-keeves",
    text_niqqud:
      "וַיֵּטְעוּם מְנַשֶּׁה לַעֲשׂוֹת אֶת־הָרַע מִן־הַגּוֹיִם אֲשֶׁר הִשְׁמִיד יְהוָה מִפְּנֵי בְּנֵי יִשְׂרָאֵל",
    speaker_id: "god",
    addressee_id: "menashe",
    context_event_id: "nevuat_churban",
    book_ref: "מלכים ב כא ט",
    type: "rebuke",
    unit: 6,
    significance:
      "גנאי מנשה — רע מן הגויים שה׳ הוריש מישראל. מצדיק את חורבן הבית בזכות חטאים המזכירים את חטאי הכנענים.",
  },
  {
    id: "q-evil-merodach-chessed",
    text_niqqud:
      "נָשָׂא אֱוִיל מְרֹדַךְ מֶלֶךְ בָּבֶל בִּשְׁנַת מָלְכוֹ אֶת־רֹאשׁ יְהוֹיָכִין מֶלֶךְ־יְהוּדָה מִבֵּית כֶּלֶא",
    speaker_id: "god",
    addressee_id: "yehoyachin",
    context_event_id: "chesed_evil_merodach",
    book_ref: "מלכים ב כה כז",
    type: "report",
    unit: 6,
    significance:
      "הפסוק החותם את ספר מלכים — אויל מרודך משחרר את יהויכין. נקודת תקווה בחשכת הגלות; שושלת דוד לא נכחדה.",
  },
];

// =========================================================================
// Cross-ref derivation for quotes. No prose generation.
//
// Derivations (each consumes only fields already on the quote entry):
//   related_kings  = {speaker_id, addressee_id} ∩ KING_IDS
//   related_events = [context_event_id]                  (if present)
//
// speaker_id is the source-of-truth link from a quote to a character;
// it remains untouched. KING_IDS mirrors data/kings.js. Visible to
// runtime AND scripts/audit-entity-links.js.
// =========================================================================
;(function(){
  if (typeof window === "undefined") return;
  var arr = window.QUOTES_DATA;
  if (!Array.isArray(arr)) return;

  var KING_IDS = {
    shlomo:1, rehavam:1, aviyam:1, asa:1, yehoshafat:1, yoram_yehuda:1,
    achaziah_yehuda:1, atalya:1, yehoash_yehuda:1, amatzya:1, uziyahu:1,
    yotam:1, achaz:1, chizkiyahu:1, menashe:1, amon:1, yoshiyahu:1,
    yehoachaz_yehuda:1, yehoyakim:1, yehoyachin:1, tzidkiyahu:1,
    yarovam:1, nadav:1, basha:1, ela:1, zimri:1, omri:1, achav:1,
    achaziah_yisrael:1, yoram_yisrael:1, yehu:1, yehoachaz_yisrael:1,
    yoash_yisrael:1, yarovam_beit:1, zacharia:1, shalum:1, menachem:1,
    pekachya:1, pekach:1, hoshea:1
  };

  arr.forEach(function(q){
    if (!q || typeof q !== "object") return;

    if (!Array.isArray(q.related_kings)) {
      var seen = {};
      var kings = [];
      [q.speaker_id, q.addressee_id].forEach(function(id){
        if (typeof id === "string" && KING_IDS[id] && !seen[id]) {
          seen[id] = 1;
          kings.push(id);
        }
      });
      q.related_kings = kings;
    }

    if (!Array.isArray(q.related_events) && typeof q.context_event_id === "string" && q.context_event_id) {
      q.related_events = [q.context_event_id];
    }
  });
})();
