import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

// Deliberately NOT using @nuxt/test-utils' 'nuxt' environment — booting a
// real (mocked) Nuxt server per test file took 40s+ and hit the default
// hook timeout on this machine. Nuxt-only globals (useCookie, etc.) that
// individual tests need are stubbed directly instead — see app/test-utils/.
// @vitejs/plugin-vue is needed explicitly here because Nuxt normally
// supplies Vue SFC compilation itself; a plain Vitest run has no plugin
// for .vue files without it.
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    include: ['app/**/*.test.ts', 'app/**/*.spec.ts'],
  },
});
