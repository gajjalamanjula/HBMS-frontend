import { getApiErrorMessage } from '../../../lib/axios/apiClient';

export const FORGOT_PASSWORD_SAFE_MESSAGE =
  'If an account exists, reset instructions will be sent.';

export function getHttpStatus(error) {
  return error?.response?.status ?? null;
}

export function isNetworkError(error) {
  return error?.code === 'ERR_NETWORK' || !error?.response;
}

export function shouldRetryAuthQuery(failureCount, error) {
  const status = getHttpStatus(error);

  if (status === 401 || status === 403) return false;

  return failureCount < 1;
}

export function getSafeLoginErrorMessage(error) {
  const status = getHttpStatus(error);

  if (isNetworkError(error)) {
    return 'Invalid email or password.';
  }

  if (status === 400 || status === 401 || status === 403 || status === 404) {
    return 'Invalid email or password.';
  }

  return 'Invalid email or password.';
}

export function getSafeForgotPasswordMessage(error) {
  const status = getHttpStatus(error);

  if (isNetworkError(error)) {
    return getApiErrorMessage(error, 'This information is not available right now. Please try again.');
  }

  if (status && status >= 500) {
    return getApiErrorMessage(
      error,
      'Password reset is not available right now. Please try again later.'
    );
  }

  return FORGOT_PASSWORD_SAFE_MESSAGE;
}
