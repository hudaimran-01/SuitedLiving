import { useState } from "react";
import { alsoHelps, buildingBrief, deskPortfolio, passwordMatches } from "../admin.js";
import { money } from "../logic.js";
import { propertyMediaFor } from "../propertyMedia.js";
import { Status } from "./Status.jsx";

const DESK_KEY = "suitedliving-desk";

function readOpen() {
  try {
    return sessionStorage.getItem(DESK_KEY) === "open";
  } catch {
    return false;
  }
}

function Coverage({ counts }) {
  const total = counts.observed + counts.barrier + counts.unknown;
  const parts = [
    ["observed", counts.observed],
    ["barrier", counts.barrier],
    ["unknown", counts.unknown],
  ];
  return (
    <div
      className="coverage"
      role="img"
      aria-label={`${counts.observed} observed, ${counts.barrier} potential barriers, ${counts.unknown} to confirm`}
    >
      {parts.map(([status, count]) =>
        count > 0 ? <span key={status} className={status} style={{ flexGrow: count }} /> : null,
      )}
      {total === 0 ? <span className="unknown" style={{ flexGrow: 1 }} /> : null}
    </div>
  );
}

function Gate({ onUnlock }) {
  const [password, setPassword] = useState("");
  const [rejected, setRejected] = useState(false);

  function submit(event) {
    event.preventDefault();
    if (!passwordMatches(password)) {
      setRejected(true);
      return;
    }
    try {
      sessionStorage.setItem(DESK_KEY, "open");
    } catch {
      /* the desk still opens for this page load */
    }
    onUnlock();
  }

  return (
    <form className="desk-gate" onSubmit={submit}>
      <p className="eyebrow">For CoStar</p>
      <h1 id="page-title">Listing desk</h1>
      <p>
        Every access check on a building, grouped by who it helps. CoStar can attach the brief to
        the listing. The same pages are the record a resident would want to read.
      </p>
      <label htmlFor="desk-password">Password</label>
      <input
        id="desk-password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
          setRejected(false);
        }}
      />
      {rejected ? (
        <p className="desk-reject" role="alert">
          That password does not open the desk.
        </p>
      ) : null}
      <button className="button primary" type="submit">
        Open the desk
      </button>
      <p className="fine">Demo password: costar</p>
    </form>
  );
}

function Portfolio({ listings, onLock }) {
  const rows = deskPortfolio(listings, propertyMediaFor);
  return (
    <div className="desk">
      <header className="desk-head">
        <div>
          <p className="eyebrow">For CoStar</p>
          <h1 id="page-title">Listing desk</h1>
          <p className="meta">
            Buildings with the most unconfirmed checks are first. A recorded answer is evidence from
            a named source. It is not a certification.
          </p>
        </div>
        <button className="button" type="button" onClick={onLock}>
          Lock
        </button>
      </header>
      <ul className="desk-index">
        {rows.map((brief) => (
          <li key={brief.id}>
            <a className="desk-card" href={`#/admin/${brief.id}`}>
              <span className="desk-card-top">
                <strong>{brief.name}</strong>
                <span>{money(brief.price)}</span>
              </span>
              <span className="meta">
                {brief.place} · {brief.known} of {brief.total} checks recorded
              </span>
              <Coverage counts={brief.counts} />
              <span className="desk-card-counts">
                <span>{brief.counts.observed} observed</span>
                <span>{brief.counts.barrier} potential barriers</span>
                <span>{brief.counts.unknown} to confirm</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Brief({ listing, onLock }) {
  const brief = buildingBrief(listing, propertyMediaFor(listing.id));
  return (
    <article className="desk">
      <p className="back">
        <a href="#/admin">All buildings</a>
      </p>
      <header className="desk-head">
        <div>
          <p className="eyebrow">Access brief</p>
          <h1 id="page-title">{brief.name}</h1>
          <p className="meta">
            {brief.address} · {brief.place} · {brief.floor} · {money(brief.price)}
          </p>
        </div>
        <button className="button" type="button" onClick={onLock}>
          Lock
        </button>
      </header>

      <section className="panel desk-summary" aria-labelledby="record-title">
        <h2 id="record-title">What the record can support</h2>
        <p>
          {brief.known} of {brief.total} checks have a recorded answer. {brief.counts.unknown} still
          need a person. CoStar can publish the recorded lines with their source, and should leave
          the open questions on the listing.
        </p>
        <Coverage counts={brief.counts} />
        <ul className="desk-facts">
          <li>{brief.counts.observed} observed</li>
          <li>{brief.counts.barrier} potential barriers</li>
          <li>{brief.counts.unknown} to confirm</li>
          <li>{brief.sources.length ? brief.sources.join(", ") : "No source named"}</li>
          <li>{brief.photos} photos</li>
          <li>{brief.floorplans} floor plans</li>
          <li>{brief.hasScan ? "Matterport scan linked" : "No scan linked"}</li>
        </ul>
      </section>

      {brief.groups.map((group) => (
        <section key={group.id} className="desk-group" aria-labelledby={`group-${group.id}`}>
          <h2 id={`group-${group.id}`}>{group.label}</h2>
          <p>{group.audience}</p>
          <ul className="desk-findings">
            {group.findings.map((finding) => {
              const shared = alsoHelps(finding.requirementId, group.id);
              return (
                <li key={finding.requirementId} className={`desk-finding ${finding.status}`}>
                  <Status status={finding.status} />
                  <div>
                    <strong>{finding.label}</strong>
                    <p>{finding.title}</p>
                    <p className="desk-detail">{finding.detail}</p>
                    <p className="fine">
                      {finding.source}
                      {shared.length ? ` · Also matters for ${shared.join(" and ")}` : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <section aria-labelledby="questions-title">
        <h2 id="questions-title">Still open</h2>
        {brief.questions.length === 0 ? (
          <p>Every check on this building has an observed answer.</p>
        ) : (
          <ul className="desk-questions">
            {brief.questions.map((finding) => (
              <li key={finding.requirementId}>
                <strong>{finding.label}.</strong> {finding.ask}
              </li>
            ))}
          </ul>
        )}
      </section>

      {brief.agentNotes.length > 0 ? (
        <section aria-labelledby="agent-title">
          <h2 id="agent-title">From the agent, not verified</h2>
          <ul>
            {brief.agentNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <p className="fine">Useful listing copy. It is not a measurement.</p>
        </section>
      ) : null}

      {brief.investigations.length > 0 ? (
        <section aria-labelledby="looked-title">
          <h2 id="looked-title">What was looked at</h2>
          <ul>
            {brief.investigations.map((item) => (
              <li key={`${item.source}-${item.text}`}>
                <strong>{item.source}.</strong> {item.text}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {brief.places.length > 0 ? (
        <section aria-labelledby="around-title">
          <h2 id="around-title">Around the building</h2>
          <p className="meta">Sidewalk distances from the aerial file. They describe the block, not the doorway.</p>
          <ul>
            {brief.places.map((place) => (
              <li key={place.category}>{place.text}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}

export function Admin({ listings, homeId }) {
  const [open, setOpen] = useState(readOpen);

  function lock() {
    try {
      sessionStorage.removeItem(DESK_KEY);
    } catch {
      /* locking still hides the desk in this page */
    }
    setOpen(false);
  }

  if (!open) return <Gate onUnlock={() => setOpen(true)} />;

  if (!homeId) return <Portfolio listings={listings} onLock={lock} />;

  const listing = listings.find((item) => item.id === homeId);
  if (!listing) {
    return (
      <div className="empty">
        <h1 id="page-title">That building is not on the desk</h1>
        <a className="button" href="#/admin">
          All buildings
        </a>
      </div>
    );
  }
  return <Brief listing={listing} onLock={lock} />;
}
