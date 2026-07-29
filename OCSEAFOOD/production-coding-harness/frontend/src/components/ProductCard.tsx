"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { useState, useCallback } from "react";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    priceReference: number | string | null;
    image: string;
    unit: string;
    showContact: boolean;
    badgeText?: string | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  
  // Animation states
  const [isAdded, setIsAdded] = useState(false);
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number }[]>([]);

  const priceVal = product.priceReference ? Number(product.priceReference) : null;
  // BUG-005 fix: treat priceReference=0 same as null (must contact for pricing)
  const isContact = product.showContact || priceVal === null || priceVal <= 0;

  // Format currency without decimals (VND)
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price).replace(/\s/g, "");
  };

  const handleAddToCart = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (isContact) return;
    
    // Add item to cart
    addItem({
      id: product.id,
      name: product.name,
      priceReference: priceVal || 0,
      image: product.image,
      unit: product.unit,
    }, 1);

    // Get click coordinates relative to the button for the +1 animation
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newClickId = Date.now();

    // Trigger floating +1 animation
    setClicks((prev) => [...prev, { id: newClickId, x, y }]);
    setTimeout(() => {
      setClicks((prev) => prev.filter(c => c.id !== newClickId));
    }, 1000); // Remove from DOM after animation completes (1s)

    // Trigger button color state
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1500); // Revert button state after 1.5s
  }, [addItem, isContact, priceVal, product]);

  return (
    <div className="bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 rounded-lg overflow-hidden border border-amber-400/40 hover:border-yellow-300 hover:shadow-[0_12px_40px_rgba(239,68,68,0.35)] hover:-translate-y-1 transition-all duration-300 flex flex-col group holographic-card">
      <Link href={`/product/${product.slug}`} className="aspect-square relative overflow-hidden bg-navy-900 block">
        <img
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          src={(product.image ? product.image.split(",")[0].trim() : "") || "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=500"}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=500";
          }}
        />
        <span className="absolute top-2 left-2 bg-red-600 text-[10px] font-black px-2 py-1 uppercase rounded-sm z-20">
          {product.badgeText || (isContact ? "Đặt hàng" : "Hàng sống")}
        </span>
      </Link>
      <div className="p-4 flex flex-col flex-1 relative">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm md:text-base font-extrabold line-clamp-2 mb-2 min-h-[40px] text-white group-hover:text-amber-100 transition-colors drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.3)]">
            {product.name}
          </h3>
        </Link>
        <div className="space-y-1 mb-4 text-[11px] text-amber-100">
          <p className="uppercase">Quy cách: <span className="text-white font-bold">{product.unit}</span></p>
        </div>
        <div className="mt-auto relative">
          <p className="text-xl md:text-2xl font-black text-yellow-300 mb-3 drop-shadow-[0_2px_5px_rgba(0,0,0,0.4)]">
            {isContact ? "Liên hệ" : formatPrice(priceVal)}
          </p>
          {!isContact ? (
            <div className="relative">
              <button
                onClick={handleAddToCart}
                className={`w-full font-extrabold py-2.5 text-xs uppercase tracking-widest transition-all duration-300 rounded cursor-pointer active:scale-[0.97] flex items-center justify-center gap-1 ${
                  isAdded 
                    ? "bg-green-600 text-white hover:bg-green-700 shadow-[0_0_15px_rgba(22,163,74,0.4)]" 
                    : "bg-white text-red-600 hover:bg-amber-50 hover:text-red-700 shadow-[0_4px_15px_rgba(0,0,0,0.15)]"
                }`}
              >
                {isAdded ? (
                  <>
                    <span className="material-symbols-outlined text-[14px]">check</span>
                    Đã thêm
                  </>
                ) : (
                  "Thêm vào giỏ"
                )}
              </button>
              
              {/* Render floating +1 animations */}
              {clicks.map(click => (
                <div
                  key={click.id}
                  className="absolute pointer-events-none text-yellow-300 font-black text-xl animate-float-up z-50 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                  style={{ left: click.x - 10, top: click.y - 15 }}
                >
                  +1
                </div>
              ))}
            </div>
          ) : (
            <a
              href="tel:19001234"
              className="w-full block text-center bg-slate-950 hover:bg-slate-900 text-white font-black py-2.5 text-xs uppercase tracking-widest transition-colors rounded shadow-sm border border-white/10"
            >
              Gọi tư vấn
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
