# Vận hành backend OCSEAFOOD

## Khởi động an toàn

Chạy backend bằng:

```bash
npm start --workspace=backend
```

Trước khi mở cổng HTTP, backend thực hiện theo thứ tự:

1. Xác minh cấu hình CORS và media.
2. Kết nối PostgreSQL bằng Prisma.
3. Mở cổng HTTP.
4. Khởi động notification worker.

Nếu cấu hình, PostgreSQL hoặc cổng HTTP lỗi, tiến trình đặt exit code khác 0 và không để worker chạy. Dữ liệu combo mẫu chỉ được tự tạo trong development; production không tự seed dữ liệu lúc khởi động.

## Health check

| Endpoint | Mục đích | Thành công | Database lỗi |
| --- | --- | --- | --- |
| `/health/live` | Xác nhận tiến trình Node còn phản hồi | HTTP 200 | Vẫn HTTP 200 |
| `/health` | Readiness tương thích với cấu hình cũ | HTTP 200 | HTTP 503 |
| `/health/ready` | Kiểm tra Node và PostgreSQL | HTTP 200 | HTTP 503 |

Readiness chạy `SELECT 1` và bị giới hạn bởi `HEALTHCHECK_TIMEOUT_MS`. Load balancer hoặc Nginx nên dùng `/health/ready`; công cụ chỉ kiểm tra tiến trình có thể dùng `/health/live`.

Response readiness chỉ công bố trạng thái `ok` hoặc `unavailable`; hostname, tài khoản và lỗi PostgreSQL không được trả về client.

## Biến môi trường vận hành

```dotenv
NODE_ENV=production
CORS_ORIGIN=https://ocseafood.vn,https://www.ocseafood.vn
HEALTHCHECK_TIMEOUT_MS=2000
SHUTDOWN_TIMEOUT_MS=10000
```

`CORS_ORIGIN` bắt buộc trong production, chỉ nhận danh sách origin HTTP/HTTPS đầy đủ và không chấp nhận `*`. Origin không được có path.

## Logging

Production ghi mỗi sự kiện thành một JSON object trên một dòng. Request log gồm request ID, method, path không có query string, status và thời gian xử lý. Backend không ghi request body, cookie hoặc Authorization header.

Logger tự che các trường có tên dạng token, password, secret, cookie, Authorization, API key và chuỗi kết nối PostgreSQL. Response lỗi 500 trong production luôn dùng thông báo chung và không có stack trace.

## Graceful shutdown

Khi nhận `SIGTERM` hoặc `SIGINT`, backend:

1. Ngừng nhận kết nối HTTP mới.
2. Ngừng lịch chạy notification worker và chờ tick đang xử lý hoàn tất.
3. Chờ request HTTP đang xử lý hoàn tất.
4. Ngắt Prisma.

Toàn bộ quá trình phải hoàn tất trong `SHUTDOWN_TIMEOUT_MS`. Nếu quá hạn, backend đóng các kết nối HTTP còn lại, thử ngắt Prisma và kết thúc với exit code lỗi để process manager ghi nhận.

## Secret trong trang Admin

`GET /settings` không trả lại bot token, access token hoặc SMTP password đã lưu. API chỉ trả cờ `*_CONFIGURED`. Trường secret rỗng trong một lần lưu được hiểu là giữ nguyên giá trị hiện có; nhập giá trị mới sẽ thay thế secret.

Danh sách lệnh production đã được đối chiếu tại [pre-deployment.md](pre-deployment.md). Quy trình setup PostgreSQL 18 và tạo Admin local nằm tại [windows-setup.md](windows-setup.md).
