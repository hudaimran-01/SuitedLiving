import rawListings from "./listings.json" with { type: "json" };

export const CHECKS = [
  { id: "step-free", label: "Step-free entrance" },
  { id: "elevator", label: "Elevator, or a ground-floor home" },
  { id: "parking", label: "Accessible parking nearby" },
  { id: "short-walk", label: "Short walk from the car" },
  { id: "doorways", label: "Wide doorways" },
  { id: "bathroom", label: "Accessible bathroom" },
  { id: "lighting", label: "Entrance lighting" },
  { id: "contrast", label: "Contrast at edges and doors" },
  { id: "signage", label: "Readable signs" },
  { id: "alarms", label: "Visual smoke alarms" },
  { id: "doorbell", label: "Doorbell you can see" },
  { id: "intercom", label: "Intercom you can see" },
];

export const ACCESS_NEEDS = [
  {
    id: "wheelchair",
    label: "Wheelchair",
    detail: "Step-free routes, door width, turning space, and an elevator or a ground-floor home.",
    checks: ["step-free", "elevator", "parking", "short-walk", "doorways", "bathroom"],
  },
  {
    id: "low-vision",
    label: "Low vision",
    detail: "Lighting, contrast on edges and doors, and signs you can read.",
    checks: ["lighting", "contrast", "signage"],
  },
  {
    id: "hard-of-hearing",
    label: "Hard of hearing",
    detail: "Visual alarms, a doorbell you can see, and an intercom that is not sound-only.",
    checks: ["alarms", "doorbell", "intercom"],
  },
  {
    id: "hills",
    label: "Stairs and hills",
    detail: "You can walk a short distance, but stairs and steep slopes are hard.",
    checks: ["step-free", "elevator"],
  },
];

export const DEMO_PREFS = {
  maxPrice: 2000000,
  beds: null,
  needs: ["wheelchair"],
  nearby: "A grocery store I can get to from the front door",
};

function normalizePhoto(photo) {
  if (!photo) return null;
  if (typeof photo === "string") return { src: photo, label: "Listing photo", detail: "Listing photo", note: null };
  if (!photo.src) return null;
  return {
    src: photo.src,
    label: photo.label || "Listing photo",
    detail: photo.detail || photo.label || "Listing photo",
    note: photo.note || null,
  };
}

export function normalizeListing(listing) {
  const images = listing.images || {};
  const unit = typeof listing.unit === "string" ? listing.unit.trim() : "";
  return {
    ...listing,
    unit: unit || null,
    agentNotes: Array.isArray(listing.agentNotes) ? listing.agentNotes.filter(Boolean) : [],
    price: Number(listing.price),
    beds: Number(listing.beds),
    baths: Number(listing.baths),
    sqft: Number(listing.sqft),
    images: {
      matterport: images.matterport || null,
      vexcel: images.vexcel || null,
      hasScan: Boolean(images.hasScan),
      modelId: images.modelId || null,
      photos: Array.isArray(images.photos) ? images.photos.map(normalizePhoto).filter(Boolean) : [],
      floorplans: Array.isArray(images.floorplans) ? images.floorplans.filter((src) => typeof src === "string" && src) : [],
    },
  };
}

export function normalizeListings(listings) {
  return Array.isArray(listings) ? listings.map(normalizeListing) : [];
}

// Built by backend/scripts/build_cache.py from the CoStar kit.
export const LISTINGS = normalizeListings(rawListings);
