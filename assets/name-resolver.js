מִשְׁפַּטשְׁלֹמֹהמִשְׁפַּטשְׁלֹמֹהחֲלוֹםשְׁלֹמֹהבְּגִבְעוֹןחֲלוֹםשְׁלֹמֹהבְּגִבְעוֹןהַמְלָכַתשְׁלֹמֹההַמְלָכַתשְׁלֹמֹהנְבוּאַתאֲחִיָּההַשִּׁילוֹנִינְבוּאַתאֲחִיָּההַשִּׁילוֹנִיבִּקּוּרמַלְכַּתשְׁבָאבִּקּוּרמַלְכַּתשְׁבָאבִּקּוּרמַלְכַּתשְׁבָאחֲנֻכַּתבֵּיתהַמִּקְדָּשׁחֲנֻכַּתבֵּיתהַמִּקְדָּשׁחֲנֻכַּתבֵּיתהַמִּקְדָּשׁמַעֲמַדהַרהַכַּרְמֶלמַעֲמַדהַרהַכַּרְמֶלגָּלוּתבָּבֶלחֻרְבַּןשׁוֹמְרוֹןחֻרְבַּןיְרוּשָׁלַיִםגִּיחוֹןקֹדֶשׁהַקֳּדָשִׁיםקֹדֶשׁהַקֳּדָשִׁיםיְרוּשָׁלַיִםשׁוֹמְרוֹןבֵּיתאֵלדָּןהַרהַכַּרְמֶלגִּבְעוֹןנָבִיאזָקֵןמִבֵּיתאֵלנָבִיאזָקֵןמִבֵּיתאֵלאִישׁהָאֱלֹהִיםמִיהוּדָהאִישׁהָאֱלֹהִיםמִיהוּדָהשְׁלֹמֹהדָּוִדאֵלִיָּהוּאֱלִישָׁעאַחְאָבאִיזֶבֶליֵהוּאיָרָבְעָםרְחַבְעָםאֲחִיָּההַשִּׁילוֹנִישְׁמַעְיָהנָתָןהַנָּבִיאיְשַׁעְיָהוּחִזְקִיָּהוּמְנַשֶּׁהיֹאשִׁיָּהוּצִדְקִיָּהוּסִבָּתִיוּתכְּפוּלָהסִבָּתִיוּתכְּפוּלָהמוֹטִיבהַחָכְמָהמוֹטִיבהַחָכְמָהמְלוּכָהוּבְרִיתמְלוּכָהוּבְרִיתמִקְדָּשׁוּשְׁכִינָהמִקְדָּשׁוּשְׁכִינָהנְבוּאָהוּמַלְכוּתחֵטְאוָעֹנֶשׁיַחַסלָעָםוְלַתּוֹרָהקְרִיעַתהַבֶּגֶדקְרִיעַתהַבֶּגֶדפִּרְדַּתהַמֶּלֶךְפִּרְדַּתהַמֶּלֶךְתּוֹרהַזָּהָבתּוֹרהַזָּהָבנָשִׁיםנָכְרִיּוֹתנָשִׁיםנָכְרִיּוֹתהַבְטָחַתהַשּׁוֹשֶׁלֶתהַבְטָחַתהַשּׁוֹשֶׁלֶתמַתְּנַתהַחָכְמָהמַתְּנַתהַחָכְמָהאֲרוֹןהַבְּרִיתמִזְבֵּחַאֵפוֹדתְּרָפִיםבָּמוֹתאֲשֵׁרָהעֵגֶלזָהָבנְחַשׁהַנְּחֹשֶׁתמִיאָמַרלְמִימִיאָמַרלְמִימִינָתַןלְמִימִינָתַןלְמִימִיאֵיפֹהמִיאֵיפֹהסִבָּהוְתוֹצָאָהסִבָּהוְתוֹצָאָהסִבָּהוְתוֹצָאָההַשְׁוָאָההַשְׁוָאָהנִיתוּחַנוֹשֵׂארוֹחַבנוֹשֵׂארוֹחַבהֶקְשֵׁרשְׁאֵלָהפְּתוּחָהצִיטוּטבְּקִיאוּתיְדִיעָהנוֹשֵׂארוֹחַבקַלבֵּינוֹנִיקָשֶׁה/* =========================================================================
   name-resolver.js (?v=6000)
   ---------------------------------------------------------------------------
   Global Hebrew display-name resolver. Given an entity id, returns the best
   Hebrew label (with niqqud when available) by:
     1. Consulting the flat `labels` map in window.__ENTITY_ALIASES__
        (data/_id-aliases.js). This is the canonical source for cross-cutting
        IDs that don't have a real entity entry — exam jargon, breadth codes,
        scene names, etc.
     2. Scanning all known entity data stores for a matching id.
     3. Falling back to per-bucket alias redirects, then to a humanized id.
   ========================================================================= */
window.resolveDisplayName = function(id) {
  if (!id) return '';
  const aliases = window.__ENTITY_ALIASES__ || {};

  // 1. Direct flat labels map (highest priority — it's the curated truth).
  const labels = aliases.labels || null;
  if (labels && Object.prototype.hasOwnProperty.call(labels, id)) {
    const v = labels[id];
    if (typeof v === 'string' && v) return v;
  }

  // 2. Scan entity data stores for the id.
  const stores = [
    'CHARACTERS_DATA',
    'EVENTS_DATA',
    'PLACES_DATA',
    'KINGS_DATA',
    'RECURRING_ITEMS_DATA',
    'BREADTH_TOPICS_DATA',
    'QUOTES_DATA'
  ];
  for (const s of stores) {
    const arr = window[s];
    if (!Array.isArray(arr)) continue;
    const found = arr.find(e => e && e.id === id);
    if (found) {
      return found.name_niqqud || found.name || found.heading || found.title_niqqud || found.title || id.replace(/_/g, ' ');
    }
  }

  // 3. Per-bucket alias redirects (event/place/character/king).
  // Walk all buckets so cross-typed aliases still resolve.
  const BUCKETS = ['event', 'place', 'character', 'king'];
  for (const b of BUCKETS) {
    const m = aliases[b];
    if (!m || typeof m !== 'object') continue;
    if (!Object.prototype.hasOwnProperty.call(m, id)) continue;
    const aliased = m[id];
    if (typeof aliased === 'string' && aliased && aliased !== id) {
      // Recurse — but guard against id ↔ aliased loops by passing through stores.
      for (const s of stores) {
        const arr = window[s];
        if (!Array.isArray(arr)) continue;
        const found = arr.find(e => e && e.id === aliased);
        if (found) {
          return found.name_niqqud || found.name || found.heading || found.title_niqqud || found.title || aliased.replace(/_/g, ' ');
        }
      }
    }
  }

  // 4. Final fallback: humanized id.
  return id.replace(/_/g, ' ');
};
