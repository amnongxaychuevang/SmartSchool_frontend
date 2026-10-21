<template>
  <div class="flex flex-col gap-6">
    <PageHeader
      :eyebrow="$t('schools.eyebrow')"
      :title="$t('schools.title')"
      :subtitle="$t('schools.subtitle')"
    >
      <div class="flex items-center gap-3">
        <button type="button" class="btn-primary flex items-center gap-2" @click="openCreateModal">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>{{ $t('schools.add_school') }}</span>
        </button>
      </div>
    </PageHeader>

    <!-- Overview stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="panel p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted">{{ $t('schools.total_schools') }}</p>
          <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ overview.totalSchools }}</p>
        </div>
      </div>

      <div class="panel p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted">{{ $t('schools.active_tenants') }}</p>
          <p class="text-2xl font-bold text-emerald-500">{{ overview.activeSchools }}</p>
        </div>
      </div>

      <div class="panel p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted">{{ $t('schools.network_students') }}</p>
          <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ overview.totalStudentsAcrossNetwork }}</p>
        </div>
      </div>

      <div class="panel p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted">{{ $t('schools.network_teachers') }}</p>
          <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ overview.totalTeachersAcrossNetwork }}</p>
        </div>
      </div>
    </div>

    <!-- Active School Switcher for Super Admin -->
    <div class="panel p-4 bg-teal-500/5 border border-teal-500/20 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <div>
          <p class="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
            {{ $t('schools.active_context') }}
          </p>
          <p class="text-sm font-semibold text-slate-800 dark:text-white">
            {{ activeSchoolName }} <span class="text-xs font-normal text-ink-muted font-mono">({{ activeSchoolCode }})</span>
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <label class="text-xs text-ink-muted">{{ $t('schools.switch_school') }}:</label>
        <select v-model="selectedSchoolId" class="input-field w-auto text-xs font-semibold" @change="onSwitchSchool">
          <option v-for="s in schools" :key="s.schoolId" :value="s.schoolId">
            {{ locale === 'lo' ? s.nameLo : (s.nameEn || s.nameLo) }} ({{ s.schoolCode }})
          </option>
        </select>
      </div>
    </div>

    <!-- Schools Grid -->
    <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="s in schools"
        :key="s.schoolId"
        class="panel p-6 flex flex-col justify-between gap-4 transition-all hover:shadow-md"
        :class="s.schoolId === selectedSchoolId ? 'border-teal-500/50 ring-1 ring-teal-500/30' : ''"
      >
        <div>
          <!-- Header -->
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-base text-teal-500 border border-slate-200 dark:border-slate-700">
                {{ (s.nameLo || s.nameEn || '?').charAt(0) }}
              </div>
              <div>
                <h3 class="font-bold text-base text-slate-800 dark:text-white">
                  {{ locale === 'lo' ? s.nameLo : (s.nameEn || s.nameLo) }}
                </h3>
                <p class="text-xs text-ink-muted">
                  {{ locale === 'lo' ? s.nameEn : s.nameLo }}
                </p>
              </div>
            </div>
            <span
              class="badge text-xs px-2.5 py-0.5 rounded-full font-bold uppercase whitespace-nowrap"
              :class="planBadgeClass(s.plan)"
            >
              {{ planLabel(s.plan) }}
            </span>
          </div>

          <!-- Slug & Info -->
          <div class="space-y-1.5 text-xs text-ink-muted pt-2 border-t border-slate-100 dark:border-slate-800">
            <p>
              <span class="font-semibold text-slate-700 dark:text-slate-300">{{ $t('schools.school_code') }}:</span>
              <span class="font-mono text-teal-500 font-semibold ml-1">{{ s.schoolCode }}</span>
            </p>
            <p>
              <span class="font-semibold text-slate-700 dark:text-slate-300">{{ $t('schools.phone') }}:</span>
              <span class="ml-1">{{ s.phone || '—' }}</span>
            </p>
            <p>
              <span class="font-semibold text-slate-700 dark:text-slate-300">{{ $t('schools.email') }}:</span>
              <span class="ml-1">{{ s.email || '—' }}</span>
            </p>
            <p>
              <span class="font-semibold text-slate-700 dark:text-slate-300">{{ $t('schools.address_label') }}:</span>
              <span class="ml-1">{{ (locale === 'lo' ? s.addressLo : s.addressEn) || s.addressLo || '—' }}</span>
            </p>
          </div>

          <!-- Quota bar -->
          <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div class="flex justify-between text-xs mb-1">
              <span class="text-ink-muted">{{ $t('schools.student_quota') }}</span>
              <span class="font-mono font-bold">{{ s.stats?.studentCount || 0 }} / {{ s.maxStudents }}</span>
            </div>
            <div class="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                class="h-full rounded-full bg-teal-500 transition-all"
                :style="{ width: `${Math.min(100, ((s.stats?.studentCount || 0) / s.maxStudents) * 100)}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            class="text-xs font-semibold"
            :class="s.schoolId === selectedSchoolId ? 'text-teal-500' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'"
            @click="selectSchool(s)"
          >
            {{ s.schoolId === selectedSchoolId ? `✓ ${$t('schools.current_school')}` : $t('schools.switch_to_this') }}
          </button>

          <div class="flex gap-2">
            <button type="button" class="btn-secondary text-xs px-2.5 py-1" @click="openEditModal(s)">
              {{ $t('common.edit') }}
            </button>
            <button
              v-if="schools.length > 1"
              type="button"
              class="btn-danger text-xs px-2.5 py-1"
              @click="deleteSchool(s.schoolId)"
            >
              {{ $t('common.delete') }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal: Create / Edit School -->
    <AppModal
      :open="modalOpen"
      :title="editingId ? $t('schools.modal_edit_title') : $t('schools.modal_create_title')"
      @update:open="modalOpen = $event"
    >
      <form class="flex flex-col gap-4" @submit.prevent="submitSchool">
        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('schools.school_code') }} *</label>
          <input
            v-model.trim="form.schoolCode"
            type="text"
            class="input-field font-mono"
            required
            :disabled="!!editingId"
            :placeholder="$t('schools.school_code_ph')"
          />
        </div>

        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('schools.school_name_lo') }} *</label>
          <input v-model.trim="form.nameLo" type="text" class="input-field" required :placeholder="$t('schools.school_name_lo_ph')" />
        </div>

        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('schools.school_name_en') }} *</label>
          <input v-model.trim="form.nameEn" type="text" class="input-field" required :placeholder="$t('schools.school_name_en_ph')" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-1.5 text-sm font-semibold">{{ $t('schools.saas_plan') }} *</label>
            <select v-model="form.plan" class="input-field" required>
              <option value="trial">{{ $t('schools.plan_trial') }}</option>
              <option value="standard">{{ $t('schools.plan_standard') }}</option>
              <option value="enterprise">{{ $t('schools.plan_enterprise') }}</option>
            </select>
          </div>
          <div>
            <label class="block mb-1.5 text-sm font-semibold">{{ $t('schools.max_students') }} *</label>
            <input v-model.number="form.maxStudents" type="number" min="50" max="10000" class="input-field" required />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-1.5 text-sm font-semibold">{{ $t('schools.phone') }}</label>
            <input v-model.trim="form.phone" type="text" class="input-field font-mono" :placeholder="$t('schools.phone_ph')" />
          </div>
          <div>
            <label class="block mb-1.5 text-sm font-semibold">{{ $t('schools.email') }}</label>
            <input v-model.trim="form.email" type="email" class="input-field" :placeholder="$t('schools.email_ph')" />
          </div>
        </div>

        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('schools.address_label') }}</label>
          <input v-model.trim="form.addressLo" type="text" class="input-field" :placeholder="$t('schools.address_ph')" />
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button type="button" class="btn-secondary" @click="modalOpen = false">{{ $t('common.cancel') }}</button>
          <button type="submit" class="btn-primary" :disabled="saving">
            {{ saving ? $t('schools.saving') : $t('schools.save_school') }}
          </button>
        </div>
      </form>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import PageHeader from '../../../components/PageHeader.vue';
import AppModal from '../../../components/AppModal.vue';
import { useApiClient } from '../../../infrastructure/api/apiClient';
import { API_ENDPOINTS } from '../../../infrastructure/api/endpoints';

definePageMeta({ layout: 'admin' });

const { locale, t } = useI18n();
const apiClient = useApiClient();

const overview = ref({
  totalSchools: 0,
  activeSchools: 0,
  totalStudentsAcrossNetwork: 0,
  totalTeachersAcrossNetwork: 0,
});

const schools = ref<any[]>([]);
const selectedSchoolId = ref<number>(1);
const modalOpen = ref(false);
const editingId = ref<number | null>(null);
const saving = ref(false);

const form = reactive({
  schoolCode: '',
  nameLo: '',
  nameEn: '',
  plan: 'standard',
  maxStudents: 500,
  phone: '',
  email: '',
  addressLo: '',
});

const activeSchool = computed(() => {
  return schools.value.find((s) => s.schoolId === selectedSchoolId.value) || schools.value[0];
});

const activeSchoolName = computed(() => {
  if (!activeSchool.value) return 'Default School';
  return locale.value === 'lo' ? activeSchool.value.nameLo : (activeSchool.value.nameEn || activeSchool.value.nameLo);
});

const activeSchoolCode = computed(() => {
  return activeSchool.value?.schoolCode || 'main';
});

const planLabel = (plan: string) => {
  switch (plan) {
    case 'enterprise': return t('schools.plan_enterprise');
    case 'standard': return t('schools.plan_standard');
    default: return t('schools.plan_trial');
  }
};

const planBadgeClass = (plan: string) => {
  switch (plan) {
    case 'enterprise': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
    case 'standard': return 'bg-teal-500/10 text-teal-400 border border-teal-500/20';
    default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
  }
};

const fetchOverview = async () => {
  try {
    const res = await apiClient<any>(API_ENDPOINTS.schools.overview, { method: 'GET' });
    if (res?.data) overview.value = res.data;
    else if (res) overview.value = res;
  } catch (err) {
    console.error('Error fetching schools overview:', err);
  }
};

const fetchSchools = async () => {
  try {
    const res = await apiClient<any>(API_ENDPOINTS.schools.list, { method: 'GET' });
    const list = res?.data?.schools || res?.schools;
    if (list) {
      schools.value = list;
      if (!selectedSchoolId.value && schools.value.length) {
        selectedSchoolId.value = schools.value[0].schoolId;
      }
    }
  } catch (err) {
    console.error('Error fetching schools:', err);
  }
};

const selectSchool = (s: any) => {
  selectedSchoolId.value = s.schoolId;
  if (import.meta.client) {
    localStorage.setItem('x-school-id', String(s.schoolId));
  }
};

const onSwitchSchool = () => {
  if (import.meta.client) {
    localStorage.setItem('x-school-id', String(selectedSchoolId.value));
  }
};

const openCreateModal = () => {
  editingId.value = null;
  form.schoolCode = '';
  form.nameLo = '';
  form.nameEn = '';
  form.plan = 'standard';
  form.maxStudents = 500;
  form.phone = '';
  form.email = '';
  form.addressLo = '';
  modalOpen.value = true;
};

const openEditModal = (s: any) => {
  editingId.value = s.schoolId;
  form.schoolCode = s.schoolCode;
  form.nameLo = s.nameLo;
  form.nameEn = s.nameEn;
  form.plan = s.plan || 'standard';
  form.maxStudents = s.maxStudents || 500;
  form.phone = s.phone || '';
  form.email = s.email || '';
  form.addressLo = s.addressLo || '';
  modalOpen.value = true;
};

const submitSchool = async () => {
  saving.value = true;
  try {
    if (editingId.value) {
      await apiClient(`${API_ENDPOINTS.schools.list}/${editingId.value}`, { method: 'PUT', body: form });
    } else {
      await apiClient(API_ENDPOINTS.schools.list, { method: 'POST', body: form });
    }
    modalOpen.value = false;
    await fetchSchools();
    await fetchOverview();
  } catch (err: any) {
    alert(err?.data?.message || err?.message || 'Error saving school');
  } finally {
    saving.value = false;
  }
};

const deleteSchool = async (id: number) => {
  if (!confirm(t('schools.confirm_delete_school'))) return;
  try {
    await apiClient(`${API_ENDPOINTS.schools.list}/${id}`, { method: 'DELETE' });
    await fetchSchools();
    await fetchOverview();
  } catch (err) {
    console.error('Error deleting school:', err);
  }
};

onMounted(() => {
  if (import.meta.client) {
    const saved = localStorage.getItem('x-school-id');
    if (saved) selectedSchoolId.value = parseInt(saved, 10);
  }
  fetchOverview();
  fetchSchools();
});
</script>
