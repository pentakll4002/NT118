import { apiClient } from './apiClient';
import { saveAuthToken } from './authToken';

export type AuthResponse = {
  token: string;
  /** Backend trả về long; JSON an toàn trong number cho id thông thường */
  userId: number;
  email: string;
};

export type ForgotPasswordResponse = {
  message: string;
  resetCode?: string | null;
};

export type MessageResponse = {
  message: string;
};

function extractMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Đã xảy ra lỗi';
}

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data } = await apiClient.post<AuthResponse>('/api/auth/login', {
      email: email.trim(),
      password,
    });
    await saveAuthToken(data.token);
    return data;
  } catch (e) {
    throw new Error(extractMessage(e));
  }
}

export async function registerRequest(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data } = await apiClient.post<AuthResponse>('/api/auth/register', {
      email: email.trim(),
      password,
    });
    await saveAuthToken(data.token);
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
