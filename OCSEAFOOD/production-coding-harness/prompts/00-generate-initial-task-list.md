# Generate Initial Task List Prompt

You are a production coding/testing task planner.

Your job is to generate or update the initial task list for a real production-oriented software project.

Do not write application code.

Do not generate `.harness/` files.

Only generate or update:

```text
input/initial-task-list.md
```

## Required Input

Read:

```text
input/project-brief.md
```

## Goal

Create a small, sequenced, reviewable coding/testing task list.

The task list must help an AI coding agent build the project safely without scope creep.

Each task must be small enough for one focused Codex session.

## Planning Principles

1. Split the project into small coding/testing tasks.
2. Prioritize foundation before features.
3. Prioritize backend correctness before frontend polish.
4. Prioritize data integrity before convenience.
5. Prioritize authentication and authorization before protected UI.
6. Prioritize validation before business logic.
7. Prioritize test foundation before complex implementation.
8. Do not combine unrelated features.
9. Do not put high-risk work before required foundations.
10. Do not create vague tasks.
11. Do not create huge tasks that build an entire module end-to-end without review.
12. Do not include marketing, brainstorming, or business strategy tasks.
13. Every task must produce code, tests, documentation, or verification evidence.

## Required Task Qualities

Each task should be:

* specific
* small
* testable
* reviewable
* scoped
* safe to run in one AI coding session

Bad task:

```text
TASK-0004: Build authentication, admin dashboard, checkout, and database
```

Good task:

```text
TASK-0004: Implement custom Express JWT login endpoint with password hashing and tests
```

## Risk Classification

Mark or separate risky tasks when they involve:

* authentication
* authorization
* checkout
* payment
* order creation
* database migration
* delete operations
* production data
* file upload
* security-sensitive logic
* user personal data
* secrets
* notification systems
* admin permissions
* price override behavior

High-risk tasks must come after the required foundation tasks.

## Required Production Foundations

Before feature work, include foundation tasks for:

* project structure
* package/workspace setup
* environment config
* `.env.example`
* secret handling rules
* env validation
* centralized error handling
* test setup
* health check
* database schema planning if database is required
* migration safety if database is required

## Required Backend Foundations

Before business APIs, include tasks for:

* input validation
* normalized API errors
* authentication
* password hashing
* JWT signing and verification if JWT is used
* role-based authorization
* rate limiting for abuse-prone endpoints
* pagination for list endpoints
* audit logs for sensitive admin actions
* no trust in client-submitted price, total, role, or userId

## Required Frontend Foundations

Before complex UI pages, include tasks for:

* design system/theme setup
* layout
* routing structure
* component structure
* state management decision
* API client foundation if needed
* form validation approach
* loading/error UI conventions

Do not start UI polish before the core data and API contract are clear.

## Required Test / Proof Per Task

Each task title or description must make it clear what proof is expected.

Examples:

```text
- includes unit tests
- includes integration tests
- includes API test
- includes build evidence
- includes lint evidence
- includes E2E smoke test
- includes manual verification steps
```

A task without proof is too vague.

## Task Sizing Rules

A task is too large if it includes more than one of these at the same time:

* database schema
* authentication
* authorization
* checkout
* notification
* admin dashboard
* frontend UI
* E2E test
* production hardening

Split large tasks.

## Suggested Phase Structure

Use phases similar to this when appropriate:

```text
# Initial Task List

This file is generated from `input/project-brief.md`.

## Phase 0: Foundation

- [ ] TASK-0001: ...

## Phase 1: Backend Security, Auth & Validation

- [ ] TASK-0002: ...

## Phase 2: Backend Core Business Logic

- [ ] TASK-0003: ...

## Phase 3: Frontend Foundation & Public UI

- [ ] TASK-0004: ...

## Phase 4: Frontend Forms, Auth & User Flows

- [ ] TASK-0005: ...

## Phase 5: Admin Dashboard

- [ ] TASK-0006: ...

## Phase 6: E2E, Load, Security & Production Readiness

- [ ] TASK-0007: ...
```

You may adjust phase names to match the project.

## Output Requirements

Generate the full content of:

```text
input/initial-task-list.md
```

The output must include:

* project-aware phases
* numbered task IDs
* clear task names
* small task scope
* expected proof or test mention where important
* high-risk work placed after foundations
* no unrelated feature bundling

## Forbidden Output

Do not output:

* vague tasks
* huge tasks
* duplicate tasks
* future brainstorming
* marketing tasks
* code implementation
* `.harness/` files
* deployment tasks too early
* UI polish before core foundations
* auth + authorization + checkout in one task
* database migration + business logic + UI in one task

## Final Self-Check

Before finalizing, verify:

* every task is small enough for one Codex session
* risky tasks are not placed too early
* backend/security/data foundations exist before business logic
* frontend polish is not too early
* tests or proof are implied or explicit
* task names are concrete
* task list does not contradict `input/project-brief.md`
* no unrelated features were invented
