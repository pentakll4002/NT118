import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SplashPayScreen = () => {
  const router = useRouter();

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  const handleGoToCart = () => {
    router.push('/cart' as any);
  };

  const handleNext = () => {
    router.push('/splash-follow');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Top Status Bar Placeholder */}
      <View style={{ width: SCREEN_WIDTH, height: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 21 }}>
        <Text style={{ fontSize: 15, fontWeight: '500', color: 'black', fontFamily: 'Poppins_500Medium' }}>9:41</Text>
      </View>

      {/* Header with Step and Skip */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingHorizontal: 15, 
        marginTop: 1, 
      }}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ color: 'black', fontSize: 18, fontWeight: '600', fontFamily: 'Montserrat_600SemiBold' }}>2</Text>
          <Text style={{ color: '#A0A0A1', fontSize: 18, fontWeight: '600', fontFamily: 'Montserrat_600SemiBold' }}>/3</Text>
        </View>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
          <Text style={{ color: 'black', fontSize: 18, fontWeight: '600', fontFamily: 'Montserrat_600SemiBold' }}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <View style={{ flex: 1, alignItems: 'center' }}>
        {/* Illustration Container [225px top in figma] */}
        <View style={{ 
          width: 320, 
          height: 240, 
          marginTop: 136, 
          position: 'relative',
        }}>
          {/* Layered images from slashtt folder using SVG for better quality */}
          <Image 
            source={require('../../assets/images/slashtt/freepik--Device--inject-2.svg')}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            contentFit="contain"
          />
          <Image 
            source={require('../../assets/images/slashtt/freepik--Tab--inject-2.svg')}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            contentFit="contain"
          />
          <Image 
            source={require('../../assets/images/slashtt/freepik--character-1--inject-2.svg')}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            contentFit="contain"
          />
          <Image 
            source={require('../../assets/images/slashtt/freepik--character-2--inject-2.svg')}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            contentFit="contain"
          />
          <Image 
            source={require('../../assets/images/slashtt/freepik--speech-bubble-1--inject-2.svg')}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            contentFit="contain"
          />
          <Image 
            source={require('../../assets/images/slashtt/freepik--speech-bubble-2--inject-2.svg')}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            contentFit="contain"
          />
          <Image 
            source={require('../../assets/images/slashtt/freepik--Bags--inject-2.svg')}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            contentFit="contain"
          />
        </View>

        {/* Text Content */}
        <View style={{ marginTop: 27, alignItems: 'center', paddingHorizontal: 17 }}>
          <Text 
            style={{ 
              color: 'black', 
              fontSize: 24, 
              fontWeight: '800', 
              textAlign: 'center',
              marginBottom: 15,
              fontFamily: 'Montserrat_800ExtraBold'
            }}
          >
            Thanh toán
          </Text>

          <Text 
            style={{ 
              color: '#A8A8A9', 
              fontSize: 14, 
              fontWeight: '600', 
              textAlign: 'center', 
              lineHeight: 24,
              letterSpacing: 0.28,
              width: 320,
              fontFamily: 'Montserrat_600SemiBold'
            }}
          >
            Thanh toán nhanh chóng và an toàn với nhiều phương thức: thẻ ngân hàng, hoặc thanh toán khi nhận hàng.
          </Text>

          <TouchableOpacity 
            onPress={handleGoToCart}
            style={{ 
              marginTop: 20, 
              paddingVertical: 12, 
              paddingHorizontal: 24, 
              backgroundColor: '#FF4747', 
              borderRadius: 8,
              elevation: 2,
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '700', fontFamily: 'Montserrat_700Bold' }}>Đi đến Giỏ hàng</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer with Pagination and Navigation [763px top in figma] */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 21, 
        paddingBottom: 40 
      }}>
        {/* Prev Button */}
        <TouchableOpacity onPress={() => router.back()}>
          <Text 
            style={{ 
              color: '#C4C4C4', 
              fontSize: 18, 
              fontWeight: '600',
              fontFamily: 'Montserrat_600SemiBold'
            }}
          >
            Prev
          </Text>
        </TouchableOpacity>
        
        {/* Pagination Dots */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 10, height: 10, backgroundColor: 'rgba(23, 34, 59, 0.20)', borderRadius: 100 }} />
          <View style={{ width: 40, height: 8, backgroundColor: '#17223B', borderRadius: 100 }} />
          <View style={{ width: 10, height: 10, backgroundColor: 'rgba(23, 34, 59, 0.20)', borderRadius: 100 }} />
        </View>

        {/* Next Button */}
        <TouchableOpacity onPress={handleNext}>
          <Text 
            style={{ 
              color: '#F83758', 
              fontSize: 18, 
              fontWeight: '600',
              fontFamily: 'Montserrat_600SemiBold'
            }}
          >
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SplashPayScreen;
