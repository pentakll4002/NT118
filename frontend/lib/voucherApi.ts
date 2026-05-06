import { apiClient } from './apiClient';

export interface VoucherDto {
  id: number;
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount: number;
}

export interface ApplyVoucherResponse {
  id: number;
  code: string;
  discount: number;
  finalAmount: number;
  voucher?: VoucherDto;
}

export const voucherApi = {
  // Get all available vouchers
  async getVouchers(): Promise<VoucherDto[]> {
    const response = await apiClient.get('/api/vouchers');
    return response.data?.data || response.data || [];
  },

  // Apply voucher code to order
  async applyVoucher(code: string, orderAmount: number): Promise<ApplyVoucherResponse> {
    const response = await apiClient.post('/api/payments/apply-voucher', {
      code: code.trim(),
      orderAmount,
    });
    return response.data?.data || response.data;
  },

  // Claim a voucher (save to user's vouchers)
  async claimVoucher(voucherId: number): Promise<{ message: string }> {
    const response = await apiClient.post(`/api/vouchers/${voucherId}/claim`);
    return response.data?.data || response.data;
  },

  // Get user's claimed vouchers
  async getUserVouchers(): Promise<any[]> {
    const response = await apiClient.get('/api/user/vouchers');
    return response.data?.data || response.data || [];
  },
};
