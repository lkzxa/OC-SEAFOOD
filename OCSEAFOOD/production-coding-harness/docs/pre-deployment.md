# Chuẩn bị deployment OCSEAFOOD

Tài liệu này chốt hợp đồng lệnh và biến môi trường trước khi tạo VPS. Nó chưa cấu hình server, Nginx, HTTPS, DNS hoặc process manager.

## Kiến trúc tiến trình dự kiến

- Frontend Next.js chạy cổng nội bộ 3000.
- Backend Express chạy cổng nội bộ 5000.
- PostgreSQL 18 không mở trực tiếp ra Internet.
- Nginx sẽ phục vụ domain, chuyển `/api/*` và `/uploads/*` đúng luồng.
- Ảnh local nằm trên persistent filesystem ngoài thư mục release.

## Biến môi trường production

Backend cần tối thiểu:

```dotenv
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/ocseafood?schema=public
JWT_SECRET=REPLACE_WITH_RANDOM_SECRET_AT_LEAST_64_CHARACTERS
FRONTEND_URL=https://example.com
CORS_ORIGIN=https://example.com,https://www.example.com
ALLOW_ADMIN_PASSWORD_LOGIN=false
GOOGLE_CLIENT_ID=REPLACE_WITH_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=REPLACE_WITH_GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL=https://example.com/login
MEDIA_PROVIDER=local
MEDIA_ROOT=/var/lib/ocseafood/uploads
```

Frontend cần:

```dotenv
BACKEND_URL=http://127.0.0.1:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=REPLACE_WITH_GOOGLE_CLIENT_ID
```

Các biến notification xem tại `backend/.env.example`. Secret thật phải nằm trong secret store/file environment do service manager bảo vệ.

## Release gate trước deploy

```bash
npm ci
npm run prisma:validate --workspace=backend
npm run prisma:generate --workspace=backend
npm test
npm run lint
npm run build
npm run media:inventory:strict
npm run media:backup
```

Tạo PostgreSQL backup và chép cả database/media backup ra khỏi VPS trước migration.

## Migration và khởi động

Dùng migration đã commit:

```bash
npm run prisma:migrate:deploy --workspace=backend
```

Chạy hai service độc lập bằng process manager:

```bash
npm run start --workspace=backend
npm run start --workspace=frontend
```

Không dùng `npm run dev`, `prisma migrate dev` hoặc `prisma db push` trên production.

Sau khi process manager/Nginx được cấu hình, kiểm tra:

```text
GET /health/live
GET /health/ready
GET /
GET /admin
GET /uploads/<known-file>
```

`/health/ready` phải trả 200 trước khi nhận traffic. Quy trình systemd/PM2, Nginx, TLS, firewall, backup lịch chạy và rollback sẽ được triển khai tại TASK-0071–0075.
