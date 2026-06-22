"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useOrderHistoryStore } from "@/store/useOrderHistoryStore";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const getStatusLabel = (status: "PENDING" | "CONFIRMED" | "CANCELLED") => {
  if (status === "CONFIRMED") return "Đã xác nhận";
  if (status === "CANCELLED") return "Đã hủy";
  return "Chờ tư vấn";
};

const getStatusClass = (status: "PENDING" | "CONFIRMED" | "CANCELLED") => {
  if (status === "CONFIRMED") return "bg-green-500/10 text-green-400 border-green-500/20";
  if (status === "CANCELLED") return "bg-red-500/10 text-red-400 border-red-500/20";
  return "bg-orange-500/10 text-orange-400 border-orange-500/20";
};

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const orders = useOrderHistoryStore((state) => state.orders);

  const visibleOrders = useMemo(() => {
    if (!user) return [];

    return orders
      .filter((order) => order.userId === user.id || order.email.toLowerCase() === user.email.toLowerCase())
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (user === null) {
      router.push("/login?redirect=/profile");
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest">
        Đang kiểm tra xác thực...
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 md:px-6 py-12">
      {/* Page Header */}
      <div className="mb-10 border-l-4 border-orange-500 pl-4">
        <h1 className="text-3xl font-black tracking-tight text-slate-100 uppercase">
          Tài khoản của tôi
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Xin chào, <span className="text-orange-400 font-bold">{user.name}</span>
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-navy-950 border border-navy-700/50 rounded-2xl p-6 shadow-xl mb-8">
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-400 mb-4 border-b border-navy-800 pb-3">
          Thông tin tài khoản
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-navy-800/50">
            <span className="text-slate-400 font-medium">Họ và tên</span>
            <span className="text-slate-200 font-bold">{user.name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-navy-800/50">
            <span className="text-slate-400 font-medium">Email</span>
            <span className="text-slate-200 font-bold">{user.email}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-slate-400 font-medium">Loại tài khoản</span>
            <span className={`font-extrabold uppercase text-xs px-3 py-1 rounded-full ${
              user.role === "ADMIN"
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                : "bg-navy-800 text-slate-300 border border-navy-700"
            }`}>
              {user.role === "ADMIN" ? "Quản trị viên" : "Khách hàng"}
            </span>
          </div>
        </div>
      </div>

      {/* Order History Notice */}
      <div className="bg-navy-950 border border-navy-700/50 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-200">Lịch sử đơn hàng</h2>
            <p className="text-slate-400 text-xs mt-1">
              Các đơn đã gửi từ tài khoản này sẽ hiển thị tại đây.
            </p>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-navy-800 text-slate-300 border border-navy-700">
            {visibleOrders.length} đơn
          </span>
        </div>

        {visibleOrders.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-navy-700 rounded-xl">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-navy-800 text-slate-400 mb-4">
              <span className="material-symbols-outlined text-3xl select-none">receipt_long</span>
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-2">Chưa có đơn hàng nào</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto mb-6">
              Sau khi bạn đặt hàng qua giỏ hàng, lịch sử đơn sẽ được lưu tại đây để bạn dễ tra cứu lại thông tin.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/menu"
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl transition-all text-sm"
              >
                <span className="material-symbols-outlined text-sm select-none">storefront</span>
                Tiếp tục mua sắm
              </Link>
              <a
                href="tel:19001234"
                className="inline-flex items-center justify-center gap-2 bg-navy-800 hover:bg-navy-700 border border-navy-700 text-slate-200 font-bold px-6 py-2.5 rounded-xl transition-all text-sm"
              >
                <span className="material-symbols-outlined text-sm select-none">call</span>
                Liên hệ hỗ trợ
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleOrders.map((order) => (
              <article key={order.id} className="bg-navy-900 border border-navy-800 rounded-xl p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-base font-black text-slate-100">{order.code}</h3>
                      <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border ${getStatusClass(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">{formatDateTime(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Tổng tiền ước tính</p>
                    <p className="text-lg font-black text-orange-500">{formatCurrency(order.totalFinal)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                  <div className="space-y-2 text-slate-300">
                    <p><span className="text-slate-500">Khách hàng:</span> {order.fullName}</p>
                    <p><span className="text-slate-500">Email:</span> {order.email}</p>
                    <p><span className="text-slate-500">Số điện thoại:</span> {order.phone}</p>
                  </div>
                  <div className="space-y-2 text-slate-300 md:text-right">
                    <p><span className="text-slate-500">Địa chỉ:</span> {order.streetAddress}</p>
                    <p>{order.ward}, {order.district}, {order.province}</p>
                    <p><span className="text-slate-500">Ghi chú:</span> {order.note || "Không có"}</p>
                  </div>
                </div>

                <div className="border-t border-navy-800 pt-4">
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">
                    Sản phẩm ({order.totalItems})
                  </p>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between gap-3 text-sm">
                        <div className="min-w-0">
                          <p className="text-slate-200 font-semibold truncate">{item.name}</p>
                          <p className="text-xs text-slate-500">
                            {item.quantity} x {item.unit}
                          </p>
                        </div>
                        <p className="text-slate-300 font-bold">{formatCurrency(item.priceReference * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
