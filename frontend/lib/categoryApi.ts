import { apiClient } from './apiClient';

// Toggle to use mock data for testing
const USE_MOCK = false;

export interface CategoryDTO {
  id: number;
  name: string;
  slug: string;
  parentId?: number | null;
  imageUrl?: string | null;
  sortOrder: number;
}

const MOCK_CATEGORIES: CategoryDTO[] = [
  { id: 1, name: 'Thời Trang Nam', slug: 'thoi-trang-nam', imageUrl: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=500', sortOrder: 1 },
  { id: 2, name: 'Thời Trang Nữ', slug: 'thoi-trang-nu', imageUrl: 'https://images.unsplash.com/photo-1539109132304-399946ad902d?w=500', sortOrder: 2 },
  { id: 3, name: 'Điện Thoại & Phụ Kiện', slug: 'dien-thoai-phu-kien', imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500', sortOrder: 3 },
  { id: 4, name: 'Máy Tính & Laptop', slug: 'may-tinh-laptop', imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500', sortOrder: 4 },
  { id: 5, name: 'Đồ Gia Dụng', slug: 'do-gia-dung', imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500', sortOrder: 5 },
  { id: 6, name: 'Sức Khỏe & Sắc Đẹp', slug: 'suc-khoe-sac-dep', imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500', sortOrder: 6 },
  { id: 7, name: 'Giày Dép Nam', slug: 'giay-dep-nam', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', sortOrder: 7 },
  { id: 8, name: 'Đồng Hồ', slug: 'dong-ho', imageUrl: 'https://images.unsplash.com/photo-1524592091214-8f97ad249017?w=500', sortOrder: 8 },
];

/**
 * Fetch all categories
 */
export async function getCategories(): Promise<CategoryDTO[]> {
  if (USE_MOCK) {
    return MOCK_CATEGORIES;
  }

  try {
    const res = await apiClient.get('/api/categories');
    // The backend returns CategoryResponse which matches CategoryDTO structure
    return res.data?.data || res.data || [];
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    return [];
  }
}
