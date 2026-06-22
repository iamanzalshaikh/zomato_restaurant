import { Bell, ChevronRight, ClipboardList, Loader2 } from 'lucide-react';
import { formatTimeAgo, openNotificationTarget } from '@/lib/notificationNavigation';
import type { PortalNotification } from '@/services/notifications';
import type { NavigateFunction } from 'react-router-dom';

type Props = {
  items: PortalNotification[];
  loading?: boolean;
  emptyMessage?: string;
  onItemClick?: (item: PortalNotification) => void;
  navigate?: NavigateFunction;
  onOrderSelect?: (orderId: string) => void;
  compact?: boolean;
};

export function NotificationsList({
  items,
  loading,
  emptyMessage = 'No notifications yet',
  onItemClick,
  navigate,
  onOrderSelect,
  compact = false,
}: Props) {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="size-6 animate-spin text-brand" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <Bell className="size-10 text-muted/40" />
        <p className="text-sm font-semibold text-muted">{emptyMessage}</p>
        <p className="text-xs text-muted">New orders and updates will appear here</p>
      </div>
    );
  }

  return (
    <ul className={compact ? 'divide-y divide-black/5' : 'space-y-2'}>
      {items.map((item) => {
        const isOrder = item.notificationType === 'ORDER' || item.redirectType === 'ORDER';
        const clickable = Boolean(
          (item.redirectType === 'ORDER' || isOrder) && item.redirectId,
        );

        return (
          <li key={item._id}>
            <button
              type="button"
              onClick={() => {
                onItemClick?.(item);
                if (navigate) openNotificationTarget(item, navigate, onOrderSelect);
              }}
              className={[
                'flex w-full items-start gap-3 text-left transition',
                compact ? 'px-1 py-3 hover:bg-black/[0.02]' : 'rounded-xl border border-black/5 p-3 hover:border-brand/20 hover:bg-brand/[0.02]',
                !item.isRead ? 'bg-brand/[0.04]' : 'bg-white',
              ].join(' ')}
            >
              <div
                className={[
                  'flex size-9 shrink-0 items-center justify-center rounded-xl',
                  isOrder ? 'bg-brand/10 text-brand' : 'bg-black/[0.04] text-muted',
                ].join(' ')}
              >
                {isOrder ? (
                  <ClipboardList className="size-4" />
                ) : (
                  <Bell className="size-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={[
                    'text-sm text-ink',
                    !item.isRead ? 'font-extrabold' : 'font-semibold',
                  ].join(' ')}
                >
                  {item.title || 'Notification'}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted">
                  {item.message}
                </p>
                <p className="mt-1 text-[10px] font-medium text-muted">
                  {item.sentAt ? formatTimeAgo(item.sentAt) : ''}
                </p>
              </div>
              {!item.isRead ? (
                <span className="mt-2 size-2 shrink-0 rounded-full bg-brand" />
              ) : null}
              {clickable ? (
                <ChevronRight className="mt-1 size-4 shrink-0 text-muted" />
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
