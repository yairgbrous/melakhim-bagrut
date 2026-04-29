/* =========================================================================
   name-resolver.js (?v=8000)
   ---------------------------------------------------------------------------
   Global Hebrew display-name resolver.
     1. Hard override map __DIRECT_HEBREW_LABELS__ (curated Hebrew with
        niqqud). Lookup is case-insensitive and tolerates hyphen↔underscore
        variants so chip ids in either form resolve.
     2. Flat labels map in __ENTITY_ALIASES__.labels (data/_id-aliases.js).
     3. Scan entity data stores for the id.
     4. Per-bucket alias redirects (event/place/character/king).
     5. Humanized id (last-resort fallback).
   ========================================================================= */
window.__DIRECT_HEBREW_LABELS__ = window.__DIRECT_HEBREW_LABELS__ || {};
Object.assign(window.__DIRECT_HEBREW_LABELS__, {
  // Solomon-era scenes
  "mishpat_shlomo":           "מִשְׁפַּט שְׁלֹמֹה",
  "mishpat-shlomo":           "מִשְׁפַּט שְׁלֹמֹה",
  "solomon_dream":            "חֲלוֹם שְׁלֹמֹה בְּגִבְעוֹן",
  "solomon-dream":            "חֲלוֹם שְׁלֹמֹה בְּגִבְעוֹן",
  "solomon_coronation":       "הַמְלָכַת שְׁלֹמֹה",
  "solomon-coronation":       "הַמְלָכַת שְׁלֹמֹה",
  "achiya_prophecy":          "נְבוּאַת אֲחִיָּה הַשִּׁילוֹנִי",
  "achiya-prophecy":          "נְבוּאַת אֲחִיָּה הַשִּׁילוֹנִי",
  "sheva_visit":              "בִּקּוּר מַלְכַּת שְׁבָא",
  "sheva-visit":              "בִּקּוּר מַלְכַּת שְׁבָא",
  "temple_dedication":        "חֲנֻכַּת בֵּית הַמִּקְדָּשׁ",
  "temple-dedication":        "חֲנֻכַּת בֵּית הַמִּקְדָּשׁ",

  // Places
  "gichon":                   "גִּיחוֹן",
  "kodesh_hakodashim":        "קֹדֶשׁ הַקֳּדָשִׁים",
  "kodesh-hakodashim":        "קֹדֶשׁ הַקֳּדָשִׁים",

  // Characters / titles
  "navi_zaken_beit_el":       "נָבִיא זָקֵן מִבֵּית אֵל",
  "navi-zaken-beit-el":       "נָבִיא זָקֵן מִבֵּית אֵל",
  "ish_haelohim_yehuda":      "אִישׁ הָאֱלֹהִים מִיהוּדָה",
  "ish-haelohim-yehuda":      "אִישׁ הָאֱלֹהִים מִיהוּדָה",
  "ben_hadad":                "בֶּן הֲדַד",
  "ben-hadad":                "בֶּן הֲדַד",
  "shemaya_ish_haelohim":     "שְׁמַעְיָה אִישׁ הָאֱלֹהִים",
  "shemaya-ish-haelohim":     "שְׁמַעְיָה אִישׁ הָאֱלֹהִים",
  "yehu_ben_chanani":         "יֵהוּא בֶּן חֲנָנִי",
  "yehu-ben-chanani":         "יֵהוּא בֶּן חֲנָנִי",
  "david":                    "דָּוִד הַמֶּלֶךְ",
  "natan":                    "נָתָן הַנָּבִיא",
  "tzadok":                   "צָדוֹק הַכֹּהֵן",
  "benayahu":                 "בְּנָיָהוּ בֶּן יְהוֹיָדָע",
  "achiya":                   "אֲחִיָּה הַשִּׁילוֹנִי",
  "chiram":                   "חִירָם מֶלֶךְ צוֹר",
  "chuldah":                  "חֻלְדָּה הַנְּבִיאָה",
  "chilkiyahu":               "חִלְקִיָּהוּ הַכֹּהֵן",
  "shafan":                   "שָׁפָן הַסּוֹפֵר",
  "yehoyada":                 "יְהוֹיָדָע הַכֹּהֵן",
  "michayahu":                "מִיכָיְהוּ בֶּן יִמְלָה",
  "shemaya":                  "שְׁמַעְיָה אִישׁ הָאֱלֹהִים",
  "yona":                     "יוֹנָה בֶּן אֲמִתַּי",
  "gedalya":                  "גְּדַלְיָה בֶּן אֲחִיקָם",
  "ravshakeh":                "רַבְשָׁקֵה",
  "paro_neko":                "פַּרְעֹה נְכֹה",
  "paro-neko":                "פַּרְעֹה נְכֹה",
  "etbaal":                   "אֶתְבַּעַל מֶלֶךְ צִידוֹן",
  "rezin":                    "רְצִין מֶלֶךְ אֲרָם",
  "sargon":                   "סַרְגוֹן מֶלֶךְ אַשּׁוּר",
  "sua":                      "סוֹא מֶלֶךְ מִצְרַיִם",
  "malkat_shva":              "מַלְכַּת שְׁבָא",
  "malkat-shva":              "מַלְכַּת שְׁבָא",
  "tzarfatit":                "אַלְמָנַת צָרְפַת",
  // Places
  "beer_sheva":               "בְּאֵר שֶׁבַע",
  "beer-sheva":               "בְּאֵר שֶׁבַע",
  "dothan":                   "דֹּתָן",
  "gibbeton":                 "גִּבְּתוֹן",
  "gozan":                    "גּוֹזָן",
  "har_hamashchit":           "הַר הַמַּשְׁחִית",
  "har-hamashchit":           "הַר הַמַּשְׁחִית",
  "lakhish":                  "לָכִישׁ",
  "madai":                    "מָדַי",
  "nachal_kishon":            "נַחַל קִישׁוֹן",
  "nachal-kishon":            "נַחַל קִישׁוֹן",
  "tzarfat":                  "צָרְפַת",
  "yam_hamelach":             "יָם הַמֶּלַח",
  "yam-hamelach":             "יָם הַמֶּלַח",
  "yarden":                   "הַיַּרְדֵּן",
  "chavor":                   "חָבוֹר",
  "chorev":                   "חוֹרֵב",
  // Events / scenes that appear in turning_points chips
  "split_kingdom":            "פִּלּוּג הַמַּמְלָכָה",
  "split-kingdom":            "פִּלּוּג הַמַּמְלָכָה",
  "golden_calves":            "עֶגְלֵי הַזָּהָב",
  "golden-calves":            "עֶגְלֵי הַזָּהָב",
  "carmel_confrontation":     "עִמּוּת הַר הַכַּרְמֶל",
  "carmel-confrontation":     "עִמּוּת הַר הַכַּרְמֶל",
  "chorev_revelation":        "הִתְגַּלּוּת בְּחוֹרֵב",
  "chorev-revelation":        "הִתְגַּלּוּת בְּחוֹרֵב",
  "chattat_yarovam":          "חַטֹּאת יָרָבְעָם",
  "chattat-yarovam":          "חַטֹּאת יָרָבְעָם",
  "navot_vineyard":           "כֶּרֶם נָבוֹת",
  "navot-vineyard":           "כֶּרֶם נָבוֹת",
  "ramot_gilead_battle":      "קְרַב רָמוֹת גִּלְעָד",
  "ramot-gilead-battle":      "קְרַב רָמוֹת גִּלְעָד",
  "elijah_ascension":         "עֲלִיַּת אֵלִיָּהוּ",
  "elijah-ascension":         "עֲלִיַּת אֵלִיָּהוּ",
  "house_extermination":      "הַשְׁמָדַת בֵּית אַחְאָב",
  "house-extermination":      "הַשְׁמָדַת בֵּית אַחְאָב",
  "samaria_fall":             "נְפִילַת שׁוֹמְרוֹן",
  "samaria-fall":             "נְפִילַת שׁוֹמְרוֹן",
  "temple_destruction":       "חֻרְבַּן הַמִּקְדָּשׁ",
  "temple-destruction":       "חֻרְבַּן הַמִּקְדָּשׁ",
  "shishak_invasion":         "פְּלִישַׁת שִׁישָׁק",
  "shishak-invasion":         "פְּלִישַׁת שִׁישָׁק",
  "asa_baasha_war":           "מִלְחֶמֶת אָסָא וּבַעְשָׁא",
  "asa-baasha-war":           "מִלְחֶמֶת אָסָא וּבַעְשָׁא",
  "zimri_coup":               "הֲפִיכַת זִמְרִי",
  "zimri-coup":               "הֲפִיכַת זִמְרִי",
  "drought":                  "בַּצֹּרֶת",
  "fire_from_heaven":         "אֵשׁ מִן הַשָּׁמַיִם",
  "fire-from-heaven":         "אֵשׁ מִן הַשָּׁמַיִם",
  "quiet_voice":              "קוֹל דְּמָמָה דַקָּה",
  "quiet-voice":              "קוֹל דְּמָמָה דַקָּה",
  "twofold_spirit":           "פִּי שְׁנַיִם בְּרוּחַ",
  "twofold-spirit":           "פִּי שְׁנַיִם בְּרוּחַ",
  "youth_counsel":            "עֲצַת הַיְלָדִים",
  "youth-counsel":            "עֲצַת הַיְלָדִים",
  "elders_counsel":           "עֲצַת הַזְּקֵנִים",
  "elders-counsel":           "עֲצַת הַזְּקֵנִים",
  "bronze_shields":           "צִנֵּי הַנְּחֹשֶׁת",
  "bronze-shields":           "צִנֵּי הַנְּחֹשֶׁת",
  "gold_shields":             "צִנֵּי הַזָּהָב",
  "gold-shields":             "צִנֵּי הַזָּהָב",
  "royal_rescue":             "הַצָּלַת בֶּן הַמֶּלֶךְ",
  "royal-rescue":             "הַצָּלַת בֶּן הַמֶּלֶךְ",
  "dogs_eating_blood":        "כְּלָבִים לוֹקְקִים אֶת הַדָּם",
  "dogs-eating-blood":        "כְּלָבִים לוֹקְקִים אֶת הַדָּם",
  "angel_plague":             "מַכַּת הַמַּלְאָךְ",
  "angel-plague":             "מַכַּת הַמַּלְאָךְ",
  "miraculous_deliverance":   "הַצָּלָה נִסִּית",
  "miraculous-deliverance":   "הַצָּלָה נִסִּית",
  "divine_intervention":      "הִתְעָרְבוּת אֱלֹהִית",
  "divine-intervention":      "הִתְעָרְבוּת אֱלֹהִית",
  "lying_spirit":             "רוּחַ שֶׁקֶר",
  "lying-spirit":             "רוּחַ שֶׁקֶר",
  "false_vs_true_prophecy":   "נְבוּאַת אֱמֶת מוּל נְבוּאַת שֶׁקֶר",
  "false-vs-true-prophecy":   "נְבוּאַת אֱמֶת מוּל נְבוּאַת שֶׁקֶר",
  "prophecy_fulfilled":       "הִתְגַּשְּׁמוּת הַנְּבוּאָה",
  "prophecy-fulfilled":       "הִתְגַּשְּׁמוּת הַנְּבוּאָה",
  "leadership_failure":       "כִּשְׁלוֹן מַנְהִיגוּת",
  "leadership-failure":       "כִּשְׁלוֹן מַנְהִיגוּת",
  "coup":                     "הֲפִיכָה",
  "taxation":                 "עוֹל הַמַּס",
  "tribute":                  "מַס",
  "reed_support":             "מִשְׁעֶנֶת קָנֶה רָצוּץ",
  "reed-support":             "מִשְׁעֶנֶת קָנֶה רָצוּץ",
  "three_anointings":         "שָׁלוֹשׁ הַמְּשִׁיחוֹת",
  "three-anointings":         "שָׁלוֹשׁ הַמְּשִׁיחוֹת",
  "book_found":               "סֵפֶר הַתּוֹרָה הַנִּמְצָא",
  "book-found":               "סֵפֶר הַתּוֹרָה הַנִּמְצָא",
  "churban":                  "חֻרְבָּן",
  "galut":                    "גָּלוּת",
  "tisha_beav":               "תִּשְׁעָה בְּאָב",
  "tisha-beav":               "תִּשְׁעָה בְּאָב",
  "eliyahu_drought":          "בַּצֹּרֶת אֵלִיָּהוּ",
  "eliyahu-drought":          "בַּצֹּרֶת אֵלִיָּהוּ",
  "eliyahu_mantle":           "אַדֶּרֶת אֵלִיָּהוּ",
  "eliyahu-mantle":           "אַדֶּרֶת אֵלִיָּהוּ",
  "foreign_nations_and_israel": "אֻמּוֹת הָעוֹלָם וְיִשְׂרָאֵל",
  "idolatry_vs_monotheism":   "עֲבוֹדָה זָרָה מוּל יִחוּד ה׳",
  "prophet_and_king":         "נָבִיא וּמֶלֶךְ",

  // Breadth themes
  "double_causality":         "סִבָּתִיוּת כְּפוּלָה",
  "double-causality":         "סִבָּתִיוּת כְּפוּלָה",
  "wisdom_motif":             "מוֹטִיב הַחָכְמָה",
  "wisdom-motif":             "מוֹטִיב הַחָכְמָה",
  "kingship_and_covenant":    "מְלוּכָה וּבְרִית",
  "kingship-and-covenant":    "מְלוּכָה וּבְרִית",
  "temple_and_shechina":      "מִקְדָּשׁ וּשְׁכִינָה",
  "temple-and-shechina":      "מִקְדָּשׁ וּשְׁכִינָה",
  "prophets_vs_kings":        "נְבִיאִים מוּל מְלָכִים",
  "prophets-vs-kings":        "נְבִיאִים מוּל מְלָכִים",
  "idolatry_and_justice":     "עֲבוֹדָה זָרָה וְצֶדֶק",
  "idolatry-and-justice":     "עֲבוֹדָה זָרָה וְצֶדֶק",
  "prayer_and_repentance":    "תְּפִלָּה וּתְשׁוּבָה",
  "prayer-and-repentance":    "תְּפִלָּה וּתְשׁוּבָה",
  "divine_election":          "בְּחִירָה אֱלוֹהִית",
  "divine-election":          "בְּחִירָה אֱלוֹהִית",

  // Recurring items / motifs
  "torn_garment":             "קְרִיעַת הַבֶּגֶד",
  "torn-garment":             "קְרִיעַת הַבֶּגֶד",
  "royal_mule":               "פִּרְדַּת הַמֶּלֶךְ",
  "royal-mule":               "פִּרְדַּת הַמֶּלֶךְ",
  "golden_age":               "תּוֹר הַזָּהָב",
  "golden-age":               "תּוֹר הַזָּהָב",
  "foreign_wives":            "נָשִׁים נָכְרִיּוֹת",
  "foreign-wives":            "נָשִׁים נָכְרִיּוֹת",
  "dynastic_promise":         "הַבְטָחַת הַשּׁוֹשֶׁלֶת",
  "dynastic-promise":         "הַבְטָחַת הַשּׁוֹשֶׁלֶת",
  "wisdom_gift":              "מַתְּנַת הַחָכְמָה",
  "wisdom-gift":              "מַתְּנַת הַחָכְמָה",

  // Exam jargon / question types
  "mi_amar_lemi":             "מִי אָמַר לְמִי",
  "mi-amar-lemi":             "מִי אָמַר לְמִי",
  "mi_natan_lemi":            "מִי נָתַן לְמִי",
  "mi-natan-lemi":            "מִי נָתַן לְמִי",
  "mi_eifa_eyfo":             "מִי אֵיפֹה",
  "mi-eifa-eyfo":             "מִי אֵיפֹה",
  "sibah_metzeget":           "סִבָּה וְתוֹצָאָה",
  "cause_effect":             "סִבָּה וְתוֹצָאָה",
  "cause-effect":             "סִבָּה וְתוֹצָאָה",
  "compare":                  "הַשְׁוָאָה",
  "analysis":                 "נִיתוּחַ",
  "context":                  "הֶקְשֵׁר",
  "open":                     "שְׁאֵלָה פְּתוּחָה",
  "citation":                 "צִיטוּט",

  // Section codes
  "theme":                    "נוֹשֵׂא רוֹחַב",
  "breadth":                  "נוֹשֵׂא רוֹחַב",
  "rohav":                    "נוֹשֵׂא רוֹחַב",
  "bekiut":                   "בְּקִיאוּת",
  "yeda":                     "יְדִיעָה"
});

window.resolveDisplayName = function(id) {
  if (!id) return '';
  const direct = window.__DIRECT_HEBREW_LABELS__ || {};

  // 1. Hard override — try as-is, lowercased, and hyphen↔underscore swap.
  const norm = String(id).toLowerCase();
  if (direct[id])   return direct[id];
  if (direct[norm]) return direct[norm];
  const swap = norm.indexOf('_') >= 0 ? norm.replace(/_/g, '-') : norm.replace(/-/g, '_');
  if (swap !== norm && direct[swap]) return direct[swap];

  const aliases = window.__ENTITY_ALIASES__ || {};

  // 2. Flat labels map under __ENTITY_ALIASES__.labels.
  const labels = aliases.labels || null;
  if (labels) {
    if (labels[id])   return labels[id];
    if (labels[norm]) return labels[norm];
    if (swap !== norm && labels[swap]) return labels[swap];
  }

  // 3. Scan entity data stores (try id, hyphen↔underscore swap).
  const stores = [
    'CHARACTERS_DATA',
    'EVENTS_DATA',
    'PLACES_DATA',
    'KINGS_DATA',
    'RECURRING_ITEMS_DATA',
    'BREADTH_TOPICS_DATA',
    'QUOTES_DATA'
  ];
  const tryIds = swap !== id ? [id, swap] : [id];
  for (const s of stores) {
    const arr = window[s];
    if (!Array.isArray(arr)) continue;
    for (const tryId of tryIds) {
      const found = arr.find(e => e && e.id === tryId);
      if (found) {
        return found.name_niqqud || found.name || found.heading
            || found.title_niqqud || found.title
            || String(tryId).replace(/[_-]/g, ' ');
      }
    }
  }

  // 4. Per-bucket alias redirects (event/place/character/king).
  const BUCKETS = ['event', 'place', 'character', 'king'];
  for (const b of BUCKETS) {
    const m = aliases[b];
    if (!m || typeof m !== 'object') continue;
    let aliased = null;
    if (Object.prototype.hasOwnProperty.call(m, id))      aliased = m[id];
    else if (Object.prototype.hasOwnProperty.call(m, swap)) aliased = m[swap];
    if (typeof aliased === 'string' && aliased && aliased !== id) {
      for (const s of stores) {
        const arr = window[s];
        if (!Array.isArray(arr)) continue;
        const found = arr.find(e => e && e.id === aliased);
        if (found) {
          return found.name_niqqud || found.name || found.heading
              || found.title_niqqud || found.title
              || String(aliased).replace(/[_-]/g, ' ');
        }
      }
    }
  }

  // 5. Final fallback: humanized id (kept as a string — never throws).
  return String(id).replace(/[_-]/g, ' ');
};
