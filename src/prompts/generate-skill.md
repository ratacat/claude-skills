# Skill Generation Prompt

You are writing a SKILL.md file for Claude Code based on synthesized book content.

## Task

Transform the synthesis document into a polished Claude Code skill that developers can immediately use.

## Skill Information

**Name:** {SKILL_NAME}
**Description:** {SKILL_DESCRIPTION}
**Source Book:** {BOOK_TITLE}

## Synthesized Content

{SYNTHESIS}

## SKILL.md Format

Create a skill file with this structure:

```markdown
---
name: {SKILL_NAME}
description: {SKILL_DESCRIPTION}
location: user
---

# {Skill Title}

[Brief introduction - 2-3 sentences about what this skill covers]

## Core Concepts

[Essential concepts developers need to understand]

## Quick Reference

[Tables, checklists, or bulleted lists for fast lookup]

## Procedures

[Step-by-step workflows organized by task]

## Rules and Best Practices

[Do this, not that - organized by category]

## Common Pitfalls

[Warnings, anti-patterns, gotchas]

## Code Examples

[Concrete examples with explanations]

## Decision Frameworks

[When to use X vs Y]

## Advanced Topics

[More complex or less common scenarios]
```

## Writing Guidelines

### 1. Frontmatter

The YAML frontmatter must include:
- `name`: Exact skill name in kebab-case
- `description`: Must include BOTH what the skill does AND when to use it
- `location`: Always "user"

### 2. Structure

- Use markdown headers (##, ###) for organization
- Keep sections focused and scannable
- Use bullets, numbered lists, and tables liberally
- Break up long sections with subheaders

### 3. Tone and Style

- Direct and practical
- Imperative voice for instructions ("Use X", "Avoid Y")
- Present tense for facts
- No fluff, motivation, or philosophy
- Assume reader is a competent developer

### 4. Content Density

- Every paragraph should be actionable
- Prefer lists over prose
- Use tables for comparisons and reference material
- Keep examples concrete and realistic

### 5. Code Examples

- Include actual code, not pseudocode
- Show before/after for improvements
- Add language identifiers to code blocks
- Keep examples short but complete
- Add brief explanation of what the code demonstrates

### 6. Organization

- Most important/frequently used info first
- Group related items together
- Progressive disclosure (basic → advanced)
- Cross-reference related sections when helpful

### 7. Formatting

Good formatting:
```markdown
## Database Indexes

### When to Add Indexes

Add indexes when:
- Column appears in WHERE clauses frequently
- Column is used in JOIN conditions
- Column is used in ORDER BY

### Index Types

| Type | Use Case | Trade-off |
|------|----------|-----------|
| B-tree | General purpose | Write overhead |
| Hash | Exact matches | No range queries |
```

Bad formatting:
```markdown
Indexes are important for database performance. There are many types of indexes
that you can use depending on your needs. B-tree indexes are the most common
type and work well in most situations...
```

### 8. Length Target

- Aim for 500-2000 lines of markdown
- Dense with information, not padded
- Comprehensive but scannable
- Quality over quantity

## What to Include

From the synthesis, extract and format:

✓ All core concepts and definitions
✓ All procedures and workflows
✓ All rules and principles
✓ All warnings and anti-patterns
✓ All decision frameworks (when X, do Y)
✓ Best code examples
✓ Quick reference tables/checklists
✓ Cross-references between related topics

## What to Exclude

✗ Philosophical discussion
✗ Historical context (unless directly relevant to decisions)
✗ Motivation or pep talks
✗ "Why this book is great" content
✗ Redundant examples (pick the best one)
✗ Vague principles without concrete guidance

## Example Section

Good example:

```markdown
## Connection Pooling

### Overview

Connection pools maintain a cache of database connections that can be reused,
avoiding the overhead of establishing new connections.

### When to Use

- Web applications with frequent database access
- Applications with concurrent users
- Any scenario where connection setup cost is significant

### Configuration

| Parameter | Recommended | Reasoning |
|-----------|-------------|-----------|
| Pool size | 10-50 | Depends on concurrent load |
| Max wait time | 5 seconds | Fail fast if pool exhausted |
| Idle timeout | 10 minutes | Balance reuse vs resource usage |

### Example

\`\`\`python
# Good - use connection pool
from sqlalchemy import create_engine, pool

engine = create_engine(
    'postgresql://localhost/db',
    poolclass=pool.QueuePool,
    pool_size=20,
    max_overflow=10
)

with engine.connect() as conn:
    result = conn.execute("SELECT * FROM users")
\`\`\`

### Common Mistakes

- Pool too small → connections exhausted under load
- Pool too large → unnecessary resource consumption
- No max wait time → requests hang indefinitely
```

## Output

Return ONLY the complete SKILL.md file. No preamble, no explanation, just the markdown.

Start with the frontmatter YAML block, then the content.
