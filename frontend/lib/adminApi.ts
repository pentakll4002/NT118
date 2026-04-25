import { apiClient } from './apiClient';

export interface AdminStatsDTO {
  totalUsers: number;
  totalShops: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface AdminUserDTO {
  id: number;
  username: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface AdminShopDTO {
  id: number;
  ownerId: number;
  name: string;
  slug: string;
  status: string;
  isVerified: boolean;
  rating: number;
  totalProducts: number;
  createdAt: string;
}

export interface AdminCategoryDTO {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  imageUrl?: string;
  sortOrder: number;
  status: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  imageUrl?: string;
  sortOrder: number;
  status?: string;
}

export interface AdminVoucherDTO {
  id: number;
  code: string;
  name: string;
  description?: string;
  discountType: string;
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

export interface CreateVoucherRequest {
  code: string;
  name: string;
  description?: string;
  discountType: string;
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const USE_MOCK = true;

export const adminApi = {
  getStats: async (): Promise<AdminStatsDTO> => {
    if (USE_MOCK) {
      return {
        totalUsers: 1250,
        totalShops: 48,
        totalProducts: 5600,
        totalOrders: 890,
        totalRevenue: 250000000,
      };
    }
    const res = await apiClient.get('/api/admin/stats');
    return res.data;
  },

  getUsers: async (): Promise<AdminUserDTO[]> => {
    if (USE_MOCK) {
      return [
        { id: 1, username: 'admin', email: 'admin@test.com', role: 'admin', status: 'active', createdAt: new Date().toISOString() },
        { id: 2, username: 'user1', email: 'user1@test.com', role: 'buyer', status: 'active', createdAt: new Date().toISOString() },
        { id: 3, username: 'seller1', email: 'seller@test.com', role: 'seller', status: 'active', createdAt: new Date().toISOString() },
      ];
    }
    const res = await apiClient.get('/api/admin/users');
    return res.data;
  },

  getShops: async (): Promise<AdminShopDTO[]> => {
    if (USE_MOCK) {
      return [
        { id: 1, ownerId: 3, name: 'Shop Mall', slug: 'shop-mall', status: 'active', isVerified: true, rating: 4.8, totalProducts: 120, createdAt: new Date().toISOString() },
        { id: 2, ownerId: 4, name: 'Tech Store', slug: 'tech-store', status: 'active', isVerified: false, rating: 4.5, totalProducts: 85, createdAt: new Date().toISOString() },
      ];
    }
    const res = await apiClient.get('/api/admin/shops');
    return res.data;
  },

  // --- Categories ---
  getCategories: async (): Promise<AdminCategoryDTO[]> => {
    if (USE_MOCK) {
      return [
        { id: 1, name: 'Thời trang', slug: 'thoi-trang', sortOrder: 1, status: 'active' },
        { id: 2, name: 'Điện tử', slug: 'dien-tu', sortOrder: 2, status: 'active' },
        { id: 3, name: 'Gia dụng', slug: 'gia-dung', sortOrder: 3, status: 'active' },
      ];
    }
    const res = await apiClient.get('/api/categories');
    return res.data;
  },

  createCategory: async (data: CreateCategoryRequest): Promise<void> => {
    await apiClient.post('/api/categories', data);
  },

  updateCategory: async (id: number, data: CreateCategoryRequest): Promise<void> => {
    await apiClient.put(`/api/categories/${id}`, data);
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/categories/${id}`);
  },

  // --- Vouchers ---
  getVouchers: async (): Promise<AdminVoucherDTO[]> => {
    if (USE_MOCK) {
      return [
        {
          id: 1,
          code: 'HELLOSUMMER',
          name: 'Chào hè rực rỡ',
          discountType: 'percentage',
          discountValue: 10,
          minOrderValue: 100000,
          maxDiscount: 50000,
          startDate: '2026-05-01T00:00:00Z',
          endDate: '2026-06-01T23:59:59Z',
          usedCount: 150,
          usageLimit: 500,
          isActive: true,
        },
        {
          id: 2,
          code: 'FREESHIP',
          name: 'Miễn phí vận chuyển',
          discountType: 'fixed_amount',
          discountValue: 20000,
          minOrderValue: 50000,
          startDate: '2026-01-01T00:00:00Z',
          endDate: '2026-12-31T23:59:59Z',
          usedCount: 1200,
          isActive: true,
        }
      ];
    }
    const res = await apiClient.get('/api/vouchers');
    return res.data;
  },

  createVoucher: async (data: CreateVoucherRequest): Promise<void> => {
    await apiClient.post('/api/vouchers', data);
  },

  updateVoucher: async (id: number, data: Partial<CreateVoucherRequest>): Promise<void> => {
    await apiClient.put(`/api/vouchers/${id}`, data);
  },

  deleteVoucher: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/vouchers/${id}`);
  },
};
