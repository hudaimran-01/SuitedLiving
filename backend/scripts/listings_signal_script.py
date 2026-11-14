import json
import os, sys, re, csv, collections, pathlib
from dotenv import load_dotenv


"""
Script counts exact signals per feature id found 
"""

load_dotenv()
KIT_DIR = pathlib.Path(os.getenv("KIT_DIR"))
EXPLICIT = re.compile(r"accessib|handicap|wheelchair|ramp on the main", re.I)

csv_ok = {}
for row in csv.DictReader(open(KIT_DIR / "residential-listings.csv", encoding="utf-8")):
    if row["MatterportModelId"] and row["Address"].strip():
        csv_ok[int(row["ListingId"])] = row["Address"].strip()

fstats = collections.defaultdict(collections.Counter)
groups, explicit_ids, n = collections.Counter(), [], 0
for line in (KIT_DIR / "data" / "residential-listing-features.jsonl").open(encoding="utf-8"):
    r = json.loads(line); n += 1
    d = r.get("derivedValues") or {}
    flags = set()
    for f in r.get("features") or []:
        nm = f["name"]
        if EXPLICIT.search(nm):
            flags.add("explicit")
            s = fstats[(f["id"], nm)]
            s["listings"] += 1
            s["src:" + str(f.get("source"))] += 1
            if f.get("boolValue") is False: s["boolFalse"] += 1
        if nm.lower() == "elevator": flags.add("elevator")
        if "main level" in nm.lower(): flags.add("main_level")
        if nm.lower() == "walk-in shower": flags.add("walkin_shower")
    if d.get("numberOfStories") == 1: flags.add("one_story")
    for fl in flags: groups[fl] += 1
    if "explicit" in flags:
        explicit_ids.append(r["id"])
        if r["id"] in csv_ok: groups["explicit + model + address"] += 1

print(f"{n} records\n\nListings per signal:")
for k, c in groups.most_common(): print(f"{c:5d}  {k}")
print("\nExplicit accessibility features (listings, id, name, breakdown):")
for (fid, nm), s in sorted(fstats.items(), key=lambda kv: -kv[1]["listings"]):
    extra = {k: v for k, v in s.items() if k != "listings"}
    print(f"{s['listings']:4d}  {fid:6d}  {nm}  {extra}")
print("\nSample explicit listings that have a model + address:")
for i in [x for x in explicit_ids if x in csv_ok][:25]: print(i, csv_ok[i])