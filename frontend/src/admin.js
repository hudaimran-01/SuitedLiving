import { ACCESS_NEEDS, CHECKS } from "./data.js";
import { findingFor } from "./logic.js";
import { closestAmenities } from "./propertyMedia.js";

export const DESK_PASSWORD = "costar";

const AUDIENCE = {
  wheelchair: "For a wheelchair user: the way in, the path from the car, the doors, and the bathroom.",
  hills: "For someone who can walk a short distance, but not stairs or a steep slope.",
  "low-vision": "For someone who needs light, contrast, and signs they can read.",
  "hard-of-hearing": "For someone who needs alarms, a doorbell, and an intercom they can see.",
};

export function passwordMatches(input) {
  return String(input ?? "").trim().toLowerCase() === DESK_PASSWORD;
}

function countsOf(findings) {
  const counts = { observed: 0, barrier: 0, unknown: 0 };
  for (const finding of findings) {
    if (Object.hasOwn(counts, finding.status)) counts[finding.status] += 1;
  }
  return counts;
}

function aroundLine(item) {
  const minutes = Number(item.walk_time_min);
  const feet = Number(item.distance_ft ?? item.dist_ft);
  if (!item?.category || !Number.isFinite(minutes)) return null;
  const walk = item.is_sidewalk_route ? "on the sidewalk" : "away";
  const feetText = Number.isFinite(feet) ? ` (${Math.round(feet).toLocaleString("en-US")} ft)` : "";
  return {
    category: item.category,
    text: `${item.category} is about ${minutes} minute${minutes === 1 ? "" : "s"} ${walk}${feetText}.`,
  };
}

export function buildingBrief(listing, media = null) {
  const groups = ACCESS_NEEDS.map((need) => {
    const findings = need.checks.map((id) => findingFor(listing, id));
    return {
      id: need.id,
      label: need.label,
      audience: AUDIENCE[need.id] || need.detail,
      findings,
      counts: countsOf(findings),
    };
  });
  const all = CHECKS.map((check) => findingFor(listing, check.id));
  const counts = countsOf(all);
  const sources = [...new Set(all.map((item) => item.source).filter((source) => source && source !== "None"))];
  const places = media ? closestAmenities(media.amenities).map(aroundLine).filter(Boolean) : [];
  return {
    id: listing.id,
    name: listing.name,
    address: listing.address || listing.name,
    place: listing.place,
    price: listing.price,
    floor: listing.floor,
    counts,
    known: counts.observed + counts.barrier,
    total: all.length,
    sources,
    groups,
    questions: all.filter((item) => item.status !== "observed" && item.ask),
    investigations: Array.isArray(listing.investigations) ? listing.investigations : [],
    agentNotes: Array.isArray(listing.agentNotes) ? listing.agentNotes : [],
    photos: listing.images?.photos?.length || 0,
    floorplans: listing.images?.floorplans?.length || 0,
    hasScan: Boolean(listing.images?.hasScan),
    places,
  };
}

export function deskPortfolio(listings, mediaFor = () => null) {
  return listings
    .map((listing) => buildingBrief(listing, mediaFor(listing.id)))
    .sort((a, b) => b.counts.unknown - a.counts.unknown || a.name.localeCompare(b.name));
}

export function alsoHelps(checkId, groupId) {
  return ACCESS_NEEDS
    .filter((need) => need.id !== groupId && need.checks.includes(checkId))
    .map((need) => need.label);
}
