"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy-900 border-t border-navy-700 pt-16 pb-8">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6">
        {/* Google Map Embed (Nằm trong Footer trên cùng) */}
        <div className="mb-12 border border-navy-700/60 rounded-2xl overflow-hidden h-[280px] w-full shadow-lg shadow-black/20 relative">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.7969246507346!2d106.6838202!3d10.826847299999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175290075a511b1%3A0x882ec07961ccca2f!2z4buQYyBzZWFmb29k!5e0!3m2!1svi!2s!4v1781274873134!5m2!1svi!2s"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ốc Seafood Google Maps"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Section 1: Logo & Contact */}
          <div>
            <Link href="/" className="text-2xl font-extrabold tracking-tighter text-orange-500 mb-6 block hover:text-orange-600 transition-colors">
              OCSEAFOOD
            </Link>
            <div className="space-y-3 text-slate-400 text-sm">
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500 select-none">location_on</span>
                123 Đường Hải Sản, Quận 1, TP. HCM
              </p>
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500 select-none">call</span>
                Hotline: 1900 1234
              </p>
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500 select-none">mail</span>
                Email: contact@ocseafood.vn
              </p>
            </div>
          </div>

          {/* Section 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">
              Liên kết nhanh
            </h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li>
                <Link className="hover:text-orange-500 transition-colors" href="/">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link className="hover:text-orange-500 transition-colors" href="/menu">
                  Menu
                </Link>
              </li>
              <li>
                <Link className="hover:text-orange-500 transition-colors" href="/combo">
                  Combo
                </Link>
              </li>
              <li>
                <Link className="hover:text-orange-500 transition-colors" href="/blog">
                  Cẩm nang vào bếp
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 3: Policies */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">
              Chính sách
            </h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li>
                <Link className="hover:text-orange-500 transition-colors" href="/about#returns">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link className="hover:text-orange-500 transition-colors" href="/about#privacy">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link className="hover:text-orange-500 transition-colors" href="/about#guide">
                  Hướng dẫn mua hàng
                </Link>
              </li>
              <li>
                <Link className="hover:text-orange-500 transition-colors" href="/about#shipping">
                  Vận chuyển & Giao nhận
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 4: Newsletter */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">
              Bản tin
            </h4>
            <p className="text-slate-400 text-sm mb-4">
              Đăng ký để nhận ưu đãi mới nhất.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 mb-6">
              <input
                className="bg-navy-800 border-none rounded px-4 py-2 text-sm w-full focus:ring-1 focus:ring-orange-500 text-slate-200 outline-none placeholder:text-slate-500"
                placeholder="Email của bạn"
                type="email"
                required
              />
              <button 
                type="submit" 
                className="bg-orange-500 p-2 rounded hover:bg-orange-600 transition-colors text-white flex items-center justify-center cursor-pointer"
                aria-label="Send"
              >
                <span className="material-symbols-outlined select-none">send</span>
              </button>
            </form>
            <div className="flex gap-4">
              <Link 
                className="w-8 h-8 rounded-full bg-navy-800 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors text-slate-400" 
                href="https://facebook.com"
                target="_blank"
                aria-label="Facebook"
              >
                <span className="material-symbols-outlined select-none text-base">public</span>
              </Link>
              <Link 
                className="w-8 h-8 rounded-full bg-navy-800 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors text-slate-400" 
                href="https://instagram.com"
                target="_blank"
                aria-label="Instagram"
              >
                <span className="material-symbols-outlined select-none text-base">share</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-navy-700 pt-8 text-center text-slate-500 text-xs">
          <p>© 2024 OCSEAFOOD. All rights reserved. Designed for premium quality.</p>
        </div>
      </div>
    </footer>
  );
}
