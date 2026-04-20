export type ProductStatus = 'live' | 'sold_out' | 'reviewing';

export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;        // VND
  stock: number;        // Số lượng tồn kho
  status: ProductStatus;
}

export interface ProductStatsData {
  totalProducts: number;
  liveProducts: number;
  soldOutProducts: number;
  reviewingProducts: number;
}

// ——— Products ———
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Nike Air Max Speed 2.0 – Edition Crimson Red',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    price: 2450000,
    stock: 42,
    status: 'live',
  },
  {
    id: '2',
    name: 'Minimalist White Ceramic Watch – Series 4',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    price: 1890000,
    stock: 0,
    status: 'sold_out',
  },
  {
    id: '3',
    name: 'Over-Ear Studio Headphones Platinum Grey',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    price: 5200000,
    stock: 15,
    status: 'reviewing',
  },
  {
    id: '4',
    name: 'Classic Leather Backpack – Vintage Brown',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    price: 1350000,
    stock: 28,
    status: 'live',
  },
  {
    id: '5',
    name: 'Smart Fitness Band Pro – Midnight Black',
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400',
    price: 990000,
    stock: 0,
    status: 'sold_out',
  },
];

// ——— Stats ———
export const mockProductStats: ProductStatsData = {
  totalProducts: mockProducts.length,
  liveProducts: mockProducts.filter((p) => p.status === 'live').length,
  soldOutProducts: mockProducts.filter((p) => p.status === 'sold_out').length,
  reviewingProducts: mockProducts.filter((p) => p.status === 'reviewing').length,
};

// ——— Filter tabs ———
export type FilterTab = 'all' | 'live' | 'sold_out' | 'reviewing';

export const filterTabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'ALL' },
  { key: 'live', label: 'LIVE' },
  { key: 'sold_out', label: 'SOLD OUT' },
  { key: 'reviewing', label: 'REVIEWING' },
];
