import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getAuthToken } from './authToken';

const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const extraUrl = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl?.trim();

/** Metro/dev server host during `expo start` — dùng để gọi backend cùng máy (thiết bị thật / Expo Go). */
function inferredDevApiHost(): string | undefined {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return undefined;
  const host = hostUri.split(':')[0]?.trim();
  if (!host || host === 'localhost' || host === '127.0.0.1') return undefined;
  return host;
}

function defaultBaseUrl(): string {
  const fromConfig = extraUrl || envUrl;
  if (fromConfig) return fromConfig.replace(/\/$/, '');

  const lanHost = inferredDevApiHost();
  if (lanHost) return `http://${lanHost}:5058`;

  if (Platform.OS === 'android') return 'http://10.0.2.2:5058';
  return 'http://127.0.0.1:5058';
}

export const API_BASE_URL = defaultBaseUrl();

console.log('=== API Client Debug ===');
console.log('API_BASE_URL:', API_BASE_URL);
console.log('Platform:', Platform.OS);
console.log('======================');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('>>> API Request:', config.method?.toUpperCase(), config.url);
  console.log('>>> Full URL:', `${config.baseURL}${config.url}`);
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    console.log('<<< API Error:', err.message);
    console.log('<<< Error code:', err.code);
    console.log('<<< Error config:', err.config?.baseURL, err.config?.url);

    const data = err.response?.data as { message?: string; title?: string } | undefined;
    let message = `Không kết nối được máy chủ (${API_BASE_URL}). Bật backend cổng 5058 hoặc đặt EXPO_PUBLIC_API_URL.`;
    if (typeof data?.message === 'string') message = data.message;
    else if (typeof data?.title === 'string') message = data.title;
    else if (typeof err.message === 'string' && err.message.length > 0) message = err.message;
    return Promise.reject(new Error(message));
  },
);
