import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { GOOGLE_MAPS_API_KEY } from '@/config/env';
import {
  loadGoogleMaps,
  pinSymbol,
  riderArrowSymbol,
  isValidCoord,
  type GoogleMapsRuntime,
  type MapCoord,
} from '@/lib/googleMaps';

type Props = {
  restaurant?: MapCoord | null;
  customer?: MapCoord | null;
  rider?: MapCoord | null;
  routePath?: Array<{ latitude: number; longitude: number }>;
  height?: number;
  className?: string;
};

export function OrderTrackingMap({
  restaurant,
  customer,
  rider,
  routePath,
  height = 220,
  className = '',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const [gmaps, setGmaps] = useState<GoogleMapsRuntime | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const libs = await loadGoogleMaps(GOOGLE_MAPS_API_KEY);
        if (!cancelled) setGmaps(libs);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Map failed to load');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!gmaps || !containerRef.current) return;

    const { Map, Marker, Polyline, LatLngBounds } = gmaps;
    const points = [restaurant, rider, customer].filter(isValidCoord) as MapCoord[];
    const center = points[0] ?? { latitude: 19.076, longitude: 72.8777 };

    if (!mapRef.current) {
      mapRef.current = new Map(containerRef.current, {
        center: { lat: center.latitude, lng: center.longitude },
        zoom: 14,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'greedy',
        styles: [
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        ],
      });
    }

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    polylineRef.current?.setMap(null);

    const map = mapRef.current;
    const bounds = new LatLngBounds();

    if (isValidCoord(restaurant)) {
      const r = restaurant!;
      const m = new Marker({
        map,
        position: { lat: r.latitude, lng: r.longitude },
        title: 'Pickup',
        icon: pinSymbol(gmaps, '#ff5a00'),
        zIndex: 2,
      });
      markersRef.current.push(m);
      bounds.extend(m.getPosition()!);
    }

    if (isValidCoord(customer)) {
      const c = customer!;
      const m = new Marker({
        map,
        position: { lat: c.latitude, lng: c.longitude },
        title: 'Drop',
        icon: pinSymbol(gmaps, '#1a1c1c'),
        zIndex: 2,
      });
      markersRef.current.push(m);
      bounds.extend(m.getPosition()!);
    }

    if (isValidCoord(rider)) {
      const rd = rider!;
      const m = new Marker({
        map,
        position: { lat: rd.latitude, lng: rd.longitude },
        title: 'Rider',
        icon: riderArrowSymbol(gmaps, rd.heading ?? 0),
        zIndex: 5,
      });
      markersRef.current.push(m);
      bounds.extend(m.getPosition()!);
    }

    const route =
      routePath && routePath.length >= 2
        ? routePath
        : ([restaurant, rider, customer].filter(isValidCoord) as MapCoord[]);
    if (route.length >= 2) {
      polylineRef.current = new Polyline({
        map,
        path: route.map((p) => ({ lat: p.latitude, lng: p.longitude })),
        strokeColor: '#4a148c',
        strokeWeight: 5,
        geodesic: true,
      });
    }

    if (points.length >= 2) {
      map.fitBounds(bounds, 48);
    } else if (points.length === 1) {
      map.setCenter({ lat: points[0]!.latitude, lng: points[0]!.longitude });
      map.setZoom(15);
    }
  }, [gmaps, restaurant, customer, rider, routePath]);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-black/5 bg-slate-50 text-xs text-muted ${className}`}
        style={{ height }}
      >
        Add VITE_GOOGLE_MAPS_API_KEY to enable Google Maps
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 ${className}`}
        style={{ height }}
      >
        <p className="font-semibold text-center">Google Maps could not load</p>
        <p className="text-center leading-relaxed">{error}</p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl border border-black/5 ${className}`} style={{ height }}>
      {!gmaps && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50">
          <Loader2 className="size-5 animate-spin text-brand" />
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
