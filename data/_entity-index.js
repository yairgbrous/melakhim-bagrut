/* =========================================================================
   _entity-index.js — backfills window.__ENTITY_INDEX__ buckets that
   bootEntityIndex (in index.html) does not populate:

     place           ← window.PLACES_DATA (data/places.js)
     event           ← window.EVENTS_DATA (data/events.js)
     breadth         ← window.BREADTH_DATA (data/breadth-topics.js)
     recurringItem   ← window.RECURRING_ITEMS_DATA (data/breadth-topics.js)
     quote           ← window.QUOTES_DATA (data/quotes.js)

   It also synthesizes reverse cross-links so every entity exposes a
   uniform set of neighbour arrays:

     related_kings, related_characters, related_events, related_places,
     related_breadth_topics, related_quotes, related_maps

   Sources are unioned with whatever the data file already declares so
   we never clobber hand-authored arrays. Writes back onto the original
   window.*_DATA objects so page components (PlacePage, EventPage, etc.)
   that read the raw arrays pick up the connections without any change.

   Consumers: window.EntityLinkComponent reads __ENTITY_INDEX__[type][id].
   Components that want the uniform shape can call
   window.getRelatedEntities(type, id) → {kings, characters, events,
   places, breadth_topics, quotes, maps} arrays of ids.

   NOT a module — loaded as a classic <script> tag. No exports.
   ========================================================================= */
(function(){
  if (typeof window === "undefined") return;

  function ensureIndex(){
    const i = window.__ENTITY_INDEX__ = window.__ENTITY_INDEX__ || {};
    [
      "king", "character", "place", "event", "breadth", "recurringItem",
      "motif", "date", "archaeology", "story", "flashcard", "keyConcept", "verse",
      "quote"
    ].forEach(k => { i[k] = i[k] || {}; });
    return i;
  }

  function put(bucket, id, entry){
    if (!id) return;
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
        heading: e.title_niqqud || e.title || e.name_hebrew || e.id,
        summary: e.summary || e.significance || ""
      }));
    });

    (window.BREADTH_DATA || []).forEach(b => {
      put(idx.breadth, b.id, Object.assign({}, b, {
        heading: b.title || b.label || b.id,
        summary: b.intro || b.summary || b.description || ""
      }));
    });

    (window.RECURRING_ITEMS_DATA || []).forEach(r => {
      put(idx.recurringItem, r.id, Object.assign({}, r, {
        heading: r.name_niqqud || r.label || r.title || r.id,
        summary: r.significance || r.summary || r.description || ""
      }));
    });

    (window.QUOTES_DATA || []).forEach(q => {
      put(idx.quote, q.id, Object.assign({}, q, {
        heading: q.text_niqqud || q.text || q.id,
        summary: q.significance || ""
      }));
    });

    synthesizeRelations(idx);

    window.__ENTITY_INDEX_EXTRA_READY__ = true;
    try { window.dispatchEvent(new CustomEvent("entity-index-extra-ready", { detail: idx })); } catch {}
  }

  // --------------------------------------------------------------------
  // Reverse-edge synthesis: every entity gets a uniform related_* shape.
  // --------------------------------------------------------------------
  function uniq(arr){
    const seen = new Set(); const out = [];
    (arr || []).forEach(v => {
      if (v == null || v === "") return;
      const k = typeof v === "string" ? v : (v.id || String(v));
      if (!k || seen.has(k)) return;
      seen.add(k); out.push(k);
    });
    return out;
  }

  function bucketOf(idx, id){
    if (idx.king[id])      return "king";
    if (idx.character[id]) return "character";
    return null;
  }

  function synthesizeRelations(idx){
    const kings      = Object.values(idx.king      || {});
    const characters = Object.values(idx.character || {});
    const places     = Object.values(idx.place     || {});
    const events     = Object.values(idx.event     || {});
    const breadth    = Object.values(idx.breadth   || {});
    const quotes     = Object.values(idx.quote     || {});

    // Normalize event participants into split king/character arrays.
    events.forEach(e => {
      const parts = uniq(e.participants);
      const ks = [], cs = [];
      parts.forEach(pid => {
        const b = bucketOf(idx, pid);
        if (b === "king") ks.push(pid);
        else if (b === "character") cs.push(pid);
        else cs.push(pid); // unknown → assume character (dead-link chip ok)
      });
      e._kings_from_participants = ks;
      e._characters_from_participants = cs;
    });

    // Quotes indexed by context_event_id.
    const quotesByEvent = {};
    quotes.forEach(q => {
      if (!q.context_event_id) return;
      (quotesByEvent[q.context_event_id] = quotesByEvent[q.context_event_id] || []).push(q.id);
    });
    const quotesBySpeaker = {};
    quotes.forEach(q => {
      if (!q.speaker_id) return;
      (quotesBySpeaker[q.speaker_id] = quotesBySpeaker[q.speaker_id] || []).push(q.id);
    });
    const quotesByAddressee = {};
    quotes.forEach(q => {
      if (!q.addressee_id) return;
      (quotesByAddressee[q.addressee_id] = quotesByAddressee[q.addressee_id] || []).push(q.id);
    });

    // Events per participant, per place, per breadth topic.
    const eventsByParticipant = {};
    const eventsByPlace       = {};
    const eventsByBreadth     = {};
    events.forEach(e => {
      uniq(e.participants).forEach(pid => {
        (eventsByParticipant[pid] = eventsByParticipant[pid] || []).push(e.id);
      });
      uniq(e.places).forEach(plid => {
        (eventsByPlace[plid] = eventsByPlace[plid] || []).push(e.id);
      });
      uniq(e.related_breadth).forEach(bid => {
        (eventsByBreadth[bid] = eventsByBreadth[bid] || []).push(e.id);
      });
    });

    // Places map_numbers per place id (for deriving related_maps).
    const mapsByPlace = {};
    places.forEach(p => { mapsByPlace[p.id] = uniq(p.map_numbers || []).map(n => String(n)); });

    // Helper — for a set of place ids return all map numbers.
    const mapsForPlaces = (placeIds) => {
      const out = new Set();
      (placeIds || []).forEach(pid => (mapsByPlace[pid] || []).forEach(m => out.add(m)));
      return Array.from(out);
    };

    // Write uniform `related_*` fields onto an entity, unioning with what
    // the data file already declares.
    function write(entity, fields){
      Object.keys(fields).forEach(k => {
        entity[k] = uniq([].concat(entity[k] || [], fields[k] || []));
      });
    }

    // Events.
    events.forEach(e => {
      const placeIds = uniq(e.places);
      write(e, {
        related_kings:           e._kings_from_participants,
        related_characters:      uniq([].concat(e._characters_from_participants || [], e.related_characters || [])),
        related_places:          placeIds,
        related_events:          [], // events don't naturally link to other events unless authored
        related_breadth_topics:  uniq(e.related_breadth),
        related_quotes:          quotesByEvent[e.id] || [],
        related_maps:            mapsForPlaces(placeIds)
      });
    });

    // Kings.
    kings.forEach(k => {
      const myEvents = uniq([].concat(eventsByParticipant[k.id] || [], k.related_events || []));
      const coParticipantKings      = new Set();
      const coParticipantCharacters = new Set();
      const placesFromEvents        = new Set();
      const breadthFromEvents       = new Set();
      myEvents.forEach(eid => {
        const ev = idx.event[eid]; if (!ev) return;
        (ev._kings_from_participants || []).forEach(x => { if (x !== k.id) coParticipantKings.add(x); });
        (ev._characters_from_participants || []).forEach(x => coParticipantCharacters.add(x));
        uniq(ev.places).forEach(pid => placesFromEvents.add(pid));
        uniq(ev.related_breadth).forEach(bid => breadthFromEvents.add(bid));
      });
      const placesAll = uniq([].concat(k.related_places || [], Array.from(placesFromEvents)));
      const chars     = uniq([].concat(k.related_prophets || [], k.related_characters || [], Array.from(coParticipantCharacters)));
      const qs        = uniq([].concat(quotesBySpeaker[k.id] || [], quotesByAddressee[k.id] || []));
      write(k, {
        related_kings:           Array.from(coParticipantKings),
        related_characters:      chars,
        related_events:          myEvents,
        related_places:          placesAll,
        related_breadth_topics:  Array.from(breadthFromEvents),
        related_quotes:          qs,
        related_maps:            mapsForPlaces(placesAll)
      });
    });

    // Characters.
    characters.forEach(c => {
      const myEvents = uniq([].concat(eventsByParticipant[c.id] || [], c.related_events || []));
      const placesFromEvents  = new Set();
      const breadthFromEvents = new Set();
      const kingsFromEvents   = new Set();
      const charsFromEvents   = new Set();
      myEvents.forEach(eid => {
        const ev = idx.event[eid]; if (!ev) return;
        (ev._kings_from_participants || []).forEach(x => kingsFromEvents.add(x));
        (ev._characters_from_participants || []).forEach(x => { if (x !== c.id) charsFromEvents.add(x); });
        uniq(ev.places).forEach(pid => placesFromEvents.add(pid));
        uniq(ev.related_breadth).forEach(bid => breadthFromEvents.add(bid));
      });
      const placesAll = uniq([].concat(c.related_places || [], Array.from(placesFromEvents)));
      const ks        = uniq([].concat(c.related_kings || [], Array.from(kingsFromEvents)));
      const cs        = uniq([].concat(c.related_characters || [], Array.from(charsFromEvents)));
      const qs        = uniq([].concat(quotesBySpeaker[c.id] || [], quotesByAddressee[c.id] || []));
      write(c, {
        related_kings:           ks,
        related_characters:      cs,
        related_events:          myEvents,
        related_places:          placesAll,
        related_breadth_topics:  Array.from(breadthFromEvents),
        related_quotes:          qs,
        related_maps:            mapsForPlaces(placesAll)
      });
    });

    // Places.
    places.forEach(p => {
      const myEvents = uniq([].concat(eventsByPlace[p.id] || [], p.related_events || []));
      const kingsFromEvents   = new Set();
      const charsFromEvents   = new Set();
      const breadthFromEvents = new Set();
      const quotesFromEvents  = new Set();
      myEvents.forEach(eid => {
        const ev = idx.event[eid]; if (!ev) return;
        (ev._kings_from_participants || []).forEach(x => kingsFromEvents.add(x));
        (ev._characters_from_participants || []).forEach(x => charsFromEvents.add(x));
        uniq(ev.related_breadth).forEach(bid => breadthFromEvents.add(bid));
        (quotesByEvent[eid] || []).forEach(qid => quotesFromEvents.add(qid));
      });
      const chars = uniq([].concat(p.related_characters || [], Array.from(charsFromEvents)));
      write(p, {
        related_kings:           Array.from(kingsFromEvents),
        related_characters:      chars,
        related_events:          myEvents,
        related_places:          [], // places don't naturally link to other places
        related_breadth_topics:  Array.from(breadthFromEvents),
        related_quotes:          Array.from(quotesFromEvents),
        related_maps:            (p.map_numbers || []).map(n => String(n))
      });
    });

    // Breadth topics.
    breadth.forEach(b => {
      const myEvents = eventsByBreadth[b.id] || [];
      const kingsFromEvents = new Set();
      const charsFromEvents = new Set();
      const placesFromEvents = new Set();
      const quotesFromEvents = new Set();
      myEvents.forEach(eid => {
        const ev = idx.event[eid]; if (!ev) return;
        (ev._kings_from_participants || []).forEach(x => kingsFromEvents.add(x));
        (ev._characters_from_participants || []).forEach(x => charsFromEvents.add(x));
        uniq(ev.places).forEach(pid => placesFromEvents.add(pid));
        (quotesByEvent[eid] || []).forEach(qid => quotesFromEvents.add(qid));
      });
      const placesAll = Array.from(placesFromEvents);
      write(b, {
        related_kings:           Array.from(kingsFromEvents),
        related_characters:      Array.from(charsFromEvents),
        related_events:          myEvents,
        related_places:          placesAll,
        related_breadth_topics:  [],
        related_quotes:          Array.from(quotesFromEvents),
        related_maps:            mapsForPlaces(placesAll)
      });
    });

    // Quotes.
    quotes.forEach(q => {
      const ks = [], cs = [];
      [q.speaker_id, q.addressee_id].forEach(pid => {
        if (!pid) return;
        const b = bucketOf(idx, pid);
        if (b === "king") ks.push(pid);
        else if (b === "character") cs.push(pid);
        else cs.push(pid);
      });
      const evs = q.context_event_id ? [q.context_event_id] : [];
      const placesFromEv = new Set();
      const breadthFromEv = new Set();
      evs.forEach(eid => {
        const ev = idx.event[eid]; if (!ev) return;
        uniq(ev.places).forEach(pid => placesFromEv.add(pid));
        uniq(ev.related_breadth).forEach(bid => breadthFromEv.add(bid));
      });
      const placesAll = Array.from(placesFromEv);
      write(q, {
        related_kings:           uniq(ks),
        related_characters:      uniq(cs),
        related_events:          evs,
        related_places:          placesAll,
        related_breadth_topics:  Array.from(breadthFromEv),
        related_quotes:          [],
        related_maps:            mapsForPlaces(placesAll)
      });
    });
  }

  // Uniform accessor: return {kings, characters, events, places,
  // breadth_topics, quotes, maps} arrays of ids for any entity.
  window.getRelatedEntities = function getRelatedEntities(type, id){
    const idx = window.__ENTITY_INDEX__ || {};
    const bucket = idx[type] || (type === "king" ? idx.king || idx.character : null);
    const entry = bucket && bucket[id];
    if (!entry) return null;
    return {
      kings:            uniq(entry.related_kings),
      characters:       uniq(entry.related_characters),
      events:           uniq(entry.related_events),
      places:           uniq(entry.related_places),
      breadth_topics:   uniq(entry.related_breadth_topics),
      quotes:           uniq(entry.related_quotes),
      maps:             uniq(entry.related_maps)
    };
  };

  // Run now, and re-run whenever bootEntityIndex fires — so we layer on
  // top of its populated buckets rather than racing it.
  backfill();
  try { window.addEventListener("entity-index-ready", backfill); } catch {}
})();
