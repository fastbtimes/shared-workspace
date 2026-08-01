# Graphify Quick Reference

A cheat sheet for common Graphify commands and workflows.

## Installation (1 minute)

```bash
pip install graphifyy && graphify install
```

Verify:
```bash
graphify --help
```

**On macOS with errors?** Use `pipx install graphifyy` instead.

---

## Quick Start (Claude Code)

```bash
/graphify .
```

Opens `graphify-out/graph.html` in your browser.

---

## Essential Commands

| Command | What it does |
|---------|-------------|
| `/graphify .` | Create graph from current folder |
| `/graphify ./path` | Create graph from specific folder |
| `/graphify . --update` | Update graph (only changed files) |
| `/graphify query "question"` | Ask the graph a question |
| `graphify --help` | Show all CLI options |

---

## Output Files

After running:

```
graphify-out/
├── graph.html           ← Open this in browser
├── GRAPH_REPORT.md      ← Read this for summary
├── graph.json           ← Raw data
├── obsidian/            ← Obsidian vault
└── cache/               ← Performance cache
```

---

## Common Workflows

### Analyze a Project
```bash
cd ~/my-project
/graphify .
```

### Update After Changes
```bash
/graphify . --update
```

### Ask a Question
```bash
/graphify query "how does authentication work?"
```

### Analyze Multiple Folders
```bash
/graphify ./src
/graphify ./tests
```

---

## In the Browser (graph.html)

- **Click** a node → see connections
- **Search** → find files/concepts
- **Filter** → by type or relationship
- **Pan/Zoom** → explore the graph

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Command not found | Close/reopen terminal, or use `pipx install graphifyy` |
| Python too old | Install Python 3.10+ from [python.org](https://python.org) |
| Permission error (macOS) | Use `pipx install graphifyy` |
| No output files | Check you have write permissions in the folder |

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more help.

---

## File Types Supported

✅ Code: `.py` `.js` `.ts` `.java` `.go` `.rs` `.cpp`  
✅ Docs: `.md` `.pdf` `.txt`  
✅ Config: `.json` `.yaml` `.toml` `.xml`  
✅ Images: `.jpg` `.png` (with OCR)  

❌ Skipped: Hidden files, `node_modules/`, `.git/`, binaries

---

## Tips

- **First run slow?** Normal. Use `--update` next time for speed.
- **Large codebase?** Process folder by folder for better results.
- **Need help?** Check [USAGE.md](./USAGE.md) for detailed guide.

---

## Documentation

- [README.md](./README.md) — Overview and setup
- [INSTALLATION.md](./INSTALLATION.md) — Detailed install guide
- [USAGE.md](./USAGE.md) — Complete usage guide
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) — Problem solving
- [Official Repo](https://github.com/Graphify-Labs/graphify) — Latest features

---

**Next step:** Run `/graphify .` and open the `graph.html` file!
