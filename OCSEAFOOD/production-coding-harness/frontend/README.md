# OCSEAFOOD Frontend

Frontend dùng Next.js App Router và phục vụ trên cổng 3000. Trình duyệt gọi API cùng origin qua `/api/*`; Next.js chuyển tiếp request đến backend được khai báo bằng `BACKEND_URL`.

## Cấu hình

```powershell
Copy-Item frontend/.env.example frontend/.env.local
```

```dotenv
BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=REPLACE_WITH_GOOGLE_CLIENT_ID
```

`BACKEND_URL` chỉ dùng phía server. Chỉ Google client ID được công khai vào browser bundle.

## Lệnh

Chạy từ thư mục gốc monorepo:

```powershell
npm run dev --workspace=frontend
npm test --workspace=frontend
npm run lint --workspace=frontend
npm run build --workspace=frontend
npm run start --workspace=frontend
```

`start` yêu cầu `build` đã hoàn thành. Trong local nên dùng lệnh gốc `npm run dev` để chạy đồng thời frontend và backend.
