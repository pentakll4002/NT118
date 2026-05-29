import PlaceOrder from '@/components/screen/PlaceOrder';
import { useLocalSearchParams } from 'expo-router';

export default function PlaceOrderRoute() {
  const { productId, quantity, variantId } = useLocalSearchParams();
  return (
    <PlaceOrder
      productId={Number(productId)}
      quantity={Number(quantity || 1)}
      variantId={variantId ? Number(variantId) : undefined}
    />
  );
}
