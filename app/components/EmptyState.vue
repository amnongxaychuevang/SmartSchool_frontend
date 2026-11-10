<script setup lang="ts">
/**
 * The one "nothing to show" block for the whole app: lists, tables, panels, widgets.
 *
 *   <EmptyState :title="$t('students.no_students')" />
 *   <EmptyState icon="search" :title="$t('common.no_results')" size="sm" />
 *   <EmptyState :title="..." :description="..." size="lg">
 *     <template #action><button class="btn-primary">...</button></template>
 *   </EmptyState>
 *
 * Sizes: sm = inside a widget or a small section (no icon), md = a list or table
 * area (default), lg = a whole page with nothing yet (bigger icon, room for a CTA).
 * For a table body use <EmptyRow :colspan="n" ... />.
 */
type Icon = 'inbox' | 'search' | 'document' | 'users' | 'calendar' | 'money' | 'book' | 'cart' | 'receipt' | 'building' | 'megaphone' | 'bell' | 'chat' | 'bus' | 'clock' | 'none';

const props = withDefaults(defineProps<{
  title?: string;
  description?: string;
  icon?: Icon;
  size?: 'sm' | 'md' | 'lg';
}>(), {
  title: '',
  description: '',
  icon: 'inbox',
  size: 'md',
});

const { t } = useI18n();
const heading = computed(() => props.title || t('common.no_data'));
const showIcon = computed(() => props.size !== 'sm' && props.icon !== 'none');

// Heroicons outline paths (24x24), stroke-based so they follow currentColor.
const ICONS: Record<Exclude<Icon, 'none'>, string> = {
  inbox: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4',
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  money: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
  book: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  cart: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
  receipt: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z',
  building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  bell: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  chat: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  bus: 'M8 7h8m-8 4h8m-9 6h.01M17 17h.01M5 4h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1zm1 14v2m12-2v2',
  clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  megaphone: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
};
const iconPath = computed(() => (props.icon === 'none' ? '' : ICONS[props.icon]));
</script>

<template>
  <div
    role="status"
    class="flex flex-col items-center justify-center text-center"
    :class="{
      'px-4 py-6': size === 'sm',
      'px-6 py-12': size === 'md',
      'px-6 py-16': size === 'lg',
    }"
  >
    <span
      v-if="showIcon"
      class="mb-3 flex items-center justify-center rounded-full bg-surface-2 text-ink-subtle"
      :class="size === 'lg' ? 'h-16 w-16' : 'h-12 w-12'"
      aria-hidden="true"
    >
      <slot name="icon">
        <svg xmlns="http://www.w3.org/2000/svg" :class="size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="iconPath" />
        </svg>
      </slot>
    </span>
    <p :class="size === 'sm' ? 'text-sm text-ink-subtle' : 'text-sm font-medium text-ink'">{{ heading }}</p>
    <p v-if="description" class="mt-1 max-w-sm text-xs text-ink-muted">{{ description }}</p>
    <div v-if="$slots.action" class="mt-4">
      <slot name="action" />
    </div>
  </div>
</template>
