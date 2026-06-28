"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { getAuthHeaders, unwrapCollection } from "@/components/admin/adminApi";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  image?: string | null;
  isVisible: boolean;
  authorId?: number;
}

export default function AdminPostsPage() {
  const { token } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/posts");
      if (!res.ok) throw new Error("Không thể tải bài viết.");
      const json = await res.json();
      setPosts(unwrapCollection<Post>(json));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể tải bài viết.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (post: Post) => {
    // Replaced window.confirm with a simple confirm for now. We will upgrade this to a Modal soon.
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${post.title}"? Thao tác không thể hoàn tác.`)) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error?.message || "Không thể xóa bài viết.");

      setSuccessMsg("Đã xóa bài viết.");
      await loadData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể xóa bài viết.");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.35em] text-slate-400">
              Admin / Posts
            </p>
            <h1 className="text-3xl font-black uppercase tracking-tight text-slate-100 mt-1">
              Quản lý bài viết
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Đăng các mẹo vào bếp, kiến thức chế biến và giới thiệu ẩm thực đại dương.
            </p>
          </div>
          
          <Link
            href="/admin/posts/new"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer text-sm shrink-0 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Thêm bài viết mới
          </Link>
        </div>

        {errorMsg && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">{errorMsg}</div>}
        {successMsg && <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-3 rounded-lg">{successMsg}</div>}

        <div className="bg-navy-950 border border-navy-700/50 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-100">Danh sách bài viết</h2>
            <span className="text-xs text-slate-400">{loading ? "Đang tải..." : `Tổng số: ${posts.length} bài`}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-navy-800 text-slate-400 text-xs font-extrabold uppercase tracking-widest">
                  <th className="py-3 px-4 w-24">Ảnh bìa</th>
                  <th className="py-3 px-4">Bài viết</th>
                  <th className="py-3 px-4 w-32">Trạng thái</th>
                  <th className="py-3 px-4 w-40 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-navy-900/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="w-16 h-10 rounded overflow-hidden bg-navy-900 border border-navy-800 shrink-0">
                        {post.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img alt={post.title} src={post.image} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <span className="material-symbols-outlined text-lg select-none">article</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-100 truncate max-w-md xl:max-w-2xl" title={post.title}>{post.title}</div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">{post.slug}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                          post.isVisible
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                        }`}
                      >
                        {post.isVisible ? "Hiển thị" : "Ẩn"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link 
                        href={`/admin/posts/${post.id}/edit`} 
                        className="inline-block bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg cursor-pointer transition-colors"
                      >
                        Sửa
                      </Link>
                      <button type="button" onClick={() => handleDelete(post)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg cursor-pointer transition-colors">
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && posts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-slate-400 text-sm border border-dashed border-navy-700 rounded-xl p-8 text-center">
                      Chưa có bài viết nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
