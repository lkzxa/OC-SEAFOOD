# Initial Task List

This file is generated from `input/project-brief.md`.

## Phase 0: Foundation

* [x] TASK-0001: Initialize npm workspaces structure (Next.js & Express) and Jest/Vitest test foundation
* [x] TASK-0002: Setup backend environment config, `.env.example`, env validation, health check, and centralized error handler
* [x] TASK-0003: Setup PostgreSQL database schema via Prisma (Users, Products, Categories, BlogPosts, Orders/Leads, OrderItems, OrderAuditLogs, NotificationOutbox)

## Phase 1: Backend Security, Auth & Validation

* [x] TASK-0004: Implement custom Express JWT authentication foundation
* [x] TASK-0005: Implement password hashing with bcrypt and login/register validation
* [x] TASK-0006: Implement role-based authorization foundation (Customer vs Admin)
* [x] TASK-0007: Implement shared API validation layer using Zod or equivalent
* [x] TASK-0008: Implement API abuse protection: rate limit login/register and checkout/lead submission

## Phase 2: Backend Core Business Logic

* [x] TASK-0009: Implement CRUD API for Products, Categories, and Blog Posts (Admin only)
* [x] TASK-0010: Implement Virtual Checkout API (save order details, attach to user if logged in, never trust client price)
* [x] TASK-0011: Implement Admin API to update order price, quantity, status, and final total
* [x] TASK-0012: Implement Order Audit Log for every Admin order update
* [x] TASK-0013: Implement Notification Outbox for Email/Telegram notifications
* [x] TASK-0014: Implement notification worker/sender for Nodemailer/SendGrid and Telegram Bot API

## Phase 3: Frontend Foundation & Public UI

* [x] TASK-0015: Setup Tailwind CSS Ocean Blue theme layout, Header, Footer
* [x] TASK-0016: Implement Zustand/React Context store for Shopping Cart state
* [x] TASK-0017: Implement Homepage and Product Menu UI connected to Backend API
* [x] TASK-0018: Implement Blog and About pages
* [x] TASK-0018b: Implement Combo Selection page (/combo) matching Stitch layouts
* [x] TASK-0018c: Implement Category Details page (/category/[slug]) with Sidebar Navigation matching Stitch layouts

## Phase 4: Frontend Checkout, Auth & Profile

* [x] TASK-0019: Implement Customer Register/Login UI (JWT auth) with split-screen Stitch design
* [x] TASK-0020: Implement Shopping Cart UI and Virtual Checkout Form with 3-tier address selection
* [x] TASK-0021: Implement Customer Profile UI with order history

## Phase 5: Admin Dashboard

* [x] TASK-0022: Implement Admin Dashboard layout with protected admin route
* [x] TASK-0023: Implement Product/Category/Blog management UI
* [x] TASK-0024: Implement Lead/Order management UI with pagination and status filters
* [x] TASK-0025: Implement Admin order price adjustment UI with audit log visibility

## Phase 6: E2E, Load, Security & Production Readiness

* [x] TASK-0026: Implement main E2E flow: Guest adds to cart -> Checkout -> Admin edits order
* [x] TASK-0027: Implement auth/security E2E checks: Customer cannot access Admin, Guest cannot access private routes
* [x] TASK-0028: Implement abuse/load smoke test for checkout and auth endpoints
* [x] TASK-0029: Run production-readiness review: security, validation, performance, error handling, UI/UX
