import { apiClient } from './apiClient';

const USE_MOCK = true;

// ── Types ───────────────────────────────────────────────────────────
export interface OrderDetail {
  id: number;
  orderNumber: string;
  shopId: number;
  shippingAddressId: number;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  notes: string | null;
  orderedAt: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  variantId: number | null;
  productName: string;
  productImage: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderDetailResponse {
  order: OrderDetail;
  items: OrderItem[];
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled' | 'refunded' | string;
export type OrderDTO = OrderDetail;


// ── API calls ───────────────────────────────────────────────────────
export async function getOrderDetail(orderId: number): Promise<OrderDetailResponse> {
  if (USE_MOCK) {
    return {
      order: {
        id: orderId,
        orderNumber: 'ORD12345678',
        shopId: 1,
        shippingAddressId: 1,
        subtotal: 450000,
        shippingFee: 30000,
        discountAmount: 50000,
        totalAmount: 430000,
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        status: 'shipping', // Test stepper với trạng thái đang giao
        notes: 'Giao giờ hành chính',
        orderedAt: new Date().toISOString(),
      },
      items: [
        {
          id: 1,
          productId: 1,
          variantId: null,
          productName: 'Áo thun Cotton Basic Unisex',
          productImage: 'https://picsum.photos/200',
          quantity: 2,
          unitPrice: 150000,
          totalPrice: 300000,
        },
        {
          id: 2,
          productId: 2,
          variantId: null,
          productName: 'Quần Jeans Slimfit Nam',
          productImage: 'https://picsum.photos/201',
          quantity: 1,
          unitPrice: 150000,
          totalPrice: 150000,
        }
      ]
    };
  }
  const res = await apiClient.get(`/api/orders/${orderId}`);
  const data = res.data?.data || res.data;
  return data as OrderDetailResponse;
}

export async function getMyOrders(): Promise<OrderDetail[]> {
  if (USE_MOCK) {
    return [
      {
        id: 1,
        orderNumber: 'ORD12345678',
        shopId: 1,
        shippingAddressId: 1,
        subtotal: 450000,
        shippingFee: 30000,
        discountAmount: 50000,
        totalAmount: 430000,
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        status: 'shipping',
        notes: null,
        orderedAt: new Date().toISOString(),
      }
    ];
  }
  const res = await apiClient.get('/api/orders');
  const data = res.data?.data || res.data;
  return Array.isArray(data) ? data : [];
}

export async function updateOrderStatus(orderId: number, status: OrderStatus): Promise<void> {
  await apiClient.patch(`/api/orders/${orderId}/status`, { status });
}

// ── Helpers ─────────────────────────────────────────────────────────
export function formatOrderStatus(status: string): string {
  const map: Record<string, string> = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    processing: 'Đang xử lý',
    shipping: 'Đang giao hàng',
    delivered: 'Đã giao hàng',
    cancelled: 'Đã hủy',
    refunded: 'Đã hoàn tiền',
  };
  return map[status.toLowerCase()] || status;
}

export function formatPaymentStatus(status: string): string {
  const map: Record<string, string> = {
    pending: 'Chờ thanh toán',
    paid: 'Đã thanh toán',
    failed: 'Thanh toán thất bại',
    refunded: 'Đã hoàn tiền',
  };
  return map[status.toLowerCase()] || status;
}

export function formatPaymentMethod(method: string): string {
  const map: Record<string, string> = {
    cod: 'Thanh toán khi nhận hàng (COD)',
    vietqr: 'VietQR',
  };
  return map[method.toLowerCase()] || method;
}

export function formatPriceFull(amount: number): string {
  return amount.toLocaleString('vi-VN') + 'đ';
}
