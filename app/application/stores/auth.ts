import { defineStore } from 'pinia';
import type { User } from '../../domain/models/User';
import { LoginUseCase } from '../use-cases/auth/LoginUseCase';
import { FetchMeUseCase } from '../use-cases/auth/FetchMeUseCase';
import { authRepository } from '../../infrastructure/api/AuthRepository';
import { getErrorMessage } from '../../utils/errors';

// Wire use cases with the concrete repository implementation.
// In tests, you can swap authRepository with a mock.
const loginUseCase = new LoginUseCase(authRepository);
const fetchMeUseCase = new FetchMeUseCase(authRepository);

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null, // will be loaded from cookie in init action
    loading: false,
    error: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role ?? null,
  },



  actions: {
    // Called once when the app boots (e.g., from a plugin or root layout)
    // Loads the token from the cookie and optionally fetches the current user.
    // The access token is short-lived (15 min) — if it's missing/expired but a
    // refresh token is still on hand, silently exchange it before giving up.
    async init() {
      const cookie = useCookie<string>('auth_token');
      this.token = cookie.value ?? null;

      if (!this.token) {
        const refreshed = await this.refreshAccessToken();
        if (!refreshed) return;
      }

      try {
        await this.fetchUser();
      } catch {
        // If fetching fails, clear auth state safely.
        this.logout();
      }
    },
    async login(phoneOrEmail: string, password: string) {
      this.loading = true;
      this.error = null;
      try {
        const { token, refreshToken, user } = await loginUseCase.execute(phoneOrEmail, password);

        this.token = token;
        this.user = user;
        // Cookie lifetime intentionally outlives the JWT's own 15-min expiry —
        // the server is still the source of truth on validity; an expired JWT
        // sitting in the cookie just means the next request triggers a refresh.
        useCookie('auth_token', { maxAge: 60 * 30 }).value = token;
        useCookie('refresh_token', { maxAge: 60 * 60 * 24 * 30 }).value = refreshToken;

        return user;
      } catch (err) {
        this.error = getErrorMessage(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // Exchanges the refresh-token cookie for a new access token. Returns
    // false (without throwing) if there's no refresh token or it's no longer
    // valid — callers treat that as "not logged in", not as an error.
    async refreshAccessToken(): Promise<boolean> {
      const refreshCookie = useCookie<string>('refresh_token');
      if (!refreshCookie.value) return false;

      try {
        const { token, refreshToken, user } = await authRepository.refresh(refreshCookie.value);
        this.token = token;
        this.user = user;
        useCookie('auth_token', { maxAge: 60 * 30 }).value = token;
        useCookie('refresh_token', { maxAge: 60 * 60 * 24 * 30 }).value = refreshToken;
        return true;
      } catch (err) {
        console.warn('Refresh token invalid/expired:', err);
        this.logout();
        return false;
      }
    },

    async fetchUser() {
      if (!this.token) return null;

      this.loading = true;
      try {
        this.user = await fetchMeUseCase.execute();
        return this.user;
      } catch (err) {
        console.error('Failed to fetch user:', getErrorMessage(err));
        this.logout(); // Token likely expired or invalid
      } finally {
        this.loading = false;
      }
    },

    logout() {
      // Revoke the refresh token server-side (best-effort — AuthRepository
      // swallows its own errors, this call is fire-and-forget by design).
      const refreshCookie = useCookie<string>('refresh_token');
      void authRepository.logout(refreshCookie.value);

      // Clear client‑side auth state
      this.user = null
      this.token = null
      useCookie('auth_token').value = null
      useCookie('refresh_token').value = null

      // Remove any leftover token copies from storage (client side only)
      if (import.meta.client) {
        try {
          localStorage.removeItem('auth_token')
          sessionStorage.clear()
        } catch {
          // Storage can be unavailable (private mode, blocked site data) — nothing to clear then.
        }
      }
    },
  },
});
