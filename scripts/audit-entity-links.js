#!/usr/bin/env node
/* =========================================================================
   audit-entity-links.js — verifies every related_* ref in data/*.js points
   to an id that actually exists in the union entity index.

   Run:   node scripts/audit-entity-links.js
   Exit:  0 = clean; 1 = broken refs found.

   Strategy:
     1. Read each data file as text.
     2. Strip `export ` keywords so the file behaves as a plain script.
     3. eval() inside a sandbox that exposes a stub `window` object.
     4. Harvest globals the files set (window.CHARACTERS_DATA, etc.) plus
        names captured via `const X = ...`.
     5. Build the union index {kings, characters, places, events, ...}.
     6. Walk every entry and flag every id referenced in a related_*
        array that is not present in the corresponding bucket.

   Conservative by design: unknown types are warned, not errored. ID
   references to kings live in entry.related_kings / killed_by / killed[]
   — those specifically resolve against the kings bucket.
   ========================================================================= */
"use strict";

const fs  = require("fs");
const vm  = require("vm");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");

// ---- file loader: mini-sandbox + export stripper ----
function loadDataFile(file){
  const full = path.join(DATA_DIR, file);
  let txt;
  try { txt = fs.readFileSync(full, "utf8"); }
  catch (e) { return { error: "read failed: " + e.message }; }
  // Normalise to a plain script whose top-level bindings reach the
  // sandbox global:
  //   `export default X`                   → `var __default__ = X`
  //   `export (const|let|var) X = ...`     → `var X = ...`
  //   leading `const X = ...`              → `var X = ...`
  //   leading `let X = ...`                → `var X = ...`
  // Node's vm attaches only `var` declarations to the context object.
  const stripped = txt
    .replace(/\bexport\s+default\s+/g, "var __default__ = ")
    .replace(/\bexport\s+(const|let|var)\b/g, "var")
    .replace(/\bexport\s+/g, "")
    .replace(/^(\s*)(const|let)\s+/gm, "$1var ");
  const sandbox = { window: {}, console, module: {}, exports: {} };
  vm.createContext(sandbox);
  try {
    vm.runInContext(stripped, sandbox, { filename: file, timeout: 2000 });
  } catch (e) {
    return { error: "eval failed: " + e.message };
  }
  return { sandbox };
}

// ---- union index construction ----
function buildIndex(){
  const union = { king:{}, character:{}, place:{}, event:{}, breadth:{}, recurringItem:{} };
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".js"));

  files.forEach(f => {
    const { sandbox, error } = loadDataFile(f);
    if (error) { console.error(`[skip] ${f}: ${error}`); return; }
    const w = sandbox.window || {};

    // Kings: data/kings.js exports `kings`.
    const kingsArr = sandbox.kings || w.KINGS_DATA;
    if (Array.isArray(kingsArr)) kingsArr.forEach(k => { if (k && k.id) union.king[k.id] = k; });

    // Characters.
    const charsArr = w.CHARACTERS_DATA || sandbox.characters;
    if (Array.isArray(charsArr)) charsArr.forEach(c => { if (c && c.id) union.character[c.id] = c; });

    // Places.
    const placesArr = w.PLACES_DATA || sandbox.places;
    if (Array.isArray(placesArr)) placesArr.forEach(p => { if (p && p.id) union.place[p.id] = p; });

    // Events.
    const eventsArr = w.EVENTS_DATA || sandbox.events;
    if (Array.isArray(eventsArr)) eventsArr.forEach(e => { if (e && e.id) union.event[e.id] = e; });

    // Breadth / recurring.
    const breadthArr = w.BREADTH_DATA || sandbox.breadth;
    if (Array.isArray(breadthArr)) breadthArr.forEach(b => { if (b && b.id) union.breadth[b.id] = b; });
    const recArr = w.RECURRING_ITEMS_DATA || sandbox.recurringItems;
    if (Array.isArray(recArr)) recArr.forEach(r => { if (r && r.id) union.recurringItem[r.id] = r; });
  });

  return union;
}

// ---- reference walker ----
// buckets is an array of candidate buckets — a ref resolves if it exists
// in ANY of them (kings are also characters in this app's mental model).
const REL_FIELDS = [
  { field: "related_kings",      buckets: ["king"]                 },
  { field: "related_prophets",   buckets: ["character", "king"]    },
  { field: "related_characters", buckets: ["character", "king"]    },
  { field: "related_places",     buckets: ["place"]                },
  { field: "related_events",     buckets: ["event"]                },
  { field: "related_breadth",    buckets: ["breadth"]              },
  { field: "recurring_items",    buckets: ["recurringItem"]        },
  { field: "participants",       buckets: ["character", "king"]    },
  { field: "places",             buckets: ["place"]                },
  { field: "killed",             buckets: ["king", "character"]    }
];
const SCALAR_REL = [
  { field: "killed_by", buckets: ["king", "character"] }
];

function refExists(union, buckets, id){
  return buckets.some(b => union[b] && union[b][id]);
}

function audit(union){
  const broken = [];
  Object.keys(union).forEach(bucketName => {
    const bucket = union[bucketName];
    Object.keys(bucket).forEach(id => {
      const entry = bucket[id];
      REL_FIELDS.forEach(({ field, buckets }) => {
        const arr = entry[field];
        if (!Array.isArray(arr)) return;
        arr.forEach(raw => {
          const refId = typeof raw === "string" ? raw : (raw && raw.id);
          if (!refId) return;
          if (!refExists(union, buckets, refId)) {
            broken.push({ from: `${bucketName}/${id}`, field, refId, expected: buckets.join("|") });
          }
        });
      });
      SCALAR_REL.forEach(({ field, buckets }) => {
        const refId = entry[field];
        if (!refId || typeof refId !== "string") return;
        if (!refExists(union, buckets, refId)) {
          broken.push({ from: `${bucketName}/${id}`, field, refId, expected: buckets.join("|") });
        }
      });
    });
  });
  return broken;
}

// ---- main ----
function main(){
  const union = buildIndex();
  const sizes = Object.keys(union).map(k => `${k}=${Object.keys(union[k]).length}`).join(" ");
  console.log(`[index] ${sizes}`);

  const broken = audit(union);
  if (!broken.length) {
    console.log("[audit] all related_* references resolve · ✅");
    process.exit(0);
  }

  console.log(`[audit] ${broken.length} broken references:`);
  broken.forEach(b => {
    console.log(`  ${b.from} · ${b.field}[...] → "${b.refId}"  (expected in bucket: ${b.expected})`);
  });
  process.exit(1);
}

if (require.main === module) main();

module.exports = { buildIndex, audit };
