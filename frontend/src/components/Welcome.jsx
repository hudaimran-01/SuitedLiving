import { ACCESS_NEEDS, LISTINGS } from "../data.js";
import { lifeReport } from "../life.js";
import { findingFor, money } from "../logic.js";
import { ListingPhoto } from "./ListingPhoto.jsx";
import { Status } from "./Status.jsx";

const PREVIEW = [
  ["wheelchair", "step-free"],
  ["low-vision", "lighting"],
  ["hard-of-hearing", "alarms"],
];

export function Welcome({ listings = LISTINGS, onDemo }) {
  const home = listings[0];
  const findings = PREVIEW.map(([profileId, checkId]) => ({
    profile: ACCESS_NEEDS.find((item) => item.id === profileId).label,
    ...findingFor(home, checkId),
  }));
  const grocery = lifeReport(home.id, ["wheelchair"]).sections[0]?.trips.find((item) => item.id === "grocery");

  return (
    <div className="welcome">
      <div className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Accessible housing, investigated</p>
          <h1 id="page-title">Know before you visit.</h1>
          <p className="dek">
            Home search that starts from how you move, see, and hear. Say what you need
            nearby in your own words. InsideOut reads the home, then that trip, and separates what
            it observed, what might block you, and what it still cannot tell.
          </p>
          <div className="actions">
            <a className="button primary" href="#/discover">
              Browse homes
            </a>
            <a className="button" href="#/discover" onClick={onDemo}>
              Try the sample search
            </a>
          </div>
        </div>
        <article className="sheet" aria-label={`Sample report for ${home.name}`}>
          <div className="plate">
            <ListingPhoto listing={home} />
          </div>
          <div className="sheet-body">
            <p className="eyebrow">Sample report</p>
            <h2>{home.name}</h2>
            <p className="sheet-meta">
              {home.place} · {money(home.price)} for sale
            </p>
            <ul className="preview-list">
              {findings.map((finding) => (
                <li key={finding.profile}>
                  <span className="source">{finding.profile}</span>
                  <Status status={finding.status} />
                  <span>{finding.title}</span>
                </li>
              ))}
              {grocery ? (
                <li>
                  <span className="source">Around</span>
                  <Status status={grocery.status} />
                  <span>{grocery.title}</span>
                </li>
              ) : null}
            </ul>
            <p className="fine">Evidence and open questions. Not a certification.</p>
          </div>
        </article>
      </div>
      <ol className="steps">
        <li>
          <span>1</span>
          <div>
            <h2>Filter the homes</h2>
            <p>Wheelchair, low vision, hard of hearing, stairs and hills, or any mix. Add a budget, a bedroom count, and what you need nearby. Leave the filters empty to see every sample home.</p>
          </div>
        </li>
        <li>
          <span>2</span>
          <div>
            <h2>See the list reorder</h2>
            <p>The same page orders homes for the building and the errand you asked about. A different need can change both.</p>
          </div>
        </li>
        <li>
          <span>3</span>
          <div>
            <h2>Read the evidence, including the gaps</h2>
            <p>The report covers the home and the block. Observed features, possible barriers, and unknowns stay separate.</p>
          </div>
        </li>
      </ol>
    </div>
  );
}
