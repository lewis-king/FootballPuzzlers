import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/montserrat';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { findLegacySave } from '../lib/findLegacySave';
import { startAds } from '../services/ads';
import { handleAlertTaps, refreshAlerts } from '../services/alerts';
import { restore } from '../services/purchases';
import { useProgress } from '../state/progress';
import { C } from '../ui/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fonts] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
  });
  const [hydrated, setHydrated] = useState(useProgress.persist.hasHydrated());

  useEffect(() => useProgress.persist.onFinishHydration(() => setHydrated(true)), []);

  // One-off import of the 2019 save, then a quiet purchase restore and the ads SDK.
  useEffect(() => {
    if (!hydrated) return;
    (async () => {
      const s = useProgress.getState();
      if (!s.legacyChecked) s.importLegacy(await findLegacySave());
      restore((sku) => useProgress.getState().setPurchased([sku])).catch(() => {});
      startAds().catch(() => {});
      if (useProgress.getState().alerts === 'on') refreshAlerts().catch(() => {});
    })();
  }, [hydrated]);

  const ready = fonts && hydrated;
  useEffect(() => {
    if (!ready) return;
    SplashScreen.hideAsync().catch(() => {});
    if (useProgress.getState().legacyImported) router.push('/welcome');
    return handleAlertTaps(() => router.dismissTo('/'));
  }, [ready]);

  if (!ready) return null;
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bgBase }, animation: 'slide_from_right' }}>
        <Stack.Screen name="correct" options={{ animation: 'fade' }} />
        <Stack.Screen name="welcome" options={{ animation: 'fade', gestureEnabled: false }} />
      </Stack>
    </>
  );
}
