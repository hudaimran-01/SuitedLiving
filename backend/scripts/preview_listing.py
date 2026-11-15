import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
import config
import kit
from checks import derive_findings, investigations

KW = re.compile(
    r"wheelchair|handicap|accessib|step[- ]?free|no steps|roll-in|zero[- ]entry|\bramp\b|"
    r"grab bar|elevator|first floor|main level|downstairs",
    re.I,
)
"""
PURPOSE (NO LONGER USED):
    Tested rules and found bugs within flags for accesibility features
"""

def snippets(text, width=70, limit=4):
    out = []
    for m in KW.finditer(text or ""):
        a, b = max(0, m.start() - width), min(len(text), m.end() + width)
        out.append("..." + text[a:b].replace("\n", " ") + "...")
        if len(out) == limit:
            break
    return out


wanted = {int(x) for x in sys.argv[1:]}
feats = {r["id"]: r for r in kit.read_jsonl(config.FEATURES_JSONL) if r["id"] in wanted}
models = kit.model_ids()

for l in kit.read_jsonl(config.LISTINGS_JSONL):
    if l["id"] not in wanted:
        continue
    p = l.get("property") or {}
    a = p.get("address") or {}
    rv = l.get("resoValues") or {}
    st = rv.get("structure") or {}
    print(f"\n=== {l['id']}  {a.get('fullStreetAddress')}, {a.get('city')} ===")
    print(f"price={l.get('currentPrice')}  type={p.get('propertyType')}  beds={p.get('bedsMin')}  "
          f"baths={p.get('bathsMin')} (full={p.get('bathsFull')} half={p.get('bathsHalf')} max={p.get('bathsMax')})  sqft={p.get('sqftMin')}  stories={p.get('stories')}  "
          f"storiesTotal={st.get('storiesTotal')}  floor={a.get('floorNumber')}  unit={a.get('unitNumber')}")
    print(f"resoValues: hasElevator={rv.get('hasElevator')}  hasAccessibilityFeatures={rv.get('hasAccessibilityFeatures')}")
    for s in snippets(l.get("remarks")):
        print("  remarks:", s)
    rec = feats.get(l["id"])
    if not rec:
        print("  (no features record)")
        continue
    for key, f in derive_findings(rec, l).items():
        print(f"{f['status']:8s} {key:11s} {f['title']}")
    model = (models.get(l["id"]) or [None])[0]
    for i in investigations(rec, model_id=model, listing=l):
        print("  *", i["source"], "-", i["text"])