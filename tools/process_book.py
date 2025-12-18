#!/usr/bin/env python3
"""
Main entry point for converting books to Claude Code skills.

Usage:
    python tools/process_book.py sources/mybook.epub
    python tools/process_book.py sources/mybook.epub --skill-name "my-skill" --description "..."

Environment:
    GEMINI_API_KEY - Your Google AI API key
"""

import argparse
import json
import sys
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

from extractors import extract_text
from gemini import (
    propose_skill_metadata,
    identify_chapters,
    extract_chapter_text,
    process_chapter,
    plan_skill,
    generate_skill,
)


def select_option(prompt: str, options: list[str]) -> int:
    """Display options and get user selection."""
    print(prompt)
    for i, opt in enumerate(options, 1):
        print(f"  {i}. {opt}")
    print()

    while True:
        try:
            choice = input("Enter choice (number): ").strip()
            idx = int(choice) - 1
            if 0 <= idx < len(options):
                return idx
            print(f"Please enter a number between 1 and {len(options)}")
        except ValueError:
            print("Please enter a valid number")
        except (EOFError, KeyboardInterrupt):
            print("\nAborted.")
            sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="Convert a book to a Claude Code skill"
    )
    parser.add_argument("book_path", help="Path to book (EPUB, MOBI, PDF)")
    parser.add_argument("--skill-name",
                        help="Skill name (kebab-case). If not provided, will propose options.")
    parser.add_argument("--description",
                        help="Skill description. If not provided, will propose options.")
    parser.add_argument("--output-dir", default="skills",
                        help="Output directory (default: skills)")
    parser.add_argument("--model", default="gemini-2.5-flash",
                        help="Gemini model for chapter processing")
    parser.add_argument("--synthesis-model", default="gemini-2.5-pro",
                        help="Gemini model for final synthesis")
    parser.add_argument("--save-intermediates", action="store_true",
                        help="Save intermediate chapter extracts")

    args = parser.parse_args()

    book_path = Path(args.book_path)
    if not book_path.exists():
        print(f"Error: Book not found: {book_path}", file=sys.stderr)
        sys.exit(1)

    book_title = book_path.stem.replace("-", " ").replace("_", " ").title()

    print(f"Processing: {book_path}")
    print()

    # Step 1: Extract text
    print("Step 1: Extracting text from book...")
    full_text = extract_text(str(book_path))
    print(f"  Extracted {len(full_text):,} characters")
    print()

    # Step 2: Get skill name and description (propose if not provided)
    skill_name = args.skill_name
    skill_description = args.description

    if not skill_name or not skill_description:
        print("Step 2: Proposing skill name and description...")
        proposals = propose_skill_metadata(full_text, model=args.model)

        print()
        print("Choose a skill option:")
        print()
        for i, p in enumerate(proposals, 1):
            print(f"  [{i}] {p['name']}")
            print(f"      {p['description'][:100]}...")
            print(f"      Rationale: {p['rationale']}")
            print()

        choice = select_option("", [f"{p['name']}" for p in proposals])
        selected = proposals[choice]

        skill_name = skill_name or selected['name']
        skill_description = skill_description or selected['description']

        print()
        print(f"Selected: {skill_name}")
        print()

    # Create output directory
    output_dir = Path(args.output_dir) / skill_name
    output_dir.mkdir(parents=True, exist_ok=True)
    print(f"Output: {output_dir}")
    print()

    # Step 3: Identify chapters
    print("Step 3: Identifying chapters with Gemini...")
    chapters = identify_chapters(full_text, model=args.model)
    print(f"  Found {len(chapters)} chapters:")
    for i, ch in enumerate(chapters, 1):
        print(f"    {i}. {ch['title']}")
    print()

    # Step 4: Process each chapter (in parallel)
    print(f"Step 4: Processing {len(chapters)} chapters in parallel...")

    def process_one_chapter(chapter_info):
        idx, chapter = chapter_info
        try:
            chapter_text = extract_chapter_text(
                full_text,
                chapter["start_pos"],
                chapter["end_pos"]
            )
            extract = process_chapter(
                chapter["title"],
                chapter_text,
                book_title,
                model=args.model
            )
            return idx, chapter["title"], extract, None
        except Exception as e:
            return idx, chapter["title"], None, str(e)

    chapter_extracts = [None] * len(chapters)
    completed = 0

    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {
            executor.submit(process_one_chapter, (i, ch)): i
            for i, ch in enumerate(chapters)
        }

        for future in as_completed(futures):
            idx, title, extract, error = future.result()
            completed += 1

            if extract:
                chapter_extracts[idx] = extract
                print(f"  [{completed}/{len(chapters)}] {title}: "
                      f"{len(extract.get('key_concepts', []))} concepts, "
                      f"{len(extract.get('procedures', []))} procedures")
            else:
                print(f"  [{completed}/{len(chapters)}] {title}: Failed - {error}")

    # Filter out None values (failed chapters)
    chapter_extracts = [e for e in chapter_extracts if e is not None]
    print(f"  Successfully processed {len(chapter_extracts)} chapters")
    print()

    # Save intermediates if requested
    if args.save_intermediates:
        intermediates_path = output_dir / "chapter_extracts.json"
        with open(intermediates_path, "w") as f:
            json.dump(chapter_extracts, f, indent=2)
        print(f"Saved intermediates to: {intermediates_path}")

    # Step 5: Plan the skill structure
    print("Step 5: Planning skill structure with Gemini Pro...")
    skill_plan = plan_skill(
        book_title,
        skill_name,
        skill_description,
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

    # Step 6: Generate the skill from the plan
    print("Step 6: Generating SKILL.md from plan...")
    skill_content = generate_skill(
        book_title,
        skill_name,
        skill_description,
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
