#!/usr/bin/env python3
"""
hotmart_export.py -- drive your own logged-in Hotmart Club session to export a
course you purchased, so it can be transcribed and summarized locally.

Run this on the machine where you normally watch the course.

What it does: launches a real Chromium with a persistent profile, waits for you to
log in by hand once, then walks the course and records what that browser is already
authorized to load -- the lesson list, any subtitle tracks, and the video stream
URLs. It does not bypass authentication and it does not decrypt protected content.
If a lesson turns out to be DRM-protected, the script says so and stops on that
lesson rather than trying to get around it.

Usage:
    python hotmart_export.py login
    python hotmart_export.py map   --url "https://hotmart.com/en/club/<slug>/products/<id>/content/<hash>"
    python hotmart_export.py fetch
    python hotmart_export.py all   --url "..."          # map + fetch

Output lands in ./export/ :
    course_map.json      lesson list (title, url, hash)
    raw_api/*.json       every JSON payload the app fetched, for inspection
    subtitles/*.vtt      caption tracks, when the player exposes them
    video/*.mp4          downloaded lessons
    media_urls.json      what was captured per lesson, and why any lesson failed
"""

import argparse
import json
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

try:
    from playwright.sync_api import TimeoutError as PWTimeout
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.exit("playwright is not installed. Run:\n  pip install playwright\n  playwright install chromium")

ROOT = Path(__file__).resolve().parent
PROFILE_DIR = ROOT / "browser-profile"
OUT = ROOT / "export"

# Hosts the Club app and its player actually talk to.
HOTMART_HOSTS = ("hotmart.com", "hotmart.host", "hotmart.io")

# A lesson URL always ends in /content/<hash>.
CONTENT_HREF = re.compile(r"/content/([A-Za-z0-9_-]{6,})")

MEDIA_EXT = (".m3u8", ".mpd", ".mp4")
SUBTITLE_EXT = (".vtt", ".srt")

CHROMIUM_ARGS = [
    # The player will not request the stream until playback starts, and headless
    # autoplay is blocked by default. This lets us start it without a real click.
    "--autoplay-policy=no-user-gesture-required",
]


# ---------------------------------------------------------------- helpers


def _out_dirs():
    for sub in ("raw_api", "subtitles", "video"):
        (OUT / sub).mkdir(parents=True, exist_ok=True)


def _is_hotmart(url: str) -> bool:
    return any(h in url for h in HOTMART_HOSTS)


def _slug(text: str, limit: int = 70) -> str:
    text = re.sub(r"\s+", "_", text.strip())
    text = re.sub(r"[^A-Za-z0-9_.-]", "", text)
    return text[:limit] or "untitled"


def _launch(pw, headless: bool):
    return pw.chromium.launch_persistent_context(
        user_data_dir=str(PROFILE_DIR),
        headless=headless,
        args=CHROMIUM_ARGS,
        viewport={"width": 1440, "height": 900},
    )


def _cookie_header(ctx, url: str) -> str:
    """Cookie header for `url`, taken from the live browser session."""
    host = re.sub(r"^https?://([^/]+).*$", r"\1", url)
    pairs = []
    for c in ctx.cookies():
        domain = c["domain"].lstrip(".")
        if domain in host or host.endswith(domain):
            pairs.append(f"{c['name']}={c['value']}")
    return "; ".join(pairs)


def _walk_json(node, found, seen):
    """Recursively pull {hash, name} shaped objects out of an arbitrary payload.

    The Club API's exact shape is not documented and changes; rather than pinning
    endpoint names we look for anything that carries a content hash and a title.
    """
    if isinstance(node, dict):
        h = node.get("hash") or node.get("pageHash") or node.get("contentHash")
        name = node.get("name") or node.get("title") or node.get("pageName")
        if isinstance(h, str) and isinstance(name, str) and len(h) >= 6 and h not in seen:
            seen.add(h)
            found.append({"hash": h, "title": name.strip()})
        for v in node.values():
            _walk_json(v, found, seen)
    elif isinstance(node, list):
        for v in node:
            _walk_json(v, found, seen)


# ---------------------------------------------------------------- login


def cmd_login(args):
    PROFILE_DIR.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as pw:
        ctx = _launch(pw, headless=False)
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        page.goto("https://hotmart.com/en/club", wait_until="domcontentloaded")
        print("\nA browser window is open.")
        print("Log into Hotmart and open your course, so the session is warm.")
        input("When you can see the course content, come back here and press Enter... ")
        ctx.close()
    print(f"\nSession saved to {PROFILE_DIR}. You should not need to log in again.")


# ---------------------------------------------------------------- map


def cmd_map(args):
    _out_dirs()
    payloads = []

    with sync_playwright() as pw:
        ctx = _launch(pw, headless=args.headless)
        page = ctx.pages[0] if ctx.pages else ctx.new_page()

        def on_response(resp):
            if not _is_hotmart(resp.url):
                return
            ctype = (resp.headers or {}).get("content-type", "")
            if "json" not in ctype:
                return
            try:
                payloads.append({"url": resp.url, "body": resp.json()})
            except Exception:
                pass

        page.on("response", on_response)

        print(f"Opening {args.url}")
        page.goto(args.url, wait_until="networkidle", timeout=90_000)

        if "/club/" not in page.url or page.url.rstrip("/").endswith("/login"):
            ctx.close()
            sys.exit(
                "Landed outside the Club area -- the session looks logged out.\n"
                "Run: python hotmart_export.py login"
            )

        # Modules are often collapsed; open anything that looks like a section
        # header so its lessons render into the DOM.
        for sel in ("[class*='module']", "[class*='accordion']", "[data-testid*='module']"):
            for el in page.query_selector_all(sel):
                try:
                    el.click(timeout=800)
                    page.wait_for_timeout(120)
                except Exception:
                    pass

        page.wait_for_timeout(2500)

        # Source 1: the sidebar's own links.
        lessons, seen = [], set()
        for a in page.query_selector_all("a[href*='/content/']"):
            href = a.get_attribute("href") or ""
            m = CONTENT_HREF.search(href)
            if not m or m.group(1) in seen:
                continue
            seen.add(m.group(1))
            lessons.append(
                {
                    "hash": m.group(1),
                    "title": (a.inner_text() or "").strip() or m.group(1),
                    "url": href if href.startswith("http") else f"https://hotmart.com{href}",
                }
            )

        # Source 2: whatever the app fetched. Catches lessons the DOM never rendered.
        base = args.url.split("/content/")[0]
        api_found = []
        for p in payloads:
            _walk_json(p["body"], api_found, seen)
        for item in api_found:
            lessons.append(
                {"hash": item["hash"], "title": item["title"], "url": f"{base}/content/{item['hash']}"}
            )

        for i, p in enumerate(payloads):
            (OUT / "raw_api" / f"{i:03d}.json").write_text(
                json.dumps(p, indent=2, ensure_ascii=False), encoding="utf-8"
            )

        ctx.close()

    if not lessons:
        sys.exit(
            "No lessons found. Inspect export/raw_api/*.json to see what the app "
            "actually returned, then adjust the selectors near the top of cmd_map()."
        )

    for i, l in enumerate(lessons, 1):
        l["index"] = i

    (OUT / "course_map.json").write_text(
        json.dumps(lessons, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"\nFound {len(lessons)} lessons -> export/course_map.json")
    for l in lessons:
        print(f"  {l['index']:>3}. {l['title']}")
    print(f"\nCaptured {len(payloads)} API payloads -> export/raw_api/")


# ---------------------------------------------------------------- fetch


def _capture_lesson(ctx, lesson, wait_s: int):
    """Open one lesson and record the media + subtitle URLs its player requests."""
    page = ctx.new_page()
    media, subs = [], []

    def on_request(req):
        u = req.url
        if not _is_hotmart(u) and ".m3u8" not in u and ".mp4" not in u:
            return
        low = u.split("?")[0].lower()
        if low.endswith(MEDIA_EXT) and u not in media:
            media.append(u)
        elif low.endswith(SUBTITLE_EXT) and u not in subs:
            subs.append(u)

    page.on("request", on_request)

    try:
        page.goto(lesson["url"], wait_until="domcontentloaded", timeout=90_000)
    except PWTimeout:
        pass

    # Nudge playback -- the manifest is not requested until the player starts.
    deadline = time.time() + wait_s
    while time.time() < deadline and not media:
        for frame in page.frames:
            try:
                frame.evaluate(
                    "document.querySelectorAll('video').forEach(v => { v.muted = true; v.play().catch(() => {}); })"
                )
            except Exception:
                pass
        for sel in ("button[aria-label*='lay']", ".vjs-big-play-button", "[class*='play-button']"):
            try:
                page.click(sel, timeout=500)
            except Exception:
                pass
        page.wait_for_timeout(1000)

    page.wait_for_timeout(1500)
    page.close()
    # Prefer the master manifest over per-variant playlists.
    media.sort(key=lambda u: (".m3u8" not in u, len(u)))
    return media, subs


def _check_drm(ctx, manifest_url: str, referer: str):
    """Return a reason string if the manifest is protected, else None."""
    if manifest_url.split("?")[0].lower().endswith(".mpd"):
        return "DASH manifest (.mpd) -- typically Widevine-protected"
    try:
        r = ctx.request.get(manifest_url, headers={"Referer": referer})
        if not r.ok:
            return f"manifest fetch returned HTTP {r.status}"
        text = r.text()
    except Exception as e:
        return f"manifest fetch failed: {e}"

    if "com.widevine" in text or "com.apple.fps" in text or "skd://" in text:
        return "manifest declares Widevine/FairPlay DRM"
    if "SAMPLE-AES" in text:
        return "manifest uses SAMPLE-AES (DRM)"
    return None


def _download(manifest_url, referer, cookie, dest: Path):
    """Standard HLS pull. AES-128 keys are fetched by ffmpeg the same way the
    player fetches them -- with the session's own credentials. Nothing is stripped."""
    headers = f"Referer: {referer}\r\nOrigin: https://hotmart.com\r\n"
    if cookie:
        headers += f"Cookie: {cookie}\r\n"

    cmd = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-stats",
        "-headers", headers,
        "-i", manifest_url,
        "-c", "copy", "-bsf:a", "aac_adtstoasc",
        "-y", str(dest),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        return proc.stderr.strip()[-600:] or "ffmpeg failed"
    return None


def cmd_fetch(args):
    _out_dirs()
    map_path = OUT / "course_map.json"
    if not map_path.exists():
        sys.exit("export/course_map.json missing. Run the `map` command first.")
    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg not found on PATH. Install it, then re-run.")

    lessons = json.loads(map_path.read_text(encoding="utf-8"))
    if args.limit:
        lessons = lessons[: args.limit]

    results = []
    for lesson in lessons:
        name = f"{lesson['index']:03d}_{_slug(lesson['title'])}"
        dest = OUT / "video" / f"{name}.mp4"
        if dest.exists() and dest.stat().st_size > 0:
            print(f"[{lesson['index']}] already have {dest.name}, skipping")
            results.append({**lesson, "status": "skipped", "file": str(dest)})
            continue

        print(f"[{lesson['index']}] {lesson['title']}")

        with sync_playwright() as pw:
            ctx = _launch(pw, headless=args.headless)
            media, subs = _capture_lesson(ctx, lesson, args.wait)

            for j, s in enumerate(subs):
                try:
                    r = ctx.request.get(s, headers={"Referer": lesson["url"]})
                    if r.ok:
                        suffix = ".srt" if s.split("?")[0].lower().endswith(".srt") else ".vtt"
                        (OUT / "subtitles" / f"{name}{'' if j == 0 else f'_{j}'}{suffix}").write_bytes(r.body())
                        print("      captured subtitle track")
                except Exception:
                    pass

            if not media:
                print("      no media URL seen -- see notes in media_urls.json")
                results.append({**lesson, "status": "no-media", "media": [], "subtitles": subs})
                ctx.close()
                continue

            manifest = media[0]
            drm = _check_drm(ctx, manifest, lesson["url"])
            cookie = _cookie_header(ctx, manifest)
            ctx.close()

        if drm:
            print(f"      protected: {drm}")
            print("      skipping -- use the screen-recording fallback in README.md")
            results.append({**lesson, "status": "drm", "reason": drm, "media": media})
            continue

        err = _download(manifest, lesson["url"], cookie, dest)
        if err:
            print(f"      download failed: {err.splitlines()[-1] if err else ''}")
            results.append({**lesson, "status": "error", "reason": err, "media": media})
        else:
            mb = dest.stat().st_size / 1e6
            print(f"      saved {dest.name} ({mb:.1f} MB)")
            results.append({**lesson, "status": "ok", "file": str(dest), "media": media})

    (OUT / "media_urls.json").write_text(
        json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    tally = {}
    for r in results:
        tally[r["status"]] = tally.get(r["status"], 0) + 1
    print("\nDone: " + ", ".join(f"{v} {k}" for k, v in sorted(tally.items())))
    print("Details -> export/media_urls.json")


# ---------------------------------------------------------------- cli


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("login", help="open a browser and save your session")
    p.set_defaults(func=cmd_login)

    p = sub.add_parser("map", help="build the lesson list")
    p.add_argument("--url", required=True, help="any lesson URL from the course")
    p.add_argument("--headless", action="store_true")
    p.set_defaults(func=cmd_map)

    p = sub.add_parser("fetch", help="download the lessons in course_map.json")
    p.add_argument("--limit", type=int, help="only the first N lessons (try 1 first)")
    p.add_argument("--wait", type=int, default=25, help="seconds to wait for the player")
    p.add_argument("--headless", action="store_true")
    p.set_defaults(func=cmd_fetch)

    p = sub.add_parser("all", help="map then fetch")
    p.add_argument("--url", required=True)
    p.add_argument("--limit", type=int)
    p.add_argument("--wait", type=int, default=25)
    p.add_argument("--headless", action="store_true")
    p.set_defaults(func=lambda a: (cmd_map(a), cmd_fetch(a)))

    args = ap.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
