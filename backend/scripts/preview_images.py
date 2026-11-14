import json
import pathlib
import sys

# IMAGE CHECK FOR THE IMAGE BUILDER THROUGH HTML WEBSITE 

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
import config

listings = json.loads((config.CACHE_DIR / "listings.json").read_text(encoding="utf-8"))
cards = []
for x in listings:
    img = x["images"]
    thumbs = "".join(f'<img src="{u}" height="90">' for u in img["photos"][:4])
    cards.append(
        f'<div class="c"><h3>{x["id"]} · {x["address"]}, {x["place"]} · ${x["price"]:,.0f}</h3>'
        f'<img class="still" src="{img["matterport"] or ""}" alt="NO STILL"><div>{thumbs}</div></div>'
    )
html = ("<style>body{font:14px sans-serif;margin:20px}.c{margin-bottom:24px}"
        ".still{height:260px;display:block;margin-bottom:6px;background:#eee}img{margin-right:4px}</style>"
        + "".join(cards))
out = config.CACHE_DIR / "image_preview.html"
out.write_text(html, encoding="utf-8")
print(out)