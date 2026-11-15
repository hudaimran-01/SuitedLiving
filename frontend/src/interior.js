import scoresFile from "./interiorScores.json" with { type: "json" };

const PERSONA = {
  wheelchair: { id: "wheelchair", label: "Wheelchair" },
  "low-vision": { id: "low_vision", label: "Low vision" },
  hills: { id: "walker_or_cane", label: "Walker or cane" },
};

const LABELS = {
  step_free_entry: "Step-free entry",
  wide_doorways: "Wide doorways",
  roll_in_or_walk_in_shower: "Roll-in or walk-in shower",
  bathtub_only: "Bathtub only",
  grab_bars: "Grab bars",
  hard_flooring_throughout: "Hard flooring",
  open_turning_space: "Open turning space",
  kitchen_knee_clearance: "Knee clearance at the counter",
  lever_door_handles: "Lever door handles",
  good_lighting_and_contrast: "Lighting and contrast",
};

const NEGATIVE = new Set(["bathtub_only"]);

export const INTERIOR_DISCLAIMER = scoresFile.disclaimer;
export const INTERIOR_BUILDING_COUNT = scoresFile.buildingCount;
export const INTERIOR_PROPERTIES = scoresFile.properties;

export function interiorProperty(id) {
  return INTERIOR_PROPERTIES.find((item) => item.id === id) || null;
}

function personasFor(needIds) {
  const seen = new Set();
  const personas = [];
  for (const needId of needIds) {
    const persona = PERSONA[needId];
    if (!persona || seen.has(persona.id)) continue;
    seen.add(persona.id);
    personas.push(persona);
  }
  return personas;
}

export function interiorView(property, needIds = []) {
  const selected = personasFor(needIds);
  const rows = (selected.length ? selected : Object.values(PERSONA)).map((persona) => ({
    id: persona.id,
    label: persona.label,
    score: property.scores[persona.id].score,
    confidence: property.scores[persona.id].confidence,
  }));
  return {
    rows,
    sortScore: selected.length ? Math.min(...rows.map((row) => row.score)) : null,
    hearingOnly: needIds.length > 0 && selected.length === 0,
  };
}

export function orderLine(needIds = []) {
  const labels = personasFor(needIds).map((persona) => persona.label);
  if (labels.length === 0) {
    return needIds.includes("hard-of-hearing")
      ? "Hard of hearing has no photo score. These apartments stay in name order."
      : "Select an access need and this list orders by that photo score.";
  }
  if (labels.length === 1 && needIds.includes("hills")) {
    return "Ordered by the walker or cane photo score for a stairs and hills search.";
  }
  if (labels.length === 1) return `Ordered by the ${labels[0].toLowerCase()} photo score.`;
  const named = labels.map((label) => label.toLowerCase());
  const last = named[named.length - 1];
  return `Ordered by the lower photo score across ${named.slice(0, -1).join(", ")} and ${last}.`;
}

export function rankInteriors(properties, needIds = []) {
  return properties.slice().sort((a, b) => {
    const left = interiorView(a, needIds).sortScore;
    const right = interiorView(b, needIds).sortScore;
    if (left == null || right == null) return a.name.localeCompare(b.name);
    return right - left || a.name.localeCompare(b.name);
  });
}

export function scoreTone(score) {
  const value = Number(score);
  if (value >= 70) return "strong";
  if (value >= 40) return "mixed";
  return "weak";
}

export function coverageSentence(confidence) {
  const pct = Math.round((confidence || 0) * 100);
  if (pct <= 0) return "None of this score comes from a visible check.";
  if (pct >= 100) return "This score comes from visible checks.";
  return `${pct}% of this score comes from a visible check. The rest is unknown.`;
}

export function findingView(finding) {
  const label = LABELS[finding.id] || finding.id;
  if (finding.value == null) {
    return { id: finding.id, status: "unknown", label, title: finding.evidence };
  }
  const good = NEGATIVE.has(finding.id) ? !finding.value : Boolean(finding.value);
  return {
    id: finding.id,
    status: good ? "observed" : "barrier",
    label,
    title: finding.evidence,
  };
}

export function leadEvidence(property) {
  const ranked = property.findings
    .slice()
    .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
    .map(findingView);
  return ranked.find((item) => item.status === "barrier")
    || ranked.find((item) => item.status === "unknown")
    || ranked[0]
    || null;
}

export function rentLabel(property) {
  const min = property.rentMin > 0 ? property.rentMin : null;
  const max = property.rentMax > 0 ? property.rentMax : null;
  const money = (amount) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
  if (min && max && min !== max) return `${money(min)} to ${money(max)} a month`;
  if (max) return `${money(max)} a month`;
  if (min) return `${money(min)} a month`;
  return "Rent is not listed";
}
