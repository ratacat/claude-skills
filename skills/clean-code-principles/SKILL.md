---
name: clean-code-principles
description: Expert guidance on writing clean, maintainable code from Robert C. Martin's Clean Code. Use when writing code, refactoring, doing code reviews, naming variables/functions/classes, structuring functions and classes, handling errors, writing tests, or discussing code quality and readability.
location: user
---

```markdown
---
name: clean-code-principles
description: Expert guidance on writing clean, maintainable code from Robert C. Martin's Clean Code. Use when writing code, refactoring, doing code reviews, naming variables/functions/classes, structuring functions and classes, handling errors, writing tests, or discussing code quality and readability.
location: user
---

# Clean Code Principles

Practical guidelines for writing software that is easy to understand, maintain, and extend. Based on Robert C. Martin's "Clean Code," focusing on readability, intent, and structural integrity.

## Core Concepts

### The Professional Mindset
*   **Code is Design:** Source code is the detailed design specification, not just a manufacturing output.
*   **The Boy Scout Rule:** Always leave the code cleaner than you found it. Incremental improvement prevents rot.
*   **Read/Write Ratio:** Developers spend >10x time reading code than writing it. Optimizing for readability improves write-speed.
*   **Broken Windows Theory:** Small imperfections (bad names, commented-out code) signal a lack of care and encourage system degradation.

### Structural Metaphors
*   **The Newspaper Metaphor:** Source files should read like a newspaper. High-level concepts (headlines) at the top, increasing detail in the middle, low-level implementation at the bottom.
*   **Separation of Construction and Use:** Startup logic (wiring objects) must be separate from runtime logic.
*   **Testability as Verifiability:** Code that cannot be tested cannot be verified. Testability forces low coupling and high cohesion.

## Quick Reference

### Kent Beck's Rules of Simple Design (Priority Order)
1.  **Runs all tests:** Verification is primary.
2.  **Eliminates duplication:** The root of all evil in software.
3.  **Expresses intent:** Names and structure reveal behavior.
4.  **Minimizes entities:** Fewest classes/methods possible (after satisfying 1-3).

### F.I.R.S.T. Principles for Tests
| Acronym | Meaning | Description |
|:---:|:---|:---|
| **F** | **Fast** | Tests run quickly so they are run often. |
| **I** | **Independent** | Tests do not depend on each other or state from previous tests. |
| **R** | **Repeatable** | Tests run in any environment (dev, QA, prod). |
| **S** | **Self-Validating** | Tests return a boolean (pass/fail), not a log file. |
| **T** | **Timely** | Tests are written *before* the production code (TDD). |

## Procedures

### The Refactoring Workflow
1.  **Drafting:** Write code to get it working. It may be long, messy, and indented.
2.  **Testing:** Ensure unit tests cover the messy draft.
3.  **Refining:**
    *   **Extract Methods:** Break large functions into small, named steps.
    *   **Rename:** Change variables to be intention-revealing.
    *   **Dedup:** Remove copy-pasted logic.
    *   **Reorder:** Apply the Stepdown Rule (high-level calls low-level).
    *   **Constraint:** Tests must pass after every micro-change.

### Handling Switch Statements
Switch statements often violate SRP and OCP.
1.  **Isolate:** Move the switch statement into an **Abstract Factory**.
2.  **Create:** Use the switch *only* to create instances of polymorphic objects.
3.  **Replace:** Replace conditional logic elsewhere with polymorphic method calls.

### Integrating Third-Party Code
1.  **Learning Tests:** Write tests against the third-party API to verify your understanding.
2.  **Boundary Interface:** Define an interface that represents *your* application's needs, not the library's structure.
3.  **Adapter:** Create a class implementing your interface that translates calls to the third-party API.

## Rules and Best Practices

### Naming
*   **Intention-Revealing:** If a name requires a comment, the name is wrong.
*   **Classes:** Use **Nouns** (e.g., `Customer`, `WikiPage`). Avoid vague managers/processors.
*   **Methods:** Use **Verbs** (e.g., `postPayment`, `deletePage`).
*   **Consistency:** Pick one word per concept (`fetch` vs `retrieve` vs `get`) and stick to it.
*   **Domain:** Use Problem Domain (business) terms first; Solution Domain (CS) terms second.

### Functions
*   **Single Responsibility:** Do one thing, do it well, do it only.
*   **Size:** Ideally 5-10 lines. Smaller is better.
*   **Arguments:**
    *   0 (Niladic): Ideal.
    *   1 (Monadic): Good.
    *   2 (Dyadic): Acceptable.
    *   3 (Triadic): Avoid.
    *   >3 (Polyadic): Justify strictly.
*   **Abstraction Level:** All statements in a function must be at the same level of abstraction.
*   **No Side Effects:** Do not secretly change system state (e.g., initializing a session in a `checkPassword` function).

### Comments
*   **General Rule:** Comments are often failures to express code clearly. Rewrite code instead of commenting.
*   **Allowed Comments:**
    *   Legal/Copyright.
    *   Consequence warnings ("This runs slowly").
    *   TODOs (must be managed).
    *   Amplification (highlighting importance).
*   **Forbidden Comments:**
    *   Commented-out code (delete it).
    *   Closing brace markers (`// end if`).
    *   Redundant descriptions (`i++; // increment i`).
    *   Change logs (use Git).

### Objects and Data Structures
*   **Law of Demeter:** Don't talk to strangers. Method `f` of class `C` should only call methods of:
    *   `C`
    *   Objects created by `f`
    *   Arguments passed to `f`
    *   Instance variables of `C`
*   **Hide Internal Structure:** Avoid "Train Wrecks" (`getOptions().getScratchDir().getAbsolutePath()`).
*   **Nulls:** Never return `null`. Never pass `null`. Use Empty Objects or Optionals.

### Error Handling
*   **Exceptions:** Prefer Exceptions over returning error codes.
*   **Scope:** Isolate `try/catch` blocks into their own functions.
*   **Context:** Provide context with exceptions to determine the source of the error.

## Common Pitfalls

### Naming Anti-Patterns
*   **Magic Numbers:** Using `86400` instead of `SECONDS_PER_DAY`.
*   **Hungarian Notation:** Encoding types in names (`strName`, `iCount`).
*   **Mental Mapping:** Using `i`, `j`, `k` outside of tiny loops.
*   **Noise Words:** `ProductInfo`, `ProductData`, `ProductObject` (just use `Product`).

### Function Anti-Patterns
*   **Flag Arguments:** Passing a boolean (`render(true)`). Implies the function does two things. Split it: `renderForSuite()` and `renderForSingle()`.
*   **Output Arguments:** Modifying an argument (`appendFooter(report)`). Return the result instead (`report.appendFooter()`).

### Architecture Anti-Patterns
*   **God Class:** A class that knows too much or does too much.
*   **Temporal Coupling:** Functions that must be called in a specific order but the API doesn't enforce it.
*   **Anemic Domain Model:** Objects with data but no behavior (valid for DTOs, bad for Domain Objects).

## Code Examples

### Meaningful Names

**Bad:**
```java
// What is list1? What is 4?
public List<int[]> getThem() {
  List<int[]> list1 = new ArrayList<int[]>();
  for (int[] x : theList)
    if (x[0] == 4)
      list1.add(x);
  return list1;
}
```

**Good:**
```java
public List<Cell> getFlaggedCells() {
  List<Cell> flaggedCells = new ArrayList<Cell>();
  for (Cell cell : gameBoard)
    if (cell.isFlagged())
      flaggedCells.add(cell);
  return flaggedCells;
}
```

### Function Arguments

**Bad:**
```java
public void makeCircle(double x, double y, double radius) {
    // ...
}
```

**Good:**
```java
// Group related arguments into a concept
public void makeCircle(Point center, double radius) {
    // ...
}
```

### Error Handling

**Bad:**
```java
// Mixing error handling with logic
if (deletePage(page) == E_OK) {
  if (registry.deleteReference(page.name) == E_OK) {
    cleanup();
  } else {
    logger.log("Ref delete failed");
  }
} else {
  logger.log("Page delete failed");
}
```

**Good:**
```java
// Separate error handling from logic
public void deletePageAndReferences(Page page) {
    try {
        deletePageAndReferencesPage(page);
    } catch (Exception e) {
        logError(e);
    }
}

private void deletePageAndReferencesPage(Page page) throws Exception {
    deletePage(page);
    registry.deleteReference(page.name);
    cleanup();
}
```

## Decision Frameworks

### Objects vs. Data Structures

This is a fundamental architectural tradeoff.

| Feature | Objects | Data Structures |
| :--- | :--- | :--- |
| **Primary Goal** | Hide data, expose behavior. | Expose data, no behavior. |
| **Adding New Data Types** | **Easy.** Add a new subclass. Existing functions don't change. | **Hard.** Must edit every function to handle the new type. |
| **Adding New Functions** | **Hard.** Must edit all classes to add the method. | **Easy.** Add a new function. Data structures don't change. |
| **Use Case** | Complex business logic, polymorphism. | DTOs, database records, simple data transfer. |

### Exception Types

| Type | Recommendation | Reasoning |
| :--- | :--- | :--- |
| **Unchecked** | **Preferred** | Reduces coupling. Changing a low-level method doesn't force signature changes all the way up the stack (OCP). |
| **Checked** | **Avoid** | Violates OCP. Only use if the caller can reasonably be expected to recover from the error. |

## Advanced Topics

### Emergent Design
Follow the 4 rules of simple design to allow architecture to emerge rather than over-engineering upfront.
1.  **Verification (Tests)** ensures the system works.
2.  **Refactoring (Duplication/Intent)** cleans the design.
3.  **Minimization** keeps the system lean.

### Boundaries (Seams)
Create "Seams" in your code where behavior can be isolated for testing.
*   **Technique:** Use Interfaces/Polymorphism.
*   **Benefit:** Allows mocking of databases, APIs, or slow components during testing.
*   **Goal:** Your core logic should not know it is running on a web server or connected to a specific database.
```