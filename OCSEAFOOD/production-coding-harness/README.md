# OCSEAFOOD

OCSEAFOOD là monorepo gồm giao diện Next.js và API Express dùng Prisma/PostgreSQL. Website cung cấp danh mục hải sản, combo, bài viết, giỏ hàng, yêu cầu tư vấn đặt hàng, tài khoản khách hàng và trang quản trị.

## Cấu trúc

- `frontend/`: Next.js, React, Tailwind CSS.
- `backend/`: Express, Prisma, PostgreSQL và notification worker.
- `docs/`: hướng dẫn setup, vận hành, media và chuẩn bị deployment.
- `input/`, `.harness/`: kế hoạch và bằng chứng kiểm thử theo từng task.

## Bắt đầu nhanh trên Windows

Yêu cầu Node.js `>=20.9.0`, npm và PostgreSQL 18.

```powershell
npm ci
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env.local
npm run prisma:generate --workspace=backend
npm run prisma:migrate --workspace=backend
npm run dev
```

Cần sửa `backend/.env` và `frontend/.env.local` trước khi migrate/chạy ứng dụng. Hướng dẫn đầy đủ nằm tại [docs/windows-setup.md](docs/windows-setup.md).

- Frontend: http://localhost:3000
- Backend readiness: http://localhost:5000/health/ready
- Admin: http://localhost:3000/admin

## Các lệnh kiểm tra

```powershell
npm test
npm run lint
npm run build
npm run prisma:validate --workspace=backend
```

Backend là JavaScript chạy trực tiếp nên bước build/lint backend thực hiện syntax gate. Frontend thực hiện ESLint và production build Next.js.

## Tài liệu

- [Hướng dẫn người dùng](WEBSITE_USER_GUIDE.md)
- [Setup máy Windows mới](docs/windows-setup.md)
- [Chuẩn bị deployment](docs/pre-deployment.md)
- [Vận hành backend](docs/backend-operations.md)
- [Lưu trữ và backup ảnh](docs/media-storage.md)
- [Danh sách lệnh dự án](input/project-commands.md)

Production chưa được triển khai trong task này. VPS, Nginx, HTTPS, firewall và process manager thuộc TASK-0071 trở đi.
