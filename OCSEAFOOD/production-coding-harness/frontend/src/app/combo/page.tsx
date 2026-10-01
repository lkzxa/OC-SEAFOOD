"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { Combo, ComboApiResponse, mapApiCombo } from "@/data/combos";
import { sortByPrice, PriceSortOrder } from "@/utils/sortByPrice";
import RelatedPostsSection from "@/components/RelatedPostsSection";
import { optimizeImageUrl } from "@/utils/cloudinaryImage";
import { OFFICIAL_PHONE_TEL } from "@/constants/contact";
import LoadingState from "@/components/LoadingState";
import StatusPanel from "@/components/StatusPanel";

export default function ComboPage() {
  const { addItem } = useCart();
  const [combosList, setCombosList] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [requestVersion, setRequestVersion] = useState(0);
  const [sortOrder, setSortOrder] = useState<PriceSortOrder>("desc");

  useEffect(() => {
    async function fetchCombos() {
      try {
        const res = await fetch("/api/combos");
        if (!res.ok) throw new Error("Combo service unavailable");
        const json = await res.json();
        const data = Array.isArray(json) ? json : (json.data ?? []);
        setCombosList((data as ComboApiResponse[]).map(mapApiCombo));
        setLoadError(false);
      } catch (err) {
        console.error("Failed to fetch combos from backend:", err);
        setCombosList([]);
        setLoadError(true);
      }
    }
    void Promise.resolve().then(() => setLoading(true));
    fetchCombos().finally(() => setLoading(false));
  }, [requestVersion]);

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
        <div className="relative group aspect-square">
          <div className="absolute -inset-4 bg-orange-500/10 blur-3xl group-hover:bg-orange-500/20 transition-all duration-700"></div>
          <Image
            alt="Combo Tiệc Hải Sản Cao Cấp OCSEAFOOD"
            className="z-10 object-cover rounded-xl shadow-2xl border border-navy-700"
            fill
            sizes="(max-width: 1023px) 100vw, 50vw"
            src="/Banner.png"
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
          <Image
            alt="Combo 5 People Banner"
            className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-70"
            fill
            sizes="100vw"
            src="/Banner.png"
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
        {loadError ? (
          <StatusPanel
            announce="assertive"
            compact
            description="Không thể kết nối bảng giá combo mới nhất. Vui lòng thử lại trước khi đặt hàng."
            eyebrow="Dịch vụ tạm thời gián đoạn"
            icon="cloud_off"
            onPrimaryAction={() => setRequestVersion((value) => value + 1)}
            primaryLabel="Thử tải lại"
            secondaryHref="/menu"
            secondaryLabel="Xem thực đơn"
            title="Chưa thể tải combo"
          />
        ) : loading ? (
          <LoadingState compact label="Đang tải danh sách combo..." />
        ) : sortedCombos.length === 0 ? (
          <StatusPanel
            compact
            description="Các gói combo đang được cập nhật. Bạn có thể chọn sản phẩm riêng trong thực đơn."
            eyebrow="Combo đang cập nhật"
            icon="restaurant_menu"
            primaryHref="/menu"
            primaryLabel="Xem thực đơn"
            title="Chưa có combo"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCombos.map((combo) => (
              <div
                key={combo.id}
                className="rounded-xl overflow-hidden border border-amber-400/70 bg-orange-500 hover:border-amber-300 hover:shadow-[0_16px_45px_rgba(249,115,22,0.28)] hover:-translate-y-1 transition-all duration-300 flex flex-col group shadow-lg holographic-card"
              >
                <Link href={`/combo/${combo.slug}`} className="relative aspect-[4/3] overflow-hidden bg-navy-900 block">
                  <Image
                    alt={combo.name}
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    fill
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                    src={optimizeImageUrl(combo.image, 600)}
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
                <div className="bg-gradient-to-br from-orange-500 via-orange-500 to-amber-400 p-5 flex flex-col flex-grow space-y-4">
                  <Link href={`/combo/${combo.slug}`}>
                    <h3 className="font-extrabold text-lg text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] transition-colors">
                      {combo.name}
                    </h3>
                  </Link>
                  <p className="text-white/90 text-xs md:text-sm line-clamp-3 leading-relaxed flex-grow">
                    {combo.description}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                      {combo.originalPrice && (
                        <span className="text-white/70 line-through text-xs md:text-sm">
                          {formatPrice(combo.originalPrice)}
                        </span>
                      )}
                      <span className="text-yellow-300 font-black text-xl md:text-2xl drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]">
                        {combo.showContact ? `Từ ${formatPrice(combo.price || 0)}` : formatPrice(combo.price || 0)}
                      </span>
                    </div>
                    {combo.showContact ? (
                      <a
                        href={OFFICIAL_PHONE_TEL}
                        className="bg-white text-red-600 hover:bg-amber-50 hover:text-red-700 px-5 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer shadow-[0_6px_18px_rgba(0,0,0,0.18)] active:scale-95 inline-flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">call</span>
                        Liên Hệ
                      </a>
                    ) : (
                      <button
                        onClick={() => handleOrder(combo)}
                        className="bg-white text-red-600 hover:bg-amber-50 hover:text-red-700 px-5 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer shadow-[0_6px_18px_rgba(0,0,0,0.18)] active:scale-95"
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

      <RelatedPostsSection />
    </div>
  );
}
