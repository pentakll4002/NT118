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



/**
 * Fetch all categories
 */
export async function getCategories(): Promise<CategoryDTO[]> {


  try {
    const res = await apiClient.get('/api/categories');
    // The backend returns CategoryResponse which matches CategoryDTO structure
    return res.data?.data || res.data || [];
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    return [];
  }
}
