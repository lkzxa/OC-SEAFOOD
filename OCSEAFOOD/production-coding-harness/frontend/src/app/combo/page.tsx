"use client";

import { useCart } from "@/hooks/useCart";

interface Combo {
  id: number;
  name: string;
  description: string;
  originalPrice?: number;
  price: number;
  image: string;
  tag?: string;
  discountBadge?: string;
}

const COMBOS: Combo[] = [
  {
    id: 9001,
    name: "Combo Hải Sản Hoàng Gia",
    description: "Set bao gồm: King Crab (1.5kg), 2 Tôm Hùm Canada, 5 Bào Ngư Hàn Quốc, Sò Điệp Nhật áp chảo.",
    originalPrice: 7500000,
    price: 6350000,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCf7a6RxEO1vB73aKYmRIRDah7wSPW-C1gGL5-XkJU5jbKr0nbysvyD-C5AMGkjg0itfZKd2Z4PXgcO3csDHbrnfuBeW7vxuxR2iAR79v64Z0--2KOiwUqszSqc3ubtgmXmMDDeYRfa8AeBsd6wiQjyAjhChyYyBv2Mx-dEwqt4QsU-FNVv5L1GShmqEU_qJc6t1uPXLgtisHjTGpFiNwt9H8qd_nZGRgYr998yTdWfH01vI8xvzjQVNhBgH0CcWomu1RuCz_JvhJ0",
    discountBadge: "-15%",
  },
  {
    id: 9002,
    name: "Set Lẩu Hải Sản Đại Dương",
    description: "Nước dùng lẩu đặc biệt, 1kg Tôm Càng, Mực lá, Ngao hai cồi, Cá hồi Nauy, Rau nấm đi kèm.",
    price: 2890000,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHnBDbiAYEdjJ5rd06Icy6xWoxw8t37Uqtfw447_WshQ20keFiFR2brdjaBNR-v7v7cSQ-mBTH03RkYsR2xk8qpYe2DUBDlhlaBk_ns3ET8_gXZuvYjge8wa_do8FUph04YFiFkLYS2svjd8z-rI4K9FNmm1L2pC9szu_EPUBNSoHanuuXUTWXPgbXu47FaWGyFdmXBxiKZXUgigDLvTlCwqT40i1RhUVjzBvW6cgrB_DucrCwZvxHzql6EVbARQakJKkoV_QUJt4",
    tag: "POPULAR",
  },
  {
    id: 9003,
    name: "Combo Nướng BBQ Special",
    description: "10 Tôm Sú nướng muối ớt, Mực trứng nướng sa tế, 10 Hàu mỡ hành, Bạch tuộc sốt cay.",
    price: 1950000,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBWROMU8tRJjSla2O1w_YNEbcFzMb4pGK01OXsgmyhz6EK7nSmm9tuW1XoRvwfCryte0lYV-yU3BG5FNSF7mZgAoDywbQbDsH3Zz51xFp8rBYo7FWb_Rg85KiuitBQjBWjDHv8v9paTbGJV5er5rg6swCtq2cNLBdv792g4RyHHOX6Ge7IJvMlaNqdMYSWnxTMvHgjAR5WE5X4QOQ4-owM7b0AmtEBXj0jXUT9UbJCKisD7habqtRE2NjSZyWC43Q1uGJK0CgrKgQc",
  },
  {
    id: 9004,
    name: "Set Sashimi Thượng Hạng",
    description: "Cá hồi Nauy, Cá trích ép trứng, Sò đỏ Nhật, Bạch tuộc, Tôm ngọt Amaebi (Dành cho 5 khách).",
    price: 3450000,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1hcEW7Y6VFVrcWBFhM7XBe-M6pid0MIL2A4bsdbNQP4ahWXlVPyqWTYMg_2SUY6gxxoqTfvmscwXR_xHy_H6E3n9rAYKlg6eAIOQeBFejhBeYBkJO-FBQXuS3MJO9liB7cXby8cFgy2NkbjvIaNw_Mo6Ut8ksvYn5O6m1SjrMmYqP20L3_jaOQBoRo31sOPXDEbq9Z1S76tTChDffs5KFrKIwuBoYNuTi_AFssrgR7sKkm9FKbGyrrgvGEddVrzhel9yx3NlYI8s",
  },
  {
    id: 9005,
    name: "Combo Cua Cà Mau Sốt",
    description: "3 Cua Cà Mau lớn (800g/con) sốt Trứng muối hoặc sốt Singapore, kèm bánh mì nóng giòn.",
    price: 2200000,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDsIEm9JE51ckFL8T11IKcVqVUjwo3Hvx50t4_Sgx2Tl3zmakRCgVzJ6eCtojatljmrRJli-Nw3uF3sonxCxxaoxikYrmyoUX1Kv-Zacn0NarhNndOlaN5zSP268pPD6kS_-pd1o741S0da5Q380r70kFmOh1CqZjW7h4YARWlku-jkzXAEHJLmbAHi8TB646NhijBu1DR3znQ-Lzr7XyNK9fLzqiKIsFwsMpT2_Techq4_FupmQPZ1RriJzQSVAL56o76-rwRdJSo",
  },
  {
    id: 9006,
    name: "Set Nghêu Sò Toàn Diện",
    description: "Ốc hương cháy tỏi, Ngao hai cồi hấp sả, Sò dương nướng mỡ hành, Ốc móng tay xào rau muống.",
    price: 1680000,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDTBlWqWPDBWt2EjjpKWQp3x1SXsSAdGspaFJnE2uORAZq6vbJGJHlLbOvzDUfPsf8395e6ePT1dwkYECkMuHV8vaLROPZZxzMBiccXVZ7YZeBOTvOxiygWRcQfJkymgJQRoOmtnescNNHoOMTq0b32UZlYqA5PBn7B17wijIQQ-XJWFrastx9q1u6-sXBEDtxQ7eBlXg4t1oC2GuPIoBB3T-eDKbO4HJDa07MnG08tYVHuZhZYZR1969ZQv2GCIUWHiJfKhKFEI5o",
  },
];

export default function ComboPage() {
  const { addItem } = useCart();

  const handleOrder = (combo: Combo) => {
    addItem({
      id: combo.id,
      name: combo.name,
      priceReference: combo.price,
      image: combo.image,
      unit: "set",
    }, 1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price).replace(/\s/g, "");
  };

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
            alt="Premium Seafood OCSEAFOOD"
            className="relative z-10 w-full aspect-square object-cover rounded-xl shadow-2xl border border-navy-700"
            src="https://images.unsplash.com/photo-1534080391025-09795d197a5b?w=800"
          />
        </div>
      </section>

      {/* Main Combos Area */}
      <section className="space-y-8">
        <div className="border-b border-navy-700 pb-4">
          <h2 className="text-2xl md:text-3xl font-black uppercase text-slate-100 tracking-tight">
            COMBO 5 NGƯỜI
          </h2>
        </div>

        {/* Feature Banner */}
        <div className="relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden group bg-navy-800 border border-navy-700">
          <img
            alt="Combo 5 People Banner"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-70"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBBHLkq2w3agxLq3EKWMF18Mzp9G-sSQ2glvAgw53QI0wgWsi9cuZBiF45Whc49CjZXE8EY2qW5crU__HF61oW4YhtViRiHJx8kOEoEV1nG54_n6eRazex9U2rfN48swFLnNpzn3s4Hy7YK5zfZiaMS6f3YiDltj6J-TjAseC5ShWsXX-tl7EDYlsfW9s-6bVeA8FbeTs3R-Iq9KkVdS-80x7_tIEE1JP1rrqQ20q30lOQhPWzPwswFYRS2OPUVVJIlyskvREzY5M"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-950/40 to-transparent flex items-center p-6 md:p-10">
            <div className="max-w-xl space-y-4">
              <span className="inline-block bg-orange-500 text-white px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-full">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COMBOS.map((combo) => (
            <div
              key={combo.id}
              className="bg-navy-800 rounded-xl overflow-hidden border border-navy-700 flex flex-col hover:border-orange-500/50 hover:translate-y-[-4px] transition-all duration-300 group shadow-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-navy-900">
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
                  <div className="absolute top-4 left-4 bg-orange-500 text-white font-extrabold px-3 py-1 rounded-full text-xs uppercase tracking-widest">
                    {combo.tag}
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-grow space-y-4">
                <h4 className="font-bold text-lg text-slate-100 group-hover:text-orange-500 transition-colors">
                  {combo.name}
                </h4>
                <p className="text-slate-400 text-xs md:text-sm line-clamp-3 leading-relaxed flex-grow">
                  {combo.description}
                </p>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-col">
                    {combo.originalPrice && (
                      <span className="text-slate-500 line-through text-xs md:text-sm">
                        {formatPrice(combo.originalPrice)}
                      </span>
                    )}
                    <span className="text-amber-400 font-black text-lg md:text-xl">
                      {formatPrice(combo.price)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleOrder(combo)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    Mua Ngay
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
