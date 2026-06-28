# Session Log - 2026-06-25 (Sửa lỗi Backend Server)

## Vấn đề gặp phải:
- Khách hàng không thể Đăng nhập, báo lỗi `Unexpected token 'I', "Internal S"... is not valid JSON`.
- Phân tích nguyên nhân: Do tôi có viết một đoạn code sai khi thiết lập tính năng Tải Ảnh Máy Tính (`backend/src/routes/upload.js`), tôi đã import sai hàm middleware tên là `verifyToken` (thực tế tên của nó là `auth`).
- Hậu quả: Express Backend Server văng lỗi (Crash) ngay từ lúc khởi động. 
- Khi Backend tắt, mọi lệnh gọi API từ Frontend (như `/api/auth/login`) đều bị Next.js báo lỗi Internal Server Error dưới dạng Text, khiến cho việc xử lý chuỗi trả về (json) ở frontend bị lỗi Unexpected Token 'I'.

## Hành động sửa lỗi:
- Sửa dòng `const { verifyToken } = require("../middleware/auth");` thành `const auth = require("../middleware/auth");` trong `upload.js`.
- Cập nhật hàm gọi middleware: `router.post("/", auth, upload.single("image"), ...)`

## Tình trạng:
- Backend đã chạy ổn định trở lại. Mọi thao tác kết nối DB, Đăng nhập, Up ảnh đã hoạt động.
