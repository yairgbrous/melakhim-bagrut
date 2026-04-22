(function(){
  const {useState, useMemo} = React;

  const UNITS = [
    {id:1, num:'א', title:'מלכות שלמה'},
    {id:2, num:'ב', title:'פילוג הממלכה'},
    {id:3, num:'ג', title:'אליהו ואחאב'},
    {id:4, num:'ד', title:'מהפכות ותמורות'},
    {id:5, num:'ה', title:'הכיבוש האשורי'},
    {id:6, num:'ו', title:'סוף יהודה'}
  ];

  const BREADTH_FALLBACK = [
    {
      id:'sibatiyut_kfula',
      title:'עקרון הסיבתיות הכפולה',
      intro:'כל אירוע מכריע בספר מוצג בשני מישורים: סיבה אלוקית — השגחה וגזרת ה׳ — לצד סיבה היסטורית־אנושית המבוססת על בחירה חופשית. השניים שלובים זה בזה: המלך בוחר, ה׳ מסובב. מעצב התפיסה המקראית שלפיה גלות ישראל ויהודה אינן מקרה אלא תוצאה של חטא מחד וגזרה מאידך.',
      unit_coverage:[1,2,3,5,6],
      key_instances:[
        {label:'פילוג הממלכה — רחבעם בחר בעצת הילדים; "כי היתה סיבה מעם ה׳"', unit:'ב', unitId:2},
        {label:'מלחמת רמות גלעד — חץ "לתומו" שהגשים נבואת מיכיהו', unit:'ג', unitId:3},
        {label:'מרד יהוא — ציווי ה׳ מחורב לצד תכנון פוליטי', unit:'ד', unitId:4},
        {label:'חורבן ממלכת ישראל — מרד הושע בשלמנאסר וגזרת "הסיר את ישראל"', unit:'ה', unitId:5},
        {label:'חורבן ירושלים — מרד צדקיהו בנבוכדנצר וגזרה בעוון מנשה', unit:'ו', unitId:6}
      ],
      questions:[
        'כיצד מתמודד הספר עם המתח בין בחירה חופשית של המלך לבין גזרה אלוקית שנקבעה מראש?',
        'מדוע דווקא פרטים אקראיים כביכול ("לתומו", "פגע פגוש") זוכים לציון מפורש וחיבור לנבואה?',
        'האם תפיסת הסיבתיות הכפולה פוטרת את המלך מאחריות, או שמא דווקא מדגישה אותה?'
      ]
    },
    {
      id:'manhig',
      title:'מנהיג ומנהיגות',
      intro:'הספר בוחן את דמות המלך באמת מידה אחת: "עשה הישר בעיני ה׳" או "עשה הרע". ההערכה איננה מדינית אלא מוסרית־רוחנית. הספר מעמיד זה מול זה מנהיגים צנועים שומעי דבר ה׳ (שלמה בתחילתו, יאשיהו, חזקיהו) מול גאים נכשלים (רחבעם, אחאב), ובוחן את השלכות ההחלטות של היחיד על גורל העם כולו — לטובה ולרעה.',
      unit_coverage:[1,2,3,4,5,6],
      key_instances:[
        {label:'שלמה מבקש "לב שומע" — מודל ענווה', unit:'א', unitId:1},
        {label:'רחבעם בוחר בעצת הילדים — כישלון גאווה', unit:'ב', unitId:2},
        {label:'אחאב נכנע לאיזבל מול אליהו — אי־שמירת דבר ה׳', unit:'ג', unitId:3},
        {label:'חזקיהו בטח בה׳ מול סנחריב', unit:'ו', unitId:6},
        {label:'יאשיהו — "וכמהו לא היה לפניו מלך"', unit:'ו', unitId:6},
        {label:'צדקיהו מול יהויכין — שתי תגובות לאותו מצור', unit:'ו', unitId:6}
      ],
      questions:[
        'מהי "עשיית הישר" — האם כנות אישית של המלך או פעולה ציבורית לתיקון העם?',
        'מדוע תשובת יאשיהו הגדולה לא ביטלה את הגזרה שנגזרה על ירושלים?',
        'מה מבחין בין מנהיג נכשל שעוד ניתן לו "קרן" (אחאב נכנע) לבין מנהיג שנגזר דינו?'
      ]
    },
    {
      id:'mikdash',
      title:'בית המקדש',
      intro:'בית המקדש הוא מסגרת הספר: נבנה בשיא פתיחתו ונחרב בסופו. הוא משמש מדד למצבו הרוחני של העם — כשהמלכות כושלת מוריד המלך אוצרות מבית ה׳ לפייס אויב, או מציב מזבח זר; כשהיא מתעוררת, הוא מחדש ומטהר. המקדש הוא נקודת המפגש הממשית של האומה עם ה׳ — וכשהוא נפגע, נפגעת גם הברית.',
      unit_coverage:[1,2,5,6],
      key_instances:[
        {label:'חנוכת המקדש — הענן מלא את הבית', unit:'א', unitId:1},
        {label:'שישק לוקח אוצרות בית ה׳', unit:'ב', unitId:2},
        {label:'אסא נותן אוצרות לבן־הדד', unit:'ב', unitId:2},
        {label:'אחז מציב מזבח דמשק ומפרק כלי מקדש', unit:'ה', unitId:5},
        {label:'מנשה מציב פסל האשרה בבית', unit:'ו', unitId:6},
        {label:'יאשיהו — בדק הבית ומציאת ספר התורה', unit:'ו', unitId:6},
        {label:'נבוזראדן שורף את בית ה׳', unit:'ו', unitId:6}
      ],
      questions:[
        'מדוע מלכים טובים כאסא בכל זאת נאלצו להוציא אוצרות מבית ה׳? האם זו כישלון או הכרח?',
        'מה פשר האיזון בספר בין בניית המקדש לחורבנו — מסגרת ספרותית או הצהרה אמונית?',
        'כיצד ההצבה של מזבח דמשק או פסל האשרה משנה את מעמד המקדש עצמו, ולא רק את המלך?'
      ]
    },
    {
      id:'melech_navi',
      title:'מלך ונביא',
      intro:'הנביא הוא "מבקר המדינה" — שלוח ה׳ אל המלך, ללא משוא פנים. הוא ממליך ומדיח, מוכיח ומתפלל. בספר מלכים עולה דגם של יחסים מתוחים: המלך מחזיק בשלטון, הנביא באמת — ועליו לומר את דברו גם אם הוא מוכנס לכלא, נרדף, או מואס. מודלים חיוביים (ישעיה וחזקיהו) ושליליים (אחאב ואליהו) עוברים כחוט השני.',
      unit_coverage:[2,3,4,5,6],
      key_instances:[
        {label:'אחיה השילוני ממליך את ירבעם', unit:'א', unitId:1},
        {label:'שמעיה איש האלוקים מונע מלחמת אחים', unit:'ב', unitId:2},
        {label:'אליהו מול אחאב בכרם נבות', unit:'ג', unitId:3},
        {label:'מיכיהו מתנבא אמת ומוכנס לכלא', unit:'ג', unitId:3},
        {label:'אלישע שולח נער למשוח את יהוא', unit:'ד', unitId:4},
        {label:'ישעיה מנבא הצלת ירושלים מסנחריב', unit:'ו', unitId:6},
        {label:'חולדה הנביאה משיבה ליאשיהו', unit:'ו', unitId:6}
      ],
      questions:[
        'מה מאפשר לישעיה וחזקיהו דגם מפגש חיובי, לעומת העימות החד של אליהו ואחאב?',
        'מדוע הנביא מתבקש לא רק להוכיח אלא גם להמליך ולהדיח — תפקיד פוליטי ממש?',
        'כיצד ניתן להסביר את בחירת חולדה הנביאה דווקא, כשישעיה וירמיהו כבר פעלו בתקופה?'
      ]
    },
    {
      id:'israel_goyim',
      title:'ישראל והעמים',
      intro:'ישראל חי בצומת בין מצרים בדרום לארם, אשור ובבל בצפון. קשרי מסחר, ברית ונישואין עם העמים נשאו פוטנציאל כפול: שגשוג חומרי אך גם אובדן זהות רוחנית. הספר בוחן איך כל קשר חוץ — חיובי כשל שלמה וחירם, הרסני כמו אחאב ואיזבל — מעצב את מצבה הדתי של האומה ואת גורלה ההיסטורי.',
      unit_coverage:[1,2,3,5,6],
      key_instances:[
        {label:'שלמה וחירם מלך צור — סחר ובניין', unit:'א', unitId:1},
        {label:'שלמה והנשים הנוכריות — אובדן אמונה', unit:'א', unitId:1},
        {label:'אחאב ואיזבל הצידונית — הכנסת הבעל', unit:'ג', unitId:3},
        {label:'אחז נכנע לאשור: "עבדך ובנך אני"', unit:'ה', unitId:5},
        {label:'הושע ברית עם סוא מצרים — "משענת הקנה"', unit:'ה', unitId:5},
        {label:'סנחריב וחזקיהו — נאום רבשקה ונס', unit:'ו', unitId:6},
        {label:'יאשיהו ופרעה נכה במגידו', unit:'ו', unitId:6}
      ],
      questions:[
        'האם הספר מציג קשר עם העמים כדבר רע מעיקרו, או רק כשאיננו בגבולות אמונתיים?',
        'מה ההבדל העקרוני בין ברית "מלמעלה" (שלמה־חירם) לברית של חולשה (אחז־אשור)?',
        'מדוע דווקא ההתערבות במלחמה בין־עמית במגידו חותמת את גורלו של יאשיהו הצדיק?'
      ]
    },
    {
      id:'ahdut_pilug',
      title:'אחדות ופילוג',
      intro:'הספר פותח בממלכה מאוחדת תחת שלמה ונסגר בגלות שתי ממלכות שנפרדו. הפילוג בשכם איננו רק אירוע פוליטי אלא משבר מוסרי ודתי — פריצת העגלים בבית־אל, מלחמות אחים חוזרות, ועירוב עמים זרים במאבקים פנימיים. האחדות מוצגת כתנאי לשגשוג רוחני וחומרי; הפילוג — כמחלה שמתפשטת עד לחורבן.',
      unit_coverage:[1,2,3,5,6],
      key_instances:[
        {label:'ימי שלמה — "וישב יהודה וישראל לבטח"', unit:'א', unitId:1},
        {label:'פילוג בשכם — "מה לנו חלק בדוד"', unit:'ב', unitId:2},
        {label:'מלחמות ירבעם־רחבעם ואבים', unit:'ב', unitId:2},
        {label:'אסא שוכר את בן־הדד נגד בעשא', unit:'ב', unitId:2},
        {label:'אחאב ויהושפט ברמות גלעד', unit:'ג', unitId:3},
        {label:'אמציה ויואש — פריצת חומות ירושלים', unit:'ה', unitId:5}
      ],
      questions:[
        'האם הפילוג היה בלתי נמנע לאחר חטאי שלמה, או שעצת הזקנים היתה יכולה למנעו?',
        'מדוע דווקא נפילת ממלכת ישראל קודמת למפלת יהודה בפער של מאה ושלושים שנה?',
        'איזה משקל יש למלחמות האחים באופי הדתי של ישראל לאורך הדורות?'
      ]
    },
    {
      id:'ruchani_medini',
      title:'מצב רוחני — מצב מדיני',
      intro:'אמת המידה של הספר למלך היא רוחנית בלבד: "עשה הישר" או "עשה הרע". אך במציאות, המתאם בין מצב רוחני למצב מדיני איננו תמיד ישיר. לעיתים שפל רוחני מלווה בשגשוג מדיני (ירבעם השני), ולעיתים מלך צדיק מת במגידו (יאשיהו). הספר בוחן מתי דווקא הקִרבה לה׳ מבטלת גזרה — ומתי היא רק מאריכה שלווה.',
      unit_coverage:[1,2,3,5,6],
      key_instances:[
        {label:'שלמה — שיא רוחני ומדיני יחד', unit:'א', unitId:1},
        {label:'ירבעם השני — שפל דתי, שיא הרחבת גבול', unit:'ד', unitId:4},
        {label:'מנשה — רשע גדול, המלכות הארוכה ביותר', unit:'ו', unitId:6},
        {label:'חזקיהו — צדיק, ניצול בנס מסנחריב', unit:'ו', unitId:6},
        {label:'יאשיהו — גדול המלכים שמת במגידו', unit:'ו', unitId:6}
      ],
      questions:[
        'כיצד הספר מסביר ששלטון רשע (מנשה) זכה לאריכות ימים, בעוד צדיק (יאשיהו) לא?',
        'האם שגשוג מדיני של ירבעם השני מלמד שה׳ מתעלם מהרוחני כאשר העם סובל?',
        'מה היחס בין תשובת יאשיהו המלאה לבין אי־ביטול הגזרה — לימוד מה על מוסר ההיסטוריה?'
      ]
    }
  ];

  const RECURRING_FALLBACK = [
    {
      id:'atzarot_beit_hashem',
      name_niqqud:'אוֹצְרוֹת בֵּית ה׳',
      instances:[
        {unit:'א', unitId:1, context:'שלמה אוגר זהב וכלי קודש בחנוכת הבית'},
        {unit:'ב', unitId:2, context:'שישק עולה על ירושלים ולוקח את אוצרות בית ה׳'},
        {unit:'ב', unitId:2, context:'אסא נותן אוצרות לבן־הדד נגד בעשא'},
        {unit:'ה', unitId:5, context:'יואש מסיר כסף לחזאל ארם כדי לסור מירושלים'},
        {unit:'ה', unitId:5, context:'אחז לוקח כסף וזהב ושולחם לתגלת פלאסר'},
        {unit:'ו', unitId:6, context:'חזקיהו נותן כסף לסנחריב מן המקדש'},
        {unit:'ו', unitId:6, context:'נבוזראדן משבר כלי הנחושת ולוקח אוצרות'}
      ],
      significance:'האוצרות הם מדד מוחשי ליחסי המלכות והמקדש. כל הוצאה מהם — גם של מלך טוב כאסא או חזקיהו — מסמנת תלות בכוח חיצוני ולא בה׳, והיא המקדמת את הבית לעבר חורבנו.'
    },
    {
      id:'magini_zahav',
      name_niqqud:'מָגִנֵּי הַזָּהָב',
      instances:[
        {unit:'א', unitId:1, context:'שלמה עושה מאתיים צינה ושלוש מאות מגנים של זהב'},
        {unit:'ב', unitId:2, context:'שישק לוקח אותם בעליית מצרים'},
        {unit:'ב', unitId:2, context:'רחבעם מחליפם במגני נחושת — סמל הדרדרות'}
      ],
      significance:'החלפת הזהב בנחושת מיד לאחר הפילוג היא תמונת ראי לאובדן תור הזהב: חיצונית המראה נשמר אך המהות השתנתה. הכתוב מדגיש זאת כסימן מובהק לתחילת נפילת בית דוד.'
    },
    {
      id:'eglei_zahav',
      name_niqqud:'עֶגְלֵי הַזָּהָב',
      instances:[
        {unit:'ב', unitId:2, context:'ירבעם מקים עגלים בבית־אל ובדן: "הנה אלהיך ישראל"'},
        {unit:'ד', unitId:4, context:'יהוא השמיד את הבעל אך "לא סר מחטאות ירבעם"'},
        {unit:'ה', unitId:5, context:'דור אחר דור בישראל "הלכו בחטאת ירבעם" עד גלות'}
      ],
      significance:'העגלים הם חטא המנהיגות הפוליטית שהפך לחטא לאומי מתמשך. הם מייצגים כיצד החלטה של מלך אחד מסוגלת לכבול את עם־ישראל כולו לעבודה זרה לאורך מאתיים שנה.'
    },
    {
      id:'etzat_hayladim',
      name_niqqud:'עֲצַת הַיְלָדִים',
      instances:[
        {unit:'ב', unitId:2, context:'רחבעם בשכם דוחה את עצת הזקנים'},
        {unit:'ב', unitId:2, context:'"קטני עבה ממתני אבי" — תגובתו לעם'}
      ],
      significance:'עצת הילדים היא הביטוי של גאוות המלך הצעיר שאבד לו חוש המציאות. היא משמשת כסמל תמידי לאבדן מנהיגות קשובה — וכנקודת ההכרעה שגרמה לקריעת הממלכה.'
    },
    {
      id:'aseret_kraim',
      name_niqqud:'עֲשֶׂרֶת הַקְּרָעִים',
      instances:[
        {unit:'א', unitId:1, context:'אחיה השילוני קורע שלמת עצמו לשנים־עשר'},
        {unit:'א', unitId:1, context:'נותן עשרה קרעים לירבעם, אחד לרחבעם'},
        {unit:'ב', unitId:2, context:'התגשמות בפילוג בשכם — עשרת השבטים פורשים'}
      ],
      significance:'מעשה סמלי נבואי המקדים בעשרים שנה את הפילוג בפועל. הקריעה מראה שגורל המלכות נקבע כבר בימי שלמה על בסיס חטאיו — אך מימושו מחכה לדור הבא.'
    },
    {
      id:'chodesh_asher_bada',
      name_niqqud:'חֹדֶשׁ אֲשֶׁר בָּדָא מִלִּבּוֹ',
      instances:[
        {unit:'ב', unitId:2, context:'ירבעם עושה חג בחודש השמיני "מלבו"'},
        {unit:'ב', unitId:2, context:'מעלה קרבנות על המזבח בבית־אל'}
      ],
      significance:'הביטוי "בדא מלבו" חושף את מהות חטאי ירבעם: יצירת מערכת דת אלטרנטיבית מטעמים פוליטיים, לא אמונתיים. החזרה על ביטוי זה הופכת אותו למדד לעבודה זרה מהונדסת.'
    },
    {
      id:'kerem_navot',
      name_niqqud:'כֶּרֶם נָבוֹת',
      instances:[
        {unit:'ג', unitId:3, context:'אחאב מתאווה לכרם ונבות מסרב: "חלילה לי מה׳"'},
        {unit:'ג', unitId:3, context:'איזבל מסיתה ומקימה עדי שקר — נבות נסקל'},
        {unit:'ג', unitId:3, context:'אליהו: "במקום אשר לקקו הכלבים את דם נבות"'},
        {unit:'ג', unitId:3, context:'מימוש — דם אחאב נשטף ליד הבריכה בשומרון'},
        {unit:'ד', unitId:4, context:'דם בני אחאב בחלקת נבות — ביד יהוא'}
      ],
      significance:'כרם נבות הוא המקרה המופתי של עוול מלכותי בספר: הפיכת הצדק לעיוות משפטי. הוא ממקד איך מלך יכול להשתמש במוסדות המלכות לרציחת נתינו, וכיצד צדקתו של ה׳ נפרעת בדורות.'
    },
    {
      id:'mizbach_damesek',
      name_niqqud:'מִזְבַּח דַּמֶּשֶׂק',
      instances:[
        {unit:'ה', unitId:5, context:'אחז רואה מזבח בדמשק ושולח דמותו לאוריה הכהן'},
        {unit:'ה', unitId:5, context:'מציב את החדש במקום מזבח הנחושת של שלמה'},
        {unit:'ה', unitId:5, context:'מפרק את המכונות והכיור — פגיעה בכלי המקדש'}
      ],
      significance:'מזבח דמשק הוא אירוע הפיכת המקדש למוסד פולחני עצמאי של המלך. אחז איננו מציב פסל בלבד אלא משכתב את המקדש עצמו על פי אסתטיקה של האויב — ביטוי עמוק של כניעה דתית.'
    },
    {
      id:'nachash_nechoshet',
      name_niqqud:'נְחַשׁ הַנְּחֹשֶׁת',
      instances:[
        {unit:'ו', unitId:6, context:'חזקיהו מכתת את נחש הנחושת של משה'},
        {unit:'ו', unitId:6, context:'קורא לו בבוז "נְחֻשְׁתָּן"'}
      ],
      significance:'הנחש נעשה בידי משה בפקודת ה׳ — אך הפך במשך דורות לעצם פולחן. פעולת חזקיהו מלמדת כי גם סמל קדוש יכול להיות חטא כשהוא מחליף את ה׳. הכתוב מציג זאת כתשובה אמיצה של הנהגה מתקנת.'
    },
    {
      id:'mishenet_kaneh',
      name_niqqud:'מִשְׁעֶנֶת הַקָּנֶה הָרָצוּץ',
      instances:[
        {unit:'ה', unitId:5, context:'הושע בן אלה שולח אל סוא מלך מצרים'},
        {unit:'ו', unitId:6, context:'רבשקה ללעג חזקיהו: "בטחת לך על מצרים"'},
        {unit:'ו', unitId:6, context:'"אשר יסמך איש עליו ובא בכפו ונקבה"'}
      ],
      significance:'הדימוי מופיע בפי רבשקה והאוייב אשור לועג לתקוות ישראל במצרים. הוא חוזר בנבואת ישעיה ובהיסטוריה — מציג את מצרים כבעלת ברית בוגדנית המכזיבה בעת צרה, ומזהיר מהסתמכות מדינית במקום אמונית.'
    },
    {
      id:'kav_shomron',
      name_niqqud:'קָו שֹׁמְרוֹן וּמִשְׁקֹלֶת בֵּית אַחְאָב',
      instances:[
        {unit:'ו', unitId:6, context:'נבואת ה׳ על ירושלים בימי מנשה'},
        {unit:'ו', unitId:6, context:'"ונטיתי על ירושלם את קו שמרון" — כלי מדידה לחורבן'}
      ],
      significance:'דימוי מבהיל המעמיד את גורל ירושלים מול גורל שומרון: אותו קו, אותו משקולת — אותה תוצאה. הנבואה קובעת שהדין יהיה שווה לשני הבתים, ומבטלת כל תקווה שירושלים תינצל בזכות המקדש.'
    },
    {
      id:'bedek_habayit',
      name_niqqud:'בֶּדֶק הַבַּיִת',
      instances:[
        {unit:'ה', unitId:5, context:'יואש מתקן את בית ה׳ בכסף הציבור'},
        {unit:'ה', unitId:5, context:'ארגז הכהן יהוידע לאיסוף כסף הבדק'},
        {unit:'ו', unitId:6, context:'יאשיהו מממן שיפוץ מקיף למקדש'},
        {unit:'ו', unitId:6, context:'במהלך השיפוץ נמצא ספר התורה'}
      ],
      significance:'פעולת בדק הבית מסמלת התעוררות דתית ציבורית: המלך אינו פועל בלבד אלא מעורר את העם לתרום למקדש. מתוך הפעולה הפיזית של תיקון, צומחת התעוררות רוחנית — ובימי יאשיהו אף גילוי ספר התורה.'
    },
    {
      id:'sefer_torah',
      name_niqqud:'סֵפֶר הַתּוֹרָה',
      instances:[
        {unit:'ו', unitId:6, context:'חלקיהו הכהן מוצא "ספר התורה" במקדש'},
        {unit:'ו', unitId:6, context:'שפן קורא את הספר לפני יאשיהו'},
        {unit:'ו', unitId:6, context:'יאשיהו קורע את בגדיו'},
        {unit:'ו', unitId:6, context:'יאשיהו כורת ברית לפני ה׳ ומוחק כל עבודה זרה'}
      ],
      significance:'מציאת הספר היא נקודת מפנה דרמטית: ספר התורה אבד או נזנח עד שנשכח בבית ה׳. רק תשובתו המלאה של יאשיהו, המבוססת על מילות הספר, מרעידה את העם — ומדגישה את כוחו של טקסט כתוב מול זיכרון מתנדף.'
    },
    {
      id:'chag_hapesach',
      name_niqqud:'חַג הַפֶּסַח',
      instances:[
        {unit:'ו', unitId:6, context:'יאשיהו מצווה על העם לעשות פסח'},
        {unit:'ו', unitId:6, context:'"כי לא נעשה כפסח הזה מימי השפטים"'}
      ],
      significance:'הפסח של יאשיהו הוא שיא ההתחדשות הדתית הלאומית: חג שלא נעשה כראוי מאות שנים שב לקיומו המלא. הוא ממחיש שיאשיהו איננו רק מתקן מקדש אלא מחיה את זיכרון היסוד — יציאת מצרים — כחלק מהותי מזהות העם.'
    },
    {
      id:'haharsh_vehamasger',
      name_niqqud:'הֶחָרָשׁ וְהַמַּסְגֵּר',
      instances:[
        {unit:'ו', unitId:6, context:'בגלות יהויכין — נבוכדנצר מגלה עשרת אלפים'},
        {unit:'ו', unitId:6, context:'"לא נשאר זולת דלת עם הארץ"'}
      ],
      significance:'החרש והמסגר מסמלים את המעמד הבינוני העיר — האומנים שבהם תלויה הכלכלה הצבאית. הגליתם הופכת את יהודה לממלכה נטולת יכולת התנגדות, ומסמנת את ההכנה הסופית לחורבן.'
    },
    // items inserted incrementally
  ];

  function FilterChips({filter, setFilter}){
    return React.createElement('div', {className:'flex flex-wrap gap-1.5'},
      React.createElement('button', {onClick:()=>setFilter(0), className:'px-3 py-1.5 rounded-lg text-xs font-bold '+(filter===0?'tab-active':'card')}, 'הכל'),
      UNITS.map(u => React.createElement('button', {key:u.id, onClick:()=>setFilter(u.id), className:'px-3 py-1.5 rounded-lg text-xs font-bold '+(filter===u.id?'tab-active':'card')}, 'יחידה '+u.num))
    );
  }

  function TopicCard({t, isOpen, onToggle, gotoUnit}){
    return React.createElement('div', {className:'card rounded-2xl p-4 text-right'},
      React.createElement('button', {type:'button', onClick:onToggle, className:'w-full text-right block'},
        React.createElement('h3', {className:'font-display text-lg font-bold text-amber-200'}, t.title),
        t.intro && React.createElement('p', {className:'text-amber-100/80 text-sm mt-1.5 leading-relaxed'}, t.intro),
        t.unit_coverage && React.createElement('div', {className:'flex flex-wrap gap-1 mt-2'},
          t.unit_coverage.map(uId => {
            const u = UNITS.find(x=>x.id===uId);
            return u ? React.createElement('span', {key:uId, className:'text-[10px] px-2 py-0.5 rounded-full bg-amber-700/30 text-amber-200'}, "יח' "+u.num) : null;
          })
        )
      ),
      isOpen && React.createElement('div', {className:'mt-3 pt-3 border-t border-amber-700/30 space-y-3'},
        t.key_instances && t.key_instances.length>0 && React.createElement('div', null,
          React.createElement('div', {className:'text-xs font-bold text-amber-300 mb-1'}, '📌 דוגמאות מהספר'),
          React.createElement('ul', {className:'space-y-1.5 text-sm'},
            t.key_instances.map((ki,i)=>React.createElement('li', {key:i},
              React.createElement('button', {type:'button', onClick:()=>gotoUnit(ki.unitId), className:'text-amber-200 hover:underline text-right'},
                '• ' + ki.label + (ki.unit?' (יחידה '+ki.unit+')':'')
              )
            ))
          )
        ),
        t.questions && t.questions.length>0 && React.createElement('div', null,
          React.createElement('div', {className:'text-xs font-bold text-amber-300 mb-1'}, '💭 שאלות לדיון'),
          React.createElement('ol', {className:'list-decimal pr-5 space-y-1 text-sm text-amber-100/90'},
            t.questions.map((q,i)=>React.createElement('li', {key:i}, q))
          )
        )
      )
    );
  }

  function ItemCard({it, isOpen, onToggle, gotoUnit}){
    const count = (it.instances||[]).length;
    return React.createElement('div', {className:'card rounded-2xl p-4 text-right'},
      React.createElement('button', {type:'button', onClick:onToggle, className:'w-full text-right block'},
        React.createElement('div', {className:'flex items-center justify-between gap-2'},
          React.createElement('h3', {className:'font-display text-base font-bold text-amber-200 hebrew'}, it.name_niqqud || it.name),
          count>0 && React.createElement('span', {className:'text-[10px] px-2 py-0.5 rounded-full bg-amber-700/30 text-amber-200 shrink-0'}, count+' הופעות')
        )
      ),
      isOpen && React.createElement('div', {className:'mt-3 pt-3 border-t border-amber-700/30 space-y-2'},
        it.instances && it.instances.length>0 && React.createElement('ul', {className:'space-y-1.5 text-sm'},
          it.instances.map((ins,i)=>React.createElement('li', {key:i},
            React.createElement('button', {type:'button', onClick:()=>gotoUnit(ins.unitId), className:'text-amber-200 hover:underline text-right'},
              '• יחידה '+(ins.unit||'')+' — '+ins.context
            )
          ))
        ),
        it.significance && React.createElement('p', {className:'text-xs text-amber-100/80 leading-relaxed pt-1 border-t border-amber-700/20 mt-2'},
          React.createElement('strong', {className:'text-amber-300'}, 'משמעות: '),
          it.significance
        )
      )
    );
  }

  function BreadthPage(props){
    const setRoute = (props && props.setRoute) || (typeof window!=='undefined' ? window.__setRoute : null);
    const topics = (window.BREADTH_DATA && window.BREADTH_DATA.length) ? window.BREADTH_DATA : BREADTH_FALLBACK;
    const items = (window.RECURRING_ITEMS_DATA && window.RECURRING_ITEMS_DATA.length) ? window.RECURRING_ITEMS_DATA : RECURRING_FALLBACK;
    const [filter, setFilter] = useState(0);
    const [openTopic, setOpenTopic] = useState(null);
    const [openItem, setOpenItem] = useState(null);

    const filteredTopics = useMemo(()=> filter===0 ? topics : topics.filter(t => (t.unit_coverage||[]).includes(filter)), [filter, topics]);
    const filteredItems = useMemo(()=> filter===0 ? items : items.filter(i => (i.instances||[]).some(inst => inst.unitId === filter)), [filter, items]);

    const gotoUnit = id => { if (setRoute && id) setRoute({page:'unit', unitId:id}); };

    return React.createElement('div', {className:'space-y-6 p-2'},
      React.createElement('div', null,
        React.createElement('h1', {className:'font-display text-2xl md:text-3xl font-bold text-amber-300'}, '🌐 נושאי רוחב במיקוד'),
        React.createElement('p', {className:'text-amber-100/70 text-sm mt-1'}, '7 נושאי רוחב + חפצים וביטויים חוזרים לאורך ספר מלכים')
      ),
      React.createElement(FilterChips, {filter, setFilter}),
      React.createElement('section', {className:'space-y-3'},
        React.createElement('h2', {className:'font-display text-xl font-bold text-amber-200'}, '📖 שבעת נושאי הרוחב'),
        filteredTopics.length === 0
          ? React.createElement('div', {className:'card rounded-xl p-6 text-center text-amber-100/70'}, 'אין נושא רוחב מתאים לסינון זה')
          : React.createElement('div', {className:'grid grid-cols-1 md:grid-cols-2 gap-3'},
              filteredTopics.map(t => React.createElement(TopicCard, {
                key:t.id, t:t, isOpen:openTopic===t.id,
                onToggle:()=>setOpenTopic(openTopic===t.id?null:t.id), gotoUnit
              }))
            )
      ),
      React.createElement('section', {className:'space-y-3'},
        React.createElement('h2', {className:'font-display text-xl font-bold text-amber-200'}, '📿 חפצים וביטויים חוזרים'),
        filteredItems.length === 0
          ? React.createElement('div', {className:'card rounded-xl p-6 text-center text-amber-100/70'}, 'יוצג ברגע שהנתונים ייטענו')
          : React.createElement('div', {className:'grid grid-cols-1 md:grid-cols-2 gap-3'},
              filteredItems.map(it => React.createElement(ItemCard, {
                key:it.id, it:it, isOpen:openItem===it.id,
                onToggle:()=>setOpenItem(openItem===it.id?null:it.id), gotoUnit
              }))
            )
      )
    );
  }

  window.BreadthPage = BreadthPage;
})();
