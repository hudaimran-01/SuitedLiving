import { useState } from "react";
import {
  INTERIOR_DISCLAIMER,
  INTERIOR_PROPERTIES,
  coverageSentence,
  findingView,
  interiorProperty,
  interiorView,
  leadEvidence,
  orderLine,
  rankInteriors,
  rentLabel,
  scoreTone,
} from "../interior.js";
import { cityLabel, inCity } from "../logic.js";
import { Status } from "./Status.jsx";

function ScoreMark({ score, label }) {
  const width = Math.max(0, Math.min(100, Number(score) || 0));
  return (
    <p className={`score-mark ${scoreTone(score)}`}>
      <span className="score-value">{score}</span>
      <span className="score-label">{label}</span>
      <span className="score-meter" aria-hidden="true">
        <span className="score-fill" style={{ width: `${width}%` }} />
      </span>
    </p>
  );
}

function InteriorCard({ home, index, ranked, view, lead }) {
  const [photoFailed, setPhotoFailed] = useState(false);
  return (
    <article className="card interior-card">
      {home.photos[0] && !photoFailed ? (
        <a className="card-media" href={`#/interior/${home.id}`}>
          <InteriorPhoto photo={home.photos[0]} onFail={() => setPhotoFailed(true)} />
        </a>
      ) : null}
      <div className="card-body">
        <p className="eyebrow">
          {ranked && index === 0 ? "Highest photo score" : `${home.city}, ${home.state}`}
        </p>
        <h3>
          <a href={`#/interior/${home.id}`}>{home.name}</a>
        </h3>
        <p className="meta">{home.address}</p>
        <div className="score-row">
          {view.rows.map((row) => (
            <ScoreMark key={row.id} score={row.score} label={row.label} />
          ))}
        </div>
        {view.rows.length === 1 ? <p className="fine">{coverageSentence(view.rows[0].confidence)}</p> : null}
        {lead ? (
          <p className="lead">
            <Status status={lead.status} /> {lead.label}. {lead.title}
          </p>
        ) : null}
        {home.photos[0]?.caption ? <p className="fine">{home.photos[0].caption}</p> : null}
        <p className="meta">{rentLabel(home)}</p>
        <a className="button primary" href={`#/interior/${home.id}`}>
          Read the score
        </a>
      </div>
    </article>
  );
}

function InteriorPhoto({ photo, onFail }) {
  const [failed, setFailed] = useState(false);
  if (!photo || failed) return null;
  return (
    <img
      src={photo.src}
      alt=""
      onError={() => {
        setFailed(true);
        onFail?.();
      }}
    />
  );
}

export function InteriorHomes({ needIds = [], city = "" }) {
  const homes = rankInteriors(INTERIOR_PROPERTIES, needIds).filter((home) => inCity(home.city, city));
  const ranked = homes.length > 0 && interiorView(homes[0], needIds).sortScore != null;

  return (
    <section className="interior-section" aria-labelledby="interior-title">
      <div className="page-head">
        <p className="eyebrow">Interior photo scores</p>
        <h2 id="interior-title">
          {homes.length === 1 ? "1 apartment scored from photos" : `${homes.length} apartments scored from photos`}
          {city ? ` in ${cityLabel(city)}` : ""}
        </h2>
        <p className="dek">{orderLine(needIds)}</p>
        <p className="fine">{INTERIOR_DISCLAIMER}</p>
      </div>
      <div className="cards">
        {homes.map((home, index) => {
          const view = interiorView(home, needIds);
          const lead = leadEvidence(home);
          return (
            <InteriorCard key={home.id} home={home} index={index} ranked={ranked} view={view} lead={lead} />
          );
        })}
      </div>
    </section>
  );
}

export function InteriorReport({ homeId, needIds = [] }) {
  const home = interiorProperty(homeId);
  if (!home) {
    return (
      <div className="empty">
        <h1 id="page-title">That apartment is not in the photo scores</h1>
        <a className="button" href="#/discover">
          Back to homes
        </a>
      </div>
    );
  }

  const view = interiorView(home, needIds);
  const findings = home.findings.map(findingView);
  const groups = [
    ["barrier", "What may get in the way"],
    ["observed", "What the photos showed"],
    ["unknown", "What the photos leave open"],
  ];

  return (
    <article className="report">
      <p className="back">
        <a href="#/discover">Back to homes</a>
      </p>
      <header className="report-head">
        <div>
          <p className="eyebrow">Interior photo score</p>
          <h1 id="page-title">{home.name}</h1>
          <p className="meta">
            {home.address}, {home.city}, {home.state}
          </p>
        </div>
        <div className="report-side">
          <p className="rent">
            {rentLabel(home)}
            <span> apartment</span>
          </p>
        </div>
      </header>

      <section className="check-group" aria-labelledby="score-title">
        <h2 id="score-title">How this interior scored</h2>
        <p className="meta">{orderLine(needIds)}</p>
        <div className="score-row">
          {view.rows.map((row) => (
            <div key={row.id}>
              <ScoreMark score={row.score} label={row.label} />
              <p className="fine">{coverageSentence(row.confidence)}</p>
            </div>
          ))}
        </div>
        {view.hearingOnly ? <p>Hard of hearing has no photo score in this file.</p> : null}
        <p className="fine">{INTERIOR_DISCLAIMER}</p>
      </section>

      {home.photos.length > 0 ? (
        <section aria-labelledby="interior-photos">
          <h2 id="interior-photos">Photos used for the score</h2>
          <ul className="photo-row">
            {home.photos.map((photo) => (
              <li key={photo.src}>
                <InteriorPhoto photo={photo} />
                <p className="fine">{photo.caption}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {groups.map(([status, label]) => {
        const items = findings.filter((item) => item.status === status);
        if (items.length === 0) return null;
        return (
          <section key={status} className="check-group" aria-labelledby={`photo-${status}`}>
            <h3 id={`photo-${status}`}>
              {label}
              <span>{items.length}</span>
            </h3>
            <ul className="check-list score-findings">
              {items.map((item) => (
                <li key={item.id}>
                  <Status status={item.status} />
                  <span>
                    <strong>{item.label}.</strong> {item.title}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {home.facts.length > 0 || home.notes.length > 0 ? (
        <section className="agent-notes" aria-labelledby="building-record">
          <h2 id="building-record">From the building record</h2>
          <ul>
            {home.facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
            {home.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
