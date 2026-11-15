import { useEffect, useState } from "react";
import { accessTone, aerialReport } from "../propertyMedia.js";

function Zoom({ shot, onClose }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!shot) return null;
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={shot.label}>
      <button type="button" className="lightbox-back" aria-label="Close" onClick={onClose} />
      <figure className="lightbox-card">
        <img src={shot.src} alt={shot.detail} />
        <h3>{shot.label}</h3>
        <p>{shot.detail}</p>
      </figure>
    </div>
  );
}

function Photo({ shot, onOpen }) {
  return (
    <button type="button" className="plan-hit" onClick={() => onOpen(shot)}>
      <img src={shot.src} alt="" />
      <span>
        <strong>{shot.label}.</strong> {shot.detail}
      </span>
    </button>
  );
}

export function ScanNotes({ media }) {
  if (!media?.scanNotes?.length) return null;
  return (
    <section className="agent-notes" aria-labelledby="scan-notes-title">
      <h2 id="scan-notes-title">From the scan</h2>
      <ul>
        {media.scanNotes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
      <p className="fine">The person who scanned the home wrote this. It is not a measurement.</p>
    </section>
  );
}

function SidewalkScore({ score }) {
  if (!score || score.score_pct == null) return null;
  const tone = accessTone(score.score_pct);
  const audit = score.audit_breakdown || {};
  const rows = [
    ["Sidewalk continuity", audit.continuous_sidewalks],
    ["Curb ramps", audit.curb_ramps_status],
    ["Surface", audit.surface_condition],
    ["Clearance", audit.path_clearance],
  ].filter(([, text]) => text);
  return (
    <section className="panel sidewalk-card" aria-labelledby="sidewalk-title">
      <div className="sidewalk-top">
        <p className={`sidewalk-number ${tone || ""}`}>
          {score.score_pct}%
          <span>Sidewalk access</span>
        </p>
        <div>
          <h3 id="sidewalk-title">{score.grade} on this block</h3>
          {score.description ? <p className="meta">{score.description}</p> : null}
        </div>
      </div>
      {score.why_rating ? <p>{score.why_rating}</p> : null}
      {rows.length > 0 ? (
        <dl className="sidewalk-audit">
          {rows.map(([label, text]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <ul className="sidewalk-legend">
        <li><span className="status observed">75% and up</span> Continuous ramps and a step-free walk</li>
        <li><span className="status unknown">50 to 74%</span> Minor slope or surface wear</li>
        <li><span className="status barrier">Under 50%</span> A missing ramp or an obstacle</li>
      </ul>
      <p className="fine">
        Project Sidewalk, University of Washington Makeability Lab. This scores the block, not the doorway.
      </p>
    </section>
  );
}

export function AerialNearby({ media, nearby }) {
  const report = aerialReport(media, nearby);
  const [zoom, setZoom] = useState(null);
  const neighborhood = {
    src: media.neighborhood,
    label: "Neighborhood",
    detail: "Aerial overview with the sidewalk walks this search found.",
  };
  let lead = "Walk times follow the sidewalk. Steps along the way are not marked.";
  if (report.showGroceryMatch) {
    lead =
      "You asked about a store. The closest sidewalk walk is to a retail store. Confirm it is the store you want. Steps along the way are not marked.";
  } else if (report.showClinic) {
    lead =
      "You asked about care nearby. The closest sidewalk walk is to a medical place. Confirm the entrance. Steps along the way are not marked.";
  } else if (report.query.text && !report.query.recognized) {
    lead = `You wrote “${report.query.text}”. The places below are what this aerial search can show. Steps along the way are not marked.`;
  }

  return (
    <section className="life" aria-labelledby="aerial-title">
      <h2 id="aerial-title">Around this home</h2>
      <p className="meta">{lead}</p>
      <Photo shot={neighborhood} onOpen={setZoom} />
      <SidewalkScore score={report.projectSidewalk} />
      {report.places.length > 0 ? (
        <div className="panel">
          <h3>Nearby walks</h3>
          <ul className="sidewalk-place-list">
            {report.places.map((place) => (
              <li key={place.category}>
                <span>{place.text}</span>
                {place.accessScorePct != null ? (
                  <span className={`status ${accessTone(place.accessScorePct)}`}>
                    Sidewalk {place.accessScorePct}%
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <Zoom shot={zoom} onClose={() => setZoom(null)} />
    </section>
  );
}
