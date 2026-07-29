# Authentication V2 - Implementation Tasks

## Purpose

This document defines the implementation tasks for Authentication V2.

The goal is to extend the existing JWT authentication system by adding Google Sign-In while preserving the current architecture and existing functionality.

The AI coding agent must complete tasks sequentially.

---

# General Rules

- Complete one task at a time.
- Do not skip tasks.
- Do not modify unrelated files.
- Preserve backward compatibility.
- Keep the existing JWT authentication flow.
- Keep existing email/password login working.
- Stop after completing the assigned task.

---

# Task 01 - Review Existing Google Login
**[x] Status: COMPLETED**

## Objective

Understand how the current Google Login implementation works.

## Files

- backend/src/routes/auth.js

## Expected Result

- Current Google login flow is fully understood.
- Current limitations are identified.
- No code changes.

---

# Task 02 - Design Database Changes
**[x] Status: COMPLETED**

## Objective

Design the required database changes to support Google Sign-In for both CUSTOMER and ADMIN.

## Files

- backend/prisma/schema.prisma

## Expected Result

- Required fields are identified.
- Existing users remain compatible.
- No migration created yet.

---

# Task 03 - Update Prisma Schema
**[x] Status: COMPLETED**

## Objective

Update the User model based on the approved design.

## Files

- backend/prisma/schema.prisma

## Expected Result

- Schema updated.
- Prisma schema validates successfully.
- Existing data remains compatible.

---

# Task 04 - Create Database Migration
**[x] Status: COMPLETED**

## Objective

Generate and verify the Prisma migration.

## Files

- backend/prisma/migrations

## Expected Result

- Migration created successfully.
- Migration runs without errors.
- Existing data is preserved.

---

# Task 05 - Refactor Google Authentication
**[x] Status: COMPLETED**

## Objective

Refactor the existing Google authentication flow to support both CUSTOMER and ADMIN without affecting the current login system.

## Files

- backend/src/routes/auth.js

## Expected Result

- Google authentication is reusable.
- Existing Admin login continues to work.
- Email/password login is unaffected.

---

# Task 06 - Implement Account Linking
**[x] Status: COMPLETED**

## Objective

Link a Google account to an existing user when the email already exists.

## Files

- backend/src/routes/auth.js
- backend/prisma/schema.prisma

## Expected Result

- Duplicate accounts are prevented.
- One email corresponds to one user account.

---

# Task 07 - Support First-Time Google Login
**[x] Status: COMPLETED**

## Objective

Automatically create a CUSTOMER account when a new user signs in with Google for the first time.

## Files

- backend/src/routes/auth.js

## Expected Result

- New CUSTOMER accounts are created automatically.
- Default role is CUSTOMER.
- Existing role system remains unchanged.

---

# Task 08 - Generate Application JWT
**[x] Status: COMPLETED**

## Objective

Generate the application's standard JWT after successful Google authentication.

## Files

- backend/src/routes/auth.js
- backend/src/utils/jwt.js

## Expected Result

- Google Login returns the same JWT structure as email/password login.
- Existing authentication middleware works without modification.

---

# Task 09 - Update Login UI
**[x] Status: COMPLETED**

## Objective

Add a "Continue with Google" button to the existing login page.

## Files

- frontend/src/app/login/page.tsx

## Expected Result

- Existing login UI remains unchanged.
- Google Login button is displayed.
- Email/password login still works.

---

# Task 10 - Store Authentication State
**[x] Status: COMPLETED**

## Objective

Reuse the existing Zustand authentication store for Google Login.

## Files

- frontend/src/store/useAuthStore.ts

## Expected Result

- Google Login stores JWT using the existing auth store.
- No duplicate authentication state is introduced.

---

# Task 11 - Integration Testing
**[x] Status: COMPLETED**

## Objective

Verify that Authentication V2 works correctly and does not break existing functionality.

## Verify

- Register
- Email Login
- Google Login
- Admin Login
- CUSTOMER Login
- Forgot Password
- Reset Password
- JWT Authentication
- Route Protection

## Expected Result

- All authentication flows work correctly.
- No regressions are introduced.
- Existing features continue to function.

---

# Definition of Done

Authentication V2 is complete when:

- Email/password login works.
- Google Login works for CUSTOMER.
- Google Login works for ADMIN.
- Existing accounts can be linked with Google.
- JWT authentication remains unchanged.
- Existing authorization continues to work.
- Forgot Password still works.
- Reset Password still works.
- Route protection continues to work.
- No existing functionality is broken.