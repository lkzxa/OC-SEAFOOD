"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { COMBOS, Combo } from "@/data/combos";
import RelatedPostsSection from "@/components/RelatedPostsSection";
import { optimizeImageUrl } from "@/utils/cloudinaryImage";

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

  useEffect(() => {
    async function loadComboData() {
      try {
        const res = await fetch("/api/combos");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const formatted = data.map((c: any) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              description: c.description,
              originalPrice: c.originalPrice ? Number(c.originalPrice) : undefined,
              price: c.price ? Number(c.price) : undefined,
              showContact: c.showContact || false,
              image: c.image,
              tag: c.tag || undefined,
              discountBadge: c.discountBadge || undefined,
              items: c.items,
            }));
            const found = formatted.find((c) => c.slug === slug);
            if (found) {
              setCombo(found);
              setRelatedCombos(formatted.filter((c) => c.id !== found.id).slice(0, 3));
              return;
            }
          }
        }
      } catch (err) {
        console.error("Failed to load combo detail from backend:", err);
      }
      const staticFound = COMBOS.find((c) => c.slug === slug) || null;
      setCombo(staticFound);
      if (staticFound) {
        setRelatedCombos(COMBOS.filter((c) => c.id !== staticFound.id).slice(0, 3));
      }
    }
    loadComboData().finally(() => setLoading(false));
  }, [slug]);

  // Generate slideshow images: current combo image + 2 placeholders
  const images = useMemo(() => {
    if (!combo) return [];
    const list = [combo.image];
    const placeholders = [
      "https://images.unsplash.com/photo-1534080391025-09795d197a5b?w=800&q=80",
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80",
      "https://images.unsplash.com/photo-1553618551-fba689030290?w=800&q=80"
    ];
    placeholders.forEach(placeholder => {
      if (list.length < 3 && !list.includes(placeholder)) {
        list.push(placeholder);
      }
    });
    return list;
  }, [combo]);

  // Autoplay timer: 4s interval
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeImageIndex, images]);

  // Reset image index when slug changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40 w-full">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!combo) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-24 text-center space-y-6">
        <h1 className="text-3xl font-black text-white uppercase">Combo Không Tồn Tại</h1>
        <p className="text-slate-400 text-sm">Vui lòng kiểm tra lại đường dẫn hoặc quay về trang danh sách combo.</p>
        <Link 
          href="/combo" 
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider transition-colors text-xs"
        >
          Quay lại Trang Combo
        </Link>
      </div>
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
            {images.map((imgUrl, index) => (
              <img
                key={index}
                alt={`${combo.name} - Slide ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
                  index === activeImageIndex 
                    ? "opacity-100 scale-100 z-10" 
                    : "opacity-0 scale-95 pointer-events-none z-0"
                }`}
                src={optimizeImageUrl(imgUrl, 1000)}
              />
            ))}
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
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-navy-950/70 border border-navy-800 text-white rounded-full opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-orange-500 hover:border-orange-500 cursor-pointer z-20"
                  aria-label="Previous image"
                >
                  <span className="material-symbols-outlined select-none text-lg">chevron_left</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-navy-950/70 border border-navy-800 text-white rounded-full opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-orange-500 hover:border-orange-500 cursor-pointer z-20"
                  aria-label="Next image"
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
                      className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        index === activeImageIndex
                          ? "bg-orange-500 w-4"
                          : "bg-white/50 hover:bg-white"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
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
                {combo.showContact ? (
                  <span className="text-3xl font-black text-yellow-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                    Liên hệ
                  </span>
                ) : (
                  <>
                    <span className="text-3xl font-black text-yellow-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                      {formatPrice(combo.price || 0)}
                    </span>
                    {combo.originalPrice && (
                      <span className="text-sm text-slate-500 line-through">
                        {formatPrice(combo.originalPrice)}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            <span className="text-[10px] bg-orange-500/10 border border-orange-500/20 text-orange-400 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider">
              {combo.showContact ? "Liên hệ để biết giá" : "Tiết kiệm hơn mua lẻ"}
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
                  aria-label="Decrease quantity"
                >
                  <span className="material-symbols-outlined text-lg select-none">remove</span>
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(99, parseInt(e.target.value, 10) || 1)))}
                  className="w-12 text-center bg-transparent border-none outline-none text-slate-100 text-sm font-extrabold focus:ring-0"
                />
                <button
                  onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-navy-800 hover:text-white rounded-lg transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <span className="material-symbols-outlined text-lg select-none">add</span>
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {combo.showContact ? (
                <a
                  href="tel:0908464818"
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
              className="bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 rounded-xl overflow-hidden border border-amber-400/40 hover:border-yellow-300 hover:shadow-[0_12px_40px_rgba(239,68,68,0.35)] hover:-translate-y-1 transition-all duration-300 flex flex-col group shadow-lg holographic-card"
            >
              <Link href={`/combo/${c.slug}`} className="relative aspect-[4/3] overflow-hidden bg-navy-900 block">
                <img
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
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
              <div className="p-5 flex flex-col flex-grow space-y-4">
                <Link href={`/combo/${c.slug}`}>
                  <h4 className="font-extrabold text-lg text-white group-hover:text-amber-100 transition-colors drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.3)]">
                    {c.name}
                  </h4>
                </Link>
                <p className="text-amber-100 text-xs md:text-sm line-clamp-3 leading-relaxed flex-grow">
                  {c.description}
                </p>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-col">
                    {c.showContact ? (
                      <span className="text-yellow-300 font-black text-xl md:text-2xl drop-shadow-[0_2px_5px_rgba(0,0,0,0.4)]">
                        Liên hệ
                      </span>
                    ) : (
                      <>
                        {c.originalPrice && (
                          <span className="text-amber-200/80 line-through text-xs md:text-sm">
                            {formatPrice(c.originalPrice)}
                          </span>
                        )}
                        <span className="text-yellow-300 font-black text-xl md:text-2xl drop-shadow-[0_2px_5px_rgba(0,0,0,0.4)]">
                          {formatPrice(c.price || 0)}
                        </span>
                      </>
                    )}
                  </div>
                  <Link
                    href={`/combo/${c.slug}`}
                    className="bg-white text-red-600 hover:bg-amber-50 hover:text-red-700 px-5 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer shadow-md text-center"
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
