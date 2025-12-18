# Chapter Identification Prompt

You are analyzing a technical book to identify chapter boundaries.

## Task

Analyze this book text and identify all chapters. Return a JSON array of chapter objects.

Each chapter object must include:
- `title`: The chapter title (string)
- `start_pos`: Character position where the chapter starts (number)
- `end_pos`: Character position where the chapter ends (number)

## Guidelines

1. **Look for structural markers:**
   - Chapter headings (e.g., "Chapter 1", "Chapter One", "1.", "Part I")
   - Major section breaks
   - Consistent heading patterns
   - Table of contents references

2. **Handle edge cases:**
   - Preface, Introduction, Foreword → treat as chapters
   - Appendices → treat as chapters if substantial
   - Front matter (copyright, TOC) → skip
   - Index, References → skip

3. **Position accuracy:**
   - `start_pos` should be the character index where chapter content begins
   - `end_pos` should be the character index where chapter content ends (start of next chapter or end of book)
   - Positions must be accurate for text extraction

4. **Title formatting:**
   - Keep titles concise and clean
   - Remove numbering if it's redundant (e.g., "Chapter 3: Performance" → "Performance")
   - Preserve meaningful titles (e.g., "Introduction" stays "Introduction")

## Output Format

Return ONLY a valid JSON array:

```json
[
  {
    "title": "Introduction",
    "start_pos": 0,
    "end_pos": 5420
  },
  {
    "title": "Database Fundamentals",
    "start_pos": 5420,
    "end_pos": 15830
  },
  {
    "title": "Query Optimization",
    "start_pos": 15830,
    "end_pos": 28500
  }
]
```

## Important

- Chapters must be sequential (end_pos of chapter N = start_pos of chapter N+1)
- Must cover entire book (first start_pos near 0, last end_pos near end of text)
- Minimum 3 chapters, maximum 50 chapters
- If book has no clear chapters, divide into major sections

---

## Book Text

{BOOK_TEXT}
