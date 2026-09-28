export function unwrapAuthPayload(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  if ('success' in raw && 'data' in raw) return raw.data;
  return raw.data ?? raw.result ?? raw.payload ?? raw;
}

export function normalizeRole(role) {
  return String(role || '').trim().toUpperCase();
}

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

export function normalizeCurrentUserResponse(raw = {}) {
  const data = unwrapAuthPayload(raw) || {};
  const branch =
    data.branch && typeof data.branch === 'object'
      ? data.branch
      : data.branchResponse && typeof data.branchResponse === 'object'
        ? data.branchResponse
        : null;

  return {
    id: data.id ?? data.userId ?? null,
    name: data.name || data.fullName || '',
    email: data.email || '',
    phone: data.phone || data.mobile || data.phoneNumber || '',
    role: normalizeRole(data.role),
    branchId: data.branchId ?? branch?.id ?? branch?.branchId ?? null,
    branchName: data.branchName ?? branch?.name ?? branch?.branchName ?? '',
    active: toBoolean(data.active, true),
    verified: toBoolean(data.verified),
    kycVerified: toBoolean(data.kycVerified),
    mustChangePassword: toBoolean(
      data.mustChangePassword ?? data.must_change_password,
      false
    ),
  };
}

export function normalizeLoginResponse(raw = {}) {
  const data = unwrapAuthPayload(raw) || {};
  const userSource = data.user ?? data.currentUser ?? data.profile ?? null;
  const user = userSource ? normalizeCurrentUserResponse(userSource) : null;

  return {
    accessToken: data.accessToken || data.token || data.access_token || data.jwt || '',
    refreshToken: data.refreshToken || data.refresh_token || '',
    role: normalizeRole(data.role || user?.role),
    mustChangePassword: toBoolean(
      data.mustChangePassword ?? data.must_change_password ?? user?.mustChangePassword,
      false
    ),
    user,
  };
}

export function normalizeAuthMessage(raw, fallback = 'Success') {
  if (typeof raw === 'string') return raw;
  if (typeof raw?.message === 'string') return raw.message;
  if (typeof raw?.data === 'string') return raw.data;
  const data = unwrapAuthPayload(raw);
  if (typeof data === 'string') return data;
  if (typeof data?.message === 'string') return data.message;
  return fallback;
}

export function toAuthSnapshot(user) {
  if (!user) return null;
  const normalized = normalizeCurrentUserResponse(user);

  return {
    id: normalized.id,
    name: normalized.name,
    email: normalized.email,
    role: normalized.role,
    branchId: normalized.branchId,
    active: normalized.active,
    verified: normalized.verified,
    kycVerified: normalized.kycVerified,
  };
}
