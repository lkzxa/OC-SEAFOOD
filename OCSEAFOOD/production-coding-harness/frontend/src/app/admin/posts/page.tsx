"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { getAuthHeaders, unwrapCollection } from "@/components/admin/adminApi";
import { useAuthStore } from "@/store/useAuthStore";

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  image?: string | null;
  isVisible: boolean;
  authorId?: number;
}

const emptyForm = {
  title: "",
  slug: "",
  content: "",
  image: "",
  isVisible: true,
};

export default function AdminPostsPage() {
  const { token } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const editingPost = useMemo(
    () => posts.find((post) => post.id === editingId) || null,
    [posts, editingId]
  );

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

  useEffect(() => {
    if (!editingPost) return;

    setForm({
      title: editingPost.title,
      slug: editingPost.slug,
      content: editingPost.content,
      image: editingPost.image || "",
      isVisible: editingPost.isVisible,
    });
  }, [editingPost]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!form.title || !form.slug || !form.content) {
      setErrorMsg("Vui lòng nhập tiêu đề, slug và nội dung bài viết.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(editingId ? `/api/posts/${editingId}` : "/api/posts", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(token),
        },
        body: JSON.stringify({
          title: form.title.trim(),
          slug: form.slug.trim(),
          content: form.content.trim(),
          image: form.image.trim() || null,
          isVisible: form.isVisible,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error?.message || "Không thể lưu bài viết.");

      setSuccessMsg(editingId ? "Đã cập nhật bài viết." : "Đã tạo bài viết mới.");
      resetForm();
      await loadData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể lưu bài viết.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (post: Post) => {
    if (!window.confirm(`Xóa bài viết "${post.title}"?`)) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error?.message || "Không thể xóa bài viết.");

      if (editingId === post.id) resetForm();
      setSuccessMsg("Đã xóa bài viết.");
      await loadData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể xóa bài viết.");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
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

        {errorMsg && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">{errorMsg}</div>}
        {successMsg && <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-3 rounded-lg">{successMsg}</div>}

        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
          {/* Edit / Create Form */}
          <form onSubmit={handleSubmit} className="bg-navy-950 border border-navy-700/50 rounded-2xl p-6 shadow-xl space-y-4 h-fit">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-100">{editingId ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}</h2>
              {editingId && (
                <button type="button" onClick={resetForm} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-orange-400 cursor-pointer">
                  Hủy sửa
                </button>
              )}
            </div>
            <Field label="Tiêu đề" required>
              <input className="admin-input" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} disabled={saving} placeholder="Bí quyết chọn ghẹ ngon" required />
            </Field>
            <Field label="Slug" required>
              <input className="admin-input" value={form.slug} onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))} disabled={saving} placeholder="bi-quyet-chon-ghe-ngon" required />
            </Field>
            <Field label="Ảnh bìa (URL)">
              <input className="admin-input" value={form.image} onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))} disabled={saving} placeholder="/images/blog/ghe.jpg" />
            </Field>
            <Field label="Nội dung" required>
              <textarea rows={8} className="admin-input" value={form.content} onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))} disabled={saving} placeholder="Nhập nội dung chi tiết bài viết..." required />
            </Field>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer select-none text-slate-300">
              <input type="checkbox" checked={form.isVisible} className="rounded bg-navy-800 border-navy-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-navy-900" onChange={(e) => setForm((prev) => ({ ...prev, isVisible: e.target.checked }))} />
              Cho phép hiển thị
            </label>
            <button type="submit" disabled={saving || loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 transition-colors cursor-pointer text-sm">
              {saving ? "Đang lưu..." : editingId ? "Cập nhật bài viết" : "Tạo bài viết"}
            </button>
          </form>

          {/* Posts Data Table */}
          <div className="bg-navy-950 border border-navy-700/50 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-100">Danh sách bài viết</h2>
              <span className="text-xs text-slate-400">{loading ? "Đang tải..." : `Tổng số: ${posts.length} bài`}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-navy-800 text-slate-400 text-xs font-extrabold uppercase tracking-widest">
                    <th className="py-3 px-4">Ảnh bìa</th>
                    <th className="py-3 px-4">Bài viết</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
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
                      <td className="py-3 px-4 max-w-[280px]">
                        <div className="font-bold text-slate-100 truncate">{post.title}</div>
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
                        <button type="button" onClick={() => { setEditingId(post.id); setErrorMsg(null); setSuccessMsg(null); }} className="bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg cursor-pointer">
                          Sửa
                        </button>
                        <button type="button" onClick={() => handleDelete(post)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg cursor-pointer">
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
      </div>
    </AdminLayout>
  );
}

function Field({
  label,
  required,
  children,
}: Readonly<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
}>) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </span>
      {children}
    </label>
  );
}
