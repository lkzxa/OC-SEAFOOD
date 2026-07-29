# Nhật ký phiên làm việc - Thêm Banner cho Danh mục lớn (2026-07-01)

## Mục tiêu:
- Bổ sung trường `banner` cho danh mục lớn trong Admin để người quản trị có thể tải lên ảnh hoặc nhập URL banner.
- Hiển thị banner của mỗi danh mục lớn phía dưới tiêu đề và phía trên danh sách card sản phẩm (Ví dụ: Dòng sản phẩm Cua - Ghẹ có banner ngăn giữa tiêu đề và danh sách).

## Các hành động đã thực hiện:

1. **Thiết lập Cơ sở dữ liệu & API Backend**:
   - Thêm cột `banner String?` vào model `Category` trong `backend/prisma/schema.prisma`.
   - Đồng bộ cơ sở dữ liệu bằng lệnh `npx prisma db push`.
   - Biên dịch lại Prisma Client bằng `npx prisma generate` sau khi tạm dừng server để giải phóng lock file.
   - Thêm `banner` vào schema xác thực dữ liệu `CategorySchema` trong `backend/src/validation/business.js` sử dụng thư viện Zod.

2. **Cập nhật Giao diện Quản trị (Admin)**:
   - Thêm component `ImageUploader` và các trạng thái cần thiết vào trang quản lý danh mục `frontend/src/app/admin/categories/page.tsx` giúp admin dễ dàng tải ảnh banner lên.
   - Thêm cột xem trước ảnh banner trong bảng danh sách danh mục.
   - Cập nhật interface `Category` ở trang sản phẩm `frontend/src/app/admin/products/page.tsx`.

3. **Cập nhật Giao diện Người dùng (Frontend)**:
   - **Trang chủ (`/`)**: Bổ sung khu vực kết xuất ảnh banner của danh mục nằm ở giữa tiêu đề danh mục và danh sách sản phẩm.
   - **Trang Thực đơn (`/menu`)**: Hiển thị banner danh mục đang chọn ngay phía trên lưới card sản phẩm.
   - **Trang Chi tiết danh mục (`/category/[slug]`)**: Lấy trực tiếp URL banner động của danh mục từ DB thay vì dùng mock tĩnh map từ trước.
   - **Trang chi tiết sản phẩm (`/product/[slug]`)**: Khai báo bổ sung kiểu dữ liệu `Category` để đảm bảo biên dịch TypeScript thông suốt.

## Đánh giá
Các thay đổi đã hoàn tất và tương thích tốt. Đã xác minh bằng cách chạy các bộ kiểm thử backend và chạy server phát triển trong môi trường cục bộ thành công.
