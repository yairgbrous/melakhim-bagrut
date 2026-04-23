/* =========================================================================
   _entity-index.js — backfills window.__ENTITY_INDEX__ buckets that
   bootEntityIndex (in index.html) does not populate:

     place           ← window.PLACES_DATA (data/places.js)
     event           ← window.EVENTS_DATA (when data/events.js ships)
     breadth         ← window.BREADTH_DATA (BreadthPage constants)
     recurringItem   ← window.RECURRING_ITEMS_DATA (BreadthPage constants)

   This file is additive: it never clobbers keys bootEntityIndex has
   already set. It re-runs on `entity-index-ready` so late-arriving
   data still lands in the index.

   Consumers: window.EntityLinkComponent reads the unified shape
   __ENTITY_INDEX__[type][id] = { heading, summary, ...rest }.

   NOT a module — loaded as a classic <script> tag. No exports.
   ========================================================================= */
(function(){
  if (typeof window === "undefined") return;

  function ensureIndex(){
    const i = window.__ENTITY_INDEX__ = window.__ENTITY_INDEX__ || {};
    [
      "king", "character", "place", "event", "breadth", "recurringItem",
      "motif", "date", "archaeology", "story", "flashcard", "keyConcept", "verse"
    ].forEach(k => { i[k] = i[k] || {}; });
    return i;
  }

  function put(bucket, id, entry){
    if (!id) return;
    // never clobber: if something already wrote this id, leave it alone.
    if (!bucket[id]) bucket[id] = entry;
  }

  function backfill(){
    const idx = ensureIndex();

    (window.PLACES_DATA || []).forEach(p => {
      put(idx.place, p.id, Object.assign({}, p, {
        heading: p.name_niqqud || p.name || p.id,
        summary: p.significance || ""
      }));
    });

    (window.EVENTS_DATA || []).forEach(e => {
      put(idx.event, e.id, Object.assign({}, e, {
        heading: e.title || e.name_hebrew || e.id,
        summary: e.summary || e.significance || ""
      }));
    });

    (window.BREADTH_DATA || []).forEach(b => {
      put(idx.breadth, b.id, Object.assign({}, b, {
        heading: b.title || b.label || b.id,
        summary: b.summary || b.description || ""
      }));
    });

    (window.RECURRING_ITEMS_DATA || []).forEach(r => {
      put(idx.recurringItem, r.id, Object.assign({}, r, {
        heading: r.label || r.title || r.id,
        summary: r.summary || r.description || ""
      }));
    });

    window.__ENTITY_INDEX_EXTRA_READY__ = true;
    try { window.dispatchEvent(new CustomEvent("entity-index-extra-ready", { detail: idx })); } catch {}
  }

  // Run now, and re-run whenever bootEntityIndex fires — so we layer on
  // top of its populated buckets rather than racing it.
  backfill();
  try { window.addEventListener("entity-index-ready", backfill); } catch {}
})();
