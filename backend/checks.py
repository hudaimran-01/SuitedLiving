import re

HINT = re.compile(
    r"elevator|\blift\b|wheelchair|\bramp|"
    r"(?:bed|master|primary|suite)\w*.{0,40}(?:downstairs|first floor|main level)|"
    r"(?:first floor|main level|downstairs).{0,30}(?:bed|master|primary|suite)",
    re.I,
)


ACCESS_IDS = {1412, 1417, 1419, 1420, 1422, 1430, 1432, 1433, 1434,
              1452, 1455, 1460, 1464, 1469, 1473, 1479, 1484}
NOTE = "This is the seller's statement in the MLS data, not an inspection."
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
        out["step-free"] = F("unknown", "CoStar", "The listing does not describe the entrance",
                             "Nothing in the MLS data says whether the front door is reached by steps.",
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
            why = "The listing states accessibility features but does not say which floor they are on."
        elif text_hint:
            why = ("The description mentions an elevator, lift, ramp or ground-floor bedroom, "
                   "but the structured data does not confirm one.")
        else:
            why = None
        if why:
            out["elevator"] = F("unknown", "CoStar",
                                f"{stories:g} stories; whether one level is enough is not stated", why,
                                "Which floor are the accessible bedroom and bathroom on, and is there a lift or elevator?")
        else:
            out["elevator"] = F("barrier", "CoStar",
                                f"{stories:g} stories, and no elevator or main-level bed and bath is listed",
                                "Living on one level would need a main-level bedroom and bathroom, and the listing mentions neither.",
                                "Is there a bedroom and bathroom on the main level, or an elevator?")
    else:
        out["elevator"] = F("unknown", "CoStar", "An elevator is not listed",
                            "The listing does not say which floor the home is on or whether the building has an elevator.",
                            "Is there an elevator, and which floor is the home on?")

    if 1460 in by_id:
        out["parking"] = F("observed", "CoStar", "The listing states accessible parking",
                           f"The MLS data lists {q([by_id[1460]])}. {NOTE}")
    else:
        g = d.get("totalGarageSpaces")
        extra = f" It has {g:g} garage space(s), which is not the same as an accessible space." if g else ""
        out["parking"] = F("unknown", "CoStar", "Accessible parking is not listed",
                           "The MLS data does not mark an accessible space." + extra,
                           "Is there accessible parking, and how far is it from the entrance?")

    out["short-walk"] = F("unknown", "Vexcel", "The route from parking to the door was not reviewed",
                          "Aerial imagery has not been checked for this home.",
                          "How far is accessible parking from a step-free entrance?")

    dr = [by_id[i] for i in (1434, 1473) if i in by_id]
    if dr:
        out["doorways"] = F("observed", "CoStar", "The listing states accessible doors or halls",
                            f"The MLS data lists {q(dr)}. It gives no clear width in inches. {NOTE}")
    else:
        out["doorways"] = F("unknown", "CoStar", "Door widths are not listed",
                            "The listing gives no widths. A Matterport scan exists but has not been measured here.",
                            "What are the clear widths of the entry door and the bathroom door?")

    walk_in = has("walk-in shower", "roll-in")
    plain = any(n.lower() in ("shower", "separate shower") for n in names)
    tub_only = bool(has("bathtub with shower")) and not walk_in and not plain
    if 1469 in by_id:
        out["bathroom"] = F("observed", "CoStar", "The listing states an accessible full bathroom",
                            f"The MLS data lists {q([by_id[1469]])}. {NOTE}")
    elif walk_in:
        out["bathroom"] = F("unknown", "CoStar", "A walk-in shower is listed; turning space is not",
                            "A walk-in shower is not the same as a roll-in shower, and the room size is not given.",
                            "Can someone turn a wheelchair in the bathroom, and is the shower curb-free?")
    elif tub_only:
        out["bathroom"] = F("barrier", "CoStar", "Only a bathtub with shower is listed",
                            "Getting in may need a transfer, and the listing shows no roll-in option.",
                            "Is there a step-free or roll-in shower?")
    else:
        out["bathroom"] = F("unknown", "CoStar", "The bathroom is not described for access",
                            "The listing counts bathrooms but does not describe the entry or turning space.",
                            "What is the bathroom layout, including the shower or tub entry?")

    out["lighting"] = F("unknown", "Vexcel", "Entrance lighting is not on file",
                        "Lighting is not part of the listing data.",
                        "Is the entrance and the walk lit after dark?")
    out["contrast"] = F("unknown", "Vexcel", "Contrast at edges and doors is not on file",
                        "Edge marking is not part of the listing data.",
                        "Are step and door edges marked with a high-contrast strip?")
    out["signage"] = F("unknown", "Vexcel", "Signs are not on file",
                       "Unit numbers and signs are not part of the listing data.",
                       "Is the unit number large, high-contrast, and beside the door?")

    strobe = has("strobe", "visual alarm", "visual smoke")
    if strobe:
        out["alarms"] = F("observed", "CoStar", "Visual alarms are listed",
                          f"The MLS data lists {q(strobe)}. {NOTE}")
    else:
        smoke = " The listing mentions smoke detectors, not strobe alarms." if has("smoke") else ""
        out["alarms"] = F("unknown", "CoStar", "Visual alarms are not listed",
                          "Nothing in the MLS data describes strobe alarms." + smoke,
                          "Are there strobe smoke and carbon monoxide alarms in the unit?")

    vd = has("video doorbell", "doorbell camera")
    if vd:
        out["doorbell"] = F("observed", "CoStar", "A video doorbell is listed",
                            f"The MLS data lists {q(vd)}. {NOTE}")
    else:
        out["doorbell"] = F("unknown", "CoStar", "A doorbell you can see is not listed",
                            "A doorbell may exist, but the listing does not say it flashes or has video.",
                            "Is there a flashing doorbell or a video doorbell?")

    vi = has("video intercom")
    if vi:
        out["intercom"] = F("observed", "CoStar", "A video intercom is listed",
                            f"The MLS data lists {q(vi)}. {NOTE}")
    else:
        out["intercom"] = F("unknown", "CoStar", "The listing does not describe an intercom",
                            "Nothing says how a visitor is announced.",
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
    scan = ("A Matterport scan is on file. Door widths and turning space have not been measured in this prototype."
            if model_id else "No Matterport scan is on file.")
    return [
        {"source": "CoStar", "text": f"Listed as {', '.join(str(b) for b in bits if b)}. {named}"},
        {"source": "Vexcel", "text": "Aerial imagery has not been reviewed for this home, so the entrance, parking and walk are not assessed."},
        {"source": "Matterport", "text": scan},
    ]