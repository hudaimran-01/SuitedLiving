import { useState } from "react";
import { canTour, tourUrl } from "../heatmap.js";

export function Tour({ listing }) {
  const images = listing.images || {};
  const [open, setOpen] = useState(false);
  if (!canTour(images)) return null;

  return (
    <section className="tour" aria-labelledby="tour-title">
      <h2 id="tour-title">3D tour</h2>
      <p className="meta">The tour stays unloaded until you open it.</p>
      {open ? (
        <iframe
          className="tour-frame"
          title={`3D tour of ${listing.address}`}
          src={tourUrl(images.modelId)}
          allow="fullscreen; xr-spatial-tracking"
          allowFullScreen
        />
      ) : (
        <button type="button" className="button primary" onClick={() => setOpen(true)}>
          Open 3D tour
        </button>
      )}
    </section>
  );
}
