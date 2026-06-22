# Harness Risk

Generated from:

* `.harness/task.md`

## Risk Level

normal

## Why

Tác vụ này thực hiện tích hợp gọi API thực tế tới Backend từ các trang giao diện (Trang chủ và Thực đơn). Mặc dù không ghi dữ liệu trực tiếp vào database (chỉ thực hiện đọc dữ liệu), các rủi ro về lỗi kết nối mạng (CORS block, server down, dữ liệu rỗng), lỗi bất đồng bộ khi tải trang (Race conditions), và lỗi SSR hydration khi fetch dữ liệu từ client là các điểm cần chú ý.

## Risk Areas

1. **Lỗi CORS (Cross-Origin Resource Sharing):** Vì Frontend chạy ở port 3000 và Backend chạy ở port 5000, nếu không cấu hình Next.js rewrites đúng, trình duyệt sẽ chặn đứng tất cả API calls từ phía Client.
2. **Lỗi tải dữ liệu rỗng / lỗi Server:** Trang web có thể bị trắng trang hoặc crash nếu API phản hồi lỗi (500) hoặc trả về mảng danh mục / sản phẩm trống mà không có cơ chế phòng vệ (fallback UI/loading state).
3. **Hydration Mismatch:** Tiếp tục là nguy cơ từ việc hiển thị sản phẩm ngẫu nhiên hoặc không tương thích render tĩnh.
4. **Lỗi TypeScript / SSR Compile:** Chuyển đổi NextConfig và các file page sang tsx chứa async call cần viết đúng cú pháp Next.js v16.

## Must Not Break

* **Không ảnh hưởng Backend:** Không sửa đổi bất kỳ tệp tin nào trong `backend/`.
* **Store giỏ hàng và Header/Footer:** Trạng thái giỏ hàng Zustand và giao diện Header/Footer ở các task trước vẫn phải hoạt động chính xác và trơn tru.

## Required Proof

* Chạy thành công toàn bộ test suite: `npm run test --workspace=frontend`.
* Biên dịch ứng dụng sản xuất thành công: `npm run build --workspace=frontend`.
* Kiểm tra linter thành công: `npm run lint --workspace=frontend`.

## Risk Mitigation

1. **Thiết lập API Client / Fetcher an toàn:** Sử dụng try-catch khi fetch dữ liệu, cung cấp các loading spinner/skeleton và hiển thị thông báo lỗi thân thiện thay vì làm sập trang.
2. **Cấu hình Rewrites chuẩn:** Kiểm tra hoạt động của NextConfig rewrites trong môi trường dev.
3. **Mocking dữ liệu kiểm thử:** Trong tệp test `menu.test.tsx`, thực hiện giả lập (mock) fetch API hoặc cung cấp dữ liệu giả (mock data) đầy đủ để Vitest có thể chạy độc lập không phụ thuộc vào trạng thái chạy của backend server.
