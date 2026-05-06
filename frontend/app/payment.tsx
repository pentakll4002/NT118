import React from 'react';
import PaymentPage from '../components/screen/PaymentPage';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const productId = params.productId ? Number(params.productId) : undefined;
  const quantity = params.quantity ? Number(params.quantity) : undefined;

  return (
    <PaymentPage 
      onClose={() => router.back()} 
      totalAmount={0} 
      productId={productId}
      quantity={quantity}
      cartItemIds={params.cartItemIds as string}
      platformVoucherIds={params.platformVoucherIds as string}
      shopVoucherId={params.shopVoucherId ? Number(params.shopVoucherId) : undefined}
    />
  );
}
