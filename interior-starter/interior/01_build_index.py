"""STEP 1: Build a small index of apartment communities that have Matterport scans.

Reads (from the CoStar kit's data/ folder):
  - apartment-listing.jsonl     (which apartments are listed on Apartments.com)
  - commercial-property.jsonl   (building details, photos, Matterport scan ids)
Writes:
  - output/interior_index.json

Run:  python 01_build_index.py --data "C:\\Users\\YOU\\Downloads\\costar-hackathon-kit\\data"
"""
import argparse, json, os

MATTERPORT_TYPES = {36, 234}            # videoExternalReferenceType values that mean "Matterport"
INTERIOR_PHOTO_TYPES = {33, 6, 10, 134, 66, 12}  # interior, lobby, floor plan, common area, amenity, typical floor plan


def bigger(uri):
    """CoStar photo links end up at size 112; 113 is a bigger version (1400x720)."""
    return uri.replace("/112/", "/113/") if uri else uri


def read_jsonl(path):
    with open(path, encoding="utf-8") as f:
        for line in f:
            if line.strip():
                yield json.loads(line)


def matterport_from(attachments, scope, out):
    for a in attachments or []:
        if a.get("videoExternalReferenceType") in MATTERPORT_TYPES and a.get("videoKey"):
            out.append({"modelId": a["videoKey"], "scope": scope})


def photos_from(attachments):
    result = []
    for a in attachments or []:
        if a.get("attachmentUri") and a.get("attachmentType") in INTERIOR_PHOTO_TYPES \
                and not a.get("videoKey"):
            result.append({"url": bigger(a["attachmentUri"]), "caption": a.get("caption"),
                           "type": a.get("attachmentType")})
    return result


UNIT_WORDS = ("bath", "bed", "kitchen", "living", "br,", "br ", "studio", "dining", "closet", "unit", "den")
ACCESS_WORDS = ("entry", "entrance", "lobby", "elevator", "leasing", "hall", "corridor", "exterior", "front")
AMENITY_WORDS = ("gym", "fitness", "theat", "pool", "spa", "clubhouse", "game", "rooftop", "yoga", "pet",
                 "dog", "grill", "bbq", "cowork", "business", "lounge", "sauna", "playground", "court")


def photo_rank(ph):
    """0 = photos of the apartment itself (most useful), 1 = entrances/lobby, 2 = other, 3 = amenities."""
    cap = (ph.get("caption") or "").lower()
    if any(w in cap for w in UNIT_WORDS):
        return 0
    if any(w in cap for w in AMENITY_WORDS):
        return 3
    if any(w in cap for w in ACCESS_WORDS):
        return 1
    return 2


def pick_photos(photos, keep=10, per_caption=2):
    """Most useful first, and no more than 2 photos with the same caption."""
    seen, out = {}, []
    for ph in sorted(photos, key=photo_rank):
        key = (ph.get("caption") or "").lower()
        if seen.get(key, 0) >= per_caption:
            continue
        seen[key] = seen.get(key, 0) + 1
        out.append(ph)
        if len(out) >= keep:
            break
    return out


def year_built(prop):
    for e in prop.get("constructionEvents") or []:
        if e.get("eventType") == 2:
            return e.get("year")
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True, help="folder containing the .jsonl files")
    ap.add_argument("--out", default="output")
    ap.add_argument("--limit", type=int, default=0, help="stop after N properties (for testing)")
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)

    listings = {r["propertyId"]: r for r in read_jsonl(os.path.join(args.data, "apartment-listing.jsonl"))}
    print(f"{len(listings)} apartment listings loaded")

    index = []
    for p in read_jsonl(os.path.join(args.data, "commercial-property.jsonl")):
        pid = p["id"]
        if pid not in listings or not p.get("propertyApartment"):
            continue
        apt = p["propertyApartment"]

        scans = []
        matterport_from(p.get("attachments"), "building", scans)
        photos = photos_from(p.get("attachments"))
        for m in apt.get("models") or []:
            label = f"floorplan {m.get('numBeds')}bd/{m.get('numBaths')}ba"
            matterport_from(m.get("attachments"), label, scans)
            photos += photos_from(m.get("attachments"))
            for u in m.get("units") or []:
                matterport_from(u.get("attachments"), f"unit {u.get('unitNumber')} ({label})", scans)
                photos += photos_from(u.get("attachments"))
        if not scans:
            continue

        elevs = [e for e in (apt.get("elevators") or []) if e.get("elevatorType") == 1]
        elevator_known = any(e.get("elevatorState") in (1, 2) for e in elevs)
        passenger = sum((e.get("numElevators") or 0) for e in elevs if e.get("elevatorState") == 1)

        lst = listings[pid]
        addr = lst.get("address") or p.get("primaryAddress") or {}
        index.append({
            "propertyId": pid,
            "name": lst.get("buildingName") or p.get("buildingName"),
            "address": " ".join(str(addr[k]) for k in
                                ("streetNumber", "streetDirection", "streetName", "streetType") if addr.get(k)),
            "city": addr.get("city"), "state": addr.get("state"),
            "lat": addr.get("latitude"), "lon": addr.get("longitude"),
            "stories": p.get("numStoriesAboveGrade"),
            "isWalkup": apt.get("isWalkup"),
            "passengerElevators": passenger if elevator_known else None,
            "yearBuilt": year_built(p) or lst.get("yearBuilt"),
            "style": apt.get("apartmentStyleType"),       # 1 Garden, 2 MidRise, 3 HighRise, 4 LowRise, 6 Townhome
            "lifestyle": apt.get("apartmentLifestyleType"),  # 2 = Senior
            "minRent": lst.get("minRent"), "maxRent": lst.get("maxRent"),
            "matterport": scans,
            "photos": pick_photos(photos),
        })
        if args.limit and len(index) >= args.limit:
            break

    path = os.path.join(args.out, "interior_index.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(index, f, indent=2)
    with_photos = sum(1 for r in index if r["photos"])
    print(f"wrote {len(index)} properties to {path} ({with_photos} have usable interior photos)")


if __name__ == "__main__":
    main()
