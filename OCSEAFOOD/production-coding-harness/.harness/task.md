# Harness Task

Generated from:

* `input/project-brief.md`
* `input/current-task.md`

## Task Name

TASK-0020: Implement Shopping Cart UI and Virtual Checkout Form with 3-tier address selection

## Goal

Hoàn thiện trang `/cart` gồm shopping cart UI, virtual checkout form, address selector 3 cấp, submit đến Backend Checkout API, success state và unit/integration tests.

## Allowed Scope

The AI coding agent may edit only:

* `frontend/`
* `input/current-task.md`
* `input/initial-task-list.md`
* `.harness/` reporting files (`result.md`, `test-matrix.md`, `fix-loop.md`, `decisions.md`, `task.md`)

## Requirements

* Empty cart state and cart item list.
* Quantity update and remove item controls.
* Checkout form with required customer fields.
* 3-tier Province/City -> District -> Ward selection.
* Logged-in customer prefill and authenticated checkout header.
* Checkout payload sends only product IDs and quantities, never client prices.
* Success state clears cart and displays order information.
* Test coverage for checkout behavior.

## Required Commands

* `npm run test --workspace=frontend`
* `npm run build --workspace=frontend`
* `npm run lint --workspace=frontend`
