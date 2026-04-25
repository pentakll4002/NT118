import { apiClient } from './apiClient';
import { saveAuthToken } from './authToken';

export type AuthResponse = {
  token: string;
  userId: number;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
};

export type ForgotPasswordResponse = {
  message: string;
  resetCode?: string | null;
};

export type MessageResponse = {
  message: string;
};

import axios from 'axios';

function extractMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || err.response?.data?.title || err.message;
  }
  if (err instanceof Error) return err.message;
  return 'Đã xảy ra lỗi';
}

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  const lowerEmail = email.trim().toLowerCase();

  // --- MOCK LOGIN BYPASS (Frontend Only Testing) ---
  if (lowerEmail === 'seller@test.com' || lowerEmail === 'buyer@test.com' || lowerEmail === 'admin@test.com') {
    let mockRole: 'seller' | 'buyer' | 'admin' = 'buyer';
    if (lowerEmail.includes('seller')) mockRole = 'seller';
    else if (lowerEmail.includes('admin')) mockRole = 'admin';

    const mockData: AuthResponse = {
      token: `mock-token:${mockRole}:${lowerEmail}`,
      userId: 999,
      email: lowerEmail,
      role: mockRole,
    };
    await saveAuthToken(mockData.token);
    return mockData;
  }
  // ------------------------------------------------

  try {
    const { data } = await apiClient.post<AuthResponse>('/api/auth/login', {
      email: lowerEmail,
      password,
    });
    const tokenStr = data.token || (data as any).Token || (data as any).data?.token;
    if (tokenStr && typeof tokenStr === 'string') {
      await saveAuthToken(tokenStr);
    } else {
      console.warn("SecureStore warning: Caching whole object because token was undefined", data);
      await saveAuthToken(JSON.stringify(data));
    }
    return data;
  } catch (e) {
    throw new Error(extractMessage(e));
  }
}

export async function sendRegisterCaptchaRequest(email: string): Promise<MessageResponse> {
  try {
    const { data } = await apiClient.post<MessageResponse>('/api/auth/send-register-captcha', {
      email: email.trim(),
    });
    return data;
  } catch (e) {
    throw new Error(extractMessage(e));
  }
}

export async function registerRequest(email: string, password: string, captchaCode: string): Promise<AuthResponse> {
  try {
    const { data } = await apiClient.post<AuthResponse>('/api/auth/register', {
      email: email.trim(),
      password,
      captchaCode: captchaCode.trim(),
    });
    const tokenStr = data.token || (data as any).Token || (data as any).data?.token;
    if (tokenStr && typeof tokenStr === 'string') {
      await saveAuthToken(tokenStr);
    } else {
      await saveAuthToken(JSON.stringify(data));
    }
    return data;
  } catch (e) {
    throw new Error(extractMessage(e));
  }
}

export async function forgotPasswordRequest(email: string): Promise<ForgotPasswordResponse> {
  try {
    const { data } = await apiClient.post<ForgotPasswordResponse>('/api/auth/forgot-password', {
      email: email.trim(),
    });
    return data;
  } catch (e) {
    throw new Error(extractMessage(e));
  }
}

export async function resetPasswordRequest(
  email: string,
  code: string,
  newPassword: string,
): Promise<MessageResponse> {
  try {
    const { data } = await apiClient.post<MessageResponse>('/api/auth/reset-password', {
      email: email.trim(),
      code: code.trim(),
      newPassword,
    });
    return data;
  } catch (e) {
    throw new Error(extractMessage(e));
  }
}