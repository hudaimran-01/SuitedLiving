"""STEP 3 (Gemini version): look at each building's interior photos and report accessibility features.

Needs GEMINI_API_KEY in .env  (free key: https://aistudio.google.com/apikey)
Run small first:  py 03_analyze_photos_gemini.py --max 1
If the model name below is rejected, set GEMINI_MODEL in .env to a current one from aistudio.google.com.
"""
import argparse, json, os, re, time
import requests
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv(override=True)
MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.5-flash-lite")
FEATURES = [
    "step_free_entry", "wide_doorways", "roll_in_or_walk_in_shower", "bathtub_only",
    "grab_bars", "hard_flooring_throughout", "open_turning_space", "kitchen_knee_clearance",
    "lever_door_handles", "good_lighting_and_contrast",
]
PROMPT = f"""You are checking apartment photos for accessibility for people with disabilities.
Look ONLY at what is visible. For each feature return value true, false, or null (null = cannot tell
from these photos), a confidence from 0 to 1, a short evidence sentence, and the photo number (1-based)
that shows it (or null).
Features: {', '.join(FEATURES)}.
Never guess measurements. A photo cannot prove a door is 32 inches wide; say 'looks wide' only if clearly so.
Reply with ONLY JSON of this shape:
{{"features": {{"<feature>": {{"value": true|false|null, "confidence": 0.0, "evidence": "...", "photo": 1}}}},
 "cant_confirm": ["..."]}}"""


from photo_fetch import fetch_image


def load_image(url):
    data, ctype = fetch_image(url)
    return types.Part.from_bytes(data=data, mime_type=ctype)


def analyze(client, prop):
    parts, used = [], []
    for ph in prop["photos"][:6]:
        try:
            parts.append(load_image(ph["url"]))
            used.append(ph)
        except Exception as e:
            print("  skip photo:", e)
    if not parts:
        return None
    resp = None
    for attempt in range(6):          # Gemini sometimes says "high demand" (503) or "slow down" (429)
        try:
            resp = client.models.generate_content(
                model=MODEL, contents=parts + [PROMPT],
                config=types.GenerateContentConfig(response_mime_type="application/json"))
            break
        except Exception as e:
            busy = any(code in str(e) for code in ("503", "429", "UNAVAILABLE", "RESOURCE_EXHAUSTED", "imeout", "timed out", "DEADLINE"))
            if not busy or attempt == 5:
                raise
            wait = 10 * (attempt + 1)
            print(f"  Gemini busy or slow, waiting {wait}s then retrying ({attempt + 1}/5)...")
            time.sleep(wait)
    data = json.loads(re.search(r"\{.*\}", resp.text, re.S).group(0))
    data["photos"] = used
    return data


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--index", default="output/interior_index.json")
    ap.add_argument("--max", type=int, default=5)
    args = ap.parse_args()
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"],
                          http_options=types.HttpOptions(timeout=90000))  # give up after 90 s and retry
    os.makedirs("output/vision", exist_ok=True)
    props = [p for p in json.load(open(args.index, encoding="utf-8")) if p["photos"]][: args.max]
    for p in props:
        out = f"output/vision/{p['propertyId']}.json"
        if os.path.exists(out):
            print("already done", p["propertyId"]); continue
        print("analyzing", p["propertyId"], p["name"])
        try:
            res = analyze(client, p)
        except Exception as e:
            print("  failed:", e); continue
        if res:
            json.dump(res, open(out, "w", encoding="utf-8"), indent=2)


if __name__ == "__main__":
    main()
