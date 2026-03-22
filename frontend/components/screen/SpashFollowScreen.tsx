import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const SpashFollowScreen = () => {
  const router = useRouter();

  const handleSkip = () => {
    // Navigate to main app (tabs), bypassing all onboarding
    router.replace('/(tabs)'); 
  };

  const handlePrev = () => {
    router.back();
  };

  const handleGetStarted = () => {
    // Chuyển sang màn hình GetStarted mới tạo
    router.replace('/get-started' as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1, paddingHorizontal: 17 }}>
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: 10,
        }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#000' }}>3/3</Text>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#000' }}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content Area */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          {/* Illustration Container */}
          <View style={{ 
            width: 300, 
            height: 300, 
            marginTop: 88, 
            position: 'relative',
          }}>
            {/* Layered SVG images from slashfl folder */}
            <Image 
              source={require('../../assets/images/slashfl/freepik--Mannequin--inject-34.svg')}
              style={{ width: '100%', height: '100%', position: 'absolute' }}
              contentFit="contain"
            />
            <Image 
              source={require('../../assets/images/slashfl/freepik--Plant--inject-34.svg')}
              style={{ width: '100%', height: '100%', position: 'absolute' }}
              contentFit="contain"
            />
            <Image 
              source={require('../../assets/images/slashfl/freepik--Character--inject-34.svg')}
              style={{ width: '100%', height: '100%', position: 'absolute' }}
              contentFit="contain"
            />
            <Image 
              source={require('../../assets/images/slashfl/freepik--speech-bubble--inject-34.svg')}
              style={{ width: '100%', height: '100%', position: 'absolute' }}
              contentFit="contain"
            />
          </View>

          {/* Text Content */}
          <View style={{ marginTop: 15, alignItems: 'center', paddingHorizontal: 17 }}>
            <Text 
              style={{ 
                color: 'black', 
                fontSize: 24, 
                fontWeight: '800', 
                textAlign: 'center',
                lineHeight: 30,
              }}
            >
              Theo dõi đơn hàng
            </Text>
            <Text 
              style={{ 
                color: '#A8A8A9', 
                fontSize: 14, 
                textAlign: 'center', 
                marginTop: 10,
                lineHeight: 24,
              }}
            >
              Biết ngay đơn hàng của bạn đang ở đâu. Cập nhật trạng thái vận chuyển theo thời gian thực đến tận cửa nhà!
            </Text>
          </View>
        </View>

        {/* Footer Navigation */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 34,
          paddingHorizontal: 10
        }}>
          <TouchableOpacity onPress={handlePrev}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#C4C4C4' }}>Prev</Text>
          </TouchableOpacity>

          {/* Pagination Dots */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#D9D9D9', opacity: 0.3 }} />
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#D9D9D9', opacity: 0.3 }} />
            <View style={{ width: 40, height: 10, borderRadius: 5, backgroundColor: '#17223B' }} />
          </View>

          <TouchableOpacity onPress={handleGetStarted}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#F83758' }}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SpashFollowScreen;
