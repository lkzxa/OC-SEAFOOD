"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { getAuthHeaders } from "@/components/admin/adminApi";
import { useAuthStore } from "@/store/useAuthStore";

type DashboardStats = {
  categories: number | null;
  products: number | null;
  pendingOrders: number | null;
  posts: number | null;
};

const initialDashboardStats: DashboardStats = {
  categories: null,
  products: null,
  pendingOrders: null,
  posts: null,
};

function formatStatValue(value: number | null, loading: boolean) {
  if (loading || value === null) return "—";
  return new Intl.NumberFormat("vi-VN").format(value);
}

function getPaginationTotal(payload: unknown) {
  if (!payload || typeof payload !== "object") return 0;
  const pagination = (payload as { pagination?: { total?: unknown } }).pagination;
  return typeof pagination?.total === "number" ? pagination.total : 0;
}

export default function AdminDashboardPage() {
  const { user, token } = useAuthStore();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(initialDashboardStats);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  const currentHour = useMemo(() => new Date().getHours(), []);
  const greeting = useMemo(() => {
    if (currentHour < 12) return "Chào buổi sáng";
    if (currentHour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  }, [currentHour]);
  const stats = useMemo(
    () => [
      {
        label: "Danh mục",
        value: formatStatValue(dashboardStats.categories, statsLoading),
        hint: "Khu vực phân loại sản phẩm",
        icon: "category",
      },
      {
        label: "Sản phẩm",
        value: formatStatValue(dashboardStats.products, statsLoading),
        hint: "Món hải sản đang bày bán",
        icon: "inventory_2",
      },
      {
        label: "Đơn chờ xử lý",
        value: formatStatValue(dashboardStats.pendingOrders, statsLoading),
        hint: "Xử lý đơn hàng, điều chỉnh giá",
        icon: "receipt_long",
      },
      {
        label: "Bài viết",
        value: formatStatValue(dashboardStats.posts, statsLoading),
        hint: "Nội dung cẩm nang vào bếp",
        icon: "article",
      },
    ],
    [dashboardStats, statsLoading]
  );

  useEffect(() => {
    if (user?.role !== "ADMIN") return;

    const controller = new AbortController();
    const loadDashboardStats = async () => {
      setStatsLoading(true);
      setStatsError("");

      try {
        const [categoriesRes, productsRes, pendingOrdersRes, postsRes] = await Promise.all([
          fetch("/api/categories?page=1&pageSize=1", { signal: controller.signal }),
          fetch("/api/products?page=1&pageSize=1", { signal: controller.signal }),
          fetch("/api/orders?page=1&pageSize=1&status=PENDING", {
            headers: getAuthHeaders(token),
            signal: controller.signal,
          }),
          fetch("/api/posts", { signal: controller.signal }),
        ]);

        if (!categoriesRes.ok || !productsRes.ok || !pendingOrdersRes.ok || !postsRes.ok) {
          throw new Error("Không thể tải số liệu dashboard");
        }

        const [categoriesPayload, productsPayload, pendingOrdersPayload, postsPayload] = await Promise.all([
          categoriesRes.json(),
          productsRes.json(),
          pendingOrdersRes.json(),
          postsRes.json(),
        ]);

        setDashboardStats({
          categories: getPaginationTotal(categoriesPayload),
          products: getPaginationTotal(productsPayload),
          pendingOrders: getPaginationTotal(pendingOrdersPayload),
          posts: Array.isArray(postsPayload) ? postsPayload.length : 0,
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setDashboardStats(initialDashboardStats);
        setStatsError(err instanceof Error ? err.message : "Không thể tải số liệu dashboard");
      } finally {
        if (!controller.signal.aborted) setStatsLoading(false);
      }
    };

    loadDashboardStats();
    return () => controller.abort();
  }, [token, user?.role]);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <section className="bg-gradient-to-r from-navy-950 to-navy-900 border border-navy-800 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20 select-none pointer-events-none" />
          <div className="relative z-10 space-y-3 max-w-3xl">
            <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest">
              Hệ thống quản trị
            </span>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-slate-100">
              {greeting}, <span className="text-orange-500">{user?.name || "Admin"}</span>!
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Chào mừng bạn quay trở lại trang quản trị OCSEAFOOD. Tại đây bạn có thể kiểm soát thực đơn, điều chỉnh giá đơn hàng của khách hàng sau khi tư vấn, chỉnh sửa các danh mục sản phẩm, và cập nhật cẩm nang vào bếp.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        {statsError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
            {statsError}
          </div>
        )}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-navy-950 border border-navy-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-orange-500/30 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">{stat.label}</p>
                  <p className="text-3xl font-black text-orange-500">{stat.value}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-orange-500/5 text-orange-400/80 flex items-center justify-center border border-orange-500/10 group-hover:bg-orange-500/10 group-hover:text-orange-400 transition-colors">
                  <span className="material-symbols-outlined text-xl select-none">{stat.icon}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-4 leading-relaxed">{stat.hint}</p>
            </div>
          ))}
        </section>

        {/* Informative Guidance & Quick Actions */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-navy-950 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-6">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-400 select-none">timeline</span>
              Hướng dẫn vận hành hệ thống
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <span className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-black shrink-0">
                  1
                </span>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-200">Kiểm tra & Cập nhật Thực đơn</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Sử dụng mục **Quản lý sản phẩm** và **Danh mục** để cập nhật các món hải sản loại 1 mới nhập khẩu hoặc ẩn các mặt hàng đang tạm hết hàng.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <span className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-black shrink-0">
                  2
                </span>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-200">Xử lý Lead / Đơn đặt hàng</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Khi khách đặt món tươi sống (giá liên hệ), hệ thống sẽ gửi thông báo đến Telegram/Zalo. Admin vào mục **Quản lý đơn hàng** để tư vấn trực tiếp và cập nhật đơn giá chuẩn cuối cùng cho khách.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <span className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-black shrink-0">
                  3
                </span>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-200">Ghi nhận Lịch sử & Kiểm tra Audit Log</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Mỗi lần sửa đổi đơn giá hoặc trạng thái của khách hàng, hệ thống sẽ tự động ghi nhật ký thay đổi. Điều này giúp đội ngũ quản trị truy vết lịch sử điều chỉnh giá dễ dàng.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-navy-950 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-400 select-none">security</span>
                Trạng thái bảo mật
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hệ thống đang chạy trong chế độ phân quyền đa lớp (Multi-role). Mọi hành động nhạy cảm như xóa tài khoản, sửa đơn giá đều được lưu vết chi tiết.
              </p>
              <div className="rounded-xl bg-navy-900 border border-navy-850 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Phiên đăng nhập:</span>
                  <span className="text-green-400 font-bold">Hoạt động</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Vai trò của bạn:</span>
                  <span className="text-orange-400 font-bold uppercase tracking-wider">{user?.role}</span>
                </div>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 leading-relaxed pt-4 border-t border-navy-900">
              Sử dụng thanh Sidebar bên trái để truy cập nhanh chóng và chuyển đổi tức thì giữa các phân hệ quản lý.
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
