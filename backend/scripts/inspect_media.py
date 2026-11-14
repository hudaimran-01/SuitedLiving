import pathlib
import sys
from collections import Counter

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
import config
import kit
import picks

ids = {int(x) for x in sys.argv[1:]} or set(picks.PICKS)

for l in kit.read_jsonl(config.LISTINGS_JSONL):
    if l["id"] not in ids:
        continue
    media = l.get("media") or []
    print(f"\n=== {l['id']} ===  {len(media)} media items, has3DTour={l.get('has3DTour')}")
    print("  (type, externalReferenceType) counts:",
          dict(Counter((m.get("type"), m.get("externalReferenceType")) for m in media)))
    seen = set()
    for m in media:
        key = (m.get("type"), m.get("externalReferenceType"))
        if key in seen:
            continue
        seen.add(key)
        print(f"  type={key[0]} ext={key[1]} src={m.get('source')} "
              f"{m.get('width')}x{m.get('height')} caption={m.get('caption')!r}")
        print(f"     uri={m.get('uri')}")
        print(f"     thumb={m.get('thumbnailUri')}")