import { apiClient } from './apiClient';

export interface ProductDTO {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number | null;
  discount: number;
  rating: number;
  totalReviews: number;
  soldQuantity: number;
  stockQuantity: number;
  brand: string | null;
  categoryId: number;
  shopId: number;
  image: string | null;
  thumbnails: string[];
  weightGrams?: number;
  dimensions?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductListParams {
  page?: number;
  pageSize?: number;
  category?: number;
  q?: string;
  brand?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'popular';
}

/**
 * Format price in VND
 */
export function formatPrice(price: number): string {
  if (price >= 1_000_000) {
    return `₫${(price / 1_000_000).toFixed(1)}tr`;
  }
  return `₫${price.toLocaleString('vi-VN')}`;
}

/**
 * Format price with full digits
 */
export function formatPriceFull(price: number): string {
  return `₫${price.toLocaleString('vi-VN')}`;
}

/**
 * Format sold quantity
 */
export function formatSold(sold: number): string {
  if (sold >= 1000) {
    return `Đã bán ${(sold / 1000).toFixed(1)}k`;
  }
  return `Đã bán ${sold}`;
}

/**
 * Fetch paginated product list
 */
export async function getProducts(params: ProductListParams = {}): Promise<PaginatedResponse<ProductDTO>> {
  const res = await apiClient.get('/api/products', { params });
  const payload = res.data?.data || res.data; // Catch C# wrapper { success, data: {...} }

  const mappedItems = (payload.items || payload.Items || []).map((x: any) => ({
    ...x,
    image: x.mainImageUrl || x.image || x.Image || null
  }));

  return {
    data: mappedItems,
    pagination: {
      page: payload.page || payload.Page || 1,
      pageSize: payload.pageSize || payload.PageSize || 20,
      total: payload.totalItems || payload.totalCount || payload.TotalCount || 0,
      totalPages: Math.ceil((payload.totalItems || payload.totalCount || 1) / (payload.pageSize || 20))
    }
  };
}

/**
 * Fetch single product details
 */
export async function getProductById(id: number): Promise<ProductDTO> {
  const res = await apiClient.get(`/api/products/${id}`);
  const payload = res.data?.data || res.data;
  return {
    ...payload,
    image: payload.mainImageUrl || payload.image || payload.Image || null,
    thumbnails: payload.images?.map((i: any) => i.imageUrl) || []
  };
}

export async function getFeaturedProducts(limit: number = 10): Promise<ProductDTO[]> {
  const params: ProductListParams = { page: 1, pageSize: limit, sort: 'rating' };
  const res = await getProducts(params);
  return res.data;
}