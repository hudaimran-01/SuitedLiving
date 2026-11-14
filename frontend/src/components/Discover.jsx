import { ACCESS_NEEDS, LISTINGS } from "../data.js";
import { focusLife, lifeHeadline } from "../life.js";
import { bedsLabel, leadFinding, money, summarize, visibleListings } from "../logic.js";
import { EvidenceSketch } from "../sketches.jsx";
import { Counts } from "./Status.jsx";

export function Discover({ prefs, setPrefs, saved, onToggleSaved }) {
  const homes = visibleListings(LISTINGS, prefs);

  function toggleNeed(id) {
    setPrefs((current) => {
      const needs = current.needs.includes(id)
        ? current.needs.filter((item) => item !== id)
        : [...current.needs, id];
      return { ...current, needs };
    });
  }

  return (
    <div className="discover">
      <div className="page-head">
        <p className="eyebrow">Princeton sample</p>
        <h1 id="page-title">
          {homes.length === 1 ? "1 home in range" : `${homes.length} homes in range`}
        </h1>
        <p className="dek">
          {bedsLabel(prefs.beds)} up to {money(prefs.maxRent)}.{" "}
          {prefs.needs.length
            ? (prefs.nearby || "").trim()
              ? "Ordered for your access needs and what you asked for nearby. Other errands stay off the cards."
              : "Ordered by the building. Describe what you need nearby and the daily trip will show up here."
            : "Choose an access need and each home will be read for it."}
        </p>
        <div className="chip-row" role="group" aria-label="Access needs">
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
          <a className="text-button" href="#/needs">
            Edit budget
          </a>
        </div>
      </div>

      {homes.length === 0 ? (
        <div className="empty">
          <h2>No sample home fits that filter</h2>
          <p>The prototype includes four 1-bedroom homes, from $2,090 to $2,360.</p>
          <a className="button" href="#/needs">
            Adjust budget or bedrooms
          </a>
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
