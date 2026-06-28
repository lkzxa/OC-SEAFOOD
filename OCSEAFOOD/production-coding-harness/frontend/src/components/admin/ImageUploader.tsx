"use client";

import { useState, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getAuthHeaders } from "@/components/admin/adminApi";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ImageUploader({ value, onChange, disabled, placeholder = "Nhập URL ảnh hoặc Tải lên..." }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token } = useAuthStore();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File quá lớn. Vui lòng chọn ảnh dưới 5MB.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          ...getAuthHeaders(token),
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Lỗi upload ảnh.");
      
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input 
          className="admin-input flex-1" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          disabled={disabled || isUploading} 
          placeholder={placeholder} 
        />
        <button
          type="button"
          disabled={disabled || isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 bg-navy-700 hover:bg-navy-600 text-slate-200 px-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer border border-navy-600/50"
        >
          {isUploading ? (
            <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-sm">upload_file</span>
          )}
          Tải ảnh
        </button>
      </div>
      <input 
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      {error && <p className="text-red-500 text-xs mt-1 font-semibold">{error}</p>}
    </div>
  );
}
