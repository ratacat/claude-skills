# claude-skills

A collection of Claude Code skills and tooling for creating them from source materials (books, documentation, etc.).

## What are Claude Code Skills?

Skills are knowledge files that Claude Code automatically discovers and uses based on context. Unlike slash commands (which users invoke explicitly), skills are model-invoked — Claude reads the skill's description and activates it when relevant to your request.

Each skill lives in a folder with a `SKILL.md` file containing structured knowledge, best practices, and procedures.

## Directory Structure

```
claude-skills/
├── skills/              # Generated skills (each in its own folder)
│   └── postgres-expert/
│       └── SKILL.md
├── sources/             # Source books (gitignored - not committed)
│   └── postgres-16-internals.pdf
├── src/                 # Source code
│   ├── cli.js          # Command-line interface
│   ├── extractors/     # Text extraction (EPUB/MOBI/PDF)
│   ├── llm/            # LLM client (Gemini)
│   ├── pipeline/       # Processing pipeline stages
│   └── design/         # Requirements and design docs
└── package.json        # Node.js project config
```

## Creating Skills from Books

### Prerequisites

1. Node.js 18+
2. Google AI API key (Gemini)

### Setup

```bash
npm install
export GEMINI_API_KEY="your-api-key"
```

### Usage

```bash
# Using the make-skill command
npx make-skill <source> <name> <description>

# Example
npx make-skill sources/my-book.pdf \
    "topic-expert" \
    "Expert knowledge on topic X. Use when working with X."
```

**Arguments:**
- `<source>`: Path to book file (EPUB, PDF, MOBI)
- `<name>`: Skill name (kebab-case)
- `<description>`: Skill description (what it does + when to use it)

**Options:**
- `--output-dir <dir>`: Where to write skills (default: `skills/`)
- `--model <model>`: Model for chapter processing (default: `gemini-1.5-flash`)
- `--synthesis-model <model>`: Model for synthesis (default: `gemini-1.5-pro`)
- `--concurrency <n>`: Parallel chapter processing (default: `5`)
- `--no-save-intermediates`: Skip saving intermediate files (saved by default)

### How It Works

1. **Extract** — Pulls text from EPUB, MOBI, or PDF
2. **Propose** — (if needed) Gemini proposes 3 skill name/description options, you pick one
3. **Identify** — Analyzes structure to identify chapter boundaries
4. **Process** — Each chapter processed in parallel (extracts concepts, procedures, examples, warnings)
5. **Plan** — Reviews all extracts, decides sections/examples/emphasis for the skill
6. **Generate** — Creates the final `SKILL.md` following the plan

## Installing Skills

Copy skill folders to one of these locations:

```bash
# Personal (available in all projects)
cp -r skills/postgres-expert ~/.claude/skills/

# Project-specific
cp -r skills/postgres-expert .claude/skills/
```

Claude will automatically discover and use skills when their description matches your request.

## Writing Good Skill Descriptions

The `description` field in SKILL.md is how Claude discovers when to use a skill. Make it specific:

```yaml
# Bad - too vague
description: Helps with databases

# Good - specific triggers
description: Expert knowledge on PostgreSQL 16 internals, query optimization,
  and performance tuning. Use when working with Postgres databases, optimizing
  queries, or debugging performance issues.
```

## Existing Skills

| Skill | Description |
|-------|-------------|
| (none yet) | Run the pipeline to create your first skill |

## License

MIT
