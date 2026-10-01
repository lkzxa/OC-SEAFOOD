"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import ProductCard from "@/components/ProductCard";
import RelatedPostsSection from "@/components/RelatedPostsSection";
import LoadingState from "@/components/LoadingState";
import StatusPanel from "@/components/StatusPanel";
import { optimizeImageUrl } from "@/utils/cloudinaryImage";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import { OFFICIAL_PHONE_DISPLAY, OFFICIAL_PHONE_TEL, OFFICIAL_ZALO_URL } from "@/constants/contact";

interface Category {
  id: number;
  name: string;
  slug: string;
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
  category: Category;
  weightOptions?: string[];
  detailDescription?: string;
  cookingSuggestion?: string;
  storageInstruction?: string;
  badgeText?: string | null;
}

interface ProductDetailContentProps {
  slug: string;
}

export default function ProductDetailContent({ slug }: ProductDetailContentProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<"not-found" | "service" | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("description");
  const [showToast, setShowToast] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Use only the product images managed by OCSEAFOOD.
  const images = useMemo(() => {
    if (!product) return [];
    return product.image ? product.image.split(",").map((img) => img.trim()).filter(Boolean) : [];
  }, [product]);

  // Autoplay slideshow: transition every 4 seconds
  useEffect(() => {
    if (images.length <= 1) return;
    if (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  useEffect(() => {
    let isMounted = true;
    void Promise.resolve().then(() => {
      if (isMounted) {
        setLoading(true);
        setLoadError(null);
      }
    });

    fetch(`/api/products/slug/${slug}`)
      .then((res) => {
        if (res.status === 404) {
          setLoadError("not-found");
          return null;
        }
        if (!res.ok) throw new Error("Product service unavailable");
        return res.json();
      })
      .then((data) => {
        if (!data) {
          if (isMounted) {
            setProduct(null);
            setLoading(false);
          }
          return;
        }
        if (isMounted) {
          setProduct(data);
          setQuantity(1);
          setActiveImageIndex(0); // Reset index on product change
          if (data.weightOptions && data.weightOptions.length > 0) {
            const firstOpt = data.weightOptions[0];
            const parts = firstOpt.split(":");
            const priceVal = parts[parts.length - 1];
            const hasPrice = parts.length > 1 && !isNaN(Number(priceVal));
            setSelectedWeight(hasPrice ? parts.slice(0, -1).join(":") : firstOpt);
          } else {
            setSelectedWeight(undefined);
          }

          // Fetch related products
          fetch(`/api/products?categoryId=${data.categoryId}`)
            .then((res) => res.json())
            .then((relatedData) => {
              if (isMounted) {
                const list = Array.isArray(relatedData) ? relatedData : (relatedData.data ?? []);
                // Exclude current product
                setRelatedProducts(list.filter((p: Product) => p.id !== data.id && p.isVisible).slice(0, 4));
              }
            })
            .catch((err) => console.error("Error fetching related products:", err));

          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error fetching product:", err);
        if (isMounted) {
          setProduct(null);
          setLoadError("service");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug, requestVersion]);

  if (loading) {
    return <LoadingState label="Đang tải thông tin sản phẩm..." />;
  }

  if (loadError === "service") {
    return (
      <StatusPanel
        announce="assertive"
        description="Không thể kết nối dữ liệu sản phẩm lúc này. Vui lòng kiểm tra lại sau hoặc thử tải lại trang."
        eyebrow="Dịch vụ tạm thời gián đoạn"
        icon="cloud_off"
        onPrimaryAction={() => setRequestVersion((value) => value + 1)}
        primaryLabel="Thử tải lại"
        secondaryHref="/menu"
        secondaryLabel="Xem thực đơn"
        title="Chưa thể tải sản phẩm"
      />
    );
  }

  if (!product) {
    return (
      <StatusPanel
        description="Sản phẩm có thể đã được ẩn, xóa hoặc đường dẫn chưa chính xác."
        eyebrow="Sản phẩm không khả dụng"
        icon="inventory_2"
        primaryHref="/menu"
        primaryLabel="Quay lại thực đơn"
        secondaryHref="/"
        secondaryLabel="Về trang chủ"
        title="Sản phẩm không tồn tại"
      />
    );
  }

  const parsedOptions = product.weightOptions
    ? product.weightOptions.map((opt) => {
      const parts = opt.split(":");
      const priceVal = parts[parts.length - 1];
      const hasPrice = parts.length > 1 && !isNaN(Number(priceVal));
      return {
        name: hasPrice ? parts.slice(0, -1).join(":") : opt,
        price: hasPrice ? Number(priceVal) : 0,
      };
    })
    : [];

  const activeOption = parsedOptions.find((o) => o.name === selectedWeight);

  const priceVal = activeOption
    ? (activeOption.price > 0 ? activeOption.price : null)
    : (product.priceReference ? Number(product.priceReference) : null);

  const isContact = product.showContact || priceVal === null || priceVal <= 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price).replace(/\s/g, "");
  };

  const handleAddToCart = () => {
    if (isContact) return;
    addItem({
      id: product.id,
      name: product.name,
      priceReference: priceVal || 0,
      image: product.image,
      unit: product.unit,
      selectedWeight: selectedWeight,
    }, quantity);

    // Show toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleBuyNow = () => {
    if (isContact) return;
    addItem({
      id: product.id,
      name: product.name,
      priceReference: priceVal || 0,
      image: product.image,
      unit: product.unit,
      selectedWeight: selectedWeight,
    }, quantity);
    router.push("/cart");
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-8 space-y-16">

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-24 left-6 z-50 bg-green-500 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <span className="material-symbols-outlined text-lg select-none">check_circle</span>
          <span className="text-xs font-bold uppercase tracking-wider">Đã thêm {quantity} sản phẩm vào giỏ hàng!</span>
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
        <Link href="/" className="hover:text-slate-300 transition-colors">Trang chủ</Link>
        <span className="text-slate-600">/</span>
        <Link href="/menu" className="hover:text-slate-300 transition-colors">Thực đơn</Link>
        <span className="text-slate-600">/</span>
        <Link href={`/category/${product.category.slug}`} className="hover:text-slate-300 transition-colors">
          {product.category.name}
        </Link>
        <span className="text-slate-600">/</span>
        <span className="text-slate-300 font-extrabold">{product.name}</span>
      </nav>

      {/* Product Details Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Product Image Slideshow */}
        <div className="bg-navy-950 border border-navy-800/80 rounded-2xl p-4 shadow-2xl relative overflow-hidden group">
          <div className="aspect-square relative rounded-xl overflow-hidden bg-navy-900">
            <Image
              key={images[activeImageIndex] || "placeholder"}
              alt={`${product.name} - ảnh ${activeImageIndex + 1}`}
              className="object-cover"
              fill
              sizes="(max-width: 1023px) 100vw, 50vw"
              src={optimizeImageUrl(images[activeImageIndex], 1000) || "/media-placeholder.svg"}
              onError={(e) => {
                e.currentTarget.src = "/media-placeholder.svg";
              }}
            />
            <span className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-3 py-1.5 uppercase tracking-widest rounded shadow z-20">
              {product.badgeText || (isContact ? "Đặt trước" : "Hàng tươi sống")}
            </span>

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
                      <span
                        aria-hidden="true"
                        className={`h-2 rounded-full transition-all duration-300 ${index === activeImageIndex
                            ? "bg-orange-500 w-4"
                            : "bg-white/60 w-2"
                          }`}
                      />
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
              {product.name}
            </h1>
            <p className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">
              Quy cách đóng gói: <span className="text-orange-500 font-black">{product.unit}</span>
            </p>
            {parsedOptions && parsedOptions.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                  Chọn trọng lượng:
                </p>
                <div className="flex flex-wrap gap-2">
                  {parsedOptions.map((opt) => (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setSelectedWeight(opt.name)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer ${selectedWeight === opt.name
                          ? "bg-orange-500 border-orange-500 text-navy-950 shadow-lg shadow-orange-500/10"
                          : "bg-navy-900 border-navy-800 text-slate-300 hover:border-slate-700 hover:text-white"
                        }`}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="py-4 border-t border-b border-navy-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Giá bán ước tính</p>
              <p className="text-3xl font-black text-amber-400 mt-1">
                {isContact ? "Liên hệ" : formatPrice(priceVal || 0)}
              </p>
            </div>
            {isContact && (
              <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider">
                Giá thay đổi theo ngày
              </span>
            )}
          </div>

          <p className="text-sm text-slate-300 leading-relaxed font-medium">
            {product.description || "Hải sản tươi sống thượng hạng loại 1 tuyển chọn trực tiếp từ các vựa biển lớn nhất Việt Nam. Đảm bảo tươi sống, ngọt thịt, thơm béo chất lượng cao nhất."}
          </p>

          {/* Action Blocks */}
          <div className="space-y-6 pt-4 border-t border-navy-800">
            {!isContact ? (
              <>
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

                {/* Submit buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="bg-transparent hover:bg-orange-500/10 border border-orange-500 text-orange-500 font-extrabold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/5 cursor-pointer text-xs uppercase tracking-widest"
                  >
                    Thêm vào giỏ
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="bg-orange-500 hover:bg-orange-400 text-navy-950 font-extrabold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/15 cursor-pointer text-xs uppercase tracking-widest"
                  >
                    Mua ngay
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-amber-500 font-bold bg-amber-500/5 border border-amber-500/10 px-4 py-3 rounded-xl">
                  ⚠️ Sản phẩm này cần liên hệ đặt hàng trước để xác nhận giá và tình trạng sống tươi ngày hôm nay.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a
                    href={OFFICIAL_PHONE_TEL}
                    className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-4 rounded-xl transition-all shadow-lg cursor-pointer text-xs uppercase tracking-widest text-center"
                  >
                    <span className="material-symbols-outlined text-lg select-none">phone_in_talk</span>
                    Gọi hotline: {OFFICIAL_PHONE_DISPLAY}
                  </a>
                  <a
                    href={OFFICIAL_ZALO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 rounded-xl transition-all shadow-lg cursor-pointer text-xs uppercase tracking-widest text-center"
                  >
                    <span className="material-symbols-outlined text-lg select-none">chat</span>
                    Chat Zalo hỗ trợ
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-navy-800">
            <div className="flex items-center gap-3 bg-navy-950/50 border border-navy-800/40 rounded-xl p-3">
              <span className="material-symbols-outlined text-orange-500 text-2xl select-none">verified</span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-300">100% tươi sống</p>
                <p className="text-[9px] text-slate-500">Hoàn tiền nếu ngộp</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-navy-950/50 border border-navy-800/40 rounded-xl p-3">
              <span className="material-symbols-outlined text-orange-500 text-2xl select-none">local_shipping</span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-300">Giao nhanh 2h</p>
                <p className="text-[9px] text-slate-500">Ship sống trong nội thành</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-navy-950/50 border border-navy-800/40 rounded-xl p-3">
              <span className="material-symbols-outlined text-orange-500 text-2xl select-none">support_agent</span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-300">Hỗ trợ 24/7</p>
                <p className="text-[9px] text-slate-500">Tư vấn chọn hải sản tốt nhất</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expanded description Tabs */}
      <section className="bg-navy-950 border border-navy-800/60 rounded-2xl p-6 md:p-8 shadow-xl">
        <h2 className="sr-only">Chi tiết sản phẩm</h2>
        <div className="flex border-b border-navy-800 pb-4 mb-6 overflow-x-auto gap-6">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-2 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer border-b-2 whitespace-nowrap ${activeTab === "description"
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
          >
            Mô tả sản phẩm
          </button>
          <button
            onClick={() => setActiveTab("cooking")}
            className={`pb-2 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer border-b-2 whitespace-nowrap ${activeTab === "cooking"
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
          >
            Gợi ý chế biến món ngon
          </button>
          <button
            onClick={() => setActiveTab("preservation")}
            className={`pb-2 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer border-b-2 whitespace-nowrap ${activeTab === "preservation"
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
          >
            Hướng dẫn bảo quản
          </button>
        </div>

        <div className="text-sm text-slate-300 leading-relaxed font-medium space-y-4">
          {activeTab === "description" && (
            <div className="space-y-4">
              {product.detailDescription ? (
                <div
                  className="prose prose-invert prose-orange max-w-none text-slate-300 [&>p]:mb-4 [&>h2]:text-xl [&>h2]:font-bold [&>h3]:text-lg [&>h3]:font-bold [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&_img]:rounded-xl [&_img]:shadow-lg"
                  // BUG-H01 fix: sanitize HTML to prevent XSS attacks
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.detailDescription) }}
                />
              ) : (
                <>
                  <p>
                    Hải sản tươi sống của hệ thống <strong>OCSEAFOOD</strong> được đánh bắt trực tiếp từ những ngư trường lớn nhất tại Nha Trang, Phú Quốc, Phan Thiết. Hải sản được lựa chọn kỹ càng theo từng đợt tàu, đảm bảo size đều, khỏe mạnh và chắc thịt trước khi đưa vào hệ thống bể oxy nhân tạo tiêu chuẩn châu Âu để phục vụ quý khách.
                  </p>
                  <p>
                    Thịt hải sản sống chứa lượng chất dinh dưỡng vô cùng phong phú, chứa nhiều Omega-3 tốt cho sức khỏe tim mạch, giàu chất đạm tự nhiên dễ hấp thụ cùng các khoáng chất vi lượng thiết yếu như Kẽm, Canxi, Phốt pho, Sắt. Sản phẩm là món ăn bồi bổ sức khỏe tuyệt vời cho mọi thành viên trong gia đình.
                  </p>
                </>
              )}
            </div>
          )}

          {activeTab === "cooking" && (
            <div className="space-y-4">
              {product.cookingSuggestion ? (
                <div
                  className="prose prose-invert prose-orange max-w-none text-slate-300 [&>p]:mb-4 [&>h2]:text-xl [&>h2]:font-bold [&>h3]:text-lg [&>h3]:font-bold [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>ul>li]:mb-2"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.cookingSuggestion) }}
                />
              ) : (
                <>
                  <p>Sản phẩm hải sản loại 1 tươi sống này phù hợp nhất với các cách chế biến đơn giản để giữ trọn vẹn vị ngọt thanh tự nhiên của thịt sống:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Hấp sả ớt / Hấp bia:</strong> Giữ nguyên 100% hương vị nguyên bản ngọt đậm đặc trưng. Chấm muối tiêu chanh hoặc muối ớt xanh Nha Trang.</li>
                    <li><strong>Nướng mọi / Nướng muối ớt:</strong> Thơm lừng nức mũi, thịt săn chắc ngọt đậm vị khói.</li>
                    <li><strong>Rang muối Hồng Kông / Sốt bơ tỏi:</strong> Đậm đà thơm ngon, thích hợp cho các bữa tiệc gia đình sang trọng.</li>
                  </ul>
                </>
              )}
            </div>
          )}

          {activeTab === "preservation" && (
            <div className="space-y-4">
              {product.storageInstruction ? (
                <div
                  className="prose prose-invert prose-orange max-w-none text-slate-300 [&>p]:mb-4 [&>h2]:text-xl [&>h2]:font-bold [&>h3]:text-lg [&>h3]:font-bold [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>ul>li]:mb-2"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.storageInstruction) }}
                />
              ) : (
                <>
                  <p>Để đảm bảo chất năng ngon ngọt nhất của hải sản, quý khách nên chế biến ngay sau khi nhận hàng từ nhân viên giao hàng.</p>
                  <p>Trường hợp chưa sử dụng ngay:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Bọc kín sản phẩm trong túi thực phẩm sạch và cất trữ trong ngăn mát tủ lạnh (sử dụng trong vòng 12-24h).</li>
                    <li>Cấp đông sâu ở nhiệt độ -18 độ C nếu muốn lưu trữ dài ngày (lên đến 3 tháng). Rã đông tự nhiên trong ngăn mát tủ lạnh trước khi chế biến.</li>
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl md:text-2xl font-black text-slate-100 uppercase tracking-tight">
            Sản phẩm tương tự
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <RelatedPostsSection />
    </div>
  );
}
