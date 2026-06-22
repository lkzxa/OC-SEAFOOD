"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";

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

  const handleAddToCart = () => {
    if (isContact) return;
    addItem({
      id: product.id,
      name: product.name,
      priceReference: priceVal || 0,
      image: product.image,
      unit: product.unit,
    }, 1);
  };

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
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm md:text-base font-bold line-clamp-2 mb-2 min-h-[40px] text-slate-100 group-hover:text-orange-500 transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="space-y-1 mb-4 text-[11px] text-slate-400">
          <p className="uppercase">Quy cách: <span className="text-slate-200">{product.unit}</span></p>
        </div>
        <div className="mt-auto">
          <p className="text-lg font-black text-amber-400 mb-3">
            {isContact ? "Liên hệ" : formatPrice(priceVal)}
          </p>
          {!isContact ? (
            <button
              onClick={handleAddToCart}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 text-xs uppercase tracking-widest transition-colors rounded cursor-pointer"
            >
              Thêm vào giỏ
            </button>
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
