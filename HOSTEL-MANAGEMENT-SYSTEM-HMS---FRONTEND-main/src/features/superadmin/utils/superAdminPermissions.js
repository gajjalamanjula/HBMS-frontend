import { EMPTY_VALUE, getDisplayName } from './superAdminMappers';

function normalizeIdentity(value) {
  return String(value || '').trim().toLowerCase();
}

export function isSameUserRecord(record = {}, currentUser = {}) {
  const recordId = normalizeIdentity(record.id || record.userId);
  const currentId = normalizeIdentity(currentUser.id || currentUser.userId);
  const recordEmail = normalizeIdentity(record.email);
  const currentEmail = normalizeIdentity(currentUser.email);

  if (recordId && currentId && recordId === currentId) return true;
  if (recordEmail && currentEmail && recordEmail === currentEmail) return true;
  return false;
}

export function isSuperAdminRecord(record = {}) {
  return normalizeIdentity(record.role) === 'super_admin';
}

export function isSystemProtectedRecord(record = {}) {
  return Boolean(record.systemAccount || record.protected || record.raw?.systemAccount || record.raw?.protected);
}

export function getStatusActionBlockReason(record = {}, currentUser = {}) {
  if (!record?.id) return 'This account cannot be updated right now.';

  if (isSameUserRecord(record, currentUser)) {
    return 'You cannot change your own account status from this screen.';
  }

  if (isSuperAdminRecord(record)) {
    return 'Super admin accounts are protected from this status action.';
  }

  if (isSystemProtectedRecord(record)) {
    return 'This protected account cannot be changed from this screen.';
  }

  return '';
}

export function buildStatusActionCopy(record = {}, entityLabel = 'user') {
  const displayName = getDisplayName(record) || record.email || EMPTY_VALUE;
  const nextActive = !record.active;
  const action = nextActive ? 'enable' : 'disable';
  const actionTitle = nextActive ? 'Enable account?' : 'Disable account?';
  const confirmLabel = nextActive ? 'Enable account' : 'Disable account';
  const impact = nextActive
    ? 'This account will be able to access the application again after the change is saved.'
    : 'This account will lose access immediately after the change is saved.';

  return {
    action,
    title: actionTitle,
    confirmLabel,
    tone: nextActive ? 'success' : 'danger',
    message: `Are you sure you want to ${action} this ${entityLabel}? ${impact}`,
    details: [
      ['Name', displayName],
      ['Email', record.email || EMPTY_VALUE],
      ['Role', record.role || entityLabel.toUpperCase()],
      ['Current status', record.active ? 'Active' : 'Inactive'],
    ],
  };
}
