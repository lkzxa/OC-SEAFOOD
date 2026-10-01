"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import RelatedPostsSection from "@/components/RelatedPostsSection";
import { removeVietnameseTones } from "@/utils/stringUtils";
import { sortByPrice, PriceSortOrder } from "@/utils/sortByPrice";
import { optimizeImageUrl } from "@/utils/cloudinaryImage";
import LoadingState from "@/components/LoadingState";
import StatusPanel from "@/components/StatusPanel";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  banner?: string | null;
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

function MenuContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("categoryId");
  // BUG-015 fix: read search param from URL
  const searchParam = searchParams.get("search") || "";
  const sortParam = searchParams.get("sort");

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [requestVersion, setRequestVersion] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<PriceSortOrder>(
    sortParam === "price_asc" ? "asc" : "desc"
  );

  const activeCategory = categories.find((cat) => cat.id === selectedCategoryId);

  // Sync selectedCategoryId with URL search params
  useEffect(() => {
    if (categoryParam) {
      const parsed = parseInt(categoryParam, 10);
      if (!isNaN(parsed)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedCategoryId(parsed);
      } else {
        setSelectedCategoryId(null);
      }
    } else {
      setSelectedCategoryId(null);
    }
  }, [categoryParam]);

  // Sync sortOrder with URL search params
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSortOrder(sortParam === "price_asc" ? "asc" : "desc");
  }, [sortParam]);

  // Fetch categories once on mount
  useEffect(() => {
    let isMounted = true;
    void Promise.resolve().then(() => {
      if (isMounted) {
        setLoadingCategories(true);
        setLoadError(false);
      }
    });
    fetch("/api/categories")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch categories");
        return res.json();
      })
      .then((json) => {
        if (isMounted) {
          // API returns { data: [...], pagination: {...} }
          const data = Array.isArray(json) ? json : (json.data ?? []);
          setCategories(data);
          setLoadingCategories(false);
        }
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        if (isMounted) {
          setCategories([]);
          setLoadError(true);
          setLoadingCategories(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [requestVersion]);

  // Fetch products when selectedCategoryId changes
  useEffect(() => {
    let isMounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingProducts(true);
    setLoadError(false);

    const url = selectedCategoryId
      ? `/api/products?categoryId=${selectedCategoryId}`
      : "/api/products";

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((json) => {
        if (isMounted) {
          // API returns { data: [...], pagination: {...} }
          const data = Array.isArray(json) ? json : (json.data ?? []);
          setProducts(data);
          setLoadingProducts(false);
        }
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        if (isMounted) {
          setProducts([]);
          setLoadError(true);
          setLoadingProducts(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategoryId, requestVersion]);

  const handleCategorySelect = (id: number | null) => {
    setSelectedCategoryId(id);
    const params = new URLSearchParams();
    if (id) params.set("categoryId", String(id));
    if (searchParam) params.set("search", searchParam);
    if (sortOrder === "asc") params.set("sort", "price_asc");
    const query = params.toString();
    router.push(query ? `/menu?${query}` : "/menu");
  };

  const handleSortChange = (order: PriceSortOrder) => {
    setSortOrder(order);
    const params = new URLSearchParams();
    if (selectedCategoryId) params.set("categoryId", String(selectedCategoryId));
    if (searchParam) params.set("search", searchParam);
    if (order === "asc") params.set("sort", "price_asc");
    const query = params.toString();
    router.push(query ? `/menu?${query}` : "/menu");
  };

  // Apply search filter client-side
  const normalizedSearchParam = removeVietnameseTones(searchParam);
  const visibleProducts = sortByPrice(
    products
      .filter((p) => p.isVisible)
      .filter((p) => {
        if (!searchParam) return true;
        const normalizedName = removeVietnameseTones(p.name);
        return normalizedName.includes(normalizedSearchParam);
      }),
    (p) =>
      p.showContact || !p.priceReference || Number(p.priceReference) <= 0
        ? null
        : Number(p.priceReference),
    sortOrder
  );

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-8">
      {/* PAGE HEADER */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-slate-100 mb-2">
          Thực Đơn <span className="text-orange-500">OCSEAFOOD</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl">
          Khám phá thế giới hải sản tươi sống chất lượng cao được tuyển chọn kỹ lưỡng, giao tận nơi trong ngày.
        </p>
      </div>

      {/* SEARCH RESULTS FEEDBACK */}
      {searchParam && (
        <div className="mb-6 bg-navy-800 border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.1)] p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-slate-300">
            Kết quả tìm kiếm cho: <strong className="text-orange-500">&ldquo;{searchParam}&rdquo;</strong>
            <span className="text-slate-400 ml-2">({visibleProducts.length} sản phẩm)</span>
          </p>
          <button 
            onClick={() => {
              const url = selectedCategoryId ? `/menu?categoryId=${selectedCategoryId}` : '/menu';
              router.push(url);
            }}
            className="text-xs font-bold text-slate-400 hover:text-white transition-colors bg-navy-700 hover:bg-navy-600 px-4 py-2 rounded-md flex items-center justify-center gap-1.5 cursor-pointer w-fit"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
            Xóa tìm kiếm
          </button>
        </div>
      )}

      {/* CATEGORY TABS */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-3 border-b border-navy-700/50">
          <div className="flex overflow-x-auto gap-3 scrollbar-thin scrollbar-thumb-navy-700 scrollbar-track-transparent">
            <button
              onClick={() => handleCategorySelect(null)}
              className={`px-6 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${
                selectedCategoryId === null
                  ? "bg-orange-500 text-navy-950 shadow-lg shadow-orange-500/20"
                  : "bg-navy-800 text-slate-300 hover:bg-navy-700 hover:text-orange-500 border border-navy-700"
              }`}
            >
              Tất cả
            </button>

            {loadingCategories ? (
              <div className="flex items-center gap-2 px-4 py-2 text-xs text-slate-400">
                <span className="animate-pulse">Đang tải danh mục...</span>
              </div>
            ) : (
              categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`px-6 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategoryId === cat.id
                      ? "bg-orange-500 text-navy-950 shadow-lg shadow-orange-500/20"
                      : "bg-navy-800 text-slate-300 hover:bg-navy-700 hover:text-orange-500 border border-navy-700"
                  }`}
                >
                  {cat.name}
                </button>
              ))
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="sort-order" className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
              Sắp xếp
            </label>
            <select
              id="sort-order"
              value={sortOrder}
              onChange={(e) => handleSortChange(e.target.value as PriceSortOrder)}
              className="bg-navy-800 text-slate-200 text-xs font-bold border border-navy-700 rounded-full px-4 py-2.5 cursor-pointer focus:outline-none focus:border-orange-500 transition-colors"
            >
              <option value="desc">Giá: Cao → Thấp</option>
              <option value="asc">Giá: Thấp → Cao</option>
            </select>
          </div>
        </div>
      </div>

      {/* PRODUCTS GRID */}
      {loadError ? (
        <StatusPanel
          announce="assertive"
          compact
          description="Không thể kết nối thực đơn lúc này. Vui lòng thử lại để nhận dữ liệu sản phẩm mới nhất."
          eyebrow="Dịch vụ tạm thời gián đoạn"
          icon="cloud_off"
          onPrimaryAction={() => setRequestVersion((value) => value + 1)}
          primaryLabel="Thử tải lại"
          secondaryHref="/"
          secondaryLabel="Về trang chủ"
          title="Chưa thể tải thực đơn"
        />
      ) : loadingProducts ? (
        <LoadingState compact label="Đang tải thực đơn hải sản..." />
      ) : visibleProducts.length > 0 ? (
        <div className="space-y-6">
          {activeCategory?.banner && (
            <div className="relative h-[120px] sm:h-[180px] md:h-[240px] w-full rounded-xl overflow-hidden border border-navy-700/50 shadow-lg">
              <Image
                src={optimizeImageUrl(activeCategory.banner, 1600)}
                alt={`Banner ${activeCategory.name}`}
                className="object-cover"
                fill
                sizes="(max-width: 767px) 100vw, 1600px"
              />
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} headingLevel="h2" />
            ))}
          </div>
        </div>
      ) : (
        <StatusPanel
          compact
          description={searchParam
            ? `Không có sản phẩm nào khớp với từ khóa “${searchParam}”. Hãy thử một tên hải sản khác.`
            : "Nhóm sản phẩm này đang được cập nhật. Bạn có thể xem combo hoặc chọn danh mục khác."}
          eyebrow={searchParam ? "Không có kết quả phù hợp" : "Danh mục đang cập nhật"}
          icon={searchParam ? "search_off" : "inventory_2"}
          onPrimaryAction={searchParam ? () => router.push(selectedCategoryId ? `/menu?categoryId=${selectedCategoryId}` : "/menu") : undefined}
          primaryHref={searchParam ? undefined : "/combo"}
          primaryLabel={searchParam ? "Xóa tìm kiếm" : "Xem combo"}
          title={searchParam ? "Không tìm thấy sản phẩm" : "Chưa có sản phẩm"}
        />
      )}

      <RelatedPostsSection />
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <LoadingState label="Đang chuẩn bị thực đơn..." />
      }
    >
      <MenuContent />
    </Suspense>
  );
}
