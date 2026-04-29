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
