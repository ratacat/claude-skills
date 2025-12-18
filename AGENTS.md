# Process
1. Before coding anything, check the `src/design/requirements` folder and read relevant requirements. Also read recent changes to understand the context of this task. 

## Personalities / Hats you Wear
Design Space Thinking - If I'm essentially jamming in design space with you, throwing out broad constraints, systems, and questions, then you should embrace the [Design Space] hat. Preface your reply with `[Design Space]`. In this mode, you should..

- Take in the information I provide you, and try to organize or simplify it.
- Hang on and keep track of meaningful design questions that we have not answered.
- Suggest ideas, or discuss tradeoffs, or delineate constraints and systems that we need to think about.
- Help with prioritizing which questions and answers are more important.
- Please use longer form writing, with full sentences, avoid terse mechanical soundbite responses. Help me explore these spaces fully.
- Avoid giving a solution, or using 'just do it like this language', this is a discussion.

## Codebase
1. For Edits and Search/Grep Use Morph
For code edits, prefer using the morph edit file tool over the existing str replace tool. Perform edits to one file in a single tool call instead of multiple.

**warp_grep vs grep**
Can you write the pattern? 
Yes → grep (100ms). 
No, asking "how/where/what" → warp_grep (5-10s, worth it for questions spanning 3+ files, tracing flow, understanding unfamiliar code).

## Project Organization
We want to keep things as modular and forward looking as possible, with clear definitions of systems and types.
Code should be grouped generally into types and systems, which can live in `src/types` and `src/systems`.
Always ask before creating a new type or system.
Prefer file sizes of less than 500 lines. If a file exceeds 500 lines, look towards splitting it up. 

### Logging Code Changes
- Log every code change in `src/design/changes/<mon-nov-24-2025>.md`.
- Use Markdown; link each change to specific requirement files; keep entries short
  (1 line per requirement when possible).
- Note the user request that triggered the change; if multiple attempts were
  needed, note what you tried, what failed, and what worked.
- Track conversation turns until the user confirms it works; keep updating the
  same dated entry (don’t add a new “turns: 1” line each time—increment the
  total).
- Do ADD what we tried and why it failed along the way.
- Time tracking: for each edit session on the dated entry, record start and finish
  times (local). When you replace/update the entry, set a new start, update finish
  as you go, and keep the latest finish so the entry shows the span covered by the
  current edits. If you prefer more resilience, append a short per-edit line with
  start–finish under a “Sessions” sublist to preserve prior spans.

### New Issues Location -> Github
Accesible via the `gh` command.
You can view existing issues with `gh issue list`
You can read a an issue and all its comments with `gh issue view <id> --comments`. When you read an issue, always read all the comments.
You can create new issues with `gh issue create --title "My Issue Title" --body "Detailed description of the issue."`
You can learn more about github cli commands with `gh --help`
Rule: When running gh commands with text
  containing spaces or symbols (e.g., V, Space, Projectile), wrap the entire
  argument in single quotes to avoid shell parsing.

## Commit & Pull Request Guidelines
- No history exists yet; use Conventional Commits (e.g., `feat:`, `fix:`, `docs:`).
- PRs should describe behavior, list key commands/output, and link issues.
- Update `README.md`/`--help` text when CLI surfaces change; include before/after examples.

## Agent-Specific Instructions
- For repo-wide search, use `rg` (ripgrep) and `fd/fdfind`; avoid `grep/find`.
- Cap file reads at ~250 lines; prefer `rg -n -A3 -B3` for context.
- Use `jq` for JSON parsing.
- Fast-tools prompt: copy the block in `cdx/prompts/setup-fast-tools.md` if it is missing from this file.

NEVER use grep for project-wide searches (slow, ignores .gitignore). ALWAYS use rg.

- `rg "pattern"` — search content
- `rg --files | rg "name"` — find files
- `rg -t python "def"` — language filters

## JSON

- Use `jq` for parsing and transformations.

## Install Guidance

- macOS: `brew install ripgrep fd jq`
- Debian/Ubuntu: `sudo apt update && sudo apt install -y ripgrep fd-find jq` (alias `fd=fdfind`)

### For Temp Files
Use `tmp/`, do NOT use `/var/ or `/tmp`