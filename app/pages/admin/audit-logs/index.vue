<template>
  <div class="flex flex-col gap-6">
    <!-- Filters -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-3">
      <div class="relative flex-1 max-w-xs">
        <input
          v-model="filters.userId"
          type="text"
          inputmode="numeric"
          placeholder="Filter by User ID..."
          class="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          @input="handleFilterChange"
        >
      </div>

      <select v-model="filters.action" class="filter-select" @change="handleFilterChange">
        <option value="">All actions</option>
        <option v-for="a in actionOptions" :key="a" :value="a">{{ actionLabel(a) }}</option>
      </select>

      <select v-model="filters.entityType" class="filter-select" @change="handleFilterChange">
        <option value="">All entities</option>
        <option v-for="e in entityTypeOptions" :key="e" :value="e">{{ e }}</option>
      </select>

      <button v-if="hasActiveFilters" class="text-xs text-slate-400 hover:text-white transition-colors px-2" @click="clearFilters">
        Clear filters
      </button>
    </div>

    <!-- Table -->
    <div class="glass-panel overflow-hidden">
      <div v-if="adminStore.auditLogsLoading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"/>
      </div>

      <div v-else-if="adminStore.auditLogs.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-500">
        <p>No audit log entries found.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-800">
              <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Time</th>
              <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Actor</th>
              <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Action</th>
              <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Entity</th>
              <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Detail</th>
              <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">IP</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            <tr v-for="log in adminStore.auditLogs" :key="log.auditId" class="hover:bg-slate-800/40 transition-colors">
              <td class="px-6 py-4 text-sm text-slate-400 whitespace-nowrap">
                {{ new Date(log.createdAt).toLocaleString() }}
              </td>
              <td class="px-6 py-4 text-sm text-white">
                <span v-if="log.user">{{ log.user.fullNameEn }}</span>
                <span v-else class="text-slate-500 italic">unknown (#{{ log.userId ?? '—' }})</span>
              </td>
              <td class="px-6 py-4 text-sm">
                <span :class="['inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold', actionBadgeClass(log.action)]">
                  {{ actionLabel(log.action) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-300">
                {{ log.entityType }}<span v-if="log.entityId" class="text-slate-500"> #{{ log.entityId }}</span>
              </td>
              <td class="px-6 py-4 text-xs text-slate-500 max-w-xs truncate" :title="log.detail ? JSON.stringify(log.detail) : ''">
                {{ log.detail ? JSON.stringify(log.detail) : '—' }}
              </td>
              <td class="px-6 py-4 text-xs text-slate-500 font-mono">
                {{ log.ipAddress ?? '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-4 border-t border-slate-800">
        <span class="text-sm text-slate-500">Page {{ adminStore.auditLogsPage }} of {{ totalPages }}</span>
        <div class="flex items-center gap-2">
          <button :disabled="adminStore.auditLogsPage === 1" class="px-3 py-1.5 rounded-lg text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50" @click="changePage(adminStore.auditLogsPage - 1)">Prev</button>
          <button :disabled="adminStore.auditLogsPage === totalPages" class="px-3 py-1.5 rounded-lg text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50" @click="changePage(adminStore.auditLogsPage + 1)">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue';
import { useAdminStore } from '../../../application/stores/admin';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Audit Log — Smart School Admin' });

const adminStore = useAdminStore();

const actionOptions = ['login', 'login_failed', 'logout', 'create', 'update', 'delete', 'approve', 'reject', 'status_change'];
const entityTypeOptions = ['user', 'wallet', 'wallet_transaction', 'top_up_request', 'spending_limit'];

const filters = reactive({ userId: '', action: '', entityType: '' });
let filterTimeout: ReturnType<typeof setTimeout>;

const totalPages = computed(() => Math.ceil(adminStore.auditLogsTotal / 20));
const hasActiveFilters = computed(() => !!(filters.userId || filters.action || filters.entityType));

onMounted(() => {
  adminStore.fetchAuditLogs();
});

const handleFilterChange = () => {
  clearTimeout(filterTimeout);
  filterTimeout = setTimeout(() => {
    adminStore.fetchAuditLogs({ ...filters, page: 1 });
  }, 350);
};

const clearFilters = () => {
  filters.userId = '';
  filters.action = '';
  filters.entityType = '';
  adminStore.fetchAuditLogs({ ...filters, page: 1 });
};

const changePage = (page: number) => {
  adminStore.fetchAuditLogs({ page });
};

const actionLabel = (action: string) => action.replace('_', ' ');

const actionBadgeClass = (action: string) => {
  switch (action) {
    case 'login':
    case 'approve':
      return 'bg-emerald-500/15 text-emerald-400';
    case 'login_failed':
    case 'delete':
    case 'reject':
      return 'bg-red-500/15 text-red-400';
    case 'create':
      return 'bg-teal-500/15 text-teal-400';
    case 'update':
    case 'status_change':
      return 'bg-amber-500/15 text-amber-400';
    case 'logout':
      return 'bg-slate-600/30 text-slate-400';
    default:
      return 'bg-slate-600/30 text-slate-300';
  }
};
</script>

<style scoped lang="postcss">
.filter-select {
  @apply px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500 transition-colors;
}
</style>
