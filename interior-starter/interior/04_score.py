"""STEP 4: Combine CoStar facts + photo analysis into one score per property, for the website.

Writes output/interior_scores.json  (this is the file your Flask teammate serves).
Works even if step 3 has not been run for a property (then only CoStar facts are used).
"""
import json, os

PERSONAS = {  # how much each feature matters to each kind of user (0-3)
    "wheelchair": {"step_free_entry": 3, "wide_doorways": 3, "roll_in_or_walk_in_shower": 3, "open_turning_space": 3,
                   "hard_flooring_throughout": 2, "kitchen_knee_clearance": 2, "grab_bars": 1, "bathtub_only": -2},
    "walker_or_cane": {"step_free_entry": 3, "hard_flooring_throughout": 2, "grab_bars": 3, "wide_doorways": 2,
                       "roll_in_or_walk_in_shower": 2, "bathtub_only": -2, "lever_door_handles": 1},
    "low_vision": {"good_lighting_and_contrast": 3, "hard_flooring_throughout": 1, "step_free_entry": 1,
                   "lever_door_handles": 1},
}


def costar_facts(p):
    """Rules from CoStar data. Each fact: value, confidence, source."""
    facts, notes = {}, []
    stories, walkup, elev = p.get("stories"), p.get("isWalkup"), p.get("passengerElevators")
    if stories == 1:
        facts["no_stairs_between_floors"] = (True, 0.8, "1-story building")
    elif elev and elev > 0:
        facts["no_stairs_between_floors"] = (True, 0.8, f"{elev} passenger elevator(s)")
    elif walkup is True and (stories or 2) >= 2:
        facts["no_stairs_between_floors"] = (False, 0.7, "walk-up building (no elevator); upper floors need stairs")
    elif walkup is False:
        facts["no_stairs_between_floors"] = (True, 0.6, "CoStar says the building has elevator access")
    else:
        notes.append("elevator access unknown")
    yb = p.get("yearBuilt")
    if yb and yb >= 1992:
        facts["built_under_fair_housing_rules"] = (True, 0.5,
            f"built {yb}; US Fair Housing Act accessibility rules apply to multifamily first occupied after 1991 (not proof of compliance)")
    elif yb:
        notes.append(f"built {yb}, before 1991 accessibility design rules")
    if p.get("lifestyle") == 2:
        facts["senior_community"] = (True, 0.9, "age-restricted senior housing")
    return facts, notes


def score(persona, vision_feats, costar):
    """Score 0-100. Unknown features count as neutral (half credit) and lower the confidence."""
    weights = dict(PERSONAS[persona])
    total = known = got = 0.0
    for name, w in weights.items():
        v = (vision_feats.get(name) or {}).get("value")
        total += abs(w)
        if v is None:
            got += abs(w) * 0.5
        else:
            known += abs(w)
            good = bool(v) if w > 0 else (not bool(v))
            got += abs(w) if good else 0
    if persona != "low_vision":          # stairs/elevator from CoStar matters a lot for mobility
        f = costar.get("no_stairs_between_floors")
        total += 3
        if f:
            known += 3
            got += 3 if f[0] else 0
        else:
            got += 1.5
    return round(100 * got / total), round(known / total, 2)


def main():
    index = json.load(open("output/interior_index.json", encoding="utf-8"))
    results = []
    for p in index:
        vpath = f"output/vision/{p['propertyId']}.json"
        vision = json.load(open(vpath, encoding="utf-8")) if os.path.exists(vpath) else {}
        vfeats = vision.get("features", {})
        facts, notes = costar_facts(p)
        scores = {}
        for persona in PERSONAS:
            s, c = score(persona, vfeats, facts)
            scores[persona] = {"score": s, "confidence": c}
        results.append({
            "propertyId": p["propertyId"], "name": p["name"], "address": p["address"], "city": p["city"],
            "lat": p["lat"], "lon": p["lon"], "minRent": p["minRent"], "maxRent": p["maxRent"],
            "scores": scores,
            "costarFacts": {k: {"value": v[0], "confidence": v[1], "source": v[2]} for k, v in facts.items()},
            "photoFindings": vfeats,
            "photos": vision.get("photos", []),
            "cantConfirm": vision.get("cant_confirm", []) + notes + (["no photo analysis yet"] if not vision else []),
            "matterportModels": p["matterport"],
            "disclaimer": "AI-estimated from photos and CoStar data. Not an ADA compliance assessment.",
        })
    json.dump(results, open("output/interior_scores.json", "w", encoding="utf-8"), indent=2)
    print(f"wrote {len(results)} properties to output/interior_scores.json")


if __name__ == "__main__":
    main()
