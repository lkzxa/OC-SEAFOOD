# Hướng dẫn Sử dụng Chi tiết Website OCSEAFOOD 🌊

Chào mừng bạn đến với tài liệu hướng dẫn sử dụng hệ thống Website **OCSEAFOOD** (Next.js Frontend + Express Backend + Prisma PostgreSQL). Dưới đây là thông tin chi tiết về các tính năng, tài khoản thử nghiệm và các bước hướng dẫn vận hành hệ thống.

---

## 🔑 1. Tài khoản thử nghiệm (Test Accounts)

Hệ thống đã được thiết lập sẵn dữ liệu mẫu (seed data) phục vụ cho quá trình kiểm thử:

### 🧑‍💼 Tài khoản Quản trị viên (Admin)
Dùng để truy cập vào trang Quản trị (`/admin`) để quản lý sản phẩm, đơn hàng và bài viết.
* **Email:** `admin@ocseafood.vn`
* **Mật khẩu:** `admin123456`

### 👤 Tài khoản Khách hàng (Customer)
Bạn có thể tự đăng ký tài khoản khách hàng mới trực tiếp tại trang Đăng ký (`/login` -> chuyển sang Đăng ký) để trải nghiệm quy trình mua hàng đầy đủ và xem trang cá nhân (`/profile`).

---

## 🌐 2. Sơ đồ các Trang (Site Map) & Chức năng chính

Hệ thống bao gồm các trang chính sau đây:

| Đường dẫn (URL) | Tên trang | Chức năng chính |
| :--- | :--- | :--- |
| `/` | Trang chủ (Home) | Banner giới thiệu, Danh mục nổi bật, Sản phẩm mới, Combos nổi bật, Tin tức ẩm thực mới nhất. |
| `/menu` | Thực đơn (Menu) | Xem toàn bộ sản phẩm, Tìm kiếm nhanh theo tên sản phẩm, Lọc sản phẩm theo danh mục. |
| `/combo` | Combo đặc biệt | Hiển thị các gói combo hải sản phối sẵn, nút thêm nhanh combo vào giỏ hàng. |
| `/category/[slug]` | Chi tiết danh mục | Xem tất cả các sản phẩm thuộc một danh mục cụ thể (Ví dụ: `/category/cua-ghe`). |
| `/blog` | Tin tức ẩm thực | Đọc bài viết chia sẻ công thức nấu hải sản, cẩm nang chọn hải sản tươi ngon. |
| `/cart` | Giỏ hàng & Thanh toán | Quản lý giỏ hàng, tăng/giảm số lượng, điền thông tin đặt hàng & chọn địa chỉ 3 cấp Việt Nam. |
| `/profile` | Thông tin cá nhân | Xem thông tin tài khoản, chỉnh sửa thông tin cá nhân và lịch sử đơn hàng đã đặt. |
| `/admin` | Trang quản trị | Dashboard cho Admin quản lý Danh mục, Sản phẩm, Đơn hàng, Bài viết. |

---

## 🛒 3. Hướng dẫn các Quy trình Nghiệp vụ chính

### 📥 Quy trình Mua hàng & Đặt hàng (Khách hàng)
1. **Xem và chọn sản phẩm**: 
   * Truy cập trang **Thực đơn** (`/menu`) hoặc **Combo** (`/combo`).
   * Chọn sản phẩm và nhấn **Thêm vào giỏ hàng**.
2. **Quản lý giỏ hàng**: 
   * Nhấn biểu tượng Giỏ hàng trên thanh Header hoặc truy cập `/cart`.
   * Thay đổi số lượng sản phẩm tùy ý.
3. **Thanh toán & Nhập thông tin giao hàng**:
   * Nhập **Họ và tên**, **Số điện thoại** (định dạng Việt Nam hợp lệ như `09xxxxxxxx` hoặc `+84xxxxxxxxx`).
   * Chọn địa chỉ 3 cấp thông qua menu thả động: **Tỉnh/Thành phố** -> **Quận/Huyện** -> **Phường/Xã**, sau đó nhập địa chỉ chi tiết số nhà/tên đường.
   * Nhấn **Xác nhận đặt hàng**.
4. **Hệ thống xử lý ngầm (Notification Outbox)**:
   * Sau khi đặt hàng thành công, hệ thống tự động lưu yêu cầu gửi thông báo vào hàng đợi (`NotificationOutbox`).
   * Worker ngầm chạy mỗi 10 giây sẽ tự động quét và gửi mail thông báo cho Admin (`admin@ocseafood.com`) hoặc gửi tin nhắn thông báo về Telegram bot (nếu được cấu hình token).

---

### ⚙️ Quy trình Quản trị hệ thống (Admin)
Truy cập đường dẫn `/admin` và đăng nhập bằng tài khoản quản trị `admin@ocseafood.vn`.

#### 📂 A. Quản lý Danh mục (Categories)
* Vào mục **Danh mục** (Categories) trên thanh quản trị.
* **Thêm mới**: Nhập tên danh mục, slug (đường dẫn rút gọn tự động) và mô tả.
* **Chỉnh sửa / Xóa**: Cập nhật thông tin hoặc xóa các danh mục không cần thiết.

#### 🦞 B. Quản lý Sản phẩm (Products)
* Vào mục **Sản phẩm** (Products).
* Bạn có thể thêm sản phẩm mới kèm các thuộc tính:
  * **Tên sản phẩm**, **Slug**, **Đơn vị tính** (kg, con, phần,...).
  * **Giá tham khảo** (VND).
  * **Liên hệ báo giá**: Nếu tích chọn thuộc tính này, sản phẩm sẽ hiển thị nút "Liên hệ" thay cho giá bán trên UI đối với hải sản thay đổi giá theo ngày.
  * **Trạng thái hiển thị (Visible)**: Bật/Tắt hiển thị sản phẩm trên cửa hàng.

#### ✍️ C. Quản lý Tin tức (Blog/Posts)
* Vào mục **Bài viết** (Posts) để viết hoặc chỉnh sửa các cẩm nang, tin tức khuyến mãi ẩm thực của nhà hàng.

#### 📝 D. Quản lý Đơn hàng (Orders)
* Vào mục **Đơn hàng** (Orders).
* Xem toàn bộ danh sách đơn đặt hàng của khách hàng cùng chi tiết sản phẩm, tổng tiền, thông tin giao nhận.
* Cập nhật trạng thái đơn hàng theo quy trình thực tế: `Chờ xử lý (PENDING)` -> `Đã xác nhận (CONFIRMED)` -> `Đang giao hàng (SHIPPING)` -> `Hoàn thành (COMPLETED)` hoặc `Đã hủy (CANCELLED)`.

---

## 🛠️ 4. Hướng dẫn chạy và vận hành cục bộ (Local Development)

Nếu bạn muốn chạy thử nghiệm toàn bộ hệ thống trên máy tính cá nhân của mình, hãy thực hiện theo các bước sau:

1. **Khởi động Cơ sở dữ liệu PostgreSQL**:
   Mở PowerShell và chạy lệnh sau để chạy cơ sở dữ liệu nền:
   ```powershell
   & "C:\Users\thanh\PostgreSQL\bin\pg_ctl.exe" -D "C:\Users\thanh\PostgreSQL\data" start
   ```

2. **Chạy ứng dụng Web**:
   Mở terminal tại thư mục gốc dự án (`d:\WEBSITE-OCSEAFOOD\OCSEAFOOD\production-coding-harness`) và chạy:
   ```bash
   npm run dev
   ```

3. **Truy cập Trình duyệt**:
   * Giao diện khách hàng: [http://localhost:3000](http://localhost:3000)
   * Trang đăng nhập admin/khách hàng: [http://localhost:3000/login](http://localhost:3000/login)
   * Trang quản trị admin: [http://localhost:3000/admin](http://localhost:3000/admin)
