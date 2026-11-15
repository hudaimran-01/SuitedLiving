import { useState } from "react";
import { floorPlanCaption, listingHeatmap, localFloorPlan } from "../heatmap.js";
import { STATUS_LABEL } from "../logic.js";

function PlanImage({ src, caption }) {
  const [ratio, setRatio] = useState("");
  return (
    <figure>
      <img
        src={src}
        alt={caption}
        style={ratio ? { aspectRatio: ratio } : undefined}
        onLoad={(event) => {
          const { naturalWidth, naturalHeight } = event.currentTarget;
          if (naturalWidth > 0 && naturalHeight > 0) setRatio(`${naturalWidth} / ${naturalHeight}`);
        }}
      />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function PlanHeatStrip({ listing, needIds }) {
  const zones = listingHeatmap(listing, needIds);
  if (zones.length === 0) return null;
  return (
    <p className="plan-heat-strip">
      <span>Floor plan heatmap</span>
      <span className="plan-heat-dots" aria-label={zones.map((zone) => `${zone.label}: ${zone.status}`).join(", ")}>
        {zones.map((zone) => (
          <i key={zone.id} className={zone.status} />
        ))}
      </span>
    </p>
  );
}

export function ListingPlan({ listing, needIds }) {
  const address = listing.address || listing.name;
  const plans = (listing.images?.floorplans || []).map((src) => ({ src: localFloorPlan(src) }));
  const zones = listingHeatmap(listing, needIds);

  return (
    <section className="scanned-plan" aria-labelledby="plan-title">
      <h2 id="plan-title">Floor plan</h2>
      {plans.length > 0 ? (
        <ul className="plan-gallery">
          {plans.map((plan, index) => {
            const caption = plan.detail || floorPlanCaption(address, index, plans.length);
            return (
              <li key={plan.src}>
                <PlanImage src={plan.src} caption={caption} />
              </li>
            );
          })}
        </ul>
      ) : (
        <p>This listing does not include a floor plan drawing yet.</p>
      )}
      <h3 id="floor-heatmap">Floor plan heatmap</h3>
      {zones.length === 0 ? (
        <p className="meta">Select an access need and this heatmap uses those checks.</p>
      ) : (
        <>
          <p className="meta">
            These are the checks for the access needs in your search. The drawing does not mark rooms, so the colors sit with the plan.
          </p>
          <div className="heat-grid">
            {zones.map((zone) => (
              <div key={zone.id} className={`heat ${zone.status}`}>
                <span className="heat-swatch" aria-hidden="true" />
                <span className="heat-status">{STATUS_LABEL[zone.status] || zone.status}</span>
                <strong>{zone.label}</strong>
                <span className="heat-detail">{zone.title}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
