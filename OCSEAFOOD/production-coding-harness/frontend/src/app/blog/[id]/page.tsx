import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { MOCK_BLOG_POSTS } from "@/data/mockData";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
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

async function getPostDetail(id: string): Promise<BlogPost | null> {
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    const mock = MOCK_BLOG_POSTS.find(p => String(p.id) === id);
    return mock ? { ...mock, metaTitle: null, metaDescription: null, metaKeywords: null, imageAlt: null } : null;
  }
  try {
    const res = await fetch(`${backendUrl}/posts/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      const mock = MOCK_BLOG_POSTS.find(p => String(p.id) === id);
      return mock ? { ...mock, metaTitle: null, metaDescription: null, metaKeywords: null, imageAlt: null } : null;
    }
    return await res.json();
  } catch {
    const mock = MOCK_BLOG_POSTS.find(p => String(p.id) === id);
    return mock ? { ...mock, metaTitle: null, metaDescription: null, metaKeywords: null, imageAlt: null } : null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostDetail(id);

  if (!post || !post.isVisible) {
    return { title: "Không tìm thấy bài viết" };
  }

  // Strip HTML tags from content for fallback description
  const strippedContent = post.content.replace(/<[^>]+>/g, "");
  
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || strippedContent.substring(0, 160) + "...";
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
    <div className="max-w-[800px] mx-auto px-4 md:px-6 py-8">
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

      <article className="space-y-6">
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
          <div className="rounded-lg overflow-hidden aspect-video bg-navy-800 border border-navy-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={post.imageAlt || post.title}
              className="w-full h-full object-cover"
              src={post.image}
            />
          </div>
        )}

        {/* Full Content (Rich Text) */}
        <div 
          className="text-slate-300 text-sm md:text-base leading-relaxed space-y-4 font-medium prose prose-invert max-w-none prose-orange prose-img:rounded-xl prose-img:border prose-img:border-navy-700 prose-a:text-orange-500 hover:prose-a:text-orange-400"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}
