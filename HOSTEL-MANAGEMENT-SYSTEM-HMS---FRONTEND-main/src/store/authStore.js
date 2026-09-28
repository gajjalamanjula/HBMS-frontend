import { create } from 'zustand';
import { toAuthSnapshot } from '../features/auth/utils/authMappers';

export const useAuthStore = create((set) => ({
  user: null,
  role: '',
  isAuthenticated: false,
  hydrated: false,
  setAuthUser: (user) => {
    const snapshot = toAuthSnapshot(user);

    set({
      user: snapshot,
      role: snapshot?.role || '',
      isAuthenticated: Boolean(snapshot),
      hydrated: true,
    });
  },
  clearAuth: () =>
    set({
      user: null,
      role: '',
      isAuthenticated: false,
      hydrated: true,
    }),
  setHydrated: (hydrated = true) => set({ hydrated: Boolean(hydrated) }),
}));

export default useAuthStore;
