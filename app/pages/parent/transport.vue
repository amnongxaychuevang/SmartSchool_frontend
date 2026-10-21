<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="$t('parent_transport.title')" :subtitle="$t('parent_transport.subtitle')">
      <select v-if="parentStore.children.length > 1" v-model="selectedChildId" class="input-field w-auto" :aria-label="$t('parentPortal.select_child')" @change="loadChild">
        <option v-for="child in parentStore.children" :key="child.studentId" :value="child.studentId">{{ personName(child) }}</option>
      </select>
    </PageHeader>

    <p v-if="loadError" role="alert" class="panel border-danger-line bg-danger-soft text-danger px-4 py-3 text-sm">{{ loadError }}</p>
    <LoadingSpinner v-if="loading" />

    <template v-else-if="data">
      <p v-if="!data.assignment" class="panel p-12 text-center text-sm text-ink-subtle">{{ $t('parent_transport.not_assigned') }}</p>

      <template v-else>
        <!-- Today's status -->
        <section class="panel p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('parent_transport.today') }}</p>
            <p class="mt-1 text-lg font-bold">{{ todayStatus.label }}</p>
            <p v-if="todayStatus.time" class="text-sm text-ink-muted tnum">{{ todayStatus.time }}</p>
          </div>
          <span :class="todayStatus.badge">{{ todayStatus.badgeText }}</span>
        </section>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section class="panel p-5 flex flex-col gap-3">
            <h2 class="text-sm font-semibold">{{ $t('parent_transport.route') }}</h2>
            <p class="text-lg font-bold">{{ pick(data.assignment.route.routeNameLo, data.assignment.route.routeNameEn) }}</p>
            <dl class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt class="text-xs text-ink-muted">{{ $t('transport.pickup_stop') }}</dt>
                <dd class="font-semibold">{{ data.assignment.pickupStop || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-ink-muted">{{ $t('transport.dropoff_stop') }}</dt>
                <dd class="font-semibold">{{ data.assignment.dropoffStop || '—' }}</dd>
              </div>
            </dl>
            <ol v-if="data.assignment.route.stops?.length" class="mt-2 flex flex-col gap-2 border-l-2 border-line pl-4">
              <li v-for="(stop, i) in data.assignment.route.stops" :key="i" class="text-sm flex justify-between gap-3">
                <span>{{ pick(stop.nameLo, stop.nameEn) }}</span>
                <span class="text-ink-muted tnum">{{ stop.time || '' }}</span>
              </li>
            </ol>
          </section>

          <section class="panel p-5 flex flex-col gap-3">
            <h2 class="text-sm font-semibold">{{ $t('parent_transport.vehicle') }}</h2>
            <template v-if="vehicle">
              <p class="text-lg font-bold">{{ vehicle.plateNumber }}<span v-if="vehicle.model" class="ml-2 text-sm font-normal text-ink-muted">{{ vehicle.model }}</span></p>
              <div class="text-sm">
                <p class="text-xs text-ink-muted">{{ $t('transport.driver') }}</p>
                <p class="font-semibold">{{ vehicle.driverName }}</p>
                <a :href="`tel:${vehicle.driverPhone}`" class="text-primary-ink hover:underline tnum">{{ vehicle.driverPhone }}</a>
              </div>
            </template>
            <p v-else class="text-sm text-ink-subtle">—</p>
          </section>
        </div>
      </template>

      <section class="panel overflow-hidden">
        <h2 class="px-5 py-4 text-sm font-semibold border-b border-line">{{ $t('parent_transport.recent_rides') }}</h2>
        <p v-if="!data.logs.length" class="py-12 text-center text-sm text-ink-subtle">{{ $t('transport.empty_logs') }}</p>
        <div v-else class="overflow-x-auto">
          <table class="data-table w-full min-w-max">
            <thead>
              <tr>
                <th>{{ $t('transport.col_time') }}</th>
                <th>{{ $t('transport.col_action') }}</th>
                <th>{{ $t('transport.col_direction') }}</th>
                <th>{{ $t('transport.col_vehicle') }}</th>
                <th>{{ $t('transport.col_location') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in data.logs" :key="log.logId">
                <td class="tnum whitespace-nowrap">{{ fmt.dateTime(log.logTime) }}</td>
                <td><span :class="log.logType === 'board' ? 'badge-success' : 'badge-slate'">{{ log.logType === 'board' ? $t('transport.board_action') : $t('transport.alight_action') }}</span></td>
                <td>{{ log.direction === 'to_school' ? $t('transport.to_school') : $t('transport.to_home') }}</td>
                <td class="tnum">{{ log.vehicle?.plateNumber || '—' }}</td>
                <td class="text-ink-muted">{{ log.location || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PageHeader from '../../components/PageHeader.vue';
import LoadingSpinner from '../../components/LoadingSpinner.vue';
import { useParentStore } from '../../application/stores/parent';
import { parentRepository, type ChildTransport } from '../../infrastructure/api/ParentRepository';

definePageMeta({ layout: 'parent' });

const { t, locale } = useI18n();
const fmt = useFormat();
useHead({ title: () => `${t('parent_transport.title')} — ${t('parentPortal.title')}` });

const parentStore = useParentStore();
const selectedChildId = ref<number | null>(null);
const loading = ref(true);
const loadError = ref('');

const personName = (p: { fullNameEn: string; fullNameLo: string }) => (locale.value === 'lo' ? p.fullNameLo : p.fullNameEn) || p.fullNameEn;
const pick = (lo?: string | null, en?: string | null) => (locale.value === 'lo' ? lo || en : en || lo) || '';
const data = ref<ChildTransport | null>(null);
const vehicle = computed(() => data.value?.assignment?.vehicle ?? data.value?.assignment?.route.vehicle ?? null);

// Today's last scan decides where the child is now.
const todayStatus = computed(() => {
  const today = new Date().toDateString();
  const last = data.value?.logs.find((l) => new Date(l.logTime).toDateString() === today);
  if (!last) return { label: t('parent_transport.no_ride_today'), time: '', badge: 'badge-slate', badgeText: t('parent_transport.status_none') };
  const onBus = last.logType === 'board';
  return {
    label: onBus ? t('parent_transport.on_bus') : t('parent_transport.dropped_off'),
    time: fmt.dateTime(last.logTime),
    badge: onBus ? 'badge-warning' : 'badge-success',
    badgeText: last.direction === 'to_school' ? t('transport.to_school') : t('transport.to_home'),
  };
});

async function loadChild() {
  if (!selectedChildId.value) return;
  loadError.value = '';
  try {
    data.value = await parentRepository.getChildTransport(selectedChildId.value);
  } catch (err) {
    loadError.value = getErrorMessage(err);
  }
}

onMounted(async () => {
  try {
    await parentStore.fetchChildren();
    selectedChildId.value = parentStore.children[0]?.studentId ?? null;
    await loadChild();
  } catch (err) {
    loadError.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
});
</script>
