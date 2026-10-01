# Hướng dẫn sử dụng OCSEAFOOD

## Phạm vi hệ thống

Website nhận yêu cầu tư vấn mua hải sản và lưu đơn hàng để nhân viên liên hệ xác nhận giá/giao hàng. Website chưa thu tiền trực tuyến và chưa theo dõi các bước giao vận.

## Khách truy cập

- `/`: xem nội dung nổi bật, danh mục, sản phẩm và bài viết mới.
- `/menu`: tìm kiếm, lọc và xem thực đơn.
- `/category/[slug]`: xem sản phẩm theo danh mục.
- `/product/[slug]`: xem ảnh, quy cách, giá tham khảo và thêm vào giỏ.
- `/combo`, `/combo/[slug]`: xem combo và thêm combo vào giỏ.
- `/blog`, `/blog/[id]`: xem cẩm nang vào bếp.
- `/about`: giới thiệu OCSEAFOOD.
- `/tuyen-dung`: xem vị trí tuyển dụng và gửi hồ sơ.
- `/login`: đăng nhập, đăng ký hoặc yêu cầu đặt lại mật khẩu.
- `/profile`: xem thông tin và lịch sử đơn của tài khoản đang đăng nhập.

## Gửi yêu cầu đặt hàng

1. Chọn sản phẩm/combo và thêm vào giỏ.
2. Mở `/cart`, kiểm tra số lượng và giá ước tính.
3. Điền họ tên, email, số điện thoại và địa chỉ ba cấp.
4. Gửi yêu cầu. Backend kiểm tra lại sản phẩm và tính giá từ database.
5. Nhân viên liên hệ trực tiếp để xác nhận giá cuối và giao hàng.

Khách không đăng nhập vẫn có thể gửi yêu cầu. Đơn của khách đăng nhập được đồng bộ vào trang Profile.

## Ba trạng thái đơn hàng chính thức

| Mã | Nhãn hiển thị | Ý nghĩa |
| --- | --- | --- |
| `PENDING` | Chờ tư vấn | Yêu cầu mới, nhân viên chưa xác nhận |
| `CONFIRMED` | Đã xác nhận | Nhân viên đã liên hệ và xác nhận yêu cầu |
| `CANCELLED` | Đã hủy | Yêu cầu không tiếp tục xử lý |

Hệ thống không có `SHIPPING` hoặc `COMPLETED`. Việc giao hàng thực tế được theo dõi ngoài website ở phiên bản hiện tại.

## Quản trị

Admin đăng nhập tại `/login` và truy cập `/admin`.

- Danh mục: tên, slug, mô tả, banner và thứ tự.
- Sản phẩm: nội dung, ảnh, danh mục, giá tham khảo, quy cách và trạng thái hiển thị.
- Combo: nội dung, ảnh, danh sách món, giá và trạng thái hiển thị.
- Bài viết: nội dung, ảnh, slug và metadata SEO.
- Đơn hàng: lọc, xem chi tiết, chỉnh số lượng/giá cuối, ghi chú và ba trạng thái chính thức.
- Người dùng: tạo, sửa vai trò và quản lý tài khoản.
- Tuyển dụng: quản lý vị trí đang hiển thị.
- Cài đặt: thông báo trang chủ, thông tin liên hệ, Telegram, Zalo và SMTP.

Các thay đổi giá, số lượng, tổng tiền hoặc trạng thái đơn được ghi vào audit log.

## Đăng nhập Admin

Không có tài khoản hoặc mật khẩu mặc định trong tài liệu. Người vận hành tạo hoặc đặt lại Admin local bằng quy trình tại [docs/windows-setup.md](docs/windows-setup.md).

- Local final testing: đặt `ALLOW_ADMIN_PASSWORD_LOGIN=true` để cho phép Admin đăng nhập bằng mật khẩu.
- Production: backend luôn chặn mật khẩu Admin và chỉ cho Admin đã tồn tại đăng nhập qua Google OAuth.

Khách hàng vẫn đăng ký/đăng nhập bằng mật khẩu theo giao diện thông thường.
