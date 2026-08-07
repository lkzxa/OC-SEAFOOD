"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { getAuthHeaders, unwrapCollection } from "@/components/admin/adminApi";
import { useAuthStore } from "@/store/useAuthStore";

interface JobOpening {
  id: number;
  title: string;
  quantity: number;
  salary: string;
  location: string;
  description: string;
  requirements: string[];
  isVisible: boolean;
}

const emptyForm = {
  title: "",
  quantity: "1",
  salary: "",
  location: "",
  description: "",
  isVisible: true,
};

export default function AdminRecruitmentPage() {
  const { token } = useAuthStore();
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [requirementRows, setRequirementRows] = useState<string[]>([""]);

  const editingJob = useMemo(
    () => jobs.find((job) => job.id === editingId) || null,
    [editingId, jobs]
  );

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/job-openings/admin", {
        headers: getAuthHeaders(token),
      });
      if (!res.ok) throw new Error("Không thể tải danh sách tuyển dụng.");
      const json = await res.json();
      setJobs(unwrapCollection<JobOpening>(json));
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
    if (!editingJob) {
      setRequirementRows([""]);
      return;
    }
    setForm({
      title: editingJob.title,
      quantity: String(editingJob.quantity),
      salary: editingJob.salary,
      location: editingJob.location,
      description: editingJob.description,
      isVisible: editingJob.isVisible,
    });
    setRequirementRows(editingJob.requirements.length > 0 ? editingJob.requirements : [""]);
  }, [editingJob]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setRequirementRows([""]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const requirements = requirementRows.map((r) => r.trim()).filter((r) => r !== "");

    if (!form.title || !form.salary || !form.location || !form.description || requirements.length === 0) {
      setErrorMsg("Vui lòng nhập đầy đủ thông tin và ít nhất một yêu cầu công việc.");
      return;
    }

    const quantity = Number(form.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setErrorMsg("Số lượng tuyển phải là số dương.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      quantity,
      salary: form.salary.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      requirements,
      isVisible: form.isVisible,
    };

    setSaving(true);
    try {
      const res = await fetch(
        editingId ? `/api/job-openings/${editingId}` : "/api/job-openings",
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
        throw new Error(json?.error?.message || "Không thể lưu tin tuyển dụng.");
      }

      setSuccessMsg(editingId ? "Đã cập nhật tin tuyển dụng." : "Đã tạo tin tuyển dụng mới.");
      resetForm();
      await loadData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể lưu tin tuyển dụng.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (job: JobOpening) => {
    if (!window.confirm(`Xóa tin tuyển dụng "${job.title}"?`)) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/job-openings/${job.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error?.message || "Không thể xóa tin tuyển dụng.");
      }
      if (editingId === job.id) resetForm();
      setSuccessMsg("Đã xóa tin tuyển dụng.");
      await loadData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể xóa tin tuyển dụng.");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.35em] text-slate-400">
            Admin / Recruitment
          </p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-100 mt-1">
            Quản lý tuyển dụng
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Thêm mới, chỉnh sửa hoặc ẩn các vị trí đang hiển thị ở trang Tuyển dụng.
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
                {editingId ? "Chỉnh sửa tin tuyển dụng" : "Tạo tin tuyển dụng mới"}
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

            <Field label="Tiêu đề vị trí" required>
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="admin-input"
                disabled={saving}
                placeholder="Ví dụ: Nhân viên Tư vấn bán hàng"
                required
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Số lượng cần tuyển" required>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.quantity}
                  onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
                  className="admin-input"
                  disabled={saving}
                  required
                />
              </Field>
              <Field label="Mức lương" required>
                <input
                  value={form.salary}
                  onChange={(e) => setForm((prev) => ({ ...prev, salary: e.target.value }))}
                  className="admin-input"
                  disabled={saving}
                  placeholder="8.000.000 - 15.000.000 VND"
                  required
                />
              </Field>
            </div>

            <Field label="Địa điểm làm việc" required>
              <input
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                className="admin-input"
                disabled={saving}
                placeholder="10 Đ. Số 7, Hạnh Thông, Hồ Chí Minh"
                required
              />
            </Field>

            <Field label="Mô tả công việc" required>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="admin-input"
                disabled={saving}
                placeholder="Nhập mô tả công việc..."
                required
              />
            </Field>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                  Yêu cầu công việc
                </span>
                <button
                  type="button"
                  onClick={() => setRequirementRows((prev) => [...prev, ""])}
                  className="text-xs bg-navy-800 hover:bg-navy-700 text-orange-400 font-bold px-2 py-1 rounded cursor-pointer transition-colors"
                >
                  + Thêm yêu cầu
                </button>
              </div>

              {requirementRows.map((row, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    value={row}
                    onChange={(e) => {
                      const newRows = [...requirementRows];
                      newRows[index] = e.target.value;
                      setRequirementRows(newRows);
                    }}
                    placeholder="Ví dụ: Có kinh nghiệm từ 1 năm trở lên"
                    className="admin-input flex-1"
                    disabled={saving}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setRequirementRows((prev) => prev.filter((_, i) => i !== index));
                    }}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg cursor-pointer transition-colors"
                    title="Xóa yêu cầu"
                  >
                    <span className="material-symbols-outlined text-sm block select-none">delete</span>
                  </button>
                </div>
              ))}
            </div>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer select-none pt-2">
              <input
                type="checkbox"
                checked={form.isVisible}
                onChange={(e) => setForm((prev) => ({ ...prev, isVisible: e.target.checked }))}
                className="rounded bg-navy-800 border-navy-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-navy-900"
              />
              Đang hiển thị
            </label>

            <button
              type="submit"
              disabled={saving || loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-colors cursor-pointer text-sm"
            >
              {saving ? "Đang lưu..." : editingId ? "Cập nhật tin tuyển dụng" : "Tạo tin tuyển dụng"}
            </button>
          </form>

          {/* Job Openings Table */}
          <div className="bg-navy-950 border border-navy-700/50 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-100">Danh sách tin tuyển dụng</h2>
              <span className="text-xs text-slate-400">
                {loading ? "Đang tải..." : `Tổng cộng: ${jobs.length} tin`}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-navy-800 text-slate-400 text-xs font-extrabold uppercase tracking-widest">
                    <th className="py-3 px-4">Vị trí</th>
                    <th className="py-3 px-4">Số lượng</th>
                    <th className="py-3 px-4">Mức lương</th>
                    <th className="py-3 px-4">Hiển thị</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-navy-900/30 transition-colors">
                      <td className="py-3 px-4 max-w-[220px]">
                        <div className="font-bold text-slate-100 truncate">{job.title}</div>
                        <div className="text-xs text-slate-500 truncate mt-0.5">{job.location}</div>
                      </td>
                      <td className="py-3 px-4">{job.quantity} người</td>
                      <td className="py-3 px-4 max-w-[220px] truncate" title={job.salary}>{job.salary}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                            job.isVisible
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                          }`}
                        >
                          {job.isVisible ? "Hiển thị" : "Ẩn"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(job.id);
                            setErrorMsg(null);
                            setSuccessMsg(null);
                          }}
                          className="bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg cursor-pointer"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(job)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg cursor-pointer"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}

                  {!loading && jobs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-slate-400 text-sm border border-dashed border-navy-700 rounded-xl p-8 text-center">
                        Chưa có tin tuyển dụng nào được tạo.
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
