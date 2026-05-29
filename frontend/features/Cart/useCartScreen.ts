import { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { LayoutAnimation } from 'react-native';
import { CartSectionType } from './cart.types';
import {
  getCartSummary,
  toggleAllChecked,
  toggleItemChecked,
  toggleShopChecked,
  updateItemQuantity,
  mapBackendCartToSections,
} from './cart.utils';
import { Product } from '@/components/common/ProductCard';
import { getCartItems, updateCartItemQuantity, deleteCartItem } from '../../lib/cartApi';
import { getFeaturedProducts, formatPrice, formatSold } from '../../lib/productApi';

export default function useCartScreen() {
  const router = useRouter();
  const [sections, setSections] = useState<CartSectionType[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const [items, featured] = await Promise.all([
        getCartItems(),
        getFeaturedProducts(6)
      ]);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setSections(mapBackendCartToSections(items));
      setRecommendedProducts(featured.map(dto => ({
        id: dto.id,
        name: dto.name,
        description: dto.description || '',
        price: formatPrice(dto.price),
        originalPrice: dto.originalPrice ? formatPrice(dto.originalPrice) : undefined,
        discount: dto.discount > 0 ? `-${dto.discount}%` : undefined,
        rating: dto.rating,
        reviews: formatSold(dto.soldQuantity),
        image: dto.image ? { uri: dto.image } : require('../../assets/images/product/product-1.png'),
      })));
    } catch (error) {
      console.error('Failed to fetch cart data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const summary = useMemo(() => getCartSummary(sections), [sections]);

  const handleToggleShop = (shopId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSections(prev => toggleShopChecked(prev, shopId));
  };

  const handleToggleItem = (shopId: string, itemId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSections(prev => toggleItemChecked(prev, shopId, itemId));
  };

  const handleUpdateQuantity = async (shopId: string, itemId: string, newQty: number) => {
    if (newQty < 1) {
      // Handle delete
      const success = await deleteCartItem(parseInt(itemId));
      if (success) fetchCart();
      return;
    }

    const res = await updateCartItemQuantity(parseInt(itemId), newQty);
    if (res.success) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setSections(prev => {
        return prev.map(section => {
          if (section.shopId !== shopId) return section;
          return {
            ...section,
            items: section.items.map(item => {
              if (item.id !== itemId) return item;
              return { ...item, quantity: newQty };
            })
          };
        });
      });
    }
  };

  const handleIncreaseItem = (shopId: string, itemId: string) => {
    const section = sections.find(s => s.shopId === shopId);
    const item = section?.items.find(i => i.id === itemId);
    if (item) {
      handleUpdateQuantity(shopId, itemId, item.quantity + 1);
    }
  };

  const handleDecreaseItem = (shopId: string, itemId: string) => {
    const section = sections.find(s => s.shopId === shopId);
    const item = section?.items.find(i => i.id === itemId);
    if (item && item.quantity > 1) {
      handleUpdateQuantity(shopId, itemId, item.quantity - 1);
    } else if (item && item.quantity === 1) {
      handleUpdateQuantity(shopId, itemId, 0); // Trigger delete
    }
  };

  const handleToggleAll = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSections(prev => toggleAllChecked(prev));
  };

  const handlePressVoucher = (shopId: string) => {
    console.log('voucher shop:', shopId);
  };

  const handlePressProduct = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  const handlePressItem = (shopId: string, itemId: string) => {
    const section = sections.find(s => s.shopId === shopId);
    const item = section?.items.find(i => i.id === itemId);
    if (item) {
      router.push(`/product/${item.productId}`);
    }
  };

  const handleCheckout = (platformVoucherIds?: string, shopVoucherId?: number) => {
    const selectedIds = sections
      .flatMap(s => s.items)
      .filter(i => i.checked && !i.disabled)
      .map(i => i.id);
    
    if (selectedIds.length === 0) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm");
      return;
    }
    
    router.push({
      pathname: '/payment',
      params: { 
        cartItemIds: selectedIds.join(','),
        ...(platformVoucherIds ? { platformVoucherIds: platformVoucherIds } : {}),
        ...(shopVoucherId ? { shopVoucherId: shopVoucherId.toString() } : {})
      }
    });
  };

  const handleDeleteShop = async (shopId: string) => {
    const section = sections.find(s => s.shopId === shopId);
    if (!section) return;
    
    try {
      // Xóa từng item trong shop (do API hiện tại chỉ hỗ trợ xóa từng cái)
      await Promise.all(section.items.map(item => deleteCartItem(parseInt(item.id))));
      fetchCart();
    } catch (error) {
      console.error('Failed to delete shop items:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const success = await deleteCartItem(parseInt(itemId));
      if (success) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setSections(prev => {
          return prev.map(section => ({
            ...section,
            items: section.items.filter(item => item.id !== itemId)
          })).filter(section => section.items.length > 0);
        });
      }
    } catch (error) {
      console.error('Failed to delete cart item:', error);
    }
  };

  return {
    sections,
    summary,
    recommendedProducts,
    isLoading,
    fetchCart,
    handleToggleShop,
    handleToggleItem,
    handleIncreaseItem,
    handleDecreaseItem,
    handleToggleAll,
    handlePressVoucher,
    handlePressProduct,
    handlePressItem,
    handleCheckout,
    handleDeleteShop,
    handleDeleteItem,
  };
}
