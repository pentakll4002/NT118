import { apiClient } from './apiClient';

export interface SellerTodoStats {
  ordersToShip: number;
  cancelledOrders: number;
  returnRequests: number;
  outOfStockProducts: number;
}

export interface SellerDashboardStats {
  shopName: string;
  todayRevenue: number;
  todayOrders: number;
  conversionRate: number;
  averageOrderValue: number;
  revenueHistory: number[];
  todo: SellerTodoStats;
}

export interface SellerProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  stockQuantity: number;
  soldQuantity: number;
  status: string;
}

export interface SellerOrder {
  id: number;
  orderNumber: string;
  buyerId: number;
  totalAmount: number;
  paymentStatus: string;
  status: string;
  orderedAt: string;
  updatedAt?: string;
}

export interface SellerOrderDetail {
  order: {
    id: number;
    orderNumber: string;
    buyerId: number;
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
    updatedAt: string;
  };
  items: Array<{
    id: number;
    productId: number;
    variantId: number | null;
    productName: string;
    productImage: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  buyer: {
    id: number;
    username: string;
    email: string;
    phone: string | null;
  } | null;
  shippingAddress: {
    recipientName: string;
    recipientPhone: string;
    province: string;
    district: string;
    ward: string;
    streetAddress: string;
  } | null;
}

export interface SellerRevenue {
  totalRevenue: number;
  monthly: Array<{
    year: number;
    month: number;
    revenue: number;
  }>;
}

export interface CreateSellerProductPayload {
  categoryId: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
}

export interface CreateSellerProductResponse {
  message: string;
  id?: number;
}

export interface SellerCategory {
  id: number;
  name: string;
  slug: string;
  parentId?: number | null;
  imageUrl?: string | null;
  sortOrder: number;
}

export interface ShopProfile {
  id: number;
  ownerId: number;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
  rating: number;
  totalReviews: number;
  totalProducts: number;
  status: string;
  isVerified: boolean;
  businessHours?: string;
  createdAt: string;
}

export interface UpdateShopProfilePayload {
  name?: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export const sellerApi = {
  getProducts: async (): Promise<SellerProduct[]> => {
    const response = await apiClient.get<SellerProduct[]>('/api/seller/products');
    return response.data;
  },

  getOrders: async (): Promise<SellerOrder[]> => {
    const response = await apiClient.get<SellerOrder[]>('/api/seller/orders');
    return response.data;
  },

  getOrderDetail: async (orderId: number): Promise<SellerOrderDetail> => {
    const response = await apiClient.get<SellerOrderDetail>(`/api/seller/orders/${orderId}`);
    return response.data;
  },

  updateOrderStatus: async (orderId: number, status: string, note?: string): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>(`/api/seller/orders/${orderId}/status`, {
      status,
      note,
    });
    return response.data;
  },

  getRevenue: async (): Promise<SellerRevenue> => {
    const response = await apiClient.get<SellerRevenue>('/api/seller/revenue');
    return response.data;
  },

  createProduct: async (payload: CreateSellerProductPayload): Promise<CreateSellerProductResponse> => {
    const response = await apiClient.post<CreateSellerProductResponse>('/api/seller/products', payload);
    return response.data;
  },

  getCategories: async (): Promise<SellerCategory[]> => {
    const response = await apiClient.get<SellerCategory[]>('/api/categories');
    return response.data;
  },

  getShopInfo: async (): Promise<ShopProfile> => {
    const response = await apiClient.get<ShopProfile>('/api/shops/mine');
    return response.data;
  },

  updateShopProfile: async (data: UpdateShopProfilePayload): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>('/api/shops/mine', data);
    return response.data;
  },

  getDashboardStats: async (): Promise<SellerDashboardStats> => {
    const buildStats = (input: {
      shopName: string;
      todayRevenue: number;
      todayOrders: number;
      conversionRate: number;
      revenueHistory: number[];
      todo: SellerTodoStats;
    }): SellerDashboardStats => ({
      ...input,
      averageOrderValue: input.todayOrders > 0 ? input.todayRevenue / input.todayOrders : 0,
    });

    const [products, orders] = await Promise.all([
      sellerApi.getProducts(),
      sellerApi.getOrders(),
    ]);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const todayOrders = orders.filter(o => new Date(o.orderedAt) >= today);
    const todayRevenue = todayOrders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const ordersToShip = orders.filter(o => o.status === 'confirmed').length;
    
    // For cancelled and return requests, we look at the last 7 days since "today" might be too narrow
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const cancelledOrders = orders.filter(o => 
      o.status === 'cancelled' && new Date(o.orderedAt) >= sevenDaysAgo
    ).length;

    const returnRequests = orders.filter(o => 
      o.status === 'refunded' && new Date(o.orderedAt) >= sevenDaysAgo
    ).length;

    const outOfStockProducts = products.filter(p => p.stockQuantity <= 0).length;

    // Generate revenue history for the last 7 days
    const revenueHistory: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayRevenue = orders
        .filter(o => {
          const date = new Date(o.orderedAt);
          return date >= d && date <= dayEnd && o.paymentStatus === 'paid';
        })
        .reduce((sum, o) => sum + o.totalAmount, 0);
      revenueHistory.push(dayRevenue);
    }

    return buildStats({
      shopName: "Cửa hàng của tôi", 
      todayRevenue,
      todayOrders: todayOrders.length,
      conversionRate: 3.8, 
      revenueHistory,
      todo: {
        ordersToShip,
        cancelledOrders,
        returnRequests,
        outOfStockProducts,
      }
    });
  },
};
