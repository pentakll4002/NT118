import { apiClient } from './apiClient';
import { ProductDTO } from './productApi';

const USE_MOCK = false;

// ─── Favorites (heart toggle) ──────────────────────────────────

export interface FavoriteProduct {
  favoriteId: number;
  favoritedAt: string;
  product: {
    id: number;
    name: string;
    slug?: string;
    description?: string;
    price: number;
    originalPrice: number | null;
    discount: number;
    rating: number;
    totalReviews?: number;
    soldQuantity: number;
    brand: string | null;
    categoryId?: number;
    shopId?: number;
    image: string | null;
  };
}

export interface FavoritesResponse {
  data: FavoriteProduct[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export async function getFavorites(page = 1, pageSize = 20): Promise<FavoritesResponse> {

  const res = await apiClient.get('/api/favorites', { params: { page, pageSize } });
  return res.data;
}

export async function getFavoriteCount(): Promise<number> {
  const res = await apiClient.get('/api/favorites/count');
  return res.data.count;
}

export async function getFavoriteStatus(productId: number): Promise<boolean> {
  const res = await apiClient.get(`/api/favorites/${productId}/status`);
  return res.data.isFavorited;
}

export async function toggleFavorite(productId: number): Promise<{ isFavorited: boolean; message: string }> {
  const res = await apiClient.post(`/api/favorites/toggle/${productId}`);
  return res.data;
}

export async function addFavorite(productId: number): Promise<void> {
  await apiClient.post(`/api/favorites/${productId}`);
}

export async function removeFavorite(productId: number): Promise<void> {
  await apiClient.delete(`/api/favorites/${productId}`);
}

// ─── Wishlist Collections ──────────────────────────────────────

export interface WishlistCollectionDTO {
  id: number;
  name: string;
  itemCount: number;
  previewImages: (string | null)[];
  createdAt: string;
  updatedAt: string;
}

export interface CollectionItemProduct {
  id: number;
  addedAt: string;
  product: {
    id: number;
    name: string;
    price: number;
    originalPrice: number | null;
    discount: number;
    rating: number;
    soldQuantity: number;
    brand: string | null;
    image: string | null;
  };
}

export interface CollectionItemsResponse {
  data: CollectionItemProduct[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export async function getCollections(): Promise<WishlistCollectionDTO[]> {
  const res = await apiClient.get('/api/wishlist/collections');
  return res.data;
}

export async function createCollection(name: string): Promise<WishlistCollectionDTO> {
  const res = await apiClient.post('/api/wishlist/collections', { name });
  return res.data;
}

export async function renameCollection(id: number, name: string): Promise<void> {
  await apiClient.put(`/api/wishlist/collections/${id}`, { name });
}

export async function deleteCollection(id: number): Promise<void> {
  await apiClient.delete(`/api/wishlist/collections/${id}`);
}

export async function getCollectionItems(id: number, page = 1, pageSize = 20): Promise<CollectionItemsResponse> {
  const res = await apiClient.get(`/api/wishlist/collections/${id}/items`, { params: { page, pageSize } });
  return res.data;
}

export async function addToCollection(collectionId: number, productId: number): Promise<void> {
  await apiClient.post(`/api/wishlist/collections/${collectionId}/items/${productId}`);
}

export async function removeFromCollection(collectionId: number, productId: number): Promise<void> {
  await apiClient.delete(`/api/wishlist/collections/${collectionId}/items/${productId}`);
}
