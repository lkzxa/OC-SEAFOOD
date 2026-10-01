"use client";

import "./globals.css";

export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-navy-900 text-slate-100 font-sans">
        <main className="flex min-h-screen items-center justify-center px-4 py-12">
          <section aria-live="assertive" className="w-full max-w-2xl rounded-3xl border border-navy-700 bg-navy-950 p-8 text-center shadow-2xl md:p-12">
            <span className="material-symbols-outlined text-5xl text-orange-500" aria-hidden="true">warning</span>
            <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.28em] text-orange-400">Lỗi hệ thống</p>
            <h1 className="mt-3 text-2xl font-black uppercase tracking-tight md:text-4xl">OCSEAFOOD đang khôi phục kết nối</h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-400 md:text-base">
              Trang chưa thể hoạt động bình thường. Vui lòng thử lại sau ít phút.
            </p>
            <button
              className="mt-8 min-h-11 cursor-pointer rounded-xl bg-orange-500 px-7 py-3 text-xs font-black uppercase tracking-widest text-navy-950 transition-colors hover:bg-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
              onClick={retry}
              type="button"
            >
              Thử tải lại
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
