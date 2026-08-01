# Graphify Installation Guide

Complete step-by-step instructions for installing Graphify.

## Prerequisites

Before you begin, ensure you have:

- **Claude Code** installed — visit [claude.ai/code](https://claude.ai/code)
- **Python 3.10 or higher** installed on your system

Check your Python version:

```bash
python --version
```

## Installation Methods

### Method 1: Automatic Installation (Recommended)

This is the fastest and easiest method. Open your terminal and run:

```bash
pip install graphifyy && graphify install
```

**Important:** The PyPI package is named `graphifyy` (with two "y"s) temporarily. This is a temporary measure until the `graphify` name is released. The command you'll use is still just `graphify`.

#### Verification

After installation, verify everything works:

```bash
graphify --help
```

You should see a list of available commands. If you see this, installation was successful!

### Method 2: Using pipx (Recommended for macOS)

If you encounter permission issues or the `externally-managed-environment` error, use `pipx` instead:

```bash
pipx install graphifyy
```

`pipx` handles environment setup automatically and avoids permission conflicts.

### Method 3: Manual Installation

Only use this method if the above methods don't work on your system.

```bash
mkdir -p ~/.claude/skills/graphify
curl -fsSL https://raw.githubusercontent.com/safishamsi/graphify/v1/skills/graphify/skill.md \
  > ~/.claude/skills/graphify/SKILL.md
```

Then add these lines to your `~/.claude/CLAUDE.md` file:

```markdown
- **graphify** (`~/.claude/skills/graphify/SKILL.md`) - any input to knowledge graph. Trigger: `/graphify`
When the user types `/graphify`, invoke the Skill tool with `skill: "graphify"` before doing anything else.
```

Create the file if it doesn't exist.

## Platform-Specific Notes

### Windows

If you get an error like `"graphify" is not recognized as an internal or external command`:

1. **Option A:** Add Python's Scripts folder to your PATH:
   - Find your Python installation folder
   - Add `%APPDATA%\Python\Python3xx\Scripts` to your PATH (replace `3xx` with your version, e.g., `313`)
   - Restart your terminal

2. **Option B (Easier):** Use `pipx` instead:
   ```bash
   pipx install graphifyy
   ```

### macOS

If you get an `externally-managed-environment` error:

```bash
pipx install graphifyy
```

This bypasses Python's environment restrictions.

### Linux

Linux typically handles Python packages smoothly:

```bash
pip install graphifyy && graphify install
```

If you have permission issues, use `pipx`:

```bash
pipx install graphifyy
```

## Post-Installation

### 1. Verify Installation

```bash
graphify --help
```

### 2. Configure Claude Code

Graphify works as a skill within Claude Code. No additional configuration is needed if you used the automatic installer.

For manual installations, ensure your `~/.claude/CLAUDE.md` file contains the graphify skill registration.

### 3. First Run

Navigate to any folder with code or documentation and run:

```bash
/graphify .
```

This generates a knowledge graph of everything in that folder.

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for solutions to common issues.

## What's Next?

- Read [USAGE.md](./USAGE.md) to learn how to use Graphify
- Check out the [official repository](https://github.com/Graphify-Labs/graphify) for advanced features
