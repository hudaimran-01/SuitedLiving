# InsideOut backend

Turns the CoStar data kit into a small, validated JSON file that the frontend reads. For each demo listing it records what the listing states, what might block someone, and what is still unknown.

## How it works

```
CoStar kit (JSONL + CSV, outside the repo, set by KIT_DIR)
   -> kit.py        read files, apply hard filters
   -> picks.py      the 6 demo listings
   -> checks.py     derive the 12 accessibility findings + 3 investigation lines
   -> builder.py    assemble one listing dict, validate with schema.py
   -> scripts/build_cache.py   write backend/cache/listings.json
   -> app.py        Flask API serves that file
```

| File | Role |
|---|---|
| `config.py` | Paths. Loads `KIT_DIR` from `.env`. |
| `kit.py` | Reads the kit and decides which listings are eligible. |
| `picks.py` | The hand-picked demo listing ids, with a reason for each. |
| `checks.py` | The accessibility rules (observed / barrier / unknown). |
| `builder.py` | Builds the full listing record (images, floor, baths, notes). |
| `schema.py` | Pydantic models. The contract with the frontend. |
| `app.py` | Flask API on port 5001. |
| `scripts/` | Build and inspection tools. |

## Setup

```
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
```

Create a `.env` file in the repo root:

```
KIT_DIR=/path/to/costar-hackathon-kit
```

The kit is not in this repo. It needs `data/residential-listings.jsonl`, `data/residential-listing-features.jsonl` and `residential-listings.csv` at its root.

## Run

Build the cache, then start the API:

```
python3 backend/scripts/build_cache.py
python3 backend/app.py
```

Test from a second terminal:

```
curl http://127.0.0.1:5001/api/health
curl http://127.0.0.1:5001/api/listings
curl http://127.0.0.1:5001/api/listings/236060791
```

| Endpoint | Returns |
|---|---|
| `GET /api/health` | Status check |
| `GET /api/listings` | All demo listings |
| `GET /api/listings/<id>` | One listing |

`backend/cache/` is gitignored. Rebuild it after any change to the rules or picks.

## Listing format

Each listing has: `id`, `name`, `unit`, `address`, `place`, `price`, `beds`, `baths`, `sqft`, `floor`, `available`, `scene`, `images`, `sketchLabel`, `investigations`, `findings`, `agentNotes`.

- `findings` has one entry for each of 12 checks: step-free, elevator, parking, short-walk, doorways, bathroom, lighting, contrast, signage, alarms, doorbell, intercom.
- Each finding has a `status` (`observed`, `barrier` or `unknown`), a `source` (`CoStar`, `Vexcel` or `Matterport`), a title, a detail, and an optional `ask` question.
- `images` holds a real still (`matterport`), MLS `photos`, `floorplans`, `hasScan` and `modelId`.
- `baths` counts a half bath as 0.5.

The schema validates the structure. It does not convert data.

## 3D tour embed

If `images.hasScan` is true and `images.modelId` is set, the frontend can show an "Open 3D tour" button that loads an iframe:

```
https://my.matterport.com/show/?m=<modelId>&play=1
```

This needs no API key. If there is no scan, fall back to the still image.

## Demo listings

Sale listings only, in Houston and Los Angeles. They were chosen to show a range: strong evidence, a likely barrier, and several unknowns. See `picks.py`.

Funnel: 2,120 kit listings -> 635 pass the hard filters (public, primary, active, has address, has a Matterport model, has a features record). The demo uses 6 of them.

## Evidence rules, and what the backend does not know

- A listing is only marked observed when the listing data states it.
- A multi-story house with nothing stated is marked a potential barrier. If features or remarks hint at accessibility, it is marked unknown and the finding asks which floor.
- A tub-only bathroom is marked a potential barrier.
- Lighting, contrast, signage and short-walk are always unknown here. They are meant to come from aerial imagery.
- The `investigations` text says aerial imagery has not been reviewed. This is a placeholder: the Vexcel retriever lives in the frontend work, and the overlay is not merged here yet.
- Room sizes from the Matterport scan are not used yet.

## Scripts

| Script | Purpose |
|---|---|
| `build_cache.py` | Builds `cache/listings.json` |
| `candidates.py` | Funnel counts and a ranked table of eligible listings (`cache/candidates.csv`) |
| `preview_listing.py <id>` | Prints findings, facts and remarks for one listing |
| `inspect_media.py <id>` | Prints a listing's media types and sample URLs |
| `preview_images.py` | Writes `cache/image_preview.html` to eyeball the photos |
