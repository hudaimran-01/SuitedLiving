import assert from "node:assert/strict";
import test from "node:test";
import { aerialReport, closestAmenities, notesFromScan, propertyMediaFor } from "../src/propertyMedia.js";

test("scan notes keep one useful line per access topic", () => {
  const notes = notesFromScan(
    "Entryway light not working. 2nd floor den lights and lamps not working. Two cats kept escaping. Two bathroom doors on 2nd floor would not stay open fully. Some doors in 2nd floor lead to unfinished attic. Side yard gate stuck in open position. One side of home blocked by pool plumbing equipment. Client declined both garages due to being full of moving items.",
  );
  assert.deepEqual(notes, [
    "Entryway light not working.",
    "Two bathroom doors on 2nd floor would not stay open fully.",
    "Side yard gate stuck in open position.",
    "One side of home blocked by pool plumbing equipment.",
    "Client declined both garages due to being full of moving items.",
  ]);
});

test("uploaded homes expose a floor plan and the closest aerial place", () => {
  for (const id of ["236060791", "233992469", "238641283", "228418897", "235969334", "228897977"]) {
    const media = propertyMediaFor(id);
    assert.ok(media.floorScan.endsWith("floorplan_matterport.jpg"));
    assert.equal(closestAmenities(media.amenities).length, 4);
  }
  assert.equal(propertyMediaFor("missing"), null);
  assert.equal(propertyMediaFor("236060791").furnished.endsWith("furnished_vs_defurnished.jpg"), true);
  const dennis = aerialReport(propertyMediaFor("228897977"), "");
  assert.match(dennis.places.find((place) => place.category === "Retail Store").text, /7 minutes/);
  const gallant = propertyMediaFor("235969334");
  assert.match(gallant.scanNotes[0], /Entryway light/);
  assert.equal(gallant.pool, true);
  const portland = aerialReport(propertyMediaFor("228418897"), "a grocery I can walk to");
  assert.equal(portland.places[0].category, "Retail Store");
  assert.match(portland.places[0].text, /9 minutes/);
  assert.equal(portland.showGroceryMatch, true);
  const clinic = aerialReport(propertyMediaFor("238641283"), "a clinic");
  assert.equal(clinic.places[0].category, "Medical Place");
  assert.match(clinic.places[0].text, /3 minutes/);
});
