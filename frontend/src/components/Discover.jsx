import { ACCESS_NEEDS, LISTINGS } from "../data.js";
import { focusLife, interpretNearby, lifeHeadline } from "../life.js";
import { bedsLabel, CITIES, cityLabel, leadFinding, listingFacts, money, PRICE_MAX, PRICE_MIN, summarize, visibleListings } from "../logic.js";
import { InteriorHomes } from "./Interior.jsx";
import { ContactManager } from "./Contact.jsx";
import { ListingPhoto } from "./ListingPhoto.jsx";
import { Counts } from "./Status.jsx";

const PHRASES = [
  "a grocery store I can get to",
  "a pharmacy",
  "a clinic or doctor",
];

const BEDS = [
  { value: null, label: "Any" },
  { value: 0, label: "Studio" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3+" },
];

const EMPTY_PREFS = { maxPrice: PRICE_MAX, beds: null, needs: [], nearby: "", city: "" };

export function Discover({ listings = LISTINGS, prefs, setPrefs, saved, onToggleSaved, onDemo }) {
  const homes = visibleListings(listings, prefs);
  const nearby = prefs.nearby || "";
  const open = prefs.needs.length === 0 && prefs.beds == null && prefs.maxPrice >= PRICE_MAX && !nearby.trim() && !prefs.city;

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

  const placeLine = `${prefs.city ? `${cityLabel(prefs.city)}. ` : ""}${bedsLabel(prefs.beds)} up to ${money(prefs.maxPrice)}.`;
  const summaryLine = open
    ? "Nothing is selected, so every home is listed."
    : prefs.needs.length
      ? `${placeLine} ${
          nearby.trim()
            ? "Ordered for your access needs and what you asked for nearby."
            : "Ordered by the building. Add what you need nearby and that trip shows up on each card."
        }`
      : placeLine;

  return (
    <div className="discover">
      <div className="page-head">
        <p className="eyebrow">{cityLabel(prefs.city)}</p>
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
            Wheelchair search
          </button>
          <button type="button" className="text-button" onClick={() => setPrefs(EMPTY_PREFS)}>
            Clear
          </button>
        </div>

        <div className="filter-line">
          <label className="field location-field" htmlFor="location">
            <span className="field-label">Location</span>
            <select
              id="location"
              value={prefs.city || ""}
              onChange={(event) => setPrefs((current) => ({ ...current, city: event.target.value }))}
            >
              {CITIES.map((city) => (
                <option key={city.id || "both"} value={city.id}>
                  {city.label}
                </option>
              ))}
            </select>
          </label>
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
              <label htmlFor="price">Price</label>
              <output htmlFor="price">{money(prefs.maxPrice)}</output>
            </div>
            <input
              id="price"
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step="10000"
              value={prefs.maxPrice}
              onChange={(event) =>
                setPrefs((current) => ({ ...current, maxPrice: Number(event.target.value) }))
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
            A grocery, a pharmacy, or a clinic uses the sidewalk walks. This sentence does not
            match those, so the route stays unanswered.
          </p>
        ) : (
          <p className="fine">
            A grocery, a pharmacy, or a clinic uses the sidewalk walks around each home.
          </p>
        )}
      </section>

      {homes.length === 0 ? (
        <div className="empty">
          <h2>No home fits that filter</h2>
          <p>
            This list has {listings.length} homes for sale, from {money(Math.min(...listings.map((item) => item.price)))} to{" "}
            {money(Math.max(...listings.map((item) => item.price)))}.
          </p>
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
                  <ListingPhoto listing={home} />
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
                        {[home.unit ? `Unit ${home.unit}` : null, home.address].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <p className="rent">
                      {money(home.price)}
                      <span> for sale</span>
                    </p>
                  </div>
                  <p className="meta">
                    {listingFacts(home).join(" · ")}
                  </p>
                  {home.agentNotes?.[0] ? (
                    <p className="lead note-line">
                      <span className="source">Agent, not verified</span> {home.agentNotes[0]}
                    </p>
                  ) : null}
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
                    <ContactManager manager={home.manager} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <InteriorHomes needIds={prefs.needs} city={prefs.city} />
    </div>
  );
}
