# Graphify Troubleshooting Guide

Solutions for common installation and usage issues.

## Installation Issues

### "graphify is not recognized" (Windows)

**Symptom:** Command prompt shows `'graphify' is not recognized as an internal or external command`

**Solutions:**

1. **Add Python Scripts to PATH:**
   - Open System Properties → Environment Variables
   - Find or create the `PATH` variable
   - Add: `%APPDATA%\Python\Python3xx\Scripts` (replace `3xx` with your Python version)
   - Click OK and restart your terminal

2. **Use pipx (Easier):**
   ```bash
   pipx install graphifyy
   ```

### "externally-managed-environment" error (macOS/Linux)

**Symptom:** Error message about externally managed Python environment

**Solution:**

Use `pipx` instead of `pip`:

```bash
pipx install graphifyy
```

If `pipx` isn't installed:

```bash
pip install --user pipx
pipx install graphifyy
```

### Command doesn't appear after installation

**Symptom:** Ran `pip install graphifyy` but `graphify --help` says command not found

**Solution:**

Close and reopen your terminal. After installing a command-line tool, the terminal needs to refresh its PATH cache.

### Python version error

**Symptom:** "python version 3.10 or higher required" or similar

**Solution:**

Check your Python version:

```bash
python --version
```

If it's below 3.10, install a newer version from [python.org](https://www.python.org/downloads/).

If you have multiple Python versions installed, you may need to specify:

```bash
python3.10 -m pip install graphifyy
python3.10 -m graphify install
```

## Usage Issues

### Graphify doesn't find my files

**Symptom:** `graphify .` runs but the graph is empty or missing files

**Solution:**

- Ensure you're in the correct folder: `pwd` (macOS/Linux) or `cd` (Windows)
- Check that files exist: `ls` (macOS/Linux) or `dir` (Windows)
- Graphify reads: `.py`, `.js`, `.ts`, `.md`, `.pdf`, `.jpg`, `.png`
- Hidden files and node_modules/venv are skipped by default

### "No such file or directory: graphify-out"

**Symptom:** Error when trying to open `graphify-out/` folder

**Solution:**

This folder is created after the first run. Make sure the initial run completed:

```bash
/graphify .
```

Wait for it to finish processing before looking for the output folder.

### Out of memory or slow processing

**Symptom:** Process hangs or crashes on large codebases

**Solution:**

Process one folder at a time:

```bash
/graphify ./src
/graphify ./tests
/graphify ./docs
```

Then combine the graphs later or use the `--update` flag for incremental processing.

### Graph.html won't open in browser

**Symptom:** Browser shows blank page or won't load the interactive graph

**Solution:**

1. Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)
2. Check file path is correct
3. Try opening with a local server instead of `file://`:
   ```bash
   cd graphify-out
   python -m http.server 8000
   ```
   Then visit `http://localhost:8000/graph.html`

## Claude Code Integration Issues

### `/graphify` command not recognized in Claude Code

**Symptom:** Type `/graphify` but Claude Code doesn't recognize it

**Solution:**

1. Ensure Graphify is installed: `graphify --help`
2. Restart Claude Code
3. If using manual installation, verify `~/.claude/CLAUDE.md` contains:
   ```markdown
   - **graphify** (`~/.claude/skills/graphify/SKILL.md`) - any input to knowledge graph. Trigger: `/graphify`
   ```

### Graphify runs but doesn't produce output

**Symptom:** Command completes but `graphify-out/` folder is empty

**Solution:**

1. Check if the folder was created: `ls -la` or `dir`
2. Verify file permissions in your working directory
3. Try running in a different folder to isolate the issue
4. Check system disk space: `df -h` (macOS/Linux)

## Performance Issues

### First run is very slow

**Symptom:** Initial `graphify .` takes a long time

**Normal behavior:** First runs process all files. Subsequent runs with `--update` are faster.

To speed up:

```bash
/graphify ./smaller-folder
```

### Incremental updates aren't working

**Symptom:** `--update` flag doesn't speed things up

**Solution:**

Graphify tracks changes via the `cache/` folder. If updates are slow:

1. The cache may be outdated
2. Try removing cache and reprocessing:
   ```bash
   rm -rf graphify-out/cache
   /graphify . --update
   ```

## Getting More Help

1. **Check the official repository:** [github.com/Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify)
2. **Review official docs** in the repository
3. **Check Python and pip versions** to ensure compatibility

---

Still stuck? Make sure:
- Python 3.10+ is installed
- `graphify --help` works
- You have write permissions in your working directory
- Disk space is available
