import type { NavigateFunction } from 'react-router-dom';
import type { PortalNotification } from '@/services/notifications';

export function openNotificationTarget(
  item: PortalNotification,
  navigate: NavigateFunction,
  onOrderSelect?: (orderId: string) => void,
) {
  const isOrder =
    item.notificationType === 'ORDER' ||
    item.redirectType === 'ORDER' ||
    Boolean(item.redirectId && item.title?.toLowerCase().includes('order'));

  const orderId = item.redirectId;

  if (isOrder && orderId) {
    if (onOrderSelect) {
      onOrderSelect(orderId);
      return;
    }
    navigate('/orders', { state: { openOrderId: orderId } });
    return;
  }

  navigate('/notifications');
}

export function formatTimeAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}
