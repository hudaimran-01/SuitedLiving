import { focusLife } from "../life.js";
import { EvidenceSketch } from "../sketches.jsx";
import { Counts, Status } from "./Status.jsx";

export function LifeAround({ listingId, profileIds, nearby }) {
  const focus = focusLife(listingId, profileIds, nearby);
  if (profileIds.length === 0) return null;

  if (!focus.query.text) {
    return (
      <section className="life" aria-labelledby="life-title">
        <div className="report-intro">
          <h2 id="life-title">Life around here</h2>
          <p>
            The notes above are about the building. Say what you need nearby, in your own words, and
            this part will follow that instead of listing every errand.
          </p>
          <a className="button" href="#/needs">
            Describe what you need nearby
          </a>
        </div>
      </section>
    );
  }

  if (!focus.focused) {
    return (
      <section className="life" aria-labelledby="life-title">
        <div className="report-intro">
          <h2 id="life-title">Life around here</h2>
          <p>You wrote “{focus.query.text}”.</p>
          <p>
            These sample notes can check a grocery, a pharmacy, a clinic, or transit. They do not
            cover this request, so nothing is filled in here.
          </p>
          <p className="fine">
            A later version can send this sentence to the backend. It will not invent a place.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="life" aria-labelledby="life-title">
      <div className="report-intro">
        <h2 id="life-title">Life around here</h2>
        <p>You asked: “{focus.query.text}”</p>
        <Counts counts={focus.counts} label="Around" />
        <p className="fine">
          Sample neighborhood notes for this request only. Not a live map and not a measured route.
          A later version can connect this sentence to the backend and to Vexcel imagery.
        </p>
      </div>
      {focus.trips.map((item) => (
        <article key={item.id} className="trip trip-focus">
          {item.sketch && item.sketch.scene !== "street-level" ? (
            <div className="plate">
              <EvidenceSketch
                scene={item.sketch.scene}
                label={`Sample sketch. ${item.sketch.title}. ${item.sketch.detail}`}
              />
            </div>
          ) : null}
          <div className="finding-copy">
            <h3>{item.sketch.name}</h3>
            {item.byNeed.map((entry) => (
              <div key={entry.needId} className="need-read">
                <div className="finding-top">
                  <Status status={entry.trip.status} />
                  {item.byNeed.length > 1 ? <span className="source">{entry.needLabel}</span> : null}
                </div>
                <p className="lead">{entry.trip.title}</p>
                <p>{entry.trip.detail}</p>
              </div>
            ))}
            <p className="fine">{item.sketch.involves}</p>
            <dl className="trip-route">
              <div>
                <dt>Route</dt>
                <dd>
                  {item.sketch.route}. {item.sketch.routeDistance}.
                </dd>
              </div>
              <div>
                <dt>Straight line</dt>
                <dd>{item.sketch.straightLine}. This skips the sidewalk and the crossings.</dd>
              </div>
            </dl>
          </div>
        </article>
      ))}
    </section>
  );
}
