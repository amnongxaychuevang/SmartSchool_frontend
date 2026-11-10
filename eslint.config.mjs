// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // ~125 left, almost all API responses in modules without typed models yet
    // (transport, library, behavior, driver). Warn so new code is flagged without
    // failing lint; remove this once those modules get domain types.
    '@typescript-eslint/no-explicit-any': 'warn',
  },
})
