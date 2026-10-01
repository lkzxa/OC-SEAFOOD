export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Readonly<Record<OrderStatus, string>> = {
  PENDING: "Chờ tư vấn",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
};

export const ORDER_STATUS_OPTIONS = ORDER_STATUSES.map((value) => ({
  value,
  label: ORDER_STATUS_LABELS[value],
}));

export const getOrderStatusLabel = (status: OrderStatus) => ORDER_STATUS_LABELS[status];

export const getOrderStatusClass = (status: OrderStatus) => {
  if (status === "CONFIRMED") return "bg-green-500/10 text-green-400 border-green-500/20";
  if (status === "CANCELLED") return "bg-red-500/10 text-red-400 border-red-500/20";
  return "bg-orange-500/10 text-orange-400 border-orange-500/20";
};
