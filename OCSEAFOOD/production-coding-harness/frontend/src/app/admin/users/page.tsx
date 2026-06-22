"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { getAuthHeaders, unwrapCollection } from "@/components/admin/adminApi";
import { useAuthStore } from "@/store/useAuthStore";

interface UserItem {
  id: number;
  email: string;
  name: string;
  role: "CUSTOMER" | "ADMIN";
  createdAt: string;
}

interface Pagination {
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const emptyForm = {
  email: "",
  name: "",
  password: "",
  role: "CUSTOMER" as "CUSTOMER" | "ADMIN",
};

export default function AdminUsersPage() {
  const { token, user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    totalItems: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedRoleFilter, setAppliedRoleFilter] = useState("");

  // Editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const editingUser = useMemo(
    () => users.find((u) => u.id === editingId) || null,
    [users, editingId]
  );

  const loadUsers = async (page = pagination.page, searchVal = appliedSearch, roleVal = appliedRoleFilter) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pagination.pageSize),
      });
      if (searchVal) params.set("search", searchVal);
      if (roleVal) params.set("role", roleVal);

      const res = await fetch(`/api/users?${params.toString()}`, {
        headers: getAuthHeaders(token),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error?.message || "Không thể tải danh sách tài khoản.");
      }

      setUsers(unwrapCollection<UserItem>(json));
      if (json?.pagination) {
        setPagination({
          totalItems: json.pagination.totalItems,
          page: json.pagination.page,
          pageSize: json.pagination.pageSize,
          totalPages: json.pagination.totalPages,
        });
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể tải danh sách tài khoản.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1, "", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!editingUser) return;
    setForm({
      email: editingUser.email,
      name: editingUser.name,
      password: "", // Always start with empty password when editing
      role: editingUser.role,
    });
  }, [editingUser]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(search);
    setAppliedRoleFilter(roleFilter);
    loadUsers(1, search, roleFilter);
  };

  const handleResetFilters = () => {
    setSearch("");
    setRoleFilter("");
    setAppliedSearch("");
    setAppliedRoleFilter("");
    loadUsers(1, "", "");
  };

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    loadUsers(nextPage, appliedSearch, appliedRoleFilter);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!form.email || !form.name || (!editingId && !form.password)) {
      setErrorMsg("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, string> = {
        email: form.email.trim(),
        name: form.name.trim(),
        role: form.role,
      };

      if (form.password) {
        payload.password = form.password;
      }

      const res = await fetch(editingId ? `/api/users/${editingId}` : "/api/users", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(token),
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error?.message || "Không thể lưu thông tin tài khoản.");

      setSuccessMsg(editingId ? "Đã cập nhật thông tin tài khoản." : "Đã tạo tài khoản mới thành công.");
      resetForm();
      await loadUsers(pagination.page, appliedSearch, appliedRoleFilter);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể lưu thông tin tài khoản.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: UserItem) => {
    if (currentUser && u.id === currentUser.id) {
      setErrorMsg("Bạn không thể tự xóa tài khoản của chính mình!");
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${u.name}" (${u.email})?`)) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/users/${u.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error?.message || "Không thể xóa tài khoản.");

      if (editingId === u.id) resetForm();
      setSuccessMsg("Đã xóa tài khoản thành công.");
      await loadUsers(pagination.page, appliedSearch, appliedRoleFilter);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể xóa tài khoản.");
    }
  };

  const formatDateTime = (value: string) => {
    try {
      return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value));
    } catch {
      return value;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header section */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.35em] text-slate-400">
              Admin / Users
            </p>
            <h1 className="text-3xl font-black uppercase tracking-tight text-slate-100 mt-1">
              Quản lý tài khoản
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Quản lý danh sách thành viên, nhân viên và phân quyền truy cập hệ thống.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 bg-navy-800 hover:bg-navy-700 border border-navy-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            <span className="material-symbols-outlined text-sm select-none">arrow_back</span>
            Về dashboard
          </Link>
        </div>

        {/* Alerts */}
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

        {/* Filters Form */}
        <form
          onSubmit={handleFilterSubmit}
          className="bg-navy-950 border border-navy-700/50 rounded-2xl p-6 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Tìm kiếm & Bộ lọc</h2>
              <p className="text-slate-400 text-sm mt-1">Lọc danh sách tài khoản theo vai trò hoặc tìm kiếm email/tên.</p>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-orange-400"
            >
              Xóa bộ lọc
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Tìm kiếm">
              <input
                className="admin-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nhập email hoặc tên..."
              />
            </Field>
            <Field label="Vai trò">
              <select
                className="admin-input"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">Tất cả vai trò</option>
                <option value="ADMIN">ADMIN (Quản trị)</option>
                <option value="CUSTOMER">CUSTOMER (Khách hàng)</option>
              </select>
            </Field>
          </div>

          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-3 rounded-xl text-sm cursor-pointer"
          >
            Áp dụng bộ lọc
          </button>
        </form>

        {/* Content Layout: Form left, List right */}
        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
          
          {/* Create/Edit Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-navy-950 border border-navy-700/50 rounded-2xl p-6 shadow-xl space-y-4 h-fit"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-100">
                {editingId ? "Chỉnh sửa tài khoản" : "Tạo tài khoản mới"}
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

            <Field label="Email đăng nhập" required>
              <input
                type="email"
                className="admin-input"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                disabled={saving}
                placeholder="name@example.com"
                required
              />
            </Field>

            <Field label="Họ và tên" required>
              <input
                type="text"
                className="admin-input"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                disabled={saving}
                placeholder="Nguyễn Văn A"
                required
              />
            </Field>

            <Field label={editingId ? "Mật khẩu mới (để trống nếu giữ nguyên)" : "Mật khẩu"} required={!editingId}>
              <input
                type="password"
                className="admin-input"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                disabled={saving}
                placeholder={editingId ? "•••••••• (Trống để giữ nguyên)" : "Tối thiểu 6 ký tự"}
                required={!editingId}
              />
            </Field>

            <Field label="Vai trò hệ thống" required>
              <select
                className="admin-input"
                value={form.role}
                onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as "CUSTOMER" | "ADMIN" }))}
                disabled={saving}
              >
                <option value="CUSTOMER">CUSTOMER (Khách hàng)</option>
                <option value="ADMIN">ADMIN (Quản trị viên)</option>
              </select>
            </Field>

            <button
              type="submit"
              disabled={saving || loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 transition-colors cursor-pointer text-sm"
            >
              {saving ? "Đang lưu..." : editingId ? "Cập nhật tài khoản" : "Tạo tài khoản"}
            </button>
          </form>

          {/* Users List Table/Grid */}
          <div className="bg-navy-950 border border-navy-700/50 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-100">Danh sách tài khoản</h2>
              <span className="text-xs text-slate-400">
                {loading ? "Đang tải..." : `Tổng số: ${pagination.totalItems} tài khoản`}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-navy-800 text-slate-400 text-xs font-extrabold uppercase tracking-widest">
                    <th className="py-3 px-4">Tài khoản</th>
                    <th className="py-3 px-4">Vai trò</th>
                    <th className="py-3 px-4">Ngày tạo</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-navy-900/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-100">{u.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{u.email}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                            u.role === "ADMIN"
                              ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                              : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-400">
                        {formatDateTime(u.createdAt)}
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(u.id);
                            setErrorMsg(null);
                            setSuccessMsg(null);
                          }}
                          className="bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg cursor-pointer"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(u)}
                          disabled={currentUser ? u.id === currentUser.id : false}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}

                  {!loading && users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-slate-400 text-sm border border-dashed border-navy-700 rounded-xl p-8 text-center">
                        Không tìm thấy tài khoản nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-navy-800">
              <p className="text-xs text-slate-400">
                Hiển thị trang {pagination.page}/{pagination.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={loading || pagination.page <= 1}
                  className="px-4 py-2 rounded-lg border border-navy-700 bg-navy-800 text-slate-200 text-xs font-bold uppercase tracking-widest disabled:opacity-40 cursor-pointer"
                >
                  Trước
                </button>
                <button
                  type="button"
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={loading || pagination.page >= pagination.totalPages}
                  className="px-4 py-2 rounded-lg border border-navy-700 bg-navy-800 text-slate-200 text-xs font-bold uppercase tracking-widest disabled:opacity-40 cursor-pointer"
                >
                  Sau
                </button>
              </div>
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
