<template>
  <div class="flex flex-col gap-6">
    <PageHeader :eyebrow="$t('navSection.system')" :title="$t('audit_admin.title')" :subtitle="$t('audit_admin.subtitle')" />

    <div class="flex flex-wrap items-end gap-3">
      <div class="w-72">
        <label for="a-actor" class="block mb-1.5 text-xs font-semibold text-ink-muted">{{ $t('audit_admin.actor') }}</label>
        <UserPicker :key="pickerKey" v-model="actorId" input-id="a-actor" @update:model-value="apply" />
      </div>
      <select v-model="filters.action" class="input-field w-auto" :aria-label="$t('audit_admin.col_action')" @change="apply">
        <option value="">{{ $t('audit_admin.all_actions') }}</option>
        <option v-for="a in actions" :key="a" :value="a">{{ $t(`audit_admin.actions.${a}`) }}</option>
      </select>
      <select v-model="filters.entityType" class="input-field w-auto" :aria-label="$t('audit_admin.col_entity')" @change="apply">
        <option value="">{{ $t('audit_admin.all_entities') }}</option>
        <option v-for="e in entities" :key="e" :value="e">{{ $t(`audit_admin.entities.${e}`) }}</option>
      </select>
      <button v-if="hasFilters" type="button" class="btn-ghost" @click="clearFilters">{{ $t('audit_admin.clear') }}</button>
    </div>

    <section class="panel overflow-hidden">
      <LoadingSpinner v-if="adminStore.auditLogsLoading" />
      <p v-else-if="!adminStore.auditLogs.length" class="py-12 text-center text-sm text-ink-subtle">{{ $t('audit_admin.empty') }}</p>
      <div v-else class="overflow-x-auto">
        <table class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th>{{ $t('audit_admin.col_time') }}</th>
              <th>{{ $t('audit_admin.col_actor') }}</th>
              <th>{{ $t('audit_admin.col_action') }}</th>
              <th>{{ $t('audit_admin.col_entity') }}</th>
              <th>{{ $t('audit_admin.col_detail') }}</th>
              <th>{{ $t('audit_admin.col_ip') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in adminStore.auditLogs" :key="log.auditId">
              <td class="tnum whitespace-nowrap">{{ f.dateTime(log.createdAt) }}</td>
              <td>
                <span v-if="log.user" class="font-semibold">{{ locale === 'lo' ? log.user.fullNameLo : log.user.fullNameEn }}</span>
                <span v-else class="italic text-ink-subtle">{{ $t('audit_admin.unknown_actor') }}</span>
              </td>
              <td><span :class="actionBadge(log.action)">{{ te(`audit_admin.actions.${log.action}`) ? $t(`audit_admin.actions.${log.action}`) : log.action }}</span></td>
              <td>
                {{ te(`audit_admin.entities.${log.entityType}`) ? $t(`audit_admin.entities.${log.entityType}`) : log.entityType }}
                <span v-if="log.entityId" class="text-ink-subtle tnum">#{{ log.entityId }}</span>
              </td>
              <td class="max-w-xs truncate font-mono text-xs text-ink-subtle" :title="log.detail ? JSON.stringify(log.detail) : undefined">
                {{ log.detail ? JSON.stringify(log.detail) : '—' }}
              </td>
              <td class="font-mono text-xs text-ink-subtle">{{ log.ipAddress ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar :current-page="adminStore.auditLogsPage" :total-pages="totalPages" @update:page="(page) => adminStore.fetchAuditLogs({ page })" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAdminStore } from '../../../application/stores/admin';
import PageHeader from '../../../components/PageHeader.vue';
import PaginationBar from '../../../components/PaginationBar.vue';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import UserPicker from '../../../components/UserPicker.vue';
import { useFormat } from '../../../composables/useFormat';

definePageMeta({ layout: 'admin' });

const { t, te, locale } = useI18n();
const f = useFormat();
useHead({ title: () => t('audit_admin.title') });

const adminStore = useAdminStore();

// The values the backend writes (AuditAction enum; entity types used by the controllers).
const actions = ['login', 'login_failed', 'logout', 'create', 'update', 'delete', 'approve', 'reject', 'status_change'];
const entities = ['user', 'wallet', 'wallet_transaction', 'top_up_request', 'spending_limit'];

const actorId = ref<number | null>(null);
const pickerKey = ref(0); // remounts the picker to clear its text
const filters = reactive({ action: '', entityType: '' });
const totalPages = computed(() => Math.ceil(adminStore.auditLogsTotal / 20));
const hasFilters = computed(() => !!(actorId.value || filters.action || filters.entityType));

onMounted(() => adminStore.fetchAuditLogs());
const apply = () => adminStore.fetchAuditLogs({ ...filters, userId: actorId.value ? String(actorId.value) : '', page: 1 });
const clearFilters = () => {
  actorId.value = null;
  pickerKey.value++;
  Object.assign(filters, { action: '', entityType: '' });
  apply();
};

const actionBadge = (action: string) => {
  if (['login', 'approve', 'create'].includes(action)) return 'badge-success';
  if (['login_failed', 'delete', 'reject'].includes(action)) return 'badge-danger';
  if (['update', 'status_change'].includes(action)) return 'badge-warning';
  return 'badge-neutral';
};
</script>
