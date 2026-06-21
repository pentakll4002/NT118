import { apiClient } from './apiClient';

export interface SellerTodoStats {
  ordersToConfirm: number;
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
  totalOrders: number;
}

export interface SellerProduct {
  id: number;
  name: string;
  slug: string;
  description?: string;
  categoryId: number;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  soldQuantity: number;
  weightGrams?: number;
  brand?: string;
  status: string;
  mainImageUrl?: string | null;
  images?: string[];
  variants?: CreateProductVariantPayload[];
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
  hasReturnRequest?: boolean;
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
  weightGrams?: number;
  brand?: string;
  variants?: CreateProductVariantPayload[];
  imageUrls?: string[];
}

export interface UpdateSellerProductPayload {
  categoryId: number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  weightGrams?: number;
  brand?: string;
  variants?: CreateProductVariantPayload[];
  imageUrls?: string[];
}

export interface CreateProductVariantPayload {
  name: string;
  value: string;
  priceModifier: number;
  stockQuantity: number;
  sku?: string;
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
  pickupAddress?: string;
  createdAt: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UpdateShopProfilePayload {
  name?: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
  businessHours?: string;
  pickupAddress?: string;
  latitude?: number | null;
  longitude?: number | null;
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

  getProductDetail: async (id: number): Promise<SellerProduct> => {
    const response = await apiClient.get<SellerProduct>(`/api/seller/products/${id}`);
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

  updateProduct: async (id: number, payload: UpdateSellerProductPayload): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>(`/api/seller/products/${id}`, payload);
    return response.data;
  },

  getCategories: async (): Promise<SellerCategory[]> => {
    const response = await apiClient.get<SellerCategory[]>('/api/categories');
    return response.data;
  },

  createCategory: async (data: { name: string; slug: string; description?: string }): Promise<{ id: number; message: string }> => {
    const response = await apiClient.post<{ id: number; message: string }>('/api/categories', data);
    return response.data;
  },

  getBrands: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/api/seller/brands');
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
    const response = await apiClient.get<SellerDashboardStats>('/api/seller/dashboard');
    return response.data;
  },

  updateProductStatus: async (productId: number, status: string): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>(`/api/seller/products/${productId}/status`, {
      status,
    });
    return response.data;
  },

  deleteProduct: async (productId: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/api/seller/products/${productId}`);
    return response.data;
  },

  uploadImage: async (uri: string): Promise<string> => {
    const formData = new FormData();
    const fileName = uri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(fileName);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // @ts-ignore
    formData.append('file', {
      uri,
      name: fileName,
      type,
    });

    const response = await apiClient.post<{ url: string }>('/api/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.url;
  },
};
