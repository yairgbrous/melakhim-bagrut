const motifs = [
  {
    id: "torn_garment",
    label_nikud: "קְרִיעַת שִׂמְלָה",
    description_hebrew: "מוטיב קריעת הבגד כסמל לקריעת המלוכה ולחלוקת הממלכה.",
    all_occurrences: [
      {
        verse_ref: "מלכים א יא:ל",
        context_short: "אחיה השילוני קורע את שלמתו החדשה לשנים עשר קרעים."
      },
      {
        verse_ref: "מלכים א יא:לא",
        context_short: "נתינת עשרה שבטים לירבעם כסימן לקריעת הממלכה משלמה."
      }
    ],
    theological_significance_hebrew: "הקריעה מסמלת את עונש ה' על חטאי שלמה ואת חלוקת מלכות ישראל כגזירה אלוהית."
  },
  {
    id: "fire_from_heaven",
    label_nikud: "יְרִידַת אֵשׁ",
    description_hebrew: "ירידת אש מן השמים כאות אלוהי המאשר את הנביא או הקרבן.",
    all_occurrences: [
      {
        verse_ref: "מלכים א יח:לח",
        context_short: "אש ה' יורדת על מזבח אליהו בהר הכרמל ואוכלת את העולה."
      },
      {
        verse_ref: "מלכים ב א:י",
        context_short: "אליהו מוריד אש מן השמים על שרי החמישים של אחזיה."
      }
    ],
    theological_significance_hebrew: "האש מן השמים מבטאת את התגלות ה' ואת הכרעתו בין עובדיו לעובדי הבעל."
  },
  {
    id: "drought_and_rain",
    label_nikud: "בַּצֹּרֶת וּמָטָר",
    description_hebrew: "עצירת גשמים וירידתם כעונש וכשכר בברית בין ה' לעמו.",
    all_occurrences: [
      {
        verse_ref: "מלכים א יז:א",
        context_short: "אליהו נשבע שלא יהיה טל ומטר כי אם לפי דברו."
      },
      {
        verse_ref: "מלכים א יח:מה",
        context_short: "לאחר תפילת אליהו בכרמל יורד גשם גדול ומסתיים הבצורת."
      }
    ],
    theological_significance_hebrew: "הבצורת והגשם מבטאים את שליטת ה' בטבע וקשורים ישירות למעשי האומה ולנאמנותה לברית."
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = motifs;
}
