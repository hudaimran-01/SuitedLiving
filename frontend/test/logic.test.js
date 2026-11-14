import assert from "node:assert/strict";
import test from "node:test";
import { DEMO_PREFS, LISTINGS } from "../src/data.js";
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
  const bus = focusLife("linden", ["wheelchair"], "the bus");
  assert.equal(bus.trips[0].id, "transit");
  assert.match(bus.trips[0].byNeed[0].trip.title, /Bus stops are not identified/);
});

test("low vision and hard of hearing reorder the same homes", () => {
  const lowVision = visibleListings(LISTINGS, { ...demo, needs: ["low-vision"] }).map((listing) => listing.id);
  const hearing = visibleListings(LISTINGS, { ...demo, needs: ["hard-of-hearing"] }).map((listing) => listing.id);
  assert.deepEqual(lowVision, ["quarry", "linden", "witherspoon", "palmer"]);
  assert.deepEqual(hearing, ["palmer", "quarry", "witherspoon", "linden"]);
});

test("budget and bedroom filters remove sample homes", () => {
  const cheap = visibleListings(LISTINGS, { ...demo, maxRent: 2100 }).map((listing) => listing.id);
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

test("prefs ignore unknown needs and clamp rent", () => {
  const prefs = sanitizePrefs({ maxRent: 9000, beds: 9, needs: ["wheelchair", "nope"] });
  assert.equal(prefs.maxRent, 4000);
  assert.equal(prefs.beds, 1);
  assert.deepEqual(prefs.needs, ["wheelchair"]);
  assert.equal(prefs.nearby, "");
  assert.equal(sanitizePrefs({ nearby: "  a clinic  " }).nearby, "a clinic");
});
