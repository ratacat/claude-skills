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
└── tools/               # Processing pipeline
    ├── process_book.py  # Main entry point
    ├── extractors.py    # EPUB/MOBI/PDF text extraction
    ├── gemini.py        # Gemini API for processing
    └── requirements.txt
```

## Creating Skills from Books

### Prerequisites

1. Python 3.10+
2. Google AI API key (Gemini)
3. Optional: Calibre (for MOBI/AZW support)

### Setup

```bash
cd tools
pip install -r requirements.txt
export GEMINI_API_KEY="your-api-key"

# Optional: Install Calibre for MOBI support
brew install calibre
```

### Usage

```bash
python tools/process_book.py sources/my-book.pdf \
    --skill-name "topic-expert" \
    --description "Expert knowledge on topic X. Use when working with X or when the user asks about X."
```

**Options:**
- `--model`: Gemini model for chapter processing (default: `gemini-2.5-flash-preview-05-06`)
- `--synthesis-model`: Model for final synthesis (default: `gemini-2.5-pro-preview-05-06`)
- `--save-intermediates`: Save chapter extracts as JSON for debugging
- `--output-dir`: Where to write skills (default: `skills/`)

### How It Works

1. **Extract** — Pulls text from EPUB, MOBI, or PDF
2. **Chunk** — Sends to Gemini to identify chapter boundaries
3. **Process** — Each chapter processed separately (extracts concepts, procedures, best practices, warnings)
4. **Plan** — Reviews all extracts, decides what sections/examples/warnings the skill should have
5. **Generate** — Creates the final `SKILL.md` following the plan

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
