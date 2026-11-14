import assert from "node:assert/strict";
import test from "node:test";
import { DEMO_PREFS, LISTINGS } from "../src/data.js";
import { assessRoom, floorPlanFor } from "../src/floorplans.js";
import { focusLife } from "../src/life.js";
import {
  findingFor,
  leadFinding,
  questionsFor,
  sanitizePrefs,
  summarize,
  visibleListings,
} from "../src/logic.js";

const demo = { ...DEMO_PREFS, needs: [...DEMO_PREFS.needs] };

test("a wheelchair search puts the ground-floor home first", () => {
  const ids = visibleListings(LISTINGS, demo).map((listing) => listing.id);
  assert.deepEqual(ids, ["linden", "quarry", "witherspoon", "palmer"]);
});

test("a nearby note limits the life report to that errand", () => {
  const asked = "A grocery store I can roll to";
  const wheelchair = focusLife("linden", ["wheelchair"], asked);
  const hills = focusLife("linden", ["hills"], asked);
  assert.deepEqual(wheelchair.trips.map((item) => item.id), ["grocery"]);
  assert.equal(wheelchair.trips[0].byNeed[0].trip.status, "unknown");
  assert.equal(hills.trips[0].byNeed[0].trip.status, "observed");
  assert.match(wheelchair.trips[0].byNeed[0].trip.detail, /not identified from this image/);
  assert.equal(focusLife("linden", ["wheelchair"], "a quiet cafe").focused, false);
  assert.equal(focusLife("linden", ["wheelchair"], "").focused, false);
  const pharmacy = focusLife("quarry", ["hills"], "the pharmacy up the hill");
  assert.equal(pharmacy.trips[0].byNeed[0].trip.status, "barrier");
  assert.match(pharmacy.trips[0].byNeed[0].trip.title, /Steps/);
  assert.equal(focusLife("linden", ["wheelchair"], "the bus").focused, false);
});

test("low vision and hard of hearing reorder the same homes", () => {
  const lowVision = visibleListings(LISTINGS, { ...demo, needs: ["low-vision"] }).map((listing) => listing.id);
  const hearing = visibleListings(LISTINGS, { ...demo, needs: ["hard-of-hearing"] }).map((listing) => listing.id);
  assert.deepEqual(lowVision, ["quarry", "linden", "witherspoon", "palmer"]);
  assert.deepEqual(hearing, ["palmer", "quarry", "linden", "witherspoon"]);
});

test("an empty filter lists every sample home", () => {
  const all = visibleListings(LISTINGS, { maxPrice: 1200000, beds: null, needs: [], nearby: "" });
  assert.deepEqual(
    all.map((listing) => listing.id),
    ["quarry", "linden", "witherspoon", "palmer"],
  );
});

test("budget and bedroom filters remove sample homes", () => {
  const cheap = visibleListings(LISTINGS, { ...demo, maxPrice: 300000 }).map((listing) => listing.id);
  assert.deepEqual(cheap, ["quarry"]);
  const larger = visibleListings(LISTINGS, { ...demo, beds: 2 });
  assert.equal(larger.length, 0);
});

test("linden keeps the bathroom and doorway gaps visible", () => {
  const { counts, findings } = summarize(LISTINGS[0], ["wheelchair"]);
  assert.deepEqual(counts, { observed: 4, barrier: 0, unknown: 2 });
  assert.equal(leadFinding(findings).requirementId, "doorways");
  assert.equal(questionsFor(findings).length, 2);
});

test("observed notes do not become questions", () => {
  const findings = ["step-free", "parking"].map((id) => findingFor(LISTINGS[0], id));
  assert.equal(questionsFor(findings).length, 0);
});

test("a room is colored only for the needs that were selected", () => {
  const linden = floorPlanFor("linden");
  const bath = linden.rooms.find((room) => room.id === "bath");
  const entry = linden.rooms.find((room) => room.id === "entry");
  assert.equal(assessRoom(bath, ["wheelchair"]).status, "verify");
  assert.match(assessRoom(bath, ["wheelchair"]).summary, /walk-in shower/);
  assert.equal(assessRoom(bath, []).status, "unset");
  assert.equal(assessRoom(entry, ["hills"]).status, "supported");
  assert.equal(assessRoom(entry, ["low-vision"]).status, "barrier");
  assert.equal(assessRoom(entry, ["hills", "low-vision"]).status, "barrier");
  assert.equal(floorPlanFor("quarry"), null);
  assert.equal(floorPlanFor("palmer"), null);
  const door = floorPlanFor("witherspoon").rooms.find((room) => room.id === "entry");
  assert.equal(assessRoom(door, ["wheelchair"]).status, "barrier");
});

test("prefs ignore unknown needs and clamp price", () => {
  const prefs = sanitizePrefs({ maxPrice: 9000000, beds: 9, needs: ["wheelchair", "nope"] });
  assert.equal(prefs.maxPrice, 1200000);
  assert.equal(prefs.beds, null);
  assert.deepEqual(prefs.needs, ["wheelchair"]);
  assert.equal(prefs.nearby, "");
  assert.equal(sanitizePrefs({ nearby: "  a clinic  " }).nearby, "a clinic");
});
