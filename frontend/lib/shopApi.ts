import { apiClient } from './apiClient';
import { ShopDTO } from './mockData';
import { ProductDTO, getProducts } from './productApi';

export interface CreateShopRequest {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  address?: string;
  province?: string;
  district?: string;
  ward?: string;
  streetAddress?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
}

export interface ShopDetailResponse extends ShopDTO {
  followerCount: number;
  isFollowing: boolean;
  updatedAt?: string;
  status?: string;
}

/**
 * Fetch shop details by ID
 */
export async function getShopById(id: number): Promise<ShopDetailResponse | null> {
  try {
    const res = await apiClient.get(`/api/shops/${id}`);
    return res.data;
  } catch (err) {
    console.error('Failed to fetch shop:', err);
    return null;
  }
}

/**
 * Fetch products belonging to a shop
 */
export async function getShopProducts(shopId: number, page = 1, pageSize = 20): Promise<ProductDTO[]> {
  try {
    const res = await getProducts({ shopId, page, pageSize });
    return res.data;
  } catch (err) {
    console.error('Failed to fetch shop products:', err);
    return [];
  }
}

/**
 * Follow or unfollow a shop
 */
export async function toggleFollowShop(shopId: number, isFollowing: boolean): Promise<boolean> {
  try {
    if (isFollowing) {
      await apiClient.delete(`/api/shops/${shopId}/follow`);
    } else {
      await apiClient.post(`/api/shops/${shopId}/follow`);
    }
    return true;
  } catch (err) {
    console.error('Failed to toggle follow shop:', err);
    return false;
  }
}

/**
 * Register a new shop
 */
export async function registerShop(data: CreateShopRequest): Promise<{ id: number; name: string; message?: string }> {
  try {
    const res = await apiClient.post('/api/shops/register', data);
    return res.data;
  } catch (err: any) {
    const msg = err?.response?.data?.message || err.message || 'Đăng ký shop thất bại.';
    console.error('Failed to register shop:', msg);
    throw new Error(msg);
  }
}

/**
 * Upload an image file to the backend
 */
export async function uploadImage(fileUri: string): Promise<string> {
  try {
    const formData = new FormData();
    const filename = fileUri.split('/').pop() || 'upload.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    formData.append('file', {
      uri: fileUri,
      name: filename,
      type,
    } as any);

    const res = await apiClient.post('/api/upload/image', formData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // ApiResponseWrapperFilter wraps response in { data: { url: ... }, success: true }
    return res.data?.data?.url || res.data?.url;
  } catch (err: any) {
    console.error('Failed to upload image:', err);
    throw new Error(err?.response?.data?.message || 'Không thể tải ảnh lên. Vui lòng thử lại.');
  }
}

/**
 * Fetch list of shops followed by the current user
 */
export async function getFollowedShops(): Promise<ShopDTO[]> {
  try {
    const res = await apiClient.get('/api/shops/followed');
    return res.data?.data || res.data || [];
  } catch (err) {
    console.error('Failed to fetch followed shops:', err);
    return [];
  }
}

/**
 * Check if the current user follows a specific shop
 */
export async function getFollowStatus(shopId: number): Promise<{ isFollowing: boolean; followedAt?: string }> {
  try {
    const res = await apiClient.get(`/api/shops/${shopId}/follow-status`);
    return res.data?.data || res.data || { isFollowing: false };
  } catch (err) {
    console.error('Failed to fetch follow status:', err);
    return { isFollowing: false };
  }
}

