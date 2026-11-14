import { useState } from "react";
import { EvidenceSketch } from "../sketches.jsx";

export function ListingPhoto({ listing, className }) {
  const photo = listing.images?.photos?.[0];
  const [failed, setFailed] = useState(false);
  if (!photo || failed) {
    return <EvidenceSketch scene={listing.scene} label={listing.sketchLabel || listing.name} />;
  }
  return (
    <img
      className={className}
      src={photo}
      alt={listing.sketchLabel || `${listing.name} listing photo`}
      onError={() => setFailed(true)}
    />
  );
}
