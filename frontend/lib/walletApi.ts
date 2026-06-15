import { apiClient } from './apiClient';

export interface WalletDTO {
  id: number;
  userId: number;
  balance: number;
  coinBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClaimGiftResponse {
  message: string;
  amountClaimed: number;
  newBalance: number;
  transactionId: number;
}

export async function getWallet(): Promise<WalletDTO> {
  const res = await apiClient.get('/api/wallet');
  return res.data?.data || res.data;
}

export async function claimGift(): Promise<ClaimGiftResponse> {
  const res = await apiClient.post('/api/wallet/claim-gift');
  return res.data?.data || res.data;
}

export interface WalletTransactionDTO {
  id: number;
  walletId: number;
  amount: number;
  type: string;
  description: string;
  orderId?: number | null;
  createdAt: string;
}

export async function getTransactions(): Promise<WalletTransactionDTO[]> {
  const res = await apiClient.get('/api/wallet/transactions');
  return res.data?.data || res.data || [];
}

export interface TopUpResponse {
  message: string;
  balance: number;
  transactionId: number;
}

export async function topUp(amount: number): Promise<TopUpResponse> {
  const res = await apiClient.post('/api/wallet/topup', { amount });
  return res.data?.data || res.data;
}

export interface WithdrawResponse {
  message: string;
  balance: number;
  transactionId: number;
}

export async function withdraw(amount: number, bankName: string, accountNo: string): Promise<WithdrawResponse> {
  const res = await apiClient.post('/api/wallet/withdraw', { amount, bankName, accountNo });
  return res.data?.data || res.data;
}
