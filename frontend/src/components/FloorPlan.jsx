import { useState } from "react";
import { ACCESS_NEEDS } from "../data.js";
import { assessRoom, ROOM_STATUS } from "../floorplans.js";

const ORDER = ["barrier", "verify", "supported", "unset"];
const SHORT = { supported: "Supported", verify: "Verify", barrier: "Barrier", unset: "Not assessed" };

function StatusMark({ status }) {
  return (
    <span className={`room-status ${status}`}>
      <svg viewBox="0 0 16 16" aria-hidden="true">
        {status === "supported" ? <path d="M3 8.2 6.2 11.5 13 4.5" /> : null}
        {status === "verify" ? (
          <path d="M8 3.2a2.6 2.6 0 0 1 1.4 4.7c-.7.5-1.1 1-1.1 1.8v.4M8 12.6h.01" />
        ) : null}
        {status === "barrier" ? <path d="M8 3.2v6.2M8 12.2h.01" /> : null}
        {status === "unset" ? <path d="M4 8h8" /> : null}
      </svg>
      {ROOM_STATUS[status]}
    </span>
  );
}

function RoomPanel({ room, assessment }) {
  if (!room) return null;
  const measures = assessment.details.flatMap((item) => item.measures || []);
  return (
    <div className="room-panel" aria-live="polite">
      <p className="eyebrow">{room.name}</p>
      <h3>
        {room.name}
        <StatusMark status={assessment.status} />
      </h3>
      {assessment.status === "unset" ? (
        <p>Choose an access need and this room is read only for that need.</p>
      ) : (
        <>
          <p>{assessment.summary}</p>
          {assessment.details.length > 1 ? (
            <ul className="room-reasons">
              {assessment.details.map((item) => {
                const need = ACCESS_NEEDS.find((entry) => entry.id === item.needId);
                return (
                  <li key={item.needId}>
                    <strong>{need ? need.label : item.needId}.</strong> {item.summary}
                  </li>
                );
              })}
            </ul>
          ) : null}
          <h4>Measurements</h4>
          {measures.length === 0 ? (
            <p>None recorded. Widths and turning space are not estimated from the drawing.</p>
          ) : (
            <ul>
              {measures.map((item) => (
                <li key={item.label}>
                  {item.label}: {item.value}
                </li>
              ))}
            </ul>
          )}
          <h4>Evidence</h4>
          <ul className="room-reasons">
            {assessment.details.map((item) => (
              <li key={`${item.needId}-evidence`}>
                <span className="source">{item.source}</span> {item.evidence}
              </li>
            ))}
          </ul>
          {assessment.questions.length > 0 ? (
            <>
              <h4>Questions to ask the listing agent</h4>
              <ul className="asks">
                {assessment.questions.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
            </>
          ) : null}
        </>
      )}
      <p className="fine">Listing notes from CoStar and Matterport where a scan exists. Not a certification.</p>
    </div>
  );
}

export function FloorPlan({ plan, needIds }) {
  const rooms = plan ? plan.rooms.map((room) => ({ ...room, assessment: assessRoom(room, needIds) })) : [];
  const [pinned, setPinned] = useState(rooms[0]?.id || null);
  const [hover, setHover] = useState(null);
  const active = rooms.find((room) => room.id === (hover || pinned)) || rooms[0];

  return (
    <section className="explore" aria-labelledby="explore-title">
      <div className="explore-head">
        <h2 id="explore-title">Explore accessibility</h2>
        <p>
          {needIds.length === 0
            ? "Rooms stay uncolored until you choose an access need. A feature you did not ask about is not marked as a barrier."
            : "Each room is colored for the access needs you selected. A missing feature that does not matter for those needs stays out of the color."}
        </p>
      </div>
      {plan ? (
        <div className="explore-layout">
          <div>
            <ul className="legend">
              {ORDER.filter((status) => status !== "unset").map((status) => (
                <li key={status}>
                  <StatusMark status={status} />
                </li>
              ))}
            </ul>
            <div
              className="plan"
              onMouseLeave={() => setHover(null)}
            >
              <svg viewBox="0 0 640 440" role="group" aria-label="Floor plan">
                <rect x="48" y="36" width="544" height="368" className="plan-paper" />
                {rooms.map((room) => (
                  <g key={room.id}>
                    <polygon
                      points={room.points}
                      className={
                        room.id === active?.id
                          ? `room-shape ${room.assessment.status} is-on`
                          : `room-shape ${room.assessment.status}`
                      }
                      role="button"
                      tabIndex="0"
                      aria-pressed={room.id === pinned}
                      aria-label={`${room.name}. ${ROOM_STATUS[room.assessment.status]}`}
                      onMouseEnter={() => setHover(room.id)}
                      onFocus={() => setHover(room.id)}
                      onBlur={() => setHover(null)}
                      onClick={() => setPinned(room.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setPinned(room.id);
                        }
                      }}
                    />
                    <text className="room-label" x={room.label[0]} y={room.label[1]}>
                      {room.name}
                    </text>
                    <text className="room-label room-label-status" x={room.label[0]} y={room.label[1] + 18}>
                      {SHORT[room.assessment.status]}
                    </text>
                  </g>
                ))}
                <g className="plan-walls" fill="none">
                  <rect x="48" y="36" width="544" height="368" />
                  <path d="M360 36v368M48 292h312M360 188h232M470 188v104" />
                </g>
              </svg>
            </div>
            <p className="fine">{plan.caption}</p>
          </div>
          <RoomPanel room={active} assessment={active.assessment} />
        </div>
      ) : (
        <div className="plan-fallback">
          <p>No room plan is linked for this home yet.</p>
          <p>
            Room-by-room color needs a floor plan. The findings on this page still cover the
            entrance and the listing notes. Nothing here is estimated from a drawing.
          </p>
        </div>
      )}
    </section>
  );
}
