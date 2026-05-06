import { apiClient } from './apiClient';
import { getAuthToken } from './authToken';

export interface UserProfileDTO {
  id: number;
  email: string;
  name: string;
  phone?: string | null;
  avatarUrl?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  role: string;
}

export interface UserAddressDTO {
  id: number;
  userId: number;
  recipientName: string;
  recipientPhone: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  isDefault: boolean;
  latitude?: number | null;
  longitude?: number | null;
  poiName?: string | null;
  formattedAddress?: string | null;
}

export interface UpdateProfileRequest {
  email: string;
  phone?: string;
  fullName?: string;
  avatarUrl?: string;
  gender?: string;
  dateOfBirth?: string;
  bio?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

const USE_MOCK = false;

export const userApi = {
  // --- Profile ---
  getProfile: async (): Promise<UserProfileDTO> => {
    if (USE_MOCK) {
      const token = await getAuthToken();
      if (token?.startsWith('mock-token:')) {
        const [, role, email] = token.split(':');
        return {
          id: 999,
          email: email || 'user@test.com',
          name: email ? email.split('@')[0] : 'Mock User',
          role: (role as any) || 'buyer',
        };
      }
      // Fallback for old mock tokens
      return {
        id: 999,
        email: 'admin@test.com',
        name: 'Admin Tester',
        role: 'admin',
      };
    }
    const res = await apiClient.get('/api/user/profile');
    const raw = res.data?.data || res.data;
    // Map backend UserProfileResponse to frontend UserProfileDTO
    return {
      id: raw.userId ?? raw.id,
      email: raw.email,
      name: raw.fullName || raw.username || raw.email?.split('@')[0] || '',
      phone: raw.phone,
      avatarUrl: raw.avatarUrl,
      gender: raw.gender === 'male' ? 'Nam' : raw.gender === 'female' ? 'Nữ' : raw.gender === 'other' ? 'Khác' : raw.gender,
      dateOfBirth: raw.dateOfBirth ? raw.dateOfBirth.split('-').reverse().join('/') : raw.dateOfBirth,
      role: raw.role || 'buyer',
    };
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<void> => {
    const payload: any = { ...data };
    if (payload.gender) {
      const g = payload.gender.toLowerCase();
      if (g === 'nam') payload.gender = 'male';
      else if (g === 'nữ' || g === 'nu') payload.gender = 'female';
      else if (g === 'khác' || g === 'khac') payload.gender = 'other';
      else delete payload.gender;
    }
    if (payload.dateOfBirth && payload.dateOfBirth.includes('/')) {
      const [d, m, y] = payload.dateOfBirth.split('/');
      if (y && m && d) {
        payload.dateOfBirth = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
    }
    await apiClient.put('/api/user/profile', payload);
  },

  // --- Security ---
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.put('/api/user/password', data);
  },

  // --- Addresses ---
  getAddresses: async (): Promise<UserAddressDTO[]> => {
    if (USE_MOCK) {
      return [
        {
          id: 1,
          userId: 1,
          recipientName: 'Nguyễn Văn A',
          recipientPhone: '0987654321',
          province: 'Hà Nội',
          district: 'Cầu Giấy',
          ward: 'Dịch Vọng',
          streetAddress: 'Số 123 Đường Cầu Giấy',
          isDefault: true,
        }
      ];
    }
    const res = await apiClient.get('/api/user/addresses');
    return res.data?.data || res.data || [];
  },

  addAddress: async (data: Omit<UserAddressDTO, 'id' | 'userId'>): Promise<UserAddressDTO> => {
    const res = await apiClient.post('/api/user/addresses', data);
    return res.data?.data || res.data;
  },

  updateAddress: async (id: number, data: Partial<UserAddressDTO>): Promise<void> => {
    await apiClient.put(`/api/user/addresses/${id}`, data);
  },

  deleteAddress: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/user/addresses/${id}`);
  },
};
