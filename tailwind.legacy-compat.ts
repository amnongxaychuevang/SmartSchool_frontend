import plugin from 'tailwindcss/plugin'
import colors from 'tailwindcss/colors'

/*
 * Light-mode compatibility for pages written dark-first (text-white,
 * bg-slate-800, border-slate-700, text-red-400, ...).
 *
 * Each such utility is remapped to a design token under `html.light`, so the
 * whole app follows the new design system before every page is rewritten.
 * When a page is migrated to token classes (bg-surface, text-ink,
 * border-line, ... with `dark:` variants) it stops matching these rules, and
 * this file can shrink until it is deleted.
 */

const esc = (cls: string) => cls.replace(/([:/[\]#.])/g, '\\$1')
const L = 'html.light'
const tok = (name: string) => `rgb(var(--${name}))`

type Rules = Record<string, Record<string, string>>

function add(rules: Rules, selectors: string[], decl: Record<string, string>) {
  rules[selectors.join(',\n')] = decl
}

const withAlphas = (base: string, alphas: number[]) => [base, ...alphas.map((a) => `${base}/${a}`)]
const ALPHAS = [5, 10, 20, 30, 40, 50, 60, 70, 80, 85, 90, 95]

// Saturated backgrounds keep white text readable in both themes.
const HUES = [
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan',
  'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose',
] as const
const onSolidColor = [
  ...HUES.flatMap((h) => [`[class*="bg-${h}-5"]`, `[class*="bg-${h}-6"]`, `[class*="bg-${h}-7"]`]),
  '[class*="bg-gradient"]',
  '[class*="bg-primary"]',
  '[class*="btn-"]',
].join(', ')

export default plugin(({ addBase }) => {
  const rules: Rules = {}

  // ── Surfaces ──────────────────────────────────────────────
  const panelBgs = [
    ...withAlphas('bg-slate-900', ALPHAS),
    'bg-slate-900',
    ...withAlphas('bg-slate-950', ALPHAS),
    'bg-[#0d1626]', 'bg-[#0d1626]/80', 'bg-[#080e1a]/85', 'bg-[#0a101d]/60', 'bg-[#0b1120]',
  ]
  add(rules, panelBgs.map((c) => `${L} .${esc(c)}`), { 'background-color': tok('surface') })

  const insetBgs = [
    ...withAlphas('bg-slate-800', ALPHAS),
    ...withAlphas('bg-slate-700', [30, 40, 50, 60]),
    ...withAlphas('bg-slate-600', [20, 30, 50]),
    ...withAlphas('bg-slate-500', [10, 15, 20]),
  ]
  add(rules, insetBgs.map((c) => `${L} .${esc(c)}`), { 'background-color': tok('surface-2') })

  // Solid mid-slate fills are tracks, toggles and dividers.
  add(rules, ['bg-slate-700', 'bg-slate-600'].map((c) => `${L} .${esc(c)}`), {
    'background-color': tok('line-strong'),
  })

  const hoverBgs = [
    ...withAlphas('bg-slate-800', ALPHAS),
    ...withAlphas('bg-slate-700', [30, 50]),
    'bg-slate-700', 'bg-slate-750',
  ]
  add(rules, hoverBgs.map((c) => `${L} .${esc(`hover:${c}`)}:hover`), { 'background-color': tok('surface-2') })

  // ── Borders & dividers ───────────────────────────────────
  const borders = [
    ...withAlphas('border-slate-800', ALPHAS),
    ...withAlphas('border-slate-700', ALPHAS),
  ]
  add(rules, borders.map((c) => `${L} .${esc(c)}`), { 'border-color': tok('line') })
  add(
    rules,
    ['border-slate-600', 'border-slate-700', 'border-slate-700/50'].map((c) => `${L} .${esc(`hover:${c}`)}:hover`),
    { 'border-color': tok('line-strong') },
  )
  add(
    rules,
    withAlphas('divide-slate-800', ALPHAS).map((c) => `${L} .${esc(c)} > :not([hidden]) ~ :not([hidden])`),
    { 'border-color': tok('line') },
  )

  // ── Text ─────────────────────────────────────────────────
  add(rules, [
    `${L} .text-white:not(${onSolidColor}):not(:where(${onSolidColor}) *)`,
    ...['text-slate-100', 'text-slate-200', 'text-slate-300'].map((c) => `${L} .${c}`),
    ...['text-white', 'text-slate-200', 'text-slate-300'].map((c) => `${L} .${esc(`hover:${c}`)}:hover`),
    `${L} .group:hover .${esc('group-hover:text-white')}`,
  ], { color: tok('ink') })
  add(rules, [`${L} .text-slate-400`], { color: tok('ink-muted') })
  add(rules, [`${L} .text-slate-500`], { color: tok('ink-subtle') })

  // Pale accent text (300/400) is tuned for dark surfaces; on white it needs
  // the 700 shade to pass contrast.
  for (const hue of HUES) {
    const dark = (colors as unknown as Record<string, Record<string, string>>)[hue === 'teal' ? 'blue' : hue]
    for (const shade of [200, 300, 400]) {
      const cls = `text-${hue}-${shade}`
      add(rules, [
        `${L} .${cls}`,
        `${L} .${esc(`hover:${cls}`)}:hover`,
        `${L} .group:hover .${esc(`group-hover:${cls}`)}`,
      ], { color: dark[700] })
    }
  }

  addBase(rules)
})
