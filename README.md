# Graphify Installation Guide

A comprehensive guide for installing and using Graphify, a Claude Code skill that transforms code, PDFs, markdown, and screenshots into a queryable knowledge graph.

## What is Graphify?

**Graphify** is a skill for Claude Code that reads a folder (code, PDFs, markdown, screenshots) and transforms everything into a consultable knowledge graph.

- **Official Repository:** [github.com/Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify)
- **Trigger Command:** `/graphify`

## Quick Start

### Prerequisites

- **Claude Code** — [claude.ai/code](https://claude.ai/code)
- **Python 3.10 or higher**

### Installation

```bash
pip install graphifyy && graphify install
```

> **Note:** The PyPI package is called `graphifyy` (with two "y"s) temporarily until the `graphify` name is released. You'll still use the `graphify` command.

### Verify Installation

```bash
graphify --help
```

If you see the command list, installation was successful.

### Use in Claude Code

Open Claude Code in any folder and type:

```
/graphify .
```

The dot means "current folder". It will read the files and generate a `graphify-out/` folder with the knowledge graph.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **Windows:** "graphify is not recognized" | Add Python's Scripts folder to PATH: `%APPDATA%\Python\Python3xx\Scripts` (replace `3xx` with your version, e.g., `313`). Or use `pipx install graphifyy`, which handles PATH automatically. |
| **macOS:** `externally-managed-environment` error | Use `pipx install graphifyy` instead of `pip install`. |
| Command doesn't appear after installing | Close and reopen your terminal. |

## Manual Installation (Alternative)

Only use if the above method doesn't work. Download the skill directly from the repository:

```bash
mkdir -p ~/.claude/skills/graphify
curl -fsSL https://raw.githubusercontent.com/safishamsi/graphify/v1/skills/graphify/skill.md \
  > ~/.claude/skills/graphify/SKILL.md
```

Then add these lines to your `~/.claude/CLAUDE.md`:

```
- **graphify** (`~/.claude/skills/graphify/SKILL.md`) - any input to knowledge graph. Trigger: `/graphify`
When the user types `/graphify`, invoke the Skill tool with `skill: "graphify"` before doing anything else.
```

## Output Files

After running Graphify, a `graphify-out/` folder is created with:

| File | Contents |
|------|----------|
| `graph.html` | Interactive graph — open in browser, click nodes, search and filter |
| `GRAPH_REPORT.md` | Report with central concepts, unexpected connections, and suggested questions |
| `graph.json` | Saved graph — can query weeks later without reprocessing |
| `obsidian/` | Version that opens as a vault in Obsidian |
| `cache/` | Cache — next runs only process what changed |

## Daily Commands

```bash
/graphify                      # Run on current folder
/graphify ./my-folder          # Run on specific folder
/graphify ./folder --update    # Reprocess only changed files
/graphify query "your question about the project"
```

## Learn More

- [Official Graphify Repository](https://github.com/Graphify-Labs/graphify)
- [Claude Code Documentation](https://claude.ai/code)
