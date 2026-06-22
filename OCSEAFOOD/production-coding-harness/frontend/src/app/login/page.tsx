"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setAuth } = useAuthStore();

  // Tab state: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // UI States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Parse tab query parameter
  useEffect(() => {
    if (searchParams) {
      const tab = searchParams.get("tab");
      if (tab === "register" || tab === "login") {
        Promise.resolve().then(() => setActiveTab(tab));
      }
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectUrl = searchParams?.get("redirect") || (user.role === "ADMIN" ? "/admin" : "/");
      router.push(redirectUrl);
    }
  }, [user, router, searchParams]);

  // Google OAuth callback handler
  useEffect(() => {
    if (!searchParams) return;
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (code && state === "google") {
      const handleGoogleCallback = async () => {
        setLoading(true);
        setErrorMsg(null);
        setSuccessMsg("Đang xác thực tài khoản Google của bạn...");

        try {
          const res = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data?.error?.message || "Đăng nhập Google thất bại.");
          }

          setSuccessMsg("Đăng nhập Admin thành công!");
          setAuth(data.token, data.user);
          router.replace("/login");
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Đăng nhập Google thất bại.";
          setErrorMsg(message);
          setSuccessMsg(null);
          router.replace("/login");
        } finally {
          setLoading(false);
        }
      };

      handleGoogleCallback();
    }
  }, [searchParams, router, setAuth]);

  const handleGoogleAdminLogin = () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "mock-google-client-id";
    const redirectUri = window.location.origin + "/login";

    if (clientId === "mock-google-client-id") {
      setSuccessMsg("Đang khởi động chế độ giả lập đăng nhập Admin...");
      setTimeout(() => {
        router.push(`/login?code=mock_google_admin_code&state=google`);
      }, 1000);
      return;
    }

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=openid%20email%20profile&state=google`;

    window.location.href = authUrl;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg("Vui lòng điền đầy đủ email và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }

      setSuccessMsg("Đăng nhập thành công!");
      // BUG-018 fix: pass rememberMe flag — cookie lasts 30 days if checked, else session only
      setAuth(data.token, data.user, rememberMe ? 30 : 0);

      // Redirect handled by useEffect
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đăng nhập thất bại.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Frontend validations
    if (!regName || !regEmail || !regPassword || !regConfirmPassword) {
      setErrorMsg("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg("Mật khẩu phải chứa ít nhất 6 ký tự.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp.");
      return;
    }

    // Optional Vietnamese phone validation if supplied
    if (regPhone) {
      const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
      if (!phoneRegex.test(regPhone.replace(/\s+/g, ""))) {
        setErrorMsg("Số điện thoại không đúng định dạng Việt Nam.");
        return;
      }
    }

    setLoading(true);
    try {
      // Backend RegisterSchema does not accept 'phone', so we exclude it
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          name: regName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || "Đăng ký thất bại. Vui lòng thử lại.");
      }

      setSuccessMsg("Đăng ký tài khoản thành công! Đang tự động đăng nhập...");

      // Automatically login after successful registration
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regEmail, password: regPassword }),
      });

      const loginData = await loginRes.json();
      if (loginRes.ok) {
        setAuth(loginData.token, loginData.user);
      } else {
        // Fallback if autologin fails: switch to login tab
        Promise.resolve().then(() => setActiveTab("login"));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đăng ký thất bại.";
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
          <img
            alt="Luxury Seafood Display"
            className="absolute inset-0 w-full h-full object-cover opacity-75 hover:scale-105 transition-transform duration-700"
            src="https://lh3.googleusercontent.com/aida/AP1WRLvTSABaX3o0WsO5j3M6RcEY2BvkuFuc3dW7O4I5XJ1hexOsKbsL2g9KEa6CpH_UeJcID7KvRAZDK92XfJTLocZyeZ83ENKHuHOdJrrAh1Buzrs-jqmFr5TwtgD-nxnietcyZIzLlnK1JQTy6cejds2VaXndqTGd84Vv1ozKhspMSjEUXPP2Qf7rtY13o7DiEv3f6ZcZdpv7zuuTHlfhuQyIYyjMo3wMF7j1ncVHz-Qf885hHhMN3OaKKq8"
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

          {/* Tab switching buttons */}
          <div className="flex gap-6 border-b border-navy-800 pb-4 mb-8">
            <button
              onClick={() => {
                setActiveTab("login");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`pb-2 text-lg font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${activeTab === "login"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-slate-400 hover:text-slate-200"
                }`}
            >
              Đăng Nhập
            </button>
            <button
              onClick={() => {
                setActiveTab("register");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`pb-2 text-lg font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${activeTab === "register"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-slate-400 hover:text-slate-200"
                }`}
            >
              Đăng Ký
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg mb-6 flex items-start gap-2 animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-sm mt-0.5 select-none">error</span>
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-4 py-3 rounded-lg mb-6 flex items-start gap-2 animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-sm mt-0.5 select-none">check_circle</span>
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* Login Form */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                    Email đăng nhập
                  </label>
                  <div className="flex items-center bg-navy-800/80 border border-navy-700/60 rounded-xl px-4 py-1.5 focus-within:border-orange-500 transition-colors">
                    <span className="material-symbols-outlined text-slate-400 select-none text-xl">mail</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="bg-transparent border-none text-slate-200 text-sm w-full py-2 ml-3 focus:outline-none focus:ring-0"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                    Mật khẩu
                  </label>
                  <div className="relative flex items-center bg-navy-800/80 border border-navy-700/60 rounded-xl pl-4 pr-12 py-1.5 focus-within:border-orange-500 transition-colors">
                    <span className="material-symbols-outlined text-slate-400 select-none text-xl">lock</span>
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-transparent border-none text-slate-200 text-sm w-full py-2 ml-3 focus:outline-none focus:ring-0"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center p-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg select-none">
                        {showLoginPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-navy-800 border-navy-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-navy-900"
                    disabled={loading}
                  />
                  Ghi nhớ tôi
                </label>
                <button
                  type="button"
                  onClick={() => setErrorMsg("Để đặt lại mật khẩu, vui lòng liên hệ hỗ trợ qua số điện thoại hoặc email admin.")}
                  className="text-orange-400 hover:text-orange-500 transition-colors bg-transparent border-none cursor-pointer font-semibold"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/10 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
              >
                {loading ? "Đang xử lý..." : "ĐĂNG NHẬP NGAY"}
              </button>

              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-navy-800/60"></div>
                </div>
                <span className="relative bg-navy-950 px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                  KHÁC
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleAdminLogin}
                disabled={loading}
                className="w-full bg-navy-900 hover:bg-navy-850 border border-navy-800 text-slate-200 font-bold py-3.5 rounded-xl transition-all hover:border-orange-500/40 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    style={{ fill: "#4285F4" }}
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    style={{ fill: "#34A853" }}
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    style={{ fill: "#FBBC05" }}
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    style={{ fill: "#EA4335" }}
                  />
                </svg>
                {loading ? "Đang xử lý..." : "ĐĂNG NHẬP BẰNG GOOGLE"}
              </button>
            </form>
          )}

          {/* Register Form */}
          {activeTab === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-in fade-in duration-300">
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                    Họ và Tên
                  </label>
                  <div className="flex items-center bg-navy-800/80 border border-navy-700/60 rounded-xl px-4 py-1.5 focus-within:border-orange-500 transition-colors">
                    <span className="material-symbols-outlined text-slate-400 select-none text-xl">badge</span>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="bg-transparent border-none text-slate-200 text-sm w-full py-2 ml-3 focus:outline-none focus:ring-0"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                    Email tài khoản
                  </label>
                  <div className="flex items-center bg-navy-800/80 border border-navy-700/60 rounded-xl px-4 py-1.5 focus-within:border-orange-500 transition-colors">
                    <span className="material-symbols-outlined text-slate-400 select-none text-xl">mail</span>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="bg-transparent border-none text-slate-200 text-sm w-full py-2 ml-3 focus:outline-none focus:ring-0"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                    Số điện thoại (Tùy chọn)
                  </label>
                  <div className="flex items-center bg-navy-800/80 border border-navy-700/60 rounded-xl px-4 py-1.5 focus-within:border-orange-500 transition-colors">
                    <span className="material-symbols-outlined text-slate-400 select-none text-xl">call</span>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="0912 345 678"
                      className="bg-transparent border-none text-slate-200 text-sm w-full py-2 ml-3 focus:outline-none focus:ring-0"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                      Mật khẩu
                    </label>
                    <div className="relative flex items-center bg-navy-800/80 border border-navy-700/60 rounded-xl pl-4 pr-12 py-1.5 focus-within:border-orange-500 transition-colors">
                      <input
                        type={showRegPassword ? "text" : "password"}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-transparent border-none text-slate-200 text-sm w-full py-2 focus:outline-none focus:ring-0"
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center p-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-lg select-none">
                          {showRegPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                      Xác nhận
                    </label>
                    <div className="relative flex items-center bg-navy-800/80 border border-navy-700/60 rounded-xl pl-4 pr-12 py-1.5 focus-within:border-orange-500 transition-colors">
                      <input
                        type={showRegConfirmPassword ? "text" : "password"}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-transparent border-none text-slate-200 text-sm w-full py-2 focus:outline-none focus:ring-0"
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center p-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-lg select-none">
                          {showRegConfirmPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/10 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm mt-4"
              >
                {loading ? "Đang xử lý..." : "TẠO TÀI KHOẢN MỚI"}
              </button>

              <p className="text-center text-[10px] text-slate-400 leading-normal pt-2">
                Bằng việc tiếp tục, bạn đồng ý với các{" "}
                <a href="#" className="text-orange-400 hover:underline">
                  Điều khoản Dịch vụ
                </a>{" "}
                &{" "}
                <a href="#" className="text-orange-400 hover:underline">
                  Chính sách Bảo mật
                </a>{" "}
                của OCSEAFOOD.
              </p>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-navy-900 text-slate-400 text-sm font-bold uppercase tracking-widest">
        Đang tải trang xác thực...
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
