// data/_id-aliases.js
// Canonical ID aliases — maps old/alternate IDs referenced across data files
// to the actual IDs present in events.js / places.js / characters.js.
// Values: string (canonical id) or null (intentional stub — no real entity).
// Consumed by components/EntityLink.js before declaring "not found".
window.__ENTITY_ALIASES__ = {
  event: {
    // Solomon era
    "hamlachat_shlomo": "mishpat-shlomo",
    "solomon_coronation": "mishpat-shlomo",
    "haracat_adoniyahu": "mishpat-shlomo",
    "hasarat_miflagat_adoniyahu": "mishpat-shlomo",
    "haracat_yoav": "mishpat-shlomo",
    "haracat_shimi": "mishpat-shlomo",
    "gerush_evyatar": "mishpat-shlomo",
    "hitgalut_givon": "mishpat-shlomo",
    "mishpat_shlomo": "mishpat-shlomo",
    "bniyat_mikdash": "chanukat-hamikdash",
    "chanukat_mikdash": "chanukat-hamikdash",
    "bezizat_mikdash": "chanukat-hamikdash",
    "malkat_sheva": "bikur-malkat-sheva",
    "oniyot_tarshish": "bikur-malkat-sheva",

    // Split and Ahijah
    "pilug_bishchem": "pilug-hamamlakha",
    "pilug_kingdom_prophecy": "pilug-hamamlakha",
    "split_kingdom": "pilug-hamamlakha",
    "atzat_hazkenim": "pilug-hamamlakha",
    "mass_yisrael": "pilug-hamamlakha",
    "milchemet_achim": "pilug-hamamlakha",
    "achiya_prophecy": "pilug-hamamlakha",
    "kriyat_hameil": "pilug-hamamlakha",
    "egli_zahav": "pilug-hamamlakha",
    "golden_calves": "pilug-hamamlakha",
    "mizbeach_beit_el": "pilug-hamamlakha",
    "iksur_yad_yarovam": "pilug-hamamlakha",
    "machalat_ben_yarovam": "pilug-hamamlakha",
    "milchemet_avram_yarovam": "pilug-hamamlakha",
    "aliyat_shishak": "pilug-hamamlakha",
    "shishak_invasion": "pilug-hamamlakha",

    // Asa/Basha era
    "asa_baasha_war": "prikat-ol-reahvam",
    "asa_reform": "prikat-ol-reahvam",
    "milchemet_asa_basha": "prikat-ol-reahvam",
    "brit_aram": "prikat-ol-reahvam",
    "retsach_nadav": "prikat-ol-reahvam",
    "retsach_basha": "prikat-ol-reahvam",
    "retsach_ela": "prikat-ol-reahvam",
    "hitbadut_zimri": "prikat-ol-reahvam",
    "zimri_coup": "prikat-ol-reahvam",
    "hichrtat_beit_yarovam": "prikat-ol-reahvam",
    "hichrtat_beit_basha": "prikat-ol-reahvam",
    "nevuat_yehu_ben_chanani": "prikat-ol-reahvam",
    "hamlachat_omri_al_tivni": "prikat-ol-reahvam",
    "kinyan_har_shomron": "prikat-ol-reahvam",
    "bniyat_shomron": "prikat-ol-reahvam",
    "bniyat_arei_mivtzarim": "chanukat-hamikdash",

    // Elijah cycle
    "batzoret_eliyahu": "shalosh-shanim-ra-av",
    "eliyahu_drought": "shalosh-shanim-ra-av",
    "nes_tzipchat_hashemen": "shalosh-shanim-ra-av",
    "maamad_har_carmel": "har-hakarmel",
    "carmel_confrontation": "har-hakarmel",
    "yeridat_esh": "har-hakarmel",
    "hitgalut_chorev": "eliyahu-bachorev",
    "chorev_revelation": "eliyahu-bachorev",
    "meshichat_elisha": "eliyahu-bachorev",
    "eliyahu_bachorev": "eliyahu-bachorev",

    // Naboth + Ahab death
    "navot_vineyard": "kerem-navot",
    "kerem_navot": "kerem-navot",
    "nevuat_eliyahu_achav": "kerem-navot",
    "milchemet_ramot_gilad": "dam-achav",
    "ramot_gilead_battle": "dam-achav",
    "nevuat_michayahu": "dam-achav",
    "mot_achav": "dam-achav",
    "brit_yehoshafat_achav": "dam-achav",
    "milchemet_afek": "dam-achav",
    "milchemet_aram_yisrael": "dam-achav",
    "milchamot_aram": "dam-achav",

    // Elijah ascension + Elisha
    "aliyat_eliyahu": "histalkut-eliyahu",
    "elijah_ascension": "histalkut-eliyahu",
    "nisey_elisha": "elisha-vehaneviim",
    "ripuy_mei_yericho": "elisha-vehaneviim",
    "bniyat_yericho": "elisha-vehaneviim",
    "hachayat_ben_hashunamit": "ishah-hashunamit",
    "pgisha_im_elisha_mot": "elisha-vehaneviim",
    "ripuy_naaman": "naaman-hametzora",
    "drisha_lebaal_zvuv": "naaman-hametzora",
    "eliyahu_achaziah_baal_zevuv": "naaman-hametzora",
    "nefilat_achaziah_mehashnava": "naaman-hametzora",
    "mot_achaziah": "naaman-hametzora",
    "matzor_shomron": "arba-tzaraim-sham",
    "matziyat_shomron_bechol_haarba": "arba-tzaraim-sham",
    "shlosh_makot_aram": "elisha-vehaneviim",
    "milchemet_moav": "masa-meysha",

    // Jehu + Athaliah
    "meshichat_yehu": "mered-yehu",
    "hashmadat_beit_achav": "mered-yehu",
    "hashmadat_ovdei_habaal": "mered-yehu",
    "retsach_izevel": "mered-yehu",
    "retsach_yoram_yisrael": "mered-yehu",
    "retsach_achaziah_yehuda": "mered-yehu",
    "milchemet_ramot_gilad_yoram": "mered-yehu",
    "shibud_chazael": "mered-yehu",
    "aliyat_chazael": "mered-yehu",
    "siyum_beit_yehu": "mered-yehu",
    "retsach_zera_hamelucha": "chidush-mizbach-yehoash",
    "mered_yehoash_atalya": "chidush-mizbach-yehoash",
    "haricat_atalya": "chidush-mizbach-yehoash",
    "hatzalat_yehoash": "chidush-mizbach-yehoash",
    "hamlachat_yehoash": "chidush-mizbach-yehoash",
    "bedek_habayit": "chidush-mizbach-yehoash",
    "retsach_yehoash": "chidush-mizbach-yehoash",

    // Jeroboam II + late Israel kings
    "harchavat_gvulot": "chidush-mizbach-yehoash",
    "hatzalat_yisrael": "chidush-mizbach-yehoash",
    "t'filat_yehoachaz": "chidush-mizbach-yehoash",
    "moshia_leyisrael": "chidush-mizbach-yehoash",
    "retsach_zacharia": "chidush-mizbach-yehoash",
    "retsach_shalum": "chidush-mizbach-yehoash",
    "retsach_pekachya": "chidush-mizbach-yehoash",
    "retsach_pekach": "chidush-mizbach-yehoash",
    "hachrivat_tifsach": "chidush-mizbach-yehoash",
    "mas_lepul_melech_asshur": "chidush-mizbach-yehoash",

    // Judah middle kings + Uzziah
    "mered_edom": "chidush-mizbach-yehoash",
    "mered_livna": "chidush-mizbach-yehoash",
    "retsach_avdey_yoash": "chidush-mizbach-yehoash",
    "milchemet_edom": "chidush-mizbach-yehoash",
    "milchemet_beit_shemesh": "chidush-mizbach-yehoash",
    "shvi_amatzya": "chidush-mizbach-yehoash",
    "bniyat_eilat": "chidush-mizbach-yehoash",
    "tzaraat_uziyahu": "chidush-mizbach-yehoash",
    "bniyat_shaar_elyon": "chidush-mizbach-yehoash",
    "milchemet_retzin_pekach": "chidush-mizbach-yehoash",

    // Ahaz
    "brit_achaz_asshur": "nefilat-shomron",
    "mizbeach_damesek": "nefilat-shomron",
    "haavarat_ben_baesh": "nefilat-shomron",

    // Israel's fall
    "galut_tiglat_pilaser": "nefilat-shomron",
    "galut_asseret_hashvatim": "nefilat-shomron",
    "mered_be_asshur": "nefilat-shomron",

    // Hezekiah
    "matzor_sancheriv": "masa-sancheriv",
    "nes_yerushalayim": "masa-sancheriv",
    "retsach_sancheriv": "masa-sancheriv",
    "choli_chizkiyahu": "masa-sancheriv",
    "shagirut_merodach_baladan": "masa-sancheriv",
    "pesach_chizkiyahu": "masa-sancheriv",
    "taharat_mikdash": "masa-sancheriv",
    "ketitat_nechash_hanchoshet": "masa-sancheriv",
    "nekbat_hashiloach": "masa-sancheriv",
    "he_onesh_shel_mitzrayim": "masa-sancheriv",

    // Manasseh/Amon
    "binyan_bamot_menashe": "matza-sefer-hatorah",
    "haavarat_bnei_hinom": "matza-sefer-hatorah",
    "shfichut_dam_naki": "matza-sefer-hatorah",
    "nevuat_churban": "matza-sefer-hatorah",
    "retsach_amon": "matza-sefer-hatorah",
    "am_haaretz_mamlich": "matza-sefer-hatorah",

    // Josiah
    "metziat_sefer_hatorah": "matza-sefer-hatorah",
    "sefer_torah_found": "matza-sefer-hatorah",
    "nevuat_chulda": "matza-sefer-hatorah",
    "brit_yoshiyahu": "hidush-habrit-hachadasha",
    "reforma_kultit": "pesach-yoshiyahu",
    "yoshiyahu_reform": "pesach-yoshiyahu",
    "hasarat_bamot": "pesach-yoshiyahu",
    "tiyut_beit_el": "pesach-yoshiyahu",
    "mavet_yoshiyahu_bemgido": "yoshiyahu-bemgido",
    "gilat_yehoachaz_lemitzrayim": "yoshiyahu-bemgido",
    "mas_paro_necho": "yoshiyahu-bemgido",

    // Exile
    "galut_rishona": "galut-yehoyachin",
    "matzor_nevuchadnetzar": "galut-yehoyachin",
    "avdut_nevuchadnetzar": "galut-yehoyachin",
    "mered_yehoyakim": "galut-yehoyachin",
    "galut_yehoyachin": "galut-yehoyachin",
    "chesed_evil_merodach": "galut-yehoyachin",

    // Destruction
    "churban_bayit": "churban-hamikdash",
    "mered_tzidkiyahu": "churban-hamikdash",
    "matzor_yerushalayim_sofi": "churban-hamikdash",
    "galut_bavel": "churban-hamikdash",
    "zvichat_banav": "churban-hamikdash",
    "briyat_chomot": "churban-hamikdash",
    "retsach_gedalya": "gedaliah",
  },
  place: {
    "gat_cheifer": "gat_hachefer",
    "mishne": "hamishne",
    "ninveh": "nineveh",
    "tzarfat": "tzorefat",
    "yarden": "nahar_hayarden",
  },
  character: {
    // Prophet name shortcuts → canonical character IDs
    "achiya": "achiya_hashiloni",
    "natan": "natan_hanavi",
    "michayahu": "michayahu_ben_yimla",
    "shemaya": "shemaya_ish_haelohim",
    "yehoyada": "yehoyada_hakohen",
    "shimi": "shimi_ben_gera",

    // Variants already present — map self for idempotency
    "izevel": "izevel",
    "ben_hadad": "ben_hadad",
    "atalyah_char": "atalyah_char",

    // Collective / non-entity labels — stub as null (resolver will render
    // plain-text label without link, no "(אין דף עדיין)" warning)
    "am": null,
    "amos": null,
    "avadav": null,
    "beit_achav": null,
    "beit_basha": null,
    "beit_yarovam": null,
    "david": null,
    "hitabdut": null,
    "kosherim_bachish": null,
    "micha": null,
    "nevi_habaal": null,
    "oved": null,
    "tifsach": null,
    "yirmiyahu": null,
    "zera_hamelucha": null,
  },
  king: {
    // Same as character — king IDs that are actually character IDs
    "atalyah_char": "atalyah_char",
  },

  // ---------------------------------------------------------------------
  // labels — direct ID → Hebrew display label (with niqqud).
  // Consulted by assets/name-resolver.js BEFORE the per-bucket alias
  // redirect logic, and BEFORE the data-store scan, so any chip rendered
  // with one of these ids gets a proper Hebrew label even if no real
  // entity entry exists.
  //
  // Keep this list flat — it's intentionally cross-cutting (events,
  // places, characters, exam-format jargon, breadth-section codes).
  // ---------------------------------------------------------------------
  labels: {
    // Solomon era — events / scenes
    "mishpat_shlomo":      "מִשְׁפַּט שְׁלֹמֹה",
    "solomon_dream":       "חֲלוֹם שְׁלֹמֹה בְּגִבְעוֹן",
    "solomon_coronation":  "הַמְלָכַת שְׁלֹמֹה",
    "temple_dedication":   "חֲנֻכַּת בֵּית הַמִּקְדָּשׁ",
    "sheva_visit":         "בִּקּוּר מַלְכַּת שְׁבָא",
    "achiya_prophecy":     "נְבוּאַת אֲחִיָּה הַשִּׁילוֹנִי",

    // Places
    "gichon":              "גִּיחוֹן",
    "kodesh_hakodashim":   "קֹדֶשׁ הַקֳּדָשִׁים",

    // Characters / titles
    "navi_zaken_beit_el":  "נָבִיא זָקֵן מִבֵּית אֵל",
    "ish_haelohim_yehuda": "אִישׁ הָאֱלֹהִים מִיהוּדָה",

    // Exam format / question-type jargon (chips on QuizEngine, etc.)
    "mi_amar_lemi":        "מִי אָמַר לְמִי",
    "mi_natan_lemi":       "מִי נָתַן לְמִי",
    "mi_eifa_eyfo":        "מִי אֵיפֹה",
    "sibah_metzeget":      "סִבָּה וְתוֹצָאָה",
    "cause_effect":        "סִבָּה וְתוֹצָאָה",
    "compare":             "הַשְׁוָאָה",
    "analysis":            "נִיתוּחַ",

    // Breadth / section codes
    "theme":               "נוֹשֵׂא רוֹחַב",
    "breadth":             "נוֹשֵׂא רוֹחַב",
    "rohav":               "נוֹשֵׂא רוֹחַב",
    "bekiut":              "בְּקִיאוּת",
    "yeda":                "יְדִיעָה",
  },
};
