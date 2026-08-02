"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface BlogPost {
  id: number;
  title: string;
  content: string;
  image: string | null;
  imageAlt?: string | null;
  isVisible: boolean;
}

// Strip HTML tags before truncating, since post.content is stored as rich-text HTML
function getExcerpt(content: string, maxLength: number = 90): string {
  const stripped = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength) + "...";
}

interface RelatedPostsSectionProps {
  excludeId?: number;
  limit?: number;
}

export default function RelatedPostsSection({ excludeId, limit = 3 }: RelatedPostsSectionProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/posts")
      .then((res) => (res.ok ? res.json() : []))
      .then((json) => {
        if (!isMounted) return;
        const list: BlogPost[] = Array.isArray(json) ? json : (json.data ?? []);
        setPosts(list.filter((p) => p.isVisible && p.id !== excludeId).slice(0, limit));
      })
      .catch(() => {
        if (isMounted) setPosts([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [excludeId, limit]);

  if (loading || posts.length === 0) return null;

  return (
    <section className="mt-16 pt-10 border-t border-navy-700/50">
      <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-100 mb-6">
        Có thể bạn chưa biết
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/blog/${p.id}`}
            className="group bg-navy-800 rounded-lg overflow-hidden border border-navy-700 hover:border-orange-500/50 transition-all flex flex-col"
          >
            <div className="aspect-video relative overflow-hidden bg-navy-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={p.imageAlt || p.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                src={p.image || "https://images.unsplash.com/photo-1534080391025-09795d197a5b?w=800"}
              />
            </div>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-sm font-bold text-slate-100 group-hover:text-orange-500 transition-colors mb-2 line-clamp-2">
                {p.title}
              </h3>
              <p className="text-slate-400 text-xs line-clamp-2 mb-3 flex-1">
                {getExcerpt(p.content)}
              </p>
              <span className="text-orange-500 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1 w-fit">
                Đọc tiếp
                <span className="material-symbols-outlined text-xs select-none">arrow_forward</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
