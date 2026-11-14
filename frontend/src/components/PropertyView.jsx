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
      <img src={shot.src} alt={shot.detail} />
      <span>{shot.label}</span>
    </button>
  );
}

export function ScannedPlan({ media }) {
  const views = [
    {
      id: "scan",
      label: "Scan plan",
      src: media.floorScan,
      detail: "Matterport floor plan with the scan points.",
    },
    {
      id: "drawn",
      label: "Drawn walls",
      src: media.floorDrawn,
      detail: "Drawn wall plan from the Matterport scan.",
    },
  ];
  if (media.furnished) {
    views.push({
      id: "furnished",
      label: "Furnished and empty",
      src: media.furnished,
      detail: "The same rooms furnished and empty, so the floor and the doorways are easier to see.",
    });
  }
  const [viewId, setViewId] = useState(views[0].id);
  const [zoom, setZoom] = useState(null);
  const view = views.find((item) => item.id === viewId) || views[0];

  return (
    <section className="scanned-plan" aria-labelledby="plan-title">
      <h2 id="plan-title">Floor plan</h2>
      <p className="meta">From the Matterport scan. Open it to look at the rooms.</p>
      <div className="view-switch" role="group" aria-label="Floor plan views">
        {views.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === view.id}
            onClick={() => setViewId(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <Photo shot={view} onOpen={setZoom} />
      <p className="fine">
        This is the plan image. Room colors need each room’s outline, and that outline is not in the file.
      </p>
      {media.scanNotes.length > 0 ? (
        <>
          <h3>From the scan</h3>
          <ul>
            {media.scanNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <p className="fine">The person who scanned the home wrote this. It is not a measurement.</p>
        </>
      ) : null}
      <Zoom shot={zoom} onClose={() => setZoom(null)} />
    </section>
  );
}

export function AerialNearby({ media, nearby }) {
  const report = aerialReport(media, nearby);
  const [zoom, setZoom] = useState(null);
  const neighborhood = {
    src: media.neighborhood,
    label: "Neighborhood",
    detail: "Aerial view with the closest places this search found.",
  };
  const parcel = {
    src: media.parcel,
    label: "The lot",
    detail: "Overhead view of the home and the lot.",
  };
  const grocery = {
    src: media.groceryMatch,
    label: "Grocery match",
    detail: "Visual match for a grocery. Confirm it is the store you mean.",
  };
  let lead = "Straight-line distances from the aerial search. Steps on the sidewalk are not marked.";
  if (report.showGroceryMatch) {
    lead =
      "You asked about a store. The closest hit is a retail store, and the small picture is a visual match for a grocery. Confirm the store and the sidewalk. Steps on the walk are not marked.";
  } else if (report.showClinic) {
    lead =
      "You asked about care nearby. The closest hit is a medical place. Confirm the entrance and the sidewalk. Steps on the walk are not marked.";
  } else if (report.query.text && !report.query.recognized) {
    lead = `You wrote “${report.query.text}”. The places below are what this aerial search can show. Steps on the sidewalk are not marked.`;
  }

  return (
    <section className="life" aria-labelledby="aerial-title">
      <h2 id="aerial-title">Around this home</h2>
      <p className="meta">{lead}</p>
      <div className={report.showGroceryMatch ? "aerial-pair" : "aerial-single"}>
        <Photo shot={neighborhood} onOpen={setZoom} />
        <Photo shot={report.showGroceryMatch ? grocery : parcel} onOpen={setZoom} />
      </div>
      <ul className="check-list plain">
        {report.places.map((place) => (
          <li key={place.category}>{place.text}</li>
        ))}
        {report.pool ? <li>A pool shows on the aerial image.</li> : null}
      </ul>
      <Zoom shot={zoom} onClose={() => setZoom(null)} />
    </section>
  );
}
