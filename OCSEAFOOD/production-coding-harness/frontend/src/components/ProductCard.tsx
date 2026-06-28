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
    <div className="bg-navy-800 rounded-lg overflow-hidden border border-navy-700 hover:border-orange-500/50 transition-all flex flex-col group">
      <Link href={`/product/${product.slug}`} className="aspect-square relative overflow-hidden bg-navy-900 block">
        <img
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          src={product.image || "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=500"}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=500";
          }}
        />
        <span className="absolute top-2 left-2 bg-red-600 text-[10px] font-black px-2 py-1 uppercase rounded-sm">
          {isContact ? "Đặt hàng" : "Hàng sống"}
        </span>
      </Link>
      <div className="p-4 flex flex-col flex-1 relative">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm md:text-base font-bold line-clamp-2 mb-2 min-h-[40px] text-slate-100 group-hover:text-orange-500 transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="space-y-1 mb-4 text-[11px] text-slate-400">
          <p className="uppercase">Quy cách: <span className="text-slate-200">{product.unit}</span></p>
        </div>
        <div className="mt-auto relative">
          <p className="text-lg font-black text-amber-400 mb-3">
            {isContact ? "Liên hệ" : formatPrice(priceVal)}
          </p>
          {!isContact ? (
            <div className="relative">
              <button
                onClick={handleAddToCart}
                className={`w-full font-bold py-2.5 text-xs uppercase tracking-widest transition-all duration-300 rounded cursor-pointer active:scale-[0.97] flex items-center justify-center gap-1 ${
                  isAdded 
                    ? "bg-green-500 text-white hover:bg-green-600 shadow-[0_0_15px_rgba(34,197,94,0.4)]" 
                    : "bg-orange-500 text-white hover:bg-orange-600"
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
                  className="absolute pointer-events-none text-orange-500 font-black text-xl animate-float-up z-50 drop-shadow-md"
                  style={{ left: click.x - 10, top: click.y - 15 }}
                >
                  +1
                </div>
              ))}
            </div>
          ) : (
            <a
              href="tel:19001234"
              className="w-full block text-center bg-navy-700 hover:bg-navy-600 text-slate-200 font-bold py-2.5 text-xs uppercase tracking-widest transition-colors rounded"
            >
              Gọi tư vấn
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
