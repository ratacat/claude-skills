# Mermaid Syntax Reference

Complete syntax reference for all Mermaid diagram types.

## Diagram Types Overview

| Diagram Type | Keyword | Description |
|-------------|---------|-------------|
| Flowchart | `flowchart` | Process flows, algorithms, workflows |
| Sequence | `sequenceDiagram` | Interactions between participants over time |
| Class | `classDiagram` | OOP class structures and relationships |
| State | `stateDiagram-v2` | State machines and transitions |
| ER Diagram | `erDiagram` | Entity relationships and database schemas |
| Gantt | `gantt` | Project timelines and scheduling |
| Pie Chart | `pie` | Distribution/proportion visualization |
| Mindmap | `mindmap` | Hierarchical idea mapping |
| Timeline | `timeline` | Chronological events |
| Quadrant | `quadrantChart` | 2D categorization (priority matrices) |
| Git Graph | `gitGraph` | Branch and merge visualization |
| User Journey | `journey` | User experience mapping |
| Sankey | `sankey` | Flow quantities between nodes |
| XY Chart | `xychart` | Line/bar charts with axes |
| Block | `block` | Block diagrams |
| Kanban | `kanban` | Kanban boards |
| Architecture | `architecture` | System architecture |

---

## 1. Flowchart

### Direction
```
flowchart TD    %% Top-Down (default)
flowchart TB    %% Top-Bottom (same as TD)
flowchart BT    %% Bottom-Top
flowchart LR    %% Left-Right
flowchart RL    %% Right-Left
```

### Node Shapes

| Shape | Syntax | Example |
|-------|--------|---------|
| Rectangle | `A[text]` | `A[Process]` |
| Rounded | `A(text)` | `A(Start)` |
| Stadium | `A([text])` | `A([Terminal])` |
| Subroutine | `A[[text]]` | `A[[Subroutine]]` |
| Cylinder | `A[(text)]` | `A[(Database)]` |
| Circle | `A((text))` | `A((Event))` |
| Diamond | `A{text}` | `A{Decision}` |
| Hexagon | `A{{text}}` | `A{{Preparation}}` |
| Parallelogram | `A[/text/]` | `A[/Input/]` |
| Parallelogram Alt | `A[\text\]` | `A[\Output\]` |
| Trapezoid | `A[/text\]` | `A[/Manual/]` |
| Trapezoid Alt | `A[\text/]` | `A[\Priority/]` |
| Double Circle | `A(((text)))` | `A(((Stop)))` |
| Asymmetric | `A>text]` | `A>Flag]` |

### Links/Arrows

| Type | Syntax | Description |
|------|--------|-------------|
| Arrow | `A --> B` | Solid line with arrow |
| Open | `A --- B` | Solid line, no arrow |
| Text on arrow | `A -->|text| B` | Arrow with label |
| Text on link | `A -- text --> B` | Alternative label syntax |
| Dotted | `A -.-> B` | Dotted line with arrow |
| Dotted open | `A -.- B` | Dotted line, no arrow |
| Thick | `A ==> B` | Thick line with arrow |
| Thick open | `A === B` | Thick line, no arrow |
| Invisible | `A ~~~ B` | Hidden link (for layout) |
| Circle end | `A --o B` | Line with circle end |
| Cross end | `A --x B` | Line with X end |
| Multi-directional | `A <--> B` | Arrows both directions |

### Link Length

Add extra dashes for longer links:
```
A --> B       %% Normal
A ---> B      %% Longer
A ----> B     %% Even longer
```

### Subgraphs

```
flowchart TB
    subgraph one[Title One]
        A --> B
    end
    subgraph two[Title Two]
        C --> D
    end
    one --> two
```

### Styling

```
flowchart LR
    A --> B --> C

    %% Style individual nodes
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#f66,stroke-dasharray: 5 5

    %% Define and apply classes
    classDef green fill:#9f6,stroke:#333
    classDef red fill:#f66,stroke:#333
    class A green
    class B,C red
```

### Comments
```
%% This is a comment
```

---

## 2. Sequence Diagram

### Participants

```
sequenceDiagram
    participant A as Alice
    participant B as Bob
    actor U as User
```

**Participant types:**
- `participant` - Box (default)
- `actor` - Stick figure
- `boundary` - System boundary
- `control` - Control flow
- `entity` - Data entity
- `database` - Cylinder
- `collections` - Stacked boxes
- `queue` - Queue symbol

### Messages

| Syntax | Description |
|--------|-------------|
| `A->B: msg` | Solid line, no arrow |
| `A-->B: msg` | Dotted line, no arrow |
| `A->>B: msg` | Solid line with arrowhead |
| `A-->>B: msg` | Dotted line with arrowhead |
| `A-xB: msg` | Solid line with X |
| `A--xB: msg` | Dotted line with X |
| `A-)B: msg` | Solid line with open arrow (async) |
| `A--)B: msg` | Dotted line with open arrow (async) |
| `A<<->>B: msg` | Bidirectional |

### Activations

```
sequenceDiagram
    Alice->>+John: Request       %% + activates
    John-->>-Alice: Response     %% - deactivates

    %% Or explicit
    activate John
    deactivate John
```

### Notes

```
Note right of Alice: Text here
Note left of Bob: Text here
Note over Alice: Text here
Note over Alice,Bob: Spans both
```

### Control Flow

```
%% Loops
loop Every minute
    Alice->>Bob: Ping
end

%% Conditionals
alt Success
    Alice->>Bob: OK
else Failure
    Alice->>Bob: Error
end

%% Optional
opt Extra processing
    Bob->>Alice: Details
end

%% Parallel
par Alice to Bob
    Alice->>Bob: Hello
and Alice to John
    Alice->>John: Hello
end

%% Critical section
critical Establish connection
    Service->>DB: Connect
option Timeout
    Service->>Service: Retry
end

%% Break
break When error occurs
    Service->>Client: Error
end
```

### Highlighting

```
rect rgb(200, 220, 255)
    A->>B: Inside highlight
end
```

### Autonumber

```
sequenceDiagram
    autonumber
    Alice->>Bob: First (1)
    Bob->>Alice: Second (2)
```

---

## 3. Class Diagram

### Basic Class

```
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
        +move(distance)
    }
```

### Visibility Modifiers

| Symbol | Meaning |
|--------|---------|
| `+` | Public |
| `-` | Private |
| `#` | Protected |
| `~` | Package/Internal |

### Method Return Types

```
class MyClass {
    +getAge() int
    +getName() String
    +process(data) bool
}
```

### Relationships

| Type | Syntax | Description |
|------|--------|-------------|
| Inheritance | `A <\|-- B` | B extends A |
| Composition | `A *-- B` | B is part of A (strong) |
| Aggregation | `A o-- B` | B is part of A (weak) |
| Association | `A --> B` | A uses B |
| Dependency | `A ..> B` | A depends on B |
| Realization | `A ..\|> B` | B implements A |
| Link | `A -- B` | Simple link |

### Cardinality

```
classDiagram
    Customer "1" --> "*" Order : places
    Order "1" --> "1..*" LineItem : contains
```

### Annotations

```
classDiagram
    class Shape {
        <<interface>>
        +draw()
    }
    class Singleton {
        <<singleton>>
    }
    class Utility {
        <<abstract>>
    }
```

### Namespaces

```
classDiagram
    namespace Animals {
        class Dog
        class Cat
    }
```

---

## 4. State Diagram

### Basic States

```
stateDiagram-v2
    [*] --> Idle                   %% Start state
    Idle --> Running : start
    Running --> Idle : stop
    Running --> [*]                %% End state
```

### State Descriptions

```
stateDiagram-v2
    state "Waiting for input" as waiting
    [*] --> waiting
```

### Composite States

```
stateDiagram-v2
    [*] --> Active

    state Active {
        [*] --> Running
        Running --> Paused : pause
        Paused --> Running : resume
    }

    Active --> [*] : quit
```

### Forks and Joins

```
stateDiagram-v2
    state fork_state <<fork>>
    state join_state <<join>>

    [*] --> fork_state
    fork_state --> State1
    fork_state --> State2
    State1 --> join_state
    State2 --> join_state
    join_state --> [*]
```

### Choice

```
stateDiagram-v2
    state check <<choice>>

    [*] --> check
    check --> Success : valid
    check --> Failure : invalid
```

### Notes

```
stateDiagram-v2
    State1 : Description
    note right of State1
        Extended notes here
    end note
    note left of State2 : Short note
```

### Concurrency

```
stateDiagram-v2
    state Parallel {
        [*] --> A
        --
        [*] --> B
    }
```

### Direction

```
stateDiagram-v2
    direction LR
    [*] --> A --> B --> [*]
```

---

## 5. ER Diagram

### Basic Structure

```
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE_ITEM : contains
    PRODUCT ||--o{ LINE_ITEM : "is in"
```

### Cardinality

| Left | Right | Meaning |
|------|-------|---------|
| `\|o` | `o\|` | Zero or one |
| `\|\|` | `\|\|` | Exactly one |
| `}o` | `o{` | Zero or more |
| `}\|` | `\|{` | One or more |

### Full Syntax

```
<entity1> <relationship> <entity2> : <label>
```

### Entity Attributes

```
erDiagram
    CUSTOMER {
        int id PK
        string name
        string email UK
        date created_at
    }
    ORDER {
        int id PK
        int customer_id FK
        decimal total
        date order_date
    }
```

**Attribute modifiers:**
- `PK` - Primary Key
- `FK` - Foreign Key
- `UK` - Unique Key

---

## 6. Gantt Chart

### Basic Structure

```
gantt
    title Project Timeline
    dateFormat YYYY-MM-DD

    section Phase 1
    Task 1          :a1, 2024-01-01, 30d
    Task 2          :a2, after a1, 20d

    section Phase 2
    Task 3          :a3, after a2, 15d
```

### Date Formats

```
dateFormat YYYY-MM-DD
dateFormat DD-MM-YYYY
dateFormat MM-DD-YYYY
```

### Task Syntax

```
Task Name    :id, start, duration
Task Name    :id, start, end
Task Name    :id, after otherId, duration
```

### Task States

```
Done task      :done, t1, 2024-01-01, 10d
Active task    :active, t2, 2024-01-11, 10d
Critical       :crit, t3, 2024-01-21, 10d
Milestone      :milestone, m1, 2024-02-01, 0d
```

### Excludes

```
gantt
    excludes weekends
    excludes 2024-01-15, 2024-01-16
```

---

## 7. Pie Chart

```
pie title Favorite Pets
    "Dogs" : 45
    "Cats" : 35
    "Fish" : 15
    "Other" : 5
```

### Show Data

```
pie showData
    "A" : 30
    "B" : 70
```

---

## 8. Mindmap

### Basic Structure

```
mindmap
    root((Central Topic))
        Topic A
            Subtopic 1
            Subtopic 2
        Topic B
            Subtopic 3
```

### Node Shapes

```
mindmap
    root
        Square[Square]
        Rounded(Rounded)
        Circle((Circle))
        Bang))Bang((
        Cloud)Cloud(
        Hexagon{{Hexagon}}
```

### Icons

```
mindmap
    root((Main))
        Topic::icon(fa fa-book)
        Another::icon(fa fa-star)
```

### Classes

```
mindmap
    root:::important
        Normal
        Special:::highlight
```

---

## 9. Timeline

### Basic Structure

```
timeline
    title History of Events

    section Early Period
        2020 : Event A
             : Event B
        2021 : Event C

    section Recent
        2023 : Event D
        2024 : Event E : Event F
```

---

## 10. Quadrant Chart

```
quadrantChart
    title Reach vs Engagement
    x-axis Low Reach --> High Reach
    y-axis Low Engagement --> High Engagement
    quadrant-1 Promote
    quadrant-2 Review
    quadrant-3 Eliminate
    quadrant-4 Monitor

    Campaign A: [0.3, 0.6]
    Campaign B: [0.7, 0.8]
    Campaign C: [0.2, 0.2]
    Campaign D: [0.8, 0.3]
```

Values are 0-1 coordinates. Quadrants numbered 1-4 starting top-right, going counter-clockwise.

---

## 11. Git Graph

```
gitGraph
    commit
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop
    commit
    branch feature
    commit
    checkout main
    merge feature
```

### Commit Options

```
gitGraph
    commit id: "abc123"
    commit id: "Normal"
    commit id: "Reverse" type: REVERSE
    commit id: "Highlight" type: HIGHLIGHT
    commit tag: "v1.0"
```

---

## 12. User Journey

```
journey
    title My Daily Routine
    section Morning
        Wake up: 5: Me
        Coffee: 4: Me, Cat
        Commute: 2: Me
    section Work
        Meetings: 3: Me, Team
        Coding: 5: Me
```

Format: `Task: score: actors` where score is 1-5 (1=bad, 5=great).

---

## Configuration

### Frontmatter

```
---
title: My Diagram
config:
    theme: forest
---
flowchart LR
    A --> B
```

### Themes

- `default`
- `forest`
- `dark`
- `neutral`
- `base`

### Init Directive

```
%%{init: {'theme': 'forest', 'themeVariables': { 'primaryColor': '#ff0000'}}}%%
flowchart LR
    A --> B
```

---

## Tips for ASCII Rendering

When using `beautiful-mermaid` for ASCII output:

1. **Keep diagrams simple** - Complex diagrams may not render well in ASCII
2. **Use short labels** - Long text may overflow or wrap unexpectedly
3. **Prefer LR/TB directions** - These render more predictably
4. **Avoid nested subgraphs** - Stick to single-level subgraphs
5. **Test incrementally** - Build complex diagrams piece by piece
