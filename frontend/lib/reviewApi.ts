import { apiClient } from './apiClient';
import { ProductReviewItemResponse } from './mockData';



export interface CreateReviewPayload {
  orderId: number;
  productId: number;
  rating: number;
  comment?: string;
}

export interface UpdateReviewPayload {
  rating: number;
  comment?: string;
}

export interface ReviewDto {
  id: number;
  orderId: number;
  productId: number;
  reviewerId: number;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  comment?: string;
  isVerified: boolean;
  helpfulVotes: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductReviewsResponse {
  productId: number;
  averageRating: number;
  totalReviews: number;
  reviews: ReviewDto[];
}

export interface OrderReviewStatusResponse {
  orderId: number;
  canReview: boolean;
  alreadyReviewed: boolean;
  existingReviewId?: number;
}

export async function createReview(payload: CreateReviewPayload): Promise<ReviewDto> {
  try {
    const res = await apiClient.post('/api/reviews', payload);
    return res.data?.data || res.data;
  } catch (err: any) {
    const msg = err?.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.';
    console.error('Failed to create review:', msg);
    throw new Error(msg);
  }
}

export async function getProductReviews(productId: number, page = 1, pageSize = 10): Promise<ProductReviewsResponse> {


  try {
    const res = await apiClient.get(`/api/reviews/${productId}`, { params: { page, pageSize } });
    return res.data?.data || res.data;
  } catch (err: any) {
    console.error('Failed to fetch reviews:', err);
    throw new Error('Không thể tải đánh giá.');
  }
}

export async function getOrderReviewStatus(orderId: number): Promise<OrderReviewStatusResponse> {
  try {
    const res = await apiClient.get(`/api/reviews/order/${orderId}/status`);
    return res.data?.data || res.data;
  } catch (err: any) {
    console.error('Failed to get review status:', err);
    throw new Error('Không thể kiểm tra trạng thái đánh giá.');
  }
}

export async function updateReview(reviewId: number, payload: UpdateReviewPayload): Promise<ReviewDto> {
  try {
    const res = await apiClient.put(`/api/reviews/${reviewId}`, payload);
    return res.data?.data || res.data;
  } catch (err: any) {
    const msg = err?.response?.data?.message || 'Không thể cập nhật đánh giá.';
    console.error('Failed to update review:', msg);
    throw new Error(msg);
  }
}

export async function deleteReview(reviewId: number): Promise<void> {
  try {
    await apiClient.delete(`/api/reviews/${reviewId}`);
  } catch (err: any) {
    const msg = err?.response?.data?.message || 'Không thể xóa đánh giá.';
    console.error('Failed to delete review:', msg);
    throw new Error(msg);
  }
}
