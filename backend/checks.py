import re

HINT = re.compile(
    r"elevator|\blift\b|wheelchair|\bramp|"
    r"(?:bed|master|primary|suite)\w*.{0,40}(?:downstairs|first floor|main level)|"
    r"(?:first floor|main level|downstairs).{0,30}(?:bed|master|primary|suite)",
    re.I,
)


ACCESS_IDS = {1412, 1417, 1419, 1420, 1422, 1430, 1432, 1433, 1434,
              1452, 1455, 1460, 1464, 1469, 1473, 1479, 1484}
NOTE = "That comes from the listing, not a measurement."
LISTED, NONE = "listing-note", "no-scan"


def F(status, source, title, detail, ask=None):
    scene = NONE if status == "unknown" else LISTED
    return {"status": status, "source": source, "scene": scene,
            "title": title, "detail": detail, "ask": ask}


def q(items):
    return ", ".join(f"\u201c{i}\u201d" for i in items)


def derive_findings(rec, listing=None):
    d = rec.get("derivedValues") or {}
    feats = [f for f in rec.get("features") or [] if f.get("boolValue") is not False]
    names = [f["name"] for f in feats]
    by_id = {f["id"]: f["name"] for f in feats}
    stories, ptype = d.get("numberOfStories"), d.get("propertyType")

    rv = (listing or {}).get("resoValues") or {}
    addr = ((listing or {}).get("property") or {}).get("address") or {}
    reso_elevator = rv.get("hasElevator") is True
    floor = addr.get("floorNumber")

    def has(*words):
        return [n for n in names if any(w in n.lower() for w in words)]

    def main_level(word):
        for f in feats:
            n = f["name"].lower()
            if "main level" in n and word in n:
                v = f.get("doubleValue")
                if v is None or v > 0:
                    return True
        return False

    out = {}

    hit = [by_id[i] for i in (1464, 1420, 1422) if i in by_id]
    if hit:
        out["step-free"] = F("observed", "CoStar", "The listing states a step-free way in",
                             f"The MLS data lists {q(hit)}. {NOTE}")
    else:
        out["step-free"] = F("unknown", "CoStar", "Confirm the way in",
                             "Ask if the front door has steps, and whether there is a ramp.",
                             "Is the entrance step-free, and is there a ramp if it is not?")

    elev = [n for n in has("elevator") if "adaptable" not in n.lower()]
    if elev or reso_elevator:
        said = f"lists {q(elev)}" if elev else "flags an elevator"
        where = f" The unit is on floor {floor}." if floor else ""
        out["elevator"] = F("observed", "CoStar", "The listing includes an elevator",
                            f"The MLS data {said}.{where} {NOTE}")
        
    elif stories == 1 and ptype in ("House", "Townhome"):
        out["elevator"] = F("observed", "CoStar", "The home is a single story",
                            "CoStar lists one story, so no elevator is needed inside. The entrance is a separate check.")
    elif main_level("bedroom") and main_level("bathroom"):
        out["elevator"] = F("observed", "CoStar", "A bedroom and a bathroom are on the main level",
                            "The listing shows both on the main level. Other floors may still need stairs.")
    elif ptype in ("House", "Townhome") and stories and stories > 1:
        stated_access = any(f["id"] in ACCESS_IDS for f in feats)
        text_hint = bool(HINT.search((listing or {}).get("remarks") or ""))
        if stated_access:
            why = "The listing names access features. Ask which floor they are on."
        elif text_hint:
            why = "The description mentions a lift, a ramp, or a ground-floor bedroom. Ask which one is actually there."
        else:
            why = None
        if why:
            out["elevator"] = F("unknown", "CoStar",
                                f"Confirm one livable level in this {stories:g}-story home", why,
                                "Which floor are the accessible bedroom and bathroom on, and is there a lift or elevator?")
        else:
            out["elevator"] = F("barrier", "CoStar",
                                f"{stories:g} stories, with no elevator or main-level bed and bath",
                                "A one-level stay needs a bedroom and bathroom on the main floor, or a lift. The listing names neither.",
                                "Is there a bedroom and bathroom on the main level, or an elevator?")
    else:
        out["elevator"] = F("unknown", "CoStar", "Confirm the elevator",
                            "Ask which floor the home is on, and whether the building has an elevator.",
                            "Is there an elevator, and which floor is the home on?")

    if 1460 in by_id:
        out["parking"] = F("observed", "CoStar", "The listing states accessible parking",
                           f"The MLS data lists {q([by_id[1460]])}. {NOTE}")
    else:
        g = d.get("totalGarageSpaces")
        extra = f" The listing has {g:g} garage space{'s' if g != 1 else ''}. A garage is not an accessible space." if g else ""
        out["parking"] = F("unknown", "CoStar", "Confirm accessible parking",
                           "Ask whether there is an accessible space, and how far it is from the door." + extra,
                           "Is there accessible parking, and how far is it from the entrance?")

    out["short-walk"] = F("unknown", "Vexcel", "Confirm the walk from the car",
                          "Ask how far accessible parking is from a step-free door.",
                          "How far is accessible parking from a step-free entrance?")

    dr = [by_id[i] for i in (1434, 1473) if i in by_id]
    if dr:
        out["doorways"] = F("observed", "CoStar", "The listing states accessible doors or halls",
                            f"The MLS data lists {q(dr)}. It gives no clear width in inches. {NOTE}")
    else:
        out["doorways"] = F("unknown", "CoStar", "Confirm the door widths",
                            "Look at the entry and bathroom doors in the photos. Ask for the clear width of each.",
                            "What are the clear widths of the entry door and the bathroom door?")

    walk_in = has("walk-in shower", "roll-in")
    plain = any(n.lower() in ("shower", "separate shower") for n in names)
    tub_only = bool(has("bathtub with shower")) and not walk_in and not plain
    if 1469 in by_id:
        out["bathroom"] = F("observed", "CoStar", "The listing states an accessible full bathroom",
                            f"The MLS data lists {q([by_id[1469]])}. {NOTE}")
    elif walk_in:
        out["bathroom"] = F("unknown", "CoStar", "Confirm the shower and turning room",
                            "A walk-in shower is listed. Ask if it is curb-free and if a wheelchair can turn.",
                            "Can someone turn a wheelchair in the bathroom, and is the shower curb-free?")
    elif tub_only:
        out["bathroom"] = F("barrier", "CoStar", "Only a bathtub with shower is listed",
                            "Getting in may need a transfer, and the listing shows no roll-in option.",
                            "Is there a step-free or roll-in shower?")
    else:
        out["bathroom"] = F("unknown", "CoStar", "Confirm the bathroom layout",
                            "Ask how you get into the shower or tub, and whether there is room to turn.",
                            "What is the bathroom layout, including the shower or tub entry?")

    out["lighting"] = F("unknown", "Vexcel", "Confirm the lights at the door",
                        "Ask if the walk and the entrance stay lit after dark.",
                        "Is the entrance and the walk lit after dark?")
    out["contrast"] = F("unknown", "Vexcel", "Confirm contrast on edges",
                        "Ask if steps and door edges have a high-contrast strip.",
                        "Are step and door edges marked with a high-contrast strip?")
    out["signage"] = F("unknown", "Vexcel", "Confirm the unit number is easy to see",
                       "Ask if the number is large, high-contrast, and beside the door.",
                       "Is the unit number large, high-contrast, and beside the door?")

    strobe = has("strobe", "visual alarm", "visual smoke")
    if strobe:
        out["alarms"] = F("observed", "CoStar", "Visual alarms are listed",
                          f"The MLS data lists {q(strobe)}. {NOTE}")
    else:
        smoke = " The listing mentions smoke detectors, not strobe alarms." if has("smoke") else ""
        out["alarms"] = F("unknown", "CoStar", "Confirm flashing smoke alarms",
                          "Ask if the smoke and carbon monoxide alarms flash." + smoke,
                          "Are there strobe smoke and carbon monoxide alarms in the unit?")

    vd = has("video doorbell", "doorbell camera")
    if vd:
        out["doorbell"] = F("observed", "CoStar", "A video doorbell is listed",
                            f"The MLS data lists {q(vd)}. {NOTE}")
    else:
        out["doorbell"] = F("unknown", "CoStar", "Confirm a doorbell you can see",
                            "Ask if the doorbell flashes or shows video.",
                            "Is there a flashing doorbell or a video doorbell?")

    vi = has("video intercom")
    if vi:
        out["intercom"] = F("observed", "CoStar", "A video intercom is listed",
                            f"The MLS data lists {q(vi)}. {NOTE}")
    else:
        out["intercom"] = F("unknown", "CoStar", "Confirm how a visitor reaches you",
                            "Ask if the intercom is video or text, not sound only.",
                            "Is the intercom video or text, or sound only?")
    return out


def investigations(rec, model_id=None, listing=None):
    d = rec.get("derivedValues") or {}
    bits = [d.get("propertyType")]
    total = (((listing or {}).get("resoValues") or {}).get("structure") or {}).get("storiesTotal")
    
    if d.get("propertyType") == "Condominium":
        if total:
            bits.append(f"in a {total:g}-story building")
    elif d.get("numberOfStories"):
        bits.append(f"{d['numberOfStories']:g}-story")
    
    if d.get("yearBuilt"):
        bits.append(f"built {int(d['yearBuilt'])}")
    listed = [f["name"] for f in rec.get("features") or [] if f["id"] in ACCESS_IDS]
    named = (f"The MLS data names these accessibility features: {q(listed)}."
             if listed else "The MLS data names no accessibility features.")
    scan = ("A Matterport scan is linked. Use the photos to look at the entrance, doors, and bathroom. Widths still need a tape measure."
            if model_id else "No Matterport scan is linked. Use the listing photos, then ask for widths.")
    return [
        {"source": "CoStar", "text": f"Listed as {', '.join(str(b) for b in bits if b)}. {named}"},
        {"source": "Vexcel", "text": "Confirm the entrance, the parking, and the walk on a visit. This report does not include an aerial photo."},
        {"source": "Matterport", "text": scan},
    ]