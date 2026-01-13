---
description: 'Safely evolve the project by cleaning obsolete code, syncing database, backend, and frontend, and implementing features without assumptions'
name: 'Clean & Implement Feature End-to-End'
agent: software-engineer-agent-v1
argument-hint: 'Describe the feature or change to implement'
---

# Clean, Sync, and Implement Feature (End-to-End)

## Primary Directive
You are working on a **real production codebase**, not a demo.

Your task is to **clean, analyze, and evolve the project safely** while implementing the requested feature(s).
You must **not guess**, **not skip layers**, and **not introduce speculative logic**.

All work must follow the existing architecture, tooling, and patterns already present in the repository.

---

## Scope & Preconditions

Before writing or modifying any code:

1. **Scan the repository**
   - Identify languages, frameworks, and exact versions
   - Detect architectural style and layering
   - Locate existing Copilot instruction files and follow them strictly

2. **Understand current state**
   - Database schema
   - Backend APIs and contracts
   - Frontend data usage
   - Shared types and constraints

If required context is missing:
- **Stop**
- Ask for clarification
- Do not proceed with assumptions

---

## Mandatory Execution Order (Strict)

You must always work in this order:

### 1️⃣ Database Layer
- Review existing schemas and migrations
- Remove obsolete tables, columns, or relations
- Apply schema changes only when justified by real requirements
- Enforce constraints, indexes, and relations
- Schema is the single source of truth

❌ No backend or frontend changes before schema alignment

---

### 2️⃣ Backend Layer
- Align backend logic **exactly** with the database
- Remove dead services, controllers, and routes
- No mock data
- No hard-coded values
- Implement:
  - Validation
  - Pagination (scalable, cursor or offset as appropriate)
  - Centralized error handling
  - Authorization boundaries if applicable
- Follow existing patterns:
  - Controllers / Services / Repositories
  - Dependency injection
  - Single Responsibility Principle

---

### 3️⃣ Frontend Layer
- Consume only real backend APIs
- No fake responses or placeholder values
- Rendering strategy:
  - Prefer SSR / Server Components
  - Use CSR only when interaction requires it
- Follow existing component structure and styling system
- Components must be:
  - Modular
  - Reusable
  - Easy to reason about
- State management:
  - Use existing approach (Context, reducer, or library)
  - Do not introduce new global state patterns without need

---

## Codebase Hygiene Rules (Non-Negotiable)

- Delete unused files, folders, and code paths
- Do not comment out legacy code — **remove it**
- No duplication
- No magic numbers or strings
- Centralize constraints and constants
- Use existing `@types` or type-definition patterns
- Every file must have a clear purpose

---

## UI / UX Expectations (If Applicable)

- Support light and dark mode if already present
- Respect existing theme, spacing, and color constraints
- Ensure responsive behavior
- Avoid visual regressions
- Accessibility must match existing standards in the codebase

---

## Error Handling & Safety
- Never fail silently
- Provide meaningful errors at API and UI boundaries
- Defensive coding over optimistic assumptions
- Prefer explicit failures over undefined behavior

---

## What You Must NOT Do

❌ Do not guess business logic
❌ Do not introduce new architecture styles
❌ Do not add libraries unless already used
❌ Do not leave outdated code behind
❌ Do not break database ↔ backend ↔ frontend sync
❌ Do not optimize prematurely

---

## Output Expectations

When finished, you must:

1. Ensure database, backend, and frontend are fully synchronized
2. Leave the codebase **cleaner than before**
3. Follow all existing Copilot instruction files
4. Explain changes **only where non-obvious**
5. Produce production-ready, maintainable code

---

## Validation Checklist

Before stopping, verify:

- [ ] No unused files remain
- [ ] No mock or hard-coded data exists
- [ ] Feature works with real data
- [ ] Code follows repository patterns
- [ ] No layer was skipped
- [ ] Build and runtime remain stable

Stop immediately if any of the above cannot be satisfied.
