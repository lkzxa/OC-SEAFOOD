# Production Coding/Testing Harness

A reusable Markdown-based harness for controlling AI coding agents such as Codex, Claude Code, Cursor, or similar tools.

The goal is not to make AI code faster at any cost.

The goal is:

* keep tasks small
* keep scope controlled
* require tests
* require build/test evidence
* force safe fix loops
* reduce random AI refactors
* make coding work reviewable for real production projects
* reduce hidden bugs before code reaches real users
* make security, reliability, and maintainability visible in every task

## Folder Structure

```text
input/
├── project-brief.md
├── initial-task-list.md
├── current-task.md
└── project-commands.md

.harness/
├── AGENTS.md
├── rules.md
├── task.md
├── risk.md
├── test-plan.md
├── commands.md
├── test-matrix.md
├── result.md
├── fix-loop.md
└── decisions.md

prompts/
├── 00-generate-initial-task-list.md
├── 01-generate-harness.md
├── 02-run-task.md
├── 03-fix-loop.md
└── 04-review-result.md
```

## Basic Workflow

### For a new project

```text
project-brief.md
→ generate initial-task-list.md
→ choose one task
→ write current-task.md
→ generate .harness/
→ Codex runs task
→ build/test/fix
→ update result
→ commit
```

### For an existing project

```text
project-brief.md
→ current-task.md
→ project-commands.md
→ generate .harness/
→ Codex runs task
→ build/test/fix
→ update result
→ commit
```

## Important Rule

One harness run should control one task only.

Do not ask the AI coding agent to build a whole product in one run.

If the task is too large, split it into smaller tasks before generating `.harness/`.

## Production Gates

A task is not considered complete just because the code runs.

Each task must provide evidence for:

* install result where applicable
* build result where applicable
* test result where applicable
* lint result where applicable
* changed files
* tests added or updated
* risks introduced
* limitations
* manual verification steps if automation is not possible

The AI coding agent must not claim completion without command evidence.

## Security Gates

The AI coding agent must not:

* hardcode secrets
* commit `.env`
* print real environment values
* bypass authentication checks
* bypass authorization checks
* trust client-submitted price, role, subtotal, discount, or total
* log raw customer personal data
* log passwords, tokens, full addresses, or raw request bodies
* run destructive database commands without explicit task permission
* silently weaken validation to make tests pass

For customer-facing applications, every task that touches backend input must consider:

* input validation
* authentication
* authorization
* rate limiting
* error handling
* sensitive data exposure
* database integrity

## Performance & Load Gates

For customer-facing APIs, especially checkout, lead submission, login, and registration:

* validate input before business logic
* add rate limiting where abuse is likely
* use pagination for list APIs
* avoid loading unbounded data
* avoid synchronous dependency on Email or Telegram providers
* prefer outbox or queue pattern for notifications
* keep external integration failure isolated from core database writes

## Fix Loop Rule

When a build or test fails, the AI coding agent must:

1. identify the failing command
2. explain the likely root cause
3. make the smallest safe fix
4. rerun the failed command
5. update the result file with evidence

The AI coding agent must not rewrite unrelated modules to fix a local failure.

## Scope Control Rule

The AI coding agent must only edit files allowed by `current-task.md`.

If a needed file is outside Allowed Scope, the agent must stop and report the issue instead of editing it.

## Review Rule

Before accepting a task result, review:

* whether the task stayed inside scope
* whether tests are meaningful
* whether build/lint/test evidence exists
* whether security was weakened
* whether hidden risks remain
* whether the next task should be adjusted

## Recommended Usage

Use this harness for real projects where code quality matters.

Do not use it as a magic prompt to generate an entire product.

The harness is only useful if each task is small, testable, and reviewable.
