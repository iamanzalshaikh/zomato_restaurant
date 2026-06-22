import { useNavigate, Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useUnreadNotificationCount } from '@/hooks/useUnreadNotificationCount';
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from '@/hooks/useNotificationsQuery';
import { NotificationsList } from '@/components/notifications/NotificationsList';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

type Props = {
  enabled?: boolean;
  onOrderSelect?: (orderId: string) => void;
};

export function NotificationBell({ enabled = true, onOrderSelect }: Props) {
  const navigate = useNavigate();
  const unread = useUnreadNotificationCount(enabled);
  const listQ = useNotificationsQuery(enabled);
  const markOne = useMarkNotificationReadMutation();
  const markAll = useMarkAllNotificationsReadMutation();
  const items = listQ.data ?? [];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="relative flex size-9 shrink-0 items-center justify-center rounded-xl border border-black/5 bg-white text-ink shadow-sm transition hover:border-brand/30 hover:bg-brand/5"
          aria-label="Notifications"
        >
          <Bell className="size-[18px]" strokeWidth={2.25} />
          {unread > 0 ? (
            <span className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-brand px-1 py-0.5 text-[9px] font-black text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          ) : null}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="border-b border-black/5 pb-3">
          <div className="flex items-center justify-between gap-2 pr-6">
            <SheetTitle className="text-base font-extrabold">Notifications</SheetTitle>
            {unread > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs font-bold text-brand"
                disabled={markAll.isPending}
                onClick={() => markAll.mutate()}
              >
                Mark all read
              </Button>
            ) : null}
          </div>
          {unread > 0 ? (
            <p className="text-left text-xs text-muted">{unread} unread</p>
          ) : null}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-3">
          <NotificationsList
            items={items.slice(0, 20)}
            loading={listQ.isLoading}
            compact
            navigate={navigate}
            onOrderSelect={onOrderSelect}
            onItemClick={(item) => {
              if (!item.isRead) markOne.mutate(item._id);
            }}
          />
        </div>

        <div className="border-t border-black/5 pt-3">
          <Button asChild variant="outline" className="w-full rounded-xl font-bold">
            <Link to="/notifications">View all notifications</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
