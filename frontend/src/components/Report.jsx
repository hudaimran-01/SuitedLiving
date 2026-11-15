import { ACCESS_NEEDS, LISTINGS } from "../data.js";
import { focusLife } from "../life.js";
import { listingFacts, money, questionsFor, summarize } from "../logic.js";
import { Gallery } from "./Gallery.jsx";
import { LifeAround } from "./Life.jsx";
import { AerialNearby, ScanNotes } from "./PropertyView.jsx";
import { ListingPlan } from "./ListingPlan.jsx";
import { Tour } from "./Tour.jsx";
import { propertyMediaFor } from "../propertyMedia.js";
import { ContactManager } from "./Contact.jsx";
import { Status } from "./Status.jsx";

const GROUPS = [
  ["barrier", "Issues"],
  ["observed", "What checks out"],
  ["unknown", "Confirm before you visit"],
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

export function Report({ homeId, listings = LISTINGS, prefs, saved, onToggleSaved }) {
  const listing = listings.find((item) => item.id === homeId);

  if (!listing) {
    return (
      <div className="empty">
        <h1 id="page-title">That home is not in this list</h1>
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
  const media = propertyMediaFor(listing.id);

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
            {listing.address} · {listingFacts(listing).join(" · ")}
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
          <ContactManager manager={listing.manager} />
        </div>
      </header>

      <Tour listing={listing} />
      <ListingPlan listing={listing} needIds={prefs.needs} />
      {listing.agentNotes?.length > 0 ? (
        <section className="agent-notes" aria-labelledby="notes-title">
          <h2 id="notes-title">From the agent's description, not verified</h2>
          <ul>
            {listing.agentNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <p className="fine">The agent wrote this. It is useful, and it is not a measurement.</p>
        </section>
      ) : null}
      <ScanNotes media={media} />
      <Gallery listing={listing} needIds={prefs.needs} />
      {media ? <AerialNearby media={media} nearby={prefs.nearby} /> : null}

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
                <FindingList findings={summary.findings} statuses={["barrier"]} />
              </section>
              {media ? null : (
                <LifeAround
                  listingId={listing.id}
                  profileIds={prefs.needs}
                  nearby={prefs.nearby}
                  vexcelSrc={listing.images?.vexcel}
                />
              )}
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
            <p className="fine">Sources: CoStar, Vexcel, Matterport. Not a certification.</p>
          </section>
        </aside>
      </div>
    </article>
  );
}
