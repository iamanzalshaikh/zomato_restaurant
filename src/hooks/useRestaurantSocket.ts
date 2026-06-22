import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import {
  connectRestaurantSocket,
  disconnectRestaurantSocket,
  joinRestaurantRoom,
  leaveRestaurantRoom,
  SERVER_EVENTS,
} from '@/lib/socket';
import { alertOrderUpdate } from '@/lib/pushNotifications';
import type { NewOrderSocketPayload } from '@/types/api';

export function useRestaurantSocket(restaurantId: string | null | undefined) {
  const qc = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!restaurantId) return;

    const socket = connectRestaurantSocket();

    const onConnect = () => joinRestaurantRoom(restaurantId);
    const onNewOrder = (payload: NewOrderSocketPayload) => {
      qc.invalidateQueries({ queryKey: ['orders', restaurantId] });
      void qc.invalidateQueries({ queryKey: ['notifications', 'list'] });
      void qc.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      toast({
        title: 'New order received!',
        description: payload.orderNumber
          ? `Order #${payload.orderNumber} — check kitchen queue`
          : 'A customer just placed an order',
      });
      void alertOrderUpdate({
        title: 'QuickBite — New order',
        body: payload.orderNumber ? `#${payload.orderNumber}` : 'Open orders to manage',
        orderId: payload.orderId,
        type: 'new_order',
      });
    };
    const onOrderUpdated = () => {
      qc.invalidateQueries({ queryKey: ['orders', restaurantId] });
    };

    socket.on('connect', onConnect);
    socket.on(SERVER_EVENTS.NEW_ORDER, onNewOrder);
    socket.on(SERVER_EVENTS.ORDER_UPDATED, onOrderUpdated);
    socket.on(SERVER_EVENTS.ORDER_CANCELLED, onOrderUpdated);

    if (socket.connected) onConnect();

    void import('@/lib/pushNotifications').then(({ registerForPushNotifications }) =>
      registerForPushNotifications(),
    );

    return () => {
      socket.off('connect', onConnect);
      socket.off(SERVER_EVENTS.NEW_ORDER, onNewOrder);
      socket.off(SERVER_EVENTS.ORDER_UPDATED, onOrderUpdated);
      socket.off(SERVER_EVENTS.ORDER_CANCELLED, onOrderUpdated);
      leaveRestaurantRoom(restaurantId);
      disconnectRestaurantSocket();
    };
  }, [restaurantId, qc, toast]);
}
