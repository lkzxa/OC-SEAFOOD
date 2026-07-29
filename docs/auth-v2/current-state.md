# Current Authentication State

## 1. Project Structure Related to Authentication

**Backend:**
- `backend/src/routes/auth.js`: Defines authentication endpoints (register, login, google, forgot-password, reset-password).
- `backend/src/middleware/auth.js`: Middleware to verify JWT tokens.
- `backend/src/middleware/authorize.js`: Role-based authorization middleware.
- `backend/src/middleware/optionalAuth.js`: Middleware that optionally parses a token if present.
- `backend/src/middleware/rateLimiter.js`: Rate limiting for authentication endpoints.
- `backend/src/utils/hash.js`: Helper functions for bcrypt password hashing.
- `backend/src/utils/jwt.js`: Helper functions for signing and verifying JSON Web Tokens.
- `backend/src/validation/auth.js`: Input validation schemas using Zod.
- `backend/prisma/schema.prisma`: Database schema defining the User and PasswordResetToken models.

**Frontend:**
- `frontend/src/app/login/page.tsx`: Contains the UI for Login, Register, and Forgot Password (managed via state tabs).
- `frontend/src/app/reset-password/page.tsx`: The page where users submit their new password with a valid token.
- `frontend/src/store/useAuthStore.ts`: Zustand store managing the authentication state (`user`, `token`, `clearAuth`, `setAuth`).
- `frontend/src/components/admin/AdminRouteGuard.tsx`: Component guarding admin routes.

## 2. Authentication Ownership
To ensure security and clarity, responsibilities are strictly separated among the following components:

- **Google OAuth**: Acts **only** as an identity provider (IdP). Used solely to verify the user's identity via Google. It never manages the application's session, authorization, or role enforcement.
- **Express Backend**: Responsible for all authentication logic, identity verification, user creation, and issuing the application's official JWT.
- **Prisma Database**: The single source of truth for user identity, credentials (password hashes), and authorization roles.
- **JWT**: The sole authentication mechanism used by the application for stateless session management.
- **Zustand**: The frontend authentication state manager. It securely stores the application's JWT and provides user state to React components.
- **Authorization**: Controlled entirely by the database roles and enforced by Express middleware (`authorize.js`).

## 3. Authentication V2 Target Architecture
The upcoming Google Sign-In integration will follow this strict flow without replacing any existing mechanisms:

```text
User
  ↓
Continue with Google
  ↓
Google OAuth (Identity Verification)
  ↓
Express Backend
  ↓
Verify Google Identity
  ↓
Find or Create User (in Prisma)
  ↓
Generate Application JWT
  ↓
Return JWT + User
  ↓
Store JWT in Zustand
  ↓
Authenticated
```

*Note: Google never manages the application's authorization or session. The application's own JWT mechanism handles all subsequent requests exactly as it does for email/password logins.*

## 4. Authentication Flow (Existing)
- The client sends credentials to the backend.
- The server validates the request and checks the credentials against the database.
- Upon success, the server generates a JWT containing the user's `id`, `email`, and `role`.
- The client receives the JWT and user data, storing them in a persistent Zustand store (`useAuthStore`).
- The client attaches the JWT as a `Bearer` token in the `Authorization` header for subsequent authenticated API requests.
- The server verifies the token using the `auth.js` middleware to authenticate requests.

## 5. Registration Flow
- Handled by `POST /api/auth/register` (mapped from `/auth/register` in backend).
- The user provides `name`, `email`, and `password`.
- Protected by `authRateLimiter`.
- The server checks for email uniqueness in the `User` table.
- The password is hashed using bcrypt.
- A new user is created with the `CUSTOMER` role (hardcoded to prevent privilege escalation).
- The user record (excluding the password) is returned.

## 6. Login Flow
- **Credentials:** Handled by `POST /api/auth/login`. Takes `email` and `password`.
  - Verifies user existence and compares the provided password against the stored bcrypt hash.
  - Generates and returns a JWT token and user info.
- **Google (Admin Only):** Handled by `POST /api/auth/google`.
  - Exchanges a Google authorization code for tokens, fetches the user's Google profile.
  - Checks if the email belongs to a user with the `ADMIN` role. If not, access is denied.
  - Used strictly for Admin access, not for general customers.

## 7. JWT/Session Implementation
- Uses `jsonwebtoken`.
- Token payload contains STRICTLY: `{ id, email, role }`.
- Verify: The payload explicitly does NOT include `googleId`, `avatar`, `provider`, `accessToken`, or `refreshToken`. This ensures minimal size and decoupling from Google-specific data.
- Token expiration: `1d` (1 day).
- Secret: `JWT_SECRET` from environment variables.
- The system is completely stateless on the server side (no session table).

## 8. Password Hashing
- Utilizes `bcryptjs`.
- Cost factor (salt rounds): `10`.
- Implemented in `backend/src/utils/hash.js` via `hashPassword` and `comparePassword`.

## 9. Forgot Password Flow
- Handled by `POST /api/auth/forgot-password`.
- Protected by `authRateLimiter`.
- Checks if the user exists. Always returns a success message (HTTP 200) regardless of existence to prevent user enumeration attacks.
- If the user exists, generates a 32-byte hex token.
- Hashes the token using `sha256` and stores the hash in the `PasswordResetToken` table with a 1-hour expiration.
- Queues an email via `NotificationOutbox` containing a reset link with the plaintext token (`/reset-password?token=...`).

## 10. OTP Implementation
- Currently, the application does not use traditional numeric OTP codes (e.g., 6-digit codes) for password resets.
- Instead, it uses secure random cryptographic tokens (32-byte hex) embedded directly into a password reset URL.

## 11. Middleware
- `auth`: Extracts the `Bearer` token from the `Authorization` header, verifies it, and attaches the decoded payload to `req.user`.
- `authorize(...roles)`: Checks if `req.user.role` is included in the allowed roles array.
- `optionalAuth`: Similar to `auth`, but does not reject the request if the token is missing or invalid.
- `authRateLimiter`: Limits the number of requests to sensitive authentication endpoints to prevent brute-force and spam.

## 12. Route Protection
- **Backend:** Protected routes use `auth` and `authorize` middlewares (e.g., `router.post('/product', auth, authorize('ADMIN'), ...)`).
- **Frontend:** Handled via route guards like `AdminRouteGuard.tsx` which checks `useAuthStore` and redirects unauthenticated or unauthorized users.

## 13. User Model
The `User` model includes:
- `id`: Int (Primary Key)
- `email`: String (Unique)
- `password`: String (Hashed)
- `name`: String
- `role`: Enum (`CUSTOMER` | `ADMIN`), default is `CUSTOMER`
- `createdAt`, `updatedAt`: Timestamps
- Relations: `blogPosts`, `auditLogs`, `orders`, `passwordResetToken`

## 14. Database Schema Related to Authentication
**User Model:**
Stores primary authentication data (email, password hash, role).

**PasswordResetToken Model:**
- `id`: Int (Primary Key)
- `tokenHash`: String (Unique, sha256 hash of the token)
- `userId`: Int (Unique, relation to User)
- `expiresAt`: DateTime
- `createdAt`: DateTime

## 15. Existing API Endpoints
- `POST /auth/register` - Register a new customer.
- `POST /auth/login` - Log in with email and password.
- `POST /auth/google` - Admin login via Google OAuth 2.0.
- `POST /auth/forgot-password` - Request a password reset link.
- `POST /auth/reset-password` - Reset password using a valid token.

## 16. Frontend Authentication Pages
- `/login`: Main authentication page with internal tab state (`activeTab`) to switch between "login", "register", and "forgot-password" forms.
- `/reset-password`: Dedicated page to handle the password reset process. Extracts the `token` from the URL query parameters.

## 17. Existing Security Mechanisms
- **Password Hashing:** `bcryptjs` with 10 salt rounds.
- **Token Hashing:** Password reset tokens are hashed (`sha256`) before database storage.
- **Rate Limiting:** Protects registration, login, and password reset endpoints.
- **User Enumeration Prevention:** `/auth/forgot-password` returns a consistent success message whether the email exists or not.
- **Role Enforcement:** Registration hardcodes the `CUSTOMER` role. Authorization middleware enforces role checks.
- **No Password Exposure:** Password hashes are systematically stripped from user objects before returning API responses.

## 18. Current Limitations
- **Token Invalidation:** Because JWTs are stateless and there is no token blacklist, tokens cannot be revoked before their 1-day expiration.
- **No Refresh Tokens:** Users are forced to log in again every 24 hours.
- **Missing Session Management:** No way to list active sessions or log out from other devices.

## 19. Google Profile Synchronization Policy
The Google login flow strictly synchronizes profile data based on the following rules to ensure security and predictability:
- **`googleId`**: Stored only when linking the account for the first time. It is used as the primary lookup key for subsequent logins.
- **`avatar`**: Updated on every successful Google login if the user changes their picture on Google.
- **`email`**: Never automatically overwritten. The database email is preserved.
- **`role`**: Never changed by Google. Roles are exclusively managed by the application database.
- **`password`**: Never modified by Google. Google-only users have `password = NULL` and can set one via the "Forgot Password" flow.
- **`name`**: Set once upon creation but not updated on subsequent logins, allowing users to keep their chosen display name in the application.

## 20. Migration Status
- Every schema change has been applied successfully via Prisma.
- The migration `20260721000000_add_google_signin_fields` is committed into the repository under `backend/prisma/migrations`.
- A fresh developer can run `npx prisma migrate deploy` locally without manually editing SQL.
- Manual SQL generation was only utilized as a one-time operation during development to circumvent local shadow database issues. It has been successfully committed to the standard Prisma migration flow.

## 21. Backend Validation Status
The backend authentication implementation (V2) has been fully validated with automated test suites in `backend/src/__tests__` (`oauth.test.js`, `registerLogin.test.js`, `forgotPassword.test.js`, etc.).
- **Credentials Login**: Register, Login, Forgot Password, Reset Password logic are intact and unaffected.
- **Google Login**: Verified flows for first-time login, linking to existing accounts, and repeated logins for both Customers and Admins.
- **Security Check**: Handled unverified emails, rejected Google token spoofing, and securely prevented `googleId` hijacking via strict lookup priority.
- **Authorization**: Role-based access control (`CUSTOMER` vs `ADMIN`) remains unchanged and strictly enforced.

---

## Files involved
- `backend/src/routes/auth.js`
- `backend/src/middleware/auth.js`
- `backend/src/middleware/authorize.js`
- `backend/src/middleware/optionalAuth.js`
- `backend/src/middleware/rateLimiter.js`
- `backend/src/utils/hash.js`
- `backend/src/utils/jwt.js`
- `backend/src/validation/auth.js`
- `backend/prisma/schema.prisma`
- `frontend/src/app/login/page.tsx`
- `frontend/src/app/reset-password/page.tsx`
- `frontend/src/store/useAuthStore.ts`
- `frontend/src/components/admin/AdminRouteGuard.tsx`

## Questions
- Should Google automatically create CUSTOMER accounts?
- Should existing accounts be automatically linked by matching email?
- Should users be able to add a password after creating a Google-only account?
- Should the User model include provider, googleId, and avatar fields?
