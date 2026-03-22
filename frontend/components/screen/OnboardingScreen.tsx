import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

const OnboardingScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Header with Step and Skip */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: 'black', fontSize: 18, fontWeight: '600' }}>1</Text>
          <Text style={{ color: '#A3A3A3', fontSize: 18, fontWeight: '600' }}>/3</Text>
        </View>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
          <Text style={{ color: 'black', fontSize: 18, fontWeight: '600' }}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
        {/* Illustration Placeholder */}
        <View style={{ width: 288, height: 288, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5', borderRadius: 144, marginBottom: 40, overflow: 'hidden' }}>
             <Image 
                source={require('../../assets/images/Group 34010.png')}
                style={{ width: '80%', height: '80%' }}
                contentFit="contain"
             />
        </View>

        {/* Title */}
        <Text 
          style={{ color: 'black', fontSize: 30, fontWeight: '800', textAlign: 'center', marginBottom: 16 }}
        >
          Chọn sản phẩm
        </Text>

        {/* Description */}
        <Text 
          style={{ color: '#A3A3A3', fontSize: 16, fontWeight: '600', textAlign: 'center', lineHeight: 24 }}
        >
          Khám phá hàng triệu sản phẩm từ thời trang, điện tử đến đồ gia dụng. Tìm món đồ yêu thích chỉ trong vài giây!
        </Text>
      </View>

      {/* Footer with Pagination and Next */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 40, paddingBottom: 40 }}>
        {/* Pagination Dots */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 40, height: 10, backgroundColor: '#1E293B', borderRadius: 5 }} />
          <View style={{ width: 10, height: 10, backgroundColor: '#1E293B', opacity: 0.2, borderRadius: 5 }} />
          <View style={{ width: 10, height: 10, backgroundColor: '#1E293B', opacity: 0.2, borderRadius: 5 }} />
        </View>

        {/* Next Button */}
        <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
          <Text 
            style={{ color: '#F43F5E', fontSize: 20, fontWeight: '700' }}
          >
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
