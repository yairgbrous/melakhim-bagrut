// data/flashcards.js
// כרטיסיות חזרה לבגרות 2551 — מושגים, פסוקים מרכזיים, מלכים, אירועים.
// Schema: { id, front, back, category, difficulty: 1..3, tags[] }

export const flashcards = [
  // === פסוקי מפתח ===
  {
    id: "v-lev-shomea",
    front: "\"וְנָתַתָּ לְעַבְדְּךָ לֵב שֹׁמֵעַ לִשְׁפֹּט אֶת־עַמְּךָ\"",
    back: "בקשת שלמה בחלום גבעון — מלכים א׳ ג׳ ט. מבטא את החלפת בקשת עושר/ימים בבקשת חכמה לשפוט.",
    category: "verse",
    difficulty: 1,
    tags: ["שלמה", "חכמה", "גבעון"],
  },
  {
    id: "v-pos'chim",
    front: "\"עַד־מָתַי אַתֶּם פֹּסְחִים עַל־שְׁתֵּי הַסְּעִפִּים\"",
    back: "אליהו לעם בהר הכרמל — מלכים א׳ יח׳ כא. תוכחה על עמדה כפולה בין ה׳ לבעל.",
    category: "verse",
    difficulty: 1,
    tags: ["אליהו", "כרמל"],
  },
  {
    id: "v-kol-demama",
    front: "\"וְאַחַר הָאֵשׁ קוֹל דְּמָמָה דַקָּה\"",
    back: "התגלות ה׳ לאליהו בחורב — מלכים א׳ יט׳ יב. נבואה דרך שקט ולא דרך אותות רעש.",
    category: "verse",
    difficulty: 2,
    tags: ["אליהו", "חורב", "התגלות"],
  },
  {
    id: "v-haratsachta",
    front: "\"הֲרָצַחְתָּ וְגַם יָרָשְׁתָּ\"",
    back: "אליהו לאחאב בכרם נבות — מלכים א׳ כא׳ יט. תוכחה על רצח ושוד הנחלה.",
    category: "verse",
    difficulty: 1,
    tags: ["כרם נבות", "אחאב"],
  },
  {
    id: "v-adoney",
    front: "\"יְהוָה הוּא הָאֱלֹהִים, יְהוָה הוּא הָאֱלֹהִים\"",
    back: "קריאת העם בהר הכרמל — מלכים א׳ יח׳ לט.",
    category: "verse",
    difficulty: 1,
    tags: ["כרמל"],
  },
  {
    id: "v-avi-avi",
    front: "\"אָבִי אָבִי רֶכֶב יִשְׂרָאֵל וּפָרָשָׁיו\"",
    back: "קריאת אלישע כשעולה אליהו בסערה — מלכים ב׳ ב׳ יב. קיבל פי שניים ברוחו.",
    category: "verse",
    difficulty: 2,
    tags: ["אלישע", "אליהו", "סערה"],
  },
  {
    id: "v-hinneh-eloheycha",
    front: "\"הִנֵּה אֱלֹהֶיךָ יִשְׂרָאֵל אֲשֶׁר הֶעֱלוּךָ מֵאֶרֶץ מִצְרָיִם\"",
    back: "דברי ירבעם בעת הקמת עגלי הזהב — מלכים א׳ יב׳ כח. מזכיר את חטא העגל.",
    category: "verse",
    difficulty: 2,
    tags: ["ירבעם", "עגלים"],
  },
  {
    id: "v-ma-lanu",
    front: "\"מָה־לָנוּ חֵלֶק בְּדָוִד\"",
    back: "סיסמת הפילוג של שבעי בן בכרי ובני ישראל בשכם — מלכים א׳ יב׳ טז.",
    category: "verse",
    difficulty: 2,
    tags: ["פילוג", "רחבעם"],
  },

  // === מושגים/מקומות ===
  {
    id: "c-beit-el-dan",
    front: "בית־אל ודן",
    back: "שני מרכזי הפולחן שהקים ירבעם עם עגלי זהב כדי למנוע עלייה לירושלים (מל״א יב׳ כט).",
    category: "place",
    difficulty: 1,
    tags: ["ירבעם", "עבודה זרה"],
  },
  {
    id: "c-shchem",
    front: "שכם",
    back: "מקום כינוס העם למלוך את רחבעם — בו התרחש פילוג הממלכה (מל״א יב׳ א).",
    category: "place",
    difficulty: 2,
    tags: ["פילוג"],
  },
  {
    id: "c-har-carmel",
    front: "הר הכרמל",
    back: "זירת העימות בין אליהו לנביאי הבעל (מל״א יח). סמל לניצחון ה׳ על פולחן הבעל.",
    category: "place",
    difficulty: 1,
    tags: ["אליהו"],
  },
  {
    id: "c-yizrael",
    front: "יזרעאל",
    back: "עיר המלוכה של אחאב; מקום כרם נבות ומותה של איזבל.",
    category: "place",
    difficulty: 2,
    tags: ["אחאב", "איזבל", "נבות"],
  },
  {
    id: "c-shomron",
    front: "שומרון",
    back: "בירת ממלכת ישראל שייסד עמרי (מל״א טז׳ כד). נפלה לאשור ב־722 לפנה\"ס.",
    category: "place",
    difficulty: 2,
    tags: ["עמרי", "אשור"],
  },
  {
    id: "c-nekbat-hashiloach",
    front: "נקבת השילוח",
    back: "מנהרת מים שחצב חזקיהו כדי להזרים מי הגיחון לעיר בעת מצור סנחריב (מל״ב כ׳ כ).",
    category: "concept",
    difficulty: 2,
    tags: ["חזקיהו", "סנחריב"],
  },
  {
    id: "c-sefer-habrit",
    front: "ספר התורה שנמצא",
    back: "הספר שנמצא בבית המקדש בימי יאשיהו ושימש בסיס לרפורמה (מל״ב כב). מזוהה בדרך כלל עם ספר דברים.",
    category: "concept",
    difficulty: 3,
    tags: ["יאשיהו", "רפורמה"],
  },
  {
    id: "c-chutat-yarovam",
    front: "\"חטאת ירבעם\"",
    back: "ביטוי חוזר המציין את פולחן עגלי הזהב שמלכי ישראל המשיכו בו.",
    category: "concept",
    difficulty: 2,
    tags: ["ירבעם"],
  },
  {
    id: "c-bamot",
    front: "\"הבמות לא סרו\"",
    back: "ביטוי ביקורת על מלכי יהודה ה\"טובים\" שהשאירו את הבמות כמרכזי פולחן מחוץ למקדש.",
    category: "concept",
    difficulty: 2,
    tags: ["פולחן", "יהודה"],
  },

  // === מלכים — זיהוי ===
  {
    id: "k-omri",
    front: "מי ייסד את שומרון?",
    back: "עָמְרִי, אביו של אחאב — מלכים א׳ טז׳ כג–כח.",
    category: "king",
    difficulty: 2,
    tags: ["שומרון", "עמרי"],
  },
  {
    id: "k-yehu-mashiach",
    front: "מי המשיח את יהוא למלך?",
    back: "אחד \"מבני הנביאים\" בשליחות אלישע (מל״ב ט׳ א–י).",
    category: "king",
    difficulty: 2,
    tags: ["יהוא", "אלישע"],
  },
  {
    id: "k-chizkiyahu-teshua",
    front: "איך ניצלה ירושלים ממצור סנחריב?",
    back: "מגפה פגעה במחנה אשור — \"ויצא מלאך ה׳ ויכה במחנה אשור\" (מל״ב יט׳ לה).",
    category: "king",
    difficulty: 2,
    tags: ["חזקיהו", "סנחריב"],
  },
  {
    id: "k-yoshiyahu-death",
    front: "כיצד מת יאשיהו?",
    back: "נהרג בקרב במגידו מול פרעה נכה (מל״ב כג׳ כט).",
    category: "king",
    difficulty: 2,
    tags: ["יאשיהו", "מגידו"],
  },
  {
    id: "k-tzidkiyahu-end",
    front: "מה עלה בגורלו של צדקיהו?",
    back: "בניו נשחטו לעיניו, עיניו נוקרו והוא הוגלה לבבל (מל״ב כה׳ ז).",
    category: "king",
    difficulty: 2,
    tags: ["חורבן", "צדקיהו"],
  },

  // === נבואות ===
  {
    id: "n-achiya",
    front: "נבואת אחיה השילוני",
    back: "קורע מעילו לשנים־עשר קרעים, נותן עשרה לירבעם — סימן לקריעת הממלכה (מל״א יא׳ כט–לט).",
    category: "prophecy",
    difficulty: 2,
    tags: ["ירבעם", "פילוג"],
  },
  {
    id: "n-eliyahu-achav",
    front: "נבואת אליהו לאחאב",
    back: "\"במקום אשר לקקו הכלבים את דם נבות — ילקו הכלבים את דמך\" (מל״א כא׳ יט).",
    category: "prophecy",
    difficulty: 2,
    tags: ["נבות", "אחאב"],
  },
  {
    id: "n-chulda",
    front: "נבואת חולדה",
    back: "מנבאת רעה על ירושלים בעקבות חטאי מנשה, אך מבטיחה שיאשיהו ייאסף בשלום (מל״ב כב׳ טו–כ).",
    category: "prophecy",
    difficulty: 3,
    tags: ["יאשיהו", "חולדה"],
  },
];

export const flashcardCategories = [
  { id: "verse", label: "פסוקים" },
  { id: "concept", label: "מושגים" },
  { id: "place", label: "מקומות" },
  { id: "king", label: "מלכים" },
  { id: "prophecy", label: "נבואות" },
];

export function getFlashcardsByCategory(category) {
  if (!category || category === "all") return flashcards;
  return flashcards.filter((c) => c.category === category);
}

export function shuffle(deck) {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default flashcards;
