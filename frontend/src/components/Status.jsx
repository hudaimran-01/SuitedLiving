import { STATUS_LABEL } from "../logic.js";

export function Status({ status }) {
  return <span className={`status ${status}`}>{STATUS_LABEL[status]}</span>;
}

export function Counts({ counts }) {
  const barriers =
    counts.barrier === 1 ? "1 potential barrier" : `${counts.barrier} potential barriers`;
  return (
    <p className="counts">
      <span>{counts.observed} observed</span>
      <span>{barriers}</span>
      <span>{counts.unknown} unknown</span>
    </p>
  );
}
