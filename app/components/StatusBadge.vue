<script setup lang="ts">
/**
 * One badge for every record status, so "pending" or "overdue" looks and reads the
 * same on every page.
 *
 *   <StatusBadge :status="leave.status" />                      label from status.<code>
 *   <StatusBadge :status="loan.status" :label="$t('...')" />     custom label
 *   <StatusBadge status="custom" tone="info" :label="..." />     custom colour
 *
 * Colours follow DESIGN.md: success = done/active, warning = waiting, danger =
 * refused/late/broken, info = in progress, neutral = closed or unknown.
 */
export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const TONE: Record<string, StatusTone> = {
  active: 'success', approved: 'success', paid: 'success', sent: 'success', completed: 'success',
  returned: 'success', graded: 'success', present: 'success', onboard: 'success', configured: 'success',
  pending: 'warning', partial: 'warning', unpaid: 'warning', late: 'warning', upcoming: 'warning',
  draft: 'warning', frozen: 'warning',
  rejected: 'danger', overdue: 'danger', failed: 'danger', lost: 'danger', inactive: 'danger',
  absent: 'danger', missing: 'danger', cancelled: 'danger',
  graduated: 'info', borrowed: 'info', submitted: 'info', alighted: 'info', excused: 'info',
  deactivated: 'neutral', transferred: 'neutral',
};

const props = defineProps<{
  status: string;
  label?: string;
  tone?: StatusTone;
}>();

const { t, te } = useI18n();
const text = computed(() => props.label || (te(`status.${props.status}`) ? t(`status.${props.status}`) : props.status));
const cls = computed(() => `badge-${props.tone ?? TONE[props.status] ?? 'neutral'}`);
</script>

<template>
  <span :class="cls">{{ text }}</span>
</template>
