export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  OWNER: 'OWNER',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
  TENANT: 'TENANT',
  PUBLIC_USER: 'PUBLIC_USER',
};

export const ROLE_HOME_MAP = {
  [ROLES.SUPER_ADMIN]: '/superadmin/dashboard',
  [ROLES.OWNER]: '/owner/dashboard',
  [ROLES.MANAGER]: '/manager/dashboard',
  [ROLES.STAFF]: '/staff/dashboard',
  [ROLES.TENANT]: '/tenant/dashboard',
  [ROLES.PUBLIC_USER]: '/',
};

export const PUBLIC_AUTH_ROLES = [ROLES.PUBLIC_USER, ROLES.TENANT];

export const PUBLIC_USER_PATHS = [
  '/',
  '/branches',
  '/bookings/new',
  '/register',
  '/notifications',
  '/payments',
  '/pricing',
  '/about',
  '/contact',
];

const PUBLIC_USER_ROUTE_PATTERNS = [
  /^\/branches\/[^/]+$/,
  /^\/payments\/[^/]+$/,
  /^\/payments\/[^/]+\/pay$/,
];

export function normalizeRole(role) {
  return String(role || '').trim().toUpperCase();
}

function normalizePath(path) {
  const value = String(path || '').trim();
  if (!value) return '';

  try {
    return new URL(value, 'http://hbms.local').pathname;
  } catch {
    return value.split(/[?#]/)[0] || '';
  }
}

export function getRoleHomePath(role) {
  return ROLE_HOME_MAP[normalizeRole(role)] || '/unauthorized';
}

export function getRoleRoutePrefix(role) {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === ROLES.SUPER_ADMIN) return '/superadmin';
  if (normalizedRole === ROLES.OWNER) return '/owner';
  if (normalizedRole === ROLES.MANAGER) return '/manager';
  if (normalizedRole === ROLES.TENANT) return '/tenant';
  if (normalizedRole === ROLES.STAFF) return '/staff';

  return '';
}

export function canPublicUserAccessPath(path) {
  const normalizedPath = normalizePath(path);

  return (
    PUBLIC_USER_PATHS.includes(normalizedPath) ||
    PUBLIC_USER_ROUTE_PATTERNS.some((pattern) => pattern.test(normalizedPath))
  );
}

export function canRoleAccessPath(role, path) {
  const normalizedRole = normalizeRole(role);
  const routePrefix = getRoleRoutePrefix(normalizedRole);
  const normalizedPath = normalizePath(path);

  if (normalizedRole === ROLES.PUBLIC_USER) {
    return canPublicUserAccessPath(normalizedPath);
  }

  if (!routePrefix || normalizedPath === '/login') return false;
  return normalizedPath === routePrefix || normalizedPath.startsWith(`${routePrefix}/`);
}
