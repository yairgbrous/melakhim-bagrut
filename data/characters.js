// data/characters.js
// דמויות מרכזיות בספר מלכים — גרסה מינימלית לבגרות 2551.
// טוקנים {{type:id|display}} מיועדים לרינדור על ידי <EntityLink>.

export const characters = [
  {
    id: "shlomo",
    name: "שְׁלֹמֹה",
    role: "king",
    kingdom: "ישראל המאוחדת",
    era: "970–931 לפנה\"ס",
    bio:
      "{{king:shlomo|שלמה}}, בנם של {{king:david|דוד}} ו{{character:bat_sheva|בת שבע}}, עלה למלוכה סביב {{date:970|970 לפנה\"ס}} ומגלם את {{motif:golden_age|עידן הזהב}} של {{event:united_kingdom|הממלכה המאוחדת}}. ב{{event:solomon_dream|חלום גבעון}} ב{{place:givon|גבעון}} ביקש {{verse:1K-3-9|״לב שומע לשפוט״}} ובכך חיבר את שמו ל{{motif:wisdom|מוטיב החכמה}}. {{event:solomon_judgment|משפט שלמה}} המחיש זאת בפועל, וביקור {{character:queen_sheba|מלכת שבא}} אישר את תהילתו הבינלאומית. הישגו המכונן היה {{event:temple_dedication|חנוכת בית המקדש}} ב{{place:jerusalem|ירושלים}}, שבו שכנה {{motif:shechina|השכינה}}. בזקנתו נשיו הנוכריות הטו את לבבו ל{{motif:idolatry|עבודה זרה}} והקים במות; לכן {{prophet:achiya|אחיה השילוני}} ניבא את {{event:split_kingdom|פילוג הממלכה}}. בזכות {{motif:dynastic_promise|הבטחת בית דוד}} נותר לזרעו שבט אחד. מותו סביב {{date:931|931 לפנה\"ס}} פותח את {{unit:unit_a|יחידה א}}.",
    tags: ["חכמה", "מקדש", "פילוג"],
  },
  {
    id: "rehovoam",
    name: "רְחַבְעָם",
    role: "king",
    kingdom: "יהודה",
    era: "931–913 לפנה\"ס",
    bio:
      "{{king:rehovoam|רחבעם}} בן {{king:shlomo|שלמה}} הוא מלך יהודה הראשון לאחר {{event:split_kingdom|פילוג הממלכה}} סביב {{date:931|931 לפנה\"ס}}. בכינוס {{place:shechem|שכם}} דרשו הזקנים הקלת {{motif:taxation|עול המס}}; רחבעם דחה את {{motif:elders_counsel|עצת הזקנים}} וקיבל את {{motif:youth_counsel|עצת הילדים}}, ואמר {{verse:1K-12-14|״אבי הכביד עולכם ואני אוסיף על עולכם״}}. עשרת השבטים פרשו בקריאת {{verse:1K-12-16|״מה לנו חלק בדוד״}} והמליכו את {{king:yarovam|ירבעם}}. רחבעם ניסה להילחם, אך {{prophet:shemaya|שמעיה איש האלוהים}} עצרו בדבר ה׳ {{verse:1K-12-24|״לא תילחמו כי מאתי היה הדבר״}}. בימיו עלה {{character:shishak|שישק מלך מצרים}} ב{{date:925|925 לפנה\"ס}} ובזז את {{place:jerusalem|ירושלים}}. דמותו מסמלת {{motif:leadership_failure|כשל מנהיגותי}}. {{unit:unit_b|יחידה ב: פילוג הממלכה}}.",
    tags: ["פילוג", "יהודה", "שכם"],
  },
  {
    id: "yarovam",
    name: "יָרָבְעָם בֶּן־נְבָט",
    role: "king",
    kingdom: "ישראל",
    era: "931–910 לפנה\"ס",
    bio:
      "{{king:yarovam|ירבעם בן נבט}} היה עבדו של {{king:shlomo|שלמה}}, וקיבל מ{{prophet:achiya|אחיה השילוני}} את {{motif:torn_garment|קריעת המעיל לעשרה קרעים}} — הבטחה על עשרת השבטים. לאחר {{event:split_kingdom|פילוג הממלכה}} ב{{place:shechem|שכם}} סביב {{date:931|931 לפנה\"ס}} הוכתר מלך {{place:israel_kingdom|ממלכת ישראל}}. מחשש שהעם יעלה ל{{place:jerusalem|ירושלים}} הקים {{motif:golden_calves|עגלי זהב}} ב{{place:beit_el|בית־אל}} וב{{place:dan|דן}} וקרא {{verse:1K-12-28|״הנה אלוהיך ישראל אשר העלוך מארץ מצרים״}}. הוא שינה את מועד החג וכיהן כוהנים מחוץ ל{{motif:levitical_priesthood|שבט לוי}}. {{character:man_of_god_judah|איש האלוהים מיהודה}} ניבא את חורבן המזבח בימי {{king:yoshiyahu|יאשיהו}}. {{motif:chattat_yarovam|״חטאת ירבעם״}} הפכה לנוסחת ההרשעה של כל מלכי ישראל אחריו, עד {{event:samaria_fall|חורבן שומרון}} ב{{date:722|722 לפנה\"ס}}. {{unit:unit_b|יחידה ב}}.",
    tags: ["פילוג", "עגלי זהב", "ישראל"],
  },
  {
    id: "achav",
    name: "אַחְאָב",
    role: "king",
    kingdom: "ישראל",
    era: "874–853 לפנה\"ס",
    bio:
      "{{king:achav|אחאב}} בן {{king:omri|עמרי}} מלך {{place:israel_kingdom|ישראל}} ב{{date:874|874–853 לפנה\"ס}} ממרכזי השלטון ב{{place:shomron|שומרון}} וב{{place:yizrael|יזרעאל}}. הוא נשא את {{character:izevel|איזבל}} בת מלך הצידונים והכניס את {{motif:baal_worship|פולחן הבעל והאשרה}}. יריבו המרכזי {{prophet:eliyahu|אליהו}} הכריז {{motif:drought|בצורת}}, ובעימות ב{{place:har_carmel|הר הכרמל}} נפלו נביאי הבעל ב{{event:carmel_confrontation|מעמד הר הכרמל}} והעם קרא {{verse:1K-18-39|״ה׳ הוא האלוהים״}}. ב{{event:navot_vineyard|פרשת כרם נבות}} שיתף אחאב פעולה ברצח ובשוד, ואליהו ניבא לו {{verse:1K-21-19|״הרצחת וגם ירשת״}}. לאחר {{motif:repentance|הכנעתו}} נדחתה הגזרה לבנו. מותו בקרב {{place:ramot_gilad|רמות גלעד}} בא בעקבות נבואת {{prophet:michayahu|מיכיהו בן ימלה}} על רוח שקר בפי נביאי החצר. {{unit:unit_c|יחידה ג: מחזור אליהו}}.",
    tags: ["בעל", "כרם נבות", "כרמל"],
  },
  {
    id: "izevel",
    name: "אִיזֶבֶל",
    role: "queen",
    kingdom: "ישראל",
    era: "ימי אחאב ויהורם",
    bio:
      "{{character:izevel|איזבל}}, בתו של {{character:etbaal|אתבעל מלך צידונים}} ואשתו של {{king:achav|אחאב}}, מגלמת ב{{place:israel_kingdom|ממלכת ישראל}} את {{motif:foreign_influence|ההשפעה הכנענית הזרה}}. היא קידמה את {{motif:baal_worship|פולחן הבעל והאשרה}}, פרנסה מאות נביאי בעל על שולחנה, ו{{motif:persecution_prophets|רדפה את נביאי ה׳}}. לאחר {{event:carmel_confrontation|הר הכרמל}} איימה על {{prophet:eliyahu|אליהו}} ושלחה אותו אל {{place:chorev|חורב}}. ב{{event:navot_vineyard|פרשת כרם נבות}} היא היוזמת: כתבה ספרים בשם {{king:achav|אחאב}}, חתמה בחותמו, העמידה עדי שקר ודאגה לסקילת {{character:navot|נבות}}. {{prophet:eliyahu|אליהו}} ניבא את אחריתה: {{verse:2K-9-10|״הכלבים יאכלו את איזבל בחלק יזרעאל״}}. בבוא {{king:yehu|יהוא}} ל{{place:yizrael|יזרעאל}} סביב {{date:842|842 לפנה\"ס}} הושלכה מחלונה ונאכלה בכלבים, בקיום מובהק של {{motif:prophecy_fulfilled|נבואה שמתממשת}}. {{unit:unit_c|יחידה ג}}.",
    tags: ["בעל", "כרם נבות", "נבואה"],
  },
];

export default characters;
