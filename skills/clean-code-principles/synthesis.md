# Synthesis

## Core Concepts and Mental Models

### The Professional Mindset
*   **Code is Design:** Source code is not merely a manufacturing output but the detailed design specification itself. It requires the same rigor as architectural blueprints.
*   **The Boy Scout Rule:** Always leave the code cleaner than you found it. Continuous, incremental improvement prevents code rot and degradation over time.
*   **LeBlanc's Law:** "Later equals never." Postponing clean-up to meet a deadline is a fallacy; messy code immediately slows down development.
*   **Broken Windows Theory:** One small imperfection (like a bad variable name or commented-out code) signals a lack of care, encouraging further degradation of the system.
*   **The Read/Write Ratio:** Developers spend over 10x more time reading code than writing it. Optimizing for readability directly improves write-speed and maintainability.

### Structural Metaphors
*   **The Newspaper Metaphor:** Source files should be organized like a newspaper. High-level concepts (headlines) appear at the top, followed by increasing detail, with low-level implementation details at the bottom.
*   **5S Philosophy:** Adapted from manufacturing (Seiri, Seiton, Seiso, Seiketsu, Shutsuke), this emphasizes organization, tidiness, cleaning, standardization, and discipline as foundations of quality.
*   **Emergent Design:** Good design arises from following four simple rules (Kent Beck’s Rules of Simple Design), prioritized as follows:
    1.  Runs all tests (Verification)
    2.  Eliminates duplication
    3.  Expresses intent
    4.  Minimizes entities (classes/methods)

### Architectural Principles
*   **Separation of Construction and Use:** The process of starting up a system (wiring objects) should be completely separate from the runtime logic.
*   **Data/Object Anti-Symmetry:**
    *   **Objects:** Hide data and expose behavior. Good for when you need to add new *types* of data (subclasses) without changing existing functions.
    *   **Data Structures:** Expose data and have no behavior. Good for when you need to add new *functions* without changing existing data types.
*   **Testability as Verifiability:** A system that cannot be tested cannot be verified. Testability exerts positive pressure on architecture, forcing low coupling and high cohesion.

## Terminology

*   **Clean Code:** Code that is focused, reads like well-written prose, has tests, and does not obscure the designer's intent.
*   **Single Responsibility Principle (SRP):** A module, class, or function should have one, and only one, reason to change.
*   **Open-Closed Principle (OCP):** Software entities should be open for extension but closed for modification.
*   **Dependency Inversion Principle (DIP):** Depend upon abstractions (interfaces), not concrete details.
*   **Law of Demeter:** A module should not know about the innards of the objects it manipulates (don't talk to strangers).
*   **Command Query Separation (CQS):** A function should either perform an action (command) or answer a question (query), but never both.
*   **Temporal Coupling:** A hidden dependency on the order in which functions are executed (often caused by side effects).
*   **Train Wreck:** A chain of method calls (e.g., `getOptions().getScratchDir().getAbsolutePath()`) that violates the Law of Demeter by exposing internal structure.
*   **F.I.R.S.T.:** Acronym for clean tests: **F**ast, **I**ndependent, **R**epeatable, **S**elf-Validating, **T**imely.
*   **Learning Tests:** Unit tests written to verify understanding of a third-party API.
*   **Seam:** A place in the code where behavior can be altered or isolated (often for testing) without editing the code in that place.

## Rules and Principles

### Naming
*   **Critical:** Use intention-revealing names. If a name requires a comment, the name is wrong.
*   **Critical:** Avoid disinformation. Do not use "List" unless it is a List. Do not use `l` (lowercase L) or `O` (uppercase o).
*   **Important:** Use pronounceable and searchable names.
*   **Important:** Class names should be nouns (e.g., `Customer`, `WikiPage`). Avoid vague words like `Manager` or `Processor`.
*   **Important:** Method names should be verbs (e.g., `postPayment`, `deletePage`).
*   **Important:** Pick one word per concept (e.g., choose `fetch`, `retrieve`, OR `get`) and use it consistently.
*   **Important:** Use names from the **Problem Domain** (business logic) when possible; fallback to **Solution Domain** (CS terms like `JobQueue`) only when necessary.

### Functions
*   **Critical:** Functions should do **one thing**, do it well, and do it only.
*   **Critical:** Functions should be small. Ideally a few lines long.
*   **Critical:** No side effects. A function should not secretly change system state.
*   **Critical:** Do not use flag arguments (booleans). Split the function into two instead.
*   **Important:** Minimize arguments.
    *   Niladic (0) is ideal.
    *   Monadic (1) is good.
    *   Dyadic (2) is acceptable.
    *   Triadic (3) should be avoided.
    *   Polyadic (>3) requires special justification.
*   **Important:** Statements within a function must be at the same **level of abstraction**.
*   **Important:** Prefer exceptions to returning error codes.

### Comments
*   **Critical:** Do not comment bad code; rewrite it.
*   **Critical:** Explain intent in code, not comments.
*   **Critical:** Delete commented-out code immediately. Source control handles history.
*   **Important:** Use comments only for:
    *   Legal/Copyright info.
    *   Warning of consequences (e.g., "This test takes a long time").
    *   TODOs (but clean them up regularly).
    *   Amplification (emphasizing importance of a line).

### Objects and Data Structures
*   **Critical:** Hide internal structure. Avoid "Train Wrecks."
*   **Critical:** Never return `null`. Return an empty object or list instead.
*   **Critical:** Never pass `null` into methods.
*   **Important:** Use **Data Transfer Objects (DTOs)** for raw data with no behavior.
*   **Important:** Use **Objects** when behavior is the priority and data should be hidden.

### Testing
*   **Critical:** Test code is as important as production code. It must be kept clean.
*   **Critical:** One assert/concept per test.
*   **Critical:** Adhere to the Three Laws of TDD:
    1.  Write no production code except to pass a failing test.
    2.  Write only enough of a test to demonstrate failure.
    3.  Write only enough production code to pass the test.
*   **Important:** Isolate tests from production code using interfaces (Seams).

### Formatting
*   **Critical:** Team rules trump individual preferences. The codebase should look like it was written by one person.
*   **Important:** Use vertical openness (blank lines) to separate concepts.
*   **Important:** Declare variables close to their usage.

## Procedures and Workflows

### The Refactoring Workflow (Writing Functions)
1.  **Drafting:** Write the code first. It will likely be long, messy, and have too many indentations/arguments. This is acceptable as a draft.
2.  **Testing:** Ensure you have unit tests that cover this messy code.
3.  **Refining:**
    *   Extract methods to reduce function size.
    *   Rename variables to be intention-revealing.
    *   Eliminate duplication.
    *   Reorder functions to follow the Stepdown Rule.
    *   **Constraint:** Keep tests passing throughout this process.

### Integrating Third-Party Code
1.  **Learning:** Write "Learning Tests" to explore the third-party API and verify it behaves as expected.
2.  **Encapsulation:** Create a boundary interface that defines *your* application's needs.
3.  **Adaptation:** Create an Adapter class that implements your interface and translates calls to the third-party API.
4.  **Result:** Your application depends on your interface, not the external library, making it easier to test (via mocks) and switch libraries later.

### Handling Switch Statements
*   **Problem:** Switch statements violate OCP (must change when types are added) and SRP (do multiple things).
*   **Procedure:**
    1.  Move the switch statement into an **Abstract Factory**.
    2.  Use the switch statement *only* to create instances of polymorphic objects.
    3.  Replace conditional logic in the rest of the system with polymorphic method calls on those objects.

## Warnings and Anti-patterns

### Naming Anti-patterns
*   **Magic Numbers:** Using raw numbers (e.g., `86400`) instead of named constants (`SECONDS_PER_DAY`).
*   **Hungarian Notation:** Encoding types in names (e.g., `iCount`, `strName`).
*   **Mental Mapping:** Using single-letter variables (`i`, `j`, `k`) outside of small loops, forcing the reader to translate them mentally.
*   **Noise Words:** Adding `Info`, `Data`, or `Object` to names without adding distinction (e.g., `ProductInfo` vs `Product`).

### Function Anti-patterns
*   **Output Arguments:** Passing an argument to a function to be modified (e.g., `appendFooter(report)`). Instead, return the modified object (`report.appendFooter()`).
*   **Flag Arguments:** Passing a boolean (`render(true)`) implies the function does two things.
*   **God Class:** A class that knows too much or does too much.

### Comment Anti-patterns
*   **Mumbling:** Vague comments that only make sense to the author at that moment.
*   **Redundant Comments:** Comments that repeat the code (e.g., `i++; // increment i`).
*   **Journal Comments:** Changelogs at the top of files (use Git instead).
*   **Closing Brace Comments:** `// end if` (indicates the function is too long).

## Examples

### Meaningful Names
**Bad:**
```java
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
**Bad:** `makeCircle(double x, double y, double radius)`
**Good:** `makeCircle(Point center, double radius)` (Group related arguments into objects)

### Error Handling
**Bad:**
```java
if (deletePage(page) == E_OK) {
  if (registry.deleteReference(page.name) == E_OK) {
    // ... deeply nested logic
  }
}
```

**Good:**
```java
try {
  deletePage(page);
  registry.deleteReference(page.name);
} catch (Exception e) {
  logError(e);
}
```

## Decision Frameworks

### Objects vs. Data Structures
*   **Use Objects when:** You expect to add new **data types** frequently. (OO makes adding classes easy, but adding functions hard).
*   **Use Data Structures when:** You expect to add new **functions** frequently. (Procedural code makes adding functions easy, but adding data types hard).

### Exception Handling
*   **Checked Exceptions:** Avoid in general. They violate OCP by forcing signature changes up the call stack.
*   **Unchecked Exceptions:** Preferred for most scenarios.

### Refactoring Timing
*   **Immediate:** When you touch the code (Boy Scout Rule).
*   **Preventive:** Before checking in.
*   **Never:** "Later."

## Prerequisites and Context

*   **Agile/Scrum:** The principles assume an iterative environment where code is read frequently and refactored constantly.
*   **Language:** While examples are Java-centric, principles apply to any Object-Oriented or procedural language.
*   **Professionalism:** These practices require a shift from "getting it working" to "getting it right" as a matter of professional ethics.