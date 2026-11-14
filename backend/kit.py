import csv
import json

import config


def read_jsonl(path):
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            if line.strip():
                yield json.loads(line)


def model_ids():
    """ListingId -> list of unique Matterport model ids (blank ones skipped)."""
    out = {}
    with open(config.LISTINGS_CSV, newline="", encoding="utf-8-sig") as fh:
        for row in csv.DictReader(fh):
            m = (row.get("MatterportModelId") or "").strip()
            if not m:
                continue
            ids = out.setdefault(int(row["ListingId"]), [])
            if m not in ids:
                ids.append(m)
    return out


def reject_reason(listing, feats, models):
    """First hard filter a listing fails, or None if it passes. Order = funnel order."""
    a = (listing.get("property") or {}).get("address") or {}
    if (listing.get("permissionLevels") or {}).get("homes") != 10:
        return "not public"
    if not listing.get("isPrimaryForThisListingInstance"):
        return "not primary for its attempt"
    if listing.get("listingStatus") != 1:
        return "not Active"
    if not (a.get("fullStreetAddress") or "").strip():
        return "no address"
    if listing["id"] not in models:
        return "no Matterport model"
    if listing["id"] not in feats:
        return "no features record"
    return None