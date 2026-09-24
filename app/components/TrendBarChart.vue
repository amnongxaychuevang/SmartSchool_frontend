<template>
  <div class="viz-root flex flex-col gap-4">
    <div v-if="series.length > 1" class="flex items-center gap-5 flex-wrap px-2">
      <div v-for="s in series" :key="s.label" class="flex items-center gap-2">
        <span class="inline-block w-3 h-1 rounded-full shrink-0" :style="{ backgroundColor: s.color }" />
        <span class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ s.label }}</span>
      </div>
    </div>

    <div class="relative" @mouseleave="hoveredCi = null">
      <svg
        :viewBox="`0 0 ${vbWidth} ${vbHeight}`"
        preserveAspectRatio="none"
        class="w-full overflow-visible"
        :style="{ height: `${height}px` }"
        role="img"
        :aria-label="ariaSummary"
      >
        <defs>
          <linearGradient v-for="(s, si) in series" :key="'grad-'+si" :id="'gradient-' + uid + '-' + si" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" :stop-color="s.color" stop-opacity="0.45" />
            <stop offset="80%" :stop-color="s.color" stop-opacity="0.05" />
            <stop offset="100%" :stop-color="s.color" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <!-- Gridlines + Y ticks (Subtle dashed) -->
        <g v-for="tick in yTicks" :key="tick.value">
          <line
            :x1="padLeft" :x2="vbWidth - padRight"
            :y1="tick.y" :y2="tick.y"
            stroke="currentColor" stroke-width="1"
            stroke-dasharray="4 4"
            class="text-slate-200 dark:text-slate-800/60"
          />
          <text :x="padLeft - 12" :y="tick.y + 3" text-anchor="end" class="axis-label">{{ tick.label }}</text>
        </g>

        <!-- Series Areas -->
        <g v-for="(s, si) in series" :key="'area-'+s.label">
          <path :d="seriesAreaPath(si)" :fill="`url(#gradient-${uid}-${si})`" class="transition-all duration-500 ease-out pointer-events-none" />
        </g>

        <!-- Series Lines -->
        <g v-for="(s, si) in series" :key="'line-'+s.label">
          <path 
            :d="seriesPath(si)" 
            fill="none" 
            :stroke="s.color" 
            stroke-width="3" 
            stroke-linecap="round"
            stroke-linejoin="round"
            class="transition-all duration-500 ease-out pointer-events-none" 
            style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.05));"
          />
        </g>

        <!-- Data points & hit areas -->
        <g v-for="(cat, ci) in categories" :key="cat">
          <g v-for="(s, si) in series" :key="'pt-'+si+'-'+ci">
            <!-- Data point marker (larger on hover, always visible) -->
            <circle
              :cx="categoryCenterX(ci)"
              :cy="getY(s.data[ci] || 0)"
              :r="hoveredCi === ci ? 6 : 4"
              fill="#ffffff"
              :stroke="s.color"
              :stroke-width="hoveredCi === ci ? 3.5 : 2.5"
              class="transition-all duration-200 pointer-events-none"
              style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.1));"
            />
          </g>
          
          <!-- Category X-axis label -->
          <text :x="categoryCenterX(ci)" :y="vbHeight - 2" text-anchor="middle" class="axis-label">{{ cat }}</text>
          
          <!-- Hit strip for the entire column -->
          <rect
            :x="categoryCenterX(ci) - groupWidth / 2"
            :y="padTop"
            :width="groupWidth"
            :height="baselineY - padTop"
            fill="transparent"
            class="cursor-pointer outline-none"
            tabindex="0"
            :aria-label="categories[ci] + ': ' + series.map(s => s.label + ' ' + formatValue(s.data[ci] || 0)).join(', ')"
            @mouseenter="hoveredCi = ci"
            @focus="hoveredCi = ci"
          />
        </g>
      </svg>

      <!-- Hover tooltip -->
      <div
        v-if="hoveredCi !== null"
        class="pointer-events-none absolute top-0 -translate-x-1/2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 px-3.5 py-2.5 text-xs shadow-2xl whitespace-nowrap z-10 transition-all duration-150 backdrop-blur-md"
        :style="{ left: `${categoryCenterXPercent(hoveredCi)}%` }"
      >
        <p class="text-slate-400 dark:text-slate-500 font-semibold mb-2 uppercase tracking-wide text-[10px]">{{ categories[hoveredCi] }}</p>
        <div class="flex flex-col gap-1.5">
          <div v-for="s in series" :key="s.label" class="flex items-center gap-5 justify-between">
            <div class="flex items-center gap-2">
              <span class="inline-block w-2.5 h-2.5 rounded-full shadow-sm" :style="{ backgroundColor: s.color }" />
              <span class="text-slate-600 dark:text-slate-300 font-medium">{{ s.label }}</span>
            </div>
            <span class="font-bold text-slate-800 dark:text-white text-sm">{{ valuePrefix }}{{ formatValue(s.data[hoveredCi] || 0) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';

const uid = ref('default-uid');
onMounted(() => {
  uid.value = Math.random().toString(36).substring(2, 9);
});

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
  height: 220,
  valuePrefix: '',
});

const hoveredCi = ref<number | null>(null);

const vbWidth = 600;
const vbHeight = computed(() => props.height + 32);
const padLeft = 60;
const padRight = 16;
const padTop = 20;
const padBottom = 24;
const baselineY = computed(() => vbHeight.value - padBottom);

const maxValue = computed(() => {
  const all = props.series.flatMap((s) => s.data);
  const max = Math.max(1, ...all);
  const magnitude = 10 ** Math.floor(Math.log10(max));
  return Math.ceil(max / (magnitude / 2)) * (magnitude / 2);
});

const yTicks = computed(() => {
  const steps = [0, 0.5, 1];
  const ticks = steps.map((f) => ({
    value: Math.round(maxValue.value * f),
    y: baselineY.value - f * (baselineY.value - padTop),
  }));
  const deduped = ticks.filter((t, i) => i === 0 || t.value !== ticks[i - 1]?.value);
  return deduped.map((t) => ({ ...t, label: formatAxisValue(t.value) }));
});

function formatAxisValue(v: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 1 }).format(Number(v || 0));
}

function formatValue(v: number) {
  return new Intl.NumberFormat('en-US').format(Number(v || 0));
}

const groupWidth = computed(() => (vbWidth - padLeft - padRight) / Math.max(1, props.categories.length - 1));

function categoryCenterX(ci: number) {
  return padLeft + groupWidth.value * ci;
}

function categoryCenterXPercent(ci: number) {
  return (categoryCenterX(ci) / vbWidth) * 100;
}

function getY(val: number) {
  const frac = val / maxValue.value;
  const h = Math.max(0, frac * (baselineY.value - padTop));
  return baselineY.value - h;
}

// Generate a smooth cubic bezier path through the data points using Catmull-Rom spline to Bezier conversion
function seriesPath(si: number) {
  const data = props.series[si]?.data;
  if (!data || !data.length) return '';
  
  const pts = data.map((val, ci) => ({ x: categoryCenterX(ci), y: getY(val || 0) }));
  
  let d = `M${pts[0]!.x},${pts[0]!.y}`;
  const tension = 0.2; // Smoothness factor
  
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = i === 0 ? pts[0]! : pts[i - 1]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = i + 2 < pts.length ? pts[i + 2]! : p2;
    
    // Catmull-Rom to Cubic Bezier conversion
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;
    
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

function seriesAreaPath(si: number) {
  const data = props.series[si]?.data;
  if (!data || !data.length) return '';
  
  const dLine = seriesPath(si);
  const firstX = categoryCenterX(0);
  const lastX = categoryCenterX(data.length - 1);
  const base = baselineY.value;
  
  return `${dLine} L${lastX},${base} L${firstX},${base} Z`;
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
  font-size: 11px;
  font-weight: 500;
  fill: #94a3b8;
}
:global(.dark) .viz-root :deep(.axis-label) {
  fill: #64748b;
}
</style>
