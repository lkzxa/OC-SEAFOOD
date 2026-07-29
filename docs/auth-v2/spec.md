# Authentication V2 Specification

## 1. Overview

Authentication V2 extends the existing JWT-based authentication system by introducing Google Sign-In.

Google is used only for identity verification.

The application's authentication, authorization, session management, and role management continue to be handled entirely by the existing Express backend.

The existing email/password authentication must continue to work without modification.

---

## 2. Goals

Authentication V2 must:

- Support Google Sign-In for CUSTOMER accounts.
- Support Google Sign-In for ADMIN accounts.
- Preserve the existing JWT authentication architecture.
- Preserve the existing authorization model.
- Prevent duplicate user accounts.
- Maintain backward compatibility.

---

## 3. Non-Goals

Authentication V2 will not:

- Replace JWT with Auth.js sessions.
- Replace Zustand.
- Replace Express authentication.
- Change authorization rules.
- Remove email/password login.

---

## 4. Functional Requirements

### FR-01

Users can register using email and password.

---

### FR-02

Users can log in using email and password.

---

### FR-03

Users can sign in using Google.

---

### FR-04

Google authentication must return the application's own JWT.

---

### FR-05

Existing JWT middleware must continue to work.

---

### FR-06

Google Login must support both CUSTOMER and ADMIN accounts.

---

### FR-07

A new CUSTOMER account is automatically created when a Google account does not already exist.

---

### FR-08

If a Google email already exists, the account must be linked instead of creating a duplicate account.

---

### FR-09

Authorization continues to use the role stored in the database.

---

### FR-10

Forgot Password continues to work for password-based accounts.

---

## 5. Authentication Flows

### Email Login

Email

↓

Password

↓

Backend

↓

Verify Password

↓

Generate JWT

↓

Return JWT

---

### Google Login

Google

↓

Identity Verification

↓

Backend

↓

Find or Create User

↓

Generate JWT

↓

Return JWT

---

## 6. Business Rules

BR-01

One email address represents exactly one user.

---

BR-02

Google never determines application roles.

---

BR-03

The database is the only source of truth for user roles.

---

BR-04

Google Login never bypasses authorization.

---

BR-05

JWT is the only application authentication token.

---

BR-06

Google is only an identity provider.

---

## 7. User Scenarios

### Scenario 1

A new user signs in with Google.

Expected:

A CUSTOMER account is automatically created.

---

### Scenario 2

An existing CUSTOMER signs in with Google using the same email.

Expected:

The existing account is linked.

No duplicate account is created.

---

### Scenario 3

An ADMIN signs in with Google.

Expected:

The existing ADMIN account is used.

Role remains ADMIN.

---

### Scenario 4

A user signs in with email/password.

Expected:

Existing behavior remains unchanged.

---

## 8. API Behavior

Google Login endpoint must:

- Verify Google identity.
- Find existing user.
- Create user if necessary.
- Generate application JWT.
- Return JWT and user profile.

---

## 9. Database Requirements

The User model must support Google authentication.

Existing users must remain compatible.

Database migrations must preserve existing data.

---

## 10. Security Requirements

Passwords continue to use bcrypt.

JWT continues to be signed by the backend.

Roles continue to be validated by authorization middleware.

Google identity must be verified before creating or linking accounts.

No privilege escalation is allowed.

---

## 11. Error Handling

Google account cannot be verified.

↓

Return authentication error.

---

JWT generation fails.

↓

Return server error.

---

Database update fails.

↓

Rollback the operation.

---

Duplicate account detected.

↓

Link the existing account.

Never create a second user.

---

## 12. Acceptance Criteria

Authentication V2 is complete when:

✓ Email Login works.

✓ Google Login works.

✓ Admin Login works.

✓ CUSTOMER Login works.

✓ JWT generation is unchanged.

✓ Existing middleware works.

✓ Existing authorization works.

✓ Forgot Password works.

✓ Reset Password works.

✓ No duplicate accounts are created.

✓ Existing users remain compatible.

✓ No regression is introduced.