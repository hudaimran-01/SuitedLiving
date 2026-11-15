import assert from "node:assert/strict";
import test from "node:test";
import { canTour, floorPlanCaption, heatmapZones, tourUrl } from "../src/heatmap.js";
import { aerialReport, closestAmenities, compareAround, notesFromScan, propertyMediaFor } from "../src/propertyMedia.js";
import { LISTINGS } from "../src/data.js";

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

test("uploaded homes keep the aerial search and the listing carries the floor plans", () => {
  const plans = {
    "236060791": 1,
    "233992469": 1,
    "238641283": 3,
    "228418897": 5,
    "235969334": 3,
    "228897977": 5,
  };
  for (const [id, count] of Object.entries(plans)) {
    const media = propertyMediaFor(id);
    const home = LISTINGS.find((listing) => listing.id === id);
    assert.equal(media.floorScan, undefined);
    assert.ok(media.neighborhood.includes("/vexcel/"));
    assert.equal(closestAmenities(media.amenities).length >= 3, true);
    assert.equal(home.images.floorplans.length, count);
  }
  assert.equal(propertyMediaFor("missing"), null);
  const dennis = aerialReport(propertyMediaFor("228897977"), "");
  assert.match(dennis.places.find((place) => place.category === "Retail Store").text, /11 minutes on the sidewalk/);
  const gallant = propertyMediaFor("235969334");
  assert.match(gallant.scanNotes[0], /Entryway light/);
  const portland = aerialReport(propertyMediaFor("228418897"), "a grocery I can walk to");
  assert.equal(portland.places[0].category, "Retail Store");
  assert.match(portland.places[0].text, /12 minutes on the sidewalk/);
  assert.equal(portland.showGroceryMatch, true);
  const clinic = aerialReport(propertyMediaFor("238641283"), "a clinic");
  assert.equal(clinic.places[0].category, "Medical Place");
  assert.match(clinic.places[0].text, /5 minutes on the sidewalk/);
});

test("compare uses the sidewalk walk and does not look up a missing sample trip", () => {
  const grocery = compareAround("236060791", "a grocery store");
  const clinic = compareAround("238641283", "a clinic");
  assert.deepEqual(grocery.map((row) => row.id), ["Retail Store"]);
  assert.match(grocery[0].title, /11 minutes on the sidewalk/);
  assert.equal(grocery[0].status, "unknown");
  assert.deepEqual(clinic.map((row) => row.id), ["Medical Place"]);
  assert.equal(compareAround("236060791", "a quiet cafe").length, 0);
  assert.equal(compareAround("missing", "a grocery store")[0].title, "This aerial search is not on file for this home.");
});

test("a 3D tour opens only when the listing has a scan and a model id", () => {
  assert.equal(canTour({ hasScan: true, modelId: "vwDtYGo2VUz" }), true);
  assert.equal(canTour({ hasScan: false, modelId: "vwDtYGo2VUz" }), false);
  assert.equal(canTour({ hasScan: true, modelId: "" }), false);
  assert.equal(tourUrl("vwDtYGo2VUz"), "https://my.matterport.com/show/?m=vwDtYGo2VUz&play=1");
});

test("the access heatmap uses the selected checks and the listing floor plan", () => {
  const home = LISTINGS.find((listing) => listing.id === "236060791");
  assert.equal(home.images.floorplans.length, 1);
  assert.match(floorPlanCaption(home.address, 0, 1), /Floor plan for 9918 Dipping Woods Street/);
  const zones = heatmapZones(home, ["wheelchair"]);
  assert.equal(zones.find((zone) => zone.id === "step-free").status, "observed");
  assert.equal(zones.find((zone) => zone.id === "parking").status, "unknown");
  assert.equal(heatmapZones(home, []).length, 0);
  assert.equal(zones.some((zone) => zone.id === "lighting"), false);
});
