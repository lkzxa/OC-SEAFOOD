"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const DEFAULT_SLOGAN =
  "CÔNG TY TNHH ỐC SEAFOOD  •  ỐC SEAFOOD TƯƠI NGON ĐẲNG CẤP  •  TẬN TÂM PHỤC VỤ KHÁCH HÀNG  •  HỖ TRỢ 24/7  •  ";

export default function MarqueeBanner() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);
  const [content, setContent] = useState(DEFAULT_SLOGAN);

  useEffect(() => {
    let isMounted = true;
    const loadSettings = () => {
      fetch("/api/settings/public", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => {
          if (!isMounted) return;
          setEnabled(data.MARQUEE_ENABLED !== false);
          const configured = (data.MARQUEE_CONTENT || "").trim();
          setContent(configured ? `${configured}  •  ` : DEFAULT_SLOGAN);
        })
        .catch(() => {
          // Giữ nguyên giá trị mặc định nếu API lỗi
        });
    };

    loadSettings();
    window.addEventListener("ocseafood-settings-updated", loadSettings);

    return () => {
      isMounted = false;
      window.removeEventListener("ocseafood-settings-updated", loadSettings);
    };
  }, []);

  const shouldHideOnCheckout = pathname === "/cart";

  if (!enabled || shouldHideOnCheckout) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 h-9 md:h-10 bg-orange-500 border-t border-orange-600 overflow-hidden flex items-center shadow-[0_-4px_12px_rgba(0,0,0,0.15)]"
      role="marquee"
      aria-label="Khẩu hiệu thương hiệu ỐC SEAFOOD"
    >
      <div className="animate-marquee-ltr">
        <span className="shrink-0 whitespace-nowrap text-white font-extrabold text-[11px] md:text-sm uppercase tracking-widest px-4">
          {content}
        </span>
        <span
          className="shrink-0 whitespace-nowrap text-white font-extrabold text-[11px] md:text-sm uppercase tracking-widest px-4"
          aria-hidden="true"
        >
          {content}
        </span>
      </div>
    </div>
  );
}
