import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import AnnouncementModal from "@/components/AnnouncementModal";

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

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/categories`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    // API returns { data: [...], pagination: {...} }
    return Array.isArray(json) ? json : (json.data ?? []);
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    return [];
  }
}

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/products`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    // API returns { data: [...], pagination: {...} }
    return Array.isArray(json) ? json : (json.data ?? []);
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return [];
  }
}

interface PublicSettings {
  HOMEPAGE_ANNOUNCEMENT_ENABLED: boolean;
  HOMEPAGE_ANNOUNCEMENT_CONTENT: string;
}

async function getPublicSettings(): Promise<PublicSettings> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/settings/public`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { HOMEPAGE_ANNOUNCEMENT_ENABLED: false, HOMEPAGE_ANNOUNCEMENT_CONTENT: "" };
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch public settings:", err);
    return { HOMEPAGE_ANNOUNCEMENT_ENABLED: false, HOMEPAGE_ANNOUNCEMENT_CONTENT: "" };
  }
}

export default async function Home() {
  const [categories, products, publicSettings] = await Promise.all([
    getCategories(),
    getProducts(),
    getPublicSettings(),
  ]);

  // Group products by category
  const productsByCategory = categories.reduce((acc, cat) => {
    acc[cat.id] = products.filter(p => p.categoryId === cat.id && p.isVisible).slice(0, 4);
    return acc;
  }, {} as Record<number, Product[]>);

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">
      {/* HERO SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-12">
        {/* Sidebar Menu (Desktop) */}
        <aside className="hidden lg:block lg:col-span-1 bg-navy-800 rounded-lg overflow-hidden border border-navy-700 h-fit">
          <div className="bg-orange-500 px-4 py-3">
            <h3 className="text-sm font-extrabold flex items-center gap-2 text-white">
              <span className="material-symbols-outlined text-lg select-none">menu</span>
              DANH MỤC SẢN PHẨM
            </h3>
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
            <img
              alt="Premium Seafood"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiEkaVOEBU_WihJZDiPItG_VlnNf06Yvnt-pzsWIPvIBECzm4XIre9_MstDdKO-thYFq93HgHu229kqzxK6U3TPqHtyKuzgHwZLhUkSlskrTnvITjPWqSu-dV2Bi1IvEAV3tAVNP-tMWm17VNDxQt8mokqpedwFLJoW5ODnz4_b3BRBRl-lJ9FNNq4epHEd1sutz1OzLexJrQf3GFMFh5jrjKEAdzaIx1wXtcvoxkPFJrJ_lvD7Tt54xHHfCh-rkH2Ddo9Rx28sOk"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/20 to-transparent flex flex-col justify-end p-8 md:p-12">
              <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight uppercase text-white leading-tight">
                Hải Sản Nhập Khẩu <br />
                <span className="text-orange-500">Thượng Hạng</span>
              </h1>
              <p className="text-slate-300 mb-6 max-w-xl hidden md:block">
                Chất lượng loại 1, cam kết tươi sống mỗi ngày từ những vùng biển tinh khiết nhất thế giới.
              </p>
              <Link
                href="/menu"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 w-fit rounded transition-all uppercase tracking-widest text-sm text-center"
              >
                Xem Thực Đơn
              </Link>
            </div>
          </div>

          {/* Sub-banners */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 md:h-40 rounded-lg overflow-hidden relative group">
              <img
                alt="Special Combo"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKW27x3Gw0KD2BMBxDk5A6OtM8tt9gdu64rImIN2pviB7z71qPT9KZ6LUE6thL7jG6kEKJ0TKCAm0RCHjUpvP1wI7ds-o_5gw1w_n6RtUs23jkEKKyULZBqW8u5scVcjEjWQOO-anM3Ypq2UTY2gnhy6o9ZFjfErovPIXV6u5Psi2H90sgDZxHdIjY_cij2FwX-3mI5zh58SbNWfq9MjRhffJ8AGV12HQwqie2ez67P-SVy60lfc75vwND6Vbi_ZIKvnOQmlL1eW4"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center p-6">
                <h4 className="text-white font-extrabold text-xl">
                  COMBO TIỆC <br />
                  <span className="text-amber-400">GIẢM 20%</span>
                </h4>
              </div>
            </div>
            <div className="h-32 md:h-40 rounded-lg overflow-hidden relative group">
              <img
                alt="Sashimi"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdsOIHjoc5PLzMNPzxX5ZVuz1YGFQz_GRWWzKbvoGSSbR-zeJXM7s53j5XJ364HefGZOSpJCgcfnFuNmJC5ClqQ6gA9I7idFKiCIHEwiu73uLuikokfw9dnqPkGgzWy9hznMS-cGhCZL9gCFWt-dvqJYR0Bi9qtGxKMNDxJNCXLT4lztUO9CkxG7LyH_PLrbX6K-Hh6s9VTv4S2Y_nONQ_ApmqaPOncd1WhlmJe-5W_h0XF24HU6ZWuHjgJWI4hHQ4jtqttCnk-F4"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center p-6">
                <h4 className="text-white font-extrabold text-xl">
                  SASHIMI <br />
                  <span className="text-amber-400">CHUẨN NHẬT</span>
                </h4>
              </div>
            </div>
          </div>
        </div>
      </section>

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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {catProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );
      })}

      <AnnouncementModal 
        enabled={publicSettings.HOMEPAGE_ANNOUNCEMENT_ENABLED} 
        content={publicSettings.HOMEPAGE_ANNOUNCEMENT_CONTENT} 
      />
    </div>
  );
}
