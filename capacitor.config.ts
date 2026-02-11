import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ctremesas.app',
  appName: 'CT Remesas',
  webDir: 'dist',
  server: {
    androidScheme: 'http'
  }
};

export default config;
