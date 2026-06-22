# Agent Entry

You are working inside a production coding/testing harness.

This harness controls one task only.

Do not treat this repository like a normal open-ended coding session.

## Required Reading Order

Before coding, read these files in order:

1. `.harness/rules.md`
2. `.harness/task.md`
3. `.harness/risk.md`
4. `.harness/test-plan.md`
5. `.harness/commands.md`

Do not start coding before understanding the current task scope.

## Placeholder Guard

Before coding, check these files for unresolved placeholders:

* `.harness/task.md`
* `.harness/risk.md`
* `.harness/test-plan.md`
* `.harness/commands.md`
* `.harness/test-matrix.md`

If any required execution file still contains placeholders such as:

* `[Generated]`
* `[Generated behavior]`
* `[condition]`
* `[action]`
* `[expected result]`

then do not code.

Instead, stop and report that the harness is incomplete.

## Current Task Rule

Only implement the task described in:

```text
.harness/task.md
```

Do not implement future tasks.

Do not implement features from `input/project-brief.md` unless they are explicitly included in `.harness/task.md`.

## Scope Rule

Only edit files allowed by `.harness/task.md`.

If a needed change is outside the allowed scope, stop and report the issue.

Do not silently edit unrelated files.

## Priority Order

When making decisions, follow this priority order:

1. Correctness
2. Tests
3. Security
4. Data integrity
5. Minimal change scope
6. Maintainability
7. Developer convenience

Do not trade security or correctness for speed.

## Coding Rules

While coding:

* keep changes small
* avoid unrelated refactors
* avoid rewriting working code
* do not delete tests to make the build pass
* do not weaken tests to make the build pass
* do not fake success
* do not hardcode secrets
* do not commit `.env`
* do not bypass authentication or authorization
* do not trust client-submitted price, total, role, or userId
* do not run destructive database commands unless the task explicitly allows it

## Required Command Evidence

After coding, run the commands required by:

```text
.harness/commands.md
```

If a command does not exist, report it clearly.

Do not claim a command passed unless it was actually run.

## Required Updates After Coding

After coding, update:

* `.harness/result.md`
* `.harness/test-matrix.md`

If build, lint, or tests fail, also update:

* `.harness/fix-loop.md`

If an important technical decision was made, also update:

* `.harness/decisions.md`

## Fix Loop Rule

When a build or test fails:

1. identify the failing command
2. identify the expected behavior
3. identify the actual behavior
4. identify the suspected root cause
5. make the smallest safe fix
6. rerun the failed command first
7. if it passes, run the full relevant test suite
8. update `.harness/result.md`
9. update `.harness/fix-loop.md`

Do not perform broad unrelated refactors to fix a local failure.

## Completion Rule

A task is complete only when:

* implementation stays within allowed scope
* required tests pass
* required build/lint commands pass or are clearly reported as not available
* `.harness/result.md` is updated
* `.harness/test-matrix.md` is updated
* remaining risks are documented

If any required proof is missing, the task is not complete.
