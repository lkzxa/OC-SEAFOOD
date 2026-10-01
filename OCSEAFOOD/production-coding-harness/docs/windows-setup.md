# Setup OCSEAFOOD trên máy Windows mới

Hướng dẫn này áp dụng cho repository tại bất kỳ thư mục nào; không phụ thuộc đường dẫn của máy cũ.

## 1. Kiểm tra phần mềm

Yêu cầu:

- Git.
- Node.js `>=20.9.0` và npm.
- PostgreSQL 18 cùng pgAdmin hoặc command-line tools.

```powershell
git --version
node --version
npm --version
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" --version
```

## 2. Lấy source và cài dependency

Ví dụ clone vào `D:\PROJECT`:

```powershell
Set-Location D:\PROJECT
git clone https://github.com/lkzxa/OC-SEAFOOD.git
Set-Location D:\PROJECT\OC-SEAFOOD\OCSEAFOOD\production-coding-harness
npm ci
```

Nếu đã chép repository từ máy cũ, chỉ cần mở PowerShell tại thư mục `production-coding-harness` rồi chạy `npm ci`.

## 3. Tạo database PostgreSQL local

Dùng pgAdmin tạo database tên `ocseafood`, hoặc chạy:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\createdb.exe" -U postgres ocseafood
```

PostgreSQL sẽ hỏi mật khẩu của user `postgres`. Đây là mật khẩu đã đặt lúc cài PostgreSQL, không phải mật khẩu website.

## 4. Tạo file môi trường

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env.local
```

Sửa `backend/.env`:

- `DATABASE_URL`: user, mật khẩu PostgreSQL và database local.
- `JWT_SECRET`: chuỗi ngẫu nhiên tối thiểu 64 ký tự.
- `ALLOW_ADMIN_PASSWORD_LOGIN=true` trong giai đoạn kiểm tra local.
- Các dịch vụ Google/SMTP/Telegram/Zalo có thể để trống nếu chưa kiểm tra tích hợp.

Tạo JWT secret trong PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

`frontend/.env.local` giữ `BACKEND_URL=http://localhost:5000`. Nếu dùng Google OAuth, đặt cùng Google client ID vào backend và `NEXT_PUBLIC_GOOGLE_CLIENT_ID` của frontend.

Không commit hai file môi trường thật.

## 5. Khởi tạo Prisma

```powershell
npm run prisma:validate --workspace=backend
npm run prisma:generate --workspace=backend
npm run prisma:migrate --workspace=backend
```

Migration hiện có sẽ tạo schema. Không chạy `prisma db push` vì release dùng lịch sử migration đã commit.

## 6. Tạo hoặc đặt lại Admin local

Công cụ yêu cầu email hợp lệ và mật khẩu tối thiểu 12 ký tự. Đoạn PowerShell sau đọc mật khẩu ẩn và xóa biến sau khi chạy:

```powershell
$env:ADMIN_EMAIL = Read-Host "Admin email"
$env:ADMIN_NAME = Read-Host "Admin name"
$secureAdminPassword = Read-Host "Admin password (minimum 12 characters)" -AsSecureString
$env:ADMIN_PASSWORD = [System.Net.NetworkCredential]::new("", $secureAdminPassword).Password
npm run admin:create --workspace=backend
Remove-Item Env:ADMIN_EMAIL, Env:ADMIN_NAME, Env:ADMIN_PASSWORD
Remove-Variable secureAdminPassword
```

Nếu email đã tồn tại, lệnh cập nhật tên, mật khẩu và quyền `ADMIN`; lệnh không in mật khẩu ra terminal.

## 7. Chạy và kiểm tra

```powershell
npm run dev
```

Mở:

- http://localhost:3000
- http://localhost:3000/login
- http://localhost:3000/admin
- http://localhost:5000/health/ready

Readiness thành công phải trả `database: "ok"`.

## 8. Kiểm tra đầy đủ sau khi đổi máy

```powershell
npm test
npm run lint
npm run build
npm run media:inventory:strict
```

Nếu ảnh được khôi phục từ backup, đọc [media-storage.md](media-storage.md) và chạy verify trước khi đưa ảnh vào thư mục đang phục vụ.
