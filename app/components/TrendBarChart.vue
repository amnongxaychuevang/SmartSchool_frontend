<template>
  <!--
    Column chart: one column per category; several series stack inside it.
    Marks follow the dataviz spec: <=24px columns, 4px rounded data-end and square at
    the baseline, a 2px surface gap between stacked segments, solid hairline grid.
    Colors come from --viz-* tokens below, validated for both themes.
  -->
  <div class="viz-root flex flex-col gap-3">
    <div v-if="series.length > 1" class="flex items-center gap-4 flex-wrap">
      <div v-for="s in series" :key="s.label" class="flex items-center gap-1.5">
        <span class="inline-block w-2.5 h-2.5 rounded-sm shrink-0" :style="{ backgroundColor: s.color }" />
        <span class="text-xs text-ink-muted">{{ s.label }}</span>
      </div>
    </div>

    <div class="relative select-none" :style="{ height: `${height}px` }" @mouseleave="hovered = null">
      <!-- Grid + y ticks -->
      <div class="absolute inset-0 pb-6 pointer-events-none" aria-hidden="true">
        <div class="relative h-full">
          <div
            v-for="tick in yTicks"
            :key="tick.value"
            class="absolute left-0 right-0 flex items-center gap-2"
            :style="{ bottom: `${tick.frac * 100}%`, transform: 'translateY(50%)' }"
          >
            <span class="w-9 shrink-0 text-right text-[10px] text-ink-subtle tnum">{{ tick.label }}</span>
            <span class="flex-1 h-px" :class="tick.value === 0 ? 'bg-line-strong' : 'bg-line'" />
          </div>
        </div>
      </div>

      <!-- Columns -->
      <div class="absolute inset-0 pl-11 flex">
        <div
          v-for="(cat, ci) in categories"
          :key="ci"
          class="relative flex-1 flex flex-col outline-none group"
          tabindex="0"
          :aria-label="columnLabel(ci)"
          @mouseenter="hovered = ci"
          @focus="hovered = ci"
          @blur="hovered = null"
        >
          <div class="relative flex-1 flex items-end justify-center">
            <!-- Hover band: bigger than the mark so thin columns are easy to hit -->
            <div
              class="absolute inset-x-1 inset-y-0 rounded transition-colors"
              :class="hovered === ci ? 'bg-surface-2' : 'bg-transparent'"
            />
            <!-- End label (e.g. today's rate), only where the page asks for it -->
            <span
              v-if="ci === categories.length - 1 && endLabel && total(ci) > 0"
              class="absolute z-10 text-[11px] font-semibold text-ink tnum whitespace-nowrap"
              :style="{ bottom: `calc(${barPct(ci)}% + 4px)` }"
            >{{ endLabel }}</span>
            <div
              class="relative z-[1] w-full max-w-[24px] flex flex-col-reverse gap-[2px] bar-grow"
              :style="{ height: mounted ? `${barPct(ci)}%` : '0%' }"
            >
              <div
                v-for="seg in segments(ci)"
                :key="seg.label"
                class="w-full shrink-0"
                :class="seg.top ? 'rounded-t-[4px]' : ''"
                :style="{ flexGrow: seg.value, flexBasis: 0, backgroundColor: seg.color, minHeight: '2px' }"
              />
            </div>
          </div>
          <span
            class="h-6 flex items-end justify-center text-[10px] tnum transition-colors"
            :class="hovered === ci ? 'text-ink font-semibold' : 'text-ink-subtle'"
          >{{ cat }}</span>

          <!-- Tooltip -->
          <div
            v-if="hovered === ci"
            class="pointer-events-none absolute z-20 bottom-full mb-1 rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-lg whitespace-nowrap"
            :class="ci < categories.length / 2 ? 'left-0' : 'right-0'"
            role="tooltip"
          >
            <p class="text-[10px] font-semibold uppercase tracking-wide text-ink-subtle mb-1.5">{{ titleOf(ci) }}</p>
            <div class="flex flex-col gap-1">
              <div v-for="s in series" :key="s.label" class="flex items-center justify-between gap-5">
                <span class="flex items-center gap-1.5 text-ink-muted">
                  <span class="inline-block w-2 h-2 rounded-sm" :style="{ backgroundColor: s.color }" />
                  {{ s.label }}
                </span>
                <span class="font-semibold text-ink tnum">
                  {{ valuePrefix }}{{ formatValue(valueOf(s, ci)) }}<span v-if="series.length > 1 && total(ci) > 0" class="ml-1 font-normal text-ink-subtle">{{ share(valueOf(s, ci), ci) }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table view for screen readers (relief for the light-mode aqua under 3:1) -->
    <table class="sr-only">
      <thead>
        <tr><th scope="col" /><th v-for="s in series" :key="s.label" scope="col">{{ s.label }}</th></tr>
      </thead>
      <tbody>
        <tr v-for="(cat, ci) in categories" :key="ci">
          <th scope="row">{{ titleOf(ci) }}</th>
          <td v-for="s in series" :key="s.label">{{ valuePrefix }}{{ formatValue(valueOf(s, ci)) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';

interface Series {
  label: string;
  /** A CSS color; use the --viz-* tokens so both themes stay validated. */
  color: string;
  data: number[];
}

const props = withDefaults(defineProps<{
  categories: string[];
  series: Series[];
  height?: number;
  valuePrefix?: string;
  /** Optional full labels for the tooltip/table (e.g. a full date for a "Mon" tick). */
  tooltipTitles?: string[];
  /** Optional value printed above the last column, e.g. today's rate. */
  endLabel?: string;
}>(), {
  height: 200,
  valuePrefix: '',
  tooltipTitles: undefined,
  endLabel: '',
});

const hovered = ref<number | null>(null);
// Columns grow from the baseline once on mount.
const mounted = ref(false);
onMounted(() => requestAnimationFrame(() => { mounted.value = true; }));

const totals = computed(() =>
  props.categories.map((_, ci) => props.series.reduce((sum, s) => sum + (Number(s.data[ci]) || 0), 0)),
);

// Round the top of the scale up to the nearest clean value whose half is also clean
// (35 -> 40, 1.6M -> 2M), so columns fill the plot instead of sitting low.
const maxValue = computed(() => {
  const max = Math.max(1, ...totals.value);
  const mag = 10 ** Math.floor(Math.log10(max));
  const step = [1, 1.2, 1.6, 2, 3, 4, 5, 6, 8, 10].find((m) => m * mag >= max)!;
  return step * mag;
});

const yTicks = computed(() =>
  [0, 0.5, 1].map((frac) => {
    const value = maxValue.value * frac;
    return { frac, value, label: formatAxis(value) };
  }),
);

const valueOf = (s: Series, ci: number) => Number(s.data[ci]) || 0;
const total = (ci: number) => totals.value[ci] ?? 0;
const barPct = (ci: number) => (total(ci) / maxValue.value) * 100;
const titleOf = (ci: number) => props.tooltipTitles?.[ci] ?? props.categories[ci] ?? '';

function segments(ci: number) {
  const segs = props.series
    .map((s) => ({ label: s.label, color: s.color, value: Number(s.data[ci]) || 0, top: false }))
    .filter((s) => s.value > 0);
  // flex-col-reverse: the last segment in the list is drawn on top.
  if (segs.length) segs[segs.length - 1]!.top = true;
  return segs;
}

function formatAxis(v: number) {
  return v < 10_000
    ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(v)
    : new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(v);
}

function formatValue(v: number) {
  return new Intl.NumberFormat('en-US').format(Number(v || 0));
}

function share(v: number, ci: number) {
  const total = totals.value[ci] || 0;
  return total ? `${Math.round((v / total) * 100)}%` : '';
}

function columnLabel(ci: number) {
  const title = props.tooltipTitles?.[ci] ?? props.categories[ci];
  return `${title}: ${props.series.map((s) => `${s.label} ${props.valuePrefix}${formatValue(s.data[ci] ?? 0)}`).join(', ')}`;
}
</script>

<style scoped>
/* Validated with the dataviz palette validator against this app's surfaces:
   light #FFFFFF, dark #111A2E (categorical slots aqua / blue / orange). */
.viz-root {
  --viz-present: #1baf7a;
  --viz-excused: #2a78d6;
  --viz-absent: #eb6834;
  --viz-money: #2a78d6;
}
:global(html.dark) .viz-root {
  --viz-present: #199e70;
  --viz-excused: #3987e5;
  --viz-absent: #d95926;
  --viz-money: #3987e5;
}
.bar-grow {
  transition: height 600ms cubic-bezier(0.22, 1, 0.36, 1);
}
@media (prefers-reduced-motion: reduce) {
  .bar-grow { transition: none; }
}
</style>
