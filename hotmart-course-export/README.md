# Hotmart course export — local handoff

Tooling to export a Hotmart Club course **you purchased** on your own machine, so it
can be transcribed and summarized. The remote Claude Code container can't reach
Hotmart Club (403 — no session, no cookies, no Hotmart connector), so this runs
where you're already logged in.

Built for: **GERE SUA PRÓPRIA ENERGIA** by MOISES SOL NA PLACA —
`hotmart.com/en/club/solnaplaca/products/1193151`. Portuguese, off-grid solar.
(`solnaplaca` is the producer's members-area slug, not the course title.)

## Before anything else: set your Hotmart password

The purchase confirmation says you're a **new Hotmart user** and still need to set a
password. Until you do, there is no account to log into and none of this works. Open
the email titled *"Here's your access to course GERE SUA PRÓPRIA ENERGIA!"* from
`noreply@hotmart.com` and click **Set password and access content**. Log in once in a
normal browser and confirm you can play a lesson, then continue below.

## Scope

This drives a real browser with your real session and records the URLs that browser
is already authorized to request. It does **not** bypass login and does **not**
decrypt protected content. If a lesson is Widevine/FairPlay protected, the script
reports it and moves on — see the screen-recording fallback below.

## Setup

```bash
python -m venv .venv && source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install playwright
playwright install chromium
```

`ffmpeg` also needs to be on your PATH:

- macOS — `brew install ffmpeg`
- Ubuntu/Debian — `sudo apt install ffmpeg`
- Windows — `winget install Gyan.FFmpeg`

## Run

**1. Log in once.** Opens a browser; log into Hotmart and open the course, then press
Enter in the terminal. The session persists in `browser-profile/`.

```bash
python hotmart_export.py login
```

**2. Map the course.** Any lesson URL works — it walks the whole sidebar.

```bash
python hotmart_export.py map \
  --url "https://hotmart.com/en/club/solnaplaca/products/1193151/content/RO93ZdWNeP"
```

Check `export/course_map.json` before continuing. If the lesson count looks short,
some modules were collapsed — open them all in the browser first, or read
`export/raw_api/*.json` to see what the app actually returned.

**3. Test one lesson**, then do the rest.

```bash
python hotmart_export.py fetch --limit 1
python hotmart_export.py fetch
```

`fetch` is resumable — it skips lessons already downloaded, so re-run it freely.

## Output

```
export/
  course_map.json      lesson list (index, title, url, hash)
  raw_api/*.json       every JSON payload the app fetched
  subtitles/*.vtt      caption tracks, when the player exposes them
  video/*.mp4          downloaded lessons, numbered in course order
  media_urls.json      per-lesson status, and the reason for any failure
```

**If subtitles came through, you may not need the video at all.** Check
`export/subtitles/` first — a full set of `.vtt` files is everything needed for a
summary, at a fraction of the size.

## Then summarize

Point local Claude Code at the folder. `LOCAL_PROMPT.md` has the prompt to paste —
it uses the `watch` skill per video and produces a per-lesson breakdown plus a
consolidated course summary.

## Troubleshooting

**"Landed outside the Club area"** — session expired. Re-run `login`.

**No lessons found** — the sidebar selectors didn't match. Open
`export/raw_api/*.json`, find the payload holding the lesson list, and adjust
`cmd_map()`. Local Claude can do this from the captured JSON.

**"no media URL seen"** — the player never started within the wait window. Try
`--wait 45`, and don't use `--headless` so you can watch what happens.

**"protected: manifest declares Widevine/FairPlay DRM"** — the stream is encrypted
and this script will not touch that. Fallback: play each lesson full-screen and
screen-record it. Built-in options are QuickTime (macOS, ⌘⇧5), Xbox Game Bar
(Windows, Win+G), or OBS on any platform. Save recordings into `export/video/`
using the same `NNN_title.mp4` naming and the summarize step works unchanged.

**Slow or stalling downloads** — Hotmart rate-limits. Re-run `fetch`; it resumes.
