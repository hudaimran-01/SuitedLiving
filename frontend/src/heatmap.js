import { ACCESS_NEEDS, CHECKS } from "./data.js";

const RANK = { barrier: 0, unknown: 1, observed: 2 };

export function canTour(images) {
  return Boolean(images?.hasScan && images?.modelId);
}

export function tourUrl(modelId) {
  return `https://my.matterport.com/show/?m=${encodeURIComponent(modelId)}&play=1`;
}

export function floorPlanCaption(address, index, total) {
  const which = total > 1 ? `Level ${index + 1} of ${total}` : "Floor plan";
  return `${which} for ${address}. This is the listing drawing.`;
}

export function heatmapZones(listing, needIds) {
  const selected = new Set(needIds || []);
  const checkIds = ACCESS_NEEDS.filter((need) => selected.has(need.id)).flatMap((need) => need.checks);
  const unique = [...new Set(checkIds)];
  return unique
    .map((id) => {
      const finding = listing?.findings?.[id];
      const meta = CHECKS.find((check) => check.id === id);
      const status = finding?.status || "unknown";
      return {
        id,
        label: meta?.label || id,
        status,
        title: finding?.title || "Not in the listing",
      };
    })
    .sort((a, b) => RANK[a.status] - RANK[b.status] || a.label.localeCompare(b.label));
}
