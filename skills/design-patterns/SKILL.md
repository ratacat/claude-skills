---
name: design-patterns
description: "Recommends and applies software design patterns (Factory, Strategy, Observer, Decorator, Repository, and more) to solve structural code problems. Use when designing architecture, refactoring structure, or when code exhibits tight coupling, rigid hierarchies, scattered responsibilities, or is difficult to test."
---

# Design Patterns

## Overview

Patterns are templates you adapt to your context, not blueprints to copy. Use the right pattern when it genuinely simplifies your design—not to impress or over-engineer. Apply standard SOLID principles; the patterns below embody them.

## Pattern Application Workflow

1. **Identify symptom** — Use the "By Symptom" table below to match code smells to candidate patterns.
2. **Select pattern** — Use the "By Problem Type" tree to narrow to the best fit. Consider simpler alternatives first.
3. **Implement minimally** — Apply the pattern to the specific problem. See the linked reference file for details.
4. **Verify** — Confirm the symptom is resolved and the added complexity is justified. If the pattern feels forced, reconsider.

## Pattern Selection Guide

### By Problem Type

```
CREATING OBJECTS
├── Complex/conditional creation ──────────→ Factory Method
├── Families of related objects ───────────→ Abstract Factory
├── Step-by-step construction ─────────────→ Builder
├── Clone existing objects ────────────────→ Prototype
└── Single instance needed ────────────────→ Singleton (use sparingly!)

STRUCTURING/COMPOSING OBJECTS
├── Incompatible interface ────────────────→ Adapter
├── Simplify complex subsystem ────────────→ Facade
├── Tree/hierarchy structure ──────────────→ Composite
├── Add behavior dynamically ──────────────→ Decorator
└── Control access to object ──────────────→ Proxy

MANAGING COMMUNICATION/BEHAVIOR
├── One-to-many notification ──────────────→ Observer
├── Encapsulate requests as objects ───────→ Command
├── Behavior varies by internal state ─────→ State
├── Swap algorithms at runtime ────────────→ Strategy
├── Algorithm skeleton with hooks ─────────→ Template Method
├── Reduce N-to-N communication ───────────→ Mediator
└── Sequential handlers ───────────────────→ Chain of Responsibility

MANAGING DATA ACCESS
├── Abstract data source ──────────────────→ Repository
├── Track changes for atomic commit ───────→ Unit of Work
├── Ensure object identity ────────────────→ Identity Map
├── Defer expensive loading ───────────────→ Lazy Load
├── Map objects to database ───────────────→ Data Mapper
└── Shape data for transfer ───────────────→ DTO
```

### By Symptom

| Symptom | Consider |
|---------|----------|
| Giant switch/if-else on type | Strategy, State, or polymorphism |
| Duplicate code across classes | Template Method, Strategy |
| Need to notify many objects of changes | Observer |
| Complex object creation logic | Factory, Builder |
| Adding features bloats class | Decorator |
| Third-party API doesn't fit your code | Adapter |
| Too many dependencies between components | Mediator, Facade |
| Can't test without database/network | Repository, Dependency Injection |
| Need undo/redo | Command |
| Object behavior depends on state | State |
| Request needs processing by multiple handlers | Chain of Responsibility |

### Domain Logic: Transaction Script vs Domain Model

| Factor | Transaction Script | Domain Model |
|--------|-------------------|--------------|
| Logic complexity | Simple (< 500 lines) | Complex, many rules |
| Business rules | Few, straightforward | Many, interacting |
| Operations | CRUD-heavy | Rich behavior |
| Team/timeline | Small team, quick delivery | Long-term maintenance |
| Testing | Integration tests | Unit tests on domain |

**Rule of thumb:** Start with Transaction Script. Refactor to Domain Model when procedural code becomes hard to maintain.

## Quick Reference

### Tier 1: Essential Patterns (Master First)

| Pattern | One-Line | When to Use | Reference |
|---------|----------|-------------|-----------|
| **Strategy** | Encapsulate interchangeable algorithms | Multiple ways to do something, swap at runtime | [strategy.md](patterns/strategy.md) |
| **Observer** | Notify dependents of state changes | Event systems, reactive updates | [observer.md](patterns/observer.md) |
| **Factory** | Encapsulate object creation | Complex/conditional instantiation | [factory.md](patterns/factory.md) |
| **Decorator** | Add behavior dynamically | Extend without inheritance | [decorator.md](patterns/decorator.md) |
| **Command** | Encapsulate requests as objects | Undo/redo, queuing, logging | [command.md](patterns/command.md) |

### Tier 2: Structural Patterns

| Pattern | One-Line | When to Use | Reference |
|---------|----------|-------------|-----------|
| **Adapter** | Convert interfaces | Integrate incompatible code | [adapter.md](patterns/adapter.md) |
| **Facade** | Simplify complex subsystems | Hide complexity behind simple API | [facade.md](patterns/facade.md) |
| **Composite** | Uniform tree structures | Part-whole hierarchies | [composite.md](patterns/composite.md) |
| **Proxy** | Control access to objects | Lazy load, access control, caching | [proxy.md](patterns/proxy.md) |

### Tier 3: Enterprise/Architectural Patterns

| Pattern | One-Line | When to Use | Reference |
|---------|----------|-------------|-----------|
| **Repository** | Collection-like data access | Decouple domain from data layer | [repository.md](patterns/repository.md) |
| **Unit of Work** | Coordinate atomic changes | Transaction management | [unit-of-work.md](patterns/unit-of-work.md) |
| **Service Layer** | Orchestrate business operations | Define application boundary | [service-layer.md](patterns/service-layer.md) |
| **DTO** | Shape data for transfer | API contracts, prevent over-exposure | [dto.md](patterns/dto.md) |

### Additional Important Patterns

| Pattern | One-Line | When to Use | Reference |
|---------|----------|-------------|-----------|
| **Builder** | Step-by-step object construction | Complex objects, fluent APIs | [builder.md](patterns/builder.md) |
| **State** | Behavior changes with state | State machines, workflow | [state.md](patterns/state.md) |
| **Template Method** | Algorithm skeleton with hooks | Framework extension points | [template-method.md](patterns/template-method.md) |
| **Chain of Responsibility** | Pass request along handlers | Middleware, pipelines | [chain-of-responsibility.md](patterns/chain-of-responsibility.md) |
| **Mediator** | Centralize complex communication | Reduce component coupling | [mediator.md](patterns/mediator.md) |
| **Lazy Load** | Defer expensive loading | Performance, large object graphs | [lazy-load.md](patterns/lazy-load.md) |
| **Identity Map** | Ensure object identity | ORM, prevent duplicates | [identity-map.md](patterns/identity-map.md) |

## Common Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| **Pattern Overuse** | Simple operations require navigating many classes | Only use when solving real problem |
| **Wrong Pattern** | Code feels forced, awkward | Re-examine actual problem |
| **Inheritance Abuse** | Deep hierarchies, fragile base class | Favor composition (Strategy, Decorator) |
| **Singleton Abuse** | Global state, hidden dependencies, hard to test | Use dependency injection instead |
| **Premature Abstraction** | Interfaces with single implementation | Wait for real need to vary |

## Anti-Patterns to Recognize

- **God Object:** One class does everything → Split using SRP
- **Anemic Domain Model:** Objects are just data bags → Move behavior to objects
- **Golden Hammer:** Same pattern everywhere → Match pattern to problem
- **Lava Flow:** Dead code nobody removes → Delete it, VCS has your back

## Modern Variations

| Modern Pattern | Based On | Description |
|----------------|----------|-------------|
| **Dependency Injection** | Strategy + Factory | Container creates and injects dependencies |
| **Middleware** | Decorator + Chain of Responsibility | Request/response pipeline |
| **Event Sourcing** | Command | Store state changes as events |
| **CQRS** | Command/Query separation | Separate read/write models |
| **Hooks (React/Vue)** | Observer + Strategy | Functional lifecycle subscriptions |

## Implementation Checklist

Before implementing a pattern:

- [ ] Pattern solves a real problem in this codebase
- [ ] Considered simpler alternatives
- [ ] Trade-offs acceptable for this context
- [ ] Team understands the pattern
- [ ] Won't over-engineer the solution
