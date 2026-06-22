# Project Brief

## Project Name

OCSEAFOOD

## Project Type

Lead Generation E-commerce

## Goal

Xây dựng website trưng bày hải sản mang tông màu "Xanh đại dương" nhằm tăng uy tín thương hiệu.

Chuyển đổi khách truy cập thành khách hàng tiềm năng (leads) thông qua luồng "đặt hàng" ảo với giỏ hàng.

Tự động hóa thông báo nội bộ và cho phép Admin điều chỉnh đơn hàng sau khi tư vấn chốt giá thực tế.

## Tech Stack

Frontend: Next.js (React), Tailwind CSS (Theme: Ocean Blue), Zustand or React Context
Backend: Node.js (Express.js)
Database: PostgreSQL via Prisma ORM
Auth: Custom JWT Authentication implemented in Express middleware
Validation: Zod or equivalent schema validation
Security: bcrypt password hashing, role-based authorization, rate limiting, centralized error handling
Integrations: Nodemailer/SendGrid for Email, Telegram Bot API for Admin Notification
Testing: Jest for backend, Vitest for frontend, Playwright or equivalent for E2E later

## Architecture Decision

The backend Express API is the source of truth for authentication and authorization.

Do not use NextAuth.js in this project unless a future task explicitly changes the architecture.

Frontend is only responsible for:

* calling login/register APIs
* storing the access token safely according to the selected implementation
* attaching the token to protected API requests
* redirecting users based on authentication state
* rendering UI based on current user role returned by backend

Backend is responsible for:

* password hashing
* JWT signing and verification
* role-based authorization
* protecting private routes
* protecting admin routes
* validating all incoming data
* preserving data integrity

## User Roles

### Guest

Khách chưa đăng nhập.

Guest có thể:

* xem trang chủ
* xem sản phẩm
* xem bài viết
* thêm sản phẩm vào giỏ hàng
* gửi form đặt hàng ảo
* đăng ký tài khoản

Guest không được:

* xem lịch sử đơn
* truy cập Admin Dashboard
* chỉnh sửa sản phẩm
* chỉnh sửa đơn hàng
* xem danh sách lead/order

### Customer

Khách đã đăng nhập.

Customer có thể:

* xem sản phẩm
* thêm sản phẩm vào giỏ hàng
* gửi form đặt hàng ảo
* được tự động điền sẵn thông tin cơ bản nếu đã có
* xem lịch sử yêu cầu/đơn của chính mình

Customer không được:

* truy cập Admin Dashboard
* xem đơn của khách khác
* chỉnh sửa giá đơn hàng
* chỉnh sửa sản phẩm
* chỉnh sửa bài viết

### Admin

Chủ cửa hàng hoặc nhân viên quản lý nội dung và xử lý lead.

Admin có thể:

* quản lý danh mục
* quản lý sản phẩm
* quản lý bài viết
* xem danh sách leads/orders
* cập nhật trạng thái đơn hàng
* cập nhật giá bán, số lượng, và tổng tiền sau khi tư vấn với khách
* xem audit log liên quan đến thay đổi đơn hàng

Admin không được:

* sửa dữ liệu mà không tạo audit log đối với các thay đổi quan trọng
* bypass validation
* dùng giá client gửi lên làm giá cuối cùng

## Main Features

### 1. Public Pages

Bao gồm:

* Trang Chủ
* Menu Sản Phẩm
* Bài Viết
* Giới Thiệu

UI tập trung vào:

* sự sang trọng
* uy tín
* cảm giác hải sản tươi sống
* màu chủ đạo Xanh đại dương
* rõ ràng về quy trình đặt hàng

### 2. Product Catalog

Sản phẩm cần hỗ trợ:

* tên sản phẩm
* hình ảnh
* đơn vị tính
* mô tả
* trạng thái hiển thị
* danh mục
* giá tham khảo nếu có
* nhãn "liên hệ" nếu giá biến động

Không được dùng giá hiển thị phía frontend làm giá cuối cùng của đơn hàng.

### 3. Cart & Lead Capture

Luồng đặt hàng là đặt hàng ảo.

Form thanh toán giả định gồm:

* Họ tên
* Email
* Số điện thoại
* Tỉnh/Thành phố
* Quận/Huyện
* Phường/Xã
* Số nhà/Tên đường
* Ghi chú nếu có

Địa chỉ phải chuẩn hóa 3 cấp:

```text
Province/City -> District -> Ward + Street Address
```

Sau khi khách gửi form, hệ thống lưu lead/order và thông báo cho Admin.

Thông báo cho khách:

```text
Ngay sau khi đơn hàng được xác nhận thành công, sẽ có nhân viên tư vấn liên hệ và hướng dẫn quý khách thanh toán.
```

### 4. Customer Account

Hệ thống tài khoản gồm:

* đăng ký
* đăng nhập
* xem thông tin cá nhân cơ bản
* xem lịch sử yêu cầu/đơn đã gửi

Authentication dùng Custom JWT từ backend Express.

Không dùng NextAuth.js trong MVP này.

### 5. Admin Dashboard

Admin Dashboard gồm:

* quản lý danh mục
* quản lý sản phẩm
* quản lý bài viết
* quản lý leads/orders
* lọc đơn theo trạng thái
* phân trang danh sách đơn
* xem chi tiết đơn
* cập nhật giá bán, số lượng, tổng tiền
* cập nhật trạng thái xử lý đơn
* xem audit log thay đổi đơn hàng

Tính năng đặc biệt:

Admin được phép cập nhật lại giá bán, số lượng và tổng tiền sau khi gọi điện tư vấn và chốt giá thực tế với khách.

Mọi thay đổi quan trọng của Admin phải tạo audit log.

### 6. Notification Automation

Khi có form submit thành công, hệ thống cần thông báo cho Admin qua:

* Email
* Telegram

Không được để lỗi Email hoặc Telegram làm hỏng việc tạo đơn nếu đơn đã lưu thành công.

Ưu tiên dùng Notification Outbox:

```text
Customer submits checkout form
→ Backend validates input
→ Backend saves order/lead
→ Backend creates notification outbox record
→ API returns success
→ Worker/sender processes Email/Telegram notification
```

## Important Production Rules

* Validate all user input with schema validation before reaching business logic.
* Validate Vietnamese phone number format.
* Validate email format.
* Validate 3-level address structure: Province/City -> District -> Ward plus street address.
* Protect private routes with authentication middleware.
* Protect Admin routes with role-based authorization middleware.
* Never trust client-submitted price, subtotal, discount, role, or total.
* The system may record client-side estimated order information, but final price is decided by Admin only.
* Any Admin change to price, quantity, status, or total must create an audit log.
* Do not log sensitive customer data such as phone number, full address, email, access token, password, or raw request body.
* Use environment variables for secrets and external integration tokens.
* Do not hardcode JWT_SECRET, DATABASE_URL, email credentials, or Telegram bot token.
* Add rate limiting to authentication and checkout/lead submission APIs.
* Notification failures must not cause order creation to fail after the order is saved.
* Prefer notification outbox/queue pattern instead of sending Email/Telegram synchronously inside the checkout request.
* All list APIs used by Admin Dashboard must support pagination.
* All critical database writes must preserve data integrity.
* All API errors should use normalized error response format.
* Do not expose stack traces to users in production mode.

## Required Audit Log Rules

When Admin updates an order after customer consultation, the system must record:

* orderId
* adminUserId
* changed fields
* old values
* new values
* reason or note if provided
* changedAt timestamp

Audit log must be append-only.

Do not overwrite old audit log records.

## Required Anti-Abuse Rules

The checkout/lead form must include:

* server-side validation
* rate limiting
* basic spam protection
* normalized error response
* no trust in frontend price values

Authentication APIs must include:

* rate limiting
* safe error messages
* password hashing
* JWT expiry
* no password returned in API responses

## Required Pagination Rules

Admin list APIs must support pagination.

Required query pattern:

```text
?page=1&pageSize=20
```

Recommended filters:

```text
status
createdAt
phone
email
```

Do not return unlimited admin lists.

## Current Project Status

New project.
