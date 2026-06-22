"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import AdminRouteGuard from "./AdminRouteGuard";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/admin", label: "Bảng điều khiển", icon: "dashboard" },
  { href: "/admin/products", label: "Quản lý sản phẩm", icon: "inventory_2" },
  { href: "/admin/categories", label: "Quản lý danh mục", icon: "category" },
  { href: "/admin/orders", label: "Quản lý đơn hàng", icon: "receipt_long" },
  { href: "/admin/posts", label: "Quản lý bài viết", icon: "article" },
  { href: "/admin/settings", label: "Cấu hình hệ thống", icon: "settings" },
  { href: "/admin/users", label: "Quản lý tài khoản", icon: "people" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi trang quản trị?")) {
      clearAuth();
      router.push("/login");
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-navy-950 border-r border-navy-800 text-slate-200">
      {/* Header / Logo */}
      <div className="p-6 border-b border-navy-900 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tighter text-orange-500">
            OCSEAFOOD
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
            Admin
          </span>
        </Link>
      </div>

      {/* User profile */}
      {user && (
        <div className="p-4 mx-4 my-4 rounded-xl bg-navy-900 border border-navy-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400 font-black text-lg select-none">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-100 truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
          </div>
        </div>
      )}

      {/* Navigation menu */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-navy-900/60"
              }`}
            >
              <span className="material-symbols-outlined text-lg select-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="p-4 border-t border-navy-900 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-slate-200 hover:bg-navy-900/60 transition-all"
        >
          <span className="material-symbols-outlined text-lg select-none">home</span>
          <span>Xem cửa hàng</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-left cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg select-none">logout</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );

  return (
    <AdminRouteGuard>
      <div className="min-h-screen flex flex-col lg:flex-row bg-navy-900 text-slate-100">
        {/* Mobile Header */}
        <header className="lg:hidden bg-navy-950 border-b border-navy-800 px-4 py-4 flex items-center justify-between sticky top-0 z-40">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tighter text-orange-500">
              OCSEAFOOD
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
              Admin
            </span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-xl bg-navy-900 border border-navy-800 text-slate-300 flex items-center justify-center cursor-pointer hover:bg-navy-850"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined select-none">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </header>

        {/* Mobile Slide-out Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-35 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Sidebar drawer */}
            <div className="relative w-[280px] h-full z-45 animate-in slide-in-from-left duration-250">
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Desktop Sidebar (Permanent) */}
        <aside className="hidden lg:block w-[280px] shrink-0 h-screen sticky top-0 overflow-y-auto">
          <SidebarContent />
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 min-w-0 p-4 md:p-8 lg:p-10 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </AdminRouteGuard>
  );
}
