# Session Log - 2026-06-25 (Bổ sung lần 3)

## Mục tiêu bổ sung:
- Xây dựng hệ thống Upload ảnh từ máy tính cho toàn bộ hệ thống thay vì chỉ sử dụng URL ảnh ngoài.

## Các hành động đã thực hiện:

1. **Thiết lập Backend**:
   - Thêm thư viện `multer` vào `backend/package.json`.
   - Viết API Route `/api/upload` tại `backend/src/routes/upload.js`.
   - Cấu hình API giới hạn dung lượng 5MB, lọc định dạng ảnh và đổi tên file bằng UUID/timestamp để chống trùng lặp.
   - Cấu hình `express.static` trong `app.js` để phục vụ thư mục `uploads` công khai qua URL.

2. **Thiết lập Frontend UI (`ImageUploader`)**:
   - Viết Component `frontend/src/components/admin/ImageUploader.tsx`.
   - Giao diện gồm 1 ô Input Text (dành cho Link cũ) + 1 nút "Tải ảnh" (File input ẩn).
   - Component có trạng thái Loading spin và xử lý gửi file lên Backend bằng `FormData`, lấy lại URL.

3. **Thay thế diện rộng ở Frontend**:
   - Đổi thẻ `<input>` cơ bản thành `<ImageUploader>` tại **Ảnh đại diện** của trang Quản lý Sản phẩm (`ProductForm.tsx`).
   - Đổi thẻ `<input>` cơ bản thành `<ImageUploader>` tại **Ảnh bìa** của trang Quản lý Bài viết (`PostForm.tsx`).

4. **Tích hợp sâu vào Trình Soạn Thảo (ReactQuill)**:
   - Sửa cấu hình `quillModules` trong `PostForm.tsx` (sử dụng `useMemo` để bọc lại).
   - Viết hàm `imageHandler` custom để khi người dùng click icon "Chèn Ảnh" trong Toolbar, sẽ hiện hộp thoại chọn file trên máy, thay vì chèn mã Base64 nặng nề vào văn bản.
   - Hàm tự động upload ảnh qua `/api/upload` và chèn link tải về vào vị trí con trỏ chuột.

## Đánh giá
Tính năng Upload toàn diện đã hoàn thiện, bảo vệ Database khỏi việc phình to do chuỗi Base64 và giúp người quản trị linh hoạt hơn trong việc quản lý hình ảnh. (Cần cài đặt thủ công `multer` trên backend do giới hạn terminal sandbox).
