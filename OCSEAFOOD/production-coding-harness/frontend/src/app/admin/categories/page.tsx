"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { getAuthHeaders, unwrapCollection } from "@/components/admin/adminApi";
import { useAuthStore } from "@/store/useAuthStore";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
};

export default function AdminCategoriesPage() {
  const { token } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const editingCategory = useMemo(
    () => categories.find((category) => category.id === editingId) || null,
    [categories, editingId]
  );

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/categories?pageSize=100");
      if (!res.ok) {
        throw new Error("Không thể tải danh mục.");
      }
      const json = await res.json();
      setCategories(unwrapCollection<Category>(json));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể tải danh mục.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!editingCategory) return;

    setForm({
      name: editingCategory.name,
      slug: editingCategory.slug,
      description: editingCategory.description || "",
    });
  }, [editingCategory]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!form.name || !form.slug) {
      setErrorMsg("Vui lòng nhập tên và slug danh mục.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(editingId ? `/api/categories/${editingId}` : "/api/categories", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(token),
        },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim() || null,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error?.message || "Không thể lưu danh mục.");

      setSuccessMsg(editingId ? "Đã cập nhật danh mục." : "Đã tạo danh mục mới.");
      resetForm();
      await loadData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể lưu danh mục.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!window.confirm(`Xóa danh mục "${category.name}"?`)) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error?.message || "Không thể xóa danh mục.");

      if (editingId === category.id) resetForm();
      setSuccessMsg("Đã xóa danh mục.");
      await loadData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể xóa danh mục.");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.35em] text-slate-400">
            Admin / Categories
          </p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-100 mt-1">
            Quản lý danh mục
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Phân chia các nhóm thực đơn hải sản khác nhau.
          </p>
        </div>

        {errorMsg && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">{errorMsg}</div>}
        {successMsg && <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-3 rounded-lg">{successMsg}</div>}

        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
          {/* Edit / Create Form */}
          <form onSubmit={handleSubmit} className="bg-navy-950 border border-navy-700/50 rounded-2xl p-6 shadow-xl space-y-4 h-fit">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-100">{editingId ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}</h2>
              {editingId && (
                <button type="button" onClick={resetForm} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-orange-400 cursor-pointer">
                  Hủy sửa
                </button>
              )}
            </div>
            <Field label="Tên danh mục" required>
              <input className="admin-input" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} disabled={saving} placeholder="Ví dụ: Cua & Ghẹ" required />
            </Field>
            <Field label="Slug" required>
              <input className="admin-input" value={form.slug} onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))} disabled={saving} placeholder="cua-ghe" required />
            </Field>
            <Field label="Mô tả">
              <textarea rows={4} className="admin-input" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} disabled={saving} placeholder="Nhập mô tả cho nhóm thực đơn..." />
            </Field>
            <button type="submit" disabled={saving || loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 transition-colors cursor-pointer text-sm">
              {saving ? "Đang lưu..." : editingId ? "Cập nhật danh mục" : "Tạo danh mục"}
            </button>
          </form>

          {/* Categories Data Table */}
          <div className="bg-navy-950 border border-navy-700/50 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-100">Danh sách danh mục</h2>
              <span className="text-xs text-slate-400">{loading ? "Đang tải..." : `Tổng cộng: ${categories.length} danh mục`}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-navy-800 text-slate-400 text-xs font-extrabold uppercase tracking-widest">
                    <th className="py-3 px-4">Tên danh mục</th>
                    <th className="py-3 px-4">Slug</th>
                    <th className="py-3 px-4">Mô tả</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-navy-900/30 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-100">{category.name}</td>
                      <td className="py-4 px-4 text-xs text-slate-400">{category.slug}</td>
                      <td className="py-4 px-4 text-xs text-slate-400 max-w-[240px] truncate">
                        {category.description || "Chưa có mô tả."}
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <button type="button" onClick={() => setEditingId(category.id)} className="bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg cursor-pointer">
                          Sửa
                        </button>
                        <button type="button" onClick={() => handleDelete(category)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg cursor-pointer">
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && categories.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-slate-400 text-sm border border-dashed border-navy-700 rounded-xl p-8 text-center">
                        Chưa có danh mục nào.
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
