import { Capacitor } from '@capacitor/core';

const API_PORT = '5000';
const HOST_CACHE_KEY = 'qbite_native_api_host';

const PRODUCTION_API_URL = 'https://zomato-backend-pt66.onrender.com/api/v1';
const PRODUCTION_SOCKET_URL = 'https://zomato-backend-pt66.onrender.com';

/** Your PC LAN IP — emulator + real phone on same Wi‑Fi */
const LAN_HOST = import.meta.env.VITE_LAN_HOST ?? '192.168.1.100';

function isNativeApp(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export function getCachedNativeHost(): string | null {
  try {
    return sessionStorage.getItem(HOST_CACHE_KEY);
  } catch {
    return null;
  }
}

export function setCachedNativeHost(host: string) {
  try {
    sessionStorage.setItem(HOST_CACHE_KEY, host);
  } catch {
    /* ignore */
  }
}

/** Hosts to try on Android — 127.0.0.1 first when adb reverse is active */
export function getNativeHostCandidates(): string[] {
  const candidates: string[] = [];

  const explicit = import.meta.env.VITE_NATIVE_API_HOST?.trim();
  if (explicit) candidates.push(explicit);

  const lan = import.meta.env.VITE_LAN_HOST?.trim() ?? LAN_HOST;
  const emulatorAlias = import.meta.env.VITE_ANDROID_API_HOST?.trim() ?? '10.0.2.2';

  candidates.push(lan);

  if (Capacitor.getPlatform() === 'android') {
    candidates.push('127.0.0.1');
  }

  candidates.push(emulatorAlias);

  const cached = getCachedNativeHost();
  if (cached) candidates.unshift(cached);

  return [...new Set(candidates.filter(Boolean))];
}

function getNativeHost(): string {
  return (
    getCachedNativeHost() ??
    import.meta.env.VITE_LAN_HOST?.trim() ??
    LAN_HOST
  );
}

/** Try each host until /health responds — call on login page mount */
export async function discoverWorkingNativeHost(): Promise<string | null> {
  if (!isNativeApp()) return null;

  for (const host of getNativeHostCandidates()) {
    const url = `http://${host}:${API_PORT}/api/v1/health`;
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) {
        setCachedNativeHost(host);
        return host;
      }
    } catch {
      /* try next host */
    }
  }
  return null;
}

function useProductionBackendOnNative(): boolean {
  return import.meta.env.VITE_USE_PRODUCTION_BACKEND === 'true';
}

function isRemoteApiUrl(url: string | undefined): boolean {
  return Boolean(url?.startsWith('https://'));
}

export function getApiUrl(): string {
  const configured = import.meta.env.VITE_API_URL?.trim();

  if (isNativeApp()) {
    if (useProductionBackendOnNative() && isRemoteApiUrl(configured)) {
      return configured || PRODUCTION_API_URL;
    }
    const host = getCachedNativeHost() ?? getNativeHost();
    return `http://${host}:${API_PORT}/api/v1`;
  }

  if (import.meta.env.PROD) {
    return configured || PRODUCTION_API_URL;
  }

  if (import.meta.env.VITE_NATIVE_API_HOST) {
    return `http://${import.meta.env.VITE_NATIVE_API_HOST}:${API_PORT}/api/v1`;
  }

  return configured || `http://localhost:${API_PORT}/api/v1`;
}

export function getSocketUrl(): string {
  const configured = import.meta.env.VITE_SOCKET_URL?.trim();

  if (isNativeApp()) {
    if (useProductionBackendOnNative() && isRemoteApiUrl(configured)) {
      return configured || PRODUCTION_SOCKET_URL;
    }
    const host = getCachedNativeHost() ?? getNativeHost();
    return `http://${host}:${API_PORT}`;
  }

  if (import.meta.env.PROD) {
    return configured || PRODUCTION_SOCKET_URL;
  }

  if (import.meta.env.VITE_NATIVE_API_HOST) {
    return `http://${import.meta.env.VITE_NATIVE_API_HOST}:${API_PORT}`;
  }

  return configured || `http://localhost:${API_PORT}`;
}

export const DEFAULT_RESTAURANT_ID = import.meta.env.VITE_DEFAULT_RESTAURANT_ID ?? '';
export const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ??
  import.meta.env.VITE_GOOGLE_GEOCODING_API_KEY ??
  'AIzaSyCxoK3LptaTG8r4VJBPf9LH_bdCBbTenJI';

export function getEnvInfo() {
  return {
    isNative: isNativeApp(),
    platform: Capacitor.getPlatform?.() ?? 'web',
    apiUrl: getApiUrl(),
    socketUrl: getSocketUrl(),
    hostCandidates: isNativeApp() ? getNativeHostCandidates() : [],
    cachedHost: getCachedNativeHost(),
  };
}
