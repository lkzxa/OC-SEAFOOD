# Authentication V2 - Security Review Checklist

## Purpose

This document records the remaining security and business cases that should be reviewed before considering Authentication V2 production-ready.

These are not confirmed bugs. They are validation items that require code inspection and/or testing.

---

# SR-01 - Lookup Priority (Google ID vs Email)

## Risk

The current documentation does not clearly describe the lookup priority when a user signs in with Google.

If the backend always searches by email first, changing the email address on a Google account may lead to unexpected behavior.

## Expected Behavior

The backend should authenticate using the following priority:

1. Find user by `googleId`.
2. If not found, find user by `email`.
3. If email exists and `googleId` is empty:
   - Link the Google account.
4. If email exists and `googleId` belongs to another Google account:
   - Reject the request.
5. If no user exists:
   - Create a new CUSTOMER account.

## Status

Verified. The lookup priority is strictly:
1. `googleId`
2. `email`
3. Fallback logic correctly links or rejects.

---

# SR-02 - Google-only Account Password Reset

## Risk

Google-only users have `password = NULL`.

The current Forgot Password flow may not define how these users should be handled.

## Questions

- Can a Google-only user request password reset?
- Should the system reject the request?
- Should the system allow the user to create a password?
- Should Forgot Password behave differently for Google accounts?

## Recommended Decision

Allow Google-only users to create a password through the Forgot Password flow.

This enables both authentication methods in the future.

## Status

Verified. The current logic natively supports generating a password reset token by email for Google-only users. When they reset, `password` is successfully hashed and saved, allowing standard login thereafter.

---

# SR-03 - JWT Payload Review

## Risk

Google-specific information should not unnecessarily increase the JWT payload.

## Verify

JWT should contain only:

- id
- email
- role

Verify that it does NOT contain:

- googleId
- avatar
- provider
- accessToken
- refreshToken

## Status

Verified. Only `id`, `email`, and `role` are signed into the JWT payload.

---

# SR-04 - Google Profile Synchronization

## Risk

The synchronization policy for Google profile information is not documented.

## Verify

Clarify which fields should be synchronized on every login.

Suggested behavior:

| Field | Synchronize |
|--------|-------------|
| avatar | Yes |
| googleId | Only first link |
| email | Never overwrite |
| role | Never overwrite |
| password | Never overwrite |
| name | No (unless explicitly designed) |

## Status

Verified. Implemented in the updated route logic. Avatar is synced, `googleId` triggers linking, other fields are never overwritten.

---

# SR-05 - Account Linking Rules

## Risk

The exact account linking behavior should be documented to avoid future regressions.

## Verify

When:

- Existing email
- Empty googleId

Expected:

- Link account

When:

- Existing email
- Same googleId

Expected:

- Login normally

When:

- Existing email
- Different googleId

Expected:

- Reject with HTTP 403

## Status

Verified. All three scenarios are handled via the updated lookup logic and security checks.

---

# SR-06 - Google Email Change

## Risk

A user may change their primary email address in their Google account.

The system should continue recognizing the same Google account.

## Expected Behavior

Once a Google account has been linked:

Authentication should rely on `googleId`, not the email address.

## Status

Verified. Handled correctly by finding user by `googleId` as the primary key.

---

# SR-07 - Regression Testing

The following scenarios should be executed before release.

## Credentials

- Register
- Login
- Logout
- Forgot Password
- Reset Password

## Google

- First Google Login
- Existing Email Linking
- Existing Google Login
- Admin Google Login
- CUSTOMER Google Login

## Security

- Invalid Google Token
- Unverified Google Email
- Different Google ID with Same Email
- Expired JWT
- Invalid JWT
- Missing JWT

## Authorization

- CUSTOMER accessing ADMIN route
- ADMIN accessing ADMIN route

## Status

Pending full regression test.

---

# Production Readiness

Authentication V2 should be considered production-ready only after all review items in this document have been verified and accepted.