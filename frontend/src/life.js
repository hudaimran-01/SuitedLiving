import { ACCESS_NEEDS } from "./data.js";

const SOURCE = "Sample streets";

function note(fields) {
  return {
    source: SOURCE,
    scene: "street-level",
    ask: null,
    ...fields,
  };
}

function trip(fields) {
  return note({
    scene: "street-level",
    ...fields,
  });
}

const LIFE = {
  linden: {
    look: "Sample notes for the sidewalks on Linden Lane, the corner of Sample Street, and walking routes to a grocery, a pharmacy, a clinic, and a bus stop. These are not live directions.",
    profiles: {
      wheelchair: {
        story:
          "The front door is level with the walk. A grocery trip in these sample notes still stops at a corner with no curb ramp. An accessible apartment is not the same thing as an accessible errand.",
        street: [
          note({
            id: "sidewalk",
            label: "Sidewalk",
            status: "observed",
            title: "The sidewalk continues along this sample block",
            detail:
              "The sample frames show a concrete sidewalk from the front walk to the next corner. This is not a city sidewalk inventory.",
          }),
          note({
            id: "crossings",
            label: "Crossings",
            status: "barrier",
            scene: "street-gap",
            title: "The grocery corner has a curb and no ramp",
            detail:
              "At the corner labeled Sample Street in these notes, the sidewalk ends at a curb. No curb ramp is visible.",
            ask: "Is there a curb ramp at Linden Lane and Sample Street?",
          }),
          note({
            id: "slope",
            label: "Slope",
            status: "observed",
            title: "The grocery block reads as nearly level",
            detail:
              "The sample frames do not show a steep rise between the door and that corner. Grade was not measured.",
          }),
        ],
        trips: [
          trip({
            id: "grocery",
            label: "Grocery",
            name: "Sample Market",
            route: "Two blocks on Linden Lane, then the corner of Sample Street",
            routeDistance: "0.3 mi on the sidewalk",
            straightLine: "0.2 mi across the block",
            involves: "Leave the level door, stay on the sidewalk, and cross at that corner.",
            status: "barrier",
            scene: "street-gap",
            title: "The grocery route stops at a curb with no ramp",
            detail:
              "Straight-line distance skips the corner. The sample route uses it, and no ramp is visible there.",
            ask: "Is there a step-free way to Sample Market from 14 Linden Lane?",
          }),
          trip({
            id: "pharmacy",
            label: "Pharmacy",
            name: "Sample Pharmacy",
            route: "One block the other way on Linden Lane",
            routeDistance: "0.2 mi on the sidewalk",
            straightLine: "0.15 mi",
            involves: "A short sidewalk, then a corner the frames do not show.",
            status: "unknown",
            title: "The pharmacy corner is outside the sample frames",
            detail: "The sidewalk starts in that direction. The curb at the pharmacy is not in these notes.",
            ask: "Is the corner toward Sample Pharmacy step-free?",
          }),
          trip({
            id: "clinic",
            label: "Healthcare",
            name: "Sample Clinic",
            route: "Four blocks, not covered by the sample frames",
            routeDistance: "0.6 mi on the sidewalk",
            straightLine: "0.4 mi",
            involves: "A longer walk. Crossings on the way were not reviewed.",
            status: "unknown",
            title: "The clinic route was not reviewed",
            detail: "Sample Clinic is named only so the gap is visible. No imagery in this file covers the route.",
            ask: "Which crossings are on the way to Sample Clinic?",
          }),
          trip({
            id: "transit",
            label: "Transit",
            name: "Sample bus stop",
            route: "One block, same side of Linden Lane",
            routeDistance: "0.2 mi on the sidewalk",
            straightLine: "0.2 mi",
            involves: "Stay on the sidewalk. No street crossing is in this sample route.",
            status: "unknown",
            title: "The sidewalk reaches the stop, and the boarding pad is not shown",
            detail:
              "The sample frames show a continuous sidewalk to the stop sign. They do not show the bus pad or the vehicle floor.",
            ask: "Is the bus stop on Linden Lane level with the sidewalk?",
          }),
        ],
      },
      hills: {
        story:
          "The same grocery walk is short and nearly level. These sample notes do not show stairs or a steep slope on that route. A single curb is still there, and it is not treated as a barrier for someone who can step.",
        street: [
          note({
            id: "sidewalk",
            label: "Sidewalk",
            status: "observed",
            title: "A continuous sidewalk runs along the grocery block",
            detail: "No gap or stair is visible between the door and Sample Street in these frames.",
          }),
          note({
            id: "crossings",
            label: "Crossings",
            status: "observed",
            title: "The grocery corner is a single curb, not a flight of stairs",
            detail:
              "The curb has no ramp. For this need, one step up a curb is not listed as a barrier. It is still a barrier for a wheelchair.",
          }),
          note({
            id: "slope",
            label: "Slope",
            status: "observed",
            title: "No steep slope is visible on the grocery block",
            detail: "The sample frames look nearly level. Grade was not measured.",
          }),
        ],
        trips: [
          trip({
            id: "grocery",
            label: "Grocery",
            name: "Sample Market",
            route: "Two blocks on Linden Lane, then one curb at Sample Street",
            routeDistance: "0.3 mi on the sidewalk",
            straightLine: "0.2 mi across the block",
            involves: "A short walk on a gentle block, then one curb to step up.",
            status: "observed",
            title: "The grocery walk is short and does not climb",
            detail:
              "The sample route has no stair and no visible steep block. The missing ramp matters for a wheelchair, not for this need.",
          }),
          trip({
            id: "pharmacy",
            label: "Pharmacy",
            name: "Sample Pharmacy",
            route: "One block the other way",
            routeDistance: "0.2 mi on the sidewalk",
            straightLine: "0.15 mi",
            involves: "Another short block that looks gentle in the sample notes.",
            status: "observed",
            title: "The pharmacy walk is short and gentle in the sample notes",
            detail: "No stair or steep rise is visible in that direction. The frames are not a survey.",
          }),
          trip({
            id: "clinic",
            label: "Healthcare",
            name: "Sample Clinic",
            route: "Four blocks, not covered by the sample frames",
            routeDistance: "0.6 mi on the sidewalk",
            straightLine: "0.4 mi",
            involves: "A longer walk. Hills on the way were not reviewed.",
            status: "unknown",
            title: "The clinic route was not reviewed",
            detail: "Four blocks may include a hill. These sample notes do not show that route.",
            ask: "Is the walk to Sample Clinic flat enough for a short-distance walker?",
          }),
          trip({
            id: "transit",
            label: "Transit",
            name: "Sample bus stop",
            route: "One block, same side",
            routeDistance: "0.2 mi on the sidewalk",
            straightLine: "0.2 mi",
            involves: "A short, level sidewalk with no stair in the frame.",
            status: "observed",
            title: "The stop is a short level walk in the sample notes",
            detail: "No slope or stair is visible on the way to the stop sign. Boarding the bus is a separate unknown.",
          }),
        ],
      },
      "low-vision": {
        story:
          "The grocery corner's crosswalk paint is faded in the sample frame, and no street light is visible over that crossing. The missing light at the building door is a separate note in the home report.",
        street: [
          note({
            id: "lighting",
            label: "Street lighting",
            status: "unknown",
            title: "No street light is visible over the grocery crossing",
            detail:
              "The sample frames are daytime. They do not show a lamp at Sample Street, and they do not show the corner at night.",
            ask: "Is the crossing at Sample Street lit after dark?",
          }),
          note({
            id: "contrast",
            label: "Crosswalk contrast",
            status: "barrier",
            scene: "street-gap",
            title: "Crosswalk paint at the grocery corner is faded",
            detail: "The sample frame shows a faint line, not a clear crossing edge.",
            ask: "Is the crosswalk at Sample Street repainted?",
          }),
          note({
            id: "signage",
            label: "Street signs",
            status: "unknown",
            title: "The street-name sign is too small to read in the frame",
            detail: "A sign is visible at the corner. The words are not legible in this sample.",
            ask: "Are the street signs on Linden Lane large and high-contrast?",
          }),
        ],
        trips: [
          trip({
            id: "grocery",
            label: "Grocery",
            name: "Sample Market",
            route: "Two blocks, crossing at Sample Street",
            routeDistance: "0.3 mi on the sidewalk",
            straightLine: "0.2 mi across the block",
            involves: "The walk uses the faded crossing noted above.",
            status: "barrier",
            scene: "street-gap",
            title: "The grocery trip uses the faded crossing",
            detail: "The storefront sign is not readable in the sample frame either.",
            ask: "Is the Sample Market entrance marked with a high-contrast sign?",
          }),
          trip({
            id: "pharmacy",
            label: "Pharmacy",
            name: "Sample Pharmacy",
            route: "One block the other way",
            routeDistance: "0.2 mi on the sidewalk",
            straightLine: "0.15 mi",
            involves: "Lighting and the storefront sign are not in the frames.",
            status: "unknown",
            title: "The pharmacy approach was not checked for contrast",
            detail: "This direction is named in the sample notes and not reviewed.",
          }),
          trip({
            id: "clinic",
            label: "Healthcare",
            name: "Sample Clinic",
            route: "Four blocks, not covered",
            routeDistance: "0.6 mi on the sidewalk",
            straightLine: "0.4 mi",
            involves: "A longer walk with crossings that were not reviewed.",
            status: "unknown",
            title: "The clinic route was not reviewed",
            detail: "No sample frame shows the clinic entrance or its signs.",
          }),
          trip({
            id: "transit",
            label: "Transit",
            name: "Sample bus stop",
            route: "One block, same side",
            routeDistance: "0.2 mi on the sidewalk",
            straightLine: "0.2 mi",
            involves: "Find the stop without a readable sign in the frame.",
            status: "unknown",
            title: "The stop sign is not readable in the sample frame",
            detail: "A pole is visible. The route number and the stop name are not.",
            ask: "Is the Linden Lane stop signed in large type?",
          }),
        ],
      },
      "hard-of-hearing": {
        story:
          "The sample corner has a crossing button and no visible walk light or countdown. Whether the grocery, pharmacy, or clinic can be used without relying on sound is not in these notes.",
        street: [
          note({
            id: "signal",
            label: "Crossing signal",
            status: "barrier",
            scene: "street-signal",
            title: "The crossing button is shown, and no visual walk signal is in the frame",
            detail:
              "The sample frame includes a push button. It does not include a countdown or a visible walk indication.",
            ask: "Does the Sample Street crossing have a visible walk signal?",
          }),
          note({
            id: "display",
            label: "Visible information",
            status: "unknown",
            title: "No readable stop or store display is in the frame",
            detail: "Signs are present and not legible in this sample.",
          }),
        ],
        trips: [
          trip({
            id: "grocery",
            label: "Grocery",
            name: "Sample Market",
            route: "Two blocks, crossing at Sample Street",
            routeDistance: "0.3 mi on the sidewalk",
            straightLine: "0.2 mi across the block",
            involves: "Cross where the visual signal is missing, then find the store.",
            status: "unknown",
            title: "Nothing in the sample notes describes a visual checkout",
            detail: "The crossing itself is the barrier above. The store's counter is unknown.",
            ask: "Can you check out at Sample Market without relying on being called aloud?",
          }),
          trip({
            id: "pharmacy",
            label: "Pharmacy",
            name: "Sample Pharmacy",
            route: "One block the other way",
            routeDistance: "0.2 mi on the sidewalk",
            straightLine: "0.15 mi",
            involves: "A short walk. The counter is not described.",
            status: "unknown",
            title: "The pharmacy counter is not described",
            detail: "These sample notes do not say whether a ticket screen or a visual call system exists.",
          }),
          trip({
            id: "clinic",
            label: "Healthcare",
            name: "Sample Clinic",
            route: "Four blocks, not covered",
            routeDistance: "0.6 mi on the sidewalk",
            straightLine: "0.4 mi",
            involves: "A longer walk to a waiting room that was not reviewed.",
            status: "unknown",
            title: "The clinic route and waiting room were not reviewed",
            detail: "No sample note says how patients are called.",
          }),
          trip({
            id: "transit",
            label: "Transit",
            name: "Sample bus stop",
            route: "One block, same side",
            routeDistance: "0.2 mi on the sidewalk",
            straightLine: "0.2 mi",
            involves: "Walk to a pole. No departure screen is visible.",
            status: "unknown",
            title: "The stop has no visible departure display in the frame",
            detail: "Announcements would not help. A screen is not shown.",
            ask: "Does the Linden Lane stop show arrivals on a screen?",
          }),
        ],
      },
    },
  },
  quarry: {
    look: "Sample notes for the sidewalks near Quarry Road, a level grocery direction, and a steep block toward a pharmacy and a bus stop. These are not live directions.",
    profiles: {
      wheelchair: {
        story:
          "The lot curb with no cut is a building problem, already in the home report. The sample grocery walk is a different direction: short, level, and ramped. The pharmacy is up a steep block.",
        street: [
          note({
            id: "sidewalk",
            label: "Sidewalk",
            status: "observed",
            title: "Sidewalks are continuous toward the grocery in the sample frames",
            detail: "The frames show a sidewalk on the level side of Quarry Road. They are not a full inventory.",
          }),
          note({
            id: "crossings",
            label: "Crossings",
            status: "observed",
            title: "Curb ramps are visible at the grocery corner",
            detail:
              "This is the Sample Street corner in the notes, not the curb at the building lot. Ramps are visible there.",
          }),
          note({
            id: "slope",
            label: "Slope",
            status: "barrier",
            scene: "street-hill",
            title: "The block toward the pharmacy rises sharply",
            detail:
              "The sample frames show a steep rise. Grade was not measured. A wheelchair route up that block is not shown.",
            ask: "Is there a step-free route to Sample Pharmacy that avoids the steep block?",
          }),
        ],
        trips: [
          trip({
            id: "grocery",
            label: "Grocery",
            name: "Sample Market",
            route: "Two level blocks, away from the hill",
            routeDistance: "0.3 mi on the sidewalk",
            straightLine: "0.2 mi",
            involves: "Leave the ramp at the building, stay on the level sidewalk, and use the ramped corner.",
            status: "observed",
            title: "The grocery route in the sample notes is level and ramped",
            detail:
              "This does not clear the unmarked curb at the parking lot. It only describes the walk toward Sample Market.",
          }),
          trip({
            id: "pharmacy",
            label: "Pharmacy",
            name: "Sample Pharmacy",
            route: "One block up the steep side of Quarry Road",
            routeDistance: "0.2 mi uphill",
            straightLine: "0.15 mi",
            involves: "Climb the steep block. The ramp at the top is not in the frame.",
            status: "barrier",
            scene: "street-hill",
            title: "The pharmacy route climbs the steep block",
            detail: "A straight line looks short. The sample route is the hill, and no step-free alternative is shown.",
            ask: "Can a wheelchair reach Sample Pharmacy without that hill?",
          }),
          trip({
            id: "clinic",
            label: "Healthcare",
            name: "Sample Clinic",
            route: "Not covered by the sample frames",
            routeDistance: "0.5 mi on the sidewalk",
            straightLine: "0.3 mi",
            involves: "A longer walk. Crossings and grade were not reviewed.",
            status: "unknown",
            title: "The clinic route was not reviewed",
            detail: "Sample Clinic is a placeholder so the missing route stays visible.",
          }),
          trip({
            id: "transit",
            label: "Transit",
            name: "Sample bus stop",
            route: "The stop sits on the steep block",
            routeDistance: "0.2 mi uphill",
            straightLine: "0.15 mi",
            involves: "The same hill as the pharmacy. Boarding is not shown.",
            status: "unknown",
            scene: "street-hill",
            title: "The stop is on the steep block, and boarding was not reviewed",
            detail:
              "The hill is already listed as a barrier. The bus pad and the vehicle floor are unknown, so this trip stays unknown instead of adding a second barrier.",
            ask: "Is the Quarry Road stop level with the sidewalk?",
          }),
        ],
      },
      hills: {
        story:
          "A short walk is fine on the level side. The pharmacy block is steep in the sample frames, even where a ramp is visible at the bottom. The building entrance itself is a short ramp, not a stair.",
        street: [
          note({
            id: "sidewalk",
            label: "Sidewalk",
            status: "observed",
            title: "The sidewalks in the sample frames are connected",
            detail: "No missing link or public stair is visible near Quarry Road.",
          }),
          note({
            id: "crossings",
            label: "Crossings",
            status: "observed",
            title: "The grocery corner has ramps and no stair",
            detail: "No flight of stairs is visible at that crossing.",
          }),
          note({
            id: "slope",
            label: "Slope",
            status: "barrier",
            scene: "street-hill",
            title: "The pharmacy block is steep",
            detail:
              "A ramp at the bottom does not flatten the block. The sample frames show a sharp rise, and grade was not measured.",
            ask: "How steep is the block from 9 Quarry Road to Sample Pharmacy?",
          }),
        ],
        trips: [
          trip({
            id: "grocery",
            label: "Grocery",
            name: "Sample Market",
            route: "Two level blocks, away from the hill",
            routeDistance: "0.3 mi on the sidewalk",
            straightLine: "0.2 mi",
            involves: "A short walk with no stair and no visible climb.",
            status: "observed",
            title: "The grocery walk stays on the level side",
            detail: "The sample route does not use the steep block.",
          }),
          trip({
            id: "pharmacy",
            label: "Pharmacy",
            name: "Sample Pharmacy",
            route: "One block up the steep side",
            routeDistance: "0.2 mi uphill",
            straightLine: "0.15 mi",
            involves: "A short distance that climbs sharply.",
            status: "barrier",
            scene: "street-hill",
            title: "The pharmacy is a short, steep walk",
            detail: "Distance alone makes this look easy. The sample route is the hill.",
            ask: "Is there a flatter walk to Sample Pharmacy?",
          }),
          trip({
            id: "clinic",
            label: "Healthcare",
            name: "Sample Clinic",
            route: "Not covered by the sample frames",
            routeDistance: "0.5 mi on the sidewalk",
            straightLine: "0.3 mi",
            involves: "A longer walk. Hills on the way were not reviewed.",
            status: "unknown",
            title: "The clinic route was not reviewed",
            detail: "No sample frame shows the grade between Quarry Road and Sample Clinic.",
          }),
          trip({
            id: "transit",
            label: "Transit",
            name: "Sample bus stop",
            route: "The stop sits on the steep block",
            routeDistance: "0.2 mi uphill",
            straightLine: "0.15 mi",
            involves: "The same hill as the pharmacy.",
            status: "unknown",
            scene: "street-hill",
            title: "The stop uses the steep block already listed above",
            detail: "The grade is the slope barrier. This trip stays unknown so the hill is not counted twice.",
          }),
        ],
      },
      "low-vision": {
        story:
          "The sample grocery block has wall lights and a painted crossing. That is a stronger street note than Linden's faded corner. Signs along the route are still unread.",
        street: [
          note({
            id: "lighting",
            label: "Street lighting",
            status: "observed",
            title: "Lights are visible along the grocery block",
            detail: "The sample frames show wall-mounted lights continuing past the ramp. Night brightness was not measured.",
          }),
          note({
            id: "contrast",
            label: "Crosswalk contrast",
            status: "observed",
            title: "The grocery crossing is painted in the sample frame",
            detail: "A light edge is visible across the sample corner. Wear was not measured.",
          }),
          note({
            id: "signage",
            label: "Street signs",
            status: "unknown",
            title: "Street-name signs are not readable in the frames",
            detail: "Signs are present. The words are too small in this sample.",
          }),
        ],
        trips: [
          trip({
            id: "grocery",
            label: "Grocery",
            name: "Sample Market",
            route: "Two level blocks with a painted crossing",
            routeDistance: "0.3 mi on the sidewalk",
            straightLine: "0.2 mi",
            involves: "A lit block and a painted crossing, then a storefront sign that is not readable.",
            status: "unknown",
            title: "The route is lit, and the storefront sign was not read",
            detail: "Lighting and the crossing are observed above. The shop sign itself is unknown.",
          }),
          trip({
            id: "pharmacy",
            label: "Pharmacy",
            name: "Sample Pharmacy",
            route: "Up the steep block",
            routeDistance: "0.2 mi uphill",
            straightLine: "0.15 mi",
            involves: "A climb. Contrast on that block was not reviewed.",
            status: "unknown",
            title: "Contrast on the pharmacy block was not reviewed",
            detail: "The hill is a mobility note. These frames do not show paint or lighting on that side.",
          }),
          trip({
            id: "clinic",
            label: "Healthcare",
            name: "Sample Clinic",
            route: "Not covered",
            routeDistance: "0.5 mi on the sidewalk",
            straightLine: "0.3 mi",
            involves: "A longer walk with signs that were not reviewed.",
            status: "unknown",
            title: "The clinic route was not reviewed",
            detail: "No sample frame shows the clinic entrance.",
          }),
          trip({
            id: "transit",
            label: "Transit",
            name: "Sample bus stop",
            route: "On the steep block",
            routeDistance: "0.2 mi uphill",
            straightLine: "0.15 mi",
            involves: "Find a stop whose sign is not readable in the frame.",
            status: "unknown",
            title: "The stop sign is not readable",
            detail: "A pole is visible. The route number is not.",
          }),
        ],
      },
      "hard-of-hearing": {
        story:
          "The sample frames near Quarry Road do not show a visual walk signal or a departure screen. The building's video intercom is a separate note inside the home.",
        street: [
          note({
            id: "signal",
            label: "Crossing signal",
            status: "unknown",
            scene: "street-signal",
            title: "No crossing signal is visible in the grocery-corner frame",
            detail: "The frame shows the ramp and not a push button or a walk light.",
            ask: "Does the grocery-corner crossing have a visible walk signal?",
          }),
          note({
            id: "display",
            label: "Visible information",
            status: "unknown",
            title: "No readable display is in the street frames",
            detail: "Store and stop signs were not legible in this sample.",
          }),
        ],
        trips: [
          trip({
            id: "grocery",
            label: "Grocery",
            name: "Sample Market",
            route: "Two level blocks",
            routeDistance: "0.3 mi on the sidewalk",
            straightLine: "0.2 mi",
            involves: "A walk, then a checkout that is not described.",
            status: "unknown",
            title: "Visual checkout at the market is not described",
            detail: "These sample notes do not say how staff get a shopper's attention.",
          }),
          trip({
            id: "pharmacy",
            label: "Pharmacy",
            name: "Sample Pharmacy",
            route: "Up the steep block",
            routeDistance: "0.2 mi uphill",
            straightLine: "0.15 mi",
            involves: "The counter is not described.",
            status: "unknown",
            title: "The pharmacy counter is not described",
            detail: "No note on a ticket screen or a visual call system.",
          }),
          trip({
            id: "clinic",
            label: "Healthcare",
            name: "Sample Clinic",
            route: "Not covered",
            routeDistance: "0.5 mi on the sidewalk",
            straightLine: "0.3 mi",
            involves: "A waiting room that was not reviewed.",
            status: "unknown",
            title: "The clinic was not reviewed",
            detail: "No sample note says how patients are called.",
          }),
          trip({
            id: "transit",
            label: "Transit",
            name: "Sample bus stop",
            route: "On the steep block",
            routeDistance: "0.2 mi uphill",
            straightLine: "0.15 mi",
            involves: "A pole with no visible departure screen.",
            status: "unknown",
            title: "No departure screen is visible at the stop",
            detail: "Announcements would not help. A screen is not shown.",
          }),
        ],
      },
    },
  },
  witherspoon: {
    look: "Sample notes for a sidewalk that ends before the grocery corner near Witherspoon Street, plus routes to a pharmacy, a clinic, and a bus stop. These are not live directions.",
    profiles: {
      wheelchair: {
        story:
          "Four steps already block the front door. The sample sidewalk also stops before the grocery corner, so the street does not offer a way around that entrance.",
        street: [
          note({
            id: "sidewalk",
            label: "Sidewalk",
            status: "barrier",
            scene: "street-gap",
            title: "The sidewalk ends before the grocery corner",
            detail:
              "In the sample frames the concrete stops mid-block. The next piece, if it exists, is not connected in the frame.",
            ask: "Does the sidewalk on Witherspoon Street continue to Sample Market?",
          }),
          note({
            id: "crossings",
            label: "Crossings",
            status: "unknown",
            title: "The grocery corner is outside the sample frames",
            detail: "The sidewalk gap comes first. The corner itself was not reviewed.",
          }),
          note({
            id: "slope",
            label: "Slope",
            status: "unknown",
            title: "Grade along the broken sidewalk was not reviewed",
            detail: "The frames show the gap, not a measurable slope.",
          }),
        ],
        trips: [
          trip({
            id: "grocery",
            label: "Grocery",
            name: "Sample Market",
            route: "Two blocks, through the sidewalk gap",
            routeDistance: "0.3 mi if the sidewalk connected",
            straightLine: "0.2 mi",
            involves: "Leave the stepped entrance, then reach a sidewalk that ends.",
            status: "barrier",
            scene: "street-gap",
            title: "The grocery route uses the broken sidewalk",
            detail: "A straight line crosses the block. The sample route does not connect.",
            ask: "Is there a step-free sidewalk from 42 Witherspoon Street to Sample Market?",
          }),
          trip({
            id: "pharmacy",
            label: "Pharmacy",
            name: "Sample Pharmacy",
            route: "The other direction, not in the frames",
            routeDistance: "0.2 mi",
            straightLine: "0.15 mi",
            involves: "A short walk that was not reviewed.",
            status: "unknown",
            title: "The pharmacy direction was not reviewed",
            detail: "These notes do not show that sidewalk.",
          }),
          trip({
            id: "clinic",
            label: "Healthcare",
            name: "Sample Clinic",
            route: "Not covered",
            routeDistance: "0.5 mi",
            straightLine: "0.3 mi",
            involves: "A longer walk that was not reviewed.",
            status: "unknown",
            title: "The clinic route was not reviewed",
            detail: "No sample frame covers Sample Clinic.",
          }),
          trip({
            id: "transit",
            label: "Transit",
            name: "Sample bus stop",
            route: "One block past the sidewalk gap",
            routeDistance: "0.2 mi if connected",
            straightLine: "0.2 mi",
            involves: "The same broken sidewalk, then a stop that is not shown.",
            status: "unknown",
            title: "The stop is past the gap, and boarding was not reviewed",
            detail: "The sidewalk barrier already covers the gap. The bus pad is unknown.",
          }),
        ],
      },
      hills: {
        story:
          "The front door is four steps, which is the main barrier for this need. On the street, the sample sidewalk ends before the grocery, so the walk is incomplete even without a hill.",
        street: [
          note({
            id: "sidewalk",
            label: "Sidewalk",
            status: "barrier",
            scene: "street-gap",
            title: "The sidewalk ends before the grocery corner",
            detail: "The sample frames show a gap, not a stair. Finishing the walk means leaving the sidewalk.",
            ask: "Is the sidewalk continuous from 42 Witherspoon Street to Sample Market?",
          }),
          note({
            id: "crossings",
            label: "Crossings",
            status: "unknown",
            title: "The corner is outside the frames",
            detail: "No public stair is visible because the corner is not in the sample.",
          }),
          note({
            id: "slope",
            label: "Slope",
            status: "unknown",
            title: "Slope was not reviewed",
            detail: "The frames show the gap more clearly than the grade.",
          }),
        ],
        trips: [
          trip({
            id: "grocery",
            label: "Grocery",
            name: "Sample Market",
            route: "Two blocks, through the sidewalk gap",
            routeDistance: "0.3 mi if the sidewalk connected",
            straightLine: "0.2 mi",
            involves: "Four steps at the door, then a sidewalk that ends.",
            status: "unknown",
            title: "The grocery trip depends on the sidewalk gap already listed",
            detail: "The gap is one barrier. This trip stays unknown so it is not counted again.",
          }),
          trip({
            id: "pharmacy",
            label: "Pharmacy",
            name: "Sample Pharmacy",
            route: "Not in the frames",
            routeDistance: "0.2 mi",
            straightLine: "0.15 mi",
            involves: "A short walk that was not reviewed.",
            status: "unknown",
            title: "The pharmacy direction was not reviewed",
            detail: "No sample frame shows stairs or a hill that way.",
          }),
          trip({
            id: "clinic",
            label: "Healthcare",
            name: "Sample Clinic",
            route: "Not covered",
            routeDistance: "0.5 mi",
            straightLine: "0.3 mi",
            involves: "A longer walk. Hills were not reviewed.",
            status: "unknown",
            title: "The clinic route was not reviewed",
            detail: "Grade on the way to Sample Clinic is unknown.",
          }),
          trip({
            id: "transit",
            label: "Transit",
            name: "Sample bus stop",
            route: "Past the sidewalk gap",
            routeDistance: "0.2 mi if connected",
            straightLine: "0.2 mi",
            involves: "The same gap, then a stop that is not shown.",
            status: "unknown",
            title: "The stop is past the gap",
            detail: "The sidewalk barrier covers the gap. Boarding is unknown.",
          }),
        ],
      },
      "low-vision": {
        story:
          "Unmarked step edges at the building are already in the home report. The sample street frames do not add a second, separate contrast finding. Lighting and signs along the block were not readable.",
        street: [
          note({
            id: "lighting",
            label: "Street lighting",
            status: "unknown",
            title: "No street light is readable in the daytime frames",
            detail: "The sample does not show the block at night.",
          }),
          note({
            id: "contrast",
            label: "Crosswalk contrast",
            status: "unknown",
            title: "The public crossing is outside the frames",
            detail:
              "Unmarked nosings at the building steps are the interior contrast note. They are not repeated here.",
          }),
          note({
            id: "signage",
            label: "Street signs",
            status: "unknown",
            title: "No street sign is readable in the frames",
            detail: "The sidewalk gap is the clearer feature. Signs were not legible.",
          }),
        ],
        trips: [
          trip({
            id: "grocery",
            label: "Grocery",
            name: "Sample Market",
            route: "Through the sidewalk gap",
            routeDistance: "0.3 mi if connected",
            straightLine: "0.2 mi",
            involves: "A walk whose crossing paint was not reviewed.",
            status: "unknown",
            title: "Contrast on the grocery walk was not reviewed",
            detail: "The sidewalk gap is a mobility note. Paint and lighting here are unknown.",
          }),
          trip({
            id: "pharmacy",
            label: "Pharmacy",
            name: "Sample Pharmacy",
            route: "Not in the frames",
            routeDistance: "0.2 mi",
            straightLine: "0.15 mi",
            involves: "Signs on that block were not reviewed.",
            status: "unknown",
            title: "The pharmacy approach was not checked",
            detail: "No sample frame shows that storefront.",
          }),
          trip({
            id: "clinic",
            label: "Healthcare",
            name: "Sample Clinic",
            route: "Not covered",
            routeDistance: "0.5 mi",
            straightLine: "0.3 mi",
            involves: "A longer walk with signs that were not reviewed.",
            status: "unknown",
            title: "The clinic route was not reviewed",
            detail: "No sample frame shows the clinic sign.",
          }),
          trip({
            id: "transit",
            label: "Transit",
            name: "Sample bus stop",
            route: "Past the gap",
            routeDistance: "0.2 mi if connected",
            straightLine: "0.2 mi",
            involves: "A stop sign that is not readable in the frame.",
            status: "unknown",
            title: "The stop sign is not readable",
            detail: "The pole, if present, is past the gap and not legible.",
          }),
        ],
      },
      "hard-of-hearing": {
        story:
          "These sample street frames do not show a visual walk signal, a store display, or a transit screen near Witherspoon Street.",
        street: [
          note({
            id: "signal",
            label: "Crossing signal",
            status: "unknown",
            scene: "street-signal",
            title: "No crossing signal is in the frames",
            detail: "The sidewalk ends before the corner, so the signal was not reviewed.",
          }),
          note({
            id: "display",
            label: "Visible information",
            status: "unknown",
            title: "No readable display is in the frames",
            detail: "Store and stop information was not legible.",
          }),
        ],
        trips: [
          trip({
            id: "grocery",
            label: "Grocery",
            name: "Sample Market",
            route: "Through the sidewalk gap",
            routeDistance: "0.3 mi if connected",
            straightLine: "0.2 mi",
            involves: "A walk, then a checkout that is not described.",
            status: "unknown",
            title: "Visual checkout is not described",
            detail: "These notes do not say how staff get a shopper's attention.",
          }),
          trip({
            id: "pharmacy",
            label: "Pharmacy",
            name: "Sample Pharmacy",
            route: "Not in the frames",
            routeDistance: "0.2 mi",
            straightLine: "0.15 mi",
            involves: "A counter that is not described.",
            status: "unknown",
            title: "The pharmacy counter is not described",
            detail: "No note on a visual call system.",
          }),
          trip({
            id: "clinic",
            label: "Healthcare",
            name: "Sample Clinic",
            route: "Not covered",
            routeDistance: "0.5 mi",
            straightLine: "0.3 mi",
            involves: "A waiting room that was not reviewed.",
            status: "unknown",
            title: "The clinic was not reviewed",
            detail: "No sample note says how patients are called.",
          }),
          trip({
            id: "transit",
            label: "Transit",
            name: "Sample bus stop",
            route: "Past the gap",
            routeDistance: "0.2 mi if connected",
            straightLine: "0.2 mi",
            involves: "A stop with no visible screen in the frames.",
            status: "unknown",
            title: "No departure screen is shown",
            detail: "The stop itself was not in the frames.",
          }),
        ],
      },
    },
  },
  palmer: {
    look: "Sample notes for a level block on Palmer Lane toward a grocery, with the building stair kept separate from the street. These are not live directions.",
    profiles: {
      wheelchair: {
        story:
          "The apartment is a walk-up, so the home is the barrier. The sample street is the easier part: one level block to a grocery, with a curb ramp in the frame.",
        street: [
          note({
            id: "sidewalk",
            label: "Sidewalk",
            status: "observed",
            title: "The sidewalk is continuous on this sample block",
            detail: "The frames show an unbroken sidewalk in front of Palmer Lane. They are not a city inventory.",
          }),
          note({
            id: "crossings",
            label: "Crossings",
            status: "observed",
            title: "A curb ramp is visible at the grocery corner",
            detail: "The sample corner has a ramp. The exterior stair to the apartment is a different feature.",
          }),
          note({
            id: "slope",
            label: "Slope",
            status: "observed",
            title: "The grocery block reads as level",
            detail: "No steep rise is visible between the building and Sample Market. Grade was not measured.",
          }),
        ],
        trips: [
          trip({
            id: "grocery",
            label: "Grocery",
            name: "Sample Market",
            route: "One block, same side of Palmer Lane",
            routeDistance: "0.1 mi on the sidewalk",
            straightLine: "0.1 mi",
            involves: "A level sidewalk and a ramped corner. The stair is at the building, not on this route.",
            status: "observed",
            title: "The grocery route is level once you are on the sidewalk",
            detail:
              "That does not make the walk-up livable. It shows the street and the apartment are different questions.",
          }),
          trip({
            id: "pharmacy",
            label: "Pharmacy",
            name: "Sample Pharmacy",
            route: "Two blocks, partly outside the frames",
            routeDistance: "0.3 mi on the sidewalk",
            straightLine: "0.2 mi",
            involves: "The first block is level. The second crossing is not shown.",
            status: "unknown",
            title: "The second crossing toward the pharmacy is not in the frames",
            detail: "A short straight-line distance does not show that corner.",
            ask: "Is the second corner toward Sample Pharmacy ramped?",
          }),
          trip({
            id: "clinic",
            label: "Healthcare",
            name: "Sample Clinic",
            route: "Not covered",
            routeDistance: "0.6 mi",
            straightLine: "0.4 mi",
            involves: "A longer walk that was not reviewed.",
            status: "unknown",
            title: "The clinic route was not reviewed",
            detail: "No sample frame covers Sample Clinic from Palmer Lane.",
          }),
          trip({
            id: "transit",
            label: "Transit",
            name: "Sample bus stop",
            route: "Two level blocks",
            routeDistance: "0.2 mi on the sidewalk",
            straightLine: "0.2 mi",
            involves: "A level walk. The boarding pad is not shown.",
            status: "unknown",
            title: "The walk looks level, and boarding was not reviewed",
            detail: "The sidewalk is in the frames. The bus pad and the vehicle floor are not.",
          }),
        ],
      },
      hills: {
        story:
          "The sample street is a short level block with no public stair. The barrier for this need is the exterior stair to the apartment, already in the home report.",
        street: [
          note({
            id: "sidewalk",
            label: "Sidewalk",
            status: "observed",
            title: "The sidewalk is continuous and has no public stair",
            detail: "The only stair in the sample frames is the one up to the building door.",
          }),
          note({
            id: "crossings",
            label: "Crossings",
            status: "observed",
            title: "The grocery corner has a ramp and no stair",
            detail: "No flight of steps is visible at that crossing.",
          }),
          note({
            id: "slope",
            label: "Slope",
            status: "observed",
            title: "The grocery block reads as level",
            detail: "No steep rise is visible. Grade was not measured.",
          }),
        ],
        trips: [
          trip({
            id: "grocery",
            label: "Grocery",
            name: "Sample Market",
            route: "One level block",
            routeDistance: "0.1 mi on the sidewalk",
            straightLine: "0.1 mi",
            involves: "A short flat walk after the building stair.",
            status: "observed",
            title: "The grocery walk itself does not climb",
            detail: "The stair that matters is at the front door, not on the way to the store.",
          }),
          trip({
            id: "pharmacy",
            label: "Pharmacy",
            name: "Sample Pharmacy",
            route: "Two blocks, partly outside the frames",
            routeDistance: "0.3 mi on the sidewalk",
            straightLine: "0.2 mi",
            involves: "The first block is level. The second block's grade is not shown.",
            status: "unknown",
            title: "Grade on the second block was not reviewed",
            detail: "These notes do not show whether that block climbs.",
          }),
          trip({
            id: "clinic",
            label: "Healthcare",
            name: "Sample Clinic",
            route: "Not covered",
            routeDistance: "0.6 mi",
            straightLine: "0.4 mi",
            involves: "A longer walk. Hills were not reviewed.",
            status: "unknown",
            title: "The clinic route was not reviewed",
            detail: "No sample frame shows the grade toward Sample Clinic.",
          }),
          trip({
            id: "transit",
            label: "Transit",
            name: "Sample bus stop",
            route: "Two level blocks",
            routeDistance: "0.2 mi on the sidewalk",
            straightLine: "0.2 mi",
            involves: "A short walk with no stair in the frames.",
            status: "observed",
            title: "The stop is a short level walk in the sample notes",
            detail: "No public stair is visible. Boarding the bus is still unknown.",
          }),
        ],
      },
      "low-vision": {
        story:
          "The exterior stair is already unlit in the home report. The sample grocery block also shows no street light, so the walk away from the door has the same kind of gap.",
        street: [
          note({
            id: "lighting",
            label: "Street lighting",
            status: "barrier",
            title: "No street light is visible along the grocery block",
            detail:
              "The sample frames show the sidewalk and no lamp. This is the public block, separate from the unlit stair at the door.",
            ask: "Is Palmer Lane lit between the building and Sample Market?",
          }),
          note({
            id: "contrast",
            label: "Crosswalk contrast",
            status: "unknown",
            title: "Crosswalk paint is not clear in the frame",
            detail: "A ramp is visible. The painted edge, if any, was not readable.",
          }),
          note({
            id: "signage",
            label: "Street signs",
            status: "unknown",
            title: "The street sign is not readable",
            detail: "A sign shape is visible. The words are not.",
          }),
        ],
        trips: [
          trip({
            id: "grocery",
            label: "Grocery",
            name: "Sample Market",
            route: "One block with no visible street light",
            routeDistance: "0.1 mi on the sidewalk",
            straightLine: "0.1 mi",
            involves: "A short walk along the unlit block noted above.",
            status: "unknown",
            title: "The grocery trip uses the unlit block already listed",
            detail: "The missing light is one barrier. The storefront sign is a separate unknown.",
          }),
          trip({
            id: "pharmacy",
            label: "Pharmacy",
            name: "Sample Pharmacy",
            route: "Two blocks, partly outside the frames",
            routeDistance: "0.3 mi",
            straightLine: "0.2 mi",
            involves: "Lighting on the second block was not reviewed.",
            status: "unknown",
            title: "The pharmacy approach was not checked for light",
            detail: "Those frames are missing.",
          }),
          trip({
            id: "clinic",
            label: "Healthcare",
            name: "Sample Clinic",
            route: "Not covered",
            routeDistance: "0.6 mi",
            straightLine: "0.4 mi",
            involves: "A longer walk with signs that were not reviewed.",
            status: "unknown",
            title: "The clinic route was not reviewed",
            detail: "No sample frame shows the clinic sign.",
          }),
          trip({
            id: "transit",
            label: "Transit",
            name: "Sample bus stop",
            route: "Two blocks",
            routeDistance: "0.2 mi",
            straightLine: "0.2 mi",
            involves: "A stop sign that is not readable.",
            status: "unknown",
            title: "The stop sign is not readable",
            detail: "The pole is in the distance of the sample frame. The words are not.",
          }),
        ],
      },
      "hard-of-hearing": {
        story:
          "The sample corner on Palmer Lane includes a visible countdown. The building's strobe alarms and video doorbell are separate notes inside the home. Transit and the shops still have no visible display in these frames.",
        street: [
          note({
            id: "signal",
            label: "Crossing signal",
            status: "observed",
            scene: "street-signal",
            title: "A visible countdown is in the sample frame of the corner",
            detail: "The frame shows a numeric display beside the crossing. Sound was not reviewed, and this is not a certification.",
          }),
          note({
            id: "display",
            label: "Visible information",
            status: "unknown",
            title: "Shop and stop displays were not readable",
            detail: "The crossing countdown is the only visual signal in these frames.",
          }),
        ],
        trips: [
          trip({
            id: "grocery",
            label: "Grocery",
            name: "Sample Market",
            route: "One block, then the corner with the countdown",
            routeDistance: "0.1 mi on the sidewalk",
            straightLine: "0.1 mi",
            involves: "Cross with the visible countdown, then a checkout that is not described.",
            status: "unknown",
            title: "The crossing has a countdown, and the checkout is unknown",
            detail: "The signal is observed above. The store counter is not described.",
          }),
          trip({
            id: "pharmacy",
            label: "Pharmacy",
            name: "Sample Pharmacy",
            route: "Two blocks",
            routeDistance: "0.3 mi",
            straightLine: "0.2 mi",
            involves: "A counter that is not described.",
            status: "unknown",
            title: "The pharmacy counter is not described",
            detail: "No note on a visual call system.",
          }),
          trip({
            id: "clinic",
            label: "Healthcare",
            name: "Sample Clinic",
            route: "Not covered",
            routeDistance: "0.6 mi",
            straightLine: "0.4 mi",
            involves: "A waiting room that was not reviewed.",
            status: "unknown",
            title: "The clinic was not reviewed",
            detail: "No sample note says how patients are called.",
          }),
          trip({
            id: "transit",
            label: "Transit",
            name: "Sample bus stop",
            route: "Two blocks",
            routeDistance: "0.2 mi",
            straightLine: "0.2 mi",
            involves: "A pole with no visible departure screen.",
            status: "unknown",
            title: "No departure screen is visible at the stop",
            detail: "The crossing countdown does not show bus arrivals.",
            ask: "Does the Palmer Lane stop show arrivals on a screen?",
          }),
        ],
      },
    },
  },
};

const EMPTY = {
  look: "",
  sections: [],
  findings: [],
  counts: { observed: 0, barrier: 0, unknown: 0 },
  questions: [],
};

export function lifeHeadline(findings) {
  return (
    findings.find((item) => item.id === "grocery" && item.status === "barrier") ||
    findings.find((item) => item.status === "barrier") ||
    findings.find((item) => item.id === "grocery") ||
    findings.find((item) => item.status === "unknown") ||
    findings[0] ||
    null
  );
}

function spokenList(items) {
  if (items.length <= 1) return items[0] || "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

const NEARBY_INTENTS = [
  { id: "grocery", patterns: [/grocer/, /supermarket/, /\bmarket\b/, /\bfood\b/] },
  { id: "pharmacy", patterns: [/pharmac/, /prescription/, /medicine/, /drug\s*store/] },
  { id: "clinic", patterns: [/clinic/, /doctor/, /hospital/, /healthcare/, /health care/, /\bmedical\b/, /urgent care/] },
  { id: "transit", patterns: [/\bbus\b/, /transit/, /\btrain\b/, /subway/, /commute/] },
];

export function interpretNearby(text) {
  const cleaned = typeof text === "string" ? text.replace(/\s+/g, " ").trim().slice(0, 280) : "";
  const lower = cleaned.toLowerCase();
  const intents = NEARBY_INTENTS.filter((intent) => intent.patterns.some((pattern) => pattern.test(lower))).map(
    (intent) => intent.id,
  );
  return { text: cleaned, intents, recognized: intents.length > 0 };
}

export function focusLife(listingId, profileIds = [], text = "") {
  const query = interpretNearby(text);
  const full = lifeReport(listingId, profileIds);
  const empty = { query, focused: false, trips: [], counts: { observed: 0, barrier: 0, unknown: 0 }, questions: [] };
  if (!query.recognized || full.sections.length === 0) return empty;
  const trips = query.intents
    .map((id) => {
      const byNeed = full.sections
        .map((section) => ({
          needId: section.id,
          needLabel: section.label,
          trip: section.trips.find((item) => item.id === id),
        }))
        .filter((item) => item.trip);
      const sketch =
        byNeed.find((item) => item.trip.status === "barrier" && item.trip.scene !== "street-level")?.trip ||
        byNeed.find((item) => item.trip.scene !== "street-level")?.trip ||
        byNeed[0]?.trip ||
        null;
      return { id, byNeed, sketch };
    })
    .filter((item) => item.byNeed.length > 0);
  const findings = trips.flatMap((item) => item.byNeed.map((entry) => entry.trip));
  const counts = { observed: 0, barrier: 0, unknown: 0 };
  for (const finding of findings) counts[finding.status] += 1;
  const seen = new Set();
  const questions = [];
  for (const finding of findings) {
    if (finding.status === "observed" || !finding.ask || seen.has(finding.ask)) continue;
    seen.add(finding.ask);
    questions.push(finding);
  }
  return { query, focused: true, trips, counts, questions };
}

export function requestStep(profileIds, text) {
  const query = interpretNearby(text);
  if (!query.text || profileIds.length === 0) return null;
  if (!query.recognized) {
    return {
      source: "Your request",
      text: `You wrote “${query.text}”. These sample notes can follow a grocery, a pharmacy, a clinic, or transit. They do not cover this request, so no route is filled in.`,
    };
  }
  const names = query.intents.map((id) => (id === "clinic" ? "healthcare" : id));
  const who = ACCESS_NEEDS.filter((item) => profileIds.includes(item.id)).map((item) => item.label.toLowerCase());
  const asked = spokenList(names);
  const needText = spokenList(who);
  return {
    source: "Your request",
    text: `You asked about ${asked}. Vexcel aerial images can show a grocery store or a pharmacy, and steps along that route, for ${needText}. Bus stops are not identified from those images. Other blockages stay unknown.`,
  };
}

const ROUTE_STEPS = {
  linden: { grocery: "none", pharmacy: "unknown" },
  quarry: { grocery: "none", pharmacy: "seen" },
  witherspoon: { grocery: "seen", pharmacy: "unknown" },
  palmer: { grocery: "none", pharmacy: "unknown" },
};

const NOT_FROM_AERIAL =
  "Other blockages, such as curb ramps, sidewalk gaps, or slopes, are not identified from this image.";

function refineTrip(listingId, profileId, trip) {
  if (trip.id === "transit") {
    return {
      ...trip,
      status: "unknown",
      source: "Vexcel",
      scene: "street-level",
      title: "Bus stops are not identified in these aerial images",
      detail:
        "Vexcel imagery is a poor fit for finding a bus stop, so this sample does not mark one. The stop stays unknown.",
      ask: "Which stop would you use, and is the path to it free of steps?",
    };
  }
  if (trip.id === "clinic") {
    return {
      ...trip,
      status: "unknown",
      source: "Vexcel",
      scene: "street-level",
      title: "A clinic is not identified from these aerial images",
      detail: `The aerial check looks for grocery stores and pharmacies. It does not identify a clinic. ${NOT_FROM_AERIAL}`,
      ask: null,
    };
  }
  if (trip.id !== "grocery" && trip.id !== "pharmacy") return trip;

  const steps = ROUTE_STEPS[listingId]?.[trip.id] || "unknown";
  const place = trip.id === "grocery" ? "grocery store" : "pharmacy";
  const seen = `The Vexcel aerial image shows a ${place}.`;

  if (profileId === "low-vision" || profileId === "hard-of-hearing") {
    return {
      ...trip,
      status: "unknown",
      source: "Vexcel",
      scene: "street-level",
      title: `A ${place} is visible. The route around it is not read from the aerial image`,
      detail: `${seen} ${NOT_FROM_AERIAL}`,
      ask: null,
    };
  }

  if (steps === "seen") {
    return {
      ...trip,
      status: "barrier",
      source: "Vexcel",
      scene: "street-level",
      title: `Steps show up on the way to ${trip.name}`,
      detail: `${seen} Vexcel can pick out steps along a route, and steps are visible here. ${NOT_FROM_AERIAL}`,
      ask: `Is there a way to ${trip.name} that avoids those steps?`,
    };
  }
  if (steps === "none" && profileId === "hills") {
    return {
      ...trip,
      status: "observed",
      source: "Vexcel",
      scene: "street-level",
      title: `No steps showed up on the way to ${trip.name}`,
      detail: `${seen} Vexcel can pick out steps, and none were identified on this route. ${NOT_FROM_AERIAL}`,
      ask: null,
    };
  }
  if (steps === "none") {
    return {
      ...trip,
      status: "unknown",
      source: "Vexcel",
      scene: "street-level",
      title: `No steps showed up on the way to ${trip.name}`,
      detail: `${seen} No steps were identified. That does not confirm a curb ramp or a continuous sidewalk. ${NOT_FROM_AERIAL}`,
      ask: `Is the route to ${trip.name} step-free beyond the absence of steps?`,
    };
  }
  return {
    ...trip,
    status: "unknown",
    source: "Vexcel",
    scene: "street-level",
    title: `A ${place} is visible. Steps on that route were not reviewed`,
    detail: `${seen} ${NOT_FROM_AERIAL}`,
    ask: `Are there steps between here and ${trip.name}?`,
  };
}

function refineStreet(item) {
  if (item.status !== "barrier") return item;
  return {
    ...item,
    status: "unknown",
    source: "Vexcel",
    title: "This blockage is not identified from the aerial image",
    detail:
      "Vexcel is used here for grocery stores, pharmacies, and steps on a route. Curb ramps, slopes, sidewalk gaps, and signals stay unknown.",
  };
}

export function lifeReport(listingId, profileIds = []) {
  const place = LIFE[listingId];
  if (!place) return EMPTY;
  const sections = [];
  for (const id of profileIds) {
    const profile = ACCESS_NEEDS.find((item) => item.id === id);
    const block = place.profiles[id];
    if (!profile || !block) continue;
    sections.push({
      id,
      label: profile.label,
      story: block.story,
      street: block.street.map(refineStreet),
      trips: block.trips.map((trip) => refineTrip(listingId, id, trip)),
    });
  }
  const findings = sections.flatMap((section) => [...section.street, ...section.trips]);
  const counts = { observed: 0, barrier: 0, unknown: 0 };
  for (const finding of findings) counts[finding.status] += 1;
  return {
    look: place.look,
    sections,
    findings,
    counts,
    questions: findings.filter((item) => item.status !== "observed" && item.ask),
  };
}
