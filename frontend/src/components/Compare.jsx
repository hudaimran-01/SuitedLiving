import { ACCESS_NEEDS, CHECKS, LISTINGS } from "../data.js";
import { compareAround } from "../propertyMedia.js";
import { findingFor, money, STATUS_LABEL } from "../logic.js";
import { Status } from "./Status.jsx";

export function Compare({ listings = LISTINGS, prefs, saved, onToggleSaved }) {
  const homes = listings.filter((listing) => saved.includes(listing.id));
  const profiles = ACCESS_NEEDS.filter((item) => prefs.needs.includes(item.id));

  return (
    <div className="compare">
      <div className="page-head">
        <p className="eyebrow">Compare</p>
        <h1 id="page-title">The same list, different homes</h1>
        <p className="dek">
          A home that works for one list can fail another. The rows cover the building and the
          sidewalk walks around it, only for the access needs you selected.
        </p>
      </div>

      {homes.length < 2 ? (
        <div className="empty">
          <h2>{homes.length === 0 ? "No homes saved yet" : "Save one more home"}</h2>
          <p>Save two homes from the list, then come back to read them side by side.</p>
          <a className="button primary" href="#/discover">
            Browse homes
          </a>
        </div>
      ) : profiles.length === 0 ? (
        <div className="empty">
          <h2>Your access list is empty</h2>
          <p>Choose an access need and the comparison will use those rows.</p>
          <a className="button primary" href="#/discover">
            Set filters
          </a>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="compare-table">
            <caption>Saved homes against your access list</caption>
            <thead>
              <tr>
                <th scope="col">Requirement</th>
                {homes.map((home) => (
                  <th scope="col" key={home.id}>
                    <a href={`#/home/${home.id}`}>{home.name}</a>
                    <span className="meta">
                      {money(home.price)} · {home.place}
                    </span>
                    <button type="button" className="text-button" onClick={() => onToggleSaved(home.id)}>
                      Remove
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            {profiles.map((profile) => (
              <tbody key={profile.id}>
                <tr className="group-row">
                  <th scope="colgroup" colSpan={homes.length + 1}>
                    {profile.label}
                  </th>
                </tr>
                {profile.checks.map((checkId) => {
                  const check = CHECKS.find((item) => item.id === checkId);
                  return (
                    <tr key={checkId}>
                      <th scope="row">{check.label}</th>
                      {homes.map((home) => {
                        const finding = findingFor(home, checkId);
                        return (
                          <td key={home.id}>
                            <Status status={finding.status} />
                            <span className="cell-title">{finding.title}</span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            ))}
            {compareAround(homes[0].id, prefs.nearby).length > 0 ? (
              <tbody>
                <tr className="group-row">
                  <th scope="colgroup" colSpan={homes.length + 1}>
                    Around this home
                  </th>
                </tr>
                {compareAround(homes[0].id, prefs.nearby).map((row) => (
                  <tr key={row.id}>
                    <th scope="row">{row.label}</th>
                    {homes.map((home) => {
                      const cell = compareAround(home.id, prefs.nearby).find((item) => item.id === row.id);
                      return (
                        <td key={home.id}>
                          <Status status={cell.status} />
                          <span className="cell-title">{cell.title}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            ) : null}
          </table>
          <p className="sr-only">
            Status words are {Object.values(STATUS_LABEL).join(", ")}.
          </p>
        </div>
      )}
    </div>
  );
}
