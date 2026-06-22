# QBITE Restaurant Portal: Capacitor Development Guide

This guide explains how Capacitor handles **Development Builds & Live Reloads** (equivalent to Expo's `dev-client` flow in React Native).

---

## 🔄 How it Works: Expo vs. Capacitor

| Feature | Expo Dev Client (`MyApp/`) | Capacitor Dev Build (`resturant-portal/`) |
|---------|----------------------------|------------------------------------------|
| **Dev Server** | Metro Bundler (`localhost:8081`) | Vite Dev Server (`localhost:5174`) |
| **Native Wrapper** | Expo Go / Expo Dev Client | Android Webview wrapper (`android/`) |
| **Hot Reload (HMR)** | Yes (Metro fast reload) | Yes (Vite hot module replacement) |
| **Device Bridge** | Expo native modules | Capacitor plugins (`@capacitor/core`) |

---

## 🛠️ Step-by-Step: running a Live Reload Dev Build in Capacitor

To get instant hot-reloading in your mobile simulator/device while coding:

### Step 1: Find your Local IP Address
Get your computer's internal network IP address (e.g., `192.168.1.10` or `10.0.0.5`). 
- On Windows PowerShell, run: `ipconfig`
- Locate your active IPv4 address under your Wi-Fi or Ethernet adapter.

### Step 2: Configure `capacitor.config.ts`
Temporarily update your [capacitor.config.ts](file:///c:/Users/ANZAL/Desktop/Food%20dev/resturant-portal/capacitor.config.ts) to direct the Webview to load from your local IP address:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.qbite.restaurant',
  appName: 'QBITE Restaurant Portal',
  webDir: 'dist',
  server: {
    // 1. Point this to your local IP and Vite dev port (5174)
    url: 'http://192.168.1.10:5174', // Or http://10.0.2.2:5174 if using Android Emulator exclusively
    
    // 2. Allow cleartext HTTP connections for debugging
    cleartext: true
  }
};

export default config;
```

### Step 3: Run the Development Servers
1. Start your local Vite dev server:
   ```bash
   npm run dev
   ```
2. Sync the configuration changes to the native platform:
   ```bash
   npx cap sync
   ```
3. Run the application on your connected Android device/emulator:
   ```bash
   npx cap run android
   ```

*Now, any change you save in your React code (`src/**/*.tsx`) will **instantly update** on the phone screen without needing to rebuild the native APK!*

---

## 📦 Step-by-Step: Building for Production

When you are ready to compile a standalone, offline production APK:

1. **Remove or Comment Out** the `server` block in your `capacitor.config.ts` so the app loads web assets locally.
2. Compile and package the static Vite web build, then sync it to the Android assets:
   ```bash
   npm run build:cap
   ```
3. Generate the release APK using Android Studio or via CLI:
   ```bash
   cd android
   .\gradlew.bat assembleRelease
   ```
