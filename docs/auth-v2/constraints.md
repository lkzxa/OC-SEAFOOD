# Authentication V2 - Implementation Constraints

This document defines mandatory constraints for implementing Authentication V2.

Every task, pull request, and AI-generated change must comply with these rules.

---

# Primary Objective

Authentication V2 is an extension of the current authentication system.

It is **not** a rewrite.

The implementation must preserve all existing functionality while introducing Google Sign-In through Auth.js.

---

# Existing Features That Must Not Break

The following features are considered stable and must continue working throughout the migration:

* User registration
* Email/password login
* JWT authentication
* Forgot Password (OTP)
* User profile
* Admin authentication
* Role-based authorization
* Protected routes
* Existing API contracts
* Existing database records

---

# General Rules

Always:

* Extend existing functionality.
* Prefer small isolated changes.
* Maintain backward compatibility.
* Explain architectural decisions before implementation.
* Keep changes easy to review.

Never:

* Rewrite the authentication system.
* Replace working code without justification.
* Rename existing APIs.
* Change response formats unless required.
* Modify unrelated modules.
* Introduce breaking changes.

---

# Database Constraints

Never:

* Delete existing columns.
* Rename existing columns.
* Change primary keys.
* Remove constraints.
* Delete user records.

Always:

* Use database migrations.
* Preserve existing user data.
* Keep email uniqueness.
* Keep password hashes unchanged unless the user explicitly resets the password.

---

# Authentication Constraints

Credentials authentication must continue working exactly as before.

Google authentication must be added as an additional authentication provider.

Authentication providers must coexist.

Supported providers:

* credentials
* google
* both

---

# Account Linking Rules

When a Google account uses an email that already exists:

* Link the Google account.
* Never create a duplicate user.
* Never overwrite profile information unnecessarily.
* Never overwrite passwordHash.

---

# Authorization Rules

Authentication and authorization are separate concerns.

Authentication identifies the user.

Authorization determines permissions.

The application database is the only source of truth for:

* role
* permissions
* account status

Never trust:

* Google role
* client-side values
* frontend role information

---

# Security Constraints

Always:

* Validate Google identity on the server.
* Validate JWT on protected routes.
* Protect OAuth callbacks.
* Protect sensitive endpoints.

Never:

* Store Google passwords.
* Expose Client Secret.
* Trust client-generated tokens.
* Grant Admin privileges automatically.
* Create duplicate accounts.

---

# Code Quality

Prefer:

* Small commits
* Small pull requests
* Small refactors

Avoid:

* Large refactors
* Unrelated cleanup
* Style-only changes mixed with feature work

---

# AI Coding Workflow

Before writing code:

1. Analyze the existing implementation.
2. Explain the implementation plan.
3. List every file that will be modified.
4. Explain why each file needs to change.
5. Wait for confirmation when major architectural changes are required.

After implementation:

* Verify backward compatibility.
* Run existing tests.
* Ensure no existing authentication flow is broken.
* Summarize all changes made.

---

# Success Criteria

Authentication V2 is considered successful only if:

* Existing email/password login still works.
* Google Sign-In works correctly.
* Existing users can link Google accounts.
* No duplicate accounts are created.
* User roles remain unchanged.
* Forgot Password continues working.
* Admin authorization continues working.
* No breaking API changes are introduced.
