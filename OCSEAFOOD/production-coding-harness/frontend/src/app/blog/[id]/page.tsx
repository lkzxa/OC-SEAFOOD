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

// "Co the ban chua biet" section — other posts teaser, shown at the bottom of each post
async function getOtherPosts(excludeId: number): Promise<BlogPost[]> {
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    return MOCK_BLOG_POSTS.filter(p => p.id !== excludeId).slice(0, 3) as BlogPost[];
  }
  try {
    const res = await fetch(`${backendUrl}/posts`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const posts: BlogPost[] = Array.isArray(json) ? json : (json.data ?? []);
    return posts.filter(p => p.isVisible && p.id !== excludeId).slice(0, 3);
  } catch {
    return [];
  }
}

// Strip HTML tags before truncating, since post.content is stored as rich-text HTML
function getExcerpt(content: string, maxLength: number = 100): string {
  const stripped = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength) + "...";
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
  const numericId = parseInt(id, 10);
  const [post, otherPosts] = await Promise.all([
    getPostDetail(id),
    getOtherPosts(numericId),
  ]);

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

      {/* "Co the ban chua biet" — other posts teaser, encourages readers to keep browsing */}
      {otherPosts.length > 0 && (
        <section className="mt-16 pt-10 border-t border-navy-700/50">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-100 mb-6">
            Có thể bạn chưa biết
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {otherPosts.map((p) => (
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
                    {getExcerpt(p.content, 90)}
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
      )}
    </div>
  );
}
