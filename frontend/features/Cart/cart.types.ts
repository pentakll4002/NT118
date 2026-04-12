export type CartItemType = {
  id: string;
  name: string;
  image: string;
  variant?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  checked: boolean;
  disabled?: boolean;
};

export type CartSectionType = {
  shopId: string;
  shopName: string;
  checked: boolean;
  voucherLabel?: string;
  voucherValue?: string;
  items: CartItemType[];
};

export type CartSummaryType = {
  totalPrice: number;
  selectedCount: number;
  allChecked: boolean;
};