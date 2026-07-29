# Authentication Code Map

This document serves as a definitive technical reference mapping authentication responsibilities to specific source files in the codebase.

## 1. Authentication Overview

The current authentication system operates as a stateless, JWT-based architecture:

* **Frontend**: Utilizes React (Next.js App Router). Authentication state (user profile and JWT) is managed globally via Zustand and persisted to local storage. API calls are made directly from the components.
* **Backend**: Express.js REST API. It handles credential validation, token generation, and password hashing.
* **Database**: PostgreSQL accessed via Prisma ORM. It serves as the single source of truth for user identities, credentials, and roles.
* **JWT**: JSON Web Tokens are used as the primary authentication mechanism. The backend issues a token upon successful login, and the frontend sends it via the `Authorization: Bearer <token>` header.
* **Password Hashing**: Implemented using `bcryptjs` with 10 salt rounds.
* **Authorization**: Role-based Access Control (RBAC). The database stores user roles (`CUSTOMER`, `ADMIN`). The backend enforces these via middleware, and the frontend restricts UI access based on the global state.

## 2. Authentication Use Cases

### Register
* **Purpose**: Allow new customers to create an account.
* **Backend files**: `backend/src/routes/auth.js`
* **Frontend files**: `frontend/src/app/login/page.tsx`
* **Database models**: `User`
* **Dependencies**: `backend/src/middleware/rateLimiter.js`, `backend/src/utils/hash.js`, `backend/src/validation/auth.js`

### Login
* **Purpose**: Authenticate existing users via email and password.
* **Backend files**: `backend/src/routes/auth.js`
* **Frontend files**: `frontend/src/app/login/page.tsx`
* **Database models**: `User`
* **Dependencies**: `backend/src/utils/hash.js`, `backend/src/utils/jwt.js`, `backend/src/validation/auth.js`

### Google Login
* **Purpose**: Authenticate Admin users via Google OAuth.
* **Backend files**: `backend/src/routes/auth.js`
* **Frontend files**: `frontend/src/app/login/page.tsx`
* **Database models**: `User`
* **Dependencies**: `@react-oauth/google` (frontend), `backend/src/utils/jwt.js`

### Forgot Password
* **Purpose**: Send a password reset link to a user's email.
* **Backend files**: `backend/src/routes/auth.js`
* **Frontend files**: `frontend/src/app/login/page.tsx`
* **Database models**: `User`, `PasswordResetToken`, `NotificationOutbox`
* **Dependencies**: `backend/src/middleware/rateLimiter.js`, `backend/src/validation/auth.js`, Node.js `crypto`

### Reset Password
* **Purpose**: Allow a user to set a new password using a valid cryptographic token.
* **Backend files**: `backend/src/routes/auth.js`
* **Frontend files**: `frontend/src/app/reset-password/page.tsx`
* **Database models**: `User`, `PasswordResetToken`
* **Dependencies**: `backend/src/middleware/rateLimiter.js`, `backend/src/utils/hash.js`, `backend/src/validation/auth.js`, Node.js `crypto`

### Logout
* **Purpose**: Clear the user's session from the client.
* **Backend files**: N/A (Stateless JWT)
* **Frontend files**: `frontend/src/store/useAuthStore.ts`, `frontend/src/components/Header.tsx`, `frontend/src/components/admin/AdminLayout.tsx`
* **Database models**: N/A
* **Dependencies**: `zustand`

### Authorization
* **Purpose**: Ensure users only access resources they have permission for.
* **Backend files**: `backend/src/middleware/authorize.js`, `backend/src/middleware/auth.js`
* **Frontend files**: `frontend/src/components/admin/AdminRouteGuard.tsx`
* **Database models**: `User`
* **Dependencies**: `backend/src/utils/jwt.js`

### Route Protection
* **Purpose**: Block unauthenticated access to secure routes.
* **Backend files**: `backend/src/middleware/auth.js`
* **Frontend files**: `frontend/src/components/admin/AdminRouteGuard.tsx`
* **Database models**: N/A
* **Dependencies**: `backend/src/utils/jwt.js`

## 3. Backend Responsibility Map

### Authentication Routes
* `backend/src/routes/auth.js`: Handles POST requests for `/login`, `/register`, `/google`, `/forgot-password`, `/reset-password`.

### Authentication Middleware
* `backend/src/middleware/auth.js`: Extracts and verifies JWT from the `Authorization` header.
* `backend/src/middleware/authorize.js`: Checks if `req.user.role` matches allowed roles.
* `backend/src/middleware/optionalAuth.js`: Parses JWT if present, but does not block if missing.
* `backend/src/middleware/rateLimiter.js`: Applies IP-based request limits (`authRateLimiter`) to prevent brute-force attacks.

### Authentication Utilities
* `backend/src/utils/jwt.js`: Encapsulates `jsonwebtoken` logic (`signToken`, `verifyToken`).
* `backend/src/utils/hash.js`: Encapsulates `bcryptjs` logic (`hashPassword`, `comparePassword`).

### Validation
* `backend/src/validation/auth.js`: Zod schemas (`RegisterSchema`, `LoginSchema`, `ForgotPasswordSchema`, `ResetPasswordSchema`) for input validation.

### Configuration
* `backend/src/config/env.js`: Parses and validates all environment variables required for authentication.

### Database
* `backend/prisma/schema.prisma`: Defines the ORM schema for users and reset tokens.

## 4. Frontend Responsibility Map

### Authentication Pages
* `frontend/src/app/login/page.tsx`: 
  - **Purpose**: Provides the UI and handles form submissions for Login, Register, and Forgot Password (managed via local tab state). Integrates Google OAuth via `@react-oauth/google`.
  - **Dependencies**: React, `useAuthStore`, `lucide-react`, `next/navigation`, `fetch`.
* `frontend/src/app/reset-password/page.tsx`:
  - **Purpose**: Provides the UI for submitting a new password given a `token` URL parameter.
  - **Dependencies**: React, `next/navigation`, `lucide-react`, `fetch`.

### State Management
* `frontend/src/store/useAuthStore.ts`:
  - **Purpose**: Global Zustand store holding `user` and `token`. Handles `setAuth` (login) and `clearAuth` (logout). Persists to `localStorage`.
  - **Dependencies**: `zustand`, `zustand/middleware`.

### Route Guards
* `frontend/src/components/admin/AdminRouteGuard.tsx`:
  - **Purpose**: Wraps admin pages. Checks `useAuthStore` for token and `ADMIN` role. Redirects unauthorized users to `/login`.
  - **Dependencies**: React, `useAuthStore`, `next/navigation`.

### API Communication
* API communication for authentication is handled natively inside the page components (`login/page.tsx` and `reset-password/page.tsx`) using the standard `fetch` API. There is no dedicated auth API client file.
  - **Purpose**: Make HTTP POST requests to `/api/auth/*`.

### Shared Components
* (None explicitly dedicated to Auth UI outside of pages, though `Header.tsx` and `AdminLayout.tsx` consume auth state to render user info/logout buttons).

## 5. Database Responsibility Map

### User
* **Purpose**: Primary identity and authorization record.
* **Key fields**: `id`, `email`, `password` (hashed), `name`, `role` (enum).
* **Relationships**: Has one `PasswordResetToken`, has many `orders`, `auditLogs`, `blogPosts`.
* **Files depending on it**: `backend/src/routes/auth.js`, `backend/src/routes/users.js`, `backend/src/middleware/authorize.js`.

### PasswordResetToken
* **Purpose**: Stores secure tokens used for the forgot-password flow.
* **Key fields**: `id`, `tokenHash`, `userId`, `expiresAt`.
* **Relationships**: Belongs to `User` (One-to-One).
* **Files depending on it**: `backend/src/routes/auth.js`.

### NotificationOutbox
* **Purpose**: Queues transactional emails (like password reset links).
* **Key fields**: `id`, `type`, `payload`, `status`.
* **Relationships**: None explicitly related to auth models, acts independently.
* **Files depending on it**: `backend/src/routes/auth.js`, background workers.

## 6. Authentication Flow Map

### Register
Frontend Page (`login/page.tsx`)
↓
API (`POST /api/auth/register`)
↓
Validation (`backend/src/validation/auth.js`)
↓
Hash Password (`backend/src/utils/hash.js`)
↓
Prisma (`prisma.user.create`)
↓
Response (User object without password)

### Login
Frontend Page (`login/page.tsx`)
↓
API (`POST /api/auth/login`)
↓
Validation (`backend/src/validation/auth.js`)
↓
Prisma (`prisma.user.findUnique`)
↓
Compare Password Hash (`backend/src/utils/hash.js`)
↓
Generate JWT (`backend/src/utils/jwt.js`)
↓
Response (JWT + User)
↓
Store in State (`useAuthStore.ts`)

### Google Login
Frontend Page (`login/page.tsx` via `@react-oauth/google`)
↓
API (`POST /api/auth/google`)
↓
Google OAuth (Verify Code via HTTPS POST to `oauth2.googleapis.com`)
↓
Verify Role (Check if `ADMIN` in Prisma)
↓
Generate Application JWT (`backend/src/utils/jwt.js`)
↓
Response (JWT + User)
↓
Store in State (`useAuthStore.ts`)

### Forgot Password
Frontend Page (`login/page.tsx`)
↓
API (`POST /api/auth/forgot-password`)
↓
Validation (`backend/src/validation/auth.js`)
↓
Generate Hex Token (`crypto.randomBytes`)
↓
Hash Hex Token (`crypto.createHash`)
↓
Prisma (`prisma.passwordResetToken.upsert`)
↓
Queue Email (`prisma.notificationOutbox.create`)
↓
Response (Success Message)

### Reset Password
Frontend Page (`reset-password/page.tsx` using URL token)
↓
API (`POST /api/auth/reset-password`)
↓
Hash Provided Token (`crypto.createHash`)
↓
Prisma (`prisma.passwordResetToken.findFirst`)
↓
Hash New Password (`backend/src/utils/hash.js`)
↓
Prisma Transaction (`update user`, `delete token`)
↓
Response (Success Message)

## 7. Dependency Map

* **Login Page (`login/page.tsx`)**
  ↓ depends on `useAuthStore.ts` (to store token)
  ↓ depends on `fetch` API (to call `/api/auth/*`)
* **Auth Routes (`backend/src/routes/auth.js`)**
  ↓ depends on `validation/auth.js` (for input sanitization)
  ↓ depends on `middleware/rateLimiter.js` (for abuse prevention)
  ↓ depends on `utils/hash.js` (for password comparison/creation)
  ↓ depends on `utils/jwt.js` (for session token generation)
  ↓ depends on `prisma` (for DB access)
* **Auth Middleware (`backend/src/middleware/auth.js`)**
  ↓ depends on `utils/jwt.js` (to verify tokens)
* **Protected Routes (`AdminRouteGuard.tsx`)**
  ↓ depends on `useAuthStore.ts` (to check session state)

## 8. Environment Variables

* `JWT_SECRET`: Used in `backend/src/utils/jwt.js` to sign and verify application sessions.
* `DATABASE_URL`: Used in `backend/prisma/schema.prisma` to connect to PostgreSQL.
* `GOOGLE_CLIENT_ID`: Used in `backend/src/routes/auth.js` (and frontend GoogleProvider) to identify the app to Google.
* `GOOGLE_CLIENT_SECRET`: Used in `backend/src/routes/auth.js` to securely exchange the OAuth code for tokens.
* `GOOGLE_CALLBACK_URL`: Used in `backend/src/routes/auth.js` to construct the OAuth exchange request.
* `FRONTEND_URL`: Used in `backend/src/routes/auth.js` (forgot password) to construct the email reset link.

*(All variables are loaded and validated inside `backend/src/config/env.js`)*

## 9. Impact Analysis

### Credentials Login
Files:
* `backend/src/routes/auth.js`
* `backend/src/validation/auth.js`
* `backend/src/utils/hash.js`
* `backend/src/utils/jwt.js`
* `frontend/src/app/login/page.tsx`
* `frontend/src/store/useAuthStore.ts`

### Google Login
Files:
* `backend/src/routes/auth.js`
* `backend/src/utils/jwt.js`
* `frontend/src/app/login/page.tsx`
* `frontend/src/store/useAuthStore.ts`

### Forgot Password
Files:
* `backend/src/routes/auth.js`
* `backend/src/validation/auth.js`
* `backend/prisma/schema.prisma` (PasswordResetToken, NotificationOutbox models)
* `frontend/src/app/login/page.tsx`
* `frontend/src/app/reset-password/page.tsx`

### Authorization
Files:
* `backend/src/middleware/authorize.js`
* `backend/src/middleware/auth.js`
* `backend/prisma/schema.prisma` (User role enum)
* `frontend/src/components/admin/AdminRouteGuard.tsx`
* `frontend/src/store/useAuthStore.ts`

## 10. Unknowns

* Are there any external services (like a CDN, reverse proxy, or API Gateway) that perform preliminary token inspection before requests hit the Node server?
* Does the frontend utilize Server-Side Rendering (SSR) for any protected pages, which might require reading the JWT from cookies rather than `localStorage`/Zustand?
