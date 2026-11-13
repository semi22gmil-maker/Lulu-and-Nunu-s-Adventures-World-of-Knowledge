/**
 * Capacitor Configuration for Android & Google Play Packaging
 * Web build output lives in `dist/`, packaged natively into Android WebView.
 */
export interface AppCapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  server: {
    androidScheme: string;
  };
  android: {
    allowMixedContent: boolean;
    backgroundColor: string;
    webContentsDebuggingEnabled: boolean;
  };
  plugins: {
    SplashScreen: {
      launchShowDuration: number;
      backgroundColor: string;
      showSpinner: boolean;
      androidScaleType: string;
    };
  };
}

const config: AppCapacitorConfig = {
  appId: 'com.lulunono.adventure',
  appName: 'مغامرات لولو ونونو',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#f8fafc',
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0f766e',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
    },
  },
};

export default config;
