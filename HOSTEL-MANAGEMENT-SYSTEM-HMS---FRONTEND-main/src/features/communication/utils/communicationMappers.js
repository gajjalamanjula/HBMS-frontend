import { unwrapList, unwrapMessage, unwrapObject } from '../../../lib/api/normalizeResponse';

const toText = (value) => (value === null || value === undefined ? '' : String(value).trim());

export function toBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'y'].includes(normalized)) return true;
    if (['false', '0', 'no', 'n'].includes(normalized)) return false;
  }
  if (typeof value === 'number') return value === 1;
  return fallback;
}

export function normalizeAnnouncement(raw = {}) {
  const source = unwrapObject(raw);
  return {
    id: toText(source.id ?? source.announcementId ?? source.uuid),
    title: toText(source.title) || 'Announcement',
    message: toText(source.message),
    branchId: toText(source.branchId ?? source.branch?.id),
    createdAt: toText(source.createdAt),
    raw: source,
  };
}

export function normalizeAnnouncements(raw) {
  return unwrapList(raw).map(normalizeAnnouncement).filter((item) => item.id || item.title || item.message);
}

export function normalizeNotification(raw = {}) {
  const source = unwrapObject(raw);
  return {
    id: source.id ?? source.notificationId ?? '',
    title: toText(source.title) || 'Notification',
    message: toText(source.message),
    type: toText(source.type),
    relatedEntityType: toText(source.relatedEntityType),
    relatedEntityId: toText(source.relatedEntityId),
    actionUrl: toText(source.actionUrl),
    isRead: toBoolean(source.read ?? source.isRead, false),
    createdAt: toText(source.createdAt),
    raw: source,
  };
}

export function normalizeNotifications(raw) {
  return unwrapList(raw).map(normalizeNotification).filter((item) => item.id || item.title || item.message);
}

export function normalizeCommunicationMessage(raw, fallback = 'Success') {
  return unwrapMessage(raw, fallback);
}
