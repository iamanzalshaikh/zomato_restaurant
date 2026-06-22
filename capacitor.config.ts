// import type { CapacitorConfig } from '@capacitor/cli';

// const config: CapacitorConfig = {
//   appId: 'com.qbite.restaurant',
//   appName: 'QBITE Restaurant Portal',
//   webDir: 'dist',
//   server: {
//     /** Avoid https://localhost → http://10.0.2.2 mixed-content blocks on Android */
//     androidScheme: 'http',
//     cleartext: true,
//   },
//   android: {
//     allowMixedContent: true,
//   },
// };

// export default config;



import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.qbite.restaurant',
  appName: 'QBITE Restaurant Portal',
  webDir: 'dist',
  server: {
    url: 'http://10.0.2.2:5174',
    cleartext: true,
    androidScheme: 'http',
  },
};

export default config;