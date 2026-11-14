import { ACCESS_NEEDS, CHECKS } from "./data.js";

export const STATUS_LABEL = {
  observed: "Observed",
  barrier: "Potential barrier",
  unknown: "Unknown",
};

const RENT_MIN = 1200;
const RENT_MAX = 4000;
const BED_OPTIONS = [0, 1, 2, 3];

export function money(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function bedsLabel(beds) {
  if (beds === 0) return "Studio";
  if (beds === 1) return "1 bedroom";
  return `${beds} bedrooms`;
}

export function sanitizePrefs(value) {
  const fallback = { maxRent: 2400, beds: 1, needs: [] };
  if (!value || typeof value !== "object") return fallback;
  const maxRent = Number(value.maxRent);
  const beds = Number(value.beds);
  const allowed = new Set(ACCESS_NEEDS.map((item) => item.id));
  const needs = Array.isArray(value.needs)
    ? value.needs.filter((id) => allowed.has(id))
    : [];
  return {
    maxRent: Number.isFinite(maxRent)
      ? Math.min(RENT_MAX, Math.max(RENT_MIN, maxRent))
      : fallback.maxRent,
    beds: BED_OPTIONS.includes(beds) ? beds : fallback.beds,
    needs,
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
    const bedroomOk = prefs.beds === 3 ? listing.beds >= 3 : listing.beds === prefs.beds;
    return listing.rent <= prefs.maxRent && bedroomOk;
  });
  if (prefs.needs.length === 0) {
    return matched.slice().sort((a, b) => a.rent - b.rent || a.name.localeCompare(b.name));
  }
  return matched.slice().sort((a, b) => compareFit(a, b, prefs.needs));
}

function compareFit(a, b, profileIds) {
  const left = summarize(a, profileIds).counts;
  const right = summarize(b, profileIds).counts;
  return (
    left.barrier - right.barrier ||
    left.unknown - right.unknown ||
    right.observed - left.observed ||
    a.rent - b.rent ||
    a.name.localeCompare(b.name)
  );
}
