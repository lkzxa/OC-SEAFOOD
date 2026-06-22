# Test Matrix

Generated from:

* `.harness/task.md`
* `.harness/test-plan.md`
* `.harness/commands.md`

## Status Legend

* Pending: Not run yet
* Passed: Verified and passed
* Failed: Run but failed
* Blocked: Could not run because of missing dependency, missing script, or environment issue
* Not Applicable: Not required for this task

| Test ID | Behavior | Type | Status | Evidence |
| ------- | -------- | ---- | ------ | -------- |
| TC-001 | Empty cart state renders correctly | Unit/UI | Passed | Covered by `frontend/src/__tests__/checkout.test.tsx`; full frontend test suite passed |
| TC-002 | Cart item list, quantity and totals render correctly | Unit/UI | Passed | Covered by `checkout.test.tsx`; full frontend test suite passed |
| TC-003 | Logged-in customer prefill works | Unit/UI | Passed | Covered by `checkout.test.tsx`; full frontend test suite passed |
| TC-004 | 3-tier address selector enables/resets dependent fields | Unit/UI | Passed | Covered by `checkout.test.tsx`; full frontend test suite passed |
| TC-005 | Client validation blocks invalid email and phone | Unit/UI | Passed | Covered by `checkout.test.tsx`; full frontend test suite passed |
| TC-006 | Checkout submit sends product IDs/quantities, address names and auth header | Integration | Passed | Covered by updated `checkout.test.tsx`; full frontend test suite passed |
| TC-007 | Checkout success state displays order and clears cart | Integration | Passed | Covered by `checkout.test.tsx`; full frontend test suite passed |

## Command Evidence

* `npm run test --workspace=frontend`: 10 files passed, 45 tests passed.
* `npm run build --workspace=frontend`: passed, generated 11/11 static pages.
* `npm run lint --workspace=frontend`: passed with 13 existing `<img>` warnings and 0 errors.
