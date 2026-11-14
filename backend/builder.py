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


def _photo(m):
    caption = _plain(m.get("caption"))
    alt = _plain(m.get("altText"))
    disclaimer = caption if "digitally altered" in caption.lower() else ""
    room = "" if disclaimer or len(caption) > 48 else caption
    if not room and alt:
        room = re.split(r"\b(?:featuring|with)\b", alt, maxsplit=1, flags=re.I)[0].strip(" .")
    return {
        "src": _size(m["uri"], 102),
        "label": room or "Listing photo",
        "detail": alt or room or "Listing photo",
        "note": disclaimer or None,
    }


def _images(l, model_id):
    media = l.get("media") or []
    scan = next((m for m in media if m.get("type") == 43), None)
    photos = sorted((m for m in media if m.get("type") == 4 and m.get("uri")),
                    key=lambda m: (m.get("displayOrder") is None, m.get("displayOrder") or 0))
    shots = [_photo(m) for m in photos[:8]]
    still = _size(scan["thumbnailUri"], 102) if scan and scan.get("thumbnailUri") else None
    return {"matterport": still or (shots[0]["src"] if shots else None),
            "vexcel": None, "hasScan": bool(model_id), "modelId": model_id, "photos": shots}

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
    r"elevator|\blift\b|wheelchair|handicap|\bramp|step[- ]?free|no steps|zero[- ]entry|roll-in|grab bar|"
    r"(?:first floor|main level|ground floor|downstairs).{0,48}(?:bed|bath|access|suite|ramp|elevator)|"
    r"(?:bed|bath|suite).{0,48}(?:first floor|main level|ground floor|downstairs)",
    re.I,
)


def _plain(text):
    text = re.sub(r"<br\s*/?>", " ", text or "", flags=re.I)
    text = re.sub(r"<[^>]+>", "", text)
    return re.sub(r"\s+", " ", text).strip()


def _agent_notes(l, limit=3, max_len=180):
    out = []
    for s in re.split(r"(?<=[.!?])\s+", _plain(l.get("remarks"))):
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