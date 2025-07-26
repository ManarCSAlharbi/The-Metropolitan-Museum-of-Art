import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'The-Metropolitan-Museum-of-Art',
  webDir: 'www',
  android:{
    adjustMarginsForEdgeToEdge: "force",
  },
  
plugins: {
    SplashScreen: {
      launchShowDuration: 6000, // 6 seconds to match audio duration
      launchAutoHide: false, // Don't auto-hide, let our code control it
      launchFadeOutDuration: 1000, // Quick fade out
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false, // Disable spinner for cleaner look
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },
      PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },

  
};




export default config;
