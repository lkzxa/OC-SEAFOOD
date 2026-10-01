const ORDER_STATUSES = Object.freeze(['PENDING', 'CONFIRMED', 'CANCELLED']);

const ORDER_STATUS_LABELS = Object.freeze({
  PENDING: 'Chờ tư vấn',
  CONFIRMED: 'Đã xác nhận',
  CANCELLED: 'Đã hủy',
});

function isOrderStatus(value) {
  return typeof value === 'string' && ORDER_STATUSES.includes(value);
}

module.exports = {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  isOrderStatus,
};
