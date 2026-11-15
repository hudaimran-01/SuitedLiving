import { useState } from "react";
import { EvidenceSketch } from "../sketches.jsx";

export function ListingPhoto({ listing, className }) {
  const photo = listing.images?.photos?.[0];
  const src = typeof photo === "string" ? photo : photo?.src;
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <EvidenceSketch scene={listing.scene} label={listing.sketchLabel || listing.name} />;
  }
  return (
    <img
      className={className}
      src={src}
      alt={(typeof photo === "string" ? listing.sketchLabel : photo.detail || photo.label) || `${listing.name} listing photo`}
      onError={() => setFailed(true)}
    />
  );
}
