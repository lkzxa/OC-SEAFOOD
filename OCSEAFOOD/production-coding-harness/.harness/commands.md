# Harness Commands

Generated from:

* `input/project-commands.md`
* `.harness/task.md`

## Install Commands

Không cần cài đặt thêm package mới trong tác vụ này.

```bash
npm install
```

## Build Commands

```bash
npm run build --workspace=frontend
```

## Test Commands

```bash
npm run test --workspace=frontend
```

## Lint Commands

```bash
npm run lint --workspace=frontend
```

## Runtime / Manual Verification

Chạy song song cả frontend và backend ở môi trường phát triển:

```bash
npm run dev
```

Truy cập `http://localhost:3000` và `http://localhost:3000/menu` trên trình duyệt để kiểm tra:
1. Danh mục và sản phẩm hiển thị đầy đủ động từ database (bảo đảm database backend đang chạy và có dữ liệu mẫu).
2. Kiểm tra bộ lọc danh mục và chức năng thêm vào giỏ hàng.

## Forbidden Commands for TASK-0017

Tất cả các lệnh tương tác với Backend hoặc Database đều bị cấm trong tác vụ này:

```bash
# Cấm chạy các lệnh migration/database
npm run prisma:generate --workspace=backend
npm run prisma:migrate --workspace=backend
npm run prisma:push --workspace=backend
npm run test --workspace=backend
```

## Failure Handling

Nếu bất kỳ lệnh nào thuộc nhóm Build, Test hoặc Lint thất bại:
1. Ghi nhận thông tin lỗi vào `.harness/fix-loop.md`.
2. Xác định nguyên nhân gốc rễ và thực hiện chỉnh sửa mã nguồn với phạm vi tối thiểu.
3. Chạy lại lệnh lỗi trước khi chạy lại toàn bộ bộ lệnh kiểm tra.
