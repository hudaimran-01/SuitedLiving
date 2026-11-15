import json

from flask import Flask, abort, jsonify
from flask_cors import CORS

import config
from project_sidewalk import (
    KNOWN_PROPERTY_SIDEWALK,
    score_pedestrian_route,
    to_project_sidewalk_geojson
)

app = Flask(__name__)
app.json.sort_keys = False
CORS(app)

CACHE_FILE = config.CACHE_DIR / "listings.json"
MEDIA_DIR = config.ROOT / "property_media" / "vexcel"


def load():
    if not CACHE_FILE.exists():
        abort(503, description="Run backend/scripts/build_cache.py first")
    return json.loads(CACHE_FILE.read_text(encoding="utf-8"))


@app.get("/api/health")
def health():
    return {"ok": True}


@app.get("/api/listings")
def listings():
    return jsonify(load())


@app.get("/api/listings/<lid>")
def listing(lid):
    for x in load():
        if x["id"] == lid:
            return jsonify(x)
    abort(404)


@app.get("/api/sidewalk/access-score/<lid>")
def sidewalk_score(lid):
    """Returns Project Sidewalk AccessScore audit details for a listing."""
    info = KNOWN_PROPERTY_SIDEWALK.get(str(lid))
    if not info:
        abort(404, description=f"Listing {lid} not found in Project Sidewalk database")
    return jsonify({
        "listing_id": str(lid),
        "source": "Project Sidewalk Access Score API (UW Makeability Lab)",
        **info
    })


if __name__ == "__main__":
    app.run(port=5001, debug=True)