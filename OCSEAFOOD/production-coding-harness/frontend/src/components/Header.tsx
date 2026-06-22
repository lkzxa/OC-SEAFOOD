"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  // BUG-015 fix: search state
  const [searchQuery, setSearchQuery] = useState("");
  const cartItems = useCartStore((state) => state.items);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  // BUG-010: ref for click-outside detection
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
  }, []);

  // BUG-010 fix: close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserDropdownOpen]);

  const handleLogout = () => {
    clearAuth();
    setIsUserDropdownOpen(false);
    router.push("/");
  };

  // BUG-015 fix: handle search submit
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/menu?search=${encodeURIComponent(q)}`);
      setIsMobileMenuOpen(false);
      setSearchQuery("");
    }
  };

  const isActive = (path: string) => {
    if (!pathname) return path === "/";
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      {/* Row 1: Logo, Search, Cart, Login (Đã thu hẹp py-4 -> py-2.5) */}
      <div className="bg-[#FF8B21] border-b border-orange-600/20">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-2.5 flex items-center justify-between gap-4 md:gap-8">

          {/* Left: Logo & Brand Text */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-navy-950 focus:outline-none hover:text-navy-800 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined select-none">
                {isMobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              {/* Khối bọc logo: Tăng kích thước từ h-12 w-12 lên h-14 w-14 để tạo không gian rộng hơn */}
              <div className="h-14 w-14 flex items-center justify-center overflow-visible select-none">
                <img
                  src="/logo.png"
                  alt="ỐC SEAFOOD Logo"
                  /* GIẢI PHÁP ĐỘT PHÁ:
                    - h-full w-full: Giúp ảnh chiếm trọn vẹn khung h-14 w-14.
                    - scale-[1.3]: Phóng to toàn bộ logo lên thêm 30% một cách tự nhiên.
                    - origin-center: Giữ tâm logo cố định, không làm xô lệch text hay nút menu xung quanh.
                  */
                  className="h-full w-full object-contain scale-[1.3] origin-center drop-shadow-md"
                />
              </div>
              {/* Chữ text thương hiệu: Thêm pl-2 để bù lại khoảng không do logo phóng to tràn ra */}
              <span className="text-xl font-black tracking-tight text-navy-950 whitespace-nowrap pl-2">
                ỐC SEAFOOD
              </span>
            </Link>
          </div>

          {/* Center: Search bar (Desktop only - Đã chỉnh lại padding input để tương thích độ cao mới) */}
          <div className="flex-1 max-w-xl hidden md:flex relative group">
            <form onSubmit={handleSearch} className="w-full flex relative">
              <input
                className="w-full bg-white/95 border-none rounded-full py-2 px-5 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-navy-600 transition-all outline-none shadow-inner"
                placeholder="Tìm kiếm hải sản..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-navy-600 transition-colors"
                aria-label="Tìm kiếm"
              >
                <span className="material-symbols-outlined select-none text-xl">search</span>
              </button>
            </form>
          </div>

          {/* Right Icons: Account, Cart (Căn chỉnh khoảng cách sát hơn và đồng bộ trục dọc) */}
          <div className="flex items-center gap-5">
            <Link href="/tuyen-dung" className="flex flex-col items-center text-navy-950 hover:text-navy-800 transition-colors">
              <span className="material-symbols-outlined select-none text-[22px]">business_center</span>
              <span className="text-[9px] font-bold uppercase hidden sm:block mt-0.5">Tuyển dụng</span>
            </Link>

            {mounted && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex flex-col items-center text-navy-950 hover:text-navy-800 transition-colors focus:outline-none cursor-pointer"
                  aria-expanded={isUserDropdownOpen}
                  aria-haspopup="true"
                >
                  <span className="material-symbols-outlined select-none text-[22px]">account_circle</span>
                  <span className="text-[9px] font-bold uppercase hidden sm:block mt-0.5 truncate max-w-[70px]">
                    {user.name.split(" ").pop()}
                  </span>
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-navy-800 border border-navy-700 rounded-lg shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-navy-700/50">
                      <p className="text-[10px] text-slate-400">Tài khoản</p>
                      <p className="text-xs font-bold text-slate-200 truncate">{user.name}</p>
                    </div>
                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-xs font-bold text-slate-300 hover:bg-navy-700 hover:text-orange-500 transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        DASHBOARD ADMIN
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-xs font-bold text-slate-300 hover:bg-navy-700 hover:text-orange-500 transition-colors"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      LỊCH SỬ ĐƠN HÀNG
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-xs font-bold text-red-400 hover:bg-navy-700 hover:text-red-300 transition-colors border-t border-navy-700/50 cursor-pointer"
                    >
                      ĐĂNG XUẤT
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="flex flex-col items-center text-navy-950 hover:text-navy-800 transition-colors">
                <span className="material-symbols-outlined select-none text-[22px]">person</span>
                <span className="text-[9px] font-bold uppercase hidden sm:block mt-0.5">Đăng nhập</span>
              </Link>
            )}

            {/* Badge Giỏ hàng được neo chuẩn vị trí tuyệt đối - không làm xô lệch text */}
            <Link href="/cart" className="relative flex flex-col items-center text-navy-950 hover:text-navy-800 transition-colors">
              <div className="relative">
                <span className="material-symbols-outlined select-none text-[22px]">shopping_cart</span>
                <span
                  aria-label={`Giỏ hàng có ${totalItems} sản phẩm`}
                  className="absolute -top-1 -right-1 bg-navy-950 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center scale-90"
                >
                  {totalItems}
                </span>
              </div>
              <span className="text-[9px] font-bold uppercase hidden sm:block mt-0.5">Giỏ hàng</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Row 2: Nav Links (Desktop) - Giảm nhẹ padding dọc từ py-3 -> py-2 */}
      <nav className="bg-navy-800 hidden md:block border-b border-navy-950/20">
        <div className="max-w-[1600px] mx-auto px-6 py-2 flex items-center justify-center gap-10">
          <Link className={`text-xs font-bold tracking-widest hover:text-orange-500 transition-colors ${isActive("/") ? "text-orange-500" : "text-slate-300"}`} href="/">
            TRANG CHỦ
          </Link>
          <Link className={`text-xs font-bold tracking-widest hover:text-orange-500 transition-colors ${isActive("/menu") ? "text-orange-500" : "text-slate-300"}`} href="/menu">
            MENU
          </Link>
          <Link className={`text-xs font-bold tracking-widest hover:text-orange-500 transition-colors ${isActive("/combo") ? "text-orange-500" : "text-slate-300"}`} href="/combo">
            COMBO
          </Link>
          <Link className={`text-xs font-bold tracking-widest hover:text-orange-500 transition-colors ${isActive("/blog") ? "text-orange-500" : "text-slate-300"}`} href="/blog">
            CẨM NANG VÀO BẾP
          </Link>
          <Link className={`text-xs font-bold tracking-widest hover:text-orange-500 transition-colors ${isActive("/about") ? "text-orange-500" : "text-slate-300"}`} href="/about">
            GIỚI THIỆU
          </Link>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-navy-800 border-t border-navy-700 py-4 px-6 flex flex-col gap-4">
          <form onSubmit={handleSearch} className="w-full relative">
            <input
              className="w-full bg-navy-900 border-none rounded-full py-2 px-5 text-sm text-slate-200 focus:ring-2 focus:ring-orange-500 transition-all outline-none"
              placeholder="Tìm kiếm hải sản..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <span className="material-symbols-outlined select-none">search</span>
            </button>
          </form>

          <div className="flex flex-col gap-3 font-semibold text-sm">
            <Link
              className={`hover:text-orange-500 transition-colors border-b border-navy-700 pb-2 ${isActive("/") ? "text-orange-500" : "text-slate-300"}`}
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              TRANG CHỦ
            </Link>
            <Link
              className={`hover:text-orange-500 transition-colors border-b border-navy-700 pb-2 ${isActive("/menu") ? "text-orange-500" : "text-slate-300"}`}
              href="/menu"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              MENU
            </Link>
            <Link
              className={`hover:text-orange-500 transition-colors border-b border-navy-700 pb-2 ${isActive("/combo") ? "text-orange-500" : "text-slate-300"}`}
              href="/combo"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              COMBO
            </Link>
            <Link
              className={`hover:text-orange-500 transition-colors border-b border-navy-700 pb-2 ${isActive("/blog") ? "text-orange-500" : "text-slate-300"}`}
              href="/blog"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              CẨM NANG VÀO BẾP
            </Link>
            <Link
              className={`hover:text-orange-500 transition-colors border-b border-navy-700 pb-2 ${isActive("/tuyen-dung") ? "text-orange-500" : "text-slate-300"}`}
              href="/tuyen-dung"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              TUYỂN DỤNG
            </Link>
            <Link
              className={`hover:text-orange-500 transition-colors pb-1 ${isActive("/about") ? "text-orange-500" : "text-slate-300"}`}
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              GIỚI THIỆU
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}