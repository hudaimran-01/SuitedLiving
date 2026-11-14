import json
import os, sys, collections, pathlib
from dotenv import load_dotenv

load_dotenv()
KIT_DIR = pathlib.Path(os.getenv("KIT_DIR"))


p = KIT_DIR / "data" / "residential-listing-features.jsonl"

cov, vals, n = collections.Counter(), collections.defaultdict(collections.Counter), 0

"""
Note: The data is mostly houses: 
1,454 House (77%), 
224 Condominium (12%), 
162 Townhome (9%), 
57 Multifamily (3%).
"""

# opening the JSON file
for line in p.open(encoding="utf-8"):

    # data and number of line 
    d = json.loads(line).get("derivedValues") or {}
    n += 1

    # for every k,v in the highlights list 
    for k, v in d.items():
        # 
        if v is not None: cov[k] += 1

    # find each count for the property type, building style, and # number of stories
    for k in ("propertyType", "buildingStyle", "numberOfStories"):
        vals[k][d.get(k)] += 1


# --- Print most filled in features to least filled-in features -----
print(f"{n} records")
for k, c in cov.most_common(): 
    print(f"{c/n:6.1%}  {k}")

# print then all 3 crucial features count.
for k, c in vals.items(): 
    print("\n", k, c.most_common(12))