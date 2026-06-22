# Decisions

Use this file to record important technical decisions made during the task.

Do not record every small implementation detail.

Record only decisions that affect:

* architecture
* project structure
* framework choice
* testing approach
* security
* maintainability
* future task behavior

## Decision Rules

The AI coding agent must update this file when it decides something important, such as:

* choosing JavaScript or TypeScript for backend
* choosing Jest or Vitest for a test layer
* adding or avoiding a dependency
* changing package structure
* changing script behavior
* choosing how to structure Express app files
* choosing how frontend tests are configured
* choosing not to implement something because it is out of scope

Do not use this file to hide shortcuts.

Do not use this file to justify violating `.harness/task.md`.

## Format

### DEC-001: [Decision title]

Date:
[YYYY-MM-DD]

Decision:
[What was decided]

Reason:
[Why this decision was made]

Impact:
[What this affects now and in future tasks]

## Current Task Decisions

### DEC-001: Use npm workspaces with `frontend` and `backend`

Date:
2026-06-10

Decision:
The project foundation uses npm workspaces with two workspace folders: `frontend` and `backend`.

Reason:
TASK-0001 requires a monorepo structure with separate frontend and backend projects. This keeps the Next.js app and Express API separated while still allowing root-level commands.

Impact:
Future commands should use `--workspace=frontend` and `--workspace=backend`. Future tasks should avoid changing workspace names unless explicitly required.

---

### DEC-002: Backend exposes `/health` as the first integration proof

Date:
2026-06-10

Decision:
The backend must expose `GET /health` returning HTTP 200 and JSON `{ "status": "ok" }`.

Reason:
A health endpoint gives a simple, reliable proof that the Express app is running and testable before business APIs are added.

Impact:
Future backend tasks can use `/health` as a smoke check. This endpoint should not be removed without explicit task approval.

---

### DEC-003: TASK-0001 does not include database, auth, or business logic

Date:
2026-06-10

Decision:
TASK-0001 is limited to monorepo setup, Next.js setup, Express setup, and test foundation.

Reason:
The harness is designed to keep tasks small and reviewable. Adding database, auth, product, cart, checkout, notification, or admin features in this task would create scope creep.

Impact:
Future functionality must be implemented in later tasks only. If Codex adds out-of-scope features during TASK-0001, the task should be rejected or corrected.

---

### DEC-004: Cấu hình màu sắc của OCSEAFOOD dựa trên thiết kế Premium Storefront

Date:
2026-06-11

Decision:
Sử dụng các biến màu CSS variables tương ứng với bảng màu Dark Mode của dự án `OCSEAFOOD Premium Storefront` (màu Deep Navy `#0b1b3d`, Slate Navy `#1e293b` làm surface, màu cam sáng `#f97316` làm accent/CTA chính) và cấu hình Tailwind v4 trong tệp tin `globals.css` để bảo đảm tính thống nhất cho toàn bộ giao diện sau này.

Reason:
Khách hàng đã thiết kế sẵn frontend trên Stitch và khuyên dùng bản thiết kế này làm chuẩn giao diện cho website. Việc cấu hình hệ thống màu chuẩn ngay từ đầu giúp các task phát triển UI ở các pha sau thuận tiện hơn.

Impact:
Các component như Header, Footer, Menu, v.v. sẽ dùng các utility classes có liên kết trực tiếp tới các CSS variables này (ví dụ: `bg-navy-900`, `text-orange-500`).
