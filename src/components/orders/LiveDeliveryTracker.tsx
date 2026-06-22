import { useQuery } from '@tanstack/react-query';
import { Bike, Loader2, MapPin } from 'lucide-react';
import { trackOrder } from '@/services/orders';
import { OrderTrackingMap } from '@/components/map/OrderTrackingMap';
import { useOrderTrackSocket } from '@/hooks/useOrderTrackSocket';
import { useRestaurantStore } from '@/stores/restaurantStore';
import { useCompactLayout } from '@/hooks/use-mobile';
import { formatCoordDisplay, isValidCoord } from '@/lib/googleMaps';
import type { Order } from '@/types/api';

const LIVE_STATUSES = new Set(['RIDER_ASSIGNED', 'PICKED_UP', 'ON_THE_WAY', 'READY_FOR_PICKUP']);

type Props = {
  order: Order;
  onOpenDetails?: () => void;
};

export function LiveDeliveryTracker({ order, onOpenDetails }: Props) {
  const compact = useCompactLayout();
  const restaurant = useRestaurantStore((s) => s.restaurant);
  const isLive = LIVE_STATUSES.has(order.orderStatus);

  const trackQ = useQuery({
    queryKey: ['order-track', order._id],
    queryFn: () => trackOrder(order._id),
    enabled: isLive,
    refetchInterval: isLive ? 12_000 : false,
  });

  useOrderTrackSocket(order._id, isLive);

  const track = trackQ.data;
  const rawLoc = track?.liveLocation ?? track?.riderLocation;
  const loc = isValidCoord(rawLoc) ? rawLoc : null;
  const restaurantCoord =
    track?.restaurantLocation ??
    (restaurant?.latitude != null && restaurant?.longitude != null
      ? { latitude: restaurant.latitude, longitude: restaurant.longitude }
      : null);

  if (!isLive) return null;

  const riderName =
    typeof order.riderId === 'object' && order.riderId
      ? order.riderId.fullName ?? 'Rider'
      : 'Awaiting rider';

  return (
    <article className="overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-black/5 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">
            Live delivery
          </p>
          <p className="truncate text-sm font-bold text-ink">
            #{order.orderNumber ?? order._id.slice(-6).toUpperCase()} · {riderName}
          </p>
        </div>
        {(track as { socketLive?: boolean })?.socketLive ? (
          <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
            ● Live
          </span>
        ) : (
          <span className="shrink-0 text-[10px] font-medium text-muted">Updating…</span>
        )}
      </div>

      {trackQ.isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-brand" />
        </div>
      ) : (
        <OrderTrackingMap
          restaurant={restaurantCoord}
          customer={track?.deliveryLocation ?? null}
          rider={loc ?? null}
          height={compact ? 220 : 260}
          className="rounded-none border-0"
        />
      )}

      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <p className="flex items-center gap-1 text-[10px] text-muted">
          <MapPin className="size-3" />
          {formatCoordDisplay(loc, 4) ?? 'Waiting for rider GPS…'}
        </p>
        {onOpenDetails && (
          <button
            type="button"
            onClick={onOpenDetails}
            className="flex items-center gap-1 text-[10px] font-bold text-brand hover:underline"
          >
            <Bike className="size-3" />
            Details
          </button>
        )}
      </div>
    </article>
  );
}
