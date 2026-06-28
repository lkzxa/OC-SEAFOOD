# Cấu Trúc Dự Án Ốc Seafood

Dự án này là một **Monorepo** chứa cả Frontend (Next.js) và Backend (Node.js/Express) trong cùng một thư mục gốc.

## Thư mục gốc (`/`)

- `frontend/`: Chứa mã nguồn của ứng dụng người dùng cuối và giao diện quản trị (Admin). Được xây dựng bằng **Next.js**, React, TailwindCSS.
- `backend/`: Chứa mã nguồn của API Server. Được xây dựng bằng **Node.js, Express** và sử dụng **Prisma ORM** để tương tác với cơ sở dữ liệu PostgreSQL.
- `package.json` & `package-lock.json`: File cấu hình chung quản lý dependencies cho toàn bộ monorepo (sử dụng npm workspaces).
- `.gitignore`: Danh sách các file và thư mục bị bỏ qua bởi Git.
- `WEBSITE_USER_GUIDE.md`, `README.md`: Các tài liệu hướng dẫn và mô tả hệ thống.

---

## Cấu trúc Frontend (`/frontend/`)

Ứng dụng sử dụng **Next.js App Router** (phiên bản mới nhất).

- `src/`
  - `app/`: Nơi định nghĩa các route (đường dẫn) của ứng dụng. Mỗi thư mục bên trong tương ứng với một URL.
    - Chứa các trang dành cho khách hàng như: `about`, `blog`, `cart`, `category`, `combo`, `login`, `menu`, `product`, `profile`, `tuyen-dung`.
    - `admin/`: Khu vực quản trị viên với các trang con như `categories`, `orders`, `posts`, `products`, `settings`, `users`.
    - `globals.css`: File định nghĩa CSS toàn cục và các utility class Tailwind.
    - `layout.tsx` & `page.tsx`: Layout chung và trang chủ của toàn ứng dụng.
  - `components/`: Chứa các React components có thể tái sử dụng.
    - `admin/`: Các components đặc thù dành riêng cho giao diện Admin (ví dụ: `AdminLayout`, `AdminRouteGuard`).
    - Các components chung: `Header.tsx`, `Footer.tsx`, `ProductCard.tsx`, `FloatingContact.tsx`, `AnnouncementModal.tsx`.
  - `hooks/`: Custom React hooks (VD: `useCart.ts`).
  - `store/`: Quản lý trạng thái (state management) bằng **Zustand**. Gồm các file như `useAuthStore.ts`, `useCartStore.ts`, `useOrderHistoryStore.ts`, v.v.
  - `utils/`: Chứa các hàm tiện ích dùng chung (VD: `vietnamLocations.ts`).
  - `__tests__/`: Các file Unit Test và Component Test viết bằng Vitest.
- `public/`: Chứa các tài nguyên tĩnh như hình ảnh, icon, SVG (`next.svg`, `vercel.svg`, banner...).
- `vitest.config.ts`, `tsconfig.json`, `package.json`: Các file cấu hình cho Testing, TypeScript, và quản lý thư viện frontend.

---

## Cấu trúc Backend (`/backend/`)

Backend RESTful API cho ứng dụng.

- `src/`
  - `routes/`: Định nghĩa các API endpoint. Mỗi file quản lý một nhóm tính năng:
    - `auth.js`: Đăng nhập, đăng ký, xác thực OAuth.
    - `categories.js`, `products.js`: Quản lý danh mục và sản phẩm.
    - `orders.js`, `checkout.js`: Quản lý giỏ hàng, đặt hàng và thanh toán.
    - `posts.js`, `recruitment.js`: Quản lý bài viết blog và thông tin tuyển dụng.
    - `settings.js`: Các API thiết lập / cấu hình hệ thống chung.
    - `users.js`: Quản lý tài khoản người dùng.
  - `middleware/`: Các middleware chặn và xử lý luồng request trước khi vào route controller:
    - `auth.js`, `authorize.js`, `optionalAuth.js`: Xử lý kiểm tra JWT Token và phân quyền (Roles).
    - `rateLimiter.js`: Giới hạn số lượng request để chống spam/DDoS.
    - `validate.js`: Kiểm tra tính hợp lệ của dữ liệu đầu vào.
    - `errorHandler.js`: Middleware xử lý lỗi tập trung.
  - `config/`: Các cài đặt môi trường và cấu hình kết nối.
  - `utils/`: Hàm tiện ích phía server dùng chung ở nhiều chỗ.
  - `validation/`: Các schema kiểm tra dữ liệu đầu vào.
  - `workers/`: Các luồng chạy ngầm (background jobs, ví dụ: `check-outbox.js` hoặc notification worker).
  - `app.js` & `server.js`: File khởi tạo Express app và chạy HTTP server.
- `prisma/`: Chứa `schema.prisma` định nghĩa cấu trúc cơ sở dữ liệu (PostgreSQL) và sinh ra Prisma Client.
- `package.json`: Cấu hình thư viện và script cho backend.

---

## Thư mục & File khác

- `reports/`: Nơi chứa các báo cáo (ví dụ như hình ảnh screenshot từ quá trình test UI/E2E).
- `input/` & `prompts/`: Chứa các tài liệu, yêu cầu hệ thống và script cấu hình để phục vụ việc tự động hóa AI.
