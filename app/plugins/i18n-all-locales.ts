// The UI is bilingual by design (DESIGN.md): navigation shows each label in the
// current language with the other language underneath. @nuxtjs/i18n only loads
// the active locale's messages, so load every locale up front — the two files
// are small — on the server and the client alike.
export default defineNuxtPlugin({
  name: 'i18n-all-locales',
  dependsOn: ['i18n:plugin'],
  async setup(nuxtApp) {
    const i18n = nuxtApp.$i18n;
    const codes = i18n.locales.value.map((l) => (typeof l === 'string' ? l : l.code));
    await Promise.all(codes.map((code) => i18n.loadLocaleMessages(code)));
  },
});
