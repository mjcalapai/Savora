import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Savora',
  slug: 'savora',
  version: '0.1.0',
  scheme: 'savora',
  orientation: 'default',
  userInterfaceStyle: 'light',
  ios: {
    // Provisional namespace: confirm ownership before signing/distribution.
    bundleIdentifier: 'com.savora.app',
    supportsTablet: true,
    buildNumber: '1',
  },
  android: { package: 'com.savora.app', versionCode: 1 },
  plugins: ['expo-router', 'expo-dev-client'],
  experiments: { typedRoutes: true },
};

export default config;
