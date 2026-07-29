# Session Log — Seed Mô Tả Sản Phẩm, Gợi Ý Chế Biến & Hướng Dẫn Bảo Quản

**Ngày:** 2026-07-16  
**Phiên:** seed-product-descriptions

## Tóm tắt

Seed nội dung chi tiết cho toàn bộ 28 sản phẩm hải sản OCSEAFOOD, bao gồm:
- Mô tả ngắn (description) — viết lại hay hơn
- Mô tả chi tiết (detailDescription) — HTML rich content
- Gợi ý chế biến món (cookingSuggestion) — riêng biệt cho từng loại hải sản
- Hướng dẫn bảo quản (storageInstruction) — riêng biệt cho sản phẩm sống vs đông lạnh

## Các thay đổi

### 1. Database Schema
- **File:** `backend/prisma/schema.prisma`
- **Thay đổi:** Thêm 2 fields mới vào model Product:
  - `cookingSuggestion String? @db.Text`
  - `storageInstruction String? @db.Text`
- **Migration SQL:** `ALTER TABLE "Product" ADD COLUMN "cookingSuggestion" TEXT, ADD COLUMN "storageInstruction" TEXT;`
- Migration file: `prisma/migrations/20260716055300_add_cooking_storage_fields/migration.sql`

### 2. Backend Validation
- **File:** `backend/src/validation/business.js`
- **Thay đổi:** Thêm validation cho 2 fields mới trong ProductSchema (optional, nullable)

### 3. Seed Script
- **File:** `backend/src/config/seedProductDescriptions.js` (MỚI)
- **Chức năng:** Update 28 sản phẩm theo slug với 4 nội dung riêng biệt
- **Kết quả:** 28/28 sản phẩm updated thành công, 0 skipped

### 4. Frontend — Trang Chi Tiết Sản Phẩm
- **File:** `frontend/src/app/product/[slug]/ProductDetailContent.tsx`
- **Thay đổi:**
  - Thêm `cookingSuggestion` và `storageInstruction` vào Product interface
  - Tab "Gợi ý chế biến": render HTML từ DB nếu có, fallback nội dung mặc định
  - Tab "Hướng dẫn bảo quản": render HTML từ DB nếu có, fallback nội dung mặc định
  - Sử dụng `sanitizeHtml()` để chống XSS

### 5. Frontend — Admin Products Page
- **File:** `frontend/src/app/admin/products/page.tsx`
- **Thay đổi:**
  - Thêm 2 fields vào Product interface, emptyForm, edit population, payload
  - Thêm 2 Rich Text Editor (ReactQuill) cho Gợi ý chế biến và Hướng dẫn bảo quản

## Lưu ý

- **Cần restart dev server** sau khi thay đổi để Prisma client regenerate và backend trả về fields mới.
- Chạy `npx prisma generate` trong thư mục backend sau khi stop dev server.
- Nội dung seed đã được user kiểm duyệt trước khi thực thi.

## Danh sách sản phẩm đã seed (28/28)

| # | Sản phẩm | Slug |
|---|---|---|
| 1 | Cua King Đỏ Na Uy | cua-king-do-nauy |
| 2 | Cua King Xanh | cua-king-xanh |
| 3 | Cua Nâu Sofima | cua-nau-sofima |
| 4 | Cua Nâu Sofima (ĐL) | cua-nau-sofima-frozen |
| 5 | Cua Cốm | cua-com |
| 6 | Cua Gạch Cà Mau | cua-gach-ca-mau |
| 7 | Cua Tuyết | cua-tuyet |
| 8 | Tôm Hùm Bông VN | tom-hum-bong-viet-nam |
| 9 | Tôm Hùm Đỏ Tây Úc | tom-hum-do-tay-uc |
| 10 | Tôm Hùm Alaska | tom-hum-alaska |
| 11 | Tôm Hùm Xanh | tom-hum-xanh |
| 12 | Tôm Hùm Bông Úc | tom-hum-bong-uc |
| 13 | Tôm Sú | tom-su |
| 14 | Tôm Mũ Ni | tom-mu-ni |
| 15 | Tôm Tít | tom-tit |
| 16 | Ốc Tsubugai | oc-tsubugai |
| 17 | Sò Điệp Sống | so-diep-song |
| 18 | Bào Ngư Hàn Quốc | bao-ngu-han-quoc |
| 19 | Hàu Vàng Hàn Quốc | hau-vang-han-quoc |
| 20 | Bào Ngư Úc Ngọc Bích | bao-ngu-uc-ngoc-bich |
| 21 | Ốc Vòi Voi Ngà | oc-voi-voi-nga |
| 22 | Ốc Vòi Voi Canada Vàng | oc-voi-voi-canada-vang |
| 23 | Ốc Bulot Sofima | oc-bulot-sofima |
| 24 | Bào Ngư Đông Lạnh | bao-ngu-dong-lanh |
| 25 | Cá Bơn Vàng | ca-bon-vang |
| 26 | Cá Bơn Hàn Quốc | ca-bon-han-quoc |
| 27 | Cá Hồi | ca-hoi |
| 28 | Cá Trích Ép Trứng | ca-trich-ep-trung |
