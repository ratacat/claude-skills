# Synthesis Prompt

You are synthesizing chapter extracts from a technical book into a cohesive narrative for a Claude Code skill.

## Task

Review all chapter extracts and create a synthesized text that:
1. Removes duplicate information across chapters
2. Identifies and emphasizes recurring themes
3. Organizes information logically (not just chapter-by-chapter)
4. Preserves all unique actionable content
5. Connects related concepts from different chapters

## Book Information

**Title:** {BOOK_TITLE}
**Skill Name:** {SKILL_NAME}
**Skill Description:** {SKILL_DESCRIPTION}

## Chapter Extracts

{CHAPTER_EXTRACTS}

## Synthesis Guidelines

### 1. Identify Patterns

Look across all chapters for:
- **Recurring concepts**: Same concept explained in multiple chapters
- **Complementary information**: Different chapters adding details to the same topic
- **Progressive concepts**: Basic → intermediate → advanced coverage
- **Related procedures**: Procedures that build on each other

### 2. Organize Logically

Group information by theme, not by chapter:
- **Core Concepts**: Fundamental ideas that appear throughout
- **Practical Procedures**: Step-by-step workflows organized by task
- **Decision Frameworks**: When to use X vs Y, organized by decision type
- **Common Pitfalls**: All warnings and anti-patterns together
- **Examples**: Best examples for each major concept

### 3. Handle Duplicates

When the same information appears in multiple chapters:
- Keep the most detailed/complete version
- Merge complementary details
- Note if it's emphasized repeatedly (= important)

### 4. Preserve Specificity

DO NOT lose:
- Specific code examples
- Exact procedures with steps
- Concrete rules and guidelines
- Character limits and constraints
- Before/after comparisons

### 5. Connect Cross-Chapter Concepts

When concepts relate across chapters:
- Explicitly connect them (e.g., "This builds on the connection pooling concept...")
- Show progression (e.g., "After understanding X, Y becomes...")
- Note prerequisites (e.g., "Before using this pattern, ensure...")

## Output Format

Return a structured markdown document with these sections:

```markdown
# Synthesis

## Core Concepts and Mental Models

[Synthesized concepts from all chapters, organized thematically]

## Terminology

[All important terms, deduplicated, with definitions]

## Rules and Principles

[All rules, organized by category, importance ranked]

## Procedures and Workflows

[All procedures, organized by task type]

## Warnings and Anti-patterns

[All warnings, grouped by category]

## Examples

[Best examples for each major topic]

## Decision Frameworks

[When to use X vs Y, organized by decision type]

## Prerequisites and Context

[What you need to know first, when to apply this knowledge]
```

## Important Guidelines

1. **Preserve actionability**: Every section should be immediately useful
2. **Maintain specificity**: Don't abstract away concrete details
3. **Show connections**: Make cross-references explicit
4. **Rank importance**: Critical information first, nice-to-have last
5. **Keep code**: Include actual code snippets, not descriptions
6. **Be concise**: Remove fluff, but keep all substance
7. **Logical flow**: Reader should be able to follow top-to-bottom

## What NOT to Do

- Don't just concatenate chapter extracts
- Don't lose specific examples in favor of general descriptions
- Don't create new information not in the extracts
- Don't organize strictly by chapter order if themes cut across chapters
- Don't editorialize or add motivation

## Output

Return ONLY the markdown synthesis document. No preamble, no explanation.
