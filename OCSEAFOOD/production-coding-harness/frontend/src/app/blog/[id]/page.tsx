import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { cache } from "react";
import BlogSidebar from "@/components/BlogSidebar";
import { optimizeImageUrl } from "@/utils/cloudinaryImage";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  image: string | null;
  isVisible: boolean;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  imageAlt?: string | null;
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const getPostDetail = cache(async (id: string): Promise<BlogPost | null> => {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
  try {
    const res = await fetch(`${backendUrl}/posts/${id}`, {
      cache: "no-store",
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error("Blog service unavailable");
    }
    return await res.json();
  } catch {
    throw new Error("Blog service unavailable");
  }
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostDetail(id);

  if (!post || !post.isVisible) {
    return { title: "Không tìm thấy bài viết" };
  }

  // Strip HTML tags from content for fallback description
  const strippedContent = post.content.replace(/<[^>]+>/g, "");
  
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt || strippedContent.substring(0, 160) + "...";
  const keywords = post.metaKeywords || "hải sản, ốc seafood, cẩm nang vào bếp";

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: post.image ? [{ url: post.image, alt: post.imageAlt || post.title }] : undefined,
    },
  };
}

// Helper to format date
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

export default async function BlogPostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getPostDetail(id);

  if (!post || !post.isVisible) {
    notFound();
    return null;
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
      {/* Navigation breadcrumbs / Back button */}
      <div className="mb-6">
        <Link
          href="/blog"
          className="text-slate-400 hover:text-orange-500 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 transition-colors w-fit"
        >
          <span className="material-symbols-outlined text-xs select-none">arrow_back</span>
          Quay lại cẩm nang
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <article className="lg:col-span-8 space-y-6">
          {/* Post Meta */}
          <div className="space-y-3">
            <h1 className="text-2xl md:text-4xl font-black text-slate-100 tracking-tight leading-tight uppercase">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-xs text-slate-400 border-b border-navy-700/50 pb-4">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm select-none">calendar_month</span>
                {formatDate(post.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm select-none">person</span>
                Ban Biên Tập OCSEAFOOD
              </span>
            </div>
          </div>

          {/* Feature Image */}
          {post.image && (
            <div className="relative rounded-lg overflow-hidden aspect-video bg-navy-800 border border-navy-700">
              <Image
                alt={post.imageAlt || post.title}
                className="object-cover"
                fill
                sizes="(max-width: 1023px) 100vw, 70vw"
                preload
                src={optimizeImageUrl(post.image, 1000)}
              />
            </div>
          )}

          {/* Full Content (Rich Text) */}
          <div
            className="text-slate-300 text-sm md:text-base leading-relaxed space-y-4 font-medium prose prose-invert max-w-none prose-orange prose-img:rounded-xl prose-img:border prose-img:border-navy-700 prose-a:text-orange-500 hover:prose-a:text-orange-400"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
          />
        </article>

        <div className="lg:col-span-4">
          <BlogSidebar excludeId={post.id} />
        </div>
      </div>
    </div>
  );
}
