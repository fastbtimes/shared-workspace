# Graphify Usage Guide

Learn how to use Graphify to create and query knowledge graphs.

## Basic Usage

### Running Graphify

The simplest way to run Graphify:

```bash
/graphify .
```

The dot (`.`) means "current folder". Graphify reads all files in this folder and subfolders, then generates a knowledge graph.

### Output Files

After running, you'll find a `graphify-out/` folder containing:

| File | Purpose |
|------|---------|
| **graph.html** | Interactive visualization. Open in your browser, click nodes, search, and explore connections |
| **GRAPH_REPORT.md** | Summary report with central concepts, unexpected connections, and suggested questions |
| **graph.json** | Raw graph data in JSON format. Useful for programmatic access or sharing |
| **obsidian/** | Obsidian vault version. Import into Obsidian and browse as interconnected notes |
| **cache/** | Performance cache. Enables faster re-runs when files change |

## Common Commands

### Process a Specific Folder

```bash
/graphify ./src
```

Useful when you only want to analyze a subset of your project.

### Update After Changes

```bash
/graphify ./src --update
```

Re-process only files that have changed since the last run. Much faster than a full re-scan.

### Query the Graph

```bash
/graphify query "how does authentication work?"
```

Ask a natural language question about the project. Graphify searches the knowledge graph and returns relevant findings.

### Alternative Query Syntax

```bash
/graphify ./my-project query "database schema"
```

Query a specific folder's graph.

## Workflow Examples

### Example 1: Analyze a Python Project

```bash
cd ~/projects/my-app
/graphify .
```

Then open `graphify-out/graph.html` in your browser to:
- See all modules and dependencies
- Understand the data flow
- Identify tightly coupled components
- Find unused code

### Example 2: Document a Microservice

```bash
cd ~/microservices/auth-service
/graphify ./src
/graphify ./tests
```

This creates separate graphs for source code and tests, helping you understand the service architecture and test coverage.

### Example 3: Iterative Updates During Development

```bash
# Initial analysis
/graphify .

# After implementing a feature
/graphify . --update

# Query to understand the impact
/graphify query "what changed in the auth module?"
```

### Example 4: Multi-Language Codebase

For projects with mixed languages:

```bash
/graphify ./backend    # Python/Node analysis
/graphify ./frontend   # JavaScript/TypeScript analysis
/graphify ./docs       # Documentation graph
```

Process each section separately for cleaner results.

## Understanding the Graph

### Nodes

Each node represents:
- **Code files** (Python, JavaScript, TypeScript, etc.)
- **Functions and classes**
- **Concepts** (extracted from documentation and comments)
- **Data structures**

### Edges (Connections)

Connections show:
- **Imports and dependencies**
- **Function calls**
- **Semantic relationships** (extracted from comments/docs)
- **Data flow**

### Interactive Features in graph.html

- **Click** a node to highlight its direct connections
- **Search box** to find specific files, functions, or concepts
- **Filter** by node type or relationship type
- **Zoom and pan** to navigate large graphs
- **Export** selections for documentation

## Tips and Tricks

### Faster Processing for Large Codebases

Don't process everything at once. Use focused scans:

```bash
# Instead of:
/graphify .

# Do:
/graphify ./app
/graphify ./lib
/graphify ./tests
```

### Clean Cache Between Major Refactors

If the graph seems outdated:

```bash
rm -rf graphify-out/cache
/graphify .
```

### Export Graph Data

Use the `graph.json` file for:
- Programmatic analysis
- Integration with other tools
- Sharing specific graphs
- Version control tracking

```bash
# View graph structure
cat graphify-out/graph.json | python -m json.tool
```

### Generate Reports

The `GRAPH_REPORT.md` file contains:
- Most connected concepts
- Potential architectural issues
- Suggested areas to explore
- Entry points for new developers

Review this after each analysis for insights.

## Advanced Usage

### Querying with Context

```bash
/graphify ./src query "which files handle payment processing?"
```

Graphify searches the local graph for relevant files and explanations.

### Combining Multiple Analyses

1. Run separate analyses:
   ```bash
   /graphify ./frontend
   /graphify ./backend
   ```

2. Review both `GRAPH_REPORT.md` files to understand the full architecture

3. Use this for integration planning and API contract design

### Integration with Claude Code

While editing code in Claude Code, ask Claude to:
1. Run `/graphify .` to create a graph
2. Use `/graphify query "..."` to search for specific patterns
3. Get Claude's analysis of the knowledge graph to answer questions about your codebase

## Common Patterns

### Understanding a New Codebase

```bash
/graphify .
# Opens graph.html and GRAPH_REPORT.md
# Read the report first, then explore the interactive graph
```

### Refactoring a Module

```bash
/graphify ./module-to-refactor
# Review all connections to understand dependencies
# Plan refactor based on connection strength
/graphify ./module-to-refactor --update
# Verify refactoring reduced complexity
```

### Onboarding New Team Members

1. Create a graph of the main codebase
2. Share `graphify-out/obsidian/` as an Obsidian vault
3. Team members can explore at their own pace

### Code Review Preparation

```bash
/graphify . --update
# After merging a branch, review what changed
/graphify query "what's the impact of the recent auth changes?"
```

## Supported File Types

Graphify analyzes:
- **Code:** `.py`, `.js`, `.ts`, `.java`, `.go`, `.rs`, `.cpp`, `.c`, `.rb`, `.php`, and many more
- **Documentation:** `.md`, `.rst`, `.txt`
- **Data:** `.json`, `.yaml`, `.yml`, `.toml`, `.xml`
- **Images:** `.jpg`, `.png`, `.gif` (uses OCR/visual analysis)
- **Documents:** `.pdf` (extracts text)

Graphify skips:
- Hidden files (starting with `.`)
- `node_modules/`, `venv/`, `.git/`, `__pycache__/` and similar
- Binary files (executables, compiled code)

## Next Steps

- Explore the interactive graph in `graphify-out/graph.html`
- Review the analysis in `GRAPH_REPORT.md`
- Try querying with `/graphify query "..."`
- For issues, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

For more information, visit the [official Graphify repository](https://github.com/Graphify-Labs/graphify).
