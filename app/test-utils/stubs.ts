import { vi } from 'vitest';

// Nuxt's real useCookie is backed by request/response headers (SSR) or
// document.cookie (client), with maxAge/path/etc handling on top. For a unit
// test we only need the get/set `.value` contract the app code relies on —
// this in-memory stand-in gives that without paying for a full Nuxt boot
// (which is what @nuxt/test-utils' 'nuxt' vitest environment does, and it
// alone took 40s+ / hit the default hook timeout in this project).
const cookieStore = new Map<string, string>();

export function stubUseCookie() {
  vi.stubGlobal('useCookie', (name: string) => ({
    get value() {
      return cookieStore.get(name) ?? null;
    },
    set value(v: string | null | undefined) {
      if (v == null) {
        cookieStore.delete(name);
      } else {
        cookieStore.set(name, String(v));
      }
    },
  }));
}

export function resetCookieStub() {
  cookieStore.clear();
}
