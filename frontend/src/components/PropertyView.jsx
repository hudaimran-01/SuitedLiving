import { useEffect, useState } from "react";
import { aerialReport } from "../propertyMedia.js";

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

  const ps = report.projectSidewalk;

  return (
    <section className="life" aria-labelledby="aerial-title">
      <h2 id="aerial-title">Around this home</h2>
      <p className="meta">{lead}</p>
      <Photo shot={neighborhood} onOpen={setZoom} />
      {ps ? (
        <div className="sidewalk-score-card">
          <div className="sidewalk-score-top">
            <div className="sidewalk-score-big">
              <span className="sidewalk-score-number">{ps.score_pct}%</span>
              <span className="sidewalk-score-sublabel">Sidewalk Access</span>
            </div>
            <div className="sidewalk-score-meta">
              <span
                className="sidewalk-score-badge"
                style={{
                  backgroundColor: ps.neighborhood_access_score >= 0.75 ? "var(--pine, #1f3d32)" : "#d97706",
                }}
              >
                {ps.radius_assessment || `${ps.grade} Accessibility Zone`}
              </span>
              <h3 className="sidewalk-score-heading">
                {ps.grade === "High" ? "High Accessibility Segment" : `${ps.grade} Accessibility Segment`} · Cited by Project Sidewalk
              </h3>
              <p className="sidewalk-score-citation">
                University of Washington Makeability Lab Sidewalk Audit Standards
              </p>
            </div>
          </div>

          {ps.why_rating ? (
            <div className="sidewalk-why-box">
              <h4 className="sidewalk-why-title">Why this area earned a {ps.score_pct}% rating:</h4>
              <p className="sidewalk-why-text">{ps.why_rating}</p>
            </div>
          ) : null}

          {ps.audit_breakdown ? (
            <div className="sidewalk-audit-grid">
              <div className="sidewalk-audit-item">
                <span className="sidewalk-audit-icon">♿</span>
                <div>
                  <strong>Sidewalk Continuity:</strong>
                  <p>{ps.audit_breakdown.continuous_sidewalks || `${ps.curb_ramp_percentage}% continuous`}</p>
                </div>
              </div>
              <div className="sidewalk-audit-item">
                <span className="sidewalk-audit-icon">🏁</span>
                <div>
                  <strong>Curb Ramps & Cuts:</strong>
                  <p>{ps.audit_breakdown.curb_ramps_status || "Standard ADA curb ramps"}</p>
                </div>
              </div>
              <div className="sidewalk-audit-item">
                <span className="sidewalk-audit-icon">📐</span>
                <div>
                  <strong>Surface & Cross-Slope:</strong>
                  <p>{ps.audit_breakdown.surface_condition || "Level concrete with standard slope"}</p>
                </div>
              </div>
              <div className="sidewalk-audit-item">
                <span className="sidewalk-audit-icon">↔️</span>
                <div>
                  <strong>Pathway Clearance:</strong>
                  <p>{ps.audit_breakdown.path_clearance || "Meets 36-inch wheelchair clearance"}</p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="sidewalk-legend-row">
            <span className="sidewalk-legend-item">
              <span className="sidewalk-dot green" /> Score ≥ 75%: High Accessibility (Continuous ADA ramps, step-free)
            </span>
            <span className="sidewalk-legend-item">
              <span className="sidewalk-dot yellow" /> 50–74%: Moderate (Minor slope / joint cracks)
            </span>
            <span className="sidewalk-legend-item">
              <span className="sidewalk-dot red" /> &lt; 50%: Barrier Warning (Missing ramp / obstacle)
            </span>
          </div>
        </div>
      ) : null}
      <ul className="check-list plain">
        {report.places.map((place) => (
          <li key={place.category} className="place-item">
            <span>{place.text}</span>
            {place.accessScorePct ? (
              <span
                className="sidewalk-pill"
                style={{ backgroundColor: place.accessColor || (place.accessScorePct >= 75 ? "#10B981" : "#F59E0B") }}
              >
                ♿ Sidewalk Access: {place.accessScorePct}%
              </span>
            ) : null}
          </li>
        ))}
      </ul>
      <Zoom shot={zoom} onClose={() => setZoom(null)} />
    </section>
  );
}
