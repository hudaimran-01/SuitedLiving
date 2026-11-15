"""Download a CoStar photo even when the image server rejects plain Python requests."""
import base64, os, subprocess, tempfile
import requests

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")
REFERER = "https://www.apartments.com/"
HEADERS = {"User-Agent": UA, "Accept": "image/avif,image/webp,image/*,*/*;q=0.8", "Referer": REFERER}


def sniff_type(data):
    if data[:2] == b"\xff\xd8":
        return "image/jpeg"
    if data[:4] == b"\x89PNG":
        return "image/png"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    return None


def _with_curl(url):
    fd, tmp = tempfile.mkstemp(suffix=".img")
    os.close(fd)
    try:
        subprocess.run(["curl.exe", "-sSLf", "-A", UA, "-e", REFERER, "-o", tmp, url],
                       check=True, timeout=45, capture_output=True)
        return open(tmp, "rb").read()
    finally:
        os.remove(tmp)


_pw = _browser = _page = None


def _with_browser(url):
    """Open the photo in a real (headless) Edge/Chrome, then re-save it as a JPEG.
    Going through the browser means any format it can show (AVIF, WebP, ...) becomes a plain JPEG."""
    global _pw, _browser, _page
    from playwright.sync_api import sync_playwright
    if _page is None:
        _pw = sync_playwright().start()
        try:
            _browser = _pw.chromium.launch(channel="msedge", headless=True)
        except Exception:
            _browser = _pw.chromium.launch(channel="chrome", headless=True)
        ctx = _browser.new_context(user_agent=UA, extra_http_headers={"Referer": REFERER})
        _page = ctx.new_page()
    resp = _page.goto(url, wait_until="load", timeout=30000)
    if not resp or not resp.ok:
        raise RuntimeError(f"browser got HTTP {resp.status if resp else 'no response'}")
    data_url = _page.evaluate(JS_TO_JPEG)
    if not data_url:
        raise RuntimeError(f"page was not a picture (content-type {resp.headers.get('content-type')})")
    return base64.b64decode(data_url.split(",", 1)[1])


JS_TO_JPEG = """() => {
  const img = document.querySelector('img');
  if (!img || !img.naturalWidth) return null;
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  c.getContext('2d').drawImage(img, 0, 0);
  return c.toDataURL('image/jpeg', 0.9);
}"""


def fetch_image(url):
    """Returns (bytes, media_type). Raises if every method fails."""
    last = None
    for u in (url, url.replace("/113/", "/112/")):
        for method in ("browser", "requests", "curl"):
            try:
                if method == "requests":
                    r = requests.get(u, headers=HEADERS, timeout=30)
                    r.raise_for_status()
                    data = r.content
                elif method == "curl":
                    data = _with_curl(u)
                else:
                    data = _with_browser(u)
                ctype = sniff_type(data)
                if ctype:
                    return data, ctype
                last = RuntimeError(f"download was not a JPEG/PNG/WEBP picture (starts with {data[:12]!r})")
            except Exception as e:
                last = e
    raise last
