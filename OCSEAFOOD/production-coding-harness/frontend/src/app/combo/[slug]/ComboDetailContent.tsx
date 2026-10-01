"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { Combo, ComboApiResponse, mapApiCombo } from "@/data/combos";
import RelatedPostsSection from "@/components/RelatedPostsSection";
import LoadingState from "@/components/LoadingState";
import StatusPanel from "@/components/StatusPanel";
import { optimizeImageUrl } from "@/utils/cloudinaryImage";
import { OFFICIAL_PHONE_TEL } from "@/constants/contact";

interface ComboDetailContentProps {
  slug: string;
}

export default function ComboDetailContent({ slug }: ComboDetailContentProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [combo, setCombo] = useState<Combo | null>(null);
  const [relatedCombos, setRelatedCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<"not-found" | "service" | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    async function loadComboData() {
      try {
        const res = await fetch("/api/combos");
        if (!res.ok) throw new Error("Combo service unavailable");
        const json = await res.json();
        const data = Array.isArray(json) ? json : (json.data ?? []);
        const formatted = (data as ComboApiResponse[]).map(mapApiCombo);
        const found = formatted.find((c) => c.slug === slug);
        if (found) {
          setActiveImageIndex(0);
          setCombo(found);
          setRelatedCombos(formatted.filter((c) => c.id !== found.id).slice(0, 3));
          setLoadError(null);
          return;
        }
        setCombo(null);
        setLoadError("not-found");
      } catch (err) {
        console.error("Failed to load combo detail from backend:", err);
        setCombo(null);
        setLoadError("service");
      }
    }
    void Promise.resolve().then(() => setLoading(true));
    loadComboData().finally(() => setLoading(false));
  }, [slug, requestVersion]);

  // Use only the combo image managed by OCSEAFOOD.
  const images = useMemo(() => {
    if (!combo) return [];
    return combo.image ? [combo.image] : [];
  }, [combo]);

  // Autoplay timer: 4s interval
  useEffect(() => {
    if (images.length <= 1 || (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  if (loading) {
    return <LoadingState label="Đang tải thông tin combo..." />;
  }

  if (loadError === "service") {
    return (
      <StatusPanel
        announce="assertive"
        description="Không thể kết nối dữ liệu combo mới nhất. Vui lòng thử lại trước khi đặt hàng."
        eyebrow="Dịch vụ tạm thời gián đoạn"
        icon="cloud_off"
        onPrimaryAction={() => setRequestVersion((value) => value + 1)}
        primaryLabel="Thử tải lại"
        secondaryHref="/combo"
        secondaryLabel="Xem danh sách combo"
        title="Chưa thể tải combo"
      />
    );
  }

  if (!combo) {
    return (
      <StatusPanel
        description="Combo có thể đã ngừng hiển thị hoặc đường dẫn chưa chính xác."
        eyebrow="Combo không khả dụng"
        icon="restaurant_menu"
        primaryHref="/combo"
        primaryLabel="Quay lại trang combo"
        secondaryHref="/menu"
        secondaryLabel="Xem thực đơn"
        title="Combo không tồn tại"
      />
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price).replace(/\s/g, "");
  };

  const handleAddToCart = () => {
    if (!combo || combo.showContact) return;
    addItem({
      id: combo.id,
      name: combo.name,
      priceReference: combo.price || 0,
      image: combo.image,
      unit: "set",
      isCombo: true,
    }, quantity);
    
    // Show toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleBuyNow = () => {
    if (!combo || combo.showContact) return;
    addItem({
      id: combo.id,
      name: combo.name,
      priceReference: combo.price || 0,
      image: combo.image,
      unit: "set",
      isCombo: true,
    }, quantity);
    router.push("/cart");
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-8 space-y-16">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-24 left-6 z-50 bg-green-500 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <span className="material-symbols-outlined text-lg select-none">check_circle</span>
          <span className="text-xs font-bold uppercase tracking-wider">Đã thêm {quantity} combo vào giỏ hàng!</span>
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
        <Link href="/" className="hover:text-slate-300 transition-colors">Trang chủ</Link>
        <span className="text-slate-600">/</span>
        <Link href="/combo" className="hover:text-slate-300 transition-colors">Combo Hải Sản</Link>
        <span className="text-slate-600">/</span>
        <span className="text-slate-300 font-extrabold">{combo.name}</span>
      </nav>

      {/* Combo Details Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Combo Image Slideshow */}
        <div className="bg-navy-950 border border-navy-800/80 rounded-2xl p-4 shadow-2xl relative overflow-hidden group">
          <div className="aspect-[4/3] relative rounded-xl overflow-hidden bg-navy-900">
            <Image
              key={images[activeImageIndex] || "placeholder"}
              alt={`${combo.name} - ảnh ${activeImageIndex + 1}`}
              className="object-cover"
              fill
              sizes="(max-width: 1023px) 100vw, 50vw"
              src={optimizeImageUrl(images[activeImageIndex], 1000) || "/media-placeholder.svg"}
            />
            {combo.discountBadge && (
              <span className="absolute top-4 right-4 bg-red-600 text-white text-xs font-black px-3.5 py-1.5 uppercase tracking-widest rounded-full shadow z-20">
                {combo.discountBadge}
              </span>
            )}
            {combo.tag && (
              <span className="absolute top-4 left-4 bg-slate-950 text-yellow-300 text-[10px] font-black px-3 py-1.5 uppercase tracking-widest rounded-full shadow border border-yellow-300/30 z-20">
                {combo.tag}
              </span>
            )}

            {/* Left/Right Controls */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-navy-950/70 border border-navy-800 text-white rounded-full opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-orange-500 hover:border-orange-500 hover:text-navy-950 cursor-pointer z-20"
                  aria-label="Ảnh trước"
                >
                  <span className="material-symbols-outlined select-none text-lg">chevron_left</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-navy-950/70 border border-navy-800 text-white rounded-full opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-orange-500 hover:border-orange-500 hover:text-navy-950 cursor-pointer z-20"
                  aria-label="Ảnh tiếp theo"
                >
                  <span className="material-symbols-outlined select-none text-lg">chevron_right</span>
                </button>

                {/* Pagination Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className="flex h-8 min-w-8 items-center justify-center rounded-full cursor-pointer"
                      aria-label={`Chuyển đến ảnh ${index + 1}`}
                      aria-current={index === activeImageIndex ? "true" : undefined}
                    >
                      <span aria-hidden="true" className={`h-2 rounded-full ${index === activeImageIndex ? "w-4 bg-orange-500" : "w-2 bg-white/60"}`} />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Info & CTA */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight leading-tight">
              {combo.name}
            </h1>
            <p className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">
              Loại gói: <span className="text-orange-500 font-black">Set tiệc hải sản</span>
            </p>
          </div>

          <div className="py-4 border-t border-b border-navy-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Giá bán trọn gói</p>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl font-black text-yellow-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                  {combo.showContact ? `Từ ${formatPrice(combo.price || 0)}` : formatPrice(combo.price || 0)}
                </span>
                {combo.originalPrice && (
                  <span className="text-sm text-slate-500 line-through">
                    {formatPrice(combo.originalPrice)}
                  </span>
                )}
              </div>
            </div>
            <span className="text-[10px] bg-orange-500/10 border border-orange-500/20 text-orange-400 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider">
              {combo.showContact ? "Tư vấn theo tiệc" : "Tiết kiệm hơn mua lẻ"}
            </span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed font-medium">
            {combo.description}
          </p>

          {/* Breakdown items included in the combo */}
          <div className="space-y-3 pt-2">
            <p className="text-xs uppercase font-black tracking-widest text-slate-400">
              Chi tiết set ẩm thực bao gồm:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {combo.items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 bg-navy-900/60 p-3 rounded-xl border border-navy-800/80">
                  <span className="material-symbols-outlined text-orange-500 text-[18px] select-none pt-0.5">restaurant_menu</span>
                  <span className="text-xs font-semibold text-slate-200 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Blocks */}
          <div className="space-y-6 pt-6 border-t border-navy-800">
            {/* Quantity selector */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Số lượng:</span>
              <div className="flex items-center bg-navy-950 border border-navy-800 rounded-xl overflow-hidden p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-navy-800 hover:text-white rounded-lg transition-colors cursor-pointer"
                  aria-label="Giảm số lượng"
                >
                  <span className="material-symbols-outlined text-lg select-none">remove</span>
                </button>
                <input
                  type="number"
                  value={quantity}
                  aria-label="Số lượng"
                  min={1}
                  max={99}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(99, parseInt(e.target.value, 10) || 1)))}
                  className="h-10 w-12 text-center bg-transparent border-none outline-none text-slate-100 text-sm font-extrabold focus:ring-0"
                />
                <button
                  onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-navy-800 hover:text-white rounded-lg transition-colors cursor-pointer"
                  aria-label="Tăng số lượng"
                >
                  <span className="material-symbols-outlined text-lg select-none">add</span>
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {combo.showContact ? (
                <a
                  href={OFFICIAL_PHONE_TEL}
                  className="bg-white hover:bg-amber-50 text-red-600 font-extrabold py-4 px-6 rounded-xl uppercase text-xs tracking-widest transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98] text-center inline-flex items-center justify-center gap-2 sm:col-span-2"
                >
                  <span className="material-symbols-outlined text-base">call</span>
                  Liên Hệ Ngay
                </a>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="bg-white hover:bg-amber-50 text-red-600 font-extrabold py-4 px-6 rounded-xl uppercase text-xs tracking-widest transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98] text-center"
                  >
                    Mua ngay lập tức
                  </button>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold py-4 px-6 rounded-xl uppercase text-xs tracking-widest transition-all cursor-pointer shadow-md hover:shadow-orange-500/25 active:scale-[0.98]"
                  >
                    Thêm vào giỏ hàng
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Policies/Promotions Section */}
      <section className="bg-navy-900/50 border border-navy-800/80 rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shrink-0">
            <span className="material-symbols-outlined select-none text-xl">local_shipping</span>
          </div>
          <div>
            <h4 className="font-extrabold text-slate-200 text-sm uppercase tracking-wide">Freeship 10km</h4>
            <p className="text-xs text-slate-400 mt-0.5">Miễn phí giao hàng cho tất cả các set combo tiệc.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shrink-0">
            <span className="material-symbols-outlined select-none text-xl">wine_bar</span>
          </div>
          <div>
            <h4 className="font-extrabold text-slate-200 text-sm uppercase tracking-wide">Tặng vang trắng</h4>
            <p className="text-xs text-slate-400 mt-0.5">Tặng kèm chai rượu vang trắng thượng vị đậm đà.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shrink-0">
            <span className="material-symbols-outlined select-none text-xl">verified_user</span>
          </div>
          <div>
            <h4 className="font-extrabold text-slate-200 text-sm uppercase tracking-wide">Đổi trả 1-1</h4>
            <p className="text-xs text-slate-400 mt-0.5">Cam kết đổi trả 100% nếu hải sản hao hụt chất lượng.</p>
          </div>
        </div>
      </section>

      {/* Related Combos Section */}
      <section className="space-y-8 pt-8 border-t border-navy-800">
        <div>
          <span className="text-orange-500 font-extrabold tracking-widest uppercase text-xs">KHÁM PHÁ THÊM</span>
          <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight text-white mt-1">Các Gói Combo Tiệc Khác</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedCombos.map((c) => (
            <div
              key={c.id}
                className="rounded-xl overflow-hidden border border-amber-400/70 bg-orange-500 hover:border-amber-300 hover:shadow-[0_16px_45px_rgba(249,115,22,0.28)] hover:-translate-y-1 transition-all duration-300 flex flex-col group shadow-lg holographic-card"
            >
              <Link href={`/combo/${c.slug}`} className="relative aspect-[4/3] overflow-hidden bg-navy-900 block">
                <Image
                  alt={c.name}
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  fill
                  sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                  src={optimizeImageUrl(c.image, 600)}
                />
                {c.discountBadge && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white font-extrabold px-3 py-1 rounded-full text-xs uppercase tracking-widest">
                    {c.discountBadge}
                  </div>
                )}
                {c.tag && (
                  <div className="absolute top-4 left-4 bg-slate-950 text-yellow-300 font-extrabold px-3 py-1 rounded-full text-xs uppercase tracking-widest border border-yellow-300/30">
                    {c.tag}
                  </div>
                )}
              </Link>
              <div className="bg-gradient-to-br from-orange-500 via-orange-500 to-amber-400 p-5 flex flex-col flex-grow space-y-4">
                <Link href={`/combo/${c.slug}`}>
                  <h3 className="font-extrabold text-lg text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] transition-colors">
                    {c.name}
                  </h3>
                </Link>
                <p className="text-white/90 text-xs md:text-sm line-clamp-3 leading-relaxed flex-grow">
                  {c.description}
                </p>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-col">
                    {c.originalPrice && (
                      <span className="text-white/70 line-through text-xs md:text-sm">
                        {formatPrice(c.originalPrice)}
                      </span>
                    )}
                    <span className="text-yellow-300 font-black text-xl md:text-2xl drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]">
                      {c.showContact ? `Từ ${formatPrice(c.price || 0)}` : formatPrice(c.price || 0)}
                    </span>
                  </div>
                  <Link
                    href={`/combo/${c.slug}`}
                    className="bg-white text-red-600 hover:bg-amber-50 hover:text-red-700 px-5 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer shadow-[0_6px_18px_rgba(0,0,0,0.18)] text-center"
                  >
                    Chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <RelatedPostsSection />
    </div>
  );
}
