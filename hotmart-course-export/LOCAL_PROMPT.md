# Prompt for local Claude Code

Run `claude` from inside `hotmart-course-export/` and paste this.

---

## If the export already ran

> I've exported a Hotmart course I bought into `export/` in this directory —
> "Sol na Placa", a Brazilian course on off-grid photovoltaic solar by Moisés.
> The videos are in Portuguese.
>
> `export/course_map.json` has the lesson list in course order. Lessons are in
> `export/video/`, and any caption tracks are in `export/subtitles/`.
>
> Work through **every** lesson in order. For each one, use the `watch` skill on the
> video — or read the `.vtt` directly if a caption track exists for it, which is
> cheaper and just as good. Write each lesson's notes to `notes/NNN_title.md` as you
> go, so nothing is lost if the run is interrupted.
>
> Per lesson I want: what it teaches, the concrete procedure or calculation shown,
> any formulas, component specs, or numbers stated, and anything the instructor
> flags as a mistake to avoid.
>
> When all lessons are done, write `SUMMARY.md`: what the course covers end to end,
> the off-grid sizing method it teaches as one continuous walkthrough (load survey →
> battery bank → panel array → charge controller → inverter), a consolidated
> equipment and formula reference, and the instructor's specific warnings.
>
> Summarize in English but keep Portuguese technical terms in parentheses on first
> use, so the terms still match the course material.
>
> Tell me if any lesson failed to process rather than skipping it silently.

## If the export hasn't run yet

> Read `README.md` in this directory and run the export it describes, against
> `https://hotmart.com/en/club/solnaplaca/products/1193151/content/RO93ZdWNeP`.
> Start with `--limit 1` to confirm one lesson works before doing all of them.
> If the mapping step finds no lessons, inspect `export/raw_api/*.json` and fix the
> selectors in `cmd_map()`. Then summarize the course using the prompt above.

## Notes

- The `watch` skill wants a video path or URL. If it isn't installed locally, use
  `whisper` instead: `pip install openai-whisper`, then
  `whisper export/video/001_*.mp4 --language pt --model medium --output_dir transcripts/`.
- For a long course, tell Claude to work in batches of ~5 lessons and commit after
  each batch. Notes on disk survive a context reset; a long single run may not.
