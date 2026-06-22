"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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

function MenuContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("categoryId");
  // BUG-015 fix: read search param from URL
  const searchParam = searchParams.get("search") || "";

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

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

  // Fetch categories once on mount
  useEffect(() => {
    let isMounted = true;
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
          setLoadingCategories(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch products when selectedCategoryId changes
  useEffect(() => {
    let isMounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingProducts(true);

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
          setLoadingProducts(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategoryId]);

  const handleCategorySelect = (id: number | null) => {
    setSelectedCategoryId(id);
    if (id) {
      router.push(`/menu?categoryId=${id}`);
    } else {
      router.push("/menu");
    }
  };

  // Apply search filter client-side
  const visibleProducts = products
    .filter((p) => p.isVisible)
    .filter((p) =>
      searchParam
        ? p.name.toLowerCase().includes(searchParam.toLowerCase())
        : true
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

      {/* CATEGORY TABS */}
      <div className="mb-10">
        <div className="flex overflow-x-auto gap-3 pb-3 border-b border-navy-700/50 scrollbar-thin scrollbar-thumb-navy-700 scrollbar-track-transparent">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`px-6 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${
              selectedCategoryId === null
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
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
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "bg-navy-800 text-slate-300 hover:bg-navy-700 hover:text-orange-500 border border-navy-700"
                }`}
              >
                {cat.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* PRODUCTS GRID */}
      {loadingProducts ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(8)].map((_, idx) => (
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
      ) : visibleProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {visibleProducts.map((product) => (
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
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-20 text-center text-slate-400 animate-pulse">
          Đang tải thực đơn...
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
