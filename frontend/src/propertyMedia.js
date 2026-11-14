import { interpretNearby } from "./life.js";
import gallantScan from "../../property_media/5_11413_Gallant_Ridge_Ln_Houston_TX/matterport/matterport_summary.json" with { type: "json" };
import dippingNearby from "../../property_media/1_9918_Dipping_Woods_St_Houston_TX/vexcel/nearby_amenities_and_accessibility.json" with { type: "json" };
import dippingElements from "../../property_media/1_9918_Dipping_Woods_St_Houston_TX/vexcel/elements_summary.json" with { type: "json" };
import sageNearby from "../../property_media/2_Sage_Condominiums_Unit_909_Houston_TX/vexcel/nearby_amenities_and_accessibility.json" with { type: "json" };
import sageElements from "../../property_media/2_Sage_Condominiums_Unit_909_Houston_TX/vexcel/elements_summary.json" with { type: "json" };
import nortonNearby from "../../property_media/3_1819_S_Norton_Ave_Los_Angeles_CA/vexcel/nearby_amenities_and_accessibility.json" with { type: "json" };
import nortonElements from "../../property_media/3_1819_S_Norton_Ave_Los_Angeles_CA/vexcel/elements_summary.json" with { type: "json" };
import portlandNearby from "../../property_media/4_205_Portland_St_Houston_TX/vexcel/nearby_amenities_and_accessibility.json" with { type: "json" };
import portlandElements from "../../property_media/4_205_Portland_St_Houston_TX/vexcel/elements_summary.json" with { type: "json" };
import gallantNearby from "../../property_media/5_11413_Gallant_Ridge_Ln_Houston_TX/vexcel/nearby_amenities_and_accessibility.json" with { type: "json" };
import gallantElements from "../../property_media/5_11413_Gallant_Ridge_Ln_Houston_TX/vexcel/elements_summary.json" with { type: "json" };
import dennisNearby from "../../property_media/6_2711_Dennis_St_Houston_TX/vexcel/nearby_amenities_and_accessibility.json" with { type: "json" };
import dennisElements from "../../property_media/6_2711_Dennis_St_Houston_TX/vexcel/elements_summary.json" with { type: "json" };

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

function folderMedia(id, folder, nearby, elements, options = {}) {
  const base = `/property_media/${folder}`;
  return {
    id,
    floorScan: `${base}/matterport/floorplan_matterport.jpg`,
    floorDrawn: `${base}/matterport/floorplan_drawn.png`,
    furnished: options.furnished ? `${base}/matterport/furnished_vs_defurnished.jpg` : null,
    neighborhood: `${base}/vexcel/neighborhood_overview_accessibility.jpg`,
    parcel: `${base}/vexcel/ortho_parcel.jpg`,
    groceryMatch: `${base}/vexcel/embeddings/grocery_stores_match_1.jpg`,
    amenities: nearby.amenities,
    pool: Boolean(elements.pool_detected),
    scanNotes: options.scanNotes || [],
  };
}

const MEDIA = {
  "236060791": folderMedia(
    "236060791",
    "1_9918_Dipping_Woods_St_Houston_TX",
    dippingNearby,
    dippingElements,
    { furnished: true },
  ),
  "233992469": folderMedia(
    "233992469",
    "2_Sage_Condominiums_Unit_909_Houston_TX",
    sageNearby,
    sageElements,
  ),
  "238641283": folderMedia(
    "238641283",
    "3_1819_S_Norton_Ave_Los_Angeles_CA",
    nortonNearby,
    nortonElements,
    { furnished: true },
  ),
  "228418897": folderMedia(
    "228418897",
    "4_205_Portland_St_Houston_TX",
    portlandNearby,
    portlandElements,
    { furnished: true },
  ),
  "235969334": folderMedia(
    "235969334",
    "5_11413_Gallant_Ridge_Ln_Houston_TX",
    gallantNearby,
    gallantElements,
    { scanNotes: notesFromScan(gallantScan.description) },
  ),
  "228897977": folderMedia(
    "228897977",
    "6_2711_Dennis_St_Houston_TX",
    dennisNearby,
    dennisElements,
  ),
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

export function closestAmenities(amenities) {
  const best = new Map();
  for (const item of amenities || []) {
    const current = best.get(item.category);
    if (!current || item.dist_m < current.dist_m) best.set(item.category, item);
  }
  return CATEGORY_ORDER.map((category) => best.get(category)).filter(Boolean);
}

function placeText(item) {
  const minutes = `${item.walk_time_min} minute${item.walk_time_min === 1 ? "" : "s"}`;
  const feet = `${Number(item.dist_ft).toLocaleString("en-US")} ft`;
  if (item.category === "Retail Store") return `A retail store is about ${minutes} away (${feet}).`;
  if (item.category === "Medical Place") return `A medical place is about ${minutes} away (${feet}).`;
  if (item.category === "Accessible Parking") return `Accessible parking shows about ${minutes} away (${feet}).`;
  if (item.category === "Stairs or Elevator") return `Stairs or an elevator show about ${minutes} away (${feet}).`;
  return `${item.category} is about ${minutes} away (${feet}).`;
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
    pool: Boolean(media?.pool),
  };
}
