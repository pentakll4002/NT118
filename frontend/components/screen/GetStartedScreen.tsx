import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const GetStartedScreen = () => {
  const router = useRouter();

  const handleGetStarted = () => {
    router.replace('/login' as const);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground 
        source={require('../../assets/images/getstarted/Frame 33679.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Overlay mờ để chữ dễ đọc hơn nếu cần, ở đây theo ảnh là gradient hoặc phủ nhẹ */}
        <View style={styles.overlay}>
          <SafeAreaView style={styles.content}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>
                Bạn muốn mua sắm tiện lợi{"\n"}Đây rồi!
              </Text>
              <Text style={styles.subtitle}>
                Tìm kiếm sản phẩm tại đây, Mua ngay!
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Bắt đầu Ngay!</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)', // Phủ một lớp tối nhẹ để nổi bật nội dung
    justifyContent: 'flex-end',
    paddingBottom: 50,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: 'white',
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 45,
    fontFamily: 'Montserrat_800ExtraBold', // Nếu đã load font này
  },
  subtitle: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 15,
    fontFamily: 'Montserrat_400Regular',
  },
  button: {
    backgroundColor: '#F83758',
    width: '100%',
    height: 55,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
});

export default GetStartedScreen;
