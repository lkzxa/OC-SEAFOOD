# Session Log - 2026-07-15 (Seed ảnh sản phẩm sạch và chuẩn hóa dữ liệu)

## Mục tiêu:
- Thay thế toàn bộ hình ảnh sản phẩm cũ bằng ảnh mới từ thư mục `D:\OCSEAFOOD\IMG\WEBSITE-20260714T060957Z-1-001\WEBSITE`.
- Cập nhật script seed CSDL (`seed.js`) để nhận diện ảnh sống (`Song.png` hoặc `sống.png`) làm ảnh chính/đầu tiên và các ảnh chế biến (`Che_bien_*.png`) theo sau.
- Loại bỏ các sản phẩm không có ảnh trong thư mục khỏi danh sách seed.
- Khắc phục lỗi hoán đổi slug của Cua King Đỏ và Cua King Xanh.
- Bổ sung tùy chọn giá cho Cá Bơn Hàn Quốc.

## Chi tiết thực hiện:

1. **Dọn dẹp & Copy ảnh:**
   - Xóa sạch các thư mục ảnh cũ (`CUA`, `Cá`, `So Oc`, `TÔM`) trong `backend/uploads`.
   - Copy toàn bộ dữ liệu ảnh từ thư mục nguồn của người dùng sang `backend/uploads`.

2. **Cập nhật script Seed (`seed.js`):**
   - Viết hàm `getProductImages` quét động thư mục của từng sản phẩm.
   - Ưu tiên chọn ảnh sống làm phần tử đầu tiên trong mảng ảnh, tiếp đến là các ảnh chế biến được sắp xếp tăng dần theo số thứ tự (ví dụ: `Che_bien_1.png`, `Che_bien_2.png`...).
   - Loại bỏ sản phẩm `Bút Đo Độ` và `Ốc Nhảy` khỏi danh sách seed do không có ảnh (theo phản hồi của khách hàng).
   - Sửa lỗi đổi chéo slug: `Cua King Đỏ Na Uy` -> `cua-king-do-nauy`, `Cua King Xanh` -> `cua-king-xanh`.
   - Cá Bơn Hàn Quốc: Gộp ảnh sống của cả 2 loại `bơn nâu` và `TRẮNG` lên đầu, sau đó đến các ảnh chế biến của `bơn nâu` (Tổng cộng 5 ảnh). Thêm option `Bơn Sao Safari:871500`.

3. **Chạy Seed & Kiểm thử:**
   - Thực thi thành công `node backend/src/utils/seed.js`. Seed thành công toàn bộ sản phẩm và danh mục sạch.
   - Sửa đổi các mock Prisma thiếu trong test của backend giúp 18/18 test suites pass.
   - Khắc phục lỗi mock `useSearchParams` và tham chiếu object thay đổi trong frontend test giúp 20/20 test suites pass.

4. **Xác minh trực quan (Browser Subagent):**
   - Truy cập `http://localhost:3000` và kiểm tra chi tiết các sản phẩm như Cua King Đỏ Na Uy, Cua King Xanh, Cá Bơn Hàn Quốc.
   - Hình ảnh tải mượt mà, đúng thứ tự ảnh sống lên đầu tiên, các ảnh chế biến theo sau, hoàn toàn không có lỗi 404.

## Kết quả:
- Hệ thống dữ liệu ảnh sản phẩm đã được làm sạch 100%.
- Tất cả unit test của cả frontend và backend đều ở trạng thái PASS 100%.
