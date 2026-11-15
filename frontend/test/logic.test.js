import assert from "node:assert/strict";
import test from "node:test";
import { DEMO_PREFS, LISTINGS } from "../src/data.js";
import { assessRoom, floorPlanFor } from "../src/floorplans.js";
import { focusLife } from "../src/life.js";
import {
  findingFor,
  questionsFor,
  sanitizePrefs,
  summarize,
  visibleListings,
} from "../src/logic.js";

const demo = { ...DEMO_PREFS, needs: [...DEMO_PREFS.needs] };

test("a wheelchair search orders the listing file by evidence", () => {
  const ids = visibleListings(LISTINGS, demo).map((listing) => listing.id);
  assert.deepEqual(ids, ["236060791", "235969334", "238641283", "228418897", "233992469", "228897977"]);
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

test("low vision and hard of hearing keep every home when those notes are unknown", () => {
  const byPrice = ["236060791", "233992469", "228897977", "235969334", "238641283", "228418897"];
  const lowVision = visibleListings(LISTINGS, { ...demo, needs: ["low-vision"] }).map((listing) => listing.id);
  const hearing = visibleListings(LISTINGS, { ...demo, needs: ["hard-of-hearing"] }).map((listing) => listing.id);
  assert.deepEqual(lowVision, byPrice);
  assert.deepEqual(hearing, byPrice);
});

test("an empty filter lists every home in the listing file", () => {
  const all = visibleListings(LISTINGS, { maxPrice: 2000000, beds: null, needs: [], nearby: "" });
  assert.equal(all.length, LISTINGS.length);
  assert.deepEqual(
    all.map((listing) => listing.id),
    ["236060791", "233992469", "228897977", "235969334", "238641283", "228418897"],
  );
});

test("a location choice keeps only that city", () => {
  const houston = visibleListings(LISTINGS, { ...demo, city: "houston" }).map((listing) => listing.place);
  const losAngeles = visibleListings(LISTINGS, { ...demo, city: "los-angeles" }).map((listing) => listing.id);
  assert.equal(houston.length, 5);
  assert.ok(houston.every((place) => place.startsWith("Houston")));
  assert.deepEqual(losAngeles, ["238641283"]);
  assert.equal(sanitizePrefs({ city: "miami" }).city, "");
  assert.equal(sanitizePrefs({ city: "los-angeles" }).city, "los-angeles");
});

test("price and bedroom filters remove homes from the listing file", () => {
  const cheap = visibleListings(LISTINGS, { ...demo, maxPrice: 200000 }).map((listing) => listing.id);
  assert.deepEqual(cheap, ["236060791"]);
  const twoBed = visibleListings(LISTINGS, { ...demo, beds: 2 }).map((listing) => listing.id);
  assert.deepEqual(twoBed, ["236060791", "233992469"]);
});

test("a listing keeps seller statements separate from open questions", () => {
  const home = LISTINGS.find((listing) => listing.id === "236060791");
  const { findings } = summarize(home, ["wheelchair"]);
  assert.equal(findings.find((item) => item.requirementId === "step-free").status, "observed");
  assert.equal(findings.find((item) => item.requirementId === "parking").ask !== null, true);
  assert.ok(questionsFor(findings).every((item) => item.ask));
  assert.equal(home.images.photos[0].label, "Front");
  assert.equal(home.agentNotes[0].includes("wheelchair"), true);
  assert.equal(home.images.modelId, "vwDtYGo2VUz");
});

test("observed notes do not become questions", () => {
  const home = LISTINGS.find((listing) => listing.id === "236060791");
  const findings = ["step-free", "elevator"].map((id) => findingFor(home, id));
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
  assert.equal(prefs.maxPrice, 2000000);
  assert.equal(prefs.beds, null);
  assert.deepEqual(prefs.needs, ["wheelchair"]);
  assert.equal(prefs.nearby, "");
  assert.equal(sanitizePrefs({ nearby: "  a clinic  " }).nearby, "a clinic");
  assert.equal(sanitizePrefs({ beds: null, maxPrice: 2000000 }).beds, null);
});
