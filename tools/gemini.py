"""
Gemini API wrapper for book processing.
Uses google-genai SDK with Gemini 2.5 Pro/Flash.
"""

import os
import json
from google import genai
from google.genai import types


def get_client():
    """Get Gemini client. Expects GEMINI_API_KEY env var."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable not set")
    return genai.Client(api_key=api_key)


def identify_chapters(text: str, model: str = "gemini-2.5-flash-preview-05-06") -> list[dict]:
    """
    Send full book text to Gemini and get chapter breakdown.
    Returns list of {title, start_marker, end_marker} for each chapter.
    """
    client = get_client()

    prompt = """Analyze this book text and identify all chapters or major sections.

For each chapter, provide:
1. title: The chapter title/name
2. start_marker: A unique phrase (10-20 words) that marks where this chapter begins
3. end_marker: A unique phrase (10-20 words) that marks where this chapter ends

Return ONLY valid JSON array, no markdown fencing:
[{"title": "...", "start_marker": "...", "end_marker": "..."}, ...]

Book text:
"""

    response = client.models.generate_content(
        model=model,
        contents=prompt + text[:500000],  # Gemini has large context, but be reasonable
        config=types.GenerateContentConfig(
            temperature=0.1,  # Low temp for structured output
        )
    )

    # Parse JSON from response
    response_text = response.text.strip()
    # Handle potential markdown fencing
    if response_text.startswith("```"):
        lines = response_text.split("\n")
        response_text = "\n".join(lines[1:-1])

    return json.loads(response_text)


def extract_chapter_text(full_text: str, start_marker: str, end_marker: str) -> str:
    """Extract chapter text between markers."""
    start_idx = full_text.find(start_marker)
    end_idx = full_text.find(end_marker)

    if start_idx == -1:
        raise ValueError(f"Start marker not found: {start_marker[:50]}...")
    if end_idx == -1:
        # If no end marker, take to end of text
        return full_text[start_idx:]

    return full_text[start_idx:end_idx + len(end_marker)]


def process_chapter(chapter_title: str, chapter_text: str, book_title: str,
                    model: str = "gemini-2.5-flash-preview-05-06") -> dict:
    """
    Process a single chapter and extract key knowledge for a Claude skill.
    Returns structured knowledge dict.
    """
    client = get_client()

    prompt = f"""You are extracting knowledge from a book chapter to create a Claude Code skill.
The skill will help Claude assist users with tasks related to this subject matter.

Book: {book_title}
Chapter: {chapter_title}

Extract the following from this chapter:

1. key_concepts: List of important concepts, terms, and definitions
2. procedures: Step-by-step procedures or methodologies described
3. best_practices: Recommended approaches, patterns, or guidelines
4. warnings: Common pitfalls, anti-patterns, or things to avoid
5. examples: Concrete examples that illustrate concepts
6. reference_info: Facts, syntax, commands, or reference material worth remembering

Return ONLY valid JSON:
{{
  "chapter_title": "{chapter_title}",
  "key_concepts": [...],
  "procedures": [...],
  "best_practices": [...],
  "warnings": [...],
  "examples": [...],
  "reference_info": [...]
}}

Chapter text:
{chapter_text[:100000]}
"""

    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.2,
        )
    )

    response_text = response.text.strip()
    if response_text.startswith("```"):
        lines = response_text.split("\n")
        response_text = "\n".join(lines[1:-1])

    return json.loads(response_text)


def plan_skill(book_title: str, skill_name: str, skill_description: str,
               chapter_extracts: list[dict], model: str = "gemini-2.5-pro-preview-05-06") -> dict:
    """
    Analyze chapter extracts and create a detailed plan for the skill.
    Returns a structured plan for what the skill should contain.
    """
    client = get_client()

    prompt = f"""You are planning the structure and content of a Claude Code skill.

Claude Code skills are knowledge files that Claude automatically discovers and uses based on context.
The skill must be practical, actionable, and help Claude assist users effectively.

Book: {book_title}
Skill name: {skill_name}
Skill description: {skill_description}

Review these chapter extracts and create a detailed plan for the skill:

{json.dumps(chapter_extracts, indent=2)}

Create a plan that specifies:

1. sections: List of sections the skill should have, with:
   - title: Section heading
   - purpose: What this section accomplishes
   - key_points: 3-5 bullet points of what to include
   - priority: "essential", "important", or "nice-to-have"

2. examples_to_include: Specific examples from the extracts that MUST be in the skill
   - Each should have: context, code_or_content, why_important

3. warnings_and_pitfalls: Critical mistakes/anti-patterns to highlight

4. quick_reference: Facts, syntax, or commands that should be easily scannable

5. description_keywords: Trigger words/phrases for the skill description
   (technologies, operations, file types, problem domains users would mention)

6. estimated_length: "short" (< 200 lines), "medium" (200-500), or "long" (500+)

7. supporting_files: Whether to recommend additional files (reference.md, examples.md, etc.)

Return ONLY valid JSON:
{{
  "sections": [...],
  "examples_to_include": [...],
  "warnings_and_pitfalls": [...],
  "quick_reference": [...],
  "description_keywords": [...],
  "estimated_length": "...",
  "supporting_files": [...]
}}
"""

    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.2,
        )
    )

    response_text = response.text.strip()
    if response_text.startswith("```"):
        lines = response_text.split("\n")
        response_text = "\n".join(lines[1:-1])

    return json.loads(response_text)


def generate_skill(book_title: str, skill_name: str, skill_description: str,
                   chapter_extracts: list[dict], skill_plan: dict,
                   model: str = "gemini-2.5-pro-preview-05-06") -> str:
    """
    Generate the final SKILL.md based on the plan.
    """
    client = get_client()

    prompt = f"""You are generating a Claude Code skill file (SKILL.md).

## Skill Format Requirements

The file MUST start with YAML frontmatter:
```yaml
---
name: {skill_name}
description: {skill_description}
---
```

After frontmatter, include markdown content with:
- Clear section headers (##, ###)
- Bullet points for scannability
- Code blocks with language tags
- Concrete examples
- Warnings/pitfalls clearly marked

## Context

Book: {book_title}
Skill name: {skill_name}

## The Plan to Follow

{json.dumps(skill_plan, indent=2)}

## Source Material (Chapter Extracts)

{json.dumps(chapter_extracts, indent=2)}

## Instructions

Generate the complete SKILL.md file following the plan above.

Key principles:
1. Be DENSE with useful information - every line should add value
2. Prioritize actionable guidance over theory
3. Include ALL the examples marked in the plan
4. Make warnings/pitfalls prominent
5. Quick reference sections should be scannable (tables, short bullets)
6. Use code blocks with proper language tags
7. No fluff or filler content

Generate the SKILL.md now:
"""

    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.3,
            max_output_tokens=16384,
        )
    )

    return response.text


# Keep the old function for backwards compatibility, but have it use the new two-step process
def synthesize_skill(book_title: str, skill_name: str, skill_description: str,
                     chapter_extracts: list[dict], model: str = "gemini-2.5-pro-preview-05-06") -> str:
    """
    Take all chapter extracts and synthesize into a comprehensive SKILL.md.
    Uses two-step process: plan then generate.
    """
    plan = plan_skill(book_title, skill_name, skill_description, chapter_extracts, model)
    return generate_skill(book_title, skill_name, skill_description, chapter_extracts, plan, model)
