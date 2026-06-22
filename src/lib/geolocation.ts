import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export type GeoPosition = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

/** Current GPS — Capacitor on native app, navigator.geolocation on web (same as MyApp / RiderApp). */
export async function getCurrentPosition(): Promise<GeoPosition> {
  if (Capacitor.isNativePlatform()) {
    const perm = await Geolocation.requestPermissions();
    if (perm.location === 'denied') {
      throw new Error('Location permission denied');
    }
    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    });
    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
    };
  }

  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported');
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => reject(new Error(err.message || 'Location permission denied')),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  });
}
