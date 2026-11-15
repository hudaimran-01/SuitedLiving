const RANK = { barrier: 3, verify: 2, supported: 1 };

export const ROOM_STATUS = {
  supported: "Supported by evidence",
  verify: "Needs verification",
  barrier: "Potential barrier",
  unset: "Not assessed",
};

function note(status, summary, evidence, source, questions = []) {
  return { status, summary, evidence, source, questions, measures: [] };
}

function unseenInterior(roomName) {
  return {
    wheelchair: note(
      "verify",
      `${roomName} is on the floor plan outline. Door width and turning space were not measured.`,
      "No Matterport scan is on file for this room.",
      "CoStar",
      ["What is the clear doorway width, and is there room to turn a wheelchair?"],
    ),
    hills: note(
      "verify",
      `No interior steps were identified in ${roomName.toLowerCase()}, and none were ruled out.`,
      "The floor plan outline does not show a level change, and there is no scan to check.",
      "CoStar",
      ["Is there a step or a level change to enter this room?"],
    ),
    "low-vision": note(
      "verify",
      `Lighting and contrast in ${roomName.toLowerCase()} are not in the sample notes.`,
      "No interior scan is on file.",
      "CoStar",
      ["Is this room lit, and do the edges contrast with the floor?"],
    ),
    "hard-of-hearing": note(
      "verify",
      `A visual alarm in ${roomName.toLowerCase()} is not in the sample notes.`,
      "No interior scan is on file.",
      "CoStar",
      ["Is there a visual smoke alarm in this room?"],
    ),
  };
}

const LINDEN = {
  hasPlan: true,
  hasScan: true,
  caption:
    "Sample outline for the CoStar floor plan. Room colors use the notes on file, including the Matterport scan where it exists. This is not a certification.",
  rooms: [
    {
      id: "entry",
      name: "Entry",
      points: "48,292 214,292 214,404 48,404",
      label: [78, 340],
      byNeed: {
        wheelchair: note(
          "verify",
          "The front door sits level with the walk. The clear width of that door was not measured.",
          "Vexcel imagery shows the threshold level with the concrete walk. No step is visible. Door width is outside what that frame can measure.",
          "Vexcel",
          ["What is the clear width of the front door, in inches?"],
        ),
        hills: note(
          "supported",
          "No step is visible at this door.",
          "Vexcel imagery shows the threshold level with the walk.",
          "Vexcel",
        ),
        "low-vision": note(
          "barrier",
          "No light is visible over the walk to this door.",
          "The daytime frame shows the door and the path, and no exterior fixture that would light that walk after dark.",
          "Vexcel",
          ["Is the entry and the walk lit after dark?"],
        ),
        "hard-of-hearing": note(
          "verify",
          "No doorbell or signal light is visible at this door.",
          "The entrance frame does not show a doorbell, a light, or a video doorbell.",
          "Vexcel",
          ["Is there a flashing doorbell or a video doorbell?"],
        ),
      },
    },
    {
      id: "living",
      name: "Living",
      points: "48,36 360,36 360,292 48,292",
      label: [150, 150],
      byNeed: {
        wheelchair: note(
          "verify",
          "The living area reads as one open room on the plan. Turning space was not measured.",
          "The Matterport scan shows an open living area. A turning circle is not in the measured notes.",
          "Matterport",
          ["Is there a 60-inch turning space in the living room?"],
        ),
        hills: note(
          "supported",
          "No interior step is identified between the entry and the living room.",
          "The scan and the plan show this room on the same story as the front door. No step is called out.",
          "Matterport",
        ),
        "low-vision": note(
          "verify",
          "Contrast between the floor and the walls is not described.",
          "The scan was not reviewed for edge contrast in this room.",
          "Matterport",
          ["Do the floor and the walls contrast, including at any rug edge?"],
        ),
        "hard-of-hearing": note(
          "verify",
          "A visual alarm in the living room is not in the scan notes.",
          "The scan does not show a strobe smoke or carbon monoxide alarm.",
          "Matterport",
          ["Is there a visual smoke alarm in the living room?"],
        ),
      },
    },
    {
      id: "kitchen",
      name: "Kitchen",
      points: "360,36 592,36 592,188 360,188",
      label: [410, 100],
      byNeed: {
        wheelchair: note(
          "verify",
          "The kitchen is on the same story. Clearance in front of the counters was not measured.",
          "The floor plan places the kitchen beside the living room. The scan does not include a measured clear floor space.",
          "Matterport",
          ["What is the clear floor space in front of the sink and the range?"],
        ),
        hills: note(
          "supported",
          "No step is identified at the kitchen.",
          "The plan shows the kitchen on the same story as the front door.",
          "CoStar",
        ),
        "low-vision": note(
          "verify",
          "Task lighting and contrast at the counters are not in the notes.",
          "The scan was not reviewed for contrast in the kitchen.",
          "Matterport",
        ),
        "hard-of-hearing": note(
          "verify",
          "A visual alarm in the kitchen is not in the scan notes.",
          "No strobe is called out in this room.",
          "Matterport",
        ),
      },
    },
    {
      id: "bath",
      name: "Bathroom",
      points: "360,188 470,188 470,292 360,292",
      label: [372, 230],
      byNeed: {
        wheelchair: note(
          "verify",
          "The available imagery shows a walk-in shower, but the doorway width and wheelchair turning clearance could not be verified.",
          "The Matterport scan shows a walk-in shower with no curb. The bathroom door is cut out of the frame, and a turning circle is not measurable.",
          "Matterport",
          [
            "What is the clear doorway width?",
            "Is there at least 60 inches of unobstructed turning space?",
          ],
        ),
        hills: note(
          "supported",
          "No step is identified at the bathroom door.",
          "The scan shows a walk-in shower without a high curb. No stair is called out.",
          "Matterport",
        ),
        "low-vision": note(
          "verify",
          "Contrast at the shower threshold is not described.",
          "The scan confirms the shower has no high curb. Edge contrast was not reviewed.",
          "Matterport",
        ),
        "hard-of-hearing": note(
          "verify",
          "A visual alarm in the bathroom is not in the scan notes.",
          "No strobe is called out in this room.",
          "Matterport",
        ),
      },
    },
    {
      id: "bedroom",
      name: "Bedroom",
      points: "360,292 592,292 592,404 360,404",
      label: [420, 340],
      byNeed: {
        wheelchair: note(
          "verify",
          "The bedroom is on the same story. The doorway looks passable in the scan, and it was not measured.",
          "Matterport shows the bedroom door. Clear width is not in the notes, so it is not treated as verified.",
          "Matterport",
          ["What is the clear width of the bedroom door?"],
        ),
        hills: note(
          "supported",
          "No step is identified at the bedroom.",
          "The plan and the scan place the bedroom on the same story as the front door.",
          "Matterport",
        ),
        "low-vision": note(
          "verify",
          "Contrast at the bedroom door is not described.",
          "The scan was not reviewed for edge contrast in this room.",
          "Matterport",
        ),
        "hard-of-hearing": note(
          "verify",
          "A visual alarm in the bedroom is not in the scan notes.",
          "The scan does not show a strobe alarm.",
          "Matterport",
          ["Is there a visual smoke alarm in the bedroom?"],
        ),
      },
    },
  ],
};

const WITHERSPOON = {
  hasPlan: true,
  hasScan: false,
  caption:
    "Sample outline for the CoStar floor plan. There is no Matterport scan, so interior rooms stay unverified. This is not a certification.",
  rooms: [
    {
      id: "entry",
      name: "Entry",
      points: "48,292 214,292 214,404 48,404",
      label: [78, 340],
      byNeed: {
        wheelchair: note(
          "barrier",
          "The entrance in the aerial frame is four steps up from the sidewalk, and no ramp is visible.",
          "Vexcel imagery shows four steps at the front door. No ramp is in the frame.",
          "Vexcel",
          ["Is there another entrance without those steps?"],
        ),
        hills: note(
          "barrier",
          "Four steps lead to this door.",
          "Vexcel imagery shows the steps. No ramp is visible.",
          "Vexcel",
          ["Is there a way in that avoids those steps?"],
        ),
        "low-vision": note(
          "verify",
          "The steps are visible. Contrast on the step edges is not described.",
          "Vexcel shows the steps. Edge contrast was not read from the image.",
          "Vexcel",
          ["Are the step edges marked with a contrasting strip?"],
        ),
        "hard-of-hearing": note(
          "verify",
          "A doorbell you can see is not in the entrance frame.",
          "The aerial image does not show a doorbell or a signal light.",
          "Vexcel",
        ),
      },
    },
    {
      id: "living",
      name: "Living",
      points: "48,36 360,36 360,292 48,292",
      label: [150, 150],
      byNeed: unseenInterior("Living"),
    },
    {
      id: "kitchen",
      name: "Kitchen",
      points: "360,36 592,36 592,188 360,188",
      label: [410, 100],
      byNeed: unseenInterior("Kitchen"),
    },
    {
      id: "bath",
      name: "Bathroom",
      points: "360,188 470,188 470,292 360,292",
      label: [372, 230],
      byNeed: unseenInterior("Bathroom"),
    },
    {
      id: "bedroom",
      name: "Bedroom",
      points: "360,292 592,292 592,404 360,404",
      label: [420, 340],
      byNeed: unseenInterior("Bedroom"),
    },
  ],
};

const PLANS = {
  linden: LINDEN,
  witherspoon: WITHERSPOON,
};

export function floorPlanFor(listingId) {
  return PLANS[listingId] || null;
}

export function assessRoom(room, needIds = []) {
  const details = needIds
    .map((id) => {
      const finding = room.byNeed?.[id];
      return finding ? { needId: id, ...finding } : null;
    })
    .filter(Boolean);
  if (details.length === 0) {
    return { status: "unset", summary: "", details, questions: [] };
  }
  const status = details.reduce(
    (worst, item) => (RANK[item.status] > RANK[worst] ? item.status : worst),
    "supported",
  );
  const lead = details.find((item) => item.status === status) || details[0];
  const questions = [];
  for (const item of details) {
    for (const question of item.questions || []) {
      if (!questions.includes(question)) questions.push(question);
    }
  }
  return { status, summary: lead.summary, details, questions };
}
