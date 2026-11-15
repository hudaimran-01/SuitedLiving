import { interpretNearby } from "./life.js";
import dippingNearby from "../../property_media/vexcel/9918 Dipping Woods Street Houston TX/amenities_and_routes.json" with { type: "json" };
import sageNearby from "../../property_media/vexcel/3525 Sage Road Unit 909 (Sage Condominiums) Houston TX/amenities_and_routes.json" with { type: "json" };
import nortonNearby from "../../property_media/vexcel/1819 S Norton Avenue Los Angeles CA/amenities_and_routes.json" with { type: "json" };
import portlandNearby from "../../property_media/vexcel/205 Portland Street Houston TX/amenities_and_routes.json" with { type: "json" };
import gallantNearby from "../../property_media/vexcel/11413 Gallant Ridge Lane Houston TX/amenities_and_routes.json" with { type: "json" };
import dennisNearby from "../../property_media/vexcel/2711 Dennis Street Houston TX/amenities_and_routes.json" with { type: "json" };

const TOPICS = [
  ["lights", /\blights?\b|\blamps?\b/i],
  ["doors", /\bdoors?\b/i],
  ["gate", /\bgates?\b/i],
  ["blocked", /\bblocked\b/i],
  ["garage", /\bgarages?\b/i],
];

const SKIP_NOTE = /\b(cat|cats|dog|blender|homeowner)\b/i;

function period(sentence) {
  const trimmed = sentence.trim();
  return trimmed.endsWith(".") ? trimmed : `${trimmed}.`;
}

function topicScore(sentence, topic) {
  if (topic === "doors" && /stay open|would not|won't/i.test(sentence)) return 3;
  if (topic === "lights" && /entry/i.test(sentence)) return 3;
  return 1;
}

export function notesFromScan(description) {
  if (typeof description !== "string" || !description.trim()) return [];
  const sentences = description.split(/(?<=\.)\s+/).map((sentence) => sentence.trim()).filter(Boolean);
  const best = new Map();
  for (const sentence of sentences) {
    if (SKIP_NOTE.test(sentence)) continue;
    for (const [topic, pattern] of TOPICS) {
      if (!pattern.test(sentence)) continue;
      const score = topicScore(sentence, topic);
      const current = best.get(topic);
      if (!current || score > current.score) best.set(topic, { score, sentence });
    }
  }
  return TOPICS.map(([topic]) => best.get(topic)).filter(Boolean).map((item) => period(item.sentence));
}

const GALLANT_SCAN_NOTES = [
  "Entryway light not working.",
  "Two bathroom doors on 2nd floor would not stay open fully.",
  "Side yard gate stuck in open position, one side gate stuck closed.",
  "One side of home blocked by pool plumbing equipment.",
  "Client declined both garages due to being full of moving items.",
];

function folderMedia(id, folder, nearby, options = {}) {
  return {
    id,
    neighborhood: `/property_media/vexcel/${encodeURI(folder)}/overview_map.jpg`,
    amenities: nearby.amenities,
    scanNotes: options.scanNotes || [],
  };
}

const MEDIA = {
  "236060791": folderMedia("236060791", "9918 Dipping Woods Street Houston TX", dippingNearby),
  "233992469": folderMedia("233992469", "3525 Sage Road Unit 909 (Sage Condominiums) Houston TX", sageNearby),
  "238641283": folderMedia("238641283", "1819 S Norton Avenue Los Angeles CA", nortonNearby),
  "228418897": folderMedia("228418897", "205 Portland Street Houston TX", portlandNearby),
  "235969334": folderMedia("235969334", "11413 Gallant Ridge Lane Houston TX", gallantNearby, {
    scanNotes: GALLANT_SCAN_NOTES,
  }),
  "228897977": folderMedia("228897977", "2711 Dennis Street Houston TX", dennisNearby),
};

export function propertyMediaFor(listingId) {
  return MEDIA[String(listingId)] || null;
}

const CATEGORY_ORDER = ["Retail Store", "Medical Place", "Accessible Parking", "Stairs or Elevator"];

const FOCUS_CATEGORY = {
  grocery: "Retail Store",
  pharmacy: "Retail Store",
  clinic: "Medical Place",
};

function routeMeters(item) {
  return item.distance_m ?? item.dist_m ?? Number.POSITIVE_INFINITY;
}

export function closestAmenities(amenities) {
  const best = new Map();
  for (const item of amenities || []) {
    const current = best.get(item.category);
    if (!current || routeMeters(item) < routeMeters(current)) best.set(item.category, item);
  }
  return CATEGORY_ORDER.map((category) => best.get(category)).filter(Boolean);
}

function placeText(item) {
  const minutes = `${item.walk_time_min} minute${item.walk_time_min === 1 ? "" : "s"}`;
  const feet = `${Number(item.distance_ft ?? item.dist_ft).toLocaleString("en-US")} ft`;
  const walk = item.is_sidewalk_route ? "on the sidewalk" : "away";
  if (item.category === "Retail Store") return `A retail store is about ${minutes} ${walk} (${feet}).`;
  if (item.category === "Medical Place") return `A medical place is about ${minutes} ${walk} (${feet}).`;
  if (item.category === "Accessible Parking") return `Accessible parking is about ${minutes} ${walk} (${feet}).`;
  if (item.category === "Stairs or Elevator") return `Stairs or an elevator are about ${minutes} ${walk} (${feet}).`;
  return `${item.category} is about ${minutes} ${walk} (${feet}).`;
}

const ROW_LABEL = {
  "Retail Store": "Retail store",
  "Medical Place": "Medical place",
  "Accessible Parking": "Accessible parking",
};

export function compareAround(listingId, nearbyText) {
  const report = aerialReport(propertyMediaFor(listingId), nearbyText);
  if (!report.query.recognized) return [];
  const rows = [];
  if (report.showGroceryMatch) rows.push("Retail Store");
  if (report.showClinic) rows.push("Medical Place");
  return rows.map((category) => {
    const place = report.places.find((item) => item.category === category);
    return {
      id: category,
      label: ROW_LABEL[category] || category,
      status: "unknown",
      title: place ? place.text : "This aerial search is not on file for this home.",
    };
  });
}

export function aerialReport(media, nearbyText) {
  const query = interpretNearby(nearbyText || "");
  const closest = closestAmenities(media?.amenities);
  const byCategory = Object.fromEntries(closest.map((item) => [item.category, item]));
  const focus = [...new Set(query.intents.map((intent) => FOCUS_CATEGORY[intent]).filter(Boolean))];
  const ordered = [
    ...focus.map((category) => byCategory[category]).filter(Boolean),
    ...CATEGORY_ORDER.filter((category) => !focus.includes(category))
      .map((category) => byCategory[category])
      .filter(Boolean),
  ];
  return {
    query,
    places: ordered.map((item) => ({ category: item.category, text: placeText(item) })),
    showGroceryMatch: query.intents.includes("grocery") || query.intents.includes("pharmacy"),
    showClinic: query.intents.includes("clinic"),
  };
}
