import { ACCESS_NEEDS, CHECKS } from "./data.js";
import { focusLife } from "./life.js";

export const STATUS_LABEL = {
  observed: "Observed",
  barrier: "Potential barrier",
  unknown: "Confirm",
};

export const PRICE_MIN = 100000;
export const PRICE_MAX = 2000000;
const BED_OPTIONS = [0, 1, 2, 3];

export function money(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function bedsLabel(beds) {
  if (beds == null) return "Any size";
  if (beds === 0) return "Studio";
  if (beds === 1) return "1 bedroom";
  return `${beds} bedrooms`;
}

export function listingFacts(listing) {
  const baths = Number.isInteger(listing.baths) ? String(listing.baths) : String(listing.baths);
  return [
    listing.kind,
    listing.unit ? `Unit ${listing.unit}` : null,
    listing.place,
    listing.floor,
    bedsLabel(listing.beds),
    `${baths} bath`,
    `${Math.round(listing.sqft)} sqft`,
    listing.available,
  ].filter(Boolean);
}

export function sanitizePrefs(value) {
  const fallback = { maxPrice: PRICE_MAX, beds: null, needs: [], nearby: "" };
  if (!value || typeof value !== "object") return fallback;
  const maxPrice = Number(value.maxPrice);
  const beds = value.beds == null || value.beds === "" ? null : Number(value.beds);
  const allowed = new Set(ACCESS_NEEDS.map((item) => item.id));
  const needs = Array.isArray(value.needs)
    ? value.needs.filter((id) => allowed.has(id))
    : [];
  return {
    maxPrice: Number.isFinite(maxPrice)
      ? Math.min(PRICE_MAX, Math.max(PRICE_MIN, maxPrice))
      : fallback.maxPrice,
    beds: BED_OPTIONS.includes(beds) ? beds : null,
    needs,
    nearby: typeof value.nearby === "string" ? value.nearby.replace(/\s+/g, " ").trim().slice(0, 280) : "",
  };
}

export function checksFor(profileIds) {
  const ids = [];
  for (const profile of ACCESS_NEEDS) {
    if (!profileIds.includes(profile.id)) continue;
    for (const id of profile.checks) {
      if (!ids.includes(id)) ids.push(id);
    }
  }
  return ids;
}

function checkById(id) {
  return CHECKS.find((item) => item.id === id);
}

export function findingFor(listing, checkId) {
  const check = checkById(checkId);
  const found = listing.findings[checkId];
  if (found && check) {
    return {
      requirementId: checkId,
      label: check.label,
      ...found,
    };
  }
  return {
    requirementId: checkId,
    label: check ? check.label : checkId,
    status: "unknown",
    source: "None",
    scene: listing.scene,
    title: "No evidence is recorded for this requirement",
    detail: "This sample file does not have a note for that requirement.",
    ask: "Can you confirm this in person or with a measured plan?",
  };
}

export function summarize(listing, profileIds) {
  const findings = checksFor(profileIds).map((id) => findingFor(listing, id));
  const counts = { observed: 0, barrier: 0, unknown: 0 };
  for (const finding of findings) counts[finding.status] += 1;
  return { findings, counts };
}

export function leadFinding(findings) {
  return (
    findings.find((item) => item.status === "barrier") ||
    findings.find((item) => item.status === "unknown") ||
    findings[0] ||
    null
  );
}

export function questionsFor(findings) {
  return findings.filter((item) => item.status !== "observed" && item.ask);
}

export function visibleListings(listings, prefs) {
  const matched = listings.filter((listing) => {
    const bedroomOk =
      prefs.beds == null || (prefs.beds === 3 ? listing.beds >= 3 : listing.beds === prefs.beds);
    return listing.price <= prefs.maxPrice && bedroomOk;
  });
  if (prefs.needs.length === 0) {
    return matched.slice().sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));
  }
  return matched.slice().sort((a, b) => compareFit(a, b, prefs));
}

export function combinedCounts(listing, prefs) {
  const inside = summarize(listing, prefs.needs).counts;
  const around = focusLife(listing.id, prefs.needs, prefs.nearby);
  const life = around.focused ? around.counts : { observed: 0, barrier: 0, unknown: 0 };
  return {
    barrier: inside.barrier + life.barrier,
    unknown: inside.unknown + life.unknown,
    observed: inside.observed + life.observed,
  };
}

function compareFit(a, b, prefs) {
  const left = combinedCounts(a, prefs);
  const right = combinedCounts(b, prefs);
  return (
    left.barrier - right.barrier ||
    left.unknown - right.unknown ||
    right.observed - left.observed ||
    a.price - b.price ||
    a.name.localeCompare(b.name)
  );
}
