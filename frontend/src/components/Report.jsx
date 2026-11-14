import { ACCESS_NEEDS, LISTINGS } from "../data.js";
import { focusLife } from "../life.js";
import { bedsLabel, money, questionsFor, summarize } from "../logic.js";
import { floorPlanFor } from "../floorplans.js";
import { FloorPlan } from "./FloorPlan.jsx";
import { ImageSlot } from "./ImageSlot.jsx";
import { LifeAround } from "./Life.jsx";
import { Status } from "./Status.jsx";

const GROUPS = [
  ["barrier", "Issues"],
  ["observed", "What checks out"],
  ["unknown", "Not checked yet"],
];

function FindingList({ findings, statuses }) {
  return GROUPS.filter(([status]) => statuses.includes(status)).map(([status, label]) => {
    const items = findings.filter((finding) => finding.status === status);
    if (items.length === 0) return null;
    return (
      <section key={status} className="check-group" aria-labelledby={`inside-${status}`}>
        <h3 id={`inside-${status}`}>
          {label}
          <span>{items.length}</span>
        </h3>
        <ul className="check-list">
          {items.map((finding) => (
            <li key={finding.requirementId}>
              <details>
                <summary>
                  <Status status={finding.status} />
                  <span>
                    <strong>{finding.label}.</strong> {finding.title}
                  </span>
                </summary>
                <p>{finding.detail}</p>
                <p className="fine">{finding.source}</p>
              </details>
            </li>
          ))}
        </ul>
      </section>
    );
  });
}

function searchLabel(needIds) {
  const labels = ACCESS_NEEDS.filter((item) => needIds.includes(item.id)).map((item) => item.label);
  if (labels.length === 0) return "No access need selected yet.";
  if (labels.length === 1) return `Searching for ${labels[0].toLowerCase()}.`;
  const last = labels[labels.length - 1].toLowerCase();
  const rest = labels.slice(0, -1).map((label) => label.toLowerCase());
  return `Searching for ${rest.join(", ")} and ${last}.`;
}

export function Report({ homeId, prefs, saved, onToggleSaved }) {
  const listing = LISTINGS.find((item) => item.id === homeId);

  if (!listing) {
    return (
      <div className="empty">
        <h1 id="page-title">That home is not in the sample set</h1>
        <a className="button" href="#/discover">
          Back to homes
        </a>
      </div>
    );
  }

  const summary = summarize(listing, prefs.needs);
  const life = focusLife(listing.id, prefs.needs, prefs.nearby);
  const questions = questionsFor(summary.findings);
  const savedOn = saved.includes(listing.id);
  const scanCaption = listing.images?.hasScan
    ? "Matterport interior scan. The photo or panorama ties in here."
    : "No Matterport scan is linked for this home yet. The image will sit here when there is one.";

  return (
    <article className="report">
      <p className="back">
        <a href="#/discover">Back to homes</a>
      </p>
      <header className="report-head">
        <div>
          <p className="eyebrow">{listing.floor}</p>
          <h1 id="page-title">{listing.name}</h1>
          <p className="meta">
            {listing.kind} · {listing.unit} · {listing.address}, {listing.place} · {bedsLabel(listing.beds)} ·{" "}
            {listing.baths} bath · {listing.sqft} sqft · {listing.available}
          </p>
        </div>
        <div className="report-side">
          <p className="rent">
            {money(listing.price)}
            <span> for sale</span>
          </p>
          <button
            type="button"
            className="button"
            aria-pressed={savedOn}
            onClick={() => onToggleSaved(listing.id)}
          >
            {savedOn ? "Saved" : "Save to compare"}
          </button>
        </div>
      </header>

      <FloorPlan key={listing.id} plan={floorPlanFor(listing.id)} needIds={prefs.needs} />

      <div className="report-layout">
        <div>
          {prefs.needs.length === 0 ? (
            <p>
              <a href="#/discover">Set your filters</a>
            </p>
          ) : (
            <>
              <section className="check-group" aria-labelledby="inside-title">
                <h2 id="inside-title">Inside this home</h2>
                <p className="meta">{searchLabel(prefs.needs)} Open a line for the evidence.</p>
                <ImageSlot source="Matterport" src={listing.images?.matterport} caption={scanCaption} />
                <FindingList findings={summary.findings} statuses={["barrier"]} />
              </section>
              <LifeAround
                listingId={listing.id}
                profileIds={prefs.needs}
                nearby={prefs.nearby}
                vexcelSrc={listing.images?.vexcel}
              />
              <FindingList findings={summary.findings} statuses={["observed", "unknown"]} />
            </>
          )}
        </div>
        <aside className="rail">
          <section className="panel">
            <h2>Ask before you visit</h2>
            {questions.length === 0 && life.questions.length === 0 ? (
              <p>No follow-up questions for this search.</p>
            ) : (
              <ul className="asks">
                {questions.map((item) => (
                  <li key={item.requirementId}>
                    <strong>{item.label}.</strong> {item.ask}
                  </li>
                ))}
                {life.questions.map((item, index) => (
                  <li key={`${item.ask}-${index}`}>
                    <strong>{item.label}.</strong> {item.ask}
                  </li>
                ))}
              </ul>
            )}
            <p className="fine">Sources: CoStar, Vexcel, Matterport. Sample notes, not a certification.</p>
          </section>
        </aside>
      </div>
    </article>
  );
}
