import { ACCESS_NEEDS, LISTINGS } from "../data.js";
import { focusLife, interpretNearby, lifeHeadline } from "../life.js";
import { bedsLabel, leadFinding, money, RENT_MAX, RENT_MIN, summarize, visibleListings } from "../logic.js";
import { EvidenceSketch } from "../sketches.jsx";
import { Counts } from "./Status.jsx";

const PHRASES = [
  "a grocery store I can get to",
  "a pharmacy",
  "a clinic or doctor",
  "a bus or train",
];

const BEDS = [
  { value: null, label: "Any" },
  { value: 0, label: "Studio" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3+" },
];

const EMPTY_PREFS = { maxRent: RENT_MAX, beds: null, needs: [], nearby: "" };

export function Discover({ prefs, setPrefs, saved, onToggleSaved, onDemo }) {
  const homes = visibleListings(LISTINGS, prefs);
  const nearby = prefs.nearby || "";
  const open = prefs.needs.length === 0 && prefs.beds == null && prefs.maxRent >= RENT_MAX && !nearby.trim();

  function toggleNeed(id) {
    setPrefs((current) => {
      const needs = current.needs.includes(id)
        ? current.needs.filter((item) => item !== id)
        : [...current.needs, id];
      return { ...current, needs };
    });
  }

  function addPhrase(phrase) {
    setPrefs((current) => {
      const existing = current.nearby || "";
      if (existing.toLowerCase().includes(phrase.toLowerCase())) return current;
      const next = existing.trim() ? `${existing.trim()}, and ${phrase}` : phrase[0].toUpperCase() + phrase.slice(1);
      return { ...current, nearby: next };
    });
  }

  const summaryLine = open
    ? "Nothing is selected, so every sample home is listed."
    : `${bedsLabel(prefs.beds)} up to ${money(prefs.maxRent)}. ${
        prefs.needs.length
          ? nearby.trim()
            ? "Ordered for your access needs and what you asked for nearby."
            : "Ordered by the building. Add what you need nearby and that trip shows up on each card."
          : "Choose an access need and the list is ordered for it."
      }`;

  return (
    <div className="discover">
      <div className="page-head">
        <p className="eyebrow">Princeton sample</p>
        <h1 id="page-title">{homes.length === 1 ? "1 home" : `${homes.length} homes`}</h1>
        <p className="dek">{summaryLine}</p>
      </div>

      <section className="filters" aria-label="Home filters">
        <div className="filter-line">
          <span className="field-label" id="access-filter">Access</span>
          <div className="chip-row" role="group" aria-labelledby="access-filter">
            {ACCESS_NEEDS.map((need) => {
              const on = prefs.needs.includes(need.id);
              return (
                <button
                  key={need.id}
                  type="button"
                  className={on ? "chip" : "chip is-off"}
                  aria-pressed={on}
                  onClick={() => toggleNeed(need.id)}
                >
                  {need.label}
                </button>
              );
            })}
          </div>
          <button type="button" className="text-button" onClick={onDemo}>
            Princeton example
          </button>
          <button type="button" className="text-button" onClick={() => setPrefs(EMPTY_PREFS)}>
            Clear
          </button>
        </div>

        <div className="filter-line">
          <fieldset className="field beds-field">
            <legend>Bedrooms</legend>
            <div className="segmented">
              {BEDS.map((option) => (
                <label key={option.label} className={prefs.beds === option.value ? "is-on" : ""}>
                  <input
                    type="radio"
                    name="beds"
                    checked={prefs.beds === option.value}
                    onChange={() => setPrefs((current) => ({ ...current, beds: option.value }))}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="field budget-field">
            <div className="rent-head">
              <label htmlFor="rent">Budget</label>
              <output htmlFor="rent">{money(prefs.maxRent)}</output>
            </div>
            <input
              id="rent"
              type="range"
              min={RENT_MIN}
              max={RENT_MAX}
              step="20"
              value={prefs.maxRent}
              onChange={(event) =>
                setPrefs((current) => ({ ...current, maxRent: Number(event.target.value) }))
              }
            />
          </div>
        </div>

        <label className="field" htmlFor="nearby">
          <span className="field-label">What do you need nearby?</span>
          <textarea
            id="nearby"
            className="nearby-input"
            maxLength={280}
            value={nearby}
            placeholder="A grocery store I can get to"
            onChange={(event) => setPrefs((current) => ({ ...current, nearby: event.target.value }))}
          />
        </label>
        <div className="chip-row">
          {PHRASES.map((phrase) => (
            <button key={phrase} type="button" className="chip is-off" onClick={() => addPhrase(phrase)}>
              {phrase}
            </button>
          ))}
        </div>
        {nearby.trim() && !interpretNearby(nearby).recognized ? (
          <p className="fine">
            Aerial images can show a grocery store, a pharmacy, and steps on the way. This sentence
            does not match those, so the route stays unanswered.
          </p>
        ) : (
          <p className="fine">
            Vexcel can show a grocery store, a pharmacy, and steps between them. Bus stops are not
            identified from those images.
          </p>
        )}
      </section>

      {homes.length === 0 ? (
        <div className="empty">
          <h2>No sample home fits that filter</h2>
          <p>The prototype includes four 1-bedroom homes, from $2,090 to $2,360.</p>
          <button type="button" className="button" onClick={() => setPrefs(EMPTY_PREFS)}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="cards">
          {homes.map((home, index) => {
            const summary = summarize(home, prefs.needs);
            const around = focusLife(home.id, prefs.needs, prefs.nearby);
            const insideLead = leadFinding(summary.findings);
            const aroundLead = lifeHeadline(around.trips.flatMap((item) => item.byNeed.map((entry) => entry.trip)));
            const savedOn = saved.includes(home.id);
            return (
              <article key={home.id} className="card">
                <a className="card-media" href={`#/home/${home.id}`}>
                  <EvidenceSketch scene={home.scene} label={home.sketchLabel} />
                </a>
                <div className="card-body">
                  <div className="card-top">
                    <div>
                      {index === 0 && prefs.needs.length > 0 ? (
                        <p className="eyebrow">Fewest likely barriers</p>
                      ) : (
                        <p className="eyebrow">{home.floor}</p>
                      )}
                      <h2>
                        <a href={`#/home/${home.id}`}>{home.name}</a>
                      </h2>
                      <p className="meta">
                        {home.unit} · {home.address}
                      </p>
                    </div>
                    <p className="rent">
                      {money(home.rent)}
                      <span> / mo</span>
                    </p>
                  </div>
                  <p className="meta">
                    {home.floor} · {bedsLabel(home.beds)} · {home.baths} bath · {home.sqft} sqft ·{" "}
                    {home.available}
                  </p>
                  {insideLead ? (
                    <p className="lead">
                      <span className="source">Inside</span> {insideLead.title}
                    </p>
                  ) : null}
                  {aroundLead ? (
                    <p className="lead">
                      <span className="source">Around</span> {aroundLead.title}
                    </p>
                  ) : null}
                  {prefs.needs.length > 0 ? <Counts counts={summary.counts} label="Inside" /> : null}
                  {around.focused ? <Counts counts={around.counts} label="Around" /> : null}
                  <div className="card-actions">
                    <a className="button primary" href={`#/home/${home.id}`}>
                      Investigate
                    </a>
                    <button
                      type="button"
                      className="button"
                      aria-pressed={savedOn}
                      onClick={() => onToggleSaved(home.id)}
                    >
                      {savedOn ? "Saved" : "Save"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
