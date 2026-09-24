// Using Nuxt's $fetch for the base API client
// This file now exports a composable function that creates the client lazily.
// useRuntimeConfig() must be called inside a Nuxt context (e.g., a component, composable, or plugin).

import { API_ENDPOINTS } from './endpoints';
import type { ApiResponse } from './types';

// Access tokens are short-lived (15 min) by design — see backend LoginUseCase.
// Deduped so concurrent 401s from several in-flight requests trigger only one
// refresh call instead of a burst of them all racing to rotate the same token.
let refreshPromise: Promise<boolean> | null = null;

async function silentRefresh(): Promise<boolean> {
  const refreshCookie = useCookie<string>('refresh_token');
  const rawRefreshToken = refreshCookie.value;
  if (!rawRefreshToken) return false;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await $fetch<ApiResponse<{ token: string; refreshToken: string }>>(API_ENDPOINTS.auth.refresh, {
          baseURL: useRuntimeConfig().public.apiBaseUrl,
          method: 'POST',
          body: { refreshToken: rawRefreshToken },
        });
        if (!res?.success) return false;

        useCookie('auth_token', { maxAge: 60 * 30 }).value = res.data.token;
        useCookie('refresh_token', { maxAge: 60 * 60 * 24 * 30 }).value = res.data.refreshToken;
        return true;
      } catch {
        // Refresh token itself is invalid/expired — clear both cookies so the
        // app treats this as a logged-out session rather than retrying forever.
        useCookie('auth_token').value = null;
        useCookie('refresh_token').value = null;
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

export const useApiClient = () => {
  // Lazily create the $fetch instance when the function is invoked.
  return $fetch.create({
    baseURL: useRuntimeConfig().public.apiBaseUrl,
    onRequest({ options }) {
      // Retrieve the auth token from a cookie – this runs at request time, inside a Nuxt context.
      const token = useCookie('auth_token').value;
      if (token) {
        const existingHeaders = options.headers instanceof Headers
          ? options.headers
          : new Headers((options.headers as Record<string, string>) ?? {});
        existingHeaders.set('Authorization', `Bearer ${token}`);
        options.headers = existingHeaders;
      }
    },
    async onResponseError({ request, response }) {
      if (response.status !== 401) return;

      // Never refresh in response to the auth endpoints themselves —
      // that would loop (login/refresh legitimately return 401 on bad
      // credentials / an already-dead refresh token).
      const url = String(request);
      if (url.includes(API_ENDPOINTS.auth.refresh) || url.includes(API_ENDPOINTS.auth.login)) {
        return;
      }

      // NOTE: this refreshes the token for the *next* request — it does not
      // transparently retry the request that just failed. The caller of this
      // failed call still sees a rejected promise; on a page-level fetch,
      // re-navigating or the component's own retry will pick up the new token.
      await silentRefresh();
    },
  });
};
