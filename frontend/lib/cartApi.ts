import { apiClient } from './apiClient';
import { MOCK_PRODUCTS } from './mockData';

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

let mockCart: UserCartItemResponse[] = [
  {
    id: 1,
    productId: MOCK_PRODUCTS[0].id,
    shopId: (MOCK_PRODUCTS[0] as any).shopId ?? 1,
    shopName: 'ShopeeLite Mall',
    productName: MOCK_PRODUCTS[0].name,
    productSlug: MOCK_PRODUCTS[0].slug,
    unitPrice: MOCK_PRODUCTS[0].price,
    quantity: 1,
    mainImageUrl: MOCK_PRODUCTS[0].image,
    variantId: 10,
    variantName: 'Màu sắc',
    variantValue: 'Đỏ Trắng',
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    productId: MOCK_PRODUCTS[3].id,
    shopId: (MOCK_PRODUCTS[3] as any).shopId ?? 1,
    shopName: 'ShopeeLite Mall',
    productName: MOCK_PRODUCTS[3].name,
    productSlug: MOCK_PRODUCTS[3].slug,
    unitPrice: MOCK_PRODUCTS[3].price,
    quantity: 1,
    mainImageUrl: MOCK_PRODUCTS[3].image,
    variantId: null,
    variantName: null,
    variantValue: null,
    updatedAt: new Date().toISOString()
  }
];

/**
 * Add a product to the cart
 */
export async function addToCart(productId: number, quantity: number = 1, variantId?: number): Promise<{ success: boolean; message: string }> {
  if (USE_MOCK) {
    const product = MOCK_PRODUCTS.find(p => p.id === productId);
    if (!product) return { success: false, message: 'Không tìm thấy sản phẩm.' };

    const existing = mockCart.find(i => i.productId === productId && i.variantId === (variantId || null));
    if (existing) {
      existing.quantity += quantity;
      existing.updatedAt = new Date().toISOString();
    } else {
      const variant = product.variants?.find(v => v.id === variantId);
      mockCart.push({
        id: mockCart.length > 0 ? Math.max(...mockCart.map(i => i.id)) + 1 : 1,
        productId,
        shopId: (product as any).shopId ?? 1,
        shopName: 'ShopeeLite Mall',
        productName: product.name,
        productSlug: product.slug,
        unitPrice: product.price + (variant?.priceModifier || 0),
        quantity,
        mainImageUrl: product.image,
        variantId: variantId || null,
        variantName: variant?.name || null,
        variantValue: variant?.value || null,
        updatedAt: new Date().toISOString()
      });
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Đã thêm vào giỏ hàng thành công (Mock Mode)'
        });
      }, 300);
    });
  }

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
  if (USE_MOCK) {
    return [...mockCart];
  }
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
  if (USE_MOCK) {
    const item = mockCart.find(i => i.id === id);
    if (item) {
      item.quantity = quantity;
      item.updatedAt = new Date().toISOString();
    }
    return { success: true, message: 'Updated (Mock)' };
  }
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
  if (USE_MOCK) {
    mockCart = mockCart.filter(i => i.id !== id);
    return { success: true };
  }
  try {
    await apiClient.delete(`/api/cart/${id}`);
    return { success: true };
  } catch (err) {
    console.error('Failed to delete cart item:', err);
    return { success: false };
  }
}
