import { ACCESS_NEEDS, LISTINGS } from "../data.js";
import { findingFor, money } from "../logic.js";
import { EvidenceSketch } from "../sketches.jsx";
import { Status } from "./Status.jsx";

const PREVIEW = [
  ["wheelchair", "step-free"],
  ["low-vision", "lighting"],
  ["hard-of-hearing", "alarms"],
];

export function Welcome({ onDemo }) {
  const home = LISTINGS[0];
  const findings = PREVIEW.map(([profileId, checkId]) => ({
    profile: ACCESS_NEEDS.find((item) => item.id === profileId).label,
    ...findingFor(home, checkId),
  }));

  return (
    <div className="welcome">
      <div className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Accessible housing, investigated</p>
          <h1 id="page-title">Know before you visit.</h1>
          <p className="dek">
            Apartment search that starts from how you move, see, and hear. InsideOut reads each
            home for wheelchair, low vision, or hard of hearing, then separates what it observed,
            what might block you, and what it still cannot tell.
          </p>
          <div className="actions">
            <a className="button primary" href="#/needs">
              Describe what you need
            </a>
            <a className="button" href="#/discover" onClick={onDemo}>
              Try the Princeton example
            </a>
          </div>
        </div>
        <article className="sheet" aria-label="Sample report for Linden Court">
          <div className="plate">
            <EvidenceSketch scene={home.scene} label={home.sketchLabel} />
          </div>
          <div className="sheet-body">
            <p className="eyebrow">Sample report</p>
            <h2>{home.name}</h2>
            <p className="sheet-meta">
              {home.floor} · {money(home.rent)} / month
            </p>
            <ul className="preview-list">
              {findings.map((finding) => (
                <li key={finding.profile}>
                  <span className="source">{finding.profile}</span>
                  <Status status={finding.status} />
                  <span>{finding.title}</span>
                </li>
              ))}
            </ul>
            <p className="fine">Evidence and open questions. Not a certification.</p>
          </div>
        </article>
      </div>
      <ol className="steps">
        <li>
          <span>1</span>
          <div>
            <h2>Say what to look for</h2>
            <p>Wheelchair, low vision, hard of hearing, or any mix. Budget and bedrooms still narrow the search.</p>
          </div>
        </li>
        <li>
          <span>2</span>
          <div>
            <h2>Browse apartments for that search</h2>
            <p>Homes are ordered for the needs you picked. A different need can put a different home first.</p>
          </div>
        </li>
        <li>
          <span>3</span>
          <div>
            <h2>Read the evidence, including the gaps</h2>
            <p>Observed features, possible barriers, and unknowns stay separate, with a question to ask next.</p>
          </div>
        </li>
      </ol>
    </div>
  );
}
