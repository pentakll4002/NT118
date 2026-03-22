import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OnboardingScreen = () => {
  const router = useRouter();

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  const handleNext = () => {
    router.push('/splash-pay');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Top Status Bar Placeholder */}
      <View style={{ width: SCREEN_WIDTH, height: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 21 }}>
        <Text style={{ fontSize: 15, fontWeight: '500', color: 'black' }}>9:41</Text>
      </View>

      {/* Header with Step and Skip */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingHorizontal: 17, 
        marginTop: 1, 
      }}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ color: 'black', fontSize: 18, fontWeight: '600' }}>1</Text>
          <Text style={{ color: '#A0A0A1', fontSize: 18, fontWeight: '600' }}>/3</Text>
        </View>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={{ color: 'black', fontSize: 18, fontWeight: '600' }}>Skip</Text>
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
          {/* Layered SVG images from slashsp folder for better quality */}
          <Image 
            source={require('../../assets/images/slashsp/freepik--Shelf_2--inject-4.svg')}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            contentFit="contain"
          />
          <Image 
            source={require('../../assets/images/slashsp/freepik--Shelf_1--inject-4.svg')}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            contentFit="contain"
          />
          
          {/* Midground - Counter and Clothes */}
          <Image 
            source={require('../../assets/images/slashsp/freepik--Counter--inject-4.svg')}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            contentFit="contain"
          />
          <Image 
            source={require('../../assets/images/slashsp/freepik--Clothes--inject-4.svg')}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            contentFit="contain"
          />

          {/* Foreground - Character and Mannequin */}
          <Image 
            source={require('../../assets/images/slashsp/freepik--Character--inject-4.svg')}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            contentFit="contain"
          />
          <Image 
            source={require('../../assets/images/slashsp/freepik--Mannequin--inject-4.svg')}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            contentFit="contain"
          />
          
          {/* Small Details */}
          <Image 
            source={require('../../assets/images/slashsp/freepik--Boxes--inject-4.svg')}
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
              marginBottom: 15
            }}
          >
            Chọn sản phẩm
          </Text>

          <Text 
            style={{ 
              color: '#A8A8A9', 
              fontSize: 14, 
              fontWeight: '600', 
              textAlign: 'center', 
              lineHeight: 24,
              letterSpacing: 0.28,
              width: 340
            }}
          >
            Khám phá hàng triệu sản phẩm từ thời trang, điện tử đến đồ gia dụng. Tìm món đồ yêu thích chỉ trong vài giây!
          </Text>
        </View>
      </View>

      {/* Footer with Pagination and Next */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 20, 
        height: 100,
        marginBottom: 20
      }}>
        <View style={{ width: 44 }} /> 
        
        {/* Pagination Dots */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 40, height: 8, backgroundColor: '#17223B', borderRadius: 100 }} />
          <View style={{ width: 10, height: 10, backgroundColor: 'rgba(23, 34, 59, 0.20)', borderRadius: 100 }} />
          <View style={{ width: 10, height: 10, backgroundColor: 'rgba(23, 34, 59, 0.20)', borderRadius: 100 }} />
        </View>

        {/* Next Button */}
        <TouchableOpacity 
          onPress={handleNext}
          style={{ paddingVertical: 10 }}
        >
          <Text 
            style={{ 
              color: '#F83758', 
              fontSize: 18, 
              fontWeight: '600'
            }}
          >
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
