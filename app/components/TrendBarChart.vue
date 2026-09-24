<template>
  <div class="viz-root flex flex-col gap-3">
    <!-- Legend — always present for 2+ series, omitted for a single series
         (the card title already names what's plotted). -->
    <div v-if="series.length > 1" class="flex items-center gap-4 flex-wrap">
      <div v-for="s in series" :key="s.label" class="flex items-center gap-1.5">
        <span class="inline-block w-2.5 h-2.5 rounded-sm shrink-0" :style="{ backgroundColor: s.color }" />
        <span class="text-xs text-slate-400">{{ s.label }}</span>
      </div>
    </div>

    <div class="relative" @mouseleave="hovered = null">
      <svg
        :viewBox="`0 0 ${vbWidth} ${vbHeight}`"
        preserveAspectRatio="none"
        class="w-full"
        :style="{ height: `${height}px` }"
        role="img"
        :aria-label="ariaSummary"
      >
        <!-- Gridlines + Y ticks (hairline, recessive) -->
        <g v-for="tick in yTicks" :key="tick.value">
          <line
            :x1="padLeft" :x2="vbWidth - padRight"
            :y1="tick.y" :y2="tick.y"
            stroke="#2c2c2a" stroke-width="1"
          />
          <text :x="padLeft - 8" :y="tick.y + 3" text-anchor="end" class="axis-label">{{ tick.label }}</text>
        </g>

        <!-- Baseline -->
        <line :x1="padLeft" :x2="vbWidth - padRight" :y1="baselineY" :y2="baselineY" stroke="#383835" stroke-width="1" />

        <!-- Bars. The visible mark (path, can be zero-height) and its hit
             target (rect, always spans the full plot height) are separate —
             a zero-value bar still needs to be hoverable/focusable. -->
        <g v-for="(cat, ci) in categories" :key="cat">
          <g v-for="(s, si) in series" :key="s.label">
            <path :d="barPath(ci, si)" :fill="s.color" :opacity="isDimmed(ci, si) ? 0.55 : 1" class="transition-opacity duration-150 pointer-events-none" />
            <rect
              :x="hitRect(ci, si).x" :y="padTop"
              :width="hitRect(ci, si).width" :height="baselineY - padTop"
              fill="transparent"
              class="cursor-pointer"
              tabindex="0"
              :aria-label="`${cat}, ${s.label}: ${valuePrefix}${formatValue(s.data[ci] ?? 0)}`"
              @mouseenter="hovered = { ci, si }"
              @focus="hovered = { ci, si }"
              @blur="hovered = null"
            />
          </g>
          <text :x="categoryCenterX(ci)" :y="vbHeight - 4" text-anchor="middle" class="axis-label">{{ cat }}</text>
        </g>
      </svg>

      <!-- Hover tooltip -->
      <div
        v-if="hovered"
        class="pointer-events-none absolute top-1 -translate-x-1/2 rounded-lg bg-slate-950/95 border border-slate-700/60 px-2.5 py-1.5 text-xs shadow-lg whitespace-nowrap z-10"
        :style="{ left: `${categoryCenterXPercent(hovered.ci)}%` }"
      >
        <p class="text-slate-400">{{ categories[hovered.ci] }} · {{ series[hovered.si]?.label }}</p>
        <p class="font-semibold text-white">{{ valuePrefix }}{{ formatValue(series[hovered.si]?.data[hovered.ci] ?? 0) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Series {
  label: string;
  color: string;
  data: number[];
}

const props = withDefaults(defineProps<{
  categories: string[];
  series: Series[];
  height?: number;
  valuePrefix?: string;
}>(), {
  height: 180,
  valuePrefix: '',
});

const hovered = ref<{ ci: number; si: number } | null>(null);

// Internal coordinate space. Width is fixed (scales fluidly with the fluid
// container width via the viewBox); height tracks the `height` prop 1:1 so
// text/bar-corner units stay real pixels — with preserveAspectRatio="none",
// a height prop that drifted from a fixed vbHeight would squash Y-axis text
// and rounded corners non-uniformly instead of just rendering smaller.
const vbWidth = 600;
const vbHeight = computed(() => props.height + 32);
const padLeft = 32;
const padRight = 8;
const padTop = 12;
const padBottom = 20;
const baselineY = computed(() => vbHeight.value - padBottom);

const maxValue = computed(() => {
  const all = props.series.flatMap((s) => s.data);
  const max = Math.max(1, ...all);
  // Round up to a clean step so the top gridline reads as a round number.
  const magnitude = 10 ** Math.floor(Math.log10(max));
  return Math.ceil(max / magnitude) * magnitude;
});

const yTicks = computed(() => {
  const steps = [0, 0.5, 1];
  const ticks = steps.map((f) => ({
    value: Math.round(maxValue.value * f),
    y: baselineY.value - f * (baselineY.value - padTop),
  }));
  // For a small max (e.g. maxValue=1), the 0.5 step rounds to the same
  // integer as an adjacent tick ("1" shown twice) — drop the duplicate
  // rather than show a repeated, meaningless label.
  const deduped = ticks.filter((t, i) => i === 0 || t.value !== ticks[i - 1]?.value);
  return deduped.map((t) => ({ ...t, label: formatValue(t.value) }));
});

function formatValue(v: number) {
  return Number(v || 0).toLocaleString();
}

const groupWidth = computed(() => (vbWidth - padLeft - padRight) / props.categories.length);
const barGap = 2;

function categoryCenterX(ci: number) {
  return padLeft + groupWidth.value * (ci + 0.5);
}

function categoryCenterXPercent(ci: number) {
  return (categoryCenterX(ci) / vbWidth) * 100;
}

// Shared x-position math for a given (category, series) bar slot — used by
// both the visible mark (barPath) and its hit target (hitRect), so a
// zero-height bar still occupies the same horizontal slot as its hit area.
function barSlot(ci: number, si: number) {
  const n = props.series.length;
  const barW = Math.min(24, (groupWidth.value - barGap * (n + 1)) / n);
  const groupStart = padLeft + groupWidth.value * ci + (groupWidth.value - (barW * n + barGap * (n - 1))) / 2;
  const x = groupStart + si * (barW + barGap);
  return { x, width: barW };
}

function hitRect(ci: number, si: number) {
  return barSlot(ci, si);
}

function isDimmed(ci: number, si: number) {
  return !!hovered.value && (hovered.value.ci !== ci || hovered.value.si !== si);
}

function barPath(ci: number, si: number) {
  const { x, width: barW } = barSlot(ci, si);
  const value = props.series[si]?.data[ci] || 0;
  const frac = value / maxValue.value;
  const barH = Math.max(0, frac * (baselineY.value - padTop));
  const y = baselineY.value - barH;
  const r = Math.min(4, barW / 2, barH);

  if (barH <= 0) {
    // Zero value — nothing to paint; the hit target (a separate rect) still
    // covers this slot so it stays hoverable/focusable.
    return '';
  }

  const base = baselineY.value;
  return `M${x},${base} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + barW - r},${y} Q${x + barW},${y} ${x + barW},${y + r} L${x + barW},${base} Z`;
}

const ariaSummary = computed(() => {
  const parts = props.categories.map((cat, ci) =>
    `${cat}: ${props.series.map((s) => `${s.label} ${formatValue(s.data[ci] ?? 0)}`).join(', ')}`
  );
  return parts.join('; ');
});
</script>

<style scoped>
.viz-root :deep(.axis-label) {
  font-size: 9px;
  fill: #898781;
}
</style>
