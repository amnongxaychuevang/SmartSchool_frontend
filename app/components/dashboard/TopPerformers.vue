<template>
  <div
    class="glass-panel p-4 flex flex-col gap-3 page-enter min-w-0"
    style="animation-delay: 0.65s"
  >
    <div class="flex items-center justify-between gap-2">
      <h3 class="text-sm font-bold text-white flex items-center gap-2">
        <span class="w-1.5 h-5 bg-amber-500 rounded-full" />
        {{ $t('admin.top_performers') }}
      </h3>
      <div class="flex items-center gap-1">
        <template v-if="canScroll">
          <button
            type="button"
            class="w-7 h-7 rounded border border-line text-ink-muted hover:text-ink hover:bg-surface-2 flex items-center justify-center"
            :aria-label="$t('common.prev')"
            @click="step(-1)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4" aria-hidden="true">
              <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.83 10l3.94 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            class="w-7 h-7 rounded border border-line text-ink-muted hover:text-ink hover:bg-surface-2 flex items-center justify-center"
            :aria-label="$t('common.next')"
            @click="step(1)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4" aria-hidden="true">
              <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.17 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
            </svg>
          </button>
        </template>
        <NuxtLink
          to="/admin/students"
          class="ml-2 text-xs text-teal-400 hover:text-teal-300 transition-colors"
        >
          {{ $t('admin.view_all') }} →
        </NuxtLink>
      </div>
    </div>

    <LoadingSpinner v-if="loading" size="sm" padding="py-8" />
    <div
      v-else-if="classesData.length === 0"
      class="text-center text-slate-500 py-8 text-sm"
    >
      {{ $t('admin.no_data') }}
    </div>
    <!--
      One card per class (its top 3), side by side. Auto-advances one card every
      few seconds; pauses while hovered/focused/touched, and never under reduced motion.
    -->
    <div
      v-else
      ref="track"
      class="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1 no-scrollbar"
      @mouseenter="paused = true"
      @mouseleave="paused = false"
      @focusin="paused = true"
      @focusout="paused = false"
      @touchstart.passive="paused = true"
      @touchend.passive="resumeLater"
      @scroll.passive="updateCanScroll"
    >
      <div
        v-for="classGroup in classesData"
        :key="classGroup.className"
        data-card
        class="snap-start shrink-0 w-[85%] sm:w-[calc(50%-0.375rem)] 2xl:w-[calc(33.333%-0.5rem)] rounded-lg bg-slate-800/30 p-3 border border-slate-700/40"
      >
        <h4 class="text-sm font-bold text-teal-300 mb-2">
          {{ locale === 'lo' ? classGroup.classNameLo : classGroup.classNameEn }}
        </h4>
        <div class="space-y-1.5">
          <div
            v-for="(student, idx) in classGroup.topStudents"
            :key="student.studentId"
            class="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-800/50"
          >
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <div
                class="w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                :class="getRankColor(Number(idx))"
              >
                {{ Number(idx) + 1 }}
              </div>
              <p class="text-xs font-semibold text-white truncate">
                {{ locale === 'lo' ? student.fullNameLo : student.fullNameEn }}
              </p>
            </div>
            <span
              class="shrink-0 px-2 py-0.5 text-xs font-bold rounded-md tnum"
              :class="getGradeColor(Number(student.averageGrade) || 0)"
            >
              {{ (Number(student.averageGrade) || 0).toFixed(1) }}%
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSocket } from '../../composables/useSocket';
import { adminRepository } from '../../infrastructure/api/AdminRepository';

const { locale } = useI18n();
const { topPerformersData } = useSocket();
const loading = ref(false);
const classesData = ref<any[]>([]);

const AUTO_MS = 3500;
const track = ref<HTMLElement | null>(null);
const paused = ref(false);
const canScroll = ref(false);
let timer: ReturnType<typeof setInterval> | null = null;
let resumeTimer: ReturnType<typeof setTimeout> | null = null;

function getRankColor(rank: number) {
  const colors = [
    'bg-gradient-to-br from-amber-500 to-yellow-500',
    'bg-gradient-to-br from-slate-400 to-gray-500',
    'bg-gradient-to-br from-orange-600 to-red-700',
  ];
  return colors[rank] || colors[2];
}

function getGradeColor(grade: number) {
  if (grade >= 90) return 'bg-emerald-500/30 text-emerald-300';
  if (grade >= 80) return 'bg-teal-500/30 text-teal-300';
  if (grade >= 70) return 'bg-blue-500/30 text-blue-300';
  return 'bg-slate-500/30 text-slate-300';
}

function updateCanScroll() {
  const el = track.value;
  canScroll.value = !!el && el.scrollWidth > el.clientWidth + 2;
}

/** Move one card left/right; past the end wraps to the start (and vice versa). */
function step(dir: 1 | -1) {
  const el = track.value;
  if (!el) return;
  const card = el.querySelector<HTMLElement>('[data-card]');
  const width = card ? card.offsetWidth + 12 : el.clientWidth;
  const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
  const atStart = el.scrollLeft <= 4;
  if (dir === 1 && atEnd) el.scrollTo({ left: 0 });
  else if (dir === -1 && atStart) el.scrollTo({ left: el.scrollWidth });
  else el.scrollBy({ left: dir * width });
}

function resumeLater() {
  if (resumeTimer) clearTimeout(resumeTimer);
  resumeTimer = setTimeout(() => { paused.value = false; }, AUTO_MS);
}

function startAuto() {
  stopAuto();
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  timer = setInterval(() => {
    if (!paused.value && canScroll.value && !document.hidden) step(1);
  }, AUTO_MS);
}

function stopAuto() {
  if (timer) clearInterval(timer);
  timer = null;
}

async function fetchTopPerformers() {
  loading.value = true;
  try {
    const data = await adminRepository.getTopPerformers();
    classesData.value = data.classes || [];
  } catch (err) {
    console.error('Failed to fetch top performers:', err);
  } finally {
    loading.value = false;
  }
}

watch(topPerformersData, (newData) => {
  if (newData) {
    classesData.value = newData.classes;
  }
});

// Re-measure once the cards are in the DOM (and whenever the class list changes).
watch([classesData, loading], async () => {
  await nextTick();
  updateCanScroll();
});

onMounted(() => {
  fetchTopPerformers();
  startAuto();
  window.addEventListener('resize', updateCanScroll);
});

onBeforeUnmount(() => {
  stopAuto();
  if (resumeTimer) clearTimeout(resumeTimer);
  window.removeEventListener('resize', updateCanScroll);
});
</script>

<style scoped>
.no-scrollbar {
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
@media (prefers-reduced-motion: reduce) {
  .scroll-smooth { scroll-behavior: auto; }
}
</style>
