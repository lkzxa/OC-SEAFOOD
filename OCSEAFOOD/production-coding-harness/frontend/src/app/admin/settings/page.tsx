"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/store/useAuthStore";
import { getAuthHeaders } from "@/components/admin/adminApi";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, token, clearAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Form states
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [recruitmentTelegramToken, setRecruitmentTelegramToken] = useState("");
  const [recruitmentTelegramChatId, setRecruitmentTelegramChatId] = useState("");
  const [zaloToken, setZaloToken] = useState("");
  const [zaloUserId, setZaloUserId] = useState("");
  const [contactHotline, setContactHotline] = useState("");
  const [contactZalo, setContactZalo] = useState("");
  const [contactFacebook, setContactFacebook] = useState("");

  // UI States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [testingRecruitmentTelegram, setTestingRecruitmentTelegram] = useState(false);
  const [testingZalo, setTestingZalo] = useState(false);
  const [showTelegramToken, setShowTelegramToken] = useState(false);
  const [showRecruitmentTelegramToken, setShowRecruitmentTelegramToken] = useState(false);
  const [showZaloToken, setShowZaloToken] = useState(false);
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementContent, setAnnouncementContent] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Admin access validation
  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.push("/login?redirect=/admin/settings");
      return;
    }
    if (user.role !== "ADMIN") {
      router.push("/");
    }
  }, [mounted, router, user]);

  // Load current settings from API
  useEffect(() => {
    if (!mounted || !user || user.role !== "ADMIN") return;

    fetch("/api/settings", {
      headers: getAuthHeaders(token),
    })
      .then((res) => {
        if (res.status === 401) {
          clearAuth();
          router.push("/login?redirect=/admin/settings");
          throw new Error("Phiên đăng nhập đã hết hạn. Đang chuyển hướng...");
        }
        if (!res.ok) throw new Error("Không thể tải cấu hình");
        return res.json();
      })
      .then((data) => {
        setTelegramToken(data.TELEGRAM_BOT_TOKEN || "");
        setTelegramChatId(data.TELEGRAM_CHAT_ID || "");
        setRecruitmentTelegramToken(data.RECRUITMENT_TELEGRAM_BOT_TOKEN || "");
        setRecruitmentTelegramChatId(data.RECRUITMENT_TELEGRAM_CHAT_ID || "");
        setZaloToken(data.ZALO_OA_ACCESS_TOKEN || "");
        setZaloUserId(data.ZALO_USER_ID || "");
        setAnnouncementEnabled(!!data.HOMEPAGE_ANNOUNCEMENT_ENABLED);
        setAnnouncementContent(data.HOMEPAGE_ANNOUNCEMENT_CONTENT || "");
        setContactHotline(data.CONTACT_HOTLINE || "");
        setContactZalo(data.CONTACT_ZALO || "");
        setContactFacebook(data.CONTACT_FACEBOOK || "");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi tải cấu hình:", err);
        setMessage({ type: "error", text: err.message || "Lỗi tải cấu hình từ máy chủ" });
        setLoading(false);
      });
  }, [mounted, user, token, clearAuth, router]);

  const isAdmin = useMemo(() => mounted && user?.role === "ADMIN", [mounted, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(token),
        },
        body: JSON.stringify({
          TELEGRAM_BOT_TOKEN: telegramToken,
          TELEGRAM_CHAT_ID: telegramChatId,
          RECRUITMENT_TELEGRAM_BOT_TOKEN: recruitmentTelegramToken,
          RECRUITMENT_TELEGRAM_CHAT_ID: recruitmentTelegramChatId,
          ZALO_OA_ACCESS_TOKEN: zaloToken,
          ZALO_USER_ID: zaloUserId,
          HOMEPAGE_ANNOUNCEMENT_ENABLED: announcementEnabled,
          HOMEPAGE_ANNOUNCEMENT_CONTENT: announcementContent,
          CONTACT_HOTLINE: contactHotline,
          CONTACT_ZALO: contactZalo,
          CONTACT_FACEBOOK: contactFacebook,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message || "Không thể lưu cấu hình");
      }

      setMessage({ type: "success", text: "Đã lưu toàn bộ cấu hình hệ thống thành công." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Đã có lỗi xảy ra" });
    } finally {
      setSaving(false);
    }
  };

  const testTelegram = async () => {
    setTestingTelegram(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings/test-telegram", {
        method: "POST",
        headers: getAuthHeaders(token),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error?.message || "Gửi thử Telegram thất bại.");
      }

      setMessage({ type: "success", text: "Tin nhắn kiểm tra kết nối đã được gửi tới Telegram!" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Đã có lỗi xảy ra" });
    } finally {
      setTestingTelegram(false);
    }
  };

  const testRecruitmentTelegram = async () => {
    setTestingRecruitmentTelegram(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings/test-recruitment-telegram", {
        method: "POST",
        headers: getAuthHeaders(token),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error?.message || "Gửi thử Telegram Tuyển Dụng thất bại.");
      }

      setMessage({ type: "success", text: "Tin nhắn kiểm tra kết nối tuyển dụng đã được gửi tới Telegram!" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Đã có lỗi xảy ra" });
    } finally {
      setTestingRecruitmentTelegram(false);
    }
  };

  const testZalo = async () => {
    setTestingZalo(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings/test-zalo", {
        method: "POST",
        headers: getAuthHeaders(token),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error?.message || "Gửi thử Zalo thất bại.");
      }

      setMessage({ type: "success", text: "Tin nhắn kiểm tra kết nối đã được gửi tới Zalo!" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Đã có lỗi xảy ra" });
    } finally {
      setTestingZalo(false);
    }
  };

  if (!mounted || !isAdmin) return null;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.35em] text-slate-400">
            Admin / Settings
          </p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-100 mt-1">
            Cấu hình hệ thống
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Cấu hình kết nối thông báo (Telegram, Zalo) và thông báo voucher trang chủ.
          </p>
        </div>

        {message && (
          <div
            className={`border px-4 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 animate-in fade-in duration-200 ${
              message.type === "success"
                ? "bg-green-500/10 border-green-500/20 text-green-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            <span className="material-symbols-outlined text-base select-none">
              {message.type === "success" ? "check_circle" : "error"}
            </span>
            <span>{message.text}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-navy-950 border border-navy-700/50 rounded-2xl p-8 shadow-xl text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
            Đang tải dữ liệu cấu hình...
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Box 1: Cấu hình thông báo */}
              <div className="bg-navy-950 border border-navy-700/50 rounded-2xl p-6 shadow-xl space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span className="material-symbols-outlined text-orange-400 select-none">notifications</span>
                    Kênh nhận tin thông báo
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Cấu hình API kết nối khi có đơn hàng mới của khách.
                  </p>
                </div>

                {/* Telegram Settings */}
                <div className="space-y-4 pt-4 border-t border-navy-900">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-orange-500 rounded-sm"></span>
                    Telegram Bot Notification
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                        Telegram Bot Token
                      </label>
                      <div className="relative flex items-center bg-navy-850 border border-navy-700/60 rounded-xl px-4 py-1.5 focus-within:border-orange-500 transition-colors">
                        <input
                          type={showTelegramToken ? "text" : "password"}
                          value={telegramToken}
                          onChange={(e) => setTelegramToken(e.target.value)}
                          placeholder="Telegram Bot Token"
                          className="bg-transparent border-none text-slate-200 text-sm w-full py-1.5 focus:outline-none focus:ring-0 placeholder:text-slate-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowTelegramToken(!showTelegramToken)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center p-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-lg select-none">
                            {showTelegramToken ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                        Telegram Chat ID
                      </label>
                      <input
                        type="text"
                        value={telegramChatId}
                        onChange={(e) => setTelegramChatId(e.target.value)}
                        placeholder="Telegram Chat ID"
                        className="admin-input"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={testingTelegram || !telegramToken || !telegramChatId}
                      onClick={testTelegram}
                      className="inline-flex items-center gap-2 bg-navy-800 hover:bg-navy-700 border border-navy-700 text-slate-200 text-xs font-extrabold uppercase tracking-widest px-4 py-2.5 rounded-xl disabled:opacity-40 cursor-pointer"
                    >
                      {testingTelegram ? "Đang gửi..." : "Gửi thử Telegram"}
                    </button>
                  </div>
                </div>

                {/* Recruitment Telegram Settings */}
                <div className="space-y-4 pt-6 border-t border-navy-900">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-orange-500 rounded-sm"></span>
                    Telegram Tuyển Dụng Notification
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                        Telegram Bot Token Tuyển Dụng
                      </label>
                      <div className="relative flex items-center bg-navy-850 border border-navy-700/60 rounded-xl px-4 py-1.5 focus-within:border-orange-500 transition-colors">
                        <input
                          type={showRecruitmentTelegramToken ? "text" : "password"}
                          value={recruitmentTelegramToken}
                          onChange={(e) => setRecruitmentTelegramToken(e.target.value)}
                          placeholder="Telegram Bot Token Tuyển Dụng"
                          className="bg-transparent border-none text-slate-200 text-sm w-full py-1.5 focus:outline-none focus:ring-0 placeholder:text-slate-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRecruitmentTelegramToken(!showRecruitmentTelegramToken)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center p-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-lg select-none">
                            {showRecruitmentTelegramToken ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                        Telegram Chat ID Tuyển Dụng
                      </label>
                      <input
                        type="text"
                        value={recruitmentTelegramChatId}
                        onChange={(e) => setRecruitmentTelegramChatId(e.target.value)}
                        placeholder="Telegram Chat ID Tuyển Dụng"
                        className="admin-input"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={testingRecruitmentTelegram || !recruitmentTelegramToken || !recruitmentTelegramChatId}
                      onClick={testRecruitmentTelegram}
                      className="inline-flex items-center gap-2 bg-navy-800 hover:bg-navy-700 border border-navy-700 text-slate-200 text-xs font-extrabold uppercase tracking-widest px-4 py-2.5 rounded-xl disabled:opacity-40 cursor-pointer"
                    >
                      {testingRecruitmentTelegram ? "Đang gửi..." : "Gửi thử Telegram Tuyển Dụng"}
                    </button>
                  </div>
                </div>

                {/* Zalo Settings */}
                <div className="space-y-4 pt-6 border-t border-navy-900">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-orange-500 rounded-sm"></span>
                    Zalo OA Notification
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                        Zalo OA Access Token
                      </label>
                      <div className="relative flex items-center bg-navy-850 border border-navy-700/60 rounded-xl px-4 py-1.5 focus-within:border-orange-500 transition-colors">
                        <input
                          type={showZaloToken ? "text" : "password"}
                          value={zaloToken}
                          onChange={(e) => setZaloToken(e.target.value)}
                          placeholder="Zalo OA Access Token"
                          className="bg-transparent border-none text-slate-200 text-sm w-full py-1.5 focus:outline-none focus:ring-0 placeholder:text-slate-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowZaloToken(!showZaloToken)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center p-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-lg select-none">
                            {showZaloToken ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                        Zalo User ID (Admin nhận tin)
                      </label>
                      <input
                        type="text"
                        value={zaloUserId}
                        onChange={(e) => setZaloUserId(e.target.value)}
                        placeholder="Zalo User ID"
                        className="admin-input"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={testingZalo || !zaloToken || !zaloUserId}
                      onClick={testZalo}
                      className="inline-flex items-center gap-2 bg-navy-800 hover:bg-navy-700 border border-navy-700 text-slate-200 text-xs font-extrabold uppercase tracking-widest px-4 py-2.5 rounded-xl disabled:opacity-40 cursor-pointer"
                    >
                      {testingZalo ? "Đang gửi..." : "Gửi thử Zalo"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Box 3: Cấu hình Liên hệ nổi (Hotline, Zalo, Fanpage) */}
                <div className="bg-navy-950 border border-navy-700/50 rounded-2xl p-6 shadow-xl space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      <span className="material-symbols-outlined text-orange-400 select-none">contact_support</span>
                      Nút liên hệ nổi (Hotline, Zalo, Facebook)
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Cấu hình số điện thoại Hotline và đường dẫn chat hiển thị ở góc phải màn hình.
                    </p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-navy-900">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                        Số điện thoại Hotline (Ví dụ: 0901234567)
                      </label>
                      <input
                        type="text"
                        value={contactHotline}
                        onChange={(e) => setContactHotline(e.target.value)}
                        placeholder="Nhập số điện thoại Hotline"
                        className="admin-input"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                        Đường dẫn Zalo (Ví dụ: https://zalo.me/0901234567)
                      </label>
                      <input
                        type="text"
                        value={contactZalo}
                        onChange={(e) => setContactZalo(e.target.value)}
                        placeholder="Nhập đường dẫn chat Zalo"
                        className="admin-input"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                        Đường dẫn Facebook Fanpage (Ví dụ: https://facebook.com/ocseafood)
                      </label>
                      <input
                        type="text"
                        value={contactFacebook}
                        onChange={(e) => setContactFacebook(e.target.value)}
                        placeholder="Nhập đường dẫn Fanpage hoặc Messenger"
                        className="admin-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Box 2: Cấu hình Popup */}
                <div className="bg-navy-950 border border-navy-700/50 rounded-2xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        <span className="material-symbols-outlined text-orange-400 select-none">campaign</span>
                        Thông báo khuyến mại Trang chủ
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Cấu hình cửa sổ Popup nổi bật hiển thị voucher/khuyến mại giữa màn hình khi người dùng truy cập trang chủ.
                      </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-navy-900">
                      <label className="flex items-center gap-2 text-sm text-slate-300 font-bold cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={announcementEnabled}
                          onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                          className="rounded bg-navy-800 border-navy-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-navy-900"
                        />
                        Bật hiển thị Popup
                      </label>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                          Nội dung thông báo (hỗ trợ văn bản thuần túy)
                        </label>
                        <textarea
                          rows={8}
                          value={announcementContent}
                          onChange={(e) => setAnnouncementContent(e.target.value)}
                          placeholder="Ví dụ: Chào mừng quý khách! Nhập mã OCSEAFOOD30 giảm ngay 30% cho hóa đơn hải sản tươi sống từ 1.500.000đ đầu tiên!"
                          className="admin-input"
                          disabled={!announcementEnabled}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-navy-900">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/10 active:scale-98 disabled:opacity-50 cursor-pointer text-sm"
                    >
                      {saving ? "Đang lưu cấu hình..." : "LƯU CẤU HÌNH HỆ THỐNG"}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
