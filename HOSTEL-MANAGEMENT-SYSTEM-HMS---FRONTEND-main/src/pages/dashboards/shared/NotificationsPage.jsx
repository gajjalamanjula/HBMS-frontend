import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../../../features/auth/hooks/useAuth';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../../../features/communication/hooks/useCommunication';
import { normalizeRole, ROLES } from '../../../utils/constants/roles';

function isBookingNotification(notification = {}) {
  const content = `${notification.title || ''} ${notification.message || ''}`.toLowerCase();
  const relatedType = String(notification.relatedEntityType || '').toUpperCase();
  const actionUrl = String(notification.actionUrl || '').toLowerCase();
  return relatedType === 'BOOKING' || actionUrl.includes('/manager/bookings') || content.includes('booking');
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const userId = currentUser.data?.id || currentUser.data?.userId || '';
  const role = normalizeRole(currentUser.data?.role);
  const notificationsQuery = useNotifications(userId);
  const markRead = useMarkNotificationRead(userId);
  const markAllRead = useMarkAllNotificationsRead(userId);
  const notifications = notificationsQuery.data || [];

  const handleOpen = (notification) => {
    const fallbackPath =
      role === ROLES.MANAGER && isBookingNotification(notification)
        ? '/manager/bookings'
        : '';
    const actionPath = notification.actionUrl || fallbackPath;

    if (actionPath) navigate(actionPath);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              Personal inbox
            </p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">Notifications</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              Recent notifications for your account.
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
            <Bell className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => markAllRead.mutate()}
          disabled={!userId || !notifications.length || markAllRead.isPending}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-sky-600 px-3 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCheck className="h-4 w-4" />
          Mark all read
        </button>
      </div>

      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
        {notificationsQuery.isLoading || currentUser.isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : notificationsQuery.isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Notifications are not available right now. Please try again.
          </div>
        ) : notifications.length ? (
          <div className="space-y-3">
            {notifications.map((item) => {
              const showBookingAction =
                (role === ROLES.MANAGER && isBookingNotification(item)) || item.actionUrl;
              const actionLabel =
                role === ROLES.MANAGER && isBookingNotification(item)
                  ? 'Review bookings'
                  : 'Open';

              return (
                <article
                  key={item.id || `${item.title}-${item.createdAt}`}
                  className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm ${
                    item.isRead ? 'border-slate-200 bg-slate-50' : 'border-sky-100 bg-sky-50'
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {!item.isRead ? <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-sky-600" aria-label="Unread" /> : null}
                        <h2 className={`text-sm font-black ${item.isRead ? 'text-slate-700' : 'text-slate-950'}`}>{item.title}</h2>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.message}</p>
                      {item.createdAt ? (
                        <p className="mt-2 text-xs text-slate-400">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      ) : null}
                      {item.type || item.relatedEntityType ? (
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
                          {item.type ? (
                            <span className="rounded-full bg-white px-2 py-1">
                              {item.type}
                            </span>
                          ) : null}
                          {item.relatedEntityType ? (
                            <span className="rounded-full bg-white px-2 py-1">
                              {item.relatedEntityType}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                      {showBookingAction ? (
                        <button
                          type="button"
                          onClick={() => handleOpen(item)}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white px-3 text-xs font-bold text-sky-700 transition hover:bg-sky-50"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {actionLabel}
                        </button>
                      ) : null}
                      {!item.isRead && item.id ? (
                        <button
                          type="button"
                          onClick={() => markRead.mutate(item.id)}
                          disabled={markRead.isPending}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white px-3 text-xs font-bold text-sky-700 transition hover:bg-sky-50 disabled:opacity-60"
                        >
                          <CheckCheck className="h-4 w-4" />
                          Mark read
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No notifications yet.
          </div>
        )}
      </section>
    </div>
  );
}
