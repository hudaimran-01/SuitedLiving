import assert from "node:assert/strict";
import test from "node:test";
import { alsoHelps, buildingBrief, deskPortfolio, passwordMatches } from "../src/admin.js";
import { LISTINGS } from "../src/data.js";
import { propertyMediaFor } from "../src/propertyMedia.js";

test("the desk password ignores surrounding space and case", () => {
  assert.equal(passwordMatches(" costar "), true);
  assert.equal(passwordMatches("COSTAR"), true);
  assert.equal(passwordMatches("nope"), false);
  assert.equal(passwordMatches(""), false);
});

test("a building brief keeps every check and groups them by who they help", () => {
  const listing = LISTINGS.find((item) => item.id === "228418897");
  const brief = buildingBrief(listing, propertyMediaFor(listing.id));
  assert.equal(brief.total, 12);
  assert.equal(brief.known, brief.counts.observed + brief.counts.barrier);
  assert.deepEqual(
    brief.groups.map((group) => group.id),
    ["wheelchair", "low-vision", "hard-of-hearing", "hills"],
  );
  assert.equal(brief.groups[0].findings.length, 6);
  const elevator = brief.groups[0].findings.find((item) => item.requirementId === "elevator");
  assert.equal(elevator.status, "observed");
  assert.equal(elevator.source, "CoStar");
  assert.ok(brief.questions.length > 0);
  assert.ok(brief.places.length >= 3);
  assert.deepEqual(alsoHelps("elevator", "wheelchair"), ["Stairs and hills"]);
  assert.deepEqual(alsoHelps("bathroom", "wheelchair"), []);
});

test("the portfolio leads with the buildings that still need the most answers", () => {
  const rows = deskPortfolio(LISTINGS, propertyMediaFor);
  assert.equal(rows.length, LISTINGS.length);
  for (let index = 1; index < rows.length; index += 1) {
    assert.ok(rows[index - 1].counts.unknown >= rows[index].counts.unknown);
  }
});
