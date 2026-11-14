import { focusLife } from "../life.js";
import { ImageSlot } from "./ImageSlot.jsx";
import { Status } from "./Status.jsx";

export function LifeAround({ listingId, profileIds, nearby, vexcelSrc }) {
  const focus = focusLife(listingId, profileIds, nearby);
  if (profileIds.length === 0) return null;

  if (!focus.query.text) {
    return (
      <section className="life" aria-labelledby="life-title">
        <h2 id="life-title">Life around here</h2>
        <p>Add what you need nearby, and only that errand will show up here.</p>
        <a className="button" href="#/needs">
          Describe what you need nearby
        </a>
      </section>
    );
  }

  if (!focus.focused) {
    return (
      <section className="life" aria-labelledby="life-title">
        <h2 id="life-title">Life around here</h2>
        <p>You wrote “{focus.query.text}”.</p>
        <p>Sample notes can check a grocery, a pharmacy, a clinic, or transit. This request is not covered, so no route is filled in.</p>
      </section>
    );
  }

  return (
    <section className="life" aria-labelledby="life-title">
      <h2 id="life-title">Life around here</h2>
      <p className="meta">You asked: “{focus.query.text}”</p>
      <ImageSlot
        source="Vexcel"
        src={vexcelSrc}
        caption="Vexcel aerial of this route. Grocery stores, pharmacies, and steps can be read here. Bus stops are not identified from this image."
      />
      <ul className="check-list">
        {focus.trips.flatMap((item) =>
          item.byNeed.map((entry) => (
            <li key={`${item.id}-${entry.needId}`}>
              <details>
                <summary>
                  <Status status={entry.trip.status} />
                  <span>
                    <strong>
                      {entry.trip.label}
                      {item.byNeed.length > 1 ? ` · ${entry.needLabel}` : ""}.
                    </strong>{" "}
                    {entry.trip.title}
                  </span>
                </summary>
                <p>{entry.trip.detail}</p>
                <p className="fine">
                  {entry.trip.name}. Route {entry.trip.routeDistance}. Straight line {entry.trip.straightLine}, which
                  skips the crossings.
                </p>
              </details>
            </li>
          )),
        )}
      </ul>
    </section>
  );
}
