# Mermaid Cheat Sheet

Quick reference for common Mermaid patterns.

---

## Flowchart (Quick Start)

```mermaid
flowchart LR
    A[Start] --> B{Decision}
    B -->|Yes| C[Do thing]
    B -->|No| D[Skip]
    C --> E[End]
    D --> E
```

**Directions:** `TB` `TD` `BT` `LR` `RL`

**Shapes:**
```
[rect]  (rounded)  ((circle))  {diamond}  {{hexagon}}
[(cylinder)]  [[subroutine]]  ([stadium])  >asymmetric]
```

**Arrows:**
```
-->      Arrow
---      Line
-.->     Dotted arrow
==>      Thick arrow
--o      Circle end
--x      Cross end
<-->     Bidirectional
```

**With text:** `A -->|label| B` or `A -- label --> B`

---

## Sequence Diagram (Quick Start)

```mermaid
sequenceDiagram
    participant A as Alice
    participant B as Bob

    A->>B: Hello
    B-->>A: Hi there
    A->>+B: Request
    B-->>-A: Response
```

**Arrows:**
```
->      Solid, no head
->>     Solid with head
-->     Dotted, no head
-->>    Dotted with head
-x      Solid with X
-)      Async (open arrow)
```

**Activation:** `+` activates, `-` deactivates

**Blocks:**
```
loop Label        alt Condition       opt Optional
    ...               ...                 ...
end               else                end
                      ...
                  end

par Action 1      critical Section
    ...           option Fallback
and Action 2          ...
    ...           end
end
```

---

## Class Diagram (Quick Start)

```mermaid
classDiagram
    class Animal {
        +String name
        -int age
        +speak()
        #move(dist) int
    }
    Animal <|-- Dog
    Animal <|-- Cat
```

**Visibility:** `+` public, `-` private, `#` protected, `~` package

**Relationships:**
```
<|--    Inheritance
*--     Composition
o--     Aggregation
-->     Association
..>     Dependency
..|>    Realization
```

---

## State Diagram (Quick Start)

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Running : start
    Running --> Paused : pause
    Paused --> Running : resume
    Running --> [*] : finish
```

**Special states:** `[*]` (start/end), `<<choice>>`, `<<fork>>`, `<<join>>`

**Composite:**
```
state Active {
    [*] --> Running
    Running --> Stopped
}
```

---

## ER Diagram (Quick Start)

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE_ITEM : contains

    CUSTOMER {
        int id PK
        string name
    }
```

**Cardinality:**
```
||    Exactly one
o|    Zero or one
|{    One or more
o{    Zero or more
```

Read: left to right. `||--o{` = one-to-many

---

## Gantt (Quick Start)

```mermaid
gantt
    title Project Plan
    dateFormat YYYY-MM-DD

    section Phase 1
    Research    :a1, 2024-01-01, 10d
    Design      :a2, after a1, 7d

    section Phase 2
    Build       :a3, after a2, 14d
```

**Task states:** `:done`, `:active`, `:crit`

---

## Pie Chart

```mermaid
pie title Market Share
    "Chrome" : 65
    "Firefox" : 15
    "Safari" : 12
    "Other" : 8
```

---

## Mindmap

```mermaid
mindmap
    root((Project))
        Frontend
            React
            CSS
        Backend
            API
            Database
```

**Shapes:** `[square]` `(rounded)` `((circle))` `{{hexagon}}`

---

## Timeline

```mermaid
timeline
    title Company History
    section Founding
        2020 : Started
        2021 : First product
    section Growth
        2023 : Series A
        2024 : Expansion
```

---

## Quadrant Chart

```mermaid
quadrantChart
    title Priority Matrix
    x-axis Low Effort --> High Effort
    y-axis Low Impact --> High Impact
    quadrant-1 Do First
    quadrant-2 Schedule
    quadrant-3 Delegate
    quadrant-4 Eliminate

    Task A: [0.2, 0.8]
    Task B: [0.7, 0.6]
    Task C: [0.3, 0.3]
```

---

## Git Graph

```mermaid
gitGraph
    commit
    branch develop
    checkout develop
    commit
    checkout main
    merge develop
    commit tag: "v1.0"
```

---

## User Journey

```mermaid
journey
    title User Onboarding
    section Sign Up
        Visit site: 3: User
        Create account: 4: User
    section First Use
        Complete tutorial: 5: User
        Invite team: 2: User, Admin
```

Score: 1 (frustrated) to 5 (happy)

---

## Configuration

**Theme (in frontmatter):**
```
---
config:
    theme: forest
---
```

**Theme (inline):**
```
%%{init: {'theme': 'dark'}}%%
```

**Themes:** `default` `forest` `dark` `neutral` `base`

---

## Comments

```
%% This is a comment
```

---

## Common Patterns

### Decision Tree
```mermaid
flowchart TD
    A{Start} --> B{Question 1?}
    B -->|Yes| C{Question 2?}
    B -->|No| D[Result A]
    C -->|Yes| E[Result B]
    C -->|No| F[Result C]
```

### API Flow
```mermaid
sequenceDiagram
    Client->>+Server: POST /api/data
    Server->>DB: INSERT
    DB-->>Server: OK
    Server-->>-Client: 201 Created
```

### System Architecture
```mermaid
flowchart TB
    subgraph Frontend
        UI[Web App]
    end
    subgraph Backend
        API[REST API]
        Worker[Job Queue]
    end
    subgraph Data
        DB[(PostgreSQL)]
        Cache[(Redis)]
    end

    UI --> API
    API --> DB
    API --> Cache
    API --> Worker
    Worker --> DB
```

### State Machine
```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Review : submit
    Review --> Published : approve
    Review --> Draft : reject
    Published --> Archived : archive
    Archived --> [*]
```
