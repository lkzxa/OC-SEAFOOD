"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { getAuthHeaders } from "@/components/admin/adminApi";
import ImageUploader from "@/components/admin/ImageUploader";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import react-quill-new to avoid SSR and React 19 findDOMNode issues
// Cast to any to allow ref forwarding (react-quill-new types don't expose ref in dynamic())
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false }) as any;
import "react-quill-new/dist/quill.snow.css";

interface PostFormProps {
  isEditing: boolean;
  postId?: string;
}

const emptyForm = {
  title: "",
  slug: "",
  content: "",
  image: "",
  isVisible: true,
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  imageAlt: "",
};

const quillModules = {
  toolbar: [
    [{ header: [2, 3, 4, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ align: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["clean"],
  ],
};

export default function PostForm({ isEditing, postId }: PostFormProps) {
  const { token } = useAuthStore();
  const router = useRouter();
  const quillRef = useRef<any>(null);
  
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [seoExpanded, setSeoExpanded] = useState(false);

  useEffect(() => {
    if (isEditing && postId) {
      loadPost(postId);
    }
  }, [isEditing, postId]);

  const loadPost = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/${id}`);
      if (!res.ok) throw new Error("Không thể tải bài viết.");
      const data = await res.json();
      setForm({
        title: data.title || "",
        slug: data.slug || "",
        content: data.content || "",
        image: data.image || "",
        isVisible: data.isVisible ?? true,
        metaTitle: data.metaTitle || "",
        metaDescription: data.metaDescription || "",
        metaKeywords: data.metaKeywords || "",
        imageAlt: data.imageAlt || "",
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
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
      const url = isEditing ? `/api/posts/${postId}` : "/api/posts";
      const method = isEditing ? "PUT" : "POST";
      
      const payload = {
        ...form,
        title: form.title.trim(),
        slug: form.slug.trim(),
        content: form.content.trim(),
        image: form.image.trim() || null,
        metaTitle: form.metaTitle.trim() || null,
        metaDescription: form.metaDescription.trim() || null,
        metaKeywords: form.metaKeywords.trim() || null,
        imageAlt: form.imageAlt.trim() || null,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(token),
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error?.message || "Không thể lưu bài viết.");

      setSuccessMsg(isEditing ? "Cập nhật bài viết thành công!" : "Tạo bài viết mới thành công!");
      
      if (!isEditing) {
        // Redirect to list after short delay if creating new
        setTimeout(() => router.push("/admin/posts"), 1500);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Đã xảy ra lỗi khi lưu.");
    } finally {
      setSaving(false);
    }
  };

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

                // Insert image at cursor position
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

  // Render loader

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64 text-slate-400">Đang tải dữ liệu...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-[1400px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/admin/posts" className="text-slate-400 hover:text-orange-500 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 transition-colors w-fit mb-2">
              <span className="material-symbols-outlined text-xs select-none">arrow_back</span>
              Quay lại danh sách
            </Link>
            <h1 className="text-3xl font-black uppercase tracking-tight text-slate-100 mt-1">
              {isEditing ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
            </h1>
          </div>
        </div>

        {errorMsg && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">{errorMsg}</div>}
        {successMsg && <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          {successMsg}
        </div>}

        {/* 7:3 Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Column (70%) */}
          <div className="flex-1 space-y-6">
            <div className="bg-navy-950 border border-navy-700/50 rounded-2xl p-6 shadow-xl space-y-4">
              <Field label="Tiêu đề bài viết" required>
                <input 
                  className="w-full bg-navy-900 border border-navy-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-lg font-bold" 
                  value={form.title} 
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} 
                  disabled={saving} 
                  placeholder="Bí quyết chọn ghẹ ngon" 
                  required 
                />
              </Field>
              <Field label="Slug" required>
                <div className="relative">
                  <input 
                    className="admin-input pr-10" 
                    value={form.slug} 
                    onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))} 
                    disabled={saving} 
                    placeholder="bi-quyet-chon-ghe-ngon" 
                    required 
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200" title="Tự động tạo từ tiêu đề" onClick={() => {
                    const generated = form.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                    setForm(p => ({ ...p, slug: generated }));
                  }}>
                    <span className="material-symbols-outlined text-sm">magic_button</span>
                  </button>
                </div>
              </Field>
            </div>

            <div className="bg-navy-950 border border-navy-700/50 rounded-2xl p-6 shadow-xl space-y-2">
              <Field label="Nội dung bài viết" required>
                <div className="bg-white text-black rounded-xl overflow-hidden mt-2">
                  <ReactQuill 
                    ref={quillRef}
                    theme="snow" 
                    value={form.content} 
                    onChange={(val) => setForm((prev) => ({ ...prev, content: val }))}
                    modules={modules}
                    className="min-h-[400px]"
                    readOnly={saving}
                  />
                </div>
              </Field>
            </div>
          </div>

          {/* Sidebar Column (30%) */}
          <div className="w-full lg:w-[320px] xl:w-[380px] space-y-6 shrink-0">
            {/* Status & Action */}
            <div className="bg-navy-950 border border-navy-700/50 rounded-2xl p-6 shadow-xl space-y-6">
              <label className="flex items-center gap-3 text-sm font-bold cursor-pointer select-none text-slate-300">
                <input 
                  type="checkbox" 
                  checked={form.isVisible} 
                  className="rounded bg-navy-800 border-navy-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-navy-900 w-5 h-5" 
                  onChange={(e) => setForm((prev) => ({ ...prev, isVisible: e.target.checked }))} 
                />
                Cho phép hiển thị
              </label>

              <button 
                type="submit" 
                disabled={saving} 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 transition-colors cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                {saving && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                {saving ? "Đang lưu..." : "Lưu bài viết"}
              </button>
            </div>

            <div className="bg-navy-950 border border-navy-700/50 rounded-2xl p-6 shadow-xl space-y-4">
              <Field label="Ảnh bìa">
                <ImageUploader 
                  value={form.image} 
                  onChange={(url) => setForm((prev) => ({ ...prev, image: url }))} 
                  disabled={saving} 
                />
              </Field>
              {form.image && (
                <div className="mt-4 rounded-xl overflow-hidden aspect-video bg-navy-900 border border-navy-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.image} alt="Cover preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
              )}
            </div>

            {/* SEO Accordion */}
            <div className="bg-navy-950 border border-navy-700/50 rounded-2xl shadow-xl overflow-hidden">
              <button 
                type="button" 
                onClick={() => setSeoExpanded(!seoExpanded)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-navy-900/50 transition-colors"
              >
                <span className="font-bold text-slate-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-500">search_insights</span>
                  Tối ưu SEO (Tùy chọn)
                </span>
                <span className={`material-symbols-outlined transition-transform ${seoExpanded ? "rotate-180" : ""}`}>expand_more</span>
              </button>
              
              {seoExpanded && (
                <div className="p-6 pt-0 space-y-4 border-t border-navy-800/50 mt-2 pt-4">
                  <Field label="Meta Title">
                    <input 
                      className="admin-input" 
                      value={form.metaTitle} 
                      onChange={(e) => setForm((prev) => ({ ...prev, metaTitle: e.target.value }))} 
                      maxLength={60}
                      placeholder="Nhập tiêu đề SEO..." 
                    />
                    <div className="text-right text-[10px] text-slate-500 mt-1">{form.metaTitle.length}/60</div>
                  </Field>
                  <Field label="Meta Description">
                    <textarea 
                      rows={3}
                      className="admin-input" 
                      value={form.metaDescription} 
                      onChange={(e) => setForm((prev) => ({ ...prev, metaDescription: e.target.value }))} 
                      maxLength={160}
                      placeholder="Mô tả ngắn gọn nội dung bài viết..." 
                    />
                    <div className="text-right text-[10px] text-slate-500 mt-1">{form.metaDescription.length}/160</div>
                  </Field>
                  <Field label="Meta Keywords">
                    <input 
                      className="admin-input" 
                      value={form.metaKeywords} 
                      onChange={(e) => setForm((prev) => ({ ...prev, metaKeywords: e.target.value }))} 
                      placeholder="hải sản, chọn ghẹ, tôm hùm..." 
                    />
                  </Field>
                  <Field label="Image Alt (Văn bản thay thế ảnh)">
                    <input 
                      className="admin-input" 
                      value={form.imageAlt} 
                      onChange={(e) => setForm((prev) => ({ ...prev, imageAlt: e.target.value }))} 
                      placeholder="Hình ảnh ghẹ xanh tươi sống" 
                    />
                  </Field>
                </div>
              )}
            </div>

          </div>
        </div>
      </form>
    </AdminLayout>
  );
}

function Field({ label, required, children }: Readonly<{ label: string; required?: boolean; children: React.ReactNode; }>) {
  return (
    <div className="block space-y-2">
      <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </div>
      {children}
    </div>
  );
}
