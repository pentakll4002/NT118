import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'nt118_auth_token';

function webGet(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(KEY);
}

function webSet(token: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(KEY, token);
}

function webRemove(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(KEY);
}

export async function saveAuthToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    webSet(token);
    return;
  }
  await SecureStore.setItemAsync(KEY, token);
}

export async function getAuthToken(): Promise<string | null> {
  if (Platform.OS === 'web') return webGet();
  return SecureStore.getItemAsync(KEY);
}

export async function clearAuthToken(): Promise<void> {
  if (Platform.OS === 'web') {
    webRemove();
    return;
  }
  await SecureStore.deleteItemAsync(KEY);
}
