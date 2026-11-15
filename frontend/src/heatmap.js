import { ACCESS_NEEDS, CHECKS } from "./data.js";

const RANK = { barrier: 0, unknown: 1, observed: 2 };

export function canTour(images) {
  return Boolean(images?.hasScan && images?.modelId);
}

export function tourUrl(modelId) {
  return `https://my.matterport.com/show/?m=${encodeURIComponent(modelId)}&play=1`;
}

export function localFloorPlan(src) {
  const match = /\/i2\/([^/]+)\//.exec(src || "");
  return match ? `/floorplans/${match[1]}.svg` : src;
}

export function floorPlanCaption(address, index, total) {
  const which = total > 1 ? `Level ${index + 1} of ${total}` : "Floor plan";
  return `${which} for ${address}. This is the listing drawing.`;
}

function zoneFor(listing, id) {
  const finding = listing?.findings?.[id];
  const meta = CHECKS.find((check) => check.id === id);
  return {
    id,
    label: meta?.label || id,
    status: finding?.status || "unknown",
    title: finding?.title || "Not in the listing",
  };
}

function byHeat(a, b) {
  return RANK[a.status] - RANK[b.status] || a.label.localeCompare(b.label);
}

export function heatmapZones(listing, needIds) {
  const selected = new Set(needIds || []);
  const checkIds = ACCESS_NEEDS.filter((need) => selected.has(need.id)).flatMap((need) => need.checks);
  return [...new Set(checkIds)].map((id) => zoneFor(listing, id)).sort(byHeat);
}

export function listingHeatmap(listing, needIds = []) {
  return heatmapZones(listing, needIds);
}
