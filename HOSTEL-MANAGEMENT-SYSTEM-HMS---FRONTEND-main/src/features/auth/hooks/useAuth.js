import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  clearAuthStateAndCache,
  getAccessToken,
  getApiErrorMessage,
  getRefreshToken,
  getStoredUser,
  hasStoredSession,
  setAuthSession,
  subscribeAuthSession,
} from '../../../lib/axios/apiClient';
import { authKeys } from '../../../lib/query/queryKeys';
import { useAuthStore } from '../../../store/authStore';
import { getRoleHomePath } from '../../../utils/constants/roles';
import { authApi } from '../api/auth.api';
import {
  FORGOT_PASSWORD_SAFE_MESSAGE,
  getHttpStatus,
  getSafeForgotPasswordMessage,
  getSafeLoginErrorMessage,
  isNetworkError,
  shouldRetryAuthQuery,
} from '../utils/authErrorMessages';

function getSessionSnapshot() {
  return hasStoredSession();
}

function syncStoredUserToAuthStore() {
  const storedUser = getStoredUser();
  if (storedUser) {
    useAuthStore.getState().setAuthUser(storedUser);
  } else {
    useAuthStore.getState().setHydrated(true);
  }
}

export function useAuthSession() {
  const hasSession = useSyncExternalStore(
    subscribeAuthSession,
    getSessionSnapshot,
    getSessionSnapshot
  );

  useEffect(() => {
    syncStoredUserToAuthStore();
  }, [hasSession]);

  return {
    hasSession,
    user: getStoredUser(),
  };
}

export function useCurrentUser(options = {}) {
  const session = useAuthSession();
  const setAuthUser = useAuthStore((state) => state.setAuthUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const query = useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: authApi.getCurrentUser,
    enabled: session.hasSession && (options.enabled ?? true),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    retry: shouldRetryAuthQuery,
  });

  useEffect(() => {
    if (query.data && getAccessToken()) {
      setAuthUser(query.data);
      setAuthSession({
        accessToken: getAccessToken(),
        refreshToken: getRefreshToken(),
        user: query.data,
      });
    }
  }, [query.data, setAuthUser]);

  useEffect(() => {
    if (query.isError && query.error?.response?.status === 401) {
      clearAuthStateAndCache();
      clearAuth();
    }
  }, [clearAuth, query.error, query.isError]);

  return query;
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const result = await authApi.login(payload);

      if (!result.accessToken) {
        throw new Error('Login response did not include an access token.');
      }

      setAuthSession({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user || null,
      });

      let currentUser = result.user;

      if (!currentUser) {
        currentUser = await authApi.getCurrentUser();
      }

      setAuthSession({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: currentUser,
      });
      useAuthStore.getState().setAuthUser(currentUser);
      queryClient.setQueryData(authKeys.currentUser(), currentUser);
      await queryClient.invalidateQueries({ queryKey: authKeys.all });

      return {
        ...result,
        user: currentUser,
        role: currentUser?.role || result.role,
        redirectTo: getRoleHomePath(currentUser?.role || result.role),
      };
    },
    onSuccess: () => {
      toast.success('Login successful');
    },
    onError: (error) => {
      toast.error(getSafeLoginErrorMessage(error));
    },
  });
}

export function useLogout({ redirectTo = '/login' } = {}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = getRefreshToken();
      let requestFailed = false;
      let errorMessage = '';

      try {
        if (refreshToken) {
          await authApi.logout(refreshToken);
        }
      } catch (error) {
        requestFailed = true;
        errorMessage = getApiErrorMessage(error, 'Logout request failed. Local session cleared.');
      } finally {
        clearAuthStateAndCache();
      }

      return { requestFailed, errorMessage };
    },
    onSuccess: (result) => {
      if (result?.requestFailed) {
        toast.warning(result.errorMessage || 'Logout request failed. Local session cleared.');
        return;
      }
      toast.success('Logged out successfully');
    },
    onSettled: () => {
      queryClient.clear();
      navigate(redirectTo, { replace: true });
    },
  });
}

export function useRefreshToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.refreshToken,
    onSuccess: async (result) => {
      setAuthSession({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken || getRefreshToken(),
        user: getStoredUser(),
      });
      await queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
    },
    onError: (error) => {
      clearAuthStateAndCache();
      toast.error(getApiErrorMessage(error, 'Session refresh failed'));
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      toast.success(FORGOT_PASSWORD_SAFE_MESSAGE);
    },
    onError: (error) => {
      const status = getHttpStatus(error);
      const message = getSafeForgotPasswordMessage(error);

      if (isNetworkError(error) || (status && status >= 500)) {
        toast.error(message);
      } else {
        toast.success(message);
      }
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: (message) => {
      toast.success(typeof message === 'string' ? message : 'Password reset successful');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Password reset failed'));
    },
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: (message) => {
      toast.success(typeof message === 'string' ? message : 'Verification code confirmed');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Verification code could not be confirmed'));
    },
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: async (message) => {
      toast.success(typeof message === 'string' ? message : 'Password changed successfully');
      queryClient.setQueryData(authKeys.currentUser(), (currentUser) =>
        currentUser ? { ...currentUser, mustChangePassword: false } : currentUser
      );
      await queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Password change failed'));
    },
  });
}
