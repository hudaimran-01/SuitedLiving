import assert from "node:assert/strict";
import test from "node:test";
import { DEMO_PREFS, LISTINGS } from "../src/data.js";
import { lifeReport } from "../src/life.js";
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
  assert.deepEqual(ids, ["linden", "quarry", "palmer", "witherspoon"]);
});

test("the same grocery trip changes with the access need", () => {
  const grocery = (need) =>
    lifeReport("linden", [need]).sections[0].trips.find((item) => item.id === "grocery");
  assert.equal(grocery("wheelchair").status, "barrier");
  assert.equal(grocery("hills").status, "observed");
  const hills = visibleListings(LISTINGS, { ...demo, needs: ["hills"] }).map((listing) => listing.id);
  assert.deepEqual(hills, ["linden", "quarry", "palmer", "witherspoon"]);
  const steep = lifeReport("quarry", ["hills"]).findings.find((item) => item.id === "slope");
  assert.equal(steep.status, "barrier");
});

test("low vision and hard of hearing reorder the same homes", () => {
  const lowVision = visibleListings(LISTINGS, { ...demo, needs: ["low-vision"] }).map((listing) => listing.id);
  const hearing = visibleListings(LISTINGS, { ...demo, needs: ["hard-of-hearing"] }).map((listing) => listing.id);
  assert.deepEqual(lowVision, ["quarry", "witherspoon", "linden", "palmer"]);
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
});
