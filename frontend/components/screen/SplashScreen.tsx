import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SplashScreen = () => {
  const router = useRouter();

  useEffect(() => {
    console.log('SplashScreen mounted, setting timer...');
    const timer = setTimeout(() => {
      console.log('Timer finished, attempting to replace with /onboarding');
      try {
        router.replace('/onboarding');
        console.log('Navigation call executed');
      } catch (e) {
        console.error('Navigation error:', e);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Main Logo Content */}
      <View style={styles.logoWrapper}>
        <View style={styles.sLogoContainer}>
          {/* Top Half Circle - Blue Gradient */}
          <LinearGradient
            colors={['#CFE2FC', '#4392F9']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.semiCircle, styles.topSemiCircle]}
          />
          {/* Bottom Half Circle - Red Gradient */}
          <LinearGradient
            colors={['#F8BCC6', '#F83758']}
            start={{ x: 1, y: 0.5 }}
            end={{ x: 0, y: 0.5 }}
            style={[styles.semiCircle, styles.bottomSemiCircle]}
          />
          {/* Inner White S-Shape mask effect */}
          <View style={styles.innerMask} />
        </View>

        {/* ShopeeLite Text */}
        <Text style={styles.title}>ShopeeLite</Text>
      </View>

      {/* Bottom Bar */}
      <View style={styles.bottomBar} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sLogoContainer: {
    width: 140,
    height: 140,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  semiCircle: {
    width: 120,
    height: 60,
    position: 'absolute',
  },
  topSemiCircle: {
    top: 10,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    zIndex: 2,
  },
  bottomSemiCircle: {
    bottom: 10,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    zIndex: 1,
  },
  innerMask: {
    width: 60,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    zIndex: 3,
  },
  title: {
    marginTop: 20,
    color: '#F83758',
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 20,
    width: 134,
    height: 5,
    backgroundColor: '#A8A8A9',
    borderRadius: 30,
  },
});

export default SplashScreen;
