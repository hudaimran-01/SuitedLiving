import { floorPlanCaption, heatmapZones } from "../heatmap.js";
import { STATUS_LABEL } from "../logic.js";

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
                <figure>
                  <img src={plan.src} alt={caption} />
                  <figcaption>{caption}</figcaption>
                </figure>
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
          <ul className="heat-grid">
            {zones.map((zone) => (
              <li key={zone.id} className={`heat ${zone.status}`}>
                <span className="heat-status">{STATUS_LABEL[zone.status] || zone.status}</span>
                <strong>{zone.label}</strong>
                <span>{zone.title}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
