// data/unit-deep-summaries.js
// 6 סיכומים מעמיקים ליחידות ספר מלכים — בגרות 2551.
// Schema per entry: {unit, title, intro, turning_points: [{fact, participants[],
// places[], events[]}], significance, breadth_themes[], recurring_items[]}
// IDs מתאימים ל-data/kings.js, data/characters.js ו-data/events.js.

export const unitDeepSummaries = [
  {
    unit: 1,
    title: "מלכות שלמה",
    intro:
      "ספר מלכים פותח בימי זקנת דוד, כשאדוניהו בנו מנסה למלוך בלא ציווי אב. נתן הנביא ובת־שבע מבקשים מדוד שיממש את שבועתו, ושלמה נמשח בגיחון בידי צדוק הכהן ובניהו בן יהוידע, ורוכב על פרדת המלך כסימן לגיטימציה. לאחר צוואת דוד וחיסול היריבים הוא פונה לגבעון — הבמה הגדולה — ושם בחלום הלילה ה׳ מזמין אותו לשאול כל בקשה. שלמה מבקש ״לב שומע לשפוט״, וה׳ מוסיף לו עושר וכבוד, ובתנאי — אריכות ימים. משפט שתי הנשים מאמת את המתנה בעיני כל ישראל. שיא המלכות הוא בניית בית המקדש בשבע שנים (ובניית הארמון בשלוש־עשרה) וחנוכתו בטקס שבועי של מאות אלפי זבחים. מלכת שבא באה לנסותו בחידות ונדהמת מחכמתו ומעושרו. אך בסוף ימיו נישואיו לאלף נשים נוכריות מטים את לבו ל{{motif:idolatry|עבודה זרה}}, והוא מקים במות לכמוש ולמולך. בעקבות כך מזמן ה׳ לו שלושה אויבים — הדד האדומי, רזון בן אלידע וירבעם בן נבט — ומבטיח לקרוע לו את הממלכה ביד בנו, לא בחייו, בזכות דוד אביו.",
    turning_points: [
      {
        fact: "המלכת שלמה בגיחון בידי צדוק הכהן, נתן הנביא ובניהו בן יהוידע, על פרדת המלך דוד, ותקיעה בשופר",
        participants: ["shlomo", "david", "bat_sheva", "natan", "tzadok", "benayahu", "adoniyahu"],
        places: ["gichon", "jerusalem"],
        events: ["solomon_coronation"],
      },
      {
        fact: "חלום גבעון — בקשת לב שומע לשפוט ומתנת חכמה, עושר וכבוד; אריכות ימים מותנית בשמירת מצוות",
        participants: ["shlomo"],
        places: ["givon"],
        events: ["solomon_dream"],
      },
      {
        fact: "משפט שלמה בין שתי הנשים — ההוכחה הציבורית לחכמתו: ״חכמת אלהים בקרבו לעשות משפט״",
        participants: ["shlomo"],
        places: ["jerusalem"],
        events: ["mishpat_shlomo"],
      },
      {
        fact: "בנייה וחנוכת בית המקדש — שבע שנים, ענן כבוד ה׳ מילא את הבית, תפילת שלמה הגדולה",
        participants: ["shlomo", "chiram"],
        places: ["jerusalem", "mikdash", "kodesh_hakodashim"],
        events: ["temple_dedication"],
      },
      {
        fact: "ביקור מלכת שבא — ״אמת היה הדבר... הוספת חכמה וטוב אל השמועה״; 120 כיכר זהב ובשמים",
        participants: ["shlomo", "malkat_shva"],
        places: ["jerusalem", "sheva"],
        events: ["sheva_visit"],
      },
      {
        fact: "נשים נוכריות, הקמת במות לכמוש ולמולך, והטיית לב שלמה לעבודה זרה",
        participants: ["shlomo"],
        places: ["jerusalem", "har_hamashchit"],
        events: [],
      },
      {
        fact: "נבואת אחיה השילוני לירבעם — קריעת המעיל לשנים־עשר קרעים, עשרה לירבעם; גזרת הפילוג ביד בנו של שלמה",
        participants: ["achiya", "yarovam", "shlomo"],
        places: ["shilo"],
        events: ["achiya_prophecy"],
      },
    ],
    significance:
      "עידן הזהב של הממלכה המאוחדת — שיאה החומרי, הרוחני והבינלאומי של ישראל. שלמה הוא מודל למלך המשלב יראת ה׳ עם חכמה שלטונית; אך הוא גם אב־טיפוס לכשל — {{motif:foreign_wives|נשים נוכריות}} מטות את לבו, והדבר מוליד את הפילוג. בניית המקדש סוגרת את מחזור יציאת מצרים (480 שנה, מל״א ו׳ א) וקובעת את ירושלים כמרכז הפולחן. שיבוש הברית בסוף ימיו מצמיח את ציר העונש של הספר — נבואת אחיה תתממש מיד לאחר מותו, ו{{motif:dynastic_promise|הבטחת בית דוד}} תשמור לזרעו שבט אחד.",
    breadth_themes: ["kingship_and_covenant", "wisdom_motif", "temple_and_shechina", "double_causality"],
    recurring_items: ["wisdom_gift", "dynastic_promise", "foreign_wives", "golden_age", "royal_mule", "torn_garment"],
  },
];

export default unitDeepSummaries;
