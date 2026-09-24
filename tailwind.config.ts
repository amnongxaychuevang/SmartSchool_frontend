import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'
import defaultTheme from 'tailwindcss/defaultTheme'
import legacyLightCompat from './tailwind.legacy-compat'

// Design tokens live as RGB triplets in assets/css/main.css (:root = light,
// html.dark = dark) so every token supports Tailwind's /<alpha> modifier.
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`

export default <Partial<Config>>{
  // ThemeSwitch puts exactly one of `light` / `dark` on <html>.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand accent is Academic Sapphire. Pages were built on `teal-*`,
        // so teal is aliased to blue until each page moves to `primary-*`.
        teal: colors.blue,
        primary: {
          ...colors.blue,
          DEFAULT: token('primary'),
          hover: token('primary-hover'),
          soft: token('primary-soft'),
          ink: token('primary-ink'),
        },
        canvas: token('canvas'),
        surface: {
          DEFAULT: token('surface'),
          2: token('surface-2'),
        },
        line: {
          DEFAULT: token('line'),
          strong: token('line-strong'),
        },
        ink: {
          DEFAULT: token('ink'),
          muted: token('ink-muted'),
          subtle: token('ink-subtle'),
        },
        success: { DEFAULT: token('success'), soft: token('success-soft'), line: token('success-line') },
        warning: { DEFAULT: token('warning'), soft: token('warning-soft'), line: token('warning-line') },
        danger: { DEFAULT: token('danger'), soft: token('danger-soft'), line: token('danger-line') },
      },
      fontFamily: {
        // Inter has no Lao glyphs, so Lao text falls through to Noto Sans Lao.
        sans: ['Inter', 'Noto Sans Lao', ...defaultTheme.fontFamily.sans],
      },
      // Line heights ~1.15x Tailwind's defaults so Lao tone marks and lower
      // vowels are not clipped (DESIGN.md, Bilingual Typography Strategy).
      fontSize: {
        xs: ['0.75rem', '1.15rem'],
        sm: ['0.875rem', '1.45rem'],
        base: ['1rem', '1.7rem'],
        lg: ['1.125rem', '1.9rem'],
        xl: ['1.25rem', '2rem'],
        '2xl': ['1.5rem', '2.3rem'],
        '3xl': ['1.875rem', '2.6rem'],
      },
      borderRadius: {
        // Soft shape language: 4px controls, 6px containers, 12px ID cards.
        DEFAULT: '0.25rem',
        md: '0.375rem',
        card: '0.75rem',
      },
      boxShadow: {
        float: '0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [legacyLightCompat],
}
