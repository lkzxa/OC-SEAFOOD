# Project Commands

## Install

Root:

```bash
npm install
```

Frontend:

```bash
npm install --workspace=frontend
```

Backend:

```bash
npm install --workspace=backend
```

## Database (Prisma)

Generate Client:

```bash
npm run prisma:generate --workspace=backend
```

Migrate DB:

```bash
npm run prisma:migrate --workspace=backend
```

Push Schema:

```bash
npm run prisma:push --workspace=backend
```

## Build

Frontend:

```bash
npm run build --workspace=frontend
```

Backend:

```bash
npm run build --workspace=backend
```

## Test

Frontend:

```bash
npm run test --workspace=frontend
```

Backend:

```bash
npm run test --workspace=backend
```

## Test Specific

Yêu cầu AI dùng đường dẫn tương đối.

Ví dụ backend:

```bash
npx jest path/to/file.test.js --workspace=backend
```

Nếu command trên không phù hợp với npm workspace hiện tại, dùng command test cụ thể được định nghĩa trong `backend/package.json`.

Ví dụ frontend:

```bash
npm run test --workspace=frontend -- path/to/file.test.ts
```

Nếu dùng Vitest, ưu tiên non-watch mode.

## Lint

Frontend:

```bash
npm run lint --workspace=frontend
```

Backend:

```bash
npm run lint --workspace=backend
```

## Run Dev

Run both frontend and backend:

```bash
npm run dev
```

Yêu cầu cấu hình script root:

```json
"dev": "concurrently \"npm run dev --workspace=frontend\" \"npm run dev --workspace=backend\""
```

Expected ports:

```text
frontend: 3000
backend: 5000
```

## Health Check

Backend health check:

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{
  "status": "ok"
}
```

## Recommended Root Scripts

Nếu hợp lý, root `package.json` có thể hỗ trợ:

```bash
npm run test --workspaces
npm run build --workspaces
npm run lint --workspaces
```

Chỉ dùng các lệnh này nếu root/package workspace thật sự hỗ trợ.

Không được báo pass command chưa chạy.

## Notes

* Yêu cầu AI luôn sử dụng cờ `--workspace=` thay vì dùng lệnh `cd` để chuyển thư mục, nhằm tránh nhầm lẫn context.
* Các lệnh thao tác với Database Prisma chỉ được thực thi tại workspace backend.
* Lệnh Run Dev được gom lại thành một lệnh duy nhất để chạy song song hai port.
* Nếu một command chưa tồn tại trong `package.json`, AI phải báo rõ thay vì tự bịa kết quả.
* Nếu cần thêm script mới, việc thêm script phải nằm trong Allowed Scope của current task.

## Workspace Safety

* Prefer running commands from the repository root.
* Prefer `--workspace=frontend` and `--workspace=backend`.
* Do not use `cd frontend` or `cd backend` unless absolutely necessary.
* Do not modify files outside the current task Allowed Scope.
* Do not rename workspaces unless current task explicitly allows it.

## Environment Safety

* Never print real `.env` values in logs or result reports.
* Never hardcode secrets in source code.
* Required environment variables must be documented in `.env.example`.
* `.env` must be ignored by Git.
* Do not commit `.env`.
* Do not expose JWT_SECRET, DATABASE_URL, email credentials, Telegram bot token, API keys, or passwords.

## Prisma Safety

* `prisma:push` is allowed for local development only.
* `prisma:migrate` is required for migration history.
* Do not run destructive database commands.
* Do not run `prisma migrate reset`.
* Do not drop database.
* Do not delete migration files.
* Do not rewrite migration history unless current task explicitly allows it.
* Database commands must only be executed in the backend workspace.
* If schema changes require migration, report the migration name and command evidence.

## Security Safety

* Do not trust client-submitted price, role, subtotal, discount, or total.
* Do not bypass authentication to make tests pass.
* Do not bypass authorization to make tests pass.
* Do not log raw request body if it may contain customer data.
* Do not return password hash in API responses.
* Do not expose stack traces in production mode.

## Evidence Required After Each Task

The AI coding agent must report:

* commands executed
* pass/fail result
* files changed
* tests added or updated
* build evidence
* test evidence
* lint evidence if applicable
* known limitations
* remaining risks
* manual verification steps if needed

## Failure Handling

If a command fails, the AI coding agent must:

1. report the exact failing command
2. identify the likely root cause
3. make the smallest safe fix
4. rerun the failed command
5. report the new result

The AI coding agent must not perform broad unrelated refactors to fix a local failure.
