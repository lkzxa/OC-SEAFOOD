# Harness Rules

These rules control how the AI coding agent must work inside this production coding/testing harness.

This harness controls one task only.

The current task is defined in:

```text
.harness/task.md
```

## Core Rules

1. Implement only the current task in `.harness/task.md`.
2. Do not implement future tasks.
3. Do not refactor unrelated code.
4. Do not rewrite the whole project.
5. Do not delete tests to make the build pass.
6. Do not weaken assertions or validation to pass tests.
7. Do not fake success.
8. Do not claim a command passed unless it was actually run.
9. Do not change public API behavior unless the task requires it.
10. Run the commands listed in `.harness/commands.md`.
11. If build, lint, runtime, or tests fail, fix the root cause using `.harness/fix-loop.md`.
12. Update `.harness/result.md` after finishing.
13. Update `.harness/test-matrix.md` after finishing.
14. Update `.harness/decisions.md` if an important technical decision was made.

## Placeholder Rules

Before coding, check these files:

* `.harness/task.md`
* `.harness/risk.md`
* `.harness/test-plan.md`
* `.harness/commands.md`
* `.harness/test-matrix.md`

Do not code if any execution file still contains unresolved placeholders such as:

* `[Generated]`
* `[Generated behavior]`
* `[condition]`
* `[action]`
* `[expected result]`

If placeholders remain, stop and report that the harness is incomplete.

## Scope Rules

Only edit files allowed by `.harness/task.md`.

For TASK-0001, the allowed implementation scope is:

* root setup files
* root `package.json`
* root `package-lock.json` if generated or updated by npm
* root `.gitignore` if needed
* `frontend/`
* `backend/`

Allowed harness reporting files:

* `.harness/result.md`
* `.harness/test-matrix.md`
* `.harness/fix-loop.md` if a failure occurs
* `.harness/decisions.md` if an important decision is made

Do not edit unrelated files.

If a needed change is outside allowed scope, stop and report it.

## Production Rules

1. Validate all external input when a task touches backend input.
2. Check authentication for protected actions when a task touches protected routes.
3. Check authorization for role-based actions when a task touches role-based behavior.
4. Do not trust client-submitted `price`, `total`, `subtotal`, `discount`, `role`, or `userId`.
5. Preserve data integrity.
6. Avoid destructive changes unless explicitly required.
7. Add regression tests for bug fixes.
8. Keep changes small and reviewable.
9. Do not introduce new dependencies unless necessary.
10. If a risky decision is made, document it in `.harness/decisions.md`.

## Security Rules

The AI coding agent must not:

* hardcode secrets
* commit `.env`
* print real `.env` values
* expose API keys
* expose tokens
* expose passwords
* expose real database connection strings
* log raw customer personal data
* return password hashes in API responses
* bypass authentication to make tests pass
* bypass authorization to make tests pass
* weaken validation to make tests pass

For TASK-0001 specifically:

* do not create a real `.env` file
* use `.env.example` only if environment examples are needed
* ensure `.env` is ignored if `.gitignore` is touched
* do not add auth, database, checkout, order, email, Telegram, or admin logic

## Command Rules

Use `.harness/commands.md` as the command source of truth.

Prefer running commands from the repository root.

Prefer npm workspace commands:

```bash
npm run test --workspace=backend
npm run test --workspace=frontend
npm run build --workspace=frontend
npm run build --workspace=backend
```

Do not use `cd frontend` or `cd backend` unless absolutely necessary.

If a command does not exist, report it clearly in `.harness/result.md`.

Do not mark unavailable commands as passed.

## Test Rules

Required test behavior is defined in:

```text
.harness/test-plan.md
```

Test status must be tracked in:

```text
.harness/test-matrix.md
```

The AI coding agent must not:

* remove tests
* weaken tests
* skip failing tests without reporting
* leave test results undocumented
* use watch mode for automated test evidence

For TASK-0001:

* backend test must cover `GET /health`
* frontend test must run in non-watch mode
* backend test must run in non-watch mode

## Fix Loop Rules

When a command or test fails:

1. identify the failing command
2. identify the failing test if any
3. identify expected behavior
4. identify actual behavior
5. identify suspected root cause
6. make the smallest safe code change
7. rerun the failed command first
8. if it passes, run the full relevant command set
9. update `.harness/fix-loop.md`
10. update `.harness/result.md`
11. update `.harness/test-matrix.md`

Do not perform broad unrelated refactors to fix a local failure.

If the same failure is not resolved after 3 focused attempts, stop and mark the issue as blocked.

## Forbidden

* Large refactor without task approval
* Ignoring failed tests
* Removing tests
* Weakening tests
* Hardcoding only to satisfy one test
* Changing unrelated files
* Implementing out-of-scope features
* Running destructive database commands
* Running Prisma commands in TASK-0001
* Creating fake scripts just to satisfy acceptance criteria
* Claiming command success without evidence
* Hiding remaining risks

## TASK-0001 Specific Forbidden Work

Do not implement:

* product catalog
* cart logic
* checkout logic
* lead/order logic
* authentication
* authorization
* roles
* Prisma
* PostgreSQL connection
* database schema
* email integration
* Telegram integration
* notification outbox
* Admin Dashboard
* deployment setup

## Completion Rules

A task is complete only when:

* implementation stays within allowed scope
* required tests pass
* required command evidence is recorded
* missing commands are honestly documented
* `.harness/result.md` is updated
* `.harness/test-matrix.md` is updated
* `.harness/fix-loop.md` is updated if failures occurred
* `.harness/decisions.md` is updated if important decisions were made
* security check passes
* scope check passes
* remaining risks are documented

If any required proof is missing, the task is not complete.
