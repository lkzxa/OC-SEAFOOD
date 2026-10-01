# Lưu trữ và backup ảnh OCSEAFOOD

## Phương án production

Project dùng ổ đĩa bền vững trên VPS làm nơi lưu ảnh chính. Thư mục ảnh phải nằm ngoài thư mục source/release để một lần deploy mới không xóa ảnh cũ.

Ví dụ cấu hình trên Linux:

```bash
sudo install -d -m 0750 -o ocseafood -g ocseafood /var/lib/ocseafood/uploads
```

Đặt trong `backend/.env`:

```dotenv
NODE_ENV=production
MEDIA_PROVIDER=local
MEDIA_ROOT=/var/lib/ocseafood/uploads
```

Backend phục vụ nội dung của thư mục này tại `/uploads`. Frontend đã chuyển tiếp `/uploads/*` đến backend qua `frontend/next.config.ts`.

Cloudinary vẫn là lựa chọn dự phòng. Khi cần dùng, đặt `MEDIA_PROVIDER=cloudinary` và khai báo đủ `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

## Kiểm kê

Chạy sau khi nhập dữ liệu, chép ảnh hoặc trước mỗi lần deploy quan trọng:

```bash
npm run media:inventory
npm run media:inventory:strict
```

Báo cáo được lưu tại `reports/media-inventory.json`. Chế độ `--strict` thất bại nếu database trỏ tới tệp local bị thiếu/hỏng, còn liên kết ảnh ngoài chưa được kiểm soát, hoặc kho ảnh chứa tệp không đúng định dạng.

## Tạo và kiểm tra backup

```bash
npm run media:backup
npm run media:verify-backup
```

Mỗi backup gồm archive và manifest tại `backend/backups/media/`. Manifest ghi kích thước và SHA-256 của từng tệp. Lệnh verify luôn giải nén vào một thư mục tạm sạch, so sánh đầy đủ danh sách, kích thước và SHA-256, rồi mới xóa thư mục tạm.

Trên VPS nên sao chép archive, manifest và backup PostgreSQL sang một máy hoặc kho lưu trữ khác. Một bản backup nằm trên cùng VPS sẽ mất cùng lúc khi ổ đĩa VPS hỏng.

Ví dụ cron chạy lúc 02:15 mỗi ngày:

```cron
15 2 * * * cd /srv/ocseafood/current && /usr/bin/npm run media:backup >> /var/log/ocseafood-media-backup.log 2>&1
```

## Khôi phục

1. Chép cặp archive và manifest về VPS mới.
2. Chạy `node backend/scripts/media-backup.js verify /đường/dẫn/tới/manifest.json`.
3. Giải nén archive vào một thư mục mới, ví dụ `/var/lib/ocseafood/uploads-restored`.
4. Đặt quyền sở hữu cho user chạy backend.
5. Đổi `MEDIA_ROOT` sang thư mục mới và khởi động lại backend.
6. Chạy `node backend/scripts/media-inventory.js --strict` và kiểm tra các trang sản phẩm, combo, bài viết.

Không giải nén đè trực tiếp lên thư mục đang phục vụ. Cách đổi sang thư mục mới giúp quay lại thư mục cũ ngay nếu quá trình kiểm tra không đạt.
