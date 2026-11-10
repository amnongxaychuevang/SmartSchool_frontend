<template>
  <section class="panel p-3 sm:p-4 flex flex-col gap-3" aria-labelledby="needs-attention-title">
    <div class="flex items-center justify-between gap-2">
      <h2 id="needs-attention-title" class="text-sm font-bold text-ink flex items-center gap-2">
        <span class="w-1.5 h-5 rounded-full" :class="total > 0 ? 'bg-warning' : 'bg-success'" />
        {{ $t('admin.needs_attention') }}
        <span
          v-if="total > 0"
          class="ml-1 min-w-[1.5rem] px-1.5 py-0.5 rounded-full bg-warning-soft text-warning text-xs font-bold text-center tnum"
        >{{ total }}</span>
      </h2>
      <p v-if="!loading && total === 0" class="text-xs text-success">{{ $t('admin.all_clear') }}</p>
    </div>

    <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-5 gap-2">
      <div v-for="n in 5" :key="n" class="h-[76px] rounded border border-line bg-surface-2 animate-pulse" />
    </div>

    <div v-else class="grid grid-cols-2 lg:grid-cols-5 gap-2">
      <NuxtLink
        v-for="item in items"
        :key="item.key"
        :to="META[item.key].to"
        class="group rounded border p-3 flex flex-col gap-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        :class="item.count > 0 ? TONE[META[item.key].tone] : 'border-line bg-surface hover:bg-surface-2'"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-[11px] font-semibold leading-tight" :class="item.count > 0 ? 'text-ink' : 'text-ink-muted'">
            {{ $t(`admin.attention.${item.key}`) }}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
            class="h-4 w-4 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5"
          >
            <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.17 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
          </svg>
        </div>
        <span class="text-2xl font-bold tnum" :class="item.count > 0 ? TEXT[META[item.key].tone] : 'text-ink-subtle'">
          {{ item.count }}
        </span>
        <span class="text-[11px] text-ink-muted truncate">
          {{ item.count > 0 ? hint(item) : '—' }}
        </span>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AttentionItem, AttentionKey } from '../../domain/models/School';
import { useFormat } from '../../composables/useFormat';

const props = defineProps<{ items: AttentionItem[]; loading?: boolean }>();

const { t } = useI18n();
const f = useFormat();

type Tone = 'warning' | 'danger';
// Money owed and students at risk are the costliest to leave waiting.
const META: Record<AttentionKey, { to: string; tone: Tone }> = {
  // Each link opens its list already filtered to what the count is about.
  studentLeaves: { to: '/admin/leaves?status=pending', tone: 'warning' },
  teacherLeaves: { to: '/admin/teacher-leaves?status=pending', tone: 'warning' },
  topUps: { to: '/admin/finance/top-ups?status=pending', tone: 'warning' },
  overdueInvoices: { to: '/admin/fees?status=overdue', tone: 'danger' },
  highRisk: { to: '/admin/analytics/at-risk?level=high', tone: 'danger' },
};
const TONE: Record<Tone, string> = {
  warning: 'border-warning-line bg-warning-soft hover:border-warning',
  danger: 'border-danger-line bg-danger-soft hover:border-danger',
};
const TEXT: Record<Tone, string> = { warning: 'text-warning', danger: 'text-danger' };

const total = computed(() => props.items.reduce((sum, i) => sum + i.count, 0));

const hint = (item: AttentionItem) =>
  t(`admin.attention_hint.${item.key}`, { amount: f.kip(item.amount ?? 0) });
</script>
