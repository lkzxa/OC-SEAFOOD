# Test Plan

## Task

TASK-0020: Implement Shopping Cart UI and Virtual Checkout Form with 3-tier address selection

## Scope

Frontend cart and checkout flow under `frontend/src/app/cart/page.tsx`, using Zustand cart/auth stores and static Vietnam location data.

## Test Cases

### TC-001: Empty cart state
* Render `/cart` with empty cart store.
* Expect empty message and link back to menu/store.

### TC-002: Cart item list and totals
* Seed cart store with products.
* Expect product name, unit, quantity, line subtotal, and estimated total.

### TC-003: Logged-in customer prefill
* Seed auth store with user profile.
* Expect full name and email fields to prefill.

### TC-004: 3-tier address selection
* District select is disabled until province is selected.
* Ward select is disabled until district is selected.
* Province/district changes reset dependent selections.

### TC-005: Client validation
* Invalid email is blocked with visible error.
* Invalid Vietnamese phone is blocked with visible error.

### TC-006: Checkout submit payload
* Submit with valid form data.
* Expect `/api/checkout` called with `productId` and `quantity` only for items.
* Expect human-readable Vietnamese address names in payload.
* Expect logged-in checkout to send `Authorization: Bearer <token>`.

### TC-007: Checkout success state
* Mock successful checkout response.
* Expect success UI with order code, customer info, address and estimated total.
* Expect cart store cleared.

## Required Commands

* `npm run test --workspace=frontend`
* `npm run build --workspace=frontend`
* `npm run lint --workspace=frontend`
