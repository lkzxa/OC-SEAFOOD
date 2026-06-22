"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AnnouncementModalProps {
  enabled: boolean;
  content: string;
}

export default function AnnouncementModal({ enabled, content }: AnnouncementModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const hasSeen = sessionStorage.getItem("hasSeenAnnouncement");
    if (enabled && content && !hasSeen) {
      // Small timeout to let the page load nicely
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [enabled, content]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("hasSeenAnnouncement", "true");
  };

  const handleCTAClick = () => {
    setIsOpen(false);
    sessionStorage.setItem("hasSeenAnnouncement", "true");
    router.push("/login?tab=register");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop with premium blur */}
      <div 
        onClick={handleClose}
        className="absolute inset-0 bg-navy-950/80 backdrop-blur-md animate-in fade-in duration-300"
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-[500px] bg-gradient-to-br from-navy-900 via-navy-950 to-navy-900 border border-orange-500/20 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(249,115,22,0.15)] flex flex-col items-center justify-center animate-in zoom-in-95 fade-in duration-300">
        
        {/* Decorative Light Glows */}
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-orange-500/10 rounded-full blur-[40px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none"></div>

        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors w-8 h-8 rounded-full hover:bg-navy-800/80 flex items-center justify-center cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg select-none">close</span>
        </button>

        {/* Glowing Announcement Icon */}
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
          <span className="material-symbols-outlined text-3xl select-none">local_activity</span>
        </div>

        {/* Header Title */}
        <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-orange-400 mb-2">
          Khuyến mại đặc biệt
        </p>
        <h3 className="text-xl md:text-2xl font-black uppercase text-slate-100 tracking-tight text-center mb-4 leading-tight">
          Ưu Đãi <span className="text-orange-500">Đăng Ký Thành Viên</span>
        </h3>

        {/* Announcement Message Box */}
        <div className="w-full bg-navy-950/60 border border-navy-800 rounded-2xl p-4 md:p-6 mb-6">
          <p className="text-slate-200 font-bold text-center text-sm md:text-base leading-relaxed tracking-wide uppercase">
            {content}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button 
            onClick={handleCTAClick}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold uppercase tracking-widest text-xs transition-all shadow-lg shadow-orange-500/25 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            Đăng ký nhận voucher ngay!
            <span className="material-symbols-outlined text-sm select-none">arrow_forward</span>
          </button>
          
          <button 
            onClick={handleClose}
            className="w-full py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-300 transition-colors border border-navy-800 cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
}
