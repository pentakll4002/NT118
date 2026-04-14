import ProductDetails from '@/components/screen/ProductDetails';
import { useLocalSearchParams } from 'expo-router';

export default function ProductRoute() {
  const { id } = useLocalSearchParams();
  return <ProductDetails productId={Number(id)} />;
}
