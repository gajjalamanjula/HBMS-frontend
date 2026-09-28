export const queryStaleTime = {
  realtime: 1000 * 30,
  dashboard: 1000 * 30,
  list: 1000 * 60 * 2,
  paymentHistory: 1000 * 60 * 2,
  branchList: 1000 * 60 * 5,
  detail: 1000 * 60 * 5,
  profile: 1000 * 60 * 10,
  media: 1000 * 60 * 10,
  static: 1000 * 60 * 10,
};

export const queryGcTime = {
  standard: 1000 * 60 * 5,
  long: 1000 * 60 * 15,
};

export function hasValidId(value) {
  return Boolean(String(value ?? '').trim());
}

export function withIdQuery(enabledValue, extra = {}) {
  return {
    enabled: hasValidId(enabledValue),
    ...extra,
  };
}

export function stableParams(params = {}) {
  return Object.keys(params || {})
    .sort()
    .reduce((acc, key) => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});
}
