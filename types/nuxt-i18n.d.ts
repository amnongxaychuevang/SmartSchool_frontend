declare module '@nuxt/schema' {
  interface NuxtConfig {
    // Prefer the real options type from `@nuxtjs/i18n` when available,
    // otherwise fall back to a generic record so TS doesn't error.
    i18n?: import('@nuxtjs/i18n').ModuleOptions | Record<string, unknown>
  }
}
