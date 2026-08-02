"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { COMBOS, Combo } from "@/data/combos";
import { sortByPrice, PriceSortOrder } from "@/utils/sortByPrice";

export default function ComboPage() {
  const { addItem } = useCart();
  const [combosList, setCombosList] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<PriceSortOrder>("desc");

  useEffect(() => {
    async function fetchCombos() {
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
            setCombosList(formatted);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch combos from backend:", err);
      }
      setCombosList(COMBOS);
    }
    fetchCombos().finally(() => setLoading(false));
  }, []);

  const handleOrder = (combo: Combo) => {
    if (combo.showContact) return;
    addItem({
      id: combo.id,
      name: combo.name,
      priceReference: combo.price || 0,
      image: combo.image,
      unit: "set",
      isCombo: true,
    }, 1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price).replace(/\s/g, "");
  };

  const sortedCombos = sortByPrice(
    combosList,
    (c) => (c.showContact || !c.price ? null : c.price),
    sortOrder
  );

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-12 space-y-16">
      {/* Introduction Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <span className="text-orange-500 font-extrabold tracking-widest uppercase text-xs">
            GÓI TIỆC GIA ĐÌNH
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-100 leading-tight">
            Sản Phẩm Hải Sản <span className="text-orange-500">ỐC SEAFOOD</span> – Tươi Ngon, Đẳng Cấp
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            ỐC SEAFOOD là hệ thống siêu thị hải sản cao cấp, chuyên cung cấp đa dạng các loại tôm tươi sống, cua hoàng đế, bào ngư thượng hạng cùng các set combo được thiết kế tinh tế bởi những đầu bếp giàu kinh nghiệm.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <span className="material-symbols-outlined text-orange-500 text-xl select-none pt-0.5">verified</span>
              <div>
                <h3 className="font-extrabold text-slate-200 text-sm">Nguồn gốc rõ ràng</h3>
                <p className="text-xs text-slate-400">Nhập khẩu chính ngạch từ vùng biển sạch nhất.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="material-symbols-outlined text-orange-500 text-xl select-none pt-0.5">eco</span>
              <div>
                <h3 className="font-extrabold text-slate-200 text-sm">Bảo quản sống</h3>
                <p className="text-xs text-slate-400">Hệ thống bể lọc nước biển tiêu chuẩn quốc tế.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="material-symbols-outlined text-orange-500 text-xl select-none pt-0.5">delivery_dining</span>
              <div>
                <h3 className="font-extrabold text-slate-200 text-sm">Dịch vụ tiện lợi</h3>
                <p className="text-xs text-slate-400">Giao hàng thần tốc, hỗ trợ chế biến sẵn.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="material-symbols-outlined text-orange-500 text-xl select-none pt-0.5">published_with_changes</span>
              <div>
                <h3 className="font-extrabold text-slate-200 text-sm">Đổi trả 1-1</h3>
                <p className="text-xs text-slate-400">Cam kết chất lượng trên từng sản phẩm.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute -inset-4 bg-orange-500/10 blur-3xl group-hover:bg-orange-500/20 transition-all duration-700"></div>
          <img
            alt="Combo Tiệc Hải Sản Cao Cấp OCSEAFOOD"
            className="relative z-10 w-full aspect-square object-cover rounded-xl shadow-2xl border border-navy-700"
            src="https://res.cloudinary.com/dctuxpra6/image/upload/v1785424827/ocseafood/banners/jpheoccv6ajbjnlguexa.png"
          />
        </div>
      </section>

      {/* Main Combos Area */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-navy-700 pb-4">
          <h2 className="text-2xl md:text-3xl font-black uppercase text-slate-100 tracking-tight">
            COMBO 5 NGƯỜI
          </h2>
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="combo-sort-order" className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
              Sắp xếp
            </label>
            <select
              id="combo-sort-order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as PriceSortOrder)}
              className="bg-navy-800 text-slate-200 text-xs font-bold border border-navy-700 rounded-full px-4 py-2.5 cursor-pointer focus:outline-none focus:border-orange-500 transition-colors"
            >
              <option value="desc">Giá: Cao → Thấp</option>
              <option value="asc">Giá: Thấp → Cao</option>
            </select>
          </div>
        </div>

        {/* Feature Banner */}
        <div className="relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden group bg-navy-800 border border-amber-400/40">
          <img
            alt="Combo 5 People Banner"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-70"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBBHLkq2w3agxLq3EKWMF18Mzp9G-sSQ2glvAgw53QI0wgWsi9cuZBiF45Whc49CjZXE8EY2qW5crU__HF61oW4YhtViRiHJx8kOEoEV1nG54_n6eRazex9U2rfN48swFLnNpzn3s4Hy7YK5zfZiaMS6f3YiDltj6J-TjAseC5ShWsXX-tl7EDYlsfW9s-6bVeA8FbeTs3R-Iq9KkVdS-80x7_tIEE1JP1rrqQ20q30lOQhPWzPwswFYRS2OPUVVJIlyskvREzY5M"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-red-950/90 via-orange-950/60 to-transparent flex items-center p-6 md:p-10">
            <div className="max-w-xl space-y-4">
              <span className="inline-block bg-yellow-400 text-slate-950 px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-full">
                BEST VALUE
              </span>
              <h3 className="text-2xl md:text-4xl font-black text-white leading-tight uppercase">
                Trải Nghiệm Đại Dương Tại Gia
              </h3>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed">
                Thưởng thức trọn vẹn hương vị biển cả với các set combo được tuyển chọn khắt khe dành riêng cho nhóm 5 người.
              </p>
            </div>
          </div>
        </div>

        {/* Grid Combos */}
        {loading ? (
          <div className="flex justify-center items-center py-20 w-full col-span-full">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCombos.map((combo) => (
              <div
                key={combo.id}
                className="bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 rounded-xl overflow-hidden border border-amber-400/40 hover:border-yellow-300 hover:shadow-[0_12px_40px_rgba(239,68,68,0.35)] hover:-translate-y-1 transition-all duration-300 flex flex-col group shadow-lg holographic-card"
              >
                <Link href={`/combo/${combo.slug}`} className="relative aspect-[4/3] overflow-hidden bg-navy-900 block">
                  <img
                    alt={combo.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    src={combo.image}
                  />
                  {combo.discountBadge && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white font-extrabold px-3 py-1 rounded-full text-xs uppercase tracking-widest">
                      {combo.discountBadge}
                    </div>
                  )}
                  {combo.tag && (
                    <div className="absolute top-4 left-4 bg-slate-950 text-yellow-300 font-extrabold px-3 py-1 rounded-full text-xs uppercase tracking-widest border border-yellow-300/30">
                      {combo.tag}
                    </div>
                  )}
                </Link>
                <div className="p-5 flex flex-col flex-grow space-y-4">
                  <Link href={`/combo/${combo.slug}`}>
                    <h4 className="font-extrabold text-lg text-white group-hover:text-amber-100 transition-colors drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.3)]">
                      {combo.name}
                    </h4>
                  </Link>
                  <p className="text-amber-100 text-xs md:text-sm line-clamp-3 leading-relaxed flex-grow">
                    {combo.description}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                      {combo.showContact ? (
                        <span className="text-yellow-300 font-black text-xl md:text-2xl drop-shadow-[0_2px_5px_rgba(0,0,0,0.4)]">
                          Liên hệ
                        </span>
                      ) : (
                        <>
                          {combo.originalPrice && (
                            <span className="text-amber-200/80 line-through text-xs md:text-sm">
                              {formatPrice(combo.originalPrice)}
                            </span>
                          )}
                          <span className="text-yellow-300 font-black text-xl md:text-2xl drop-shadow-[0_2px_5px_rgba(0,0,0,0.4)]">
                            {formatPrice(combo.price || 0)}
                          </span>
                        </>
                      )}
                    </div>
                    {combo.showContact ? (
                      <a
                        href="tel:0908464818"
                        className="bg-white text-red-600 hover:bg-amber-50 hover:text-red-700 px-5 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer shadow-md active:scale-95 inline-flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">call</span>
                        Liên Hệ
                      </a>
                    ) : (
                      <button
                        onClick={() => handleOrder(combo)}
                        className="bg-white text-red-600 hover:bg-amber-50 hover:text-red-700 px-5 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer shadow-md active:scale-95"
                      >
                        Mua Ngay
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Promotion Code Section */}
      <section className="bg-navy-800 border border-navy-700 rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full -mr-32 -mt-32"></div>
        <div className="md:w-2/3 space-y-4 relative z-10">
          <h3 className="text-xl md:text-2xl font-black text-slate-100 uppercase tracking-tight">
            Ưu đãi độc quyền cho COMBO 5 NGƯỜI
          </h3>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Miễn phí giao hàng trong bán kính 10km và tặng kèm 1 chai vang trắng hảo hạng cho tất cả đơn hàng Combo trong tuần này.
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2 bg-navy-900/50 px-4 py-2 rounded-lg border border-navy-700/50 text-xs">
              <span className="material-symbols-outlined text-orange-500 text-lg select-none">local_shipping</span>
              <span className="font-extrabold text-slate-200">Freeship 10km</span>
            </div>
            <div className="flex items-center space-x-2 bg-navy-900/50 px-4 py-2 rounded-lg border border-navy-700/50 text-xs">
              <span className="material-symbols-outlined text-orange-500 text-lg select-none">wine_bar</span>
              <span className="font-extrabold text-slate-200">Tặng Vang Trắng</span>
            </div>
          </div>
        </div>
        <div className="md:w-1/3 flex justify-center relative z-10 w-full pt-4 md:pt-0">
          <div className="text-center space-y-2 w-full md:w-auto">
            <p className="text-xs text-slate-400 uppercase font-extrabold tracking-widest">
              Mã Khuyến Mãi
            </p>
            <div className="border-2 border-dashed border-orange-500/60 px-6 py-3.5 rounded-xl bg-navy-900/50">
              <span className="text-2xl font-black text-orange-500 tracking-wider">
                COMBO50
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
