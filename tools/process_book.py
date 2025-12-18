#!/usr/bin/env python3
"""
Main entry point for converting books to Claude Code skills.

Usage:
    python tools/process_book.py sources/mybook.epub \\
        --skill-name "my-skill" \\
        --description "What this skill does. Use when..."

Environment:
    GEMINI_API_KEY - Your Google AI API key
"""

import argparse
import json
import sys
from pathlib import Path

from extractors import extract_text
from gemini import (
    identify_chapters,
    extract_chapter_text,
    process_chapter,
    plan_skill,
    generate_skill,
)


def main():
    parser = argparse.ArgumentParser(
        description="Convert a book to a Claude Code skill"
    )
    parser.add_argument("book_path", help="Path to book (EPUB, MOBI, PDF)")
    parser.add_argument("--skill-name", required=True,
                        help="Skill name (kebab-case, e.g., 'postgres-expert')")
    parser.add_argument("--description", required=True,
                        help="Skill description for Claude discovery")
    parser.add_argument("--output-dir", default="skills",
                        help="Output directory (default: skills)")
    parser.add_argument("--model", default="gemini-2.5-flash-preview-05-06",
                        help="Gemini model for chapter processing")
    parser.add_argument("--synthesis-model", default="gemini-2.5-pro-preview-05-06",
                        help="Gemini model for final synthesis")
    parser.add_argument("--save-intermediates", action="store_true",
                        help="Save intermediate chapter extracts")

    args = parser.parse_args()

    book_path = Path(args.book_path)
    if not book_path.exists():
        print(f"Error: Book not found: {book_path}", file=sys.stderr)
        sys.exit(1)

    book_title = book_path.stem.replace("-", " ").replace("_", " ").title()

    # Create output directory
    output_dir = Path(args.output_dir) / args.skill_name
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"Processing: {book_path}")
    print(f"Output: {output_dir}")
    print()

    # Step 1: Extract text
    print("Step 1: Extracting text from book...")
    full_text = extract_text(str(book_path))
    print(f"  Extracted {len(full_text):,} characters")
    print()

    # Step 2: Identify chapters
    print("Step 2: Identifying chapters with Gemini...")
    chapters = identify_chapters(full_text, model=args.model)
    print(f"  Found {len(chapters)} chapters:")
    for i, ch in enumerate(chapters, 1):
        print(f"    {i}. {ch['title']}")
    print()

    # Step 3: Process each chapter
    print("Step 3: Processing chapters...")
    chapter_extracts = []

    for i, chapter in enumerate(chapters, 1):
        print(f"  [{i}/{len(chapters)}] {chapter['title']}...")

        try:
            chapter_text = extract_chapter_text(
                full_text,
                chapter["start_marker"],
                chapter["end_marker"]
            )

            extract = process_chapter(
                chapter["title"],
                chapter_text,
                book_title,
                model=args.model
            )
            chapter_extracts.append(extract)
            print(f"    Extracted: {len(extract.get('key_concepts', []))} concepts, "
                  f"{len(extract.get('procedures', []))} procedures")

        except Exception as e:
            print(f"    Warning: Failed to process - {e}")
            continue

    print()

    # Save intermediates if requested
    if args.save_intermediates:
        intermediates_path = output_dir / "chapter_extracts.json"
        with open(intermediates_path, "w") as f:
            json.dump(chapter_extracts, f, indent=2)
        print(f"Saved intermediates to: {intermediates_path}")

    # Step 4: Plan the skill structure
    print("Step 4: Planning skill structure with Gemini Pro...")
    skill_plan = plan_skill(
        book_title,
        args.skill_name,
        args.description,
        chapter_extracts,
        model=args.synthesis_model
    )
    print(f"  Planned {len(skill_plan.get('sections', []))} sections")
    print(f"  {len(skill_plan.get('examples_to_include', []))} examples to include")
    print(f"  {len(skill_plan.get('warnings_and_pitfalls', []))} warnings/pitfalls")
    print(f"  Estimated length: {skill_plan.get('estimated_length', 'unknown')}")

    # Save the plan
    if args.save_intermediates:
        plan_path = output_dir / "skill_plan.json"
        with open(plan_path, "w") as f:
            json.dump(skill_plan, f, indent=2)
        print(f"  Saved plan to: {plan_path}")
    print()

    # Step 5: Generate the skill from the plan
    print("Step 5: Generating SKILL.md from plan...")
    skill_content = generate_skill(
        book_title,
        args.skill_name,
        args.description,
        chapter_extracts,
        skill_plan,
        model=args.synthesis_model
    )

    # Write SKILL.md
    skill_path = output_dir / "SKILL.md"
    with open(skill_path, "w") as f:
        f.write(skill_content)

    print()
    print(f"Done! Skill created at: {skill_path}")
    print()
    print("To use this skill:")
    print(f"  1. Copy {output_dir} to ~/.claude/skills/ (personal)")
    print(f"     or to your project's .claude/skills/ (project-specific)")
    print("  2. Claude will automatically discover and use it based on context")


if __name__ == "__main__":
    main()
