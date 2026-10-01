"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useHasMounted } from "@/hooks/useHasMounted";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  // BUG-015 fix: search state
  const [searchQuery, setSearchQuery] = useState("");
  const cartItems = useCartStore((state) => state.items);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuthStore();
  const mounted = useHasMounted();
  // BUG-010: ref for click-outside detection
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const [isAnimating, setIsAnimating] = useState(false);
  const prevTotalItems = useRef(totalItems);

  useEffect(() => {
    if (totalItems > prevTotalItems.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      prevTotalItems.current = totalItems;
      return () => clearTimeout(timer);
    }
    prevTotalItems.current = totalItems;
  }, [totalItems]);

  const scrollToPageTop = () => {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  };

  const handleNavigationClick = (options?: { closeMobileMenu?: boolean; closeUserDropdown?: boolean }) => {
    if (options?.closeMobileMenu) setIsMobileMenuOpen(false);
    if (options?.closeUserDropdown) setIsUserDropdownOpen(false);
    scrollToPageTop();
  };

  const handleLogout = async () => {
    await logout();
    setIsUserDropdownOpen(false);
    router.push("/");
    scrollToPageTop();
  };

  // BUG-015 fix: handle search submit
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/menu?search=${encodeURIComponent(q)}`);
      setIsMobileMenuOpen(false);
      scrollToPageTop();
    } else {
      router.push(`/menu`);
      setIsMobileMenuOpen(false);
      scrollToPageTop();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    if (pathname === '/menu') {
      router.push('/menu');
      scrollToPageTop();
    }
  };

  // Sync search input with URL if it changes externally
  useEffect(() => {
    const nextQuery = pathname === "/menu" ? searchParams.get("search") || "" : "";
    void Promise.resolve().then(() => setSearchQuery(nextQuery));
  }, [pathname, searchParams]);

  const isActive = (path: string) => {
    if (!pathname) return path === "/";
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      {/* Row 1: Logo, Search, Cart, Login (Đã thu hẹp py-4 -> py-2.5) */}
      <div className="bg-[#FF8B21] border-b border-orange-600/20">
        <div className="max-w-[1600px] mx-auto px-3 md:px-6 py-2.5 flex items-center justify-between gap-2 md:gap-8">

          {/* Left: Logo & Brand Text */}
          <div className="flex min-w-0 items-center gap-2 md:gap-3">
            <button
              className="md:hidden flex h-11 w-11 shrink-0 items-center justify-center text-navy-950 focus:outline-none hover:text-navy-800 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              <span className="material-symbols-outlined select-none">
                {isMobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity" onClick={() => handleNavigationClick()}>
              {/* Khối bọc logo: Tăng kích thước từ h-12 w-12 lên h-14 w-14 để tạo không gian rộng hơn */}
              <div className="relative h-14 w-14 md:h-16 md:w-16 flex items-center justify-center overflow-visible select-none">
                <Image
                  src="/logo.png"
                  alt="ỐC SEAFOOD Logo"
                  /* GIẢI PHÁP ĐỘT PHÁ:
                    - h-full w-full: Giúp ảnh chiếm trọn vẹn khung h-14 w-14.
                    - scale-[1.3]: Phóng to toàn bộ logo lên thêm 30% một cách tự nhiên.
                    - origin-center: Giữ tâm logo cố định, không làm xô lệch text hay nút menu xung quanh.
                  */
                  className="object-contain scale-[1.45] md:scale-[1.6] origin-center drop-shadow-md"
                  fill
                  sizes="64px"
                />
              </div>
              {/* Chữ text thương hiệu: Thêm pl-2 để bù lại khoảng không do logo phóng to tràn ra */}
              <span className="hidden min-[430px]:inline text-xl font-black tracking-tight text-navy-950 whitespace-nowrap pl-1 md:pl-2">
                ỐC SEAFOOD
              </span>
            </Link>
          </div>

          {/* Center: Search bar (Desktop only - Đã chỉnh lại padding input để tương thích độ cao mới) */}
          <div className="flex-1 max-w-xl hidden md:flex relative group">
            <form onSubmit={handleSearch} className="w-full flex relative">
              <input
                className="w-full bg-white/95 border-none rounded-full py-2 px-5 pr-20 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-navy-600 transition-all outline-none shadow-inner"
                placeholder="Tìm kiếm hải sản..."
                type="text"
                aria-label="Tìm kiếm hải sản"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-10 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                  aria-label="Xóa tìm kiếm"
                >
                  <span className="material-symbols-outlined select-none text-[18px]">close</span>
                </button>
              )}
              <button
                type="submit"
                className="absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-slate-400 group-hover:text-navy-600 transition-colors"
                aria-label="Tìm kiếm"
              >
                <span className="material-symbols-outlined select-none text-xl">search</span>
              </button>
            </form>
          </div>

          {/* Right Icons: Account, Cart (Căn chỉnh khoảng cách sát hơn và đồng bộ trục dọc) */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-5">
            <Link href="/tuyen-dung" aria-label="Tuyển dụng" className="hidden min-h-11 min-w-11 sm:flex flex-col items-center justify-center text-navy-950 hover:text-navy-800 transition-colors" onClick={() => handleNavigationClick()}>
              <span className="material-symbols-outlined select-none text-[22px]">business_center</span>
              <span className="text-[9px] font-bold uppercase hidden sm:block mt-0.5">Tuyển dụng</span>
            </Link>

            {mounted && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex min-h-11 min-w-11 flex-col items-center justify-center text-navy-950 hover:text-navy-800 transition-colors focus:outline-none cursor-pointer"
                  aria-expanded={isUserDropdownOpen}
                  aria-haspopup="true"
                  aria-label={`Mở menu tài khoản ${user.name}`}
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
                        onClick={() => handleNavigationClick({ closeUserDropdown: true })}
                      >
                        DASHBOARD ADMIN
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-xs font-bold text-slate-300 hover:bg-navy-700 hover:text-orange-500 transition-colors"
                      onClick={() => handleNavigationClick({ closeUserDropdown: true })}
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
              <Link href="/login" aria-label="Đăng nhập" className="flex min-h-11 min-w-11 flex-col items-center justify-center text-navy-950 hover:text-navy-800 transition-colors" onClick={() => handleNavigationClick()}>
                <span className="material-symbols-outlined select-none text-[22px]">person</span>
                <span className="text-[9px] font-bold uppercase hidden sm:block mt-0.5">Đăng nhập</span>
              </Link>
            )}

            {/* Badge Giỏ hàng được neo chuẩn vị trí tuyệt đối - không làm xô lệch text */}
            <Link href="/cart" aria-label={`Giỏ hàng có ${totalItems} sản phẩm`} className="relative flex min-h-11 min-w-11 flex-col items-center justify-center text-navy-950 hover:text-navy-800 transition-colors" onClick={() => handleNavigationClick()}>
              <div className={`relative ${isAnimating ? 'animate-cart-bounce' : ''}`}>
                <span className="material-symbols-outlined select-none text-[22px]">shopping_cart</span>
                <span
                  aria-hidden="true"
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
          <Link className={`text-xs font-bold tracking-widest hover:text-orange-500 transition-colors ${isActive("/") ? "text-orange-500" : "text-slate-300"}`} href="/" onClick={() => handleNavigationClick()}>
            TRANG CHỦ
          </Link>
          <Link className={`text-xs font-bold tracking-widest hover:text-orange-500 transition-colors ${isActive("/menu") ? "text-orange-500" : "text-slate-300"}`} href="/menu" onClick={() => handleNavigationClick()}>
            MENU
          </Link>
          <Link className={`text-xs font-bold tracking-widest hover:text-orange-500 transition-colors ${isActive("/combo") ? "text-orange-500" : "text-slate-300"}`} href="/combo" onClick={() => handleNavigationClick()}>
            COMBO
          </Link>
          <Link className={`text-xs font-bold tracking-widest hover:text-orange-500 transition-colors ${isActive("/blog") ? "text-orange-500" : "text-slate-300"}`} href="/blog" onClick={() => handleNavigationClick()}>
            CẨM NANG VÀO BẾP
          </Link>
          <Link className={`text-xs font-bold tracking-widest hover:text-orange-500 transition-colors ${isActive("/about") ? "text-orange-500" : "text-slate-300"}`} href="/about" onClick={() => handleNavigationClick()}>
            GIỚI THIỆU
          </Link>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div id="mobile-navigation" className="md:hidden bg-navy-800 border-t border-navy-700 py-4 px-6 flex flex-col gap-4">
          <form onSubmit={handleSearch} className="w-full relative">
            <input
              className="w-full bg-navy-900 border-none rounded-full py-3 px-5 pr-20 text-sm text-slate-200 focus:ring-2 focus:ring-orange-500 transition-all outline-none"
              placeholder="Tìm kiếm hải sản..."
              type="text"
              aria-label="Tìm kiếm hải sản"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={handleClearSearch}
                className="absolute right-10 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-slate-400 hover:text-red-400"
                aria-label="Xóa tìm kiếm"
              >
                <span className="material-symbols-outlined select-none text-[18px]">close</span>
              </button>
            )}
            <button type="submit" aria-label="Tìm kiếm" className="absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-slate-400">
              <span className="material-symbols-outlined select-none">search</span>
            </button>
          </form>

          <div className="flex flex-col gap-3 font-semibold text-sm">
            <Link
              className={`hover:text-orange-500 transition-colors border-b border-navy-700 pb-2 ${isActive("/") ? "text-orange-500" : "text-slate-300"}`}
              href="/"
              onClick={() => handleNavigationClick({ closeMobileMenu: true })}
            >
              TRANG CHỦ
            </Link>
            <Link
              className={`hover:text-orange-500 transition-colors border-b border-navy-700 pb-2 ${isActive("/menu") ? "text-orange-500" : "text-slate-300"}`}
              href="/menu"
              onClick={() => handleNavigationClick({ closeMobileMenu: true })}
            >
              MENU
            </Link>
            <Link
              className={`hover:text-orange-500 transition-colors border-b border-navy-700 pb-2 ${isActive("/combo") ? "text-orange-500" : "text-slate-300"}`}
              href="/combo"
              onClick={() => handleNavigationClick({ closeMobileMenu: true })}
            >
              COMBO
            </Link>
            <Link
              className={`hover:text-orange-500 transition-colors border-b border-navy-700 pb-2 ${isActive("/blog") ? "text-orange-500" : "text-slate-300"}`}
              href="/blog"
              onClick={() => handleNavigationClick({ closeMobileMenu: true })}
            >
              CẨM NANG VÀO BẾP
            </Link>
            <Link
              className={`hover:text-orange-500 transition-colors border-b border-navy-700 pb-2 ${isActive("/tuyen-dung") ? "text-orange-500" : "text-slate-300"}`}
              href="/tuyen-dung"
              onClick={() => handleNavigationClick({ closeMobileMenu: true })}
            >
              TUYỂN DỤNG
            </Link>
            <Link
              className={`hover:text-orange-500 transition-colors pb-1 ${isActive("/about") ? "text-orange-500" : "text-slate-300"}`}
              href="/about"
              onClick={() => handleNavigationClick({ closeMobileMenu: true })}
            >
              GIỚI THIỆU
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
