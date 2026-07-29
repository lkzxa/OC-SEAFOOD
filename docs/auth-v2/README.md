# Authentication V2

## Overview

This document describes the migration from the current authentication system to Authentication V2.

Authentication V2 extends the existing authentication without replacing it.

The project already has a working authentication system.

Current features:

- User registration
- Email/password login
- JWT authentication
- Forgot password via OTP
- Role-based authorization (Admin / User)

Authentication V2 will introduce Google Sign-In using Auth.js while preserving all existing functionality.

---

## Goals

Implement Google Sign-In for both User and Admin.

Support multiple authentication providers on a single account.

Allow users to log in using either:

- Email + Password
- Google

without creating duplicate accounts.

---

## Non Goals

Authentication V2 must NOT:

- rewrite the authentication system
- replace existing login
- break current JWT flow
- change existing APIs unless required
- remove any current feature

---

## Technology

Frontend

- Next.js App Router
- TypeScript
- TailwindCSS

Backend

- Next.js Route Handlers

Authentication

- Auth.js v5

Database

- Prisma ORM
- Existing User table

Provider

- Credentials
- Google

---

## Supported Login Methods

Credentials Login

Email + Password

Google Login

Google OAuth

Linked Account

Credentials + Google

---

## User Roles

Role assignment is controlled ONLY by the database.

Google never determines application roles.

Supported roles:

- User
- Admin

---

## Migration Strategy

Authentication V2 is an incremental upgrade.

Every phase must keep the application working.

No breaking changes are allowed.

Each task must be completed independently before moving to the next one.

---

## Coding Principles

Always extend.

Never rewrite.

Always maintain backward compatibility.

Prefer small isolated pull requests over large changes.

Explain every architectural decision before implementation.