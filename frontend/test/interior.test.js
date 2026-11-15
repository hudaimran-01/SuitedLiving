import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_PROPERTIES,
  coverageSentence,
  findingView,
  interiorView,
  rankInteriors,
} from "../src/interior.js";

test("a wheelchair search puts the highest interior photo score first", () => {
  const ranked = rankInteriors(INTERIOR_PROPERTIES, ["wheelchair"]);
  assert.equal(ranked[0].id, "84327");
  assert.equal(ranked[0].name, "8600 Burton Way");
  assert.equal(ranked.at(-1).id, "92530");
  assert.equal(interiorView(ranked[0], ["wheelchair"]).rows[0].score, 64);
});

test("stairs and hills uses the walker or cane score", () => {
  const ranked = rankInteriors(INTERIOR_PROPERTIES, ["hills"]);
  assert.equal(ranked[0].id, "84327");
  assert.equal(interiorView(ranked[0], ["hills"]).rows[0].label, "Walker or cane");
  assert.equal(interiorView(ranked[0], ["hills"]).rows[0].score, 67);
});

test("low vision orders the three strongest photo scores by name", () => {
  const top = rankInteriors(INTERIOR_PROPERTIES, ["low-vision"]).slice(0, 3).map((item) => item.name);
  assert.deepEqual(top, ["8600 Burton Way", "Jewelry Trades Building", "TENTEN WILSHIRE"]);
});

test("hard of hearing leaves the photo scores in name order", () => {
  const ranked = rankInteriors(INTERIOR_PROPERTIES, ["hard-of-hearing"]).map((item) => item.name);
  const byName = INTERIOR_PROPERTIES.map((item) => item.name).sort((a, b) => a.localeCompare(b));
  assert.deepEqual(ranked, byName);
  assert.equal(interiorView(INTERIOR_PROPERTIES[0], ["hard-of-hearing"]).hearingOnly, true);
});

test("a photo finding stays unknown until the picture shows it", () => {
  const open = findingView({ id: "step_free_entry", value: null, evidence: "The entry is not in frame." });
  const tub = findingView({ id: "bathtub_only", value: false, evidence: "A shower is also visible." });
  const bars = findingView({ id: "grab_bars", value: false, evidence: "No grab bars are visible." });
  assert.equal(open.status, "unknown");
  assert.equal(tub.status, "observed");
  assert.equal(bars.status, "barrier");
  assert.match(coverageSentence(0.45), /45%/);
});
