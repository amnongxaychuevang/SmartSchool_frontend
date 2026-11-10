// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  // Template expressions (?., ??) are parsed with this. Said explicitly because the
  // VS Code ESLint server otherwise fell back to an older version and showed
  // "Parsing error: Unexpected token ?." that the CLI does not report.
  languageOptions: {
    ecmaVersion: 'latest',
    parserOptions: { ecmaVersion: 'latest' },
  },
  rules: {
    // ~125 left, almost all API responses in modules without typed models yet
    // (transport, library, behavior, driver). Warn so new code is flagged without
    // failing lint; remove this once those modules get domain types.
    '@typescript-eslint/no-explicit-any': 'warn',
  },
})
