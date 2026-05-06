import { apiClient } from './apiClient';
import { ProductReviewItemResponse } from './mockData';

export interface CreateReviewRequest {
  orderId: number;
  rating: number;
  comment?: string;
}

/**
 * Fetch reviews for a specific product
 */
export async function getProductReviews(productId: number, limit: number = 50): Promise<ProductReviewItemResponse[]> {
  const res = await apiClient.get(`/api/products/${productId}/reviews`, { params: { limit } });
  return res.data?.data || res.data || [];
}

/**
 * Create a new review — only works when the order has been delivered
 */
export async function createReview(productId: number, data: CreateReviewRequest): Promise<{ success: boolean; message: string; reviewId?: number }> {
  try {
    const res = await apiClient.post(`/api/products/${productId}/reviews`, data);
    return {
      success: true,
      message: res.data?.message || 'Đánh giá thành công.',
      reviewId: res.data?.reviewId
    };
  } catch (err: any) {
    const msg = err?.response?.data?.message || err.message || 'Gửi đánh giá thất bại.';
    return {
      success: false,
      message: msg
    };
  }
}
