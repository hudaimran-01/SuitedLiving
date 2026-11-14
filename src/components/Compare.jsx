import { ACCESS_NEEDS, CHECKS, LISTINGS } from "../data.js";
import { findingFor, money, STATUS_LABEL } from "../logic.js";
import { Status } from "./Status.jsx";

export function Compare({ prefs, saved, onToggleSaved }) {
  const homes = LISTINGS.filter((listing) => saved.includes(listing.id));
  const profiles = ACCESS_NEEDS.filter((item) => prefs.needs.includes(item.id));

  return (
    <div className="compare">
      <div className="page-head">
        <p className="eyebrow">Compare</p>
        <h1 id="page-title">The same list, different homes</h1>
        <p className="dek">
          A home that works for one list can fail another. This table only includes the access
          needs you selected.
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
          <p>Choose wheelchair, low vision, or hard of hearing and the comparison will use those rows.</p>
          <a className="button primary" href="#/needs">
            Edit needs
          </a>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="compare-table">
            <caption>Saved sample homes against your access list</caption>
            <thead>
              <tr>
                <th scope="col">Requirement</th>
                {homes.map((home) => (
                  <th scope="col" key={home.id}>
                    <a href={`#/home/${home.id}`}>{home.name}</a>
                    <span className="meta">
                      {money(home.rent)} · {home.floor}
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
          </table>
          <p className="sr-only">
            Status words are {Object.values(STATUS_LABEL).join(", ")}.
          </p>
        </div>
      )}
    </div>
  );
}
