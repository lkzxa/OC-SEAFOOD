"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import ComboForm from "@/components/admin/ComboForm";
import { getAuthHeaders } from "@/components/admin/adminApi";
import { useAuthStore } from "@/store/useAuthStore";

export default function NewComboPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    setSaving(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/combos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(token),
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || "Tạo mới combo thất bại.");
      }

      router.push("/admin/combos");
    } catch (err: any) {
      setErrorMsg(err.message || "Tạo mới combo thất bại. Vui lòng kiểm tra lại dữ liệu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-100 uppercase tracking-tight">
            Thêm Combo Mới
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Thiết kế gói combo hải sản mới để hiển thị công khai trên website.
          </p>
        </div>

        <ComboForm onSubmit={handleSubmit} saving={saving} errorMsg={errorMsg} />
      </div>
    </AdminLayout>
  );
}
