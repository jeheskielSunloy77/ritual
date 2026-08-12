import { DefaultTheme, ThemeProvider } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useFonts, Handlee_400Regular } from '@expo-google-fonts/handlee';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { HabitsProvider } from '@/context/HabitsContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function TabLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Handlee-Regular': Handlee_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fef8f3', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#944a19" />
      </View>
    );
  }

  return (
    <HabitsProvider>
      <ThemeProvider value={DefaultTheme}>
        <AnimatedSplashOverlay />
        <AppTabs />
      </ThemeProvider>
    </HabitsProvider>
  );
}
