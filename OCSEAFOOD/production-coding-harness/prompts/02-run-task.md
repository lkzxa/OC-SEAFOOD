# Run Task Prompt

You are working inside a production coding/testing harness.

Your job is to implement exactly one current task.

Do not treat this as an open-ended coding session.

Do not implement future tasks.

## Required Reading

Before coding, read these files in order:

1. `.harness/AGENTS.md`
2. `.harness/rules.md`
3. `.harness/task.md`
4. `.harness/risk.md`
5. `.harness/test-plan.md`
6. `.harness/commands.md`
7. `.harness/test-matrix.md`
8. `.harness/decisions.md`

Do not start coding until you understand the current task scope.

## Placeholder Guard

Before coding, inspect these files:

* `.harness/task.md`
* `.harness/risk.md`
* `.harness/test-plan.md`
* `.harness/commands.md`
* `.harness/test-matrix.md`

If any of these files still contain unresolved placeholders such as:

* `[Generated]`
* `[Generated behavior]`
* `[condition]`
* `[action]`
* `[expected result]`
* `[Task name]`
* `[YYYY-MM-DD]`
* `TBD`
* `TODO`
* `Fill later`

then stop immediately.

Do not code.

Report that the harness is incomplete and list the files containing placeholders.

## Current Task Rule

Implement only the current task described in:

```text
.harness/task.md
```

Do not implement anything from future tasks.

Do not implement extra features just because they appear in `input/project-brief.md`.

The project brief gives context, not permission to broaden scope.

## Scope Rule

Only edit files allowed by `.harness/task.md`.

If a required change appears to need files outside the allowed scope:

1. stop
2. explain what file or scope is needed
3. do not edit the out-of-scope file

Do not silently edit unrelated files.

## Implementation Rules

While coding:

* keep changes small
* keep changes reviewable
* prefer simple implementation over clever implementation
* do not refactor unrelated code
* do not rewrite the whole project
* do not delete tests
* do not skip tests
* do not weaken tests
* do not fake success
* do not hardcode secrets
* do not commit `.env`
* do not add unnecessary dependencies
* do not add business logic outside the current task
* do not run destructive database commands unless explicitly allowed by `.harness/task.md`

## Security Rules

Do not:

* hardcode API keys
* hardcode tokens
* hardcode passwords
* hardcode real database connection strings
* print real `.env` values
* return password hashes in API responses
* bypass authentication to make tests pass
* bypass authorization to make tests pass
* trust client-submitted `price`, `total`, `subtotal`, `discount`, `role`, or `userId`

If the current task touches backend input, validate input.

If the current task touches protected routes, enforce authentication.

If the current task touches role-based behavior, enforce authorization.

## Test Rules

Add or update automated tests according to:

```text
.harness/test-plan.md
```

Do not create meaningless tests just to satisfy the harness.

Tests must verify real behavior required by the task.

If a test cannot be automated, document the manual verification clearly in `.harness/result.md`.

## Command Rules

Run the relevant commands from:

```text
.harness/commands.md
```

Do not claim a command passed unless it was actually run.

If a command does not exist, report it honestly in:

```text
.harness/result.md
```

Do not mark unavailable commands as passed.

## Failure Handling

If build, lint, runtime verification, or tests fail:

1. update `.harness/fix-loop.md`
2. record the exact failing command
3. record expected behavior
4. record actual behavior
5. identify suspected root cause
6. make the smallest safe fix
7. rerun the failed command first
8. if it passes, run the full relevant command set
9. update `.harness/test-matrix.md`
10. update `.harness/result.md`

Do not perform broad unrelated refactors to fix a local failure.

If the same failure is not resolved after 3 focused attempts, stop and mark the issue as blocked in `.harness/fix-loop.md`.

## Required Updates After Coding

After implementation, update:

* `.harness/test-matrix.md`
* `.harness/result.md`

If a command failed at any point, update:

* `.harness/fix-loop.md`

If an important technical decision was made, update:

* `.harness/decisions.md`

## Test Matrix Update Rules

For every row in `.harness/test-matrix.md`:

* change `Pending` to `Passed`, `Failed`, `Blocked`, or `Not Applicable`
* add concise evidence
* reference exact commands for command-based checks
* reference file paths for configuration/code checks
* do not leave rows as `Pending` unless clearly justified

Do not mark a row as `Passed` without evidence.

## Result Update Rules

`.harness/result.md` must include:

* task status
* summary
* files changed
* commands run
* install evidence
* test evidence
* build evidence
* lint evidence
* runtime evidence if relevant
* security check
* scope check
* tests passed
* tests failed
* known limitations
* remaining risks
* decisions made
* final verdict

## Completion Rule

The task is complete only when:

* implementation stayed inside allowed scope
* required tests passed
* required build/test/lint evidence was recorded
* unavailable commands were honestly documented
* security check passed
* scope check passed
* `.harness/test-matrix.md` was updated
* `.harness/result.md` was updated
* remaining risks were documented

If any required proof is missing, do not mark the task as passed.

## Output

When finished, report:

* files changed
* commands run
* tests passed
* tests failed
* build/lint status
* security/scope status
* remaining risks
* final verdict: Passed, Failed, or Blocked
