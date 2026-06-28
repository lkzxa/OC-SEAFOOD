# Báo Cáo Lỗi: Chức năng Đăng nhập (2026-06-25)

## 1. Phân tích nguyên nhân không thể đăng nhập
Dựa vào kiểm tra mã nguồn và thông báo lỗi, hiện tại có 2 nguyên nhân chính dẫn đến việc bạn không thể đăng nhập:

- **Lý do 1 (Quan trọng nhất): Database chưa có tài khoản Admin**. 
  - Trong buổi làm việc trước, hệ thống có nhắc nhở việc "cần setup account admin" nhưng chưa được thực hiện. 
  - Khi bạn bấm "Đăng nhập bằng Google" (chế độ giả lập), hệ thống sẽ gửi email `admin@ocseafood.vn` lên server. Tuy nhiên Server tìm trong Database không thấy tài khoản này, hoặc thấy nhưng quyền (Role) chỉ là `CUSTOMER` chứ không phải `ADMIN`, dẫn đến lỗi **403 Forbidden** hoặc **401 Unauthorized**.

- **Lý do 2: Server chưa được khởi động đúng cách**.
  - Theo terminal log của bạn, khi chạy lệnh `npm run dev`, hệ thống Next.js đã hiện thông báo `Terminate batch job (Y/N)?`. Do bạn gõ chữ `y` (không hợp lệ với PowerShell) nên server có thể đang bị treo hoặc chưa chạy lại thành công, dẫn đến giao diện Frontend không thể gọi API tới Backend được.

## 2. Cách khắc phục (Tạo tài khoản Admin)

Tôi đã viết sẵn một script khởi tạo tài khoản Admin gốc cho bạn. Vui lòng làm theo các bước sau để thiết lập:

**Bước 1: Chạy lệnh tạo tài khoản Admin**
Mở Terminal mới (hoặc tắt server đang chạy) và trỏ vào thư mục `backend`, chạy lệnh:
```bash
cd d:\WEBSITE-OCSEAFOOD\OCSEAFOOD\production-coding-harness\backend
node create-admin.js
```
*Lệnh này sẽ tự động tạo một tài khoản Admin với thông tin:*
- Email: `admin@ocseafood.vn`
- Mật khẩu: `admin`

**Bước 2: Khởi động lại Server**
Sau khi tạo xong, hãy khởi động lại dự án bằng lệnh:
```bash
cd d:\WEBSITE-OCSEAFOOD\OCSEAFOOD\production-coding-harness
npm run dev
```

**Bước 3: Đăng nhập**
- Quay lại trang `http://localhost:3000/login`
- Bạn có thể **điền Email và Mật khẩu** ở trên.
- Hoặc đơn giản là bấm nút **Đăng nhập bằng Google** (chế độ giả lập sẽ tự động dùng email `admin@ocseafood.vn` để đăng nhập).
