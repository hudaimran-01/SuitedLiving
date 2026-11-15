import json
import os
from dotenv import load_dotenv
import re, collections, pathlib

"""
Find accesibility secific features and their IDs --
Also get specific count and the information of features.. 
"""

load_dotenv()

# specific home path where data kit lives
KIT_DIR = pathlib.Path(os.getenv("KIT_DIR"))
path = KIT_DIR / "data" / "residential-listing-features.jsonl"
KW = re.compile(
    r"accessib|wheelchair|handicap|disab|\bADA\b|grab bar|elevator|\bramp\b|"
    r"no[- ]step|step[- ]free|walk-in|roll-in|wide door|wide hall|"
    r"1-story|single[- ]story|one[- ]story|ground floor|first floor|main level|"
    r"\blift\b|senior|age[- ]restrict", re.I)

# 
names, sources, hits = collections.Counter(), collections.Counter(), collections.Counter()
n = with_hit = 0
for line in path.open(encoding="utf-8"):
    r = json.loads(line); n += 1
    found = set()
    for f in r.get("features") or []:
        names[f["name"]] += 1
        sources[f.get("source")] += 1
        if KW.search(f["name"]): found.add(f["name"])
    for s in r.get("sections") or []:
        for l in s.get("lines") or []:
            if KW.search(l): found.add(l)
    for x in found: hits[x] += 1
    with_hit += bool(found)

print(f"{n} records, {with_hit} with any accessibility-ish hit")

# mls = actual listing, MachineLearning = inferred from cv model 
print("sources:", sources.most_common())

# top count for accessibility features
print("\nTop keyword lines:")
for t, c in hits.most_common(40): 
    print(f"{c:5d}  {t}")

# 
print("\nTop 60 feature names:")
for t, c in names.most_common(60): 
    print(f"{c:5d}  {t}")

# most valuable-features
# Listings	Feature
# 37	Handicap Accessible
# 26	Accessible Full Bathroom, Accessible Bedroom
# 25	Accessible Common Area
# 23	Accessible Doors
# 22	Accessible Entrance
# 21	Accessible Approach with Ramp
# 18	Wheelchair Access
# 16 / 15	Accessible Kitchen / Closets
# 9	Accessible Parking
# 8	Accessible Hallway
# 5 / 4	Accessible Elevator Installed / Electric Controls
