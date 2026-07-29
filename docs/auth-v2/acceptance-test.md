# Authentication V2 - Acceptance Test

## Purpose

This document defines the acceptance criteria for Authentication V2.

A feature is considered complete only when all test cases in this document pass.

---

# Test Environment

Environment:

- Frontend running
- Backend running
- Database migrated
- Google OAuth configured
- JWT enabled

---

# 1. Registration

## AT-001 Register CUSTOMER

Given

- email does not exist

When

- user submits registration form

Then

- account is created
- role = CUSTOMER
- password is stored as bcrypt hash

Status:

- [ ]

---

## AT-002 Duplicate Email

Given

- email already exists

When

- user registers again

Then

- request is rejected
- no duplicate account is created

Status:

- [ ]

---

# 2. Email Login

## AT-003 CUSTOMER Email Login

Given

- valid email
- valid password
- account role is CUSTOMER

When

- user logs in

Then

- JWT is returned
- JWT contains:
  - id
  - email
  - role

Status:

- [ ]

---

## AT-003B ADMIN Email Login

Given

- valid email
- valid password
- account role is ADMIN

When

- user logs in

Then

- return 403
- message: "Administrator accounts must sign in with Google."

Status:

- [ ]

---

## AT-004 Invalid Password

Given

- valid email
- wrong password

When

- user logs in

Then

- return 401

Status:

- [ ]

---

## AT-005 Google-only Account Password Login

Given

- account created using Google only
- password = NULL

When

- login using password

Then

- return 401
- application does not crash

Status:

- [ ]

---

# 3. Google Sign-In

## AT-006 First Google Login

Given

- Google account not found

When

- login with Google

Then

- create CUSTOMER account
- store googleId
- store avatar

Status:

- [ ]

---

## AT-007 CUSTOMER / ADMIN Google Login

Given

- googleId already exists
- account role is CUSTOMER or ADMIN

When

- login again

Then

- login succeeds
- no duplicate account

Status:

- [ ]

---

## AT-008 Account Linking

Given

- email exists
- googleId is NULL

When

- login with Google

Then

- account is linked
- googleId is saved

Status:

- [ ]

---

## AT-009 Prevent Google Hijacking

Given

- email exists
- googleId already belongs to another Google account

When

- login with different Google account

Then

- return 403
- googleId remains unchanged

Status:

- [ ]

---

## AT-010 Email Not Verified

Given

- Google email_verified = false

When

- login

Then

- request is rejected

Status:

- [ ]

---

# 4. Forgot Password

## AT-011 Request Reset

Given

- existing account

When

- forgot password

Then

- reset token is generated
- email is queued

Status:

- [ ]

---

## AT-012 Reset Password

Given

- valid reset token

When

- submit new password

Then

- password updated

Status:

- [ ]

---

## AT-013 Login After Reset

Given

- password reset completed

When

- login

Then

- new password works
- old password fails

Status:

- [ ]

---

# 5. Authorization

## AT-014 CUSTOMER Access

Given

- CUSTOMER JWT

When

- access admin API

Then

- access denied

Status:

- [ ]

---

## AT-015 ADMIN Access

Given

- ADMIN JWT

When

- access admin API

Then

- access granted

Status:

- [ ]

---

# 6. JWT

## AT-016 JWT Payload

Verify JWT contains only:

- id
- email
- role

Must NOT contain:

- password
- googleId
- avatar
- accessToken
- refreshToken

Status:

- [ ]

---

# 7. Security

## AT-017 Password Hash

Verify:

- bcrypt hash
- plaintext password never stored

Status:

- [ ]

---

## AT-018 Public Registration

Verify:

- public registration always creates CUSTOMER

Status:

- [ ]

---

## AT-019 Google Authorization

Verify:

- role is loaded from database
- role is never taken from Google

Status:

- [ ]

---

## AT-020 Rate Limiter

Verify rate limiter protects:

- register
- login
- forgot password

Status:

- [ ]

---

# 8. Regression

After every authentication change, verify:

- Email login works
- Google login works
- Register works
- Forgot password works
- Reset password works
- JWT middleware works
- Authorization middleware works
- AdminRouteGuard works

Status:

- [ ]

---

# Definition of Done

Authentication V2 is accepted only if:

- All acceptance tests pass.
- No regression is introduced.
- No duplicate user is created.
- No privilege escalation is possible.
- JWT format remains unchanged.
- Google OAuth is used only for identity verification.
- Authorization is always determined by the database.