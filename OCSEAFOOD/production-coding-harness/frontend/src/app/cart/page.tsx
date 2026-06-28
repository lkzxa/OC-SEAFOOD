"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { useAuthStore } from "@/store/useAuthStore";
import { useOrderHistoryStore } from "@/store/useOrderHistoryStore";
import { vietnamLocations } from "@/utils/vietnamLocations";

interface OrderResponse {
  id: number;
  code: string;
  fullName: string;
  email: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  totalFinal: number;
}

function resolveAddressName(
  type: "province" | "district" | "ward",
  value: string,
  provinceValue?: string,
  districtValue?: string
) {
  if (type === "province") {
    return vietnamLocations.find((p) => p.code === value || p.name === value)?.name || value;
  }

  const province = vietnamLocations.find((p) => p.code === provinceValue || p.name === provinceValue);
  if (type === "district") {
    return province?.districts.find((d) => d.code === value || d.name === value)?.name || value;
  }

  const district = province?.districts.find((d) => d.code === districtValue || d.name === districtValue);
  return district?.wards.find((w) => w.code === value || w.name === value)?.name || value;
}

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    isHydrated,
  } = useCart();

  const { user, token } = useAuthStore();
  const { addOrder } = useOrderHistoryStore();

  // Form fields state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [note, setNote] = useState("");

  // UI Flow States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<OrderResponse | null>(null);
  const [phoneFocused, setPhoneFocused] = useState(false);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFullName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  // Dropdown list resolvers
  const selectedProvinceObj = vietnamLocations.find((p) => p.code === province);
  const districtsList = selectedProvinceObj ? selectedProvinceObj.districts : [];
  const selectedDistrictObj = districtsList.find((d) => d.code === district);
  const wardsList = selectedDistrictObj ? selectedDistrictObj.wards : [];

  // Format VND Helper
  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Client-side validations
    if (!fullName || !email || !phone || !province || !district || !ward || !streetAddress) {
      setErrorMsg("Vui lòng nhập đầy đủ toàn bộ thông tin bắt buộc.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Định dạng email không hợp lệ.");
      return;
    }

    const cleanPhone = phone.replace(/\s+/g, "");
    const phoneRegex = /^(0|\+84|84)(3|5|7|8|9)[0-9]{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setErrorMsg("Số điện thoại không đúng định dạng Việt Nam.");
      return;
    }

    if (items.length === 0) {
      setErrorMsg("Giỏ hàng của bạn đang trống.");
      return;
    }

    // BUG-004 fix: Resolve codes → human-readable names before sending to backend
    const provinceName = selectedProvinceObj?.name || province;
    const districtName = selectedDistrictObj?.name || district;
    const wardName = wardsList.find((w) => w.code === ward)?.name || ward;

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          fullName,
          email,
          phone: cleanPhone,
          province: provinceName,
          district: districtName,
          ward: wardName,
          streetAddress,
          note,
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            selectedWeight: item.selectedWeight,
          })),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error?.message || "Đặt hàng thất bại. Vui lòng thử lại.");
      }

      const orderItems = items.map((item) => ({
        productId: item.id,
        name: item.name,
        unit: item.unit,
        quantity: item.quantity,
        priceReference: item.priceReference,
        image: item.image,
      }));

      // Success
      clearCart();
      addOrder({
        id: Number(data.id),
        code: String(data.code),
        userId: user?.id ?? null,
        email,
        fullName,
        phone: cleanPhone,
        province: provinceName,
        district: districtName,
        ward: wardName,
        streetAddress,
        note: note || undefined,
        status: "PENDING",
        totalFinal: Number(data.totalFinal ?? subtotal),
        totalItems: orderItems.reduce((sum, item) => sum + item.quantity, 0),
        items: orderItems,
        createdAt: new Date().toISOString(),
      });
      setSuccessOrder(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đặt hàng thất bại.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  // 1. Success Order Page View
  if (successOrder) {
    const displayProvince = resolveAddressName("province", successOrder.province);
    const displayDistrict = resolveAddressName("district", successOrder.district, successOrder.province);
    const displayWard = resolveAddressName("ward", successOrder.ward, successOrder.province, successOrder.district);

    return (
      <div className="max-w-[800px] mx-auto px-4 py-16 text-center">
        <div className="bg-navy-950 border border-navy-700/50 rounded-2xl p-8 md:p-12 shadow-2xl space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 mb-2">
            <span className="material-symbols-outlined text-4xl select-none">check_circle</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-100 uppercase">
            Đặt Hàng Thành Công!
          </h1>

          <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
            Ngay sau khi đơn hàng được xác nhận thành công, sẽ có nhân viên tư vấn liên hệ và hướng dẫn quý khách thanh toán.
          </p>

          <div className="bg-navy-900 border border-navy-800 rounded-xl p-6 text-left max-w-lg mx-auto space-y-3 text-xs">
            <div className="flex justify-between border-b border-navy-800 pb-2">
              <span className="text-slate-400 font-medium">Mã đơn hàng:</span>
              <span className="text-orange-500 font-extrabold tracking-wider">{successOrder.code}</span>
            </div>
            <div className="flex justify-between border-b border-navy-800 pb-2">
              <span className="text-slate-400 font-medium">Khách hàng:</span>
              <span className="text-slate-200 font-bold">{successOrder.fullName}</span>
            </div>
            <div className="flex justify-between border-b border-navy-800 pb-2">
              <span className="text-slate-400 font-medium">Số điện thoại:</span>
              <span className="text-slate-200 font-bold">{successOrder.phone}</span>
            </div>
            <div className="flex justify-between border-b border-navy-800 pb-2">
              <span className="text-slate-400 font-medium">Địa chỉ giao hàng:</span>
              <span className="text-slate-200 font-bold text-right">
                {`${successOrder.streetAddress}, ${displayWard}, ${displayDistrict}, ${displayProvince}`}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-400 font-medium text-sm">Tạm tính ước tính:</span>
              <span className="text-slate-200 font-black text-sm">{formatVND(successOrder.totalFinal)}</span>
            </div>
          </div>

          <div className="pt-4">
            <Link
              href="/menu"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/15 text-sm"
            >
              TIẾP TỤC MUA SẮM
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Waiting for client hydration to prevent server-client discrepancy
  if (!isHydrated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest">
        Đang tải thông tin giỏ hàng...
      </div>
    );
  }

  // 2. Empty Cart View
  if (items.length === 0) {
    return (
      <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
        <div className="bg-navy-950 border border-navy-700/50 rounded-2xl p-8 md:p-12 shadow-2xl space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-navy-800 text-slate-400 mb-2">
            <span className="material-symbols-outlined text-4xl select-none">shopping_cart</span>
          </div>

          <h1 className="text-2xl font-black text-slate-100 uppercase tracking-tight">
            Giỏ Hàng Đang Trống
          </h1>

          <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
            Hiện tại bạn chưa thêm bất kỳ sản phẩm nào vào giỏ hàng. Hãy tham khảo thực đơn hải sản tươi sống và chọn món yêu thích của bạn nhé!
          </p>

          <div className="pt-4">
            <Link
              href="/menu"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/15 text-sm"
            >
              QUAY LẠI CỬA HÀNG
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Normal Split Cart & Checkout Page View
  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-10 py-12">
      <h1 className="text-3xl font-black tracking-tight text-slate-100 uppercase mb-8 border-l-4 border-orange-500 pl-4">
        Giỏ hàng & Đặt hàng
      </h1>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg mb-6 flex items-start gap-2 max-w-[1200px] mx-auto animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-sm mt-0.5 select-none">error</span>
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-[1400px] mx-auto">

        {/* Left Column: Cart Items List (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-navy-950/60 border border-navy-700/50 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-200 border-b border-navy-800 pb-3 flex justify-between items-center">
              <span>Danh sách sản phẩm</span>
              <span className="text-xs text-slate-400 font-medium">({items.length} mặt hàng)</span>
            </h2>

            <div className="divide-y divide-navy-800">
              {items.map((item) => (
                <div key={`${item.id}-${item.selectedWeight || ""}`} className="py-4 flex gap-4 first:pt-0 last:pb-0 items-center justify-between">
                  <div className="flex gap-4 items-center flex-1 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg border border-navy-700 bg-navy-900"
                      // BUG-L04 fix: Fallback khi ảnh bị lỗi/404
                      onError={(e) => {
                        e.currentTarget.src = '';
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    {/* BUG-L04 fix: Fallback icon khi ảnh bị lỗi, ẩn mặc định */}
                    <div className="hidden w-16 h-16 rounded-lg border border-navy-700 bg-navy-900 items-center justify-center text-slate-500 shrink-0">
                      <span className="material-symbols-outlined text-2xl">image_not_supported</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-200 truncate">{item.name}</h3>
                      <div className="flex items-center flex-wrap gap-2 mt-0.5">
                        <p className="text-[11px] text-slate-400 font-medium">
                          Quy cách: {item.unit}
                        </p>
                        {item.selectedWeight && (
                          <span className="px-1.5 py-0.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded text-[9px] font-black uppercase">
                            {item.selectedWeight}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-orange-400 font-extrabold mt-1">
                        {formatVND(item.priceReference)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Actions & Price */}
                  <div className="flex items-center gap-6">
                    {/* Quantity controls */}
                    <div className="flex items-center bg-navy-900 border border-navy-700 rounded-lg overflow-hidden h-8">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedWeight)}
                        className="px-2 text-slate-400 hover:text-slate-200 hover:bg-navy-800 transition-colors h-full focus:outline-none"
                      >
                        <span className="material-symbols-outlined text-sm select-none">remove</span>
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-200">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedWeight)}
                        className="px-2 text-slate-400 hover:text-slate-200 hover:bg-navy-800 transition-colors h-full focus:outline-none"
                      >
                        <span className="material-symbols-outlined text-sm select-none">add</span>
                      </button>
                    </div>

                    {/* Subtotal & Delete */}
                    <div className="text-right min-w-[90px]">
                      <p className="text-xs font-black text-slate-200">
                        {formatVND(item.priceReference * item.quantity)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id, item.selectedWeight)}
                      className="text-slate-400 hover:text-red-400 transition-colors focus:outline-none p-1"
                      aria-label="Remove item"
                    >
                      <span className="material-symbols-outlined text-lg select-none">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Form (5 cols on desktop) */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleCheckoutSubmit}
            noValidate
            className="bg-gradient-to-br from-navy-900 to-navy-950 border border-navy-700/50 rounded-2xl p-6 md:p-8 shadow-xl space-y-6"
          >
            <h2 className="text-lg font-bold text-slate-200 border-b border-navy-800 pb-3">
              Thông tin nhận hàng
            </h2>

            <div className="space-y-4">
              {/* Họ tên */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center bg-navy-800/80 border border-navy-700/60 rounded-xl px-4 py-1.5 focus-within:border-orange-500 transition-colors">
                  <span className="material-symbols-outlined text-slate-400 select-none text-xl">person</span>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-transparent border-none text-slate-200 text-sm w-full py-2 ml-3 focus:outline-none focus:ring-0"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Email & Phone grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Email nhận đơn <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center bg-navy-800/80 border border-navy-700/60 rounded-xl px-4 py-1.5 focus-within:border-orange-500 transition-colors">
                    <span className="material-symbols-outlined text-slate-400 select-none text-xl">mail</span>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-transparent border-none text-slate-200 text-sm w-full py-2 ml-3 focus:outline-none focus:ring-0"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                {/* Số điện thoại */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center bg-navy-800/80 border border-navy-700/60 rounded-xl px-4 py-1.5 focus-within:border-orange-500 transition-colors">
                    <span className="material-symbols-outlined text-slate-400 select-none text-xl">call</span>
                    <input
                      type="tel"
                      placeholder="0912345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onFocus={() => setPhoneFocused(true)}
                      onBlur={() => setPhoneFocused(false)}
                      className="bg-transparent border-none text-slate-200 text-sm w-full py-2 ml-3 focus:outline-none focus:ring-0"
                      disabled={loading}
                      required
                    />
                  </div>
                  {phoneFocused && (
                    <p className="text-red-500 text-[10px] font-semibold mt-1 leading-normal uppercase">
                      KHÁCH HÀNG VUI LÒNG SỬ DỤNG SỐ ĐIỆN THOẠI SỬ DỤNG ZALO ĐỂ NHÂN VIÊN GỌI ĐIỆN TƯ VẤN SẢN PHẨM
                    </p>
                  )}
                </div>
              </div>

              {/* Province / District / Ward selectors */}
              <div className="space-y-4 border-t border-navy-800/50 pt-4">
                <p className="text-[11px] font-black text-orange-400 uppercase tracking-widest">
                  Địa chỉ giao nhận
                </p>

                {/* Tỉnh/Thành phố */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Tỉnh / Thành phố <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center bg-navy-800/80 border border-navy-700/60 rounded-xl px-4 py-2.5 focus-within:border-orange-500 transition-colors">
                    <span className="material-symbols-outlined text-slate-400 select-none text-xl mr-3">location_on</span>
                    <select
                      value={province}
                      onChange={(e) => {
                        setProvince(e.target.value);
                        setDistrict("");
                        setWard("");
                      }}
                      className="bg-transparent border-none text-slate-200 text-sm w-full focus:outline-none focus:ring-0 cursor-pointer"
                      disabled={loading}
                      required
                    >
                      <option value="" className="bg-navy-900 text-slate-300">-- Chọn Tỉnh/Thành phố --</option>
                      {vietnamLocations.map((p) => (
                        <option key={p.code} value={p.code} className="bg-navy-900 text-slate-300">
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quận/Huyện & Phường/Xã */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Quận/Huyện */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      Quận / Huyện <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center bg-navy-800/80 border border-navy-700/60 rounded-xl px-4 py-2.5 focus-within:border-orange-500 transition-colors">
                      <select
                        value={district}
                        onChange={(e) => {
                          setDistrict(e.target.value);
                          setWard("");
                        }}
                        className="bg-transparent border-none text-slate-200 text-sm w-full focus:outline-none focus:ring-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading || !province}
                        required
                      >
                        <option value="" className="bg-navy-900 text-slate-300">-- Chọn Quận/Huyện --</option>
                        {districtsList.map((d) => (
                          <option key={d.code} value={d.code} className="bg-navy-900 text-slate-300">
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Phường/Xã */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      Phường / Xã <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center bg-navy-800/80 border border-navy-700/60 rounded-xl px-4 py-2.5 focus-within:border-orange-500 transition-colors">
                      <select
                        value={ward}
                        onChange={(e) => setWard(e.target.value)}
                        className="bg-transparent border-none text-slate-200 text-sm w-full focus:outline-none focus:ring-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading || !district}
                        required
                      >
                        <option value="" className="bg-navy-900 text-slate-300">-- Chọn Phường/Xã --</option>
                        {wardsList.map((w) => (
                          <option key={w.code} value={w.code} className="bg-navy-900 text-slate-300">
                            {w.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Số nhà, tên đường */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Số nhà, tên đường <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center bg-navy-800/80 border border-navy-700/60 rounded-xl px-4 py-1.5 focus-within:border-orange-500 transition-colors">
                    <span className="material-symbols-outlined text-slate-400 select-none text-xl">home</span>
                    <input
                      type="text"
                      placeholder="Số 12, Ngõ 345, Đường Lê Lợi"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className="bg-transparent border-none text-slate-200 text-sm w-full py-2 ml-3 focus:outline-none focus:ring-0"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Ghi chú */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Ghi chú đơn hàng (Tùy chọn)
                </label>
                <div className="flex items-start bg-navy-800/80 border border-navy-700/60 rounded-xl px-4 py-2.5 focus-within:border-orange-500 transition-colors">
                  <textarea
                    rows={2}
                    placeholder="Giao giờ hành chính, gọi trước khi đến..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="bg-transparent border-none text-slate-200 text-sm w-full ml-1 focus:outline-none focus:ring-0 resize-none"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-navy-800 pt-4 space-y-2 text-xs font-semibold">
              <div className="flex justify-between text-slate-400">
                <span>Tổng giá tạm tính:</span>
                <span className="text-slate-200">{formatVND(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Phí vận chuyển:</span>
                <span className="text-slate-200 text-[10px] uppercase font-bold text-orange-400">Tư vấn báo sau</span>
              </div>
              <div className="flex justify-between border-t border-navy-800 pt-3 text-sm font-bold text-slate-200">
                <span className="text-slate-300">Tổng cộng ước tính:</span>
                <span className="text-orange-500 font-black text-base">{formatVND(subtotal)}</span>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/10 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
            >
              {loading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT HÀNG"}
            </button>

            <p className="text-[10px] text-slate-400 leading-normal text-center pt-1">
              * QUÝ KHÁCH ĐẶT HÀNG SẼ ĐƯỢC NHÂN VIÊN GỌI TƯ VẤN TRỰC TIẾP QUA ZALO *
            </p>
          </form>
        </div>

      </div>
    </div>
  );
}
