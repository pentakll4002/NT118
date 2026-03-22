import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { 
  useFonts, 
  Montserrat_400Regular, 
  Montserrat_500Medium, 
  Montserrat_600SemiBold, 
  Montserrat_700Bold, 
  Montserrat_800ExtraBold 
} from '@expo-google-fonts/montserrat';
import { 
  Poppins_400Regular, 
  Poppins_500Medium, 
  Poppins_700Bold 
} from '@expo-google-fonts/poppins';
import { 
  LibreCaslonText_400Regular, 
  LibreCaslonText_700Bold 
} from '@expo-google-fonts/libre-caslon-text';

import { useColorScheme } from '@/hooks/use-color-scheme';

import "../global.css";

// Hide native splash screen immediately
SplashScreen.hideAsync().catch(() => {});

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);
  const [loaded, error] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
    LibreCaslonText_400Regular,
    LibreCaslonText_700Bold,
  });

  useEffect(() => {
    // Wait for fonts or timeout after 3 seconds
    const timeout = setTimeout(() => {
      console.log('Font loading timeout, proceeding anyway');
      setAppIsReady(true);
    }, 3000);

    if (loaded || error) {
      clearTimeout(timeout);
      console.log('Fonts loaded, app ready');
      setAppIsReady(true);
    }

    return () => clearTimeout(timeout);
  }, [loaded, error]);

  if (!appIsReady) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ gestureEnabled: false }} />
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
