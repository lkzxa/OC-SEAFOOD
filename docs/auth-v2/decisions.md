# Authentication V2 - Architecture Decisions

This document records architectural decisions for Authentication V2.

Every implementation must follow these decisions.

Changing a decision requires updating this document first.

---

# ADR-001

## Keep Existing Authentication

Status: Accepted

### Decision

The current email/password authentication system will remain the primary authentication mechanism.

Google authentication will be added as an additional login provider.

### Reason

* Existing users must continue using their current accounts.
* Avoid breaking production features.
* Reduce migration risk.

---

# ADR-002

## Use Auth.js v5

Status: Accepted

### Decision

Authentication V2 will use Auth.js v5.

### Reason

* Official solution for Next.js App Router.
* Supports Google OAuth.
* Secure session management.
* Easy future expansion.

---

# ADR-003

## Single User Table

Status: Accepted

### Decision

All authentication providers use the same User table.

No separate GoogleUser table.

### Reason

Each person should own one account regardless of login method.

---

# ADR-004

## Account Linking

Status: Accepted

### Decision

Google login must link to an existing account when the verified Google email matches an existing user.

### Rules

If email exists

→ Link Google account.

If email does not exist

→ Create a new User.

Never create duplicate users.

---

# ADR-005

## Application Roles

Status: Accepted

### Decision

Roles are controlled only by the application's database.

Google never determines authorization.

### Supported Roles

* User
* Admin

---

# ADR-006

## Authentication Providers

Status: Accepted

### Supported Providers

* credentials
* google
* both

### Definitions

**credentials**

Email/password only.

**google**

Google only.

**both**

Email/password and Google.

---

# ADR-007

## Password Ownership

Status: Accepted

### Decision

Google passwords are never stored or managed by this application.

The application only manages its own `passwordHash`.

---

# ADR-008

## Forgot Password

Status: Accepted

### Rules

**credentials**

Allow OTP reset.

**both**

Allow OTP reset.

**google**

Do not reset password.

Show an informational message explaining that the account currently uses Google Sign-In.

---

# ADR-009

## Role Preservation

Status: Accepted

### Decision

Linking a Google account must never change:

* role
* permissions
* profile
* orders
* history

Only authentication methods may change.

---

# ADR-010

## No Breaking Changes

Status: Accepted

### Decision

Authentication V2 must be implemented incrementally.

Existing features must remain functional after every task.

Every step should be deployable independently.

---

# ADR-011

## JWT / Session

Status: Accepted

### Decision

Application authorization is based on the application's own session/JWT.

Google tokens must not be used for authorization inside the application.    

---

# ADR-012

## Security Principles

Status: Accepted

### Requirements

* Never trust client-side role values.
* Always validate Google identity on the server.
* Always load role from database.
* Never expose provider secrets.
* Never overwrite `passwordHash` during Google login.
* Never create duplicate accounts.
