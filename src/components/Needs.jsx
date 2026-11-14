import { ACCESS_NEEDS, DEMO_PREFS, LISTINGS } from "../data.js";
import { bedsLabel, money, visibleListings } from "../logic.js";

const BEDS = [
  { value: 0, label: "Studio" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3+" },
];

export function Needs({ prefs, setPrefs, onDemo }) {
  const count = visibleListings(LISTINGS, prefs).length;
  const countLabel = count === 1 ? "Show 1 home" : `Show ${count} homes`;

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
          Choose wheelchair, low vision, hard of hearing, or any mix. InsideOut reads every
          apartment for those needs. This prototype has four sample homes in Princeton.
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
