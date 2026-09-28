const LAST_PUBLIC_BOOKING_KEY = 'hbms:last-public-booking';

function readStorage() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function toText(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function normalizeBookingSession(value = {}) {
  return {
    bookingId: toText(value.bookingId),
    status: toText(value.status).toUpperCase(),
    branchId: toText(value.branchId),
    roomId: toText(value.roomId),
    bedId: toText(value.bedId),
    createdAt: toText(value.createdAt),
  };
}

export function getLastPublicBooking() {
  const storage = readStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(LAST_PUBLIC_BOOKING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const booking = normalizeBookingSession(parsed);
    return booking.bookingId ? booking : null;
  } catch {
    return null;
  }
}

export function saveLastPublicBooking(value = {}) {
  const storage = readStorage();
  const booking = normalizeBookingSession(value);

  if (!storage || !booking.bookingId) return null;

  try {
    storage.setItem(LAST_PUBLIC_BOOKING_KEY, JSON.stringify(booking));
    return booking;
  } catch {
    return null;
  }
}

export function updateLastPublicBookingStatus(bookingId, status) {
  const lastBooking = getLastPublicBooking();

  if (!lastBooking || String(lastBooking.bookingId) !== String(bookingId || '')) {
    return null;
  }

  return saveLastPublicBooking({
    ...lastBooking,
    status,
  });
}

export function clearLastPublicBooking() {
  const storage = readStorage();
  if (!storage) return;

  try {
    storage.removeItem(LAST_PUBLIC_BOOKING_KEY);
  } catch {
    // ignore storage errors
  }
}
