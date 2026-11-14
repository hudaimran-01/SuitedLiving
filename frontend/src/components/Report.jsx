import { useEffect, useState } from "react";
import { ACCESS_NEEDS, LISTINGS } from "../data.js";
import { focusLife, requestStep } from "../life.js";
import { bedsLabel, money, questionsFor, summarize } from "../logic.js";
import { EvidenceSketch } from "../sketches.jsx";
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

function investigationSteps(listing, prefs) {
  const request = requestStep(prefs.needs, prefs.nearby);
  return [...listing.investigations, ...(request ? [request] : [])];
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
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [replay, setReplay] = useState(0);
  const [shown, setShown] = useState(reduce ? 99 : 0);
  const [done, setDone] = useState(reduce);

  useEffect(() => {
    if (!listing) return undefined;
    const steps = investigationSteps(listing, prefs);
    if (reduce) {
      setShown(steps.length);
      setDone(true);
      return undefined;
    }
    setShown(0);
    setDone(false);
    const timers = steps.map((_, index) =>
      window.setTimeout(() => setShown(index + 1), 700 * (index + 1)),
    );
    timers.push(window.setTimeout(() => setDone(true), 700 * steps.length + 400));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [listing, reduce, replay, prefs.nearby, prefs.needs]);

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

  const steps = investigationSteps(listing, prefs);
  const summary = summarize(listing, prefs.needs);
  const life = focusLife(listing.id, prefs.needs, prefs.nearby);
  const questions = questionsFor(summary.findings);
  const savedOn = saved.includes(listing.id);
  const latest = steps[Math.min(shown, steps.length) - 1];

  function skip() {
    setShown(steps.length);
    setDone(true);
  }

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
            {listing.unit} · {listing.address}, {listing.place} · {bedsLabel(listing.beds)} ·{" "}
            {listing.baths} bath · {listing.sqft} sqft · {listing.available}
          </p>
        </div>
        <div className="report-side">
          <p className="rent">
            {money(listing.rent)}
            <span> / mo</span>
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

      {!done ? (
        <section className="invest" aria-labelledby="invest-title">
          <div className="plate">
            <EvidenceSketch scene={listing.scene} label={listing.sketchLabel} />
          </div>
          <div>
            <p className="eyebrow">Investigating</p>
            <h2 id="invest-title">Looking through {listing.name}</h2>
            <p>{searchLabel(prefs.needs)}</p>
            <ol className="timeline">
              {steps.map((step, index) => (
                <li key={step.source} className={index < shown ? "is-on" : undefined}>
                  <span className="source">{step.source}</span>
                  <p>{index < shown ? step.text : "Not checked yet"}</p>
                </li>
              ))}
            </ol>
            <p className="sr-only" aria-live="polite">
              {latest ? `${latest.source}. ${latest.text}` : "Starting the investigation."}
            </p>
            <button type="button" className="button" onClick={skip}>
              Show the report
            </button>
            <p className="fine">
              Sample notes for the pitch. A live version would pull CoStar, Vexcel, and Matterport
              here.
            </p>
          </div>
        </section>
      ) : (
        <div className="report-layout">
          <div>
            {prefs.needs.length === 0 ? (
              <p>
                <a href="#/needs">Describe what you need</a>
              </p>
            ) : (
              <>
                <section className="check-group" aria-labelledby="inside-title">
                  <h2 id="inside-title">Inside this home</h2>
                  <p className="meta">{searchLabel(prefs.needs)} Open a line for the evidence.</p>
                  <FindingList findings={summary.findings} statuses={["barrier"]} />
                </section>
                <LifeAround listingId={listing.id} profileIds={prefs.needs} nearby={prefs.nearby} />
                <FindingList findings={summary.findings} statuses={["observed", "unknown"]} />
                <button type="button" className="text-button" onClick={() => setReplay((n) => n + 1)}>
                  Replay the investigation
                </button>
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
                  {life.questions.map((item) => (
                    <li key={item.ask}>
                      <strong>{item.label}.</strong> {item.ask}
                    </li>
                  ))}
                </ul>
              )}
              <p className="fine">
                Sources: {steps.map((step) => step.source).join(", ")}. Sample notes, not a certification.
              </p>
            </section>
          </aside>
        </div>
      )}
    </article>
  );
}
