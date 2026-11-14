import { lifeReport } from "../life.js";
import { EvidenceSketch } from "../sketches.jsx";
import { Counts, Status } from "./Status.jsx";

export function LifeAround({ listingId, profileIds }) {
  const life = lifeReport(listingId, profileIds);
  if (life.sections.length === 0) return null;

  return (
    <section className="life" aria-labelledby="life-title">
      <div className="report-intro">
        <h2 id="life-title">Life around here</h2>
        <p>
          An accessible apartment can still sit on a hard block. These notes ask whether a grocery
          trip, a pharmacy, a clinic, and a bus stop are realistic for the needs you selected.
        </p>
        <Counts counts={life.counts} label="Around" />
        <p className="fine">
          Sample neighborhood notes, not a live map and not a measured route. A later version can
          connect this section to the backend and to Vexcel imagery.
        </p>
      </div>
      {life.sections.map((section) => (
        <div key={section.id} className="life-section">
          <h3>{section.label}</h3>
          <p>{section.story}</p>
          <h4>The block</h4>
          <ul className="findings">
            {section.street.map((finding, index) => {
              const previous = section.street[index - 1];
              const showSketch = finding.scene !== "street-level" && (!previous || previous.scene !== finding.scene);
              return (
                <li key={finding.id} className="finding">
                  {showSketch ? (
                    <div className="plate">
                      <EvidenceSketch
                        scene={finding.scene}
                        label={`Sample sketch. ${finding.title}. ${finding.detail}`}
                      />
                    </div>
                  ) : null}
                  <div className="finding-copy">
                    <div className="finding-top">
                      <Status status={finding.status} />
                      <span className="source">{finding.source}</span>
                    </div>
                    <h3>{finding.title}</h3>
                    <p>{finding.detail}</p>
                    <p className="fine">{finding.label}.</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <h4>Daily trips</h4>
          <div className="trip-grid">
            {section.trips.map((item) => (
              <article key={item.id} className="trip">
                <div className="finding-top">
                  <Status status={item.status} />
                  <span className="source">{item.label}</span>
                </div>
                <h3>{item.name}</h3>
                <p>{item.title}</p>
                <p className="fine">{item.involves}</p>
                <dl className="trip-route">
                  <div>
                    <dt>Route</dt>
                    <dd>
                      {item.route}. {item.routeDistance}.
                    </dd>
                  </div>
                  <div>
                    <dt>Straight line</dt>
                    <dd>{item.straightLine}. This skips the sidewalk and the crossings.</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
