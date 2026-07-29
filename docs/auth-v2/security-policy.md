# Authentication V2 Security Policy

## Purpose

This document defines the security policies for the Authentication V2 system.

These policies are architectural decisions and should not be changed without explicit review.

---

# Authentication Methods

## CUSTOMER

Customers may authenticate using either:

- Email + Password
- Google Sign-In

Both methods authenticate the same account.

---

## ADMIN

Administrators may authenticate using:

- Google Sign-In (Primary)
- Email + Password (Emergency Recovery)

Google Sign-In is the recommended daily authentication method.

Password login exists only as a recovery mechanism.

---

# Google Authentication

Google OAuth is used only for identity verification.

Google never determines:

- user role
- authorization
- permissions

The backend always loads the role from the database.

---

# Authorization

Authorization is fully controlled by the application's database.

Example:

Google Account
↓

Identity Verified

↓

Find User

↓

Read Role from Database

↓

Issue JWT

---

# JWT

The application JWT remains the single authentication token.

Google access tokens are never used for API authorization.

JWT payload:

- id
- email
- role

---

# Account Linking

Existing accounts are linked by verified email.

Once linked:

- googleId becomes immutable.

Attempting to link another Google account to the same user is rejected.

---

# Password Policy

CUSTOMER accounts:

- may use password
- may use Google

ADMIN accounts:

- should use Google for daily login
- should keep a strong password only for emergency recovery

Passwords should never be removed entirely.

---

# Two-Factor Authentication

Administrators should enable Google 2-Step Verification.

The application itself does not implement a second authentication factor for Google users.

Google provides this protection.

---

# Registration Policy

Public registration always creates:

Role = CUSTOMER

No public endpoint may create an ADMIN account.

---

# Security Principles

The authentication system follows these principles:

- Never trust Google for authorization.
- Never trust client-side role information.
- Always verify Google identity on the backend.
- Always read permissions from the database.
- JWT is the only application session token.
- Passwords are stored only as bcrypt hashes.
- Google Sign-In complements password login; it does not replace it.

---

# Future Improvements

Potential Authentication V3 features:

- Refresh Tokens
- Session Management
- Audit Logs
- Device Management
- Token Revocation

These are enhancements and are not required for Authentication V2.