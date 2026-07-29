# Admin Google-only Login Policy

## Objective

Increase security for administrator accounts.

## Policy

CUSTOMER
- Email + Password: Allowed
- Google Sign-In: Allowed

ADMIN
- Email + Password: Not Allowed
- Google Sign-In: Required

## Rationale

Administrator accounts have elevated privileges.

Removing password-based authentication eliminates:

- Password brute-force attacks
- Password leaks
- Credential stuffing attacks

Authentication relies solely on verified Google identities.

## Acceptance Criteria

- ADMIN login via email/password returns HTTP 403.
- ADMIN login via Google succeeds.
- CUSTOMER login via email/password still works.
- CUSTOMER login via Google still works.