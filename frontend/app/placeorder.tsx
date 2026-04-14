import PlaceOrder from '@/components/screen/PlaceOrder';
import { useLocalSearchParams } from 'expo-router';

export default function PlaceOrderRoute() {
  const { productId } = useLocalSearchParams();
  return <PlaceOrder productId={Number(productId)} />;
}
