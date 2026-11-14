import { useEffect, useState } from "react";

function shotsFor(listing) {
  const shots = [];
  if (listing.images?.matterport) {
    shots.push({
      src: listing.images.matterport,
      label: "3D scan",
      detail: `Scan of ${listing.name}. Walk the entrance, the doors, and the bathroom.`,
      note: "Widths are not measured in this view.",
      tour: listing.images.modelId ? `https://my.matterport.com/show/?m=${listing.images.modelId}` : null,
    });
  }
  for (const photo of listing.images?.photos || []) shots.push(photo);
  return shots;
}

function lookFor(shot, needIds) {
  if (shot.tour) return "Open the scan and check the entrance, the doors, and the bathroom.";
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
              <span>{item.label}</span>
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
              {shot.tour ? (
                <a className="button" href={shot.tour} target="_blank" rel="noreferrer">
                  Open the 3D walkthrough
                </a>
              ) : null}
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
