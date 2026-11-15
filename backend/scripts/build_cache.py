import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
import config
import kit
import picks
from builder import build_listing, scan_model_id


def main():
    feats = {r["id"]: r for r in kit.read_jsonl(config.FEATURES_JSONL) if r["id"] in picks.PICKS}
    models = kit.model_ids()

    built = {}
    for l in kit.read_jsonl(config.LISTINGS_JSONL):
        if l["id"] not in picks.PICKS:
            continue
        why = kit.reject_reason(l, feats, models)
        if why:
            print(f"SKIP {l['id']}: {why}")
            continue
        built[l["id"]] = build_listing(l, feats[l["id"]], models[l["id"]][0])

    listings = [built[i] for i in picks.PICKS if i in built]
    for i in picks.PICKS:
        if i not in built:
            print(f"MISSING {i}")

    config.CACHE_DIR.mkdir(parents=True, exist_ok=True)
    out = config.CACHE_DIR / "listings.json"
    out.write_text(json.dumps(listings, indent=2), encoding="utf-8")

    print(f"\nwrote {len(listings)} listings -> {out}\n")
    for x in listings:
        counts = {}
        for f in x["findings"].values():
            counts[f["status"]] = counts.get(f["status"], 0) + 1
        img = x["images"]
        print(f"{x['id']:>10}  {x['place']:<16} ${x['price']:>11,.0f}  {x['floor']:<12} "
            f"{x['beds']}bd {x['baths']}ba  {counts}  still={'Y' if img['matterport'] else 'NONE'} "
            f"photos={len(img['photos'])}")


if __name__ == "__main__":
    main()