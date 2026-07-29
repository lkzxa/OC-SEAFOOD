"use client";

import React, { useState, useEffect } from "react";
import ImageUploader from "./ImageUploader";
import Link from "next/link";

interface ComboFormProps {
  initialData?: {
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
  };
  onSubmit: (data: any) => Promise<void>;
  saving: boolean;
  errorMsg: string | null;
}

export default function ComboForm({ initialData, onSubmit, saving, errorMsg }: ComboFormProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [showContact, setShowContact] = useState(false);
  const [image, setImage] = useState("");
  const [tag, setTag] = useState("");
  const [discountBadge, setDiscountBadge] = useState("");
  const [itemsList, setItemsList] = useState<string[]>([""]);
  const [isVisible, setIsVisible] = useState(true);

  // Populate data when editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setSlug(initialData.slug || "");
      setDescription(initialData.description || "");
      setPrice(initialData.price ? initialData.price.toString() : "");
      setOriginalPrice(initialData.originalPrice ? initialData.originalPrice.toString() : "");
      setShowContact(initialData.showContact || false);
      setImage(initialData.image || "");
      setTag(initialData.tag || "");
      setDiscountBadge(initialData.discountBadge || "");
      setItemsList(initialData.items && initialData.items.length > 0 ? initialData.items : [""]);
      setIsVisible(initialData.isVisible !== false);
    }
  }, [initialData]);

  // Helper to generate slug from name
  const generateSlug = () => {
    const fromStr = name || "";
    const toSlug = fromStr
      .toLowerCase()
      .replace(/á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/g, "a")
      .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/g, "e")
      .replace(/í|ì|ỉ|ĩ|ị/g, "i")
      .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/g, "o")
      .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/g, "u")
      .replace(/ý|ỳ|ỷ|ỹ|ỵ/g, "y")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "") // remove special chars
      .trim()
      .replace(/\s+/g, "-") // replace spaces with -
      .replace(/-+/g, "-"); // remove duplicates -
    setSlug(toSlug);
  };

  const handleAddItemRow = () => {
    setItemsList([...itemsList, ""]);
  };

  const handleItemChange = (index: number, val: string) => {
    const updated = [...itemsList];
    updated[index] = val;
    setItemsList(updated);
  };

  const handleRemoveItemRow = (index: number) => {
    if (itemsList.length <= 1) {
      setItemsList([""]);
    } else {
      setItemsList(itemsList.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanItems = itemsList.map((x) => x.trim()).filter((x) => x !== "");
    
    onSubmit({
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      price: showContact || !price ? null : Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      showContact,
      image,
      tag: tag.trim() || null,
      discountBadge: discountBadge.trim() || null,
      items: cleanItems,
      isVisible,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg flex items-start gap-2 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-sm mt-0.5 select-none">error</span>
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-navy-900/60 border border-navy-800 rounded-2xl p-6 md:p-8 shadow-xl">
        {/* left column */}
        <div className="space-y-4">
          {/* Tên Combo */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Tên Combo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Combo Hải Sản Hoàng Gia"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-navy-800/80 border border-navy-700/60 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-orange-500 transition-colors"
              required
              disabled={saving}
            />
          </div>

          {/* Đường dẫn Slug */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex justify-between items-center">
              <span>Đường dẫn (Slug) <span className="text-red-500">*</span></span>
              <button
                type="button"
                onClick={generateSlug}
                className="text-[10px] text-orange-500 hover:text-orange-400 font-extrabold uppercase tracking-wider focus:outline-none cursor-pointer"
              >
                Tự động tạo
              </button>
            </label>
            <input
              type="text"
              placeholder="combo-hai-san-hoang-gia"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="bg-navy-800/80 border border-navy-700/60 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-orange-500 transition-colors"
              required
              disabled={saving}
            />
          </div>

          {/* Giá bán và giá gốc */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Giá bán (VND) {!showContact && <span className="text-red-500">*</span>}
              </label>
              <input
                type="number"
                placeholder={showContact ? "Liên hệ" : "6350000"}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-navy-800/80 border border-navy-700/60 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-orange-500 transition-colors disabled:opacity-50"
                required={!showContact}
                disabled={saving || showContact}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Giá gốc cũ (Nếu có)
              </label>
              <input
                type="number"
                placeholder={showContact ? "Liên hệ" : "7500000"}
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="bg-navy-800/80 border border-navy-700/60 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-orange-500 transition-colors disabled:opacity-50"
                disabled={saving || showContact}
              />
            </div>
          </div>

          {/* Nhãn tag & Khuyến mãi */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Nhãn nổi bật (Tag)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: POPULAR, NEW"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="bg-navy-800/80 border border-navy-700/60 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                disabled={saving}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Huy hiệu giảm giá
              </label>
              <input
                type="text"
                placeholder="Ví dụ: -15%, HOT"
                value={discountBadge}
                onChange={(e) => setDiscountBadge(e.target.value)}
                className="bg-navy-800/80 border border-navy-700/60 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                disabled={saving}
              />
            </div>
          </div>

          {/* Mô tả ngắn */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Mô tả ngắn <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Set bao gồm: King Crab (1.5kg), 2 Tôm Hùm Canada,..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-navy-800/80 border border-navy-700/60 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-orange-500 transition-colors h-24 resize-none"
              required
              disabled={saving}
            />
          </div>

          {/* Trạng thái hiển thị & Liên hệ */}
          <div className="flex flex-col gap-3 pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showContact}
                onChange={(e) => {
                  setShowContact(e.target.checked);
                  if (e.target.checked) {
                    setPrice("");
                    setOriginalPrice("");
                  }
                }}
                className="w-4 h-4 rounded text-orange-500 bg-navy-800 border-navy-700 focus:ring-orange-500 focus:ring-offset-navy-900 cursor-pointer"
                disabled={saving}
              />
              Hiển thị liên hệ (ẩn giá)
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                id="isVisible"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="w-4 h-4 rounded text-orange-500 bg-navy-800 border-navy-700 focus:ring-orange-500 focus:ring-offset-navy-900 cursor-pointer"
                disabled={saving}
              />
              Hiển thị công khai trên website
            </label>
          </div>
        </div>

        {/* right column */}
        <div className="space-y-6">
          {/* Ảnh combo */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Hình ảnh Combo <span className="text-red-500">*</span>
            </label>
            <ImageUploader value={image} onChange={setImage} disabled={saving} />
          </div>

          {/* Danh sách thành phần */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex justify-between items-center">
              <span>Thành phần trong set combo <span className="text-red-500">*</span></span>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-[10px] text-orange-500 hover:text-orange-400 font-extrabold uppercase tracking-wider flex items-center gap-1 focus:outline-none cursor-pointer"
                disabled={saving}
              >
                <span className="material-symbols-outlined text-[14px]">add_circle</span> Thêm dòng
              </button>
            </label>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {itemsList.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder={`Thành phần ${idx + 1}`}
                    value={item}
                    onChange={(e) => handleItemChange(idx, e.target.value)}
                    className="flex-1 bg-navy-800/80 border border-navy-700/60 rounded-xl px-4 py-2 text-slate-200 text-xs focus:outline-none focus:border-orange-500 transition-colors"
                    required
                    disabled={saving}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItemRow(idx)}
                    className="text-slate-500 hover:text-red-400 p-1 focus:outline-none cursor-pointer"
                    disabled={saving}
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-55"
          disabled={saving}
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-base">save</span>
              <span>Lưu Combo</span>
            </>
          )}
        </button>

        <Link
          href="/admin/combos"
          className="bg-navy-900 border border-navy-700 text-slate-300 hover:bg-navy-800/85 font-extrabold text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl transition-all"
        >
          Hủy bỏ
        </Link>
      </div>
    </form>
  );
}
