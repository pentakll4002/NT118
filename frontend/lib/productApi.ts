import { apiClient } from './apiClient';

// Toggle to use mock data for testing
const USE_MOCK = false;
const MOCK_PRODUCTS: ProductDTO[] = [];

export interface ViewHistoryItemDTO {
  productId: number;
  productName: string;
  productSlug: string;
  mainImageUrl: string | null;
  viewedAt: string;
}

export interface ProductVariantDTO {
  id: number;
  name: string; // e.g., "Màu sắc"
  value: string; // e.g., "Xanh"
  priceModifier: number;
  stockQuantity: number;
  sku?: string;
}

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
  variants?: ProductVariantDTO[];
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
  category?: number; // legacy (mapped to categoryId)
  categoryId?: number;
  shopId?: number;
  q?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'popular';
  isFlashSale?: boolean;
}

/**
 * Format price in VND (Full digits)
 */
export function formatPrice(price: number): string {
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
  if (USE_MOCK) {
    let filtered = [...MOCK_PRODUCTS];
    if (params.q) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(params.q!.toLowerCase()));
    }
    if (params.categoryId) {
      filtered = filtered.filter(p => p.categoryId === params.categoryId);
    }

    // Simple mock pagination
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const items = filtered.slice((page - 1) * pageSize, page * pageSize);

    return {
      data: items,
      pagination: {
        page,
        pageSize,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / pageSize)
      }
    };
  }


  const { category, sort, ...rest } = params;
  const queryParams: any = {
    ...rest,
    categoryId: params.categoryId ?? category,
  };

  if (sort === 'popular') queryParams.sort = 'sold';
  else if (sort === 'newest') queryParams.sort = undefined;
  else queryParams.sort = sort;

  const res = await apiClient.get('/api/products', { params: queryParams });
  const payload = res.data?.data || res.data; // Catch C# wrapper { success, data: {...} }

  const rawItems = payload?.items || payload?.Items || payload?.data || [];
  const mappedItems = Array.isArray(rawItems) ? rawItems.map((x: any) => ({
    ...x,
    image: x.mainImageUrl || x.MainImageUrl || x.image || x.Image || null
  })) : [];

  return {
    data: mappedItems,
    pagination: {
      page: payload?.page || payload?.Page || 1,
      pageSize: payload?.pageSize || payload?.PageSize || 20,
      total: payload?.totalItems || payload?.totalCount || payload?.TotalCount || 0,
      totalPages: Math.ceil((payload?.totalItems || payload?.totalCount || 1) / (payload?.pageSize || 20))
    }
  };
}

/**
 * Fetch single product details
 */
export async function getProductById(id: number): Promise<ProductDTO> {

  const res = await apiClient.get(`/api/products/${id}`);
  const payload = res.data?.data || res.data;
  const images = payload.images || payload.Images || [];
  return {
    ...payload,
    image: payload.mainImageUrl || payload.image || payload.Image || null,
    thumbnails: Array.isArray(images) ? images.map((i: any) => i.imageUrl || i.ImageUrl).filter(Boolean) : []
  };
}

export async function getFeaturedProducts(limit: number = 10): Promise<ProductDTO[]> {

  const params: ProductListParams = { page: 1, pageSize: limit, sort: 'rating' };
  const res = await getProducts(params);
  return res.data;
}

/**
 * Fetch recently viewed products
 */
export async function getViewHistory(limit: number = 20): Promise<ViewHistoryItemDTO[]> {

  const res = await apiClient.get('/api/products/history', { params: { limit } });
  return res.data?.data || res.data || [];
}