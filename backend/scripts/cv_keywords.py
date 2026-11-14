# backend/scripts/cv_keywords.py
import pathlib
import sys
from collections import Counter

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
import config
import kit
import picks

ids = {int(x) for x in sys.argv[1:]} or set(picks.PICKS)
WORDS = ("stair", "step", "ramp", "rail", "elevator", "lift", "shower", "tub", "grab", "threshold", "porch")

for l in kit.read_jsonl(config.LISTINGS_JSONL):
    if l["id"] not in ids:
        continue
    c = Counter(k for m in l.get("media") or [] for k in (m.get("computerVisionKeywords") or []))
    print(f"\n=== {l['id']} ===  {len(c)} distinct keywords")
    print("  access-related:", {k: n for k, n in c.items() if any(w in k.lower() for w in WORDS)})
    print("  top 15:", c.most_common(15))