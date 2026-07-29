"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { getAuthHeaders, unwrapCollection } from "@/components/admin/adminApi";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";

interface Combo {
  id: number;
  name: string;
  slug: string;
  description: string;
  originalPrice?: number | null;
  price?: number | null;
  showContact?: boolean;
  image: string;
  tag?: string | null;
  discountBadge?: string | null;
  items: string[];
  isVisible: boolean;
}

export default function AdminCombosPage() {
  const { token } = useAuthStore();
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCombos = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/combos/admin", {
        headers: getAuthHeaders(token),
      });
      if (!res.ok) {
        throw new Error("Không thể tải danh sách combo.");
      }
      const data = await res.json();
      setCombos(unwrapCollection<Combo>(data));
    } catch (err: any) {
      setErrorMsg(err.message || "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCombos();
  }, [token]);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa combo "${name}"? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/combos/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || "Xóa combo thất bại.");
      }

      setSuccessMsg(`Đã xóa combo "${name}" thành công.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      setCombos(combos.filter((c) => c.id !== id));
    } catch (err: any) {
      setErrorMsg(err.message || "Xóa thất bại.");
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  const formatPrice = (val: number | string | null | undefined) => {
    if (val === null || val === undefined || val === "") return "-";
    const numeric = Number(val);
    if (!Number.isFinite(numeric)) return "-";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(numeric)
      .replace(/\s/g, "");
  };

  const filteredCombos = combos.filter((combo) =>
    combo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    combo.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    combo.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-navy-800 pb-5">
          <div>
            <h1 className="text-2xl font-black text-slate-100 uppercase tracking-tight">
              Quản lý Set Combo Hải Sản
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Thêm mới, sửa đổi thông tin các gói combo hải sản phối sẵn của nhà hàng.
            </p>
          </div>
          <Link
            href="/admin/combos/new"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-widest px-5 py-3 rounded-xl shadow-lg shadow-orange-500/15 transition-all self-start sm:self-auto cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg select-none">add</span>
            Thêm combo mới
          </Link>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-4 py-3.5 rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
            <span className="material-symbols-outlined text-sm select-none">check_circle</span>
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3.5 rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
            <span className="material-symbols-outlined text-sm select-none">error</span>
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* Filter controls */}
        <div className="flex items-center bg-navy-900/60 border border-navy-800 rounded-xl px-4 py-1.5 focus-within:border-orange-500/50 transition-colors max-w-md shadow-md">
          <span className="material-symbols-outlined text-slate-500 text-xl select-none">search</span>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên combo, mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-slate-200 text-sm w-full py-2.5 ml-3 focus:outline-none focus:ring-0"
          />
        </div>

        {/* Combos Table */}
        <div className="bg-navy-900/40 border border-navy-800/80 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredCombos.length === 0 ? (
            <div className="text-center py-20 text-slate-500 text-sm">
              <span className="material-symbols-outlined text-4xl block mb-2 opacity-40">widgets</span>
              {searchTerm ? "Không tìm thấy combo nào khớp với từ khóa tìm kiếm." : "Chưa có combo hải sản nào được tạo."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-navy-950/70 border-b border-navy-800/80 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    <th className="py-4 px-6 w-20">Hình ảnh</th>
                    <th className="py-4 px-6">Thông tin Combo</th>
                    <th className="py-4 px-6 text-right">Giá Combo</th>
                    <th className="py-4 px-6">Trạng thái</th>
                    <th className="py-4 px-6 text-center w-28">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-900/60 text-slate-300">
                  {filteredCombos.map((combo) => (
                    <tr key={combo.id} className="hover:bg-navy-850/40 transition-colors">
                      <td className="py-4 px-6 vertical-align-middle">
                        <img
                          src={combo.image}
                          alt={combo.name}
                          className="w-14 h-14 object-cover rounded-lg border border-navy-800 bg-navy-950"
                        />
                      </td>
                      <td className="py-4 px-6 vertical-align-middle">
                        <div className="font-extrabold text-slate-100 text-sm">{combo.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 max-w-md truncate">
                          {combo.description}
                        </div>
                        {/* Items count & badging */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="bg-navy-950 px-2 py-0.5 border border-navy-800 rounded text-[9px] font-bold text-slate-400">
                            {combo.items.length} món
                          </span>
                          {combo.tag && (
                            <span className="bg-orange-500/10 px-2 py-0.5 border border-orange-500/20 text-orange-400 rounded text-[9px] font-extrabold uppercase tracking-wider">
                              {combo.tag}
                            </span>
                          )}
                          {combo.discountBadge && (
                            <span className="bg-red-500/10 px-2 py-0.5 border border-red-500/20 text-red-400 rounded text-[9px] font-extrabold uppercase tracking-wider">
                              {combo.discountBadge}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right vertical-align-middle font-bold text-slate-100">
                        {combo.showContact ? (
                          <span className="inline-flex items-center gap-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[12px]">call</span>
                            Liên hệ
                          </span>
                        ) : (
                          <>
                            {combo.originalPrice && (
                              <div className="text-[10px] text-slate-500 line-through mr-1">
                                {formatPrice(combo.originalPrice)}
                              </div>
                            )}
                            <div className="text-orange-400 font-extrabold">{formatPrice(combo.price)}</div>
                          </>
                        )}
                      </td>
                      <td className="py-4 px-6 vertical-align-middle">
                        {combo.isVisible ? (
                          <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                            Công khai
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            Ẩn
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 vertical-align-middle text-center">
                        <div className="flex justify-center items-center gap-1.5">
                          <Link
                            href={`/admin/combos/edit/${combo.id}`}
                            className="p-1.5 bg-navy-950 hover:bg-navy-800 text-slate-400 hover:text-slate-200 border border-navy-800 hover:border-navy-700 rounded-lg transition-colors cursor-pointer"
                            title="Sửa thông tin"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </Link>
                          <button
                            onClick={() => handleDelete(combo.id, combo.name)}
                            className="p-1.5 bg-navy-950 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-navy-800 hover:border-red-500/20 rounded-lg transition-colors cursor-pointer"
                            title="Xóa combo"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
