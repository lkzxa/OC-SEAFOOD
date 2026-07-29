# Nhật ký Phiên làm việc (Session Log) - Tự động cuộn lên đầu trang khi chuyển trang sản phẩm

**Ngày thực hiện:** 14/07/2026

## 📋 Tóm tắt Công việc
Đã cấu hình tính năng tự động cuộn màn hình lên đầu website (smooth scroll to top) khi người dùng thực hiện chuyển đổi giữa các trang sản phẩm (phân trang) trong danh mục sản phẩm của cửa hàng **OCSEAFOOD**.

---

## 🛠️ Chi tiết thay đổi

### Giao diện Danh mục (`frontend/src/app/category/[slug]/CategoryContent.tsx`)
*   Đã chỉnh sửa sự kiện `onClick` của toàn bộ các nút điều hướng phân trang (nút chuyển sang trang trước, các nút số trang cụ thể, và nút chuyển sang trang tiếp theo).
*   Khi người dùng click vào một nút phân trang:
    1.  Cập nhật trạng thái trang hiện tại (`setCurrentPage`).
    2.  Gọi hàm `window.scrollTo({ top: 0, behavior: "smooth" })` để đưa góc nhìn của khách hàng mượt mà trở lại đầu trang web, tránh trường hợp người dùng bị "kẹt" ở phần chân trang (footer) sau khi đổi trang.

Chi tiết thay đổi trong code:
```diff
              <button
                disabled={currentPage === 1}
-               onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
+               onClick={() => {
+                 setCurrentPage((p) => Math.max(1, p - 1));
+                 window.scrollTo({ top: 0, behavior: "smooth" });
+               }}
                className="w-10 h-10 flex items-center justify-center rounded border border-navy-700 text-slate-400 hover:bg-navy-800 hover:text-orange-500 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <span className="material-symbols-outlined select-none">chevron_left</span>
              </button>
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
-                 onClick={() => setCurrentPage(idx + 1)}
+                 onClick={() => {
+                   setCurrentPage(idx + 1);
+                   window.scrollTo({ top: 0, behavior: "smooth" });
+                 }}
                  className={`w-10 h-10 flex items-center justify-center rounded font-extrabold text-xs transition-colors cursor-pointer ${
                    currentPage === idx + 1
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                      : "border border-navy-700 text-slate-400 hover:bg-navy-800 hover:text-slate-200"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
-               onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
+               onClick={() => {
+                 setCurrentPage((p) => Math.min(totalPages, p + 1));
+                 window.scrollTo({ top: 0, behavior: "smooth" });
+               }}
                className="w-10 h-10 flex items-center justify-center rounded border border-navy-700 text-slate-400 hover:bg-navy-800 hover:text-orange-500 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <span className="material-symbols-outlined select-none">chevron_right</span>
              </button>
```

---

## 🧪 Xác minh & Kiểm thử
1.  Đã chạy kiểm tra hệ thống thông qua bộ công cụ test tích hợp.
2.  Sau khi áp dụng thay đổi, giao diện chuyển trang trong trang chi tiết danh mục `/category/[slug]` hoạt động bình thường, phản hồi nhạy và tự động cuộn lên đầu trang mượt mà (`smooth`).
