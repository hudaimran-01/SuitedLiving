import { useEffect, useState } from "react";

function shotsFor(listing) {
  const shots = [];
  const address = listing.address || listing.name;
  const still = listing.images?.matterport;
  if (still) {
    shots.push(
      listing.images.hasScan
        ? {
            src: still,
            label: "Scan preview",
            detail: `Still image of the 3D scan of ${address}. Widths are not measured in this picture.`,
            note: null,
          }
        : {
            src: still,
            label: "Photo",
            detail: `Photo of ${address}.`,
            note: null,
          },
    );
  }
  for (const photo of listing.images?.photos || []) shots.push(photo);
  return shots;
}

function lookFor(shot, needIds) {
  const room = `${shot.label} ${shot.detail}`.toLowerCase();
  const needs = new Set(needIds || []);
  const moving = needs.has("wheelchair") || needs.has("hills");
  if (moving && /front|entry|exterior|foyer|door/.test(room)) return "Look for a step or a ramp at the door.";
  if (moving && /bath|shower/.test(room)) return "Look for a curb at the shower and room to turn.";
  if (moving && /kitchen|living|bed|hall/.test(room)) return "Look at the doorway and whether the floor stays level.";
  if (needs.has("low-vision")) return "Look for a light and a clear edge at the doorway.";
  if (needs.has("hard-of-hearing")) return "A flashing alarm would be on the ceiling or the wall.";
  return "";
}

export function Gallery({ listing, needIds }) {
  const shots = shotsFor(listing);
  const [open, setOpen] = useState(null);
  const shot = open == null ? null : shots[open];

  useEffect(() => {
    if (open == null) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(null);
      if (event.key === "ArrowRight") setOpen((index) => (index + 1) % shots.length);
      if (event.key === "ArrowLeft") setOpen((index) => (index - 1 + shots.length) % shots.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, shots.length]);

  if (shots.length === 0) return null;
  const hint = shot ? lookFor(shot, needIds) : "";

  return (
    <section className="gallery" aria-labelledby="photos-title">
      <h2 id="photos-title">Look through the home</h2>
      <p className="meta">Each photo is labeled. Open one to see what is in it.</p>
      <ul className="photo-row">
        {shots.map((item, index) => (
          <li key={`${item.src}-${index}`}>
            <button type="button" className="shot" onClick={() => setOpen(index)}>
              <img src={item.src} alt="" />
              <span>
                <strong>{item.label}.</strong> {item.detail}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {open != null && shot ? (
        <div className="lightbox" role="dialog" aria-modal="true" aria-labelledby="shot-title">
          <button type="button" className="lightbox-back" aria-label="Close photo" onClick={() => setOpen(null)} />
          <figure className="lightbox-card">
            <img src={shot.src} alt={shot.detail} />
            <figcaption>
              <h3 id="shot-title">{shot.label}</h3>
              <p>{shot.detail}</p>
              {hint ? <p className="look">{hint}</p> : null}
              {shot.note ? <p className="fine">{shot.note}</p> : null}
            </figcaption>
            <div className="lightbox-nav">
              <button type="button" onClick={() => setOpen((index) => (index - 1 + shots.length) % shots.length)}>
                Previous
              </button>
              <button type="button" onClick={() => setOpen(null)}>Close</button>
              <button type="button" onClick={() => setOpen((index) => (index + 1) % shots.length)}>
                Next
              </button>
            </div>
          </figure>
        </div>
      ) : null}
    </section>
  );
}
