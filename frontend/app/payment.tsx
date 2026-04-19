import React from 'react';
import PaymentPage from '../components/screen/PaymentPage';
import { useRouter } from 'expo-router';

export default function PaymentScreen() {
  const router = useRouter();

  return (
    <PaymentPage 
      onClose={() => router.back()} 
      totalAmount={0} 
    />
  );
}
