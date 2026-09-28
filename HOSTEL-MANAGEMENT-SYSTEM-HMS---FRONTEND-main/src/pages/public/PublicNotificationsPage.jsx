import { Bell, CheckCheck, CreditCard, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuthSession, useCurrentUser } from '../../features/auth/hooks/useAuth';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from '../../features/communication/hooks/useCommunication';
import { getLastPublicBooking } from '../../features/public/utils/publicBookingSession';
import { ROLES, normalizeRole } from '../../utils/constants/roles';

function isBookingApprovedNotification(notification = {}) {
  const content = `${notification.title || ''} ${notification.message || ''}`.toLowerCase();
  const type = String(notification.type || '').toUpperCase();
  return type === 'BOOKING_APPROVED' || (content.includes('booking') && content.includes('approved'));
}

export default function PublicNotificationsPage() {
  const session = useAuthSession();
  const currentUserQuery = useCurrentUser({ enabled: session.hasSession });
  const currentUser = currentUserQuery.data || session.user;
  const userId = currentUser?.id || currentUser?.userId || '';
  const role = normalizeRole(currentUser?.role);
  const isPublicUser = session.hasSession && role === ROLES.PUBLIC_USER;
  const notificationsQuery = useNotifications(userId, { enabled: isPublicUser });
  const unreadCountQuery = useUnreadNotificationCount(userId, { enabled: isPublicUser });
  const markRead = useMarkNotificationRead(userId);
  const markAllRead = useMarkAllNotificationsRead(userId);
  const notifications = notificationsQuery.data || [];
  const savedBooking = getLastPublicBooking();
  const isCheckingUser = session.hasSession && currentUserQuery.isLoading && !currentUser;

  if (!session.hasSession) {
    return (
      <section className="bg-slate-50 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Bell className="h-6 w-6" />
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
              Notifications
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Please register or login to view your notifications.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                to="/login"
                state={{ returnTo: '/notifications', message: 'Please login to view notifications.' }}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Login
              </Link>
              <Link
                to="/register"
                state={{ returnTo: '/notifications', message: 'Create a public account to view notifications.' }}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Bell className="h-6 w-6" />
              </div>
              <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
                Notifications
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Booking approval updates for your hostel requests.
              </p>
            </div>
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              disabled={!notifications.length || markAllRead.isPending || !isPublicUser}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {markAllRead.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4" />
              )}
              Mark all read
            </button>
          </div>

          {isCheckingUser ? (
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking session...
            </div>
          ) : null}

          {!isCheckingUser && role && role !== ROLES.PUBLIC_USER ? (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
              Please login with a public user account to view public booking notifications.
            </div>
          ) : null}

          {isPublicUser ? (
            <>
              <div className="mt-6 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Unread: {unreadCountQuery.data ?? 0}
              </div>

              {notificationsQuery.isLoading ? (
                <div className="mt-6 space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-24 animate-pulse rounded-xl bg-slate-100" />
                  ))}
                </div>
              ) : notificationsQuery.isError ? (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {notificationsQuery.error?.message || 'Notifications could not be loaded.'}
                </div>
              ) : notifications.length ? (
                <div className="mt-6 space-y-3">
                  {notifications.map((item) => {
                    const approved = isBookingApprovedNotification(item);
                    const bookingId = item.relatedEntityId || savedBooking?.bookingId || '';
                    const paymentPath = bookingId
                      ? `/payments/${encodeURIComponent(bookingId)}/pay`
                      : '';

                    return (
                      <article
                        key={item.id || `${item.title}-${item.createdAt}`}
                        className={`rounded-xl border p-4 ${
                          item.isRead ? 'border-slate-200 bg-slate-50' : 'border-blue-100 bg-blue-50'
                        }`}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h2 className="text-sm font-semibold text-slate-950">{item.title}</h2>
                            <p className="mt-1 text-sm leading-6 text-slate-600">{item.message}</p>
                            {item.createdAt ? (
                              <p className="mt-2 text-xs text-slate-400">
                                {new Date(item.createdAt).toLocaleString()}
                              </p>
                            ) : null}
                            {item.type || item.relatedEntityType || item.relatedEntityId ? (
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
                                {item.relatedEntityId ? (
                                  <span className="break-all rounded-full bg-white px-2 py-1">
                                    {item.relatedEntityId}
                                  </span>
                                ) : null}
                              </div>
                            ) : null}
                          </div>

                          {!item.isRead && item.id ? (
                            <button
                              type="button"
                              onClick={() => markRead.mutate(item.id)}
                              disabled={markRead.isPending}
                              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-blue-100 bg-white px-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <CheckCheck className="h-4 w-4" />
                              Mark read
                            </button>
                          ) : null}
                        </div>

                        {approved ? (
                          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900">
                            {paymentPath ? (
                              <Link
                                to={paymentPath}
                                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-green-700 px-4 text-sm font-semibold text-white transition hover:bg-green-800"
                              >
                                <CreditCard className="h-4 w-4" />
                                Continue to payment
                              </Link>
                            ) : (
                              <p>
                                Booking approved. Use your booking confirmation ID to continue payment.
                              </p>
                            )}
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No notifications yet.
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
