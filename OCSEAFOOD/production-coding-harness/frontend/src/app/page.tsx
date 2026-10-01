import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import AnnouncementModal from "@/components/AnnouncementModal";
import RelatedPostsSection from "@/components/RelatedPostsSection";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/data/mockData";
import { sortByPrice } from "@/utils/sortByPrice";
import { optimizeImageUrl } from "@/utils/cloudinaryImage";

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
  categoryIds?: number[];
}

async function getCategories(): Promise<Category[]> {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
  try {
    const res = await fetch(`${backendUrl}/categories`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return MOCK_CATEGORIES;
    const json = await res.json();
    const data = Array.isArray(json) ? json : (json.data ?? []);
    return data.length > 0 ? data : MOCK_CATEGORIES;
  } catch {
    return MOCK_CATEGORIES;
  }
}

async function getProducts(): Promise<Product[]> {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
  try {
    const res = await fetch(`${backendUrl}/products`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return MOCK_PRODUCTS;
    const json = await res.json();
    const data = Array.isArray(json) ? json : (json.data ?? []);
    return data.length > 0 ? data : MOCK_PRODUCTS;
  } catch {
    return MOCK_PRODUCTS;
  }
}

interface PublicSettings {
  HOMEPAGE_ANNOUNCEMENT_ENABLED: boolean;
  HOMEPAGE_ANNOUNCEMENT_CONTENT: string;
}

async function getPublicSettings(): Promise<PublicSettings> {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
  try {
    const res = await fetch(`${backendUrl}/settings/public`, {
      cache: "no-store",
    });
    if (!res.ok) return { HOMEPAGE_ANNOUNCEMENT_ENABLED: false, HOMEPAGE_ANNOUNCEMENT_CONTENT: "" };
    return await res.json();
  } catch {
    return { HOMEPAGE_ANNOUNCEMENT_ENABLED: false, HOMEPAGE_ANNOUNCEMENT_CONTENT: "" };
  }
}

// Curated best-sellers shown at the top of the homepage, by slug
const BEST_SELLER_SLUGS = ["cua-king-do-nauy", "tom-hum-alaska", "bao-ngu-uc-ngoc-bich", "ca-bon-vang"];

export default async function Home() {
  const [categories, products, publicSettings] = await Promise.all([
    getCategories(),
    getProducts(),
    getPublicSettings(),
  ]);

  const bestSellers = BEST_SELLER_SLUGS
    .map((slug) => products.find((p) => p.slug === slug && p.isVisible))
    .filter((p): p is Product => Boolean(p));

  // Group products by category (supports many-to-many categoryIds), highest price first
  const productsByCategory = categories.reduce((acc, cat) => {
    const categoryProducts = products.filter(p => {
      const belongs = p.categoryIds
        ? p.categoryIds.includes(cat.id)
        : p.categoryId === cat.id;
      return belongs && p.isVisible;
    });
    acc[cat.id] = sortByPrice(
      categoryProducts,
      (p) => (p.showContact || !p.priceReference || Number(p.priceReference) <= 0 ? null : Number(p.priceReference)),
      "desc"
    ).slice(0, 4);
    return acc;
  }, {} as Record<number, Product[]>);

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">
      {/* HERO SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-12">
        {/* Sidebar Menu (Desktop) */}
        <aside className="hidden lg:block lg:col-span-1 bg-navy-800 rounded-lg overflow-hidden border border-navy-700 h-fit">
          <div className="bg-orange-500 px-4 py-3">
            <div className="text-sm font-extrabold flex items-center gap-2 text-navy-950">
              <span className="material-symbols-outlined text-lg select-none">menu</span>
              DANH MỤC SẢN PHẨM
            </div>
          </div>
          <ul className="flex flex-col">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <li key={cat.id} className="border-b border-navy-700/50 hover:bg-navy-700 transition-colors">
                  <Link
                    className="flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-200 hover:text-orange-500 transition-colors"
                    href={`/menu?categoryId=${cat.id}`}
                  >
                    {cat.name}
                    <span className="material-symbols-outlined text-xs select-none">chevron_right</span>
                  </Link>
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-sm text-slate-400">Đang tải danh mục...</li>
            )}
          </ul>
        </aside>

        {/* Hero Content Area */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Main Banner */}
          <div className="relative rounded-lg overflow-hidden h-[300px] md:h-[450px] bg-navy-800">
            <Image
              alt="Premium Seafood"
              className="object-cover"
              fill
              sizes="(max-width: 1023px) 100vw, 80vw"
              preload
              src="/Banner.png"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/20 to-transparent flex flex-col justify-end p-8 md:p-12">
              <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight uppercase text-white leading-tight">
                HẢI SẢN <br />
                <span className="text-orange-500">Thượng Hạng</span>
              </h1>
              <p className="text-slate-300 mb-6 max-w-xl hidden md:block">
                Chất lượng loại 1, cam kết tươi sống mỗi ngày từ những vùng biển tinh khiết nhất thế giới.
              </p>
              <Link
                href="/menu"
                className="bg-orange-500 hover:bg-orange-400 text-navy-950 font-bold px-8 py-3 w-fit rounded transition-all uppercase tracking-widest text-sm text-center"
              >
                Xem Thực Đơn
              </Link>
            </div>
          </div>

          {/* Sub-banners */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 md:h-40 rounded-lg overflow-hidden relative group">
              <Image
                alt="Special Combo"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                fill
                sizes="(max-width: 767px) 100vw, 50vw"
                src="/Banner.png"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center p-6">
                <h2 className="text-white font-extrabold text-xl">
                  COMBO TIỆC <br />
                  <span className="text-amber-400">GIẢM 20%</span>
                </h2>
              </div>
            </div>
            <div className="h-32 md:h-40 rounded-lg overflow-hidden relative group">
              <Image
                alt="Sashimi"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                fill
                sizes="(max-width: 767px) 100vw, 50vw"
                src="/recruitment_banner.png"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center p-6">
                <h2 className="text-white font-extrabold text-xl">
                  THỦY CUNG <br />
                  <span className="text-amber-400">GIỮA LÒNG SÀI GÒN</span>
                </h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      {bestSellers.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6 border-b border-navy-700 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 text-slate-100">
              <span className="w-2 h-8 bg-orange-500"></span> Sản Phẩm Bán Chạy
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* DYNAMIC PRODUCT SECTIONS */}
      {categories.map((cat) => {
        const catProducts = productsByCategory[cat.id] || [];
        if (catProducts.length === 0) return null;

        return (
          <section key={cat.id} className="mb-16">
            <div className="flex items-center justify-between mb-6 border-b border-navy-700 pb-4">
              <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 text-slate-100">
                <span className="w-2 h-8 bg-orange-500"></span> {cat.name}
              </h2>
              <Link
                className="text-sm font-bold text-slate-400 hover:text-orange-500 transition-colors"
                href={`/menu?categoryId=${cat.id}`}
              >
                Xem tất cả →
              </Link>
            </div>
            {cat.banner && (
              <div className="mb-6 relative h-[120px] sm:h-[180px] md:h-[240px] w-full rounded-xl overflow-hidden border border-navy-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                <Image
                  src={optimizeImageUrl(cat.banner, 1600)}
                  alt={`Banner ${cat.name}`}
                  className="object-cover transition-transform duration-700 hover:scale-[1.02]"
                  fill
                  sizes="(max-width: 767px) 100vw, 1600px"
                />
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {catProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );
      })}

      <RelatedPostsSection />

      <AnnouncementModal
        enabled={publicSettings.HOMEPAGE_ANNOUNCEMENT_ENABLED}
        content={publicSettings.HOMEPAGE_ANNOUNCEMENT_CONTENT}
      />
    </div>
  );
}
