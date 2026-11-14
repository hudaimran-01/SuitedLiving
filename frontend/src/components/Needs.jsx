import { ACCESS_NEEDS, DEMO_PREFS, LISTINGS } from "../data.js";
import { interpretNearby } from "../life.js";
import { bedsLabel, money, visibleListings } from "../logic.js";

const PHRASES = [
  "a grocery store I can get to",
  "a pharmacy",
  "a clinic or doctor",
  "a bus or train",
];

const BEDS = [
  { value: 0, label: "Studio" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3+" },
];

export function Needs({ prefs, setPrefs, onDemo }) {
  const count = visibleListings(LISTINGS, prefs).length;
  const countLabel = count === 1 ? "Show 1 home" : `Show ${count} homes`;

  function addPhrase(phrase) {
    setPrefs((current) => {
      const existing = current.nearby || "";
      if (existing.toLowerCase().includes(phrase.toLowerCase())) return current;
      const next = existing.trim() ? `${existing.trim()}, and ${phrase}` : phrase[0].toUpperCase() + phrase.slice(1);
      return { ...current, nearby: next };
    });
  }

  function toggleNeed(id) {
    setPrefs((current) => {
      const needs = current.needs.includes(id)
        ? current.needs.filter((item) => item !== id)
        : [...current.needs, id];
      return { ...current, needs };
    });
  }

  return (
    <div className="needs">
      <div className="page-head">
        <p className="eyebrow">Your needs</p>
        <h1 id="page-title">What are your access needs?</h1>
        <p className="dek">
          Choose how you need to move, see, or hear. Then describe, in your own words, what you
          need to reach from home. The report follows that instead of listing every errand.
        </p>
      </div>

      <div className="needs-layout">
        <section className="panel" aria-labelledby="housing-heading">
          <h2 id="housing-heading">Housing</h2>
          <div className="field">
            <span className="field-label">Area</span>
            <p className="static-value">Princeton, NJ</p>
            <p className="fine">The sample set is Princeton only.</p>
          </div>
          <div className="field">
            <div className="rent-head">
              <label htmlFor="rent">Monthly budget</label>
              <output htmlFor="rent">{money(prefs.maxRent)}</output>
            </div>
            <input
              id="rent"
              type="range"
              min="1200"
              max="4000"
              step="20"
              value={prefs.maxRent}
              onChange={(event) =>
                setPrefs((current) => ({ ...current, maxRent: Number(event.target.value) }))
              }
            />
            <div className="range-scale" aria-hidden="true">
              <span>$1,200</span>
              <span>$4,000</span>
            </div>
          </div>
          <fieldset className="field">
            <legend>Bedrooms</legend>
            <div className="segmented">
              {BEDS.map((option) => (
                <label key={option.value} className={prefs.beds === option.value ? "is-on" : ""}>
                  <input
                    type="radio"
                    name="beds"
                    value={option.value}
                    checked={prefs.beds === option.value}
                    onChange={() => setPrefs((current) => ({ ...current, beds: option.value }))}
                  />
                  {option.label}
                </label>
              ))}
            </div>
            <p className="fine">Selected: {bedsLabel(prefs.beds)}.</p>
          </fieldset>
        </section>

        <section className="panel" aria-labelledby="access-heading">
          <div className="panel-head">
            <h2 id="access-heading">Access</h2>
            <button type="button" className="text-button" onClick={onDemo}>
              Fill the Princeton example
            </button>
          </div>
          <div className="need-grid">
            {ACCESS_NEEDS.map((need) => {
              const checked = prefs.needs.includes(need.id);
              return (
                <label key={need.id} className={checked ? "need is-on" : "need"}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleNeed(need.id)}
                  />
                  <span>
                    <span className="need-label">{need.label}</span>
                    <span className="need-detail">{need.detail}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </section>
      </div>

      {prefs.needs.length > 0 ? (
        <section className="panel nearby-panel" aria-labelledby="nearby-heading">
          <h2 id="nearby-heading">What do you need nearby?</h2>
          <p>
            Write it the way you would say it. A grocery store, or a pharmacy. The life section
            answers that and leaves the rest out.
          </p>
          <label className="field" htmlFor="nearby">
            <span className="field-label">In your own words</span>
            <textarea
              id="nearby"
              className="nearby-input"
              maxLength={280}
              value={prefs.nearby || ""}
              placeholder="A grocery store I can roll to, and a clinic"
              onChange={(event) =>
                setPrefs((current) => ({ ...current, nearby: event.target.value }))
              }
            />
          </label>
          <div className="chip-row">
            {PHRASES.map((phrase) => (
              <button key={phrase} type="button" className="chip" onClick={() => addPhrase(phrase)}>
                {phrase}
              </button>
            ))}
          </div>
          {(prefs.nearby || "").trim() && !interpretNearby(prefs.nearby).recognized ? (
            <p className="fine">
              Aerial images can show a grocery store, a pharmacy, and steps on the way. This
              sentence does not match those, so the route stays unanswered.
            </p>
          ) : (
            <p className="fine">
              Vexcel can show a grocery store, a pharmacy, and steps between them. Bus stops are
              not identified from those images. Other blockages stay unknown.
            </p>
          )}
        </section>
      ) : null}

      <div className="action-bar">
        <p>
          {prefs.needs.length === 0
            ? "Add at least one access need to read homes against your list."
            : `${prefs.needs.length} access ${prefs.needs.length === 1 ? "need" : "needs"} selected.`}
        </p>
        <a className="button primary" href="#/discover">
          {countLabel}
        </a>
      </div>
      <p className="sr-only">Example budget in the demo is {money(DEMO_PREFS.maxRent)}.</p>
    </div>
  );
}
