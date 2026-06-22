"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface PublicSettings {
  CONTACT_HOTLINE?: string;
  CONTACT_ZALO?: string;
  CONTACT_FACEBOOK?: string;
}

export default function FloatingContact() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<PublicSettings | null>(null);

  // Hide on admin panel pages
  const isAdminPage = pathname?.startsWith("/admin");

  useEffect(() => {
    if (isAdminPage) return;

    fetch("/api/settings/public")
      .then((res) => {
        if (!res.ok) {
          console.warn("Could not fetch public contact settings, using empty defaults.");
          return {
            CONTACT_HOTLINE: "",
            CONTACT_ZALO: "",
            CONTACT_FACEBOOK: ""
          };
        }
        return res.json();
      })
      .then((data) => {
        setSettings(data);
      })
      .catch((err) => {
        console.warn("Error loading contact settings gracefully:", err.message || err);
      });
  }, [isAdminPage]);

  if (isAdminPage || !settings) return null;

  const { CONTACT_HOTLINE, CONTACT_ZALO, CONTACT_FACEBOOK } = settings;

  // If all are empty, don't show the float
  if (!CONTACT_HOTLINE && !CONTACT_ZALO && !CONTACT_FACEBOOK) return null;

  // Normalize Zalo URL: if it's just a phone number, convert to zalo.me link
  const getZaloHref = (val?: string) => {
    if (!val) return "";
    const trimmed = val.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    // Remove spaces, dots, dashes
    const cleanNum = trimmed.replace(/[\s\.\-\+]/g, "");
    return `https://zalo.me/${cleanNum}`;
  };

  // Normalize Facebook URL: if it's just a username, convert to facebook.com link
  const getFacebookHref = (val?: string) => {
    if (!val) return "";
    const trimmed = val.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    return `https://facebook.com/${trimmed}`;
  };

  return (
    <div className="fixed right-6 bottom-24 z-50 flex flex-col gap-4 select-none">
      
      {/* Facebook Messenger button */}
      {CONTACT_FACEBOOK && (
        <a
          href={getFacebookHref(CONTACT_FACEBOOK)}
          target="_blank"
          rel="noopener noreferrer"
          title="Facebook Fanpage"
          className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg shadow-blue-500/10 transition-all duration-300 hover:scale-110 hover:-translate-x-1 active:scale-95 cursor-pointer"
        >
          {/* Tooltip */}
          <span className="absolute right-14 scale-0 group-hover:scale-100 transition-all duration-200 origin-right bg-navy-950 border border-navy-700/60 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
            Facebook Fanpage
          </span>
          <svg viewBox="0 0 40 40" className="w-10 h-10 transition-transform duration-300 group-hover:rotate-12">
            <circle cx="20" cy="20" r="20" fill="#1877F2" />
            <path
              d="M20 7C12.82 7 7 12.28 7 18.8C7 22.25 8.78 25.32 11.66 27.35V32.25C11.66 32.75 12.23 33.05 12.65 32.78L17.7 29.58C18.45 29.72 19.22 29.8 20 29.8C27.18 29.8 33 24.52 33 18C33 11.48 27.18 7 20 7ZM27.15 15.12L22.95 21.82C22.45 22.62 21.35 22.78 20.65 22.15L17.25 19.12L13.15 22.62C12.65 23.05 11.95 22.45 12.25 21.82L16.45 15.12C16.95 14.32 18.05 14.15 18.75 14.78L22.15 17.82L26.25 14.32C26.75 13.88 27.45 14.48 27.15 15.12Z"
              fill="white"
            />
          </svg>
        </a>
      )}

      {/* Zalo button */}
      {CONTACT_ZALO && (
        <a
          href={getZaloHref(CONTACT_ZALO)}
          target="_blank"
          rel="noopener noreferrer"
          title="Chat Zalo"
          className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg shadow-blue-400/10 transition-all duration-300 hover:scale-110 hover:-translate-x-1 active:scale-95 cursor-pointer"
        >
          {/* Tooltip */}
          <span className="absolute right-14 scale-0 group-hover:scale-100 transition-all duration-200 origin-right bg-navy-950 border border-navy-700/60 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
            Chat Zalo
          </span>
          <svg viewBox="0 0 40 40" className="w-10 h-10 transition-transform duration-300 group-hover:rotate-12">
            <circle cx="20" cy="20" r="20" fill="#0068FF" />
            <path
              d="M20 8C13.37 8 8 12.48 8 18C8 20.9 9.93 23.46 12.92 25.12L11.5 30.5C11.37 31 11.9 31.35 12.35 31.05L18.42 27C18.94 27.05 19.47 27.08 20 27.08C26.63 27.08 32 22.6 32 17.08C32 11.56 26.63 7.08 20 7.08Z"
              fill="#0068FF"
            />
            <text
              x="20"
              y="20"
              fill="white"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              Zalo
            </text>
          </svg>
        </a>
      )}

      {/* Hotline phone button */}
      {CONTACT_HOTLINE && (
        <a
          href={`tel:${CONTACT_HOTLINE.trim()}`}
          title={`Hotline: ${CONTACT_HOTLINE}`}
          className="group relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 hover:scale-110 hover:-translate-x-1 active:scale-95 cursor-pointer"
        >
          {/* Pulse effect rings */}
          <span className="absolute inset-0 rounded-full bg-emerald-500/40 animate-ping duration-1000"></span>
          <span className="absolute -inset-1 rounded-full bg-emerald-500/20"></span>
          
          {/* Tooltip */}
          <span className="absolute right-14 scale-0 group-hover:scale-100 transition-all duration-200 origin-right bg-navy-950 border border-navy-700/60 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
            Hotline: {CONTACT_HOTLINE}
          </span>
          
          {/* Main button circle */}
          <div className="relative w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 flex items-center justify-center text-white transition-colors">
            <span className="material-symbols-outlined text-xl select-none animate-shake">
              phone_in_talk
            </span>
          </div>
        </a>
      )}

    </div>
  );
}
