import { NotificationItemModel, TabModel } from './notification.types';

export const MOCK_NOTIFICATIONS: NotificationItemModel[] = [
  // Cập nhật đơn hàng
  {
    id: '1',
    type: 'ORDER',
    title: 'Đơn hàng #123456 của bạn đang được giao',
    description: 'Kiện hàng đã rời kho phân loại và đang trên đường đến bạn. Vui lòng giữ liên lạc.',
    time: '10:24',
    isOlder: false,
    statusText: 'THANH TOÁN THÀNH CÔNG',
    iconName: 'box',
    iconColor: '#fff',
    bgColor: '#1E293B',
  },
  {
    id: '2',
    type: 'ORDER',
    title: 'Giao hàng thành công',
    description: 'Đơn hàng #099887 đã được giao thành công đến bạn. Hãy đánh giá sản phẩm nhé!',
    time: 'Hôm qua',
    isOlder: true,
    iconName: 'check-circle',
    iconColor: '#fff',
    bgColor: '#4B5563',
  },
  // Khuyến mãi
  {
    id: '3',
    type: 'PROMO',
    title: 'Voucher 50k dành riêng cho bạn!',
    description: 'Ưu đãi độc quyền cho đơn hàng từ 200k. Hạn sử dụng có hạn, nhanh tay kẻo lỡ!',
    time: '08:15',
    isOlder: false,
    hasCTA: true,
    iconName: 'tag',
    iconColor: '#fff',
    bgColor: '#EF4444',
  },
  {
    id: '4',
    type: 'PROMO',
    title: 'Miễn phí vận chuyển cuối tuần',
    description: 'Tặng bạn mã freeship cho mọi đơn hàng. Mua sắm ngay!',
    time: 'T6',
    isOlder: true,
    hasCTA: true,
    iconName: 'truck',
    iconColor: '#fff',
    bgColor: '#F59E0B',
  },
  // Tin tức
  {
    id: '5',
    type: 'NEWS',
    title: 'ShopeeLite cập nhật tính năng mới',
    description: 'Trải nghiệm mua sắm mượt mà hơn với giao diện tối giản và tốc độ tải trang cực nhanh.',
    time: 'Hôm qua',
    isOlder: false,
    iconName: 'cpu',
    iconColor: '#fff',
    bgColor: '#0F172A',
  },
  // Hệ thống
  {
    id: '6',
    type: 'SYSTEM',
    title: 'Bảo trì hệ thống thanh toán',
    description: 'Hệ thống sẽ tạm ngưng giao dịch từ 2h-4h sáng ngày mai để nâng cấp. Xin lỗi vì sự bất tiện này.',
    time: 'T5',
    isOlder: false,
    iconName: 'settings',
    iconColor: '#fff',
    bgColor: '#64748B',
  },
];

export const TABS: TabModel[] = [
  { id: 'ORDER', label: 'Cập nhật đơn hàng' },
  { id: 'PROMO', label: 'Khuyến mãi' },
  { id: 'NEWS', label: 'Tin tức' },
  { id: 'SYSTEM', label: 'Hệ thống' },
];
