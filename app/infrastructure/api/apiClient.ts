// Using Nuxt's $fetch for the base API client
// This file now exports a composable function that creates the client lazily.
// useRuntimeConfig() must be called inside a Nuxt context (e.g., a component, composable, or plugin).

import { API_ENDPOINTS } from './endpoints';
import type { ApiResponse } from './types';

// Access tokens are short-lived (15 min) by design — see backend LoginUseCase.
// Deduped so concurrent 401s from several in-flight requests trigger only one
// refresh call instead of a burst of them all racing to rotate the same token.
let refreshPromise: Promise<string | null> | null = null;
let sessionExpiring = false;

/** Returns the new access token, or null if the refresh token is gone or rejected. */
async function silentRefresh(): Promise<string | null> {
  const refreshCookie = useCookie<string>('refresh_token');
  const rawRefreshToken = refreshCookie.value;
  if (!rawRefreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await $fetch<ApiResponse<{ token: string; refreshToken: string }>>(API_ENDPOINTS.auth.refresh, {
          baseURL: useRuntimeConfig().public.apiBaseUrl,
          method: 'POST',
          body: { refreshToken: rawRefreshToken },
        });
        if (!res?.success) return null;

        useCookie('auth_token', { maxAge: 60 * 30 }).value = res.data.token;
        useCookie('refresh_token', { maxAge: 60 * 60 * 24 * 30 }).value = res.data.refreshToken;
        return res.data.token;
      } catch {
        // Refresh token itself is invalid/expired — clear both cookies so the
        // app treats this as a logged-out session rather than retrying forever.
        useCookie('auth_token').value = null;
        useCookie('refresh_token').value = null;
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

// Refresh token is dead too: sign out and send the user to the login page once,
// even if several requests fail at the same moment.
async function handleSessionExpired() {
  if (!import.meta.client || sessionExpiring) return;
  sessionExpiring = true;
  try {
    const { useAuthStore } = await import('../../application/stores/auth');
    useAuthStore().logout();
    await navigateTo('/');
  } finally {
    sessionExpiring = false;
  }
}

const AUTH_ENDPOINTS = [API_ENDPOINTS.auth.login, API_ENDPOINTS.auth.refresh, API_ENDPOINTS.auth.logout];

export const useApiClient = () => {
  const base = $fetch.create({
    baseURL: useRuntimeConfig().public.apiBaseUrl,
    onRequest({ options }) {
      const headers = options.headers instanceof Headers
        ? options.headers
        : new Headers((options.headers as Record<string, string>) ?? {});
      // A retry after refresh already carries the new token; don't overwrite it
      // with a cookie value that may not have been written back yet.
      if (!headers.has('Authorization')) {
        const token = useCookie('auth_token').value;
        if (token) headers.set('Authorization', `Bearer ${token}`);
      }
      options.headers = headers;
    },
  });

  // Access tokens live 15 min. When one expires mid-session, refresh it and
  // replay the failed request once, so the user never sees the 401.
  const client = (async (request: Parameters<typeof base>[0], options?: Parameters<typeof base>[1]) => {
    try {
      return await base(request, options);
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const url = String(request);
      if (!import.meta.client || status !== 401 || AUTH_ENDPOINTS.some((p) => url.includes(p))) throw err;

      const token = await silentRefresh();
      if (!token) {
        void handleSessionExpired();
        throw err;
      }
      const headers = new Headers((options?.headers as HeadersInit) ?? {});
      headers.set('Authorization', `Bearer ${token}`);
      return base(request, { ...options, headers });
    }
  }) as typeof base;

  return client;
};
