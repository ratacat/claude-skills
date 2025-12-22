# Claude Skills

A curated collection of skills for [Claude Code](https://docs.anthropic.com/en/docs/claude-code)—reusable knowledge that Claude automatically applies when relevant.

| Skill | Description |
|-------|-------------|
| **[annas-archive-ebooks](#annas-archive-ebooks)** | Search and download ebooks from Anna's Archive |
| **[assembly-ai-streaming](#assembly-ai-streaming)** | Real-time speech-to-text and voice agent development |
| **[clean-code](#clean-code)** | Write readable, maintainable code (Robert C. Martin) |
| **[design-patterns](#design-patterns)** | GoF and enterprise architecture patterns |
| **[documentation-scraper](#documentation-scraper)** | Scrape docs sites into markdown for AI context |
| **[ebook-extractor](#ebook-extractor)** | Extract text from EPUB, MOBI, and PDF files |
| **[kalshi-prediction-market](#kalshi-prediction-market)** | Prediction market mechanics and Kalshi API |
| **[medium-paywall-bypass](#medium-paywall-bypass)** | Read paywalled Medium articles |
| **[modern-web-app-architecture](#modern-web-app-architecture)** | SPA/SSR/SSG architecture decisions |
| **[postgres-query-expert](#postgres-query-expert)** | PostgreSQL 16 queries and optimization |
| **[systematic-debugging](#systematic-debugging)** | Root-cause debugging methodology |
| **[web-interface-design](#web-interface-design)** | UI design: forms, buttons, layouts, color |
| **[writing-claude-skills](#writing-claude-skills)** | Create effective Claude Code skills |

---

### annas-archive-ebooks

**Search and download ebooks from Anna's Archive**

Search millions of books across formats (PDF, EPUB, MOBI, etc.) and download them using the fast download API.

**Features:**
- Search by title, author, or both
- Filter by format (PDF, EPUB, MOBI, AZW3, DJVU)
- Sort by year to get most recent editions
- Verify search results match expected title
- Download via fast API

**Requirements:**
- `ANNAS_ARCHIVE_KEY` environment variable (requires Anna's Archive membership)

**Usage:**
```bash
python3 annas.py search "Clean Code Robert Martin" --format pdf
python3 annas.py download <md5> --output ./books/
```

---

### assembly-ai-streaming

**AssemblyAI Speech-to-Text and streaming transcription**

Work with AssemblyAI's Speech-to-Text and LLM Gateway APIs, especially for streaming/live transcription, meeting notetakers, and voice agents.

**Covers:**
- Real-time streaming transcription
- Meeting notetaker integration
- Voice agent development
- LLM Gateway API usage
- Low-latency audio analysis

---

### clean-code

**Write readable, maintainable code (based on Robert C. Martin)**

Apply Clean Code principles when writing, reviewing, or refactoring code. Covers naming, functions, classes, error handling, and tests.

**Key Principles:**
- Names should reveal intent
- Functions should do one thing
- Classes should have single responsibility
- Handle errors explicitly, don't return null
- Tests should be fast, independent, and readable

**Chapter References:**
- `chapters/names.md` — Naming conventions
- `chapters/functions.md` — Function design
- `chapters/classes.md` — Class structure
- `chapters/comments.md` — When (not) to comment
- `chapters/error-handling.md` — Exception patterns
- `chapters/objects-and-data.md` — Data structures vs objects
- `chapters/tests.md` — Test design

---

### documentation-scraper

**Scrape documentation sites into markdown for AI context**

Use slurp-ai to download and compile documentation websites into a single markdown file optimized for AI agent consumption.

**Workflow:**
1. Analyze sitemap first (`node analyze-sitemap.js <url>`)
2. Review page counts and section structure
3. Run slurp with informed `--base-path` and `--max` parameters

**Features:**
- Sitemap analyzer script for pre-scrape reconnaissance
- Guidance on scoping large documentation sites
- CLI reference for slurp-ai options

**Requirements:**
- Node.js v20+
- `npm install -g slurp-ai`

---

### design-patterns

**GoF and enterprise architecture patterns**

Proven solutions to recurring software design problems. Use when designing architecture, refactoring, or when code shows symptoms like tight coupling or scattered responsibilities.

**Pattern Categories:**

| Category | Patterns |
|----------|----------|
| **Creational** | Factory, Builder |
| **Structural** | Adapter, Composite, Decorator, Facade, Proxy |
| **Behavioral** | Chain of Responsibility, Command, Mediator, Observer, State, Strategy, Template Method |
| **Enterprise** | Repository, Service Layer, Unit of Work, Identity Map, Lazy Load, DTO |

Each pattern includes: intent, problem it solves, structure, implementation guidance, and real-world examples.

---

### ebook-extractor

**Extract text from EPUB, MOBI, and PDF files**

Convert ebooks to plain text for analysis, processing, or reading. Pure Python extraction—no LLM calls.

**Supported Formats:**

| Format | Tool | Notes |
|--------|------|-------|
| EPUB | `ebooklib` + BeautifulSoup | Direct parsing |
| MOBI | Calibre `ebook-convert` | Converts to EPUB first |
| PDF | PyMuPDF (fitz) | Fast, handles most PDFs |

**Usage:**
```bash
# Setup (one-time)
./setup.sh

# Extract
python3 scripts/extract.py input.epub output.txt
python3 scripts/extract.py input.pdf output.txt
```

---

### kalshi-prediction-market

**Kalshi prediction market domain knowledge**

Understand Kalshi's prediction markets—binary event contracts, pricing, order books, and API integration.

**Covers:**
- Binary contract mechanics (Yes/No outcomes, $0-$1 settlement)
- Price interpretation as implied probability
- Order book structure (bids, asks, spread)
- Data hierarchy: Series → Events → Markets
- REST API and WebSocket integration
- Authentication headers (`KALSHI-ACCESS-KEY`, etc.)

---

### medium-paywall-bypass

**Read paywalled Medium articles**

Fetch full content from paywalled Medium articles using free mirror services.

**Services (in priority order):**
1. **Freedium** — Best option, returns content directly
2. **Archive.today** — May require captcha
3. **RemovePaywalls** — Redirect page only

**Usage:**
```
Give Claude a Medium URL → skill automatically fetches via Freedium
```

Works with Medium-hosted publications: towardsdatascience.com, betterprogramming.pub, levelup.gitconnected.com, etc.

---

### postgres-query-expert

**PostgreSQL 16 query construction and optimization**

Comprehensive reference for PostgreSQL—query construction, optimization, schema management, and system introspection.

**Covers:**
- Standard and advanced SQL (CTEs, window functions, LATERAL joins)
- Query optimization and EXPLAIN analysis
- Index strategies (B-tree, GIN, GiST, BRIN)
- Schema management and migrations
- System catalog introspection
- JSON/JSONB operations
- Full-text search

**Best Practices:**
- Always use parameterized queries (`$1`, `$2`)
- Set statement timeouts for exploratory queries
- Use explicit transactions for multi-step operations

---

### systematic-debugging

**Root-cause debugging methodology**

A disciplined approach to debugging that finds root causes before attempting fixes. Prevents random patches that mask underlying issues.

**Core Process:**
1. Reproduce the issue reliably
2. Form hypotheses about cause
3. Gather evidence systematically
4. Find root cause (not just symptoms)
5. Fix and verify

**Includes:**
- `condition-based-waiting.md` — Fix flaky async tests
- `defense-in-depth.md` — Layered error prevention
- `root-cause-tracing.md` — Systematic investigation
- `find-polluter.sh` — Find test pollution sources

**Iron Law:** No fixes without root cause investigation first.

---

### modern-web-app-architecture

**Design modern JavaScript/TypeScript web applications**

Comprehensive guidance for SPA/SSR/SSG/ISR/RSC architecture decisions, state management, performance, and team scaling.

**Covers:**
- Rendering strategy selection (CSR vs SSR vs SSG vs ISR vs RSC)
- State management patterns (local, global, server state)
- Component patterns (Container/Presentational, Compound, Hooks)
- Performance budgets and Core Web Vitals optimization
- Micro-frontends for large teams
- Security, accessibility, testing strategies

**Reference Files:**
- React patterns, SPA fundamentals, micro-frontends
- Performance, security, accessibility, testing
- Architecture decisions and trade-offs

---

### web-interface-design

**Design effective web UI (forms, buttons, layouts, colors)**

Apply interface design principles when building or reviewing web UI. Covers typography, forms, buttons, color systems, layouts, and accessibility.

**Key Principles:**
- Design exists to separate primary from secondary
- Users should instantly recognize what matters
- Good interface design is invisible

**Reference Files:**
- `typography.md` — Font sizes, line spacing, vertical rhythm
- `forms-and-inputs.md` — Validation, labels, touch targets
- `buttons.md` — Hierarchy, states, CTAs
- `color-systems.md` — Palettes, dark mode, tints/shades
- `layout-and-spacing.md` — Grids, spacing scales, responsive
- `visual-hierarchy.md` — Focus techniques, action pyramid
- `accessibility.md` — Contrast, focus states, WCAG

**Sources:** Web Interface Handbook, Refactoring UI, WCAG 2.1

---

### writing-claude-skills

**Create effective Claude Code skills**

Test-Driven Development applied to process documentation. Write skills that actually change agent behavior.

**Process:**
1. **RED** — Run scenario without skill, document baseline failures
2. **GREEN** — Write minimal skill addressing those failures
3. **REFACTOR** — Close loopholes found in testing

**Covers:**
- Skill structure and YAML frontmatter
- Claude Search Optimization (CSO) for discovery
- Testing skills with pressure scenarios
- Bulletproofing against rationalization
- Flowchart and code example conventions

**Key Insight:** If you didn't watch an agent fail without the skill, you don't know if the skill teaches the right thing.

---

## Installation

### Quick Start (Recommended)

```bash
git clone https://github.com/jaredsmith/claude-skills.git ~/claude-skills
ln -s ~/claude-skills/skills ~/.claude/skills
```

Update later with `cd ~/claude-skills && git pull`

### Fork First

If you want to add your own skills:

1. Fork this repo
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/claude-skills.git ~/claude-skills`
3. Symlink: `ln -s ~/claude-skills/skills ~/.claude/skills`

### Copy Individual Skills

```bash
cp -r skills/clean-code ~/.claude/skills/
```

---

## What Are Skills?

Skills are knowledge files that Claude Code automatically discovers and uses based on context. Unlike slash commands (which you invoke explicitly), skills are model-invoked—Claude reads the skill's description and activates it when relevant.

Each skill lives in a folder with a `SKILL.md` file containing structured knowledge, best practices, and procedures.

---

## License

MIT
