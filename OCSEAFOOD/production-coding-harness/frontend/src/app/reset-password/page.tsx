"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import LoadingState from "@/components/LoadingState";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams ? searchParams.get("token") : null;

  // Form states
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [tokenState, setTokenState] = useState<"missing" | "checking" | "valid" | "invalid" | "unavailable">(
    token ? "checking" : "missing"
  );
  const [tokenRequestVersion, setTokenRequestVersion] = useState(0);

  useEffect(() => {
    if (!token) {
      void Promise.resolve().then(() => setTokenState("missing"));
      return;
    }

    const controller = new AbortController();
    void Promise.resolve().then(() => setTokenState("checking"));
    fetch(`/api/auth/reset-password/validate?token=${encodeURIComponent(token)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((res) => {
        if (res.ok) {
          setTokenState("valid");
          return;
        }
        if (res.status === 400 || res.status === 404) {
          setTokenState("invalid");
          return;
        }
        setTokenState("unavailable");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setTokenState("unavailable");
      });

    return () => controller.abort();
  }, [token, tokenRequestVersion]);

  // Redirect countdown
  useEffect(() => {
    if (successMsg && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (successMsg && countdown === 0) {
      router.push("/login");
    }
  }, [successMsg, countdown, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!token) {
      setErrorMsg("Mã xác thực không hợp lệ hoặc đã hết hạn.");
      return;
    }

    if (!password || !confirmPassword) {
      setErrorMsg("Vui lòng điền đầy đủ các thông tin.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Mật khẩu phải chứa ít nhất 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
      }

      setSuccessMsg("Đặt lại mật khẩu thành công! Đang chuyển hướng về trang đăng nhập...");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đặt lại mật khẩu thất bại.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-10 py-12">
      <div className="flex flex-col md:flex-row bg-navy-950 rounded-2xl overflow-hidden shadow-2xl border border-navy-700/50 max-w-[1200px] mx-auto min-h-[680px]">

        {/* Left side: Premium Image Banner */}
        <div className="hidden md:block md:w-1/2 relative min-h-[600px] overflow-hidden">
          <Image
            alt="Luxury Seafood Display"
            className="object-cover opacity-75 hover:scale-105 transition-transform duration-700"
            fill
            sizes="50vw"
            src="/Banner.png"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/20 via-navy-950/40 to-navy-950/90"></div>

          <div className="absolute bottom-12 left-12 right-12 z-10 space-y-4">
            <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest">
              OCSEAFOOD Premium
            </span>
            <h2 className="text-3xl font-black text-slate-100 uppercase tracking-tight leading-none">
              Tinh Hoa <span className="text-orange-500">Đại Dương</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              Trải nghiệm phong cách ẩm thực thượng lưu với nguồn hải sản tươi sống chất lượng loại 1 đánh bắt từ những vùng biển tinh khiết nhất thế giới.
            </p>
          </div>
        </div>

        {/* Right side: Interactive Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-navy-900 to-navy-950">

          <div className="border-b border-navy-800 pb-4 mb-8">
            <h2 className="text-lg font-black uppercase tracking-wider text-orange-500">
              Đặt lại mật khẩu mới
            </h2>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg mb-6 flex items-start gap-2 animate-in fade-in duration-200" role="alert">
              <span className="material-symbols-outlined text-sm mt-0.5 select-none">error</span>
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-4 py-3 rounded-lg mb-6">
              <div className="flex items-start gap-2 animate-in fade-in duration-200">
                <span className="material-symbols-outlined text-sm mt-0.5 select-none">check_circle</span>
                <span className="font-semibold">{successMsg}</span>
              </div>
              <p className="text-[11px] text-green-500/80 mt-1.5 ml-7">
                Tự động chuyển hướng về trang Đăng nhập sau {countdown} giây...
              </p>
            </div>
          )}

          {tokenState === "checking" ? (
            <LoadingState compact label="Đang kiểm tra liên kết đặt lại mật khẩu..." />
          ) : tokenState === "missing" || tokenState === "invalid" ? (
            <div className="text-center py-6 space-y-4" role="alert">
              <span className="material-symbols-outlined text-red-400 text-5xl select-none">link_off</span>
              <h3 className="text-md font-bold text-slate-200">Đường dẫn không hợp lệ hoặc đã hết hạn.</h3>
              <p className="text-xs text-slate-400">Vui lòng yêu cầu lại liên kết quên mật khẩu mới từ trang đăng nhập.</p>
              <button
                onClick={() => router.push("/login?tab=forgot-password")}
                className="inline-block bg-orange-500 hover:bg-orange-400 text-navy-950 font-bold py-2 px-6 rounded-xl text-xs transition-colors cursor-pointer"
              >
                QUAY LẠI QUÊN MẬT KHẨU
              </button>
            </div>
          ) : tokenState === "unavailable" ? (
            <div className="text-center py-6 space-y-4" role="alert">
              <span className="material-symbols-outlined text-amber-400 text-5xl select-none" aria-hidden="true">cloud_off</span>
              <h3 className="text-md font-bold text-slate-200">Chưa thể kiểm tra liên kết.</h3>
              <p className="text-xs text-slate-400">Kết nối đang gián đoạn. Mật khẩu của bạn chưa bị thay đổi.</p>
              <button
                onClick={() => setTokenRequestVersion((value) => value + 1)}
                className="inline-block bg-orange-500 hover:bg-orange-400 text-navy-950 font-bold py-2 px-6 rounded-xl text-xs transition-colors cursor-pointer"
                type="button"
              >
                THỬ KIỂM TRA LẠI
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="new-password" className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                    Mật khẩu mới
                  </label>
                  <div className="relative flex items-center bg-navy-800/80 border border-navy-700/60 rounded-xl pl-4 pr-12 py-1.5 focus-within:border-orange-500 transition-colors">
                    <span className="material-symbols-outlined text-slate-400 select-none text-xl">lock</span>
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-transparent border-none text-slate-200 text-sm w-full py-2 ml-3 focus:outline-none focus:ring-0"
                      disabled={loading || !!successMsg}
                      required
                    />
                    <button
                      aria-label={showPassword ? "Ẩn mật khẩu mới" : "Hiện mật khẩu mới"}
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center p-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg select-none">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirm-new-password" className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative flex items-center bg-navy-800/80 border border-navy-700/60 rounded-xl pl-4 pr-12 py-1.5 focus-within:border-orange-500 transition-colors">
                    <span className="material-symbols-outlined text-slate-400 select-none text-xl">lock_reset</span>
                    <input
                      id="confirm-new-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-transparent border-none text-slate-200 text-sm w-full py-2 ml-3 focus:outline-none focus:ring-0"
                      disabled={loading || !!successMsg}
                      required
                    />
                    <button
                      aria-label={showConfirmPassword ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"}
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center p-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg select-none">
                        {showConfirmPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !!successMsg}
                className="w-full bg-orange-500 hover:bg-orange-400 text-navy-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/10 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
              >
                {loading ? "Đang xử lý..." : "CẬP NHẬT MẬT KHẨU"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors bg-transparent border-none cursor-pointer"
                >
                  Quay lại Đăng nhập
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <LoadingState label="Đang tải trang đặt lại mật khẩu..." />
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
