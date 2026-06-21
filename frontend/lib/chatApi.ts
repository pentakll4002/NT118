import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { API_BASE_URL } from './apiClient';

export type ChatHistoryMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type ChatApiRequest = {
  message: string;
  conversation_history: ChatHistoryMessage[];
  use_rag?: boolean;
  top_k?: number;
  signal?: AbortSignal;
};

type ChatProduct = {
  id: number | string;
  name: string;
  brand?: string;
  price: number;
  original_price?: number;
  sale_price?: number;
  category?: string;
  image?: string;
  rating?: number;
  deep_link: string;
};

type ChatApiResponse = {
  answer: string;
  sources?: string[];
  num_sources?: number;
  products?: ChatProduct[];
};

const envChatbotUrl = process.env.EXPO_PUBLIC_CHATBOT_URL?.trim();

function inferredDevHost(): string | undefined {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return undefined;
  const host = hostUri.split(':')[0]?.trim();
  if (!host || host === 'localhost' || host === '127.0.0.1') return undefined;
  return host;
}

function chatbotBaseUrl(): string {
  if (envChatbotUrl) return envChatbotUrl.replace(/\/$/, '');

  const backendHostUrl = API_BASE_URL.replace(/:\d+$/, ':8000');
  if (backendHostUrl) return backendHostUrl;

  const lanHost = inferredDevHost();
  if (lanHost) return `http://${lanHost}:8000`;

  if (Platform.OS === 'android') return 'http://10.0.2.2:8000';
  return 'http://127.0.0.1:8000';
}

const chatbotClient = axios.create({
  baseURL: chatbotBaseUrl(),
  timeout: 150000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

chatbotClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const detail = err.response?.data?.detail;
    const code = err.code;

    if (code === 'ERR_CANCELED') {
      return Promise.reject(new Error('Chatbot phan hoi qua lau, da tu dong dung. Thu gui lai.'));
    }
    if (code === 'ECONNABORTED') {
      return Promise.reject(new Error('Chatbot timeout. Server dang xu ly lau, thu lai sau it giay.'));
    }
    if (typeof detail === 'string' && detail.length > 0) {
      return Promise.reject(new Error(detail));
    }
    if (typeof err.message === 'string' && err.message.length > 0) {
      return Promise.reject(new Error(err.message));
    }
    return Promise.reject(new Error('Khong the ket noi chatbot (port 8000).'));
  },
);

export async function sendChatMessage(payload: ChatApiRequest): Promise<ChatApiResponse> {
  const { signal, ...body } = payload;
  const { data } = await chatbotClient.post<ChatApiResponse>('/api/chat', body, { signal });
  return data;
}

export type AIParsedSearch = {
  extracted_query: string;
  category: string | null;
  color: string | null;
  max_price: number | null;
  min_price: number | null;
  brand?: string | null;
  specs?: string[];
};

export async function aiParseSearch(query: string): Promise<AIParsedSearch> {
  try {
    const { data } = await chatbotClient.post<AIParsedSearch>('/api/suggest/ai-parse', { query });
    return data;
  } catch (error) {
    console.log('aiParseSearch error:', error);
    // fallback
    return { extracted_query: query, category: null, color: null, max_price: null, min_price: null, brand: null, specs: [] };
  }
}

export type VoiceParsedResponse = {
  text: string;
  action: 'SEARCH' | 'NAVIGATE' | 'ADD_TO_CART' | 'FAVORITE' | 'UNKNOWN';
  params: Record<string, any>;
  response_message: string;
};

export async function parseVoiceText(text: string): Promise<VoiceParsedResponse> {
  const { data } = await chatbotClient.post<VoiceParsedResponse>('/api/voice/parse-text', { text });
  return data;
}

export async function parseVoiceAudio(audioUri: string): Promise<VoiceParsedResponse> {
  const formData = new FormData();
  
  const uriParts = audioUri.split('.');
  const fileType = uriParts[uriParts.length - 1] || 'm4a';
  
  formData.append('file', {
    uri: Platform.OS === 'android' ? audioUri : audioUri.replace('file://', ''),
    name: `voice.${fileType}`,
    type: `audio/${fileType}`,
  } as any);

  const { data } = await chatbotClient.post<VoiceParsedResponse>('/api/voice/parse-audio', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
}

