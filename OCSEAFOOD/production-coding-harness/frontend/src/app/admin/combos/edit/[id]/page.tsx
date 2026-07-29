"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import ComboForm from "@/components/admin/ComboForm";
import { getAuthHeaders } from "@/components/admin/adminApi";
import { useAuthStore } from "@/store/useAuthStore";

interface Combo {
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

export default function EditComboPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const idStr = params.id as string;
  const id = parseInt(idStr, 10);

  const [combo, setCombo] = useState<Combo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCombo() {
      if (isNaN(id)) {
        setErrorMsg("ID combo không hợp lệ.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/combos/${id}`, {
          headers: getAuthHeaders(token),
        });
        if (!res.ok) {
          throw new Error("Không thể tải thông tin combo.");
        }
        const data = await res.json();
        setCombo(data);
      } catch (err: any) {
        setErrorMsg(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    }
    fetchCombo();
  }, [id, token]);

  const handleSubmit = async (data: any) => {
    setSaving(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/combos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(token),
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || "Cập nhật combo thất bại.");
      }

      router.push("/admin/combos");
    } catch (err: any) {
      setErrorMsg(err.message || "Cập nhật combo thất bại. Vui lòng kiểm tra lại dữ liệu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-100 uppercase tracking-tight">
            Chỉnh Sửa Combo
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cập nhật lại thông tin, giá bán hoặc thành phần của gói combo hải sản.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : errorMsg && !combo ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg font-semibold max-w-md">
            {errorMsg}
          </div>
        ) : (
          <ComboForm
            initialData={combo || undefined}
            onSubmit={handleSubmit}
            saving={saving}
            errorMsg={errorMsg}
          />
        )}
      </div>
    </AdminLayout>
  );
}
