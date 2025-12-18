# Book-to-Skill Processor

## Goal

Transform technical books into high-quality Claude Code skills through progressive multi-stage LLM processing that preserves actionable content while achieving appropriate compression.

## Terminology and Definitions

**Book Source**: Input file in EPUB, MOBI, or PDF format containing technical content to be processed.

**Skill**: A SKILL.md file containing structured knowledge that Claude Code automatically discovers and uses based on its description field. Skills are model-invoked, not user-invoked.

**Chapter**: A structural division of a book, identified by headers, numbering, or other markers in the source text.

**Extract**: Structured output from processing a single chapter, containing key concepts, procedures, examples, warnings, and other actionable content.

**Skill Plan**: Intermediate output that reviews all chapter extracts and determines the structure, sections, examples, and emphasis areas for the final skill.

**Progressive Specificity**: Multi-stage processing pattern where each stage refines or synthesizes information from the previous stage, allowing for quality control and preservation of critical details.

**Compression Ratio**: Relationship between source material length and final skill length. Target ratio should preserve all actionable content while eliminating redundancy and fluff.

**Actionable Content**: Information that directly helps a developer make decisions, write code, avoid mistakes, or understand when to apply specific techniques. Includes procedures, decision frameworks, examples, anti-patterns, checklists, and warnings.

## Requirements

### Input Processing

1. The tool must accept EPUB, MOBI, and PDF file formats as input.
2. The tool must extract plain text from the book source while preserving structural elements (chapter boundaries, code blocks, lists).
3. The tool must handle books between 100 and 1000 pages in length.

### Chapter Identification

4. The tool must automatically identify chapter boundaries by analyzing the text structure using an LLM.
5. Chapter identification must return a list of chapters with title, start position, and end position.
6. The tool must handle books with non-standard chapter numbering or naming conventions.

### Chapter Extraction

7. Each chapter must be processed independently to extract structured information.
8. Chapter extraction must capture:
   - Key concepts and terminology
   - Procedures and workflows (step-by-step instructions)
   - Decision frameworks (when X, do Y)
   - Code examples and patterns
   - Anti-patterns and mistakes to avoid
   - Edge cases and gotchas
   - Best practices and guidelines
   - Warnings and pitfalls
9. Chapter extraction must preserve specific examples rather than abstracting them into generic descriptions.
10. Chapter extraction output must be structured JSON with consistent schema across all chapters.
11. The tool must process chapters in parallel (configurable concurrency, default 5).
12. Failed chapter processing must not block other chapters - errors must be logged and processing continues.

### Skill Planning

13. After all chapters are extracted, the tool must generate a skill plan that:
    - Reviews all chapter extracts for themes and patterns
    - Determines the structure and sections for the final skill
    - Identifies which examples to include
    - Prioritizes content based on actionability and uniqueness
    - Estimates appropriate final skill length
14. The skill plan must identify cross-chapter connections and recurring themes.
15. The skill plan must ensure diverse content types (concepts, procedures, examples, warnings) are represented.

### Skill Generation

16. The tool must generate a SKILL.md file following the skill plan.
17. The generated skill must include:
    - Frontmatter with name, description, and location fields
    - Clear section structure with headers
    - Scannable formatting (bullets, numbered lists, tables)
    - Specific code examples where applicable
    - Decision trees or checklists where applicable
18. The skill description field must include both what the skill does AND when to use it (trigger conditions).
19. The generated skill must be between 500-2000 lines, depending on source material complexity.

### Prompt Engineering

20. All LLM prompts must explicitly emphasize preserving actionable content over abstract summaries.
21. Chapter extraction prompts must include examples of desired output structure.
22. Skill generation prompts must instruct the LLM to use the skill plan as a directive, not a suggestion.
23. Prompts must discourage philosophical fluff, motivation, and high-level summaries.
24. Prompts must encourage specific examples, concrete checklists, and "do this, not that" guidance.

### Configuration

25. The tool must accept command-line arguments for:
    - Book path (required)
    - Skill name (optional - will propose if not provided)
    - Skill description (optional - will propose if not provided)
    - Output directory (default: skills/)
    - LLM model for chapter processing (default: gemini-2.5-flash)
    - LLM model for synthesis (plan + generation) (default: gemini-2.5-pro)
    - Concurrency level (default: 5)
    - Save intermediates flag (saves chapter extracts and skill plan as JSON)

### Skill Metadata Proposal

26. If skill name or description is not provided, the tool must propose 3 options to the user.
27. Proposals must include:
    - name: kebab-case skill name (max 64 chars)
    - description: what the skill does + when to use it (max 1024 chars)
    - rationale: explanation of why this option works
28. The 3 proposals must offer different angles: broad/general, focused/unique, practical/hands-on.

### Output

29. The tool must create a directory structure: `{output-dir}/{skill-name}/SKILL.md`
30. If --save-intermediates is specified, the tool must save:
    - chapter_extracts.json (array of all chapter extraction outputs)
    - skill_plan.json (the skill plan object)
31. The tool must display progress information for each processing stage.
32. The tool must display installation instructions after successful generation.

## Scope

This requirements document covers:
- The command-line tool for processing books into skills
- The multi-stage processing pipeline (extract → plan → generate)
- Prompt engineering for quality output
- Configuration and user interaction

## Not in Scope

- Web interface or GUI
- Real-time streaming or incremental updates
- Support for non-technical books (fiction, biography, etc.)
- Automatic skill testing or validation
- Version control or skill updates
- Collaborative editing of skills
- Integration with specific IDEs or editors
- Support for video, audio, or other non-text sources
- Automatic skill deployment to ~/.claude/skills/
- Support for formats other than EPUB, MOBI, PDF (e.g., HTML, Markdown)
- OCR for scanned PDFs (assumes text-based PDFs)

## Specific Types

### ChapterInfo
```typescript
{
  title: string;          // Chapter title
  start_pos: number;      // Character position where chapter starts
  end_pos: number;        // Character position where chapter ends
}
```

### ChapterExtract
```typescript
{
  chapter_title: string;
  key_concepts: Array<{
    concept: string;
    definition: string;
    when_to_use?: string;
  }>;
  procedures: Array<{
    title: string;
    steps: string[];
    when_to_use: string;
  }>;
  examples: Array<{
    description: string;
    code?: string;
    language?: string;
  }>;
  antipatterns: Array<{
    pattern: string;
    why_bad: string;
    better_approach: string;
  }>;
  warnings: Array<{
    warning: string;
    context: string;
  }>;
  best_practices: string[];
}
```

### SkillPlan
```typescript
{
  sections: Array<{
    title: string;
    purpose: string;
    source_chapters: number[];  // Indices of chapters to draw from
  }>;
  examples_to_include: Array<{
    example: string;
    from_chapter: number;
    reason: string;
  }>;
  warnings_and_pitfalls: string[];
  estimated_length: string;  // e.g., "800-1000 lines"
  emphasis: string[];  // e.g., ["practical procedures", "code examples"]
}
```

### SkillMetadata
```typescript
{
  name: string;         // kebab-case, max 64 chars
  description: string;  // max 1024 chars, includes what + when
  location: "user" | "project";
}
```

## Related Systems or Code

- `src/extractors/`: Text extraction from EPUB, MOBI, PDF
- `src/llm/`: LLM client wrapper (Gemini)
- `src/pipeline/`: Core processing pipeline stages
- `src/cli.js`: Command-line interface
- `src/prompts/`: Prompt templates for each stage

## Future Work

### Multi-Model Support
- Support for Claude API in addition to Gemini
- Support for OpenAI GPT-4
- Ability to mix models (e.g., Flash for extraction, Opus for synthesis)

### Quality Validation
- Automated quality checks on generated skills
- Prompt for user feedback after generation
- Iteration on low-quality outputs

### Skill Updates
- Version tracking for skills
- Re-generation with improved prompts
- Incremental updates when new editions of books are released

### Advanced Configuration
- User-configurable extraction templates
- Custom prompt templates
- Compression level control (comprehensive vs. brief)
- Content type emphasis (theory vs. practice)

### Performance Optimization
- Caching of LLM responses
- Resume from partial completion
- Batch processing of multiple books

### Skill Management
- Skill discovery and listing
- Skill comparison and merging
- Automatic deployment to ~/.claude/skills/

## Execution Flow

```d2
direction: right

book_source: Book Source (EPUB/PDF/MOBI) {
  shape: document
}

extract_text: Extract Text {
  shape: step
}

propose_metadata: Propose Skill Metadata {
  shape: step
}

user_selection: User Selects Option {
  shape: diamond
}

identify_chapters: Identify Chapters {
  shape: step
}

chapter_processing: Chapter Processing {
  shape: rectangle
  style.multiple: true
}

chapter_1: Process Chapter 1 {
  shape: step
}

chapter_n: Process Chapter N {
  shape: step
}

plan_skill: Plan Skill Structure {
  shape: step
}

generate_skill: Generate SKILL.md {
  shape: step
}

output: skills/{name}/SKILL.md {
  shape: document
  style.fill: "#90EE90"
}

book_source -> extract_text
extract_text -> propose_metadata: first 100k chars
propose_metadata -> user_selection
user_selection -> identify_chapters: name + description
identify_chapters -> chapter_processing: list of chapters
chapter_processing -> chapter_1
chapter_processing -> chapter_n
chapter_1 -> plan_skill: chapter extracts
chapter_n -> plan_skill: chapter extracts
plan_skill -> generate_skill: skill plan + extracts
generate_skill -> output

llm_flash: Gemini Flash {
  shape: cylinder
  style.fill: "#87CEEB"
}

llm_pro: Gemini Pro {
  shape: cylinder
  style.fill: "#4169E1"
}

propose_metadata -> llm_flash
identify_chapters -> llm_flash
chapter_1 -> llm_flash
chapter_n -> llm_flash
plan_skill -> llm_pro
generate_skill -> llm_pro
```

### Stage Details

#### Stage 1: Text Extraction
- Input: Book file path
- Process: Use appropriate library (epub2, pdf-parse) to extract text
- Output: Full text string with preserved structure
- Duration: 1-5 seconds

#### Stage 2: Skill Metadata Proposal (if needed)
- Input: First 100k characters of book + LLM
- Process: Analyze content and propose 3 skill options
- Output: Array of {name, description, rationale}
- Duration: 5-15 seconds
- User interaction: Select one option

#### Stage 3: Chapter Identification
- Input: Full text + LLM
- Process: Analyze structure to find chapter boundaries
- Output: Array of {title, start_pos, end_pos}
- Duration: 10-30 seconds

#### Stage 4: Parallel Chapter Processing
- Input: Chapter text + chapter info + LLM
- Process: Extract structured information for each chapter
- Output: Array of ChapterExtract objects
- Duration: 30-120 seconds (parallel, 5 concurrent)
- Error handling: Log failures, continue with successful extracts

#### Stage 5: Skill Planning
- Input: All chapter extracts + book metadata + LLM
- Process: Synthesize extracts into a skill structure plan
- Output: SkillPlan object
- Duration: 20-60 seconds

#### Stage 6: Skill Generation
- Input: Skill plan + chapter extracts + LLM
- Process: Generate final SKILL.md following the plan
- Output: SKILL.md content string
- Duration: 30-90 seconds
- Post-process: Write to file, display instructions
