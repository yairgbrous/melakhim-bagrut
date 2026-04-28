/* =========================================================================
   name-resolver.js (?v=5500)
   ---------------------------------------------------------------------------
   Global Hebrew display-name resolver. Given an entity id, returns the best
   Hebrew label (with niqqud when available) by scanning all known data
   stores. Falls back to alias map and finally to a humanized id.
   ========================================================================= */
window.resolveDisplayName = function(id) {
  if (!id) return '';
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
      return found.name_niqqud || found.name || found.title_niqqud || found.title || id.replace(/_/g, ' ');
    }
  }
  const alias = (window.__ENTITY_ALIASES__ || {})[id];
  if (alias) return window.resolveDisplayName(alias);
  return id.replace(/_/g, ' ');
};
