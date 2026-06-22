import Link from "next/link";

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
}

async function getPosts(): Promise<BlogPost[]> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const res = await fetch(`${backendUrl}/posts`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch blog posts:", err);
    return [];
  }
}

// Helper to truncate text to a certain length
function getExcerpt(content: string, maxLength: number = 120): string {
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength) + "...";
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

export default async function BlogPage() {
  const posts = await getPosts();
  
  // Filter visible posts only
  const visiblePosts = posts.filter(post => post.isVisible);

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
      {/* PAGE HEADER */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-100 mb-3">
          Cẩm Nang <span className="text-orange-500">Vào Bếp</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
          Chia sẻ bí quyết chế biến hải sản thượng hạng, các công thức nấu ăn ngon chuẩn nhà hàng từ những đầu bếp chuyên nghiệp.
        </p>
      </div>

      {/* POSTS GRID */}
      {visiblePosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {visiblePosts.map((post) => (
            <article
              key={post.id}
              className="bg-navy-800 rounded-lg overflow-hidden border border-navy-700 hover:border-orange-500/50 transition-all flex flex-col group"
            >
              {/* Post Image */}
              <Link href={`/blog/${post.id}`} className="aspect-video relative overflow-hidden bg-navy-900 block">
                <img
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  src={post.image || "https://images.unsplash.com/photo-1534080391025-09795d197a5b?w=800"}
                />
              </Link>

              {/* Post Details */}
              <div className="p-5 flex flex-col flex-1">
                {/* Meta info */}
                <div className="flex items-center gap-4 text-[11px] text-slate-400 mb-3">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs select-none">calendar_month</span>
                    {formatDate(post.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs select-none">person</span>
                    Admin
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-lg font-bold text-slate-100 group-hover:text-orange-500 transition-colors mb-3 line-clamp-2">
                  <Link href={`/blog/${post.id}`}>{post.title}</Link>
                </h2>

                {/* Excerpt */}
                <p className="text-slate-300 text-xs md:text-sm line-clamp-3 mb-5 leading-relaxed">
                  {getExcerpt(post.content)}
                </p>

                {/* Read more link */}
                <Link
                  href={`/blog/${post.id}`}
                  className="mt-auto text-orange-500 hover:text-orange-600 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1 w-fit group/btn transition-colors"
                >
                  Đọc tiếp 
                  <span className="material-symbols-outlined text-xs select-none group-hover/btn:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-navy-800 rounded-lg border border-navy-700/50">
          <span className="material-symbols-outlined text-5xl text-slate-500 mb-4 select-none">
            rss_feed
          </span>
          <p className="text-slate-400 font-medium">Hiện tại chưa có bài viết nào được đăng tải.</p>
        </div>
      )}
    </div>
  );
}
