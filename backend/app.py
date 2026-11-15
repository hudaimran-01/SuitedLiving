import json

from flask import Flask, abort, jsonify
from flask_cors import CORS

import config

app = Flask(__name__)
app.json.sort_keys = False
CORS(app)

CACHE_FILE = config.CACHE_DIR / "listings.json"


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


if __name__ == "__main__":
    app.run(port=5001, debug=True)