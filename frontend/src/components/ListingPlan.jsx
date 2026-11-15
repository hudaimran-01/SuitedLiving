import { floorPlanCaption, heatmapZones } from "../heatmap.js";
import { STATUS_LABEL } from "../logic.js";

function PlanImage({ src, caption }) {
  const svg = /\.svg(?:\?|$)/i.test(src);
  return (
    <figure>
      <div className="plan-frame">
        {svg ? (
          <object data={src} type="image/svg+xml" aria-label={caption} width="800" height="600">
            <img src={src} alt={caption} width="800" height="600" />
          </object>
        ) : (
          <img src={src} alt={caption} width="800" height="600" />
        )}
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function ListingPlan({ listing, needIds }) {
  const address = listing.address || listing.name;
  const plans = (listing.images?.floorplans || []).map((src) => ({ src }));
  const zones = heatmapZones(listing, needIds);

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
      <h3>Access heatmap</h3>
      {zones.length === 0 ? (
        <p className="meta">Select an access need and this heatmap uses those checks.</p>
      ) : (
        <>
          <p className="meta">
            Each color is a listing check for the needs you selected. It is not a measured room on the drawing.
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
