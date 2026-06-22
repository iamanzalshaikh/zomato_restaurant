import { useNavigate } from 'react-router-dom';
import { Bell, Loader2 } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { NotificationsList } from '@/components/notifications/NotificationsList';
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from '@/hooks/useNotificationsQuery';
import { useUnreadNotificationCount } from '@/hooks/useUnreadNotificationCount';
import { Button } from '@/components/ui/button';
import { registerForPushNotifications } from '@/lib/pushNotifications';
import { toast } from 'sonner';

export function NotificationsPage() {
  const navigate = useNavigate();
  const listQ = useNotificationsQuery();
  const unread = useUnreadNotificationCount();
  const markOne = useMarkNotificationReadMutation();
  const markAll = useMarkAllNotificationsReadMutation();
  const items = listQ.data ?? [];

  async function enableAlerts() {
    const ok = await registerForPushNotifications();
    toast[ok ? 'success' : 'error'](
      ok ? 'Push-style alerts enabled' : 'Could not enable notifications',
    );
  }

  return (
    <PageShell
      eyebrow="Alerts"
      title="Notifications"
      subtitle="Order updates, payouts, and system messages — same feed as customer & rider apps."
      action={
        <div className="flex flex-wrap gap-2">
          {unread > 0 ? (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-bold"
              disabled={markAll.isPending}
              onClick={() => markAll.mutate()}
            >
              Mark all read
            </Button>
          ) : null}
          <Button size="sm" className="rounded-xl text-xs font-bold" onClick={() => void enableAlerts()}>
            Enable push alerts
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {unread > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3">
            <Bell className="size-4 text-brand" />
            <p className="text-sm font-semibold text-ink">
              {unread} unread notification{unread === 1 ? '' : 's'}
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
          {listQ.isFetching && !listQ.isLoading ? (
            <div className="mb-3 flex items-center gap-2 text-xs text-muted">
              <Loader2 className="size-3 animate-spin" /> Refreshing…
            </div>
          ) : null}
          <NotificationsList
            items={items}
            loading={listQ.isLoading}
            navigate={navigate}
            onItemClick={(item) => {
              if (!item.isRead) markOne.mutate(item._id);
            }}
          />
        </div>
      </div>
    </PageShell>
  );
}
