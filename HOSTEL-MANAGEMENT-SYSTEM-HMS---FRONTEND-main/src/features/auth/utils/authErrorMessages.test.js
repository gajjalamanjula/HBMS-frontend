import { describe, expect, it } from 'vitest';
import {
  FORGOT_PASSWORD_SAFE_MESSAGE,
  getSafeForgotPasswordMessage,
  getSafeLoginErrorMessage,
  shouldRetryAuthQuery,
} from './authErrorMessages';

describe('authErrorMessages', () => {
  it('uses a generic login message for credential failures', () => {
    const error = {
      response: {
        status: 401,
        data: { message: 'Email not found' },
      },
    };

    expect(getSafeLoginErrorMessage(error)).toBe('Invalid email or password.');
  });

  it('does not expose account existence in forgot-password failures', () => {
    const error = {
      response: {
        status: 404,
        data: { message: 'User does not exist' },
      },
    };

    expect(getSafeForgotPasswordMessage(error)).toBe(FORGOT_PASSWORD_SAFE_MESSAGE);
  });

  it('does not retry auth queries for authorization failures', () => {
    expect(shouldRetryAuthQuery(0, { response: { status: 401 } })).toBe(false);
    expect(shouldRetryAuthQuery(0, { response: { status: 403 } })).toBe(false);
    expect(shouldRetryAuthQuery(0, { response: { status: 500 } })).toBe(true);
    expect(shouldRetryAuthQuery(1, { response: { status: 500 } })).toBe(false);
  });
});
