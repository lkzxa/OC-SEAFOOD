"use client";

import { useState, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getAuthHeaders } from "@/components/admin/adminApi";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  placeholder?: string;
  multiple?: boolean;
}

const compressImage = (file: File, maxWidth = 1600, quality = 0.85): Promise<Blob> => {
  if (file.type === "image/gif" || file.type === "image/svg+xml") {
    return Promise.resolve(file);
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          file.type || "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

export default function ImageUploader({ value, onChange, disabled, placeholder = "Nhập URL ảnh hoặc Tải lên...", multiple = false }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token } = useAuthStore();

  const urls = value ? value.split(",").map((u) => u.trim()).filter(Boolean) : [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (15MB)
    if (file.size > 15 * 1024 * 1024) {
      setError("File quá lớn. Vui lòng chọn ảnh dưới 15MB.");
      return;
    }

    setIsUploading(true);
    setError(null);

    let fileToUpload = file;
    try {
      const compressedBlob = await compressImage(file);
      fileToUpload = new File([compressedBlob], file.name, { type: compressedBlob.type });
    } catch (err) {
      console.error("Compression error, uploading original file:", err);
    }

    const formData = new FormData();
    formData.append("image", fileToUpload);

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
      
      if (multiple) {
        const nextUrls = [...urls, data.url];
        onChange(nextUrls.join(","));
      } else {
        onChange(data.url);
      }
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

      {multiple && urls.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-3">
          {urls.map((url, idx) => (
            <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-navy-800 bg-navy-900 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={url} 
                alt={`Preview ${idx + 1}`} 
                className="w-full h-full object-cover" 
                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=200"; }} 
              />
              <button
                type="button"
                onClick={() => {
                  const nextUrls = urls.filter((_, i) => i !== idx);
                  onChange(nextUrls.join(","));
                }}
                className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-lg transition-colors cursor-pointer border-none"
                title="Xóa ảnh này"
              >
                <span className="material-symbols-outlined text-[12px] font-black select-none">close</span>
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-navy-950/80 text-[9px] text-center text-slate-400 py-0.5 font-bold">
                Ảnh {idx + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
