import { apiClient } from './apiClient';

export interface AdminStatsDTO {
  totalUsers: number;
  totalShops: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingShops: number;
}

export interface AdminUserDTO {
  id: number;
  username: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  createdAt: string;
  hasShop: boolean;
}

export interface AdminShopDTO {
  id: number;
  ownerId: number;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
  type: string;
  status: string;
  isVerified: boolean;
  rating: number;
  totalProducts: number;
  createdAt: string;
  owner?: {
    id: number;
    username: string;
    email: string;
    phone?: string;
  };
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

export interface PendingShopDTO {
  id: number;
  ownerId: number;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  type: string;
  status: string;
  isVerified: boolean;
  createdAt: string;
  owner?: {
    id: number;
    username: string;
    email: string;
    phone?: string;
  };
}

export const adminApi = {
  // --- Stats ---
  getStats: async (): Promise<AdminStatsDTO> => {
    const res = await apiClient.get('/api/admin/stats');
    return res.data?.data || res.data;
  },

  // --- Users ---
  getUsers: async (): Promise<AdminUserDTO[]> => {
    const res = await apiClient.get('/api/admin/users');
    return res.data?.data || res.data;
  },

  updateUserRole: async (id: number, role: string): Promise<void> => {
    await apiClient.patch(`/api/admin/users/${id}/role`, { role });
  },

  updateUserStatus: async (id: number, status: string): Promise<void> => {
    await apiClient.patch(`/api/admin/users/${id}/status`, { status });
  },

  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/admin/users/${id}`);
  },

  // --- Shops ---
  getShops: async (): Promise<AdminShopDTO[]> => {
    const res = await apiClient.get('/api/admin/shops');
    return res.data?.data || res.data;
  },

  getPendingShops: async (): Promise<PendingShopDTO[]> => {
    const res = await apiClient.get('/api/shops/admin/pending');
    return res.data?.data || res.data;
  },

  approveShop: async (id: number): Promise<void> => {
    await apiClient.patch(`/api/shops/admin/${id}/approve`);
  },

  rejectShop: async (id: number, reason?: string): Promise<void> => {
    await apiClient.patch(`/api/shops/admin/${id}/reject`, { reason });
  },

  updateShopStatus: async (id: number, status: string): Promise<void> => {
    await apiClient.patch(`/api/admin/shops/${id}/status`, { status });
  },

  toggleShopVerified: async (id: number, isVerified: boolean): Promise<void> => {
    await apiClient.patch(`/api/admin/shops/${id}/verify`, { isVerified });
  },

  deleteShop: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/admin/shops/${id}`);
  },

  // --- Categories ---
  getCategories: async (): Promise<AdminCategoryDTO[]> => {
    const res = await apiClient.get('/api/categories');
    return res.data?.data || res.data;
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
    const res = await apiClient.get('/api/vouchers');
    return res.data?.data || res.data;
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
