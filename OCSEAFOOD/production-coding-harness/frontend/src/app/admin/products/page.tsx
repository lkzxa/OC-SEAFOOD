"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { getAuthHeaders, unwrapCollection } from "@/components/admin/adminApi";
import ImageUploader from "@/components/admin/ImageUploader";
import { useAuthStore } from "@/store/useAuthStore";
import dynamic from "next/dynamic";

// Cast to any to allow ref forwarding (react-quill-new types don't expose ref in dynamic())
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false }) as any;
import "react-quill-new/dist/quill.snow.css";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  unit: string;
  priceReference: number | string | null;
  showContact: boolean;
  isVisible: boolean;
  categoryId: number;
  weightOptions?: string[];
  detailDescription?: string;
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  image: "",
  unit: "",
  priceReference: "",
  showContact: false,
  isVisible: true,
  categoryId: "",
  weightOptionsStr: "",
  detailDescription: "",
};

const formatCurrency = (value: number | string | null) => {
  if (value === null || value === "") return "Liên hệ";
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return "Liên hệ";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  })
    .format(numeric)
    .replace(/\s/g, "");
};

export default function AdminProductsPage() {
  const { token } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [optionRows, setOptionRows] = useState<{ name: string; price: string }[]>([]);
  const quillRef = useRef<any>(null);

  const modules = useMemo(() => {
    return {
      toolbar: {
        container: [
          [{ header: [2, 3, 4, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ align: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["clean"],
        ],
        handlers: {
          image: function() {
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            input.setAttribute("accept", "image/*");
            input.click();

            input.onchange = async () => {
              const file = input.files ? input.files[0] : null;
              if (!file) return;

              const formData = new FormData();
              formData.append("image", file);
              const currentToken = useAuthStore.getState().token;

              try {
                const res = await fetch("/api/upload", {
                  method: "POST",
                  headers: { ...getAuthHeaders(currentToken) },
                  body: formData,
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error?.message || "Upload failed");

                const quill = quillRef.current?.getEditor();
                if (quill) {
                  const range = quill.getSelection(true);
                  quill.insertEmbed(range.index, "image", data.url);
                  quill.setSelection(range.index + 1);
                }
              } catch (err) {
                alert("Lỗi tải ảnh: " + (err instanceof Error ? err.message : "Đã xảy ra lỗi"));
              }
            };
          }
        }
      }
    };
  }, []);

  const editingProduct = useMemo(
    () => products.find((product) => product.id === editingId) || null,
    [editingId, products]
  );

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const [categoriesRes, productsRes] = await Promise.all([
        fetch("/api/categories?pageSize=100"),
        fetch("/api/products?pageSize=100"),
      ]);

      if (!categoriesRes.ok) throw new Error("Không thể tải danh mục.");
      if (!productsRes.ok) throw new Error("Không thể tải sản phẩm.");

      const [categoriesJson, productsJson] = await Promise.all([
        categoriesRes.json(),
        productsRes.json(),
      ]);

      setCategories(unwrapCollection<Category>(categoriesJson));
      setProducts(unwrapCollection<Product>(productsJson));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!editingProduct) {
      setOptionRows([]);
      return;
    }

    setForm({
      name: editingProduct.name,
      slug: editingProduct.slug,
      description: editingProduct.description,
      image: editingProduct.image,
      unit: editingProduct.unit,
      priceReference:
        editingProduct.priceReference === null ? "" : String(editingProduct.priceReference),
      showContact: editingProduct.showContact,
      isVisible: editingProduct.isVisible,
      categoryId: String(editingProduct.categoryId),
      weightOptionsStr: "",
      detailDescription: editingProduct.detailDescription || "",
    });

    if (editingProduct.weightOptions && editingProduct.weightOptions.length > 0) {
      const rows = editingProduct.weightOptions.map((opt) => {
        const parts = opt.split(":");
        return {
          name: parts[0],
          price: parts[1] || "",
        };
      });
      setOptionRows(rows);
    } else {
      setOptionRows([]);
    }
  }, [editingProduct]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOptionRows([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!form.name || !form.slug || !form.description || !form.image || !form.unit || !form.categoryId) {
      setErrorMsg("Vui lòng nhập đầy đủ thông tin sản phẩm.");
      return;
    }

    const priceValue = form.priceReference.trim();
    const weightOptions = optionRows
      .filter((row) => row.name.trim() !== "")
      .map((row) => `${row.name.trim()}:${row.price.trim() || "0"}`);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      unit: form.unit.trim(),
      priceReference: form.showContact || priceValue === "" ? null : Number(priceValue),
      showContact: form.showContact,
      isVisible: form.isVisible,
      categoryId: Number(form.categoryId),
      weightOptions,
      detailDescription: form.detailDescription.trim() || null,
    };

    const hasOptionPrice = optionRows.some((row) => row.name.trim() !== "" && Number(row.price) > 0);
    if (!form.showContact && !hasOptionPrice && (priceValue === "" || Number.isNaN(Number(priceValue)) || Number(priceValue) <= 0)) {
      setErrorMsg("Giá tham khảo phải là số dương hoặc bật chế độ liên hệ hoặc thêm tùy chọn trọng lượng có giá.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        editingId ? `/api/products/${editingId}` : "/api/products",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(token),
          },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error?.message || "Không thể lưu sản phẩm.");
      }

      setSuccessMsg(editingId ? "Đã cập nhật sản phẩm." : "Đã tạo sản phẩm mới.");
      resetForm();
      await loadData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể lưu sản phẩm.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Xóa sản phẩm "${product.name}"?`)) {
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(token),
        },
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error?.message || "Không thể xóa sản phẩm.");
      }

      if (editingId === product.id) {
        resetForm();
      }
      setSuccessMsg("Đã xóa sản phẩm.");
      await loadData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể xóa sản phẩm.");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.35em] text-slate-400">
            Admin / Products
          </p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-100 mt-1">
            Quản lý sản phẩm
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Thêm mới sản phẩm tươi sống/chế biến hoặc thay đổi giá cả thực đơn.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-3 rounded-lg">
            {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
          {/* Edit / Create Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-navy-950 border border-navy-700/50 rounded-2xl p-6 shadow-xl space-y-4 h-fit"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-100">
                {editingId ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm mới"}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-orange-400 cursor-pointer"
                >
                  Hủy sửa
                </button>
              )}
            </div>

            <Field label="Tên sản phẩm" required>
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="admin-input"
                disabled={saving}
                placeholder="Ví dụ: Cua Hoàng Đế"
                required
              />
            </Field>
            <Field label="Slug" required>
              <div className="relative">
                <input
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  className="admin-input pr-10"
                  disabled={saving}
                  placeholder="cua-hoang-de"
                  required
                />
                {/* BUG-L05 fix: Auto-generate slug from product name */}
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  title="Tự động tạo từ tên sản phẩm"
                  onClick={() => {
                    const generated = form.name
                      .toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .replace(/đ/g, "d")
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, "");
                    setForm((p) => ({ ...p, slug: generated }));
                  }}
                >
                  <span className="material-symbols-outlined text-sm">magic_button</span>
                </button>
              </div>
            </Field>
            <Field label="Mô tả" required>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="admin-input"
                disabled={saving}
                placeholder="Nhập mô tả sản phẩm..."
                required
              />
            </Field>
            
            <Field label="Mô tả chi tiết (Rich Text)">
              <div className="bg-white text-black rounded-xl overflow-hidden mt-2">
                <ReactQuill 
                  ref={quillRef}
                  theme="snow" 
                  value={form.detailDescription} 
                  onChange={(val: string) => setForm((prev) => ({ ...prev, detailDescription: val }))}
                  modules={modules}
                  className="min-h-[200px]"
                  readOnly={saving}
                />
              </div>
            </Field>

            <Field label="Ảnh (URL)" required>
              <ImageUploader 
                value={form.image} 
                onChange={(url) => setForm((prev) => ({ ...prev, image: url }))} 
                disabled={saving}
                placeholder="/images/cua.jpg hoặc Tải lên..."
              />
            </Field>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Đơn vị" required>
                <input
                  value={form.unit}
                  onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))}
                  className="admin-input"
                  disabled={saving}
                  placeholder="Ví dụ: kg, con"
                  required
                />
              </Field>
              <Field label="Danh mục" required>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                  className="admin-input"
                  disabled={saving || loading}
                  required
                >
                  <option value="">-- Chọn --</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Giá tham khảo">
              <input
                type="number"
                min="0"
                step="1000"
                value={form.priceReference}
                onChange={(e) => setForm((prev) => ({ ...prev, priceReference: e.target.value }))}
                className="admin-input"
                disabled={saving || form.showContact}
                placeholder="Đơn vị VND"
              />
            </Field>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                  Tùy chọn trọng lượng & giá
                </span>
                <button
                  type="button"
                  onClick={() => setOptionRows((prev) => [...prev, { name: "", price: "" }])}
                  className="text-xs bg-navy-800 hover:bg-navy-700 text-orange-400 font-bold px-2 py-1 rounded cursor-pointer transition-colors"
                >
                  + Thêm tùy chọn
                </button>
              </div>

              {optionRows.map((row, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    value={row.name}
                    onChange={(e) => {
                      const newRows = [...optionRows];
                      newRows[index].name = e.target.value;
                      setOptionRows(newRows);
                    }}
                    placeholder="Ví dụ: 0.3kg - 1kg"
                    className="admin-input flex-1"
                    disabled={saving}
                  />
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={row.price}
                    onChange={(e) => {
                      const newRows = [...optionRows];
                      newRows[index].price = e.target.value;
                      setOptionRows(newRows);
                    }}
                    placeholder="Giá (VND) - Để trống = liên hệ"
                    className="admin-input w-40"
                    disabled={saving}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setOptionRows((prev) => prev.filter((_, i) => i !== index));
                    }}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg cursor-pointer transition-colors"
                    title="Xóa tùy chọn"
                  >
                    <span className="material-symbols-outlined text-sm block select-none">delete</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-bold pt-2">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.showContact}
                  className="rounded bg-navy-800 border-navy-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-navy-900"
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      showContact: e.target.checked,
                      priceReference: e.target.checked ? "" : prev.priceReference,
                    }))
                  }
                />
                Hiển thị liên hệ
              </label>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isVisible}
                  className="rounded bg-navy-800 border-navy-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-navy-900"
                  onChange={(e) => setForm((prev) => ({ ...prev, isVisible: e.target.checked }))}
                />
                Đang hiển thị
              </label>
            </div>

            <button
              type="submit"
              disabled={saving || loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-colors cursor-pointer text-sm"
            >
              {saving ? "Đang lưu..." : editingId ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}
            </button>
          </form>

          {/* Product Data Table */}
          <div className="bg-navy-950 border border-navy-700/50 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-100">Danh sách sản phẩm</h2>
              <span className="text-xs text-slate-400">
                {loading ? "Đang tải..." : `Tổng cộng: ${products.length} sản phẩm`}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-navy-800 text-slate-400 text-xs font-extrabold uppercase tracking-widest">
                    <th className="py-3 px-4">Ảnh</th>
                    <th className="py-3 px-4">Sản phẩm</th>
                    <th className="py-3 px-4">Danh mục</th>
                    <th className="py-3 px-4">Giá / Đơn vị</th>
                    <th className="py-3 px-4">Hiển thị</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-navy-900/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-navy-900 border border-navy-800 shrink-0">
                          {product.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              alt={product.name}
                              src={product.image}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600 bg-navy-900">
                              <span className="material-symbols-outlined text-lg select-none">image</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="font-bold text-slate-100 truncate">{product.name}</div>
                        <div className="text-xs text-slate-500 truncate mt-0.5">{product.slug}</div>
                        {product.weightOptions && product.weightOptions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {product.weightOptions.map((opt) => {
                              const parts = opt.split(":");
                              const name = parts[0];
                              const optPrice = parts[1] ? Number(parts[1]) : 0;
                              const priceStr = optPrice > 0 ? formatCurrency(optPrice) : "Liên hệ";
                              return (
                                <span
                                  key={opt}
                                  className="text-[9px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded font-medium"
                                >
                                  {name} ({priceStr})
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-slate-300">
                        {categories.find((c) => c.id === product.categoryId)?.name || `ID: ${product.categoryId}`}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-orange-400">{formatCurrency(product.priceReference)}</div>
                        <div className="text-xs text-slate-500 mt-0.5">/{product.unit}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                            product.isVisible
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                          }`}
                        >
                          {product.isVisible ? "Hiển thị" : "Ẩn"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(product.id);
                            setErrorMsg(null);
                            setSuccessMsg(null);
                          }}
                          className="bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg cursor-pointer"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg cursor-pointer"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}

                  {!loading && products.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-slate-400 text-sm border border-dashed border-navy-700 rounded-xl p-8 text-center">
                        Chưa có sản phẩm nào được tạo.
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
