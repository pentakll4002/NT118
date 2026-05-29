import { apiClient } from './apiClient';
import { OrderDetail, OrderItem, OrderStatus } from './orderApi';

export interface ReturnRequestDTO {
  id: number;
  orderId: number;
  orderNumber: string;
  buyerId: number;
  buyerName?: string;
  buyerEmail?: string;
  reason: string;
  description: string | null;
  evidenceUrls: string[] | null;
  status: 'pending' | 'approved' | 'rejected';
  sellerNote: string | null;
  refundAmount: number;
  createdAt: string;
  updatedAt: string;
  orderItems?: OrderItem[];
}

export interface CreateReturnRequestData {
  reason: string;
  description?: string;
  evidenceUrls?: string[];
}

export interface ProcessReturnRequestData {
  status: 'approved' | 'rejected';
  sellerNote?: string;
}

// ── Buyer APIs ──────────────────────────────────────────────────────

export async function createReturnRequest(orderId: number, data: CreateReturnRequestData): Promise<{ message: string, returnRequestId: number }> {
  const res = await apiClient.post(`/api/orders/${orderId}/return`, data);
  return res.data;
}

export async function getReturnRequest(orderId: number): Promise<ReturnRequestDTO> {
  const res = await apiClient.get(`/api/orders/${orderId}/return`);
  return parseEvidenceUrls(res.data);
}

// ── Seller APIs ─────────────────────────────────────────────────────

export async function getSellerReturns(): Promise<ReturnRequestDTO[]> {
  const res = await apiClient.get('/api/seller/returns');
  return (res.data || []).map(parseEvidenceUrls);
}

export async function getSellerReturnDetail(id: number): Promise<ReturnRequestDTO> {
  const res = await apiClient.get(`/api/seller/returns/${id}`);
  return parseEvidenceUrls(res.data);
}

export async function processReturnRequest(id: number, data: ProcessReturnRequestData): Promise<{ message: string }> {
  const res = await apiClient.patch(`/api/seller/returns/${id}`, data);
  return res.data;
}

// ── Helpers ─────────────────────────────────────────────────────────

function parseEvidenceUrls(data: any): any {
  if (data.evidenceUrls && typeof data.evidenceUrls === 'string') {
    try {
      data.evidenceUrls = JSON.parse(data.evidenceUrls);
    } catch {
      data.evidenceUrls = [];
    }
  }
  if (!data.evidenceUrls) {
    data.evidenceUrls = [];
  }
  return data;
}

export function formatReturnStatus(status: string): string {
  const map: Record<string, string> = {
    pending: 'Đang chờ xử lý',
    approved: 'Đã chấp nhận',
    rejected: 'Đã từ chối',
  };
  return map[status.toLowerCase()] || status;
}

export function getReturnStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'pending': return '#f59e0b';
    case 'approved': return '#10b981';
    case 'rejected': return '#ef4444';
    default: return '#6b7280';
  }
}
