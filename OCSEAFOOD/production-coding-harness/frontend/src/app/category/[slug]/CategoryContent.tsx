"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  unit: string;
  priceReference: number | string | null;
  showContact: boolean;
  isVisible: boolean;
  categoryId: number;
}

interface CategoryContentProps {
  slug: string;
}

const CATEGORY_BANNERS: Record<string, string> = {
  "cua-ghe": "https://lh3.googleusercontent.com/aida-public/AB6AXuCw0FsNUIfEqFdwlA2XXjkc1OX3Z_4TChMVrC8Il63AjzyK7Cthamul_cIIp6AVCRkS4KdyUUktW0xKE15gXNtM-4P1vReWSOLg2_o7bdA3n65p5KtM09Q3cHJHeIzBC0Tm35kcMHsjvs6G-XfjAPnxVtVsorIFyhU4XKKXPT4fHqp1gBr69GH7r8FQDpNnjkKNnA0X8-xRgqUeMCd0gbElUDElnkNKF_MG6cRUyIFYsMMvHp-DsL-dy4VbZstCBRtCV37QfabGOBw",
  "tom": "https://lh3.googleusercontent.com/aida/AP1WRLvTSABaX3o0WsO5j3M6RcEY2BvkuFuc3dW7O4I5XJ1hexOsKbsL2g9KEa6CpH_UeJcID7KvRAZDK92XfJTLocZyeZ83ENKHuHOdJrrAh1Buzrs-jqmFr5TwtgD-nxnietcyZIzLlnK1JQTy6cejds2VaXndqTGd84Vv1ozKhspMSjEUXPP2Qf7rtY13o7DiEv3f6ZcZdpv7zuuTHlfhuQyIYyjMo3wMF7j1ncVHz-Qf885hHhMN3OaKKq8",
  "ca": "https://lh3.googleusercontent.com/aida/AP1WRLsi1RZZ4Rl6aP-kqbXvKOA-Jr2RwQTvk_0KLo7E0shgqM92Ar6dWVDA9RZWR0_YcyYSokHXbxXV0_QYqwAZDQp6AaC_sjN1wqMFWnM3y33zvr7LvJyh7s0-W5pekpqma-iKwD3kIZH4YMt2j-MLU0xv43FCStCViNPt62YFeI1viG9qGH2Nsfr9djaGqppsa63K3GW0bIyg_uCt_budxjjW9zMWUDQRghm3d1koFPzzVdBiykVf3a6vNak",
  "ngheu-so-oc": "https://lh3.googleusercontent.com/aida/AP1WRLsg0fcKe4-TF3SRCrYRkJotdZQB1RxnkxaFxLoQzp8chZZ1dSRVgeXN2jd7edd1j-hmI3dNj3RjuOnd7bJZQJWNnE4W1Q03ueZD8Oq4DvEAzuV8pqb5zPxRrOr3DAvEmM_JNPXOThTO_ijSLtneqLa6PyPCu9-uAHpSzNTGJpZmyjTyVAZuU_BOLJ4g6wmAWYqUFZBPwFTiDDmqX5_5JcNS_eKY9SNmo1EjcnM4ceu1ZmKXPQebp4AbeSw",
  "bao-ngu-hau": "https://lh3.googleusercontent.com/aida/AP1WRLsg0fcKe4-TF3SRCrYRkJotdZQB1RxnkxaFxLoQzp8chZZ1dSRVgeXN2jd7edd1j-hmI3dNj3RjuOnd7bJZQJWNnE4W1Q03ueZD8Oq4DvEAzuV8pqb5zPxRrOr3DAvEmM_JNPXOThTO_ijSLtneqLa6PyPCu9-uAHpSzNTGJpZmyjTyVAZuU_BOLJ4g6wmAWYqUFZBPwFTiDDmqX5_5JcNS_eKY9SNmo1EjcnM4ceu1ZmKXPQebp4AbeSw",
};

const CATEGORY_ICONS: Record<string, string> = {
  "tom": "set_meal",
  "cua-ghe": "restaurant",
  "ca": "sailing",
  "ngheu-so-oc": "waves",
  "bao-ngu-hau": "layers",
};

export default function CategoryContent({ slug }: CategoryContentProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  // 1. Fetch categories on mount
  useEffect(() => {
    let isMounted = true;
    fetch("/api/categories")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch categories");
        return res.json();
      })
      .then((json) => {
        if (isMounted) {
          const data: Category[] = Array.isArray(json) ? json : (json.data ?? []);
          setCategories(data);
          const found = data.find((cat) => cat.slug === slug);
          if (found) {
            setActiveCategory(found);
          } else {
            // Category not found
            setLoading(false);
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // 2. Fetch products once active category is resolved
  useEffect(() => {
    if (!activeCategory) return;

    let isMounted = true;
    // Defer state updates to avoid synchronous setState inside useEffect
    Promise.resolve().then(() => {
      if (isMounted) {
        setLoading(true);
        setCurrentPage(1);
      }
    });

    fetch(`/api/products?categoryId=${activeCategory.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((json) => {
        if (isMounted) {
          const data: Product[] = Array.isArray(json) ? json : (json.data ?? []);
          setProducts(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        if (isMounted) {
          setProducts([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeCategory]);

  // Redirect to 404 if loading is complete and category doesn't exist
  if (!loading && categories.length > 0 && !activeCategory) {
    notFound();
    return null;
  }

  const getIcon = (catSlug: string) => {
    return CATEGORY_ICONS[catSlug] || "stars";
  };

  const getBanner = (catSlug: string) => {
    return CATEGORY_BANNERS[catSlug] || "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=1200";
  };

  // Filter visible products
  const visibleProducts = products.filter((p) => p.isVisible);

  // Client-side sorting
  const sortedProducts = [...visibleProducts].sort((a, b) => {
    if (sortBy === "price-asc") {
      const priceA = a.priceReference ? Number(a.priceReference) : Infinity;
      const priceB = b.priceReference ? Number(b.priceReference) : Infinity;
      return priceA - priceB;
    }
    if (sortBy === "price-desc") {
      const priceA = a.priceReference ? Number(a.priceReference) : -1;
      const priceB = b.priceReference ? Number(b.priceReference) : -1;
      return priceB - priceA;
    }
    return 0; // Default sorting (unsorted / as returned by API)
  });

  // Client-side pagination
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / itemsPerPage));
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      {activeCategory && (
        <section className="relative h-[250px] md:h-[400px] w-full flex items-center overflow-hidden border-b border-navy-700 bg-navy-950">
          <div className="absolute inset-0 z-0">
            <img
              alt={activeCategory.name}
              className="w-full h-full object-cover opacity-60"
              src={getBanner(activeCategory.slug)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent"></div>
          </div>
          <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 w-full">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/40 bg-orange-500/10 text-orange-500 text-xs font-black tracking-widest uppercase">
                <span className="material-symbols-outlined text-xs select-none">stars</span>
                Danh mục đặc sắc
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight uppercase tracking-tight">
                Hải Sản <span className="text-orange-500">{activeCategory.name}</span>
              </h1>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed font-medium">
                {activeCategory.description || `Khám phá các loại hải sản ${activeCategory.name.toLowerCase()} thượng hạng, tuyển chọn kỹ lưỡng, giao tươi sống tận nhà.`}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Area with Sidebar */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Side Navigation */}
        <aside className="lg:col-span-1 hidden lg:flex flex-col space-y-6 border-r border-navy-700/50 pr-6">
          <div>
            <h3 className="text-xs font-extrabold uppercase text-orange-500 tracking-widest">Danh mục</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Hải sản tươi sống</p>
          </div>
          <nav className="flex flex-col gap-1.5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-extrabold tracking-widest uppercase transition-all duration-200 border ${
                  cat.slug === slug
                    ? "bg-navy-800 border-orange-500/50 text-orange-500 translate-x-1"
                    : "bg-navy-900 border-transparent text-slate-400 hover:bg-navy-800 hover:text-slate-200"
                }`}
              >
                <span className="material-symbols-outlined text-lg select-none">
                  {getIcon(cat.slug)}
                </span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-4 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-navy-700/50 pb-4">
            <h2 className="text-lg md:text-xl font-black uppercase text-slate-100 tracking-tight">
              Sản phẩm đang kinh doanh
            </h2>
            <div className="flex gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-navy-800 border border-navy-700 text-slate-300 rounded-lg px-4 py-2 text-xs font-extrabold tracking-wider uppercase focus:ring-1 focus:ring-orange-500 outline-none cursor-pointer"
              >
                <option value="default">Sắp xếp: Phổ biến nhất</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, idx) => (
                <div
                  key={idx}
                  className="bg-navy-800 rounded-lg overflow-hidden border border-navy-700 p-4 space-y-4 animate-pulse"
                >
                  <div className="aspect-square bg-navy-900 rounded-md"></div>
                  <div className="h-4 bg-navy-700 rounded w-3/4"></div>
                  <div className="h-3 bg-navy-700 rounded w-1/2"></div>
                  <div className="h-6 bg-navy-700 rounded w-1/3 pt-2"></div>
                  <div className="h-10 bg-navy-700 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-navy-800 rounded-lg border border-navy-700/50">
              <span className="material-symbols-outlined text-5xl text-slate-500 mb-4 select-none">
                inbox
              </span>
              <p className="text-slate-400 font-medium">Không tìm thấy sản phẩm nào trong danh mục này.</p>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-10 h-10 flex items-center justify-center rounded border border-navy-700 text-slate-400 hover:bg-navy-800 hover:text-orange-500 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <span className="material-symbols-outlined select-none">chevron_left</span>
              </button>
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-10 h-10 flex items-center justify-center rounded font-extrabold text-xs transition-colors cursor-pointer ${
                    currentPage === idx + 1
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                      : "border border-navy-700 text-slate-400 hover:bg-navy-800 hover:text-slate-200"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-10 h-10 flex items-center justify-center rounded border border-navy-700 text-slate-400 hover:bg-navy-800 hover:text-orange-500 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <span className="material-symbols-outlined select-none">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Trust Badges */}
      <section className="bg-navy-950 py-16 border-t border-b border-navy-800">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="flex flex-col items-center text-center space-y-4">
            <span className="material-symbols-outlined text-orange-500 text-[48px] select-none">verified</span>
            <h4 className="text-base font-extrabold text-slate-100 uppercase tracking-widest">100% Tươi Sống</h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs font-medium">
              Cam kết giao sống tận tay khách hàng trong khu vực nội thành.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <span className="material-symbols-outlined text-orange-500 text-[48px] select-none">local_shipping</span>
            <h4 className="text-base font-extrabold text-slate-100 uppercase tracking-widest">Giao Hàng Nhanh</h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs font-medium">
              Giao nhanh trong 2h đối với khu vực TP.HCM và Hà Nội.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <span className="material-symbols-outlined text-orange-500 text-[48px] select-none">restaurant</span>
            <h4 className="text-base font-extrabold text-slate-100 uppercase tracking-widest">Chế Biến Miễn Phí</h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs font-medium">
              Hỗ trợ làm sạch và chế biến theo menu yêu cầu từ đầu bếp 5 sao.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <span className="material-symbols-outlined text-orange-500 text-[48px] select-none">support_agent</span>
            <h4 className="text-base font-extrabold text-slate-100 uppercase tracking-widest">Hỗ Trợ 24/7</h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs font-medium">
              Đội ngũ chăm sóc khách hàng luôn sẵn sàng phục vụ mọi lúc.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
