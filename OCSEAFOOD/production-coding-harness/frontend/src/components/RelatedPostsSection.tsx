"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { optimizeImageUrl } from "@/utils/cloudinaryImage";

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
  const [loadError, setLoadError] = useState(false);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    let isMounted = true;
    void Promise.resolve().then(() => {
      if (isMounted) {
        setLoading(true);
        setLoadError(false);
      }
    });
    fetch("/api/posts")
      .then((res) => {
        if (!res.ok) throw new Error("Related posts unavailable");
        return res.json();
      })
      .then((json) => {
        if (!isMounted) return;
        const list: BlogPost[] = Array.isArray(json) ? json : (json.data ?? []);
        setPosts(list.filter((p) => p.isVisible && p.id !== excludeId).slice(0, limit));
      })
      .catch(() => {
        if (isMounted) {
          setPosts([]);
          setLoadError(true);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [excludeId, limit, requestVersion]);

  if (loading) return null;

  if (loadError) {
    return (
      <section className="mt-16 border-t border-navy-700/50 pt-8" aria-live="polite">
        <div className="flex flex-col gap-3 rounded-xl border border-navy-700 bg-navy-800/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">Chưa tải được bài viết gợi ý.</p>
          <button
            className="min-h-10 cursor-pointer rounded-lg border border-navy-700 px-4 py-2 text-xs font-black uppercase tracking-wider text-orange-400 hover:bg-navy-700"
            onClick={() => setRequestVersion((value) => value + 1)}
            type="button"
          >
            Thử lại
          </button>
        </div>
      </section>
    );
  }

  if (posts.length === 0) return null;

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
              <Image
                alt={p.imageAlt || p.title}
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                fill
                sizes="(max-width: 767px) 100vw, 33vw"
                src={optimizeImageUrl(p.image, 600) || "/media-placeholder.svg"}
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
