export type OrderTab = 'all' | 'unpaid' | 'to-ship' | 'shipping' | 'completed' | 'cancelled' | 'returns';

export interface OrderTabOption {
  key: OrderTab;
  label: string;
}

export const ORDER_TABS: OrderTabOption[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'unpaid', label: 'Chờ xác nhận' },
  { key: 'to-ship', label: 'Chờ giao' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'completed', label: 'Hoàn tất' },
  { key: 'cancelled', label: 'Đã huỷ' },
];
