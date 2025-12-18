# Chapter Extraction Prompt

## System Context

You are analyzing a chapter from a technical book to extract actionable knowledge. Your goal is to surface useful, practical information in a structured way.

Focus on substance over form. Extract what's genuinely valuable, not what fits a template.

## Instructions

Answer the following questions about this chapter. Be flexible with quantities - extract as much or as little as makes sense for this specific chapter.

---

### 1. Concepts

**Question:** What are the key concepts from this chapter?

**Definition:** Concepts are **broad, generalized, abstract ideas** - mental models, frameworks, principles, or ways of thinking about problems.

**Format:** Array of objects, each with:
- `concept`: Rich description of the concept (2-4 sentences explaining what it is)
- `scope`: What this concept covers or applies to
- `when_relevant`: When/why this concept matters
- `examples`: Array of concrete examples that illustrate the concept (optional)

**Guidelines:**
- Include as many concepts as are genuinely important to the chapter (no artificial limits)
- Make descriptions rich and self-contained
- Examples should be illustrative, not exhaustive
- Keep examples language-agnostic when possible

**Example:**
```json
[
  {
    "concept": "Dependency Inversion is the principle that high-level modules should not depend on low-level modules; both should depend on abstractions. This inverts the traditional dependency structure and makes systems more flexible and testable.",
    "scope": "System architecture, module design, class relationships",
    "when_relevant": "When designing systems that need to be flexible, testable, or when low-level implementation details change frequently",
    "examples": [
      "Instead of a ReportGenerator depending directly on MySQLDatabase, both depend on a Database interface",
      "A payment processor that works with any payment gateway through a common interface"
    ]
  },
  {
    "concept": "Separation of Concerns means dividing a program into distinct sections where each section addresses a separate concern. A concern is a set of information that affects the code of a program.",
    "scope": "Code organization, module boundaries, system architecture",
    "when_relevant": "When code becomes difficult to understand or maintain due to mixed responsibilities",
    "examples": [
      "Separating data access logic from business logic from presentation logic",
      "Keeping validation rules separate from data transformation logic"
    ]
  }
]
```

---

### 2. Terminology

**Question:** What key terms or concepts are defined in this chapter?

**Format:** Array of objects, each with:
- `term`: The term or concept name
- `definition`: Clear definition (1-2 sentences)
- `when_relevant`: When/where this term matters (optional)

**Guidelines:**
- Include as many terms as are important to understanding the chapter
- Only include terms that are:
  - Newly defined or clarified in this chapter
  - Central to understanding the material
  - Likely to appear in developer discussions

**Example:**
```json
[
  {
    "term": "Technical Debt",
    "definition": "The implied cost of additional rework caused by choosing an easy solution now instead of a better approach that would take longer.",
    "when_relevant": "When making tradeoff decisions between speed and code quality"
  },
  {
    "term": "Code Smell",
    "definition": "A surface indication that usually corresponds to a deeper problem in the system. Not a bug, but a weakness in design.",
    "when_relevant": "During code reviews or refactoring sessions"
  }
]
```

---

### 3. Rules

**Question:** What are the specific, actionable rules or directives from this chapter?

**Definition:** Rules are **specific, actionable directives** - things you should do or avoid doing. More concrete than concepts.

**Format:** Array of objects, each with:
- `rule`: The specific directive (imperative form)
- `reasoning`: Why follow this rule (the underlying logic)
- `importance`: One of: "critical", "important", "nice-to-have"

**Guidelines:**
- Include as many rules as are presented in the chapter
- Rules should be specific enough to act on
- Reasoning should explain the "why", not just restate the rule
- Mark as "critical" only if violation leads to serious problems

**Example:**
```json
[
  {
    "rule": "Functions should do one thing, do it well, and do it only",
    "reasoning": "Functions that do multiple things are harder to name, test, and reuse. They're also more likely to need modification when requirements change.",
    "importance": "important"
  },
  {
    "rule": "Never pass null as an argument to a function",
    "reasoning": "Passing null requires the callee to check for null, spreading defensive code throughout the system. It also makes the contract between caller and callee ambiguous.",
    "importance": "critical"
  },
  {
    "rule": "Prefer exceptions to returning error codes",
    "reasoning": "Error codes clutter the caller with immediate error handling and make the happy path harder to see. Exceptions separate error handling from the main logic.",
    "importance": "important"
  }
]
```

---

## Output Format

Return a **single valid JSON object** with all sections:

```json
{
  "chapter_title": "string",
  "concepts": [...],
  "terminology": [...],
  "rules": [...]
}
```

## Important Guidelines

1. **Flexible quantities**: Extract as many items as make sense for this chapter
   - A chapter might have 2 concepts and 15 rules, or vice versa
   - Don't force items if they don't exist
   - Don't artificially limit if there's more valuable content

2. **Be language-agnostic**:
   - Principles should apply across languages when possible
   - If examples are code, keep them simple and transferable
   - Focus on concepts over syntax

3. **Rich descriptions**:
   - Concepts should be 2-4 sentences, fully explaining the idea
   - Don't abbreviate or assume knowledge
   - Make each item self-contained

4. **Empty is okay**:
   - If a chapter has no important terminology: `"terminology": []`
   - If a chapter is purely conceptual with no rules: `"rules": []`
   - Don't force content that isn't there

5. **Scope and relevance**:
   - "scope" = what does this apply to (broad coverage)
   - "when_relevant" = specific situations where this matters

6. **Examples should illustrate**:
   - Use examples to clarify, not to be exhaustive
   - Keep examples concrete but simple
   - Language-agnostic examples are preferred

---

## Chapter Text

{CHAPTER_TITLE}

{CHAPTER_TEXT}
