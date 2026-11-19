import { Suspense } from 'react';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { ErrorState, LoadingState } from '@/components/ui/Feedback';
import { Screen } from '@/components/ui/Screen';
import { readPublicConfig } from '@/config/public-config';
import { theme } from '@/theme/tokens';

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <SafeAreaProvider>
      <Screen>
        <ErrorState onRetry={() => void retry()} />
      </Screen>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  const config = readPublicConfig();

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {!config.ok ? (
        <Screen>
          <AppText accessibilityRole="alert">
            Savora could not start. Check the public app configuration.
          </AppText>
        </Screen>
      ) : (
        <Suspense
          fallback={
            <Screen>
              <LoadingState />
            </Screen>
          }
        >
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.colors.background },
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
          </Stack>
        </Suspense>
      )}
    </SafeAreaProvider>
  );
}
