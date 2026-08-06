"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { optimizeImageUrl } from "@/utils/cloudinaryImage";

interface BlogPost {
  id: number;
  title: string;
  image: string | null;
  imageAlt?: string | null;
  isVisible: boolean;
  createdAt: string;
}

interface BlogSidebarProps {
  excludeId?: number;
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export default function BlogSidebar({ excludeId }: BlogSidebarProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/posts")
      .then((res) => (res.ok ? res.json() : []))
      .then((json) => {
        if (!isMounted) return;
        const list: BlogPost[] = Array.isArray(json) ? json : (json.data ?? []);
        setPosts(list.filter((p) => p.isVisible && p.id !== excludeId).slice(0, 5));
      })
      .catch(() => {
        if (isMounted) setPosts([]);
      });
    return () => {
      isMounted = false;
    };
  }, [excludeId]);

  return (
    <aside className="space-y-6">
      {/* Contact CTA card */}
      <div className="bg-navy-800 border border-orange-500/30 rounded-lg p-5 space-y-3">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-100">
          Cần tư vấn thực đơn?
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Gọi ngay để được tư vấn chọn hải sản hoặc combo tiệc phù hợp.
        </p>
        <a
          href="tel:0908464818"
          className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-2.5 rounded-lg text-xs uppercase tracking-widest transition-colors"
        >
          <span className="material-symbols-outlined text-sm select-none">call</span>
          0908 464 818
        </a>
        <Link
          href="/combo"
          className="flex items-center justify-center gap-2 bg-navy-700 hover:bg-navy-600 border border-navy-600 text-slate-200 font-bold py-2.5 rounded-lg text-xs uppercase tracking-widest transition-colors"
        >
          Xem Combo Tiệc
        </Link>
      </div>

      {/* Latest posts */}
      {posts.length > 0 && (
        <div className="bg-navy-800 border border-navy-700 rounded-lg p-5">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-100 mb-4">
            Bài viết mới nhất
          </h3>
          <div className="space-y-4">
            {posts.map((p) => (
              <Link key={p.id} href={`/blog/${p.id}`} className="flex gap-3 group">
                <div className="w-16 h-16 shrink-0 rounded-md overflow-hidden bg-navy-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={p.imageAlt || p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    src={optimizeImageUrl(p.image, 150) || "https://images.unsplash.com/photo-1534080391025-09795d197a5b?w=200"}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-200 group-hover:text-orange-500 transition-colors line-clamp-2">
                    {p.title}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">{formatDate(p.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="bg-navy-800 border border-navy-700 rounded-lg p-5">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-100 mb-4">
          Khám phá thêm
        </h3>
        <div className="flex flex-col gap-2">
          <Link
            href="/menu"
            className="text-xs font-bold text-slate-300 hover:text-orange-500 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm select-none">restaurant_menu</span>
            Thực đơn hải sản tươi sống
          </Link>
          <Link
            href="/combo"
            className="text-xs font-bold text-slate-300 hover:text-orange-500 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm select-none">celebration</span>
            Combo tiệc hải sản
          </Link>
        </div>
      </div>
    </aside>
  );
}
