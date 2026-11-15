import csv
import pathlib
import re
import sys
from collections import Counter

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
import config
import kit
from checks import ACCESS_IDS

PTYPE = {1: "Detached", 2: "Townhouse", 4: "Condo", 16: "MultiFam", 512: "Duplex"}
REMARK = re.compile(
    r"wheelchair|handicap|accessib|step[- ]?free|no steps|roll-in|zero[- ]entry|\bramp\b|grab bar|elevator",
    re.I,
)
"""
Finds all possible canidates for website's listings 
"""


def yn(v):
    return "-" if v is None else ("Y" if v else "n")


def summarize(l, f):
    p = l.get("property") or {}
    a = p.get("address") or {}
    rv = l.get("resoValues") or {}
    st = rv.get("structure") or {}
    explicit = [x["name"] for x in f.get("features") or []
                if x["id"] in ACCESS_IDS and x.get("boolValue") is not False]
    hits = sorted({m.lower() for m in REMARK.findall(l.get("remarks") or "")})
    return {
        "id": l["id"],
        "city": a.get("city") or "",
        "state": a.get("state") or "",
        "tx": "rent" if l.get("transactionType") == 2 else "sale",
        "price": l.get("currentPrice"),
        "type": PTYPE.get(p.get("propertyType"), p.get("propertyType")),
        "stories": p.get("stories") or st.get("stories"),
        "floor": a.get("floorNumber") or "",
        "elev": yn(rv.get("hasElevator")),
        "reso_a11y": yn(rv.get("hasAccessibilityFeatures")),
        "n_explicit": len(explicit),
        "remark_hits": " ".join(hits),
        "address": a.get("fullStreetAddress"),
    }


def main():
    top = int(sys.argv[1]) if len(sys.argv) > 1 else 40
    feats = {r["id"]: r for r in kit.read_jsonl(config.FEATURES_JSONL)}
    models = kit.model_ids()

    dropped, rows, total = Counter(), [], 0
    for l in kit.read_jsonl(config.LISTINGS_JSONL):
        total += 1
        why = kit.reject_reason(l, feats, models)
        if why:
            dropped[why] += 1
        else:
            rows.append(summarize(l, feats[l["id"]]))

    print(f"{total} listings -> {len(rows)} pass all hard filters")
    for why, n in dropped.most_common():
        print(f"  dropped: {why:<28} {n}")
    print("by place/kind:", dict(Counter((r["city"], r["tx"]) for r in rows).most_common(8)))

    both = sum(r["reso_a11y"] == "Y" and r["n_explicit"] > 0 for r in rows)
    only_reso = sum(r["reso_a11y"] == "Y" and r["n_explicit"] == 0 for r in rows)
    only_feat = sum(r["reso_a11y"] != "Y" and r["n_explicit"] > 0 for r in rows)
    remark_only = sum(bool(r["remark_hits"]) and r["n_explicit"] == 0 for r in rows)
    print(f"\naccessibility evidence among survivors: features+reso flag={both}, "
          f"reso flag only={only_reso}, features only={only_feat}, remarks only={remark_only}")

    rows.sort(key=lambda r: (-(r["n_explicit"] + bool(r["remark_hits"])), r["id"]))
    print(f"\n{'id':>10} {'city':<14} {'tx':<4} {'price':>10} {'type':<9} {'st':>2} {'flr':>4} "
          f"{'elev':<4} {'reso':<4} {'mls':>3}  remarks")
    for r in rows[:top]:
        price = f"{r['price']:,.0f}" if r["price"] else "-"
        print(f"{r['id']:>10} {r['city'][:14]:<14} {r['tx']:<4} {price:>10} {str(r['type']):<9} "
              f"{str(r['stories'] or '-'):>2} {r['floor']:>4} {r['elev']:<4} {r['reso_a11y']:<4} "
              f"{r['n_explicit']:>3}  {r['remark_hits']}")

    config.CACHE_DIR.mkdir(parents=True, exist_ok=True)
    out = config.CACHE_DIR / "candidates.csv"
    with open(out, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    print(f"\nfull table: {out}")


if __name__ == "__main__":
    main()