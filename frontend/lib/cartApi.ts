import { apiClient } from './apiClient';

// Toggle to use mock data for testing
const USE_MOCK = false;


export interface AddToCartRequest {
  productId: number;
  variantId?: number;
  quantity: number;
}

export interface UserCartItemResponse {
  id: number;
  productId: number;
  shopId: number;
  shopName: string;
  productName: string;
  productSlug: string;
  unitPrice: number;
  quantity: number;
  mainImageUrl: string | null;
  variantId: number | null;
  variantName: string | null;
  variantValue: string | null;
  updatedAt: string;
}



/**
 * Add a product to the cart
 */
export async function addToCart(productId: number, quantity: number = 1, variantId?: number): Promise<{ success: boolean; message: string }> {


  try {
    const res = await apiClient.post('/api/cart', {
      productId,
      quantity,
      variantId
    });
    return {
      success: true,
      message: res.data?.message || 'Đã thêm vào giỏ hàng.'
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Thêm vào giỏ hàng thất bại.'
    };
  }
}

/**
 * Get the current items in the cart
 */
export async function getCartItems(): Promise<UserCartItemResponse[]> {

  try {
    const res = await apiClient.get('/api/cart');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Failed to fetch cart items:', err);
    return [];
  }
}

/**
 * Get the current number of items in the cart
 */
export async function getCartCount(): Promise<number> {
  const items = await getCartItems();
  return items.length;
}

/**
 * Update quantity of a cart item
 */
export async function updateCartItemQuantity(id: number, quantity: number): Promise<{ success: boolean; message: string }> {

  try {
    const res = await apiClient.put(`/api/cart/${id}`, { quantity });
    return { success: true, message: res.data?.message || 'Đã cập nhật.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Cập nhật thất bại.' };
  }
}

/**
 * Delete a cart item
 */
export async function deleteCartItem(id: number): Promise<{ success: boolean }> {

  try {
    await apiClient.delete(`/api/cart/${id}`);
    return { success: true };
  } catch (err) {
    console.error('Failed to delete cart item:', err);
    return { success: false };
  }
}
