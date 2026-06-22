import { useQuery } from '@tanstack/react-query';
import { fetchNotifications } from '@/services/notifications';

export function useUnreadNotificationCount(enabled = true) {
  const q = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const items = await fetchNotifications(1, 50);
      return items.filter((n) => !n.isRead).length;
    },
    enabled,
    refetchInterval: 25_000,
    staleTime: 10_000,
  });

  return q.data ?? 0;
}
