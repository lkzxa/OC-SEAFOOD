# Authentication V2 - Deployment Checklist

## Purpose

This document defines the mandatory checklist before deploying Authentication V2 to a production environment.

A deployment must not proceed until every required item has been verified.

---

# 1. Environment Variables

## Backend

Verify the following environment variables are configured correctly:

- [ ] DATABASE_URL
- [ ] JWT_SECRET
- [ ] GOOGLE_CLIENT_ID
- [ ] GOOGLE_CLIENT_SECRET
- [ ] GOOGLE_CALLBACK_URL
- [ ] FRONTEND_URL

---

## Frontend

Verify:

- [ ] NEXT_PUBLIC_GOOGLE_CLIENT_ID

---

# 2. Google Cloud Console

Verify the OAuth application configuration.

- [ ] OAuth Consent Screen is configured.
- [ ] Production domain has been added.
- [ ] Authorized JavaScript Origins are correct.
- [ ] Authorized Redirect URI is correct.
- [ ] OAuth Client ID matches production configuration.
- [ ] OAuth Client Secret matches production configuration.

---

# 3. Database

Verify database status.

- [ ] Latest Prisma migration has been deployed.
- [ ] Prisma Client has been generated.
- [ ] User table contains googleId field.
- [ ] User table contains avatar field.
- [ ] Password column supports NULL values.

---

# 4. Authentication

Verify authentication flows.

## Email Login

- [ ] Register CUSTOMER
- [ ] Login with email/password
- [ ] Invalid password returns 401

---

## Google Login

- [ ] First Google login creates CUSTOMER
- [ ] Existing Google account logs in successfully
- [ ] Existing email links correctly
- [ ] Different googleId is rejected
- [ ] Unverified Google email is rejected

---

## Forgot Password

- [ ] Forgot Password email is sent
- [ ] Reset Password succeeds
- [ ] Login works with new password

---

# 5. Authorization

Verify role-based access.

- [ ] CUSTOMER cannot access Admin APIs.
- [ ] ADMIN can access Admin APIs.
- [ ] Role is loaded from database.
- [ ] Role is never trusted from Google.

---

# 6. JWT

Verify JWT implementation.

- [ ] JWT payload contains only:
  - id
  - email
  - role

- [ ] JWT does NOT contain:
  - password
  - googleId
  - avatar
  - Google Access Token
  - Google Refresh Token

---

# 7. Security

Verify security policies.

- [ ] Passwords are stored using bcrypt.
- [ ] Passwords are never returned by APIs.
- [ ] Google OAuth is used only for identity verification.
- [ ] JWT is the application's only authentication token.
- [ ] Public registration always creates CUSTOMER.
- [ ] Account Hijacking protection verified.
- [ ] Rate Limiter enabled.
- [ ] JWT_SECRET is not the default value.

---

# 8. Automated Tests

Verify automated verification.

- [ ] Unit Tests passed.
- [ ] Integration Tests passed.
- [ ] Authentication Acceptance Tests passed.

---

# 9. Manual Verification

Perform final manual verification.

## CUSTOMER

- [ ] Register
- [ ] Login
- [ ] Google Login
- [ ] Forgot Password
- [ ] Reset Password
- [ ] Logout

---

## ADMIN

- [ ] Login with Password
- [ ] Login with Google
- [ ] Access Admin Dashboard
- [ ] Create Product
- [ ] Logout

---

# 10. Production Readiness

Confirm the system is production ready.

- [ ] No mock authentication remains.
- [ ] No development credentials remain.
- [ ] No hardcoded secrets remain.
- [ ] No debug authentication endpoints remain.
- [ ] Build completed successfully.
- [ ] Application starts successfully.
- [ ] Authentication system verified.

---

# Deployment Approval

Authentication V2 may be deployed to Production only if:

- All Acceptance Tests pass.
- All Integration Tests pass.
- All items in this checklist are completed.
- No Critical or High severity security issues remain.

---

Deployment Date:

________________________

Reviewed By:

________________________

Approved By:

________________________