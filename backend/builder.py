import re
from datetime import datetime

from checks import LISTED, derive_findings, investigations
from schema import Listing


def _size(uri, size_id):
    """Homes.com image links carry a /112/ size segment; swap it for a bigger size."""
    return re.sub(r"/112/", f"/{size_id}/", uri, count=1) if uri else None

def scan_model_id(l):
    """Matterport model id from the scan's own link (…/show/?m=ID)."""
    scan = next((m for m in l.get("media") or [] if m.get("type") == 43), None)
    hit = re.search(r"[?&]m=([A-Za-z0-9]+)", (scan or {}).get("uri") or "")
    return hit.group(1) if hit else None

def _images(l, model_id):
    media = l.get("media") or []
    scan = next((m for m in media if m.get("type") == 43), None)
    photos = sorted((m for m in media if m.get("type") == 4 and m.get("uri")),
                    key=lambda m: (m.get("displayOrder") is None, m.get("displayOrder") or 0))
    photo_urls = [_size(m["uri"], 102) for m in photos[:8]]
    plans = list(dict.fromkeys(m["uri"] for m in media if m.get("type") == 10 and m.get("uri")))
    still = _size(scan["thumbnailUri"], 102) if scan and scan.get("thumbnailUri") else None
    return {"matterport": still or (photo_urls[0] if photo_urls else None),
            "vexcel": None, "hasScan": bool(model_id), "modelId": model_id,
            "photos": photo_urls, "floorplans": plans}

def _listed(l):
    s = l.get("listDate")
    if not s:
        return "Listed recently"
    try:
        d = datetime.fromisoformat(s.replace("Z", "+00:00"))
    except ValueError:
        return "Listed recently"
    return f"Listed {d.strftime('%b')} {d.day}, {d.year}"


def _floor(l, rec):
    a = ((l.get("property") or {}).get("address")) or {}
    st = ((l.get("resoValues") or {}).get("structure")) or {}
    d = rec.get("derivedValues") or {}
    if d.get("propertyType") == "Condominium":
        fl, total = a.get("floorNumber"), st.get("storiesTotal")
        if fl and total:
            return f"Floor {fl} of {total:g}"
        return f"Floor {fl}" if fl else "Condo"
    n = d.get("numberOfStories")
    if n:
        return f"{n:g} {'story' if n == 1 else 'stories'}"
    return "House"

NOTE_WORDS = re.compile(
    r"elevator|\blift\b|wheelchair|handicap|\bramp|step[- ]?free|no steps|zero[- ]entry|roll-in|"
    r"grab bar|first floor|main level|ground floor|downstairs",
    re.I,
)


def _agent_notes(l, limit=3, max_len=180):
    out = []
    for s in re.split(r"(?<=[.!?])\s+", l.get("remarks") or ""):
        s = s.strip()
        if s and NOTE_WORDS.search(s):
            out.append(s if len(s) <= max_len else s[:max_len].rstrip() + "…")
        if len(out) == limit:
            break
    return out

def build_listing(l, rec, model_id):
    """One kit listing + its features record -> the frontend's Listing shape (a plain dict)."""
    p = l.get("property") or {}
    a = p.get("address") or {}
    street = a.get("fullStreetAddress")
    data = {
        "id": str(l["id"]),
        "name": a.get("buildingName") or street,
        "unit": a.get("unitNumber"),
        "address": street,
        "place": f"{a.get('city')}, {a.get('state')}",
        "price": l.get("currentPrice"),
        "beds": p.get("bedsMin"),
        "baths": p.get("bathsMin"),
        "sqft": p.get("sqftMin"),
        "floor": _floor(l, rec),
        "agentNotes": _agent_notes(l),
        "available": _listed(l),
        "scene": LISTED,
        "images": _images(l, model_id),
        "sketchLabel": "Listing photo",
        "investigations": investigations(rec, model_id=model_id, listing=l),
        "findings": derive_findings(rec, l),
    }
    return Listing.model_validate(data).model_dump(mode="json")