"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { getAuthHeaders, unwrapCollection } from "@/components/admin/adminApi";
import { useAuthStore } from "@/store/useAuthStore";
import { OrderAuditEntry, useOrderAuditStore } from "@/store/useOrderAuditStore";

type OrderStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productUnit: string;
  quantity: number;
  priceFinal: number | string;
  totalFinal: number | string;
}

interface Order {
  id: number;
  code: string;
  fullName: string;
  email: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  note?: string | null;
  status: OrderStatus;
  totalFinal: number | string;
  createdAt: string;
  orderItems?: OrderItem[];
}

interface OrderDraftItem {
  id: number;
  productName: string;
  productUnit: string;
  quantity: number;
  priceFinal: string;
}

interface OrderDraft {
  id: number;
  code: string;
  status: OrderStatus;
  note: string;
  items: OrderDraftItem[];
}

interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const statusOptions: Array<{ value: ""; label: string }> | Array<{ value: OrderStatus | ""; label: string }> = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ tư vấn" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value));

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const statusLabel = (status: OrderStatus) => {
  if (status === "CONFIRMED") return "Đã xác nhận";
  if (status === "CANCELLED") return "Đã hủy";
  return "Chờ tư vấn";
};

const statusClass = (status: OrderStatus) => {
  if (status === "CONFIRMED") return "bg-green-500/10 text-green-400 border-green-500/20";
  if (status === "CANCELLED") return "bg-red-500/10 text-red-400 border-red-500/20";
  return "bg-orange-500/10 text-orange-400 border-orange-500/20";
};

const renderAuditDiff = (entry: OrderAuditEntry) => {
  const oldValues = entry.oldValues as Record<string, any>;
  const newValues = entry.newValues as Record<string, any>;

  return (
    <div className="space-y-2 text-xs text-slate-300">
      {entry.changedFields.map((field) => {
        if (field === "status") {
          const oldLabel = statusLabel(oldValues.status as OrderStatus);
          const newLabel = statusLabel(newValues.status as OrderStatus);
          return (
            <div key={field} className="flex items-center gap-2">
              <span className="text-slate-500 font-bold">Trạng thái:</span>
              <span className="line-through text-slate-400">{oldLabel}</span>
              <span className="text-slate-400">➔</span>
              <span className="text-green-400 font-bold">{newLabel}</span>
            </div>
          );
        }

        if (field === "note") {
          const oldNote = oldValues.note || "(Trống)";
          const newNote = newValues.note || "(Trống)";
          return (
            <div key={field} className="space-y-1">
              <span className="text-slate-500 font-bold">Ghi chú:</span>
              <div className="pl-3 border-l-2 border-navy-800 text-slate-400 italic">
                "{oldNote}" ➔ "{newNote}"
              </div>
            </div>
          );
        }

        if (field === "totalFinal") {
          const oldTotal = oldValues.totalFinal as number;
          const newTotal = newValues.totalFinal as number;
          return (
            <div key={field} className="flex items-center gap-2">
              <span className="text-slate-500 font-bold">Tổng tiền:</span>
              <span className="line-through text-slate-400">{formatCurrency(oldTotal)}</span>
              <span className="text-slate-400">➔</span>
              <span className="text-orange-400 font-black">{formatCurrency(newTotal)}</span>
            </div>
          );
        }

        if (field === "items") {
          const oldItems = (oldValues.items || []) as Array<{ id: number; quantity: number; priceFinal: number }>;
          const newItems = (newValues.items || []) as Array<{ id: number; quantity: number; priceFinal: number }>;
          
          return (
            <div key={field} className="space-y-1">
              <span className="text-slate-500 font-bold">Sản phẩm điều chỉnh:</span>
              <ul className="pl-3 space-y-1.5 list-disc border-l-2 border-navy-800">
                {oldItems.map((oldItem, idx) => {
                  const newItem = newItems[idx];
                  if (!newItem) return null;
                  
                  return (
                    <li key={oldItem.id} className="text-[11px] text-slate-400 leading-relaxed">
                      Sản phẩm (ID: {oldItem.id}): Số lượng {oldItem.quantity} ➔ {newItem.quantity} · Giá {formatCurrency(oldItem.priceFinal)} ➔ {formatCurrency(newItem.priceFinal)}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};


function buildQuery(page: number, pageSize: number, filters: { status: string; phone: string; email: string }) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (filters.status) params.set("status", filters.status);
  if (filters.phone) params.set("phone", filters.phone);
  if (filters.email) params.set("email", filters.email);

  return params.toString();
}

function createDraft(order: Order): OrderDraft {
  return {
    id: order.id,
    code: order.code,
    status: order.status,
    note: order.note || "",
    items: (order.orderItems || []).map((item) => ({
      id: item.id,
      productName: item.productName,
      productUnit: item.productUnit,
      quantity: item.quantity,
      priceFinal: String(Number(item.priceFinal)),
    })),
  };
}

function computeDraftTotal(items: OrderDraftItem[]) {
  return items.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.priceFinal) || 0;
    return sum + quantity * price;
  }, 0);
}

function buildAuditEntry(previous: Order, draft: OrderDraft, submittedTotal: number): OrderAuditEntry | null {
  const changedFields: string[] = [];
  const oldValues: Record<string, unknown> = {};
  const newValues: Record<string, unknown> = {};

  if (draft.status !== previous.status) {
    changedFields.push("status");
    oldValues.status = previous.status;
    newValues.status = draft.status;
  }

  if (draft.note !== (previous.note || "")) {
    changedFields.push("note");
    oldValues.note = previous.note || null;
    newValues.note = draft.note;
  }

  const previousItems = previous.orderItems || [];
  const oldItems: Array<Record<string, unknown>> = [];
  const newItems: Array<Record<string, unknown>> = [];

  for (const item of draft.items) {
    const previousItem = previousItems.find((existingItem) => existingItem.id === item.id);
    if (!previousItem) continue;

    const previousQuantity = Number(previousItem.quantity);
    const previousPrice = Number(previousItem.priceFinal);
    const nextQuantity = Number(item.quantity);
    const nextPrice = Number(item.priceFinal);

    if (previousQuantity !== nextQuantity || previousPrice !== nextPrice) {
      oldItems.push({
        id: item.id,
        quantity: previousQuantity,
        priceFinal: previousPrice,
      });
      newItems.push({
        id: item.id,
        quantity: nextQuantity,
        priceFinal: nextPrice,
      });
    }
  }

  if (oldItems.length > 0) {
    changedFields.push("items");
    oldValues.items = oldItems;
    newValues.items = newItems;
  }

  if (Number(previous.totalFinal) !== submittedTotal) {
    changedFields.push("totalFinal");
    oldValues.totalFinal = Number(previous.totalFinal);
    newValues.totalFinal = submittedTotal;
  }

  if (changedFields.length === 0) {
    return null;
  }

  return {
    id: `${previous.id}-${Date.now()}`,
    orderId: previous.id,
    orderCode: previous.code,
    changedFields,
    oldValues,
    newValues,
    note: draft.note || null,
    createdAt: new Date().toISOString(),
  };
}

export default function AdminOrdersPage() {
  const { token } = useAuthStore();
  const { entries, append } = useOrderAuditStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({ status: "", phone: "", email: "" });
  const [draftFilters, setDraftFilters] = useState(filters);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<OrderDraft | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  const summary = useMemo(() => {
    const pending = orders.filter((order) => order.status === "PENDING").length;
    const confirmed = orders.filter((order) => order.status === "CONFIRMED").length;
    const cancelled = orders.filter((order) => order.status === "CANCELLED").length;
    return { pending, confirmed, cancelled };
  }, [orders]);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) || null,
    [orders, selectedOrderId]
  );

  const selectedAudits = useMemo(
    () => entries.filter((entry) => entry.orderId === selectedOrderId),
    [entries, selectedOrderId]
  );

  const loadOrders = async (page = pagination.page, appliedFilters = filters) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const query = buildQuery(page, pagination.pageSize, appliedFilters);
      const res = await fetch(`/api/orders?${query}`, {
        headers: {
          ...getAuthHeaders(token),
        },
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error?.message || "Không thể tải danh sách đơn hàng.");
      }

      setOrders(unwrapCollection<Order>(json));
      setPagination((prev) => ({
        ...prev,
        ...((json?.pagination as Pagination | undefined) ?? {}),
        page,
      }));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(1, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(draftFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
    loadOrders(1, draftFilters);
  };

  const resetFilters = () => {
    setDraftFilters({ status: "", phone: "", email: "" });
    setFilters({ status: "", phone: "", email: "" });
    setPagination((prev) => ({ ...prev, page: 1 }));
    loadOrders(1, { status: "", phone: "", email: "" });
  };

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, page: nextPage }));
    loadOrders(nextPage, filters);
  };

  const openOrderEditor = (order: Order) => {
    setSelectedOrderId(order.id);
    setSelectedDraft(createDraft(order));
    setOrderSuccessMsg(null);
  };

  const closeOrderEditor = () => {
    setSelectedOrderId(null);
    setSelectedDraft(null);
    setOrderSuccessMsg(null);
  };

  const updateDraftItem = (itemId: number, patch: Partial<OrderDraftItem>) => {
    setSelectedDraft((current) => {
      if (!current) return current;
      return {
        ...current,
        items: current.items.map((item) =>
          item.id === itemId ? { ...item, ...patch } : item
        ),
      };
    });
  };

  const saveOrderChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !selectedDraft) return;

    setSavingOrder(true);
    setErrorMsg(null);
    setOrderSuccessMsg(null);

    try {
      const totalFinal = computeDraftTotal(selectedDraft.items);
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(token),
        },
        body: JSON.stringify({
          status: selectedDraft.status,
          note: selectedDraft.note || undefined,
          totalFinal,
          items: selectedDraft.items.map((item) => ({
            id: item.id,
            quantity: Number(item.quantity),
            priceFinal: Number(item.priceFinal),
          })),
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error?.message || "Không thể lưu thay đổi đơn hàng.");
      }

      const auditEntry = buildAuditEntry(selectedOrder, selectedDraft, totalFinal);
      if (auditEntry) {
        append(auditEntry);
      }

      setOrderSuccessMsg("Đã cập nhật đơn hàng.");
      if (json && typeof json === "object") {
        setSelectedDraft(createDraft(json as Order));
      }
      await loadOrders(pagination.page, filters);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể lưu thay đổi đơn hàng.");
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.35em] text-slate-400">
              Admin / Orders
            </p>
            <h1 className="text-3xl font-black uppercase tracking-tight text-slate-100 mt-1">
              Quản lý đơn hàng
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Lọc lead theo trạng thái và theo dõi thông tin tư vấn khách hàng.
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

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Chờ tư vấn" value={summary.pending} tone="orange" />
          <StatCard label="Đã xác nhận" value={summary.confirmed} tone="green" />
          <StatCard label="Đã hủy" value={summary.cancelled} tone="red" />
        </section>

        <form
          onSubmit={applyFilters}
          className="bg-navy-950 border border-navy-700/50 rounded-2xl p-6 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Bộ lọc đơn hàng</h2>
              <p className="text-slate-400 text-sm mt-1">
                Lọc theo trạng thái, số điện thoại hoặc email.
              </p>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-orange-400"
            >
              Xóa bộ lọc
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Trạng thái">
              <select
                className="admin-input"
                value={draftFilters.status}
                onChange={(e) => setDraftFilters((prev) => ({ ...prev, status: e.target.value }))}
              >
                {statusOptions.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Số điện thoại">
              <input
                className="admin-input"
                value={draftFilters.phone}
                onChange={(e) => setDraftFilters((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="0912345678"
              />
            </Field>
            <Field label="Email">
              <input
                className="admin-input"
                value={draftFilters.email}
                onChange={(e) => setDraftFilters((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="customer@example.com"
              />
            </Field>
          </div>

          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-3 rounded-xl text-sm"
          >
            Áp dụng bộ lọc
          </button>
        </form>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
            {errorMsg}
          </div>
        )}

        <div className="bg-navy-950 border border-navy-700/50 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="text-lg font-bold text-slate-100">Danh sách đơn hàng</h2>
            <span className="text-xs text-slate-400">
              {loading ? "Đang tải..." : `Trang ${pagination.page}/${pagination.totalPages}`}
            </span>
          </div>

          <div className="space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-xl border border-navy-800 bg-navy-900 p-5">
                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-black text-slate-100">{order.code}</h3>
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border ${statusClass(order.status)}`}
                      >
                        {statusLabel(order.status)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{formatDateTime(order.createdAt)}</p>
                    <p className="text-sm text-slate-300">
                      <span className="text-slate-500">Khách:</span> {order.fullName}
                    </p>
                    <p className="text-sm text-slate-300">
                      <span className="text-slate-500">Liên hệ:</span> {order.phone} · {order.email}
                    </p>
                    <p className="text-sm text-slate-300">
                      <span className="text-slate-500">Địa chỉ:</span> {order.streetAddress}, {order.ward}, {order.district}, {order.province}
                    </p>
                    {order.note ? (
                      <p className="text-sm text-slate-400">
                        <span className="text-slate-500">Ghi chú:</span> {order.note}
                      </p>
                    ) : null}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-400">Tổng tiền</p>
                    <p className="text-2xl font-black text-orange-500">{formatCurrency(order.totalFinal)}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {order.orderItems?.length || 0} sản phẩm
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => openOrderEditor(order)}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg"
                  >
                    Chỉnh sửa giá
                  </button>
                  <button
                    type="button"
                    onClick={() => openOrderEditor(order)}
                    className="bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg"
                  >
                    Xem chi tiết
                  </button>
                </div>

                {order.orderItems && order.orderItems.length > 0 ? (
                  <div className="mt-4 border-t border-navy-800 pt-4 space-y-2">
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                      Sản phẩm trong đơn
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {order.orderItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-navy-800 bg-navy-950/80 px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-100 truncate">
                              {item.productName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {item.quantity} x {item.productUnit}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-slate-300">
                            {formatCurrency(item.totalFinal)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            ))}

            {!loading && orders.length === 0 && (
              <div className="text-slate-400 text-sm border border-dashed border-navy-700 rounded-xl p-8 text-center">
                Không có đơn hàng phù hợp.
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-navy-800">
            <p className="text-xs text-slate-400">
              Tổng số: {pagination.total} đơn
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(pagination.page - 1)}
                disabled={loading || pagination.page <= 1}
                className="px-4 py-2 rounded-lg border border-navy-700 bg-navy-800 text-slate-200 text-xs font-bold uppercase tracking-widest disabled:opacity-40"
              >
                Trước
              </button>
              <span className="text-xs text-slate-400">
                {pagination.page}/{pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => goToPage(pagination.page + 1)}
                disabled={loading || pagination.page >= pagination.totalPages}
                className="px-4 py-2 rounded-lg border border-navy-700 bg-navy-800 text-slate-200 text-xs font-bold uppercase tracking-widest disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        </div>

        {selectedOrder && selectedDraft ? (
          <div className="bg-navy-950 border border-navy-700/50 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.35em] text-slate-400">
                  Chỉnh sửa đơn hàng
                </p>
                <h2 className="text-2xl font-black text-slate-100 mt-1">{selectedOrder.code}</h2>
                <p className="text-sm text-slate-400 mt-1">
                  {selectedOrder.fullName} · {selectedOrder.phone}
                </p>
              </div>
              <button
                type="button"
                onClick={closeOrderEditor}
                className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-orange-400"
              >
                Đóng
              </button>
            </div>

            {orderSuccessMsg && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-3 rounded-lg">
                {orderSuccessMsg}
              </div>
            )}

            <form onSubmit={saveOrderChanges} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Trạng thái">
                  <select
                    className="admin-input"
                    value={selectedDraft.status}
                    onChange={(e) =>
                      setSelectedDraft((current) =>
                        current ? { ...current, status: e.target.value as OrderStatus } : current
                      )
                    }
                  >
                    <option value="PENDING">Chờ tư vấn</option>
                    <option value="CONFIRMED">Đã xác nhận</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </Field>
                <Field label="Tổng tiền đề xuất">
                  <input
                    className="admin-input"
                    value={formatCurrency(computeDraftTotal(selectedDraft.items))}
                    readOnly
                  />
                </Field>
                <Field label="Ghi chú">
                  <input
                    className="admin-input"
                    value={selectedDraft.note}
                    onChange={(e) =>
                      setSelectedDraft((current) => (current ? { ...current, note: e.target.value } : current))
                    }
                  />
                </Field>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                  Chỉnh sửa sản phẩm trong đơn
                </p>
                <div className="space-y-3">
                  {selectedDraft.items.map((item) => (
                    <div key={item.id} className="rounded-xl border border-navy-800 bg-navy-900 p-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="font-semibold text-slate-100">{item.productName}</h3>
                          <p className="text-xs text-slate-500">{item.productUnit}</p>
                        </div>
                        <p className="text-sm font-bold text-orange-400">
                          {formatCurrency(Number(item.priceFinal) * Number(item.quantity))}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Số lượng">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            className="admin-input"
                            value={item.quantity}
                            onChange={(e) =>
                              updateDraftItem(item.id, { quantity: Number(e.target.value) })
                            }
                          />
                        </Field>
                        <Field label="Đơn giá cuối">
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            className="admin-input"
                            value={item.priceFinal}
                            onChange={(e) =>
                              updateDraftItem(item.id, { priceFinal: e.target.value })
                            }
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={savingOrder}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-3 rounded-xl text-sm disabled:opacity-50"
              >
                {savingOrder ? "Đang lưu..." : "Lưu thay đổi đơn hàng"}
              </button>
            </form>

            <div className="border-t border-navy-800 pt-6 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                    Nhật ký thay đổi
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Hiển thị các chỉnh sửa vừa lưu trên giao diện này.
                  </p>
                </div>
                <span className="text-xs text-slate-400">{selectedAudits.length} mục</span>
              </div>

              {selectedAudits.length > 0 ? (
                <div className="space-y-3">
                  {selectedAudits.map((entry) => (
                    <div key={entry.id} className="rounded-xl border border-navy-800 bg-navy-900 p-4 text-sm">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <p className="font-bold text-slate-100">{entry.orderCode}</p>
                        <p className="text-xs text-slate-500">{formatDateTime(entry.createdAt)}</p>
                      </div>
                      <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">
                        {entry.changedFields.join(", ")}
                      </p>
                      <div className="bg-navy-950 rounded-xl border border-navy-800 p-4">
                        {renderAuditDiff(entry)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-sm border border-dashed border-navy-700 rounded-xl p-6">
                  Chưa có nhật ký thay đổi cho đơn này.
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}

function Field({
  label,
  children,
}: Readonly<{
  label: string;
  children: React.ReactNode;
}>) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function StatCard({
  label,
  value,
  tone,
}: Readonly<{
  label: string;
  value: number;
  tone: "orange" | "green" | "red";
}>) {
  const toneClass =
    tone === "green"
      ? "text-green-400"
      : tone === "red"
        ? "text-red-400"
        : "text-orange-400";

  return (
    <div className="bg-navy-950 border border-navy-700/50 rounded-2xl p-5 shadow-xl">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className={`text-3xl font-black mt-2 ${toneClass}`}>{value}</p>
    </div>
  );
}
