import { SellerOrder } from '../../../../lib/sellerApi';
import { OrderTab } from './orderTypes';

export const formatCurrency = (value: number) => `đ${Math.round(value).toLocaleString('vi-VN')}`;

export const formatOrderTime = (orderedAt: string) => {
  const date = new Date(orderedAt);
  if (Number.isNaN(date.getTime())) {
    return orderedAt;
  }
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  });
};

export const normalizeQueryFilter = (value: unknown): OrderTab => {
  if (typeof value !== 'string') {
    return 'all';
  }

  const filter = value.toLowerCase();
  if (filter === 'to-ship') return 'to-ship';
  if (filter === 'cancelled') return 'cancelled';
  if (filter === 'returns') return 'returns';
  return 'all';
};

export const isOrderMatchedByTab = (order: SellerOrder, tab: OrderTab) => {
  switch (tab) {
    case 'unpaid':
      return order.status === 'pending';
    case 'to-ship':
      return order.status === 'confirmed';
    case 'shipping':
      return order.status === 'shipping';
    case 'completed':
      return order.status === 'delivered';
    case 'cancelled':
      return order.status === 'cancelled';
    case 'returns':
      return order.status === 'refunded';
    case 'all':
    default:
      return true;
  }
};

export const resolveStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'CHỜ XÁC NHẬN';
    case 'confirmed':
      return 'CHỜ GIAO';
    case 'shipping':
      return 'ĐANG GIAO';
    case 'delivered':
      return 'HOÀN TẤT';
    case 'cancelled':
      return 'ĐÃ HUỶ';
    case 'refunded':
      return 'HOÀN TRẢ';
    default:
      return status.toUpperCase();
  }
};

export const resolvePaymentStatusLabel = (paymentStatus: string) => {
  switch (paymentStatus) {
    case 'pending':
      return 'Chờ thanh toán';
    case 'paid':
      return 'Đã thanh toán';
    case 'failed':
      return 'Thanh toán thất bại';
    case 'refunded':
      return 'Đã hoàn tiền';
    default:
      return paymentStatus;
  }
};

export const computeQuickStats = (orders: SellerOrder[]) => ({
  total: orders.length,
  toShip: orders.filter((order) => order.status === 'confirmed').length,
  shipping: orders.filter((order) => order.status === 'shipping').length,
  completed: orders.filter((order) => order.status === 'delivered').length,
  returns: orders.filter((order) => order.status === 'refunded').length,
});
