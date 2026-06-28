"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import ProductCard from "@/components/ProductCard";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

interface Category {
  id: number;
  name: string;
  slug: string;
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
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("description");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`/api/products/slug/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setProduct(data);
          setQuantity(1);
          if (data.weightOptions && data.weightOptions.length > 0) {
            setSelectedWeight(data.weightOptions[0].split(":")[0]);
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
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-12 animate-pulse space-y-8">
        <div className="h-4 bg-navy-800 w-1/4 rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-navy-800 rounded-2xl"></div>
          <div className="space-y-6">
            <div className="h-8 bg-navy-800 w-3/4 rounded"></div>
            <div className="h-6 bg-navy-800 w-1/3 rounded"></div>
            <div className="h-20 bg-navy-800 w-full rounded"></div>
            <div className="h-10 bg-navy-800 w-1/2 rounded"></div>
            <div className="h-12 bg-navy-800 w-full rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-24 text-center space-y-6">
        <span className="material-symbols-outlined text-6xl text-slate-500 select-none">
          error
        </span>
        <h2 className="text-2xl font-black uppercase text-slate-100">Sản phẩm không tồn tại</h2>
        <p className="text-slate-400 max-w-md mx-auto">
          Sản phẩm có thể đã bị ẩn hoặc xóa khỏi hệ thống. Vui lòng quay lại trang cửa hàng.
        </p>
        <Link
          href="/menu"
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-widest transition-colors cursor-pointer"
        >
          Quay lại thực đơn
        </Link>
      </div>
    );
  }

  const parsedOptions = product.weightOptions
    ? product.weightOptions.map((opt) => {
        const parts = opt.split(":");
        const name = parts[0];
        const price = parts[1] ? Number(parts[1]) : 0;
        return { name, price };
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
        {/* Left: Product Image */}
        <div className="bg-navy-950 border border-navy-800/80 rounded-2xl p-4 shadow-2xl relative overflow-hidden group">
          <div className="aspect-square relative rounded-xl overflow-hidden bg-navy-900">
            <img
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              src={product.image || "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=800"}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=800";
              }}
            />
            <span className="absolute top-4 left-4 bg-orange-500 text-white text-[10px] font-black px-3 py-1.5 uppercase tracking-widest rounded shadow">
              {isContact ? "Đặt trước" : "Hàng tươi sống"}
            </span>
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
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                        selectedWeight === opt.name
                          ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/10"
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
                    className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/15 cursor-pointer text-xs uppercase tracking-widest"
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
                    href="tel:19001234"
                    className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-4 rounded-xl transition-all shadow-lg cursor-pointer text-xs uppercase tracking-widest text-center"
                  >
                    <span className="material-symbols-outlined text-lg select-none">phone_in_talk</span>
                    Gọi hotline: 1900 1234
                  </a>
                  <a
                    href="https://zalo.me"
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
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-navy-800">
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
              <span className="material-symbols-outlined text-orange-500 text-2xl select-none">restaurant</span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-300">Chế biến miễn phí</p>
                <p className="text-[9px] text-slate-500">Làm sạch + hấp sả free</p>
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
        <div className="flex border-b border-navy-800 pb-4 mb-6 overflow-x-auto gap-6">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-2 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === "description"
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Mô tả sản phẩm
          </button>
          <button
            onClick={() => setActiveTab("cooking")}
            className={`pb-2 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === "cooking"
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Gợi ý chế biến món ngon
          </button>
          <button
            onClick={() => setActiveTab("preservation")}
            className={`pb-2 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === "preservation"
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
              <p>Sản phẩm hải sản loại 1 tươi sống này phù hợp nhất với các cách chế biến đơn giản để giữ trọn vẹn vị ngọt thanh tự nhiên của thịt sống:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Hấp sả ớt / Hấp bia:</strong> Giữ nguyên 100% hương vị nguyên bản ngọt đậm đặc trưng. Chấm muối tiêu chanh hoặc muối ớt xanh Nha Trang.</li>
                <li><strong>Nướng mọi / Nướng muối ớt:</strong> Thơm lừng nức mũi, thịt săn chắc ngọt đậm vị khói.</li>
                <li><strong>Rang muối Hồng Kông / Sốt bơ tỏi:</strong> Đậm đà thơm ngon, thích hợp cho các bữa tiệc gia đình sang trọng.</li>
              </ul>
            </div>
          )}

          {activeTab === "preservation" && (
            <div className="space-y-4">
              <p>Để đảm bảo chất năng ngon ngọt nhất của hải sản, quý khách nên chế biến ngay sau khi nhận hàng từ nhân viên giao hàng.</p>
              <p>Trường hợp chưa sử dụng ngay:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Bọc kín sản phẩm trong túi thực phẩm sạch và cất trữ trong ngăn mát tủ lạnh (sử dụng trong vòng 12-24h).</li>
                <li>Cấp đông sâu ở nhiệt độ -18 độ C nếu muốn lưu trữ dài ngày (lên đến 3 tháng). Rã đông tự nhiên trong ngăn mát tủ lạnh trước khi chế biến.</li>
              </ul>
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

    </div>
  );
}
