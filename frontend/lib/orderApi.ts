import { apiClient } from './apiClient';

export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled' | 'refunded';

export interface OrderItemDTO {
  id: number;
  productId: number;
  variantId?: number;
  productName: string;
  productImage: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderDTO {
  id: number;
  orderNumber: string;
  shopId: number;
  totalAmount: number;
  paymentStatus: string;
  status: OrderStatus;
  orderedAt: string;
}

export interface OrderDetailDTO {
  order: {
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
    status: OrderStatus;
    notes: string | null;
    orderedAt: string;
  };
  items: OrderItemDTO[];
}

const USE_MOCK = true;

const MOCK_ORDERS: OrderDTO[] = [
  {
    id: 1,
    orderNumber: 'ORD-1713888001001',
    shopId: 1,
    totalAmount: 250000,
    paymentStatus: 'pending',
    status: 'pending',
    orderedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    orderNumber: 'ORD-1713888002002',
    shopId: 2,
    totalAmount: 1200000,
    paymentStatus: 'paid',
    status: 'shipping',
    orderedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    orderNumber: 'ORD-1713888003003',
    shopId: 1,
    totalAmount: 450000,
    paymentStatus: 'paid',
    status: 'delivered',
    orderedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 4,
    orderNumber: 'ORD-1713888004004',
    shopId: 3,
    totalAmount: 89000,
    paymentStatus: 'cancelled',
    status: 'cancelled',
    orderedAt: new Date(Date.now() - 259200000).toISOString(),
  }
];

export const orderApi = {
  getMyOrders: async (): Promise<OrderDTO[]> => {
    if (USE_MOCK) return MOCK_ORDERS;
    const res = await apiClient.get('/api/orders');
    return res.data?.data || res.data || [];
  },

  getOrderDetail: async (id: number): Promise<OrderDetailDTO> => {
    if (USE_MOCK) {
      const order = MOCK_ORDERS.find(o => o.id === id) || MOCK_ORDERS[0];
      return {
        order: {
          ...order,
          shippingAddressId: 1,
          subtotal: order.totalAmount - 25000,
          shippingFee: 25000,
          discountAmount: 0,
          paymentMethod: 'cod',
          notes: 'Giao giờ hành chính',
        },
        items: [
          {
            id: 101,
            productId: 1,
            productName: 'Sản phẩm mẫu 1',
            productImage: 'https://via.placeholder.com/150',
            quantity: 1,
            unitPrice: order.totalAmount - 25000,
            totalPrice: order.totalAmount - 25000,
          }
        ]
      };
    }
    const res = await apiClient.get(`/api/orders/${id}`);
    return res.data?.data || res.data;
  },

  updateOrderStatus: async (id: number, status: OrderStatus): Promise<void> => {
    if (USE_MOCK) {
      console.log(`Mock: Updated order ${id} status to ${status}`);
      return;
    }
    await apiClient.patch(`/api/orders/${id}/status`, { status });
  },

  cancelOrder: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      console.log(`Mock: Cancelled order ${id}`);
      return;
    }
    await apiClient.patch(`/api/orders/${id}/status`, { status: 'cancelled' });
  }
};
