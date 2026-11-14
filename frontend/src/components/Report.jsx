import { useEffect, useState } from "react";
import { ACCESS_NEEDS, LISTINGS } from "../data.js";
import { lifeReport } from "../life.js";
import { bedsLabel, money, questionsFor, summarize } from "../logic.js";
import { EvidenceSketch } from "../sketches.jsx";
import { LifeAround } from "./Life.jsx";
import { Counts, Status } from "./Status.jsx";

function investigationSteps(listing) {
  return [
    ...listing.investigations,
    { source: "Sample streets", text: lifeReport(listing.id, []).look },
  ];
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
    const steps = investigationSteps(listing);
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
  }, [listing, reduce, replay]);

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

  const steps = investigationSteps(listing);
  const summary = summarize(listing, prefs.needs);
  const life = lifeReport(listing.id, prefs.needs);
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
            <div className="report-intro">
              <h2>Inside this home, and the day around it</h2>
              <p>
                Can you move through this home, and can you get through an ordinary errand from
                the front door?
              </p>
              <p className="meta">{searchLabel(prefs.needs)}</p>
              {prefs.needs.length > 0 ? (
                <Counts counts={summary.counts} label="Inside" />
              ) : (
                <p>Add access needs and this page will read the home against them.</p>
              )}
              <button type="button" className="text-button" onClick={() => setReplay((n) => n + 1)}>
                Replay the investigation
              </button>
            </div>
            {prefs.needs.length === 0 ? (
              <p>
                <a href="#/needs">Describe what you need</a>
              </p>
            ) : (
              <>
              <h2 className="section-title">Inside this home</h2>
              <ul className="findings">
                {summary.findings.map((finding, index) => {
                  const previous = summary.findings[index - 1];
                  const showSketch = !previous || previous.scene !== finding.scene;
                  return (
                  <li key={finding.requirementId} className="finding">
                    {showSketch ? (
                      <div className="plate">
                        <EvidenceSketch
                          scene={finding.scene}
                          label={`${finding.source}. ${finding.title}. ${finding.detail}`}
                        />
                      </div>
                    ) : null}
                    <div className="finding-copy">
                      <div className="finding-top">
                        <Status status={finding.status} />
                        <span className="source">{finding.source}</span>
                      </div>
                      <h3>{finding.title}</h3>
                      <p>{finding.detail}</p>
                      <p className="fine">Your requirement: {finding.label}.</p>
                    </div>
                  </li>
                  );
                })}
              </ul>
              <LifeAround listingId={listing.id} profileIds={prefs.needs} />
              </>
            )}
          </div>
          <aside className="rail">
            <section className="panel">
              <h2>Sources checked</h2>
              <ul className="source-list">
                {steps.map((step) => (
                  <li key={step.source}>
                    <span className="source">{step.source}</span>
                    <p>{step.text}</p>
                  </li>
                ))}
              </ul>
            </section>
            <section className="panel">
              <h2>Ask before you visit</h2>
              {questions.length === 0 && life.questions.length === 0 ? (
                <p>
                  Nothing on your list produced a follow-up. Confirm the details with the building
                  before you sign.
                </p>
              ) : (
                <>
                  {questions.length > 0 ? (
                    <ol className="asks">
                      {questions.map((item) => (
                        <li key={item.requirementId}>{item.ask}</li>
                      ))}
                    </ol>
                  ) : null}
                  {life.questions.length > 0 ? (
                    <>
                      <h3>About the neighborhood</h3>
                      <ol className="asks">
                        {life.questions.map((item) => (
                          <li key={item.ask}>{item.ask}</li>
                        ))}
                      </ol>
                    </>
                  ) : null}
                </>
              )}
            </section>
            <p className="fine">This is evidence and open questions. It is not an accessibility certification.</p>
          </aside>
        </div>
      )}
    </article>
  );
}
