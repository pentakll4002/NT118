import { apiClient } from './apiClient';
import { getAuthToken } from './authToken';

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

export const sellerApi = {
  getProducts: async (): Promise<SellerProduct[]> => {
    const response = await apiClient.get<SellerProduct[]>('/api/seller/products');
    return response.data;
  },

  getOrders: async (): Promise<SellerOrder[]> => {
    const token = await getAuthToken();
    if (token?.startsWith('mock-')) {
      const now = new Date();
      const toIso = (offsetHours: number) => new Date(now.getTime() - offsetHours * 60 * 60 * 1000).toISOString();
      return [
        {
          id: 1001,
          orderNumber: 'SPX-240101',
          buyerId: 12,
          totalAmount: 1240000,
          paymentStatus: 'pending',
          status: 'pending',
          orderedAt: toIso(2),
          updatedAt: toIso(2),
        },
        {
          id: 1002,
          orderNumber: 'SPX-240102',
          buyerId: 28,
          totalAmount: 850000,
          paymentStatus: 'paid',
          status: 'confirmed',
          orderedAt: toIso(6),
          updatedAt: toIso(5),
        },
        {
          id: 1003,
          orderNumber: 'SPX-240103',
          buyerId: 35,
          totalAmount: 2490000,
          paymentStatus: 'paid',
          status: 'shipping',
          orderedAt: toIso(20),
          updatedAt: toIso(18),
        },
        {
          id: 1004,
          orderNumber: 'SPX-240104',
          buyerId: 44,
          totalAmount: 520000,
          paymentStatus: 'paid',
          status: 'delivered',
          orderedAt: toIso(30),
          updatedAt: toIso(12),
        },
        {
          id: 1005,
          orderNumber: 'SPX-240105',
          buyerId: 50,
          totalAmount: 1890000,
          paymentStatus: 'refunded',
          status: 'refunded',
          orderedAt: toIso(56),
          updatedAt: toIso(8),
        },
      ];
    }

    const response = await apiClient.get<SellerOrder[]>('/api/seller/orders');
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

    // --- MOCK DATA FALLBACK (For Frontend Only Testing) ---
    const token = await getAuthToken();
    if (token?.startsWith('mock-')) {
      return buildStats({
        shopName: "Shop NT118 (Demo Mode)",
        todayRevenue: 12500000,
        todayOrders: 12,
        conversionRate: 4.8,
        todo: {
          ordersToShip: 5,
          cancelledOrders: 2,
          returnRequests: 1,
          outOfStockProducts: 4
        },
        revenueHistory: [1200000, 1500000, 1100000, 1800000, 2200000, 1900000, 1250000],
      });
    }
    // -----------------------------------------------------

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
