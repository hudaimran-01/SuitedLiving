import os
from pathlib import Path

from dotenv import find_dotenv, load_dotenv

load_dotenv(find_dotenv())

ROOT = Path(__file__).resolve().parent.parent
CACHE_DIR = ROOT / "backend" / "cache"

KIT_DIR = Path(os.environ["KIT_DIR"]).expanduser()
DATA_DIR = KIT_DIR / "data"
LISTINGS_JSONL = DATA_DIR / "residential-listings.jsonl"
FEATURES_JSONL = DATA_DIR / "residential-listing-features.jsonl"
LISTINGS_CSV = KIT_DIR / "residential-listings.csv"