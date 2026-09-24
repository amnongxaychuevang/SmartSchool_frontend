// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt", "@nuxtjs/i18n", "@nuxt/eslint"],
  css: ["~/assets/css/main.css"],
  app: {
    head: {
      script: [
        {
          // Apply the saved theme before first paint so there is no flash.
          // Light is the default; ThemeSwitch.vue keeps it in sync afterwards.
          innerHTML:
            "try{var d=localStorage.getItem('theme')==='dark';document.documentElement.classList.add(d?'dark':'light')}catch(e){document.documentElement.classList.add('light')}",
          tagPosition: "head",
        },
      ],
    },
  },
  runtimeConfig: {
    public: {
      apiBaseUrl:
        process.env.NUXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api",
    },
  },
  i18n: {
    locales: [
      { code: "lo", name: "ລາວ", file: "lo.json" },
      { code: "en", name: "English", file: "en.json" },
    ],
    defaultLocale: "lo",
    strategy: "no_prefix", // no /lo/ or /en/ in URLs
    compilation: { strictMessage: false },
  },
  vite: {
    optimizeDeps: {
      include: ["socket.io-client"],
    },
  },
});