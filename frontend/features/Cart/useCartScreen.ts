import { useMemo, useState } from 'react';
import { CartSectionType } from './cart.types';
import {
  getCartSummary,
  toggleAllChecked,
  toggleItemChecked,
  toggleShopChecked,
  updateItemQuantity,
} from './cart.utils';
import { Product } from '@/components/common/ProductCard';


const initialSections: CartSectionType[] = [
  {
    shopId: 'shop-1',
    shopName: 'ShopeeLite Mall',
    checked: false,
    voucherLabel: 'ShopeeLite Voucher',
    voucherValue: 'Chọn hoặc nhập mã',
    items: [
      {
        id: 'item-1',
        name: 'Khẩu trang 4D kháng khuẩn',
        image: 'https://picsum.photos/200',
        variant: 'Phân loại: Màu Trắng',
        price: 65000,
        quantity: 1,
        checked: true,
      },
      {
        id: 'item-2',
        name: 'Giày Chạy Bộ Nam',
        image: 'https://picsum.photos/201',
        variant: 'Phân loại: Đỏ, 42',
        price: 890000,
        originalPrice: 990000,
        quantity: 1,
        checked: false,
      },
    ],
  },
];

const recommendedProducts: Product[] = [
  {
    id: 'p1',
    name: 'Áo thun Cotton Basic Unisex',
    description: 'Chất vải mềm mại, form rộng dễ mặc hằng ngày',
    price: '₫129.000',
    originalPrice: '₫199.000',
    discount: '-35%',
    rating: 4.5,
    reviews: '1.2k',
    image: { uri: 'https://picsum.photos/202' },
  },
  {
    id: 'p2',
    name: 'Đồng hồ thông minh Series 8',
    description: 'Thiết kế hiện đại, theo dõi sức khỏe và vận động',
    price: '₫1.450.000',
    originalPrice: '₫1.890.000',
    discount: '-23%',
    rating: 4.8,
    reviews: '860',
    image: { uri: 'https://picsum.photos/203' },
  },
];

export default function useCartScreen() {
  const [sections, setSections] = useState<CartSectionType[]>(initialSections);

  const summary = useMemo(() => getCartSummary(sections), [sections]);

  const handleToggleShop = (shopId: string) => {
    setSections(prev => toggleShopChecked(prev, shopId));
  };

  const handleToggleItem = (shopId: string, itemId: string) => {
    setSections(prev => toggleItemChecked(prev, shopId, itemId));
  };

  const handleIncreaseItem = (shopId: string, itemId: string) => {
    setSections(prev => updateItemQuantity(prev, shopId, itemId, 'increase'));
  };

  const handleDecreaseItem = (shopId: string, itemId: string) => {
    setSections(prev => updateItemQuantity(prev, shopId, itemId, 'decrease'));
  };

  const handleToggleAll = () => {
    setSections(prev => toggleAllChecked(prev));
  };

  const handlePressVoucher = (shopId: string) => {
    console.log('voucher shop:', shopId);
  };

  const handlePressProduct = (product: Product) => {
    console.log('product press:', product.id);
  };

  const handleCheckout = () => {
    console.log('checkout');
  };

  return {
    sections,
    summary,
    recommendedProducts,
    handleToggleShop,
    handleToggleItem,
    handleIncreaseItem,
    handleDecreaseItem,
    handleToggleAll,
    handlePressVoucher,
    handlePressProduct,
    handleCheckout,
  };
}