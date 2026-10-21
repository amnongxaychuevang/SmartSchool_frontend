<template>
  <div class="flex flex-col gap-6">
    <PageHeader
      :eyebrow="$t('at_risk.eyebrow')"
      :title="$t('at_risk.title')"
      :subtitle="$t('at_risk.subtitle')"
    >
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="btn-primary flex items-center gap-2"
          :disabled="runningAssessment"
          @click="runAssessment"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{{ runningAssessment ? $t('at_risk.running') : $t('at_risk.run_assessment') }}</span>
        </button>
      </div>
    </PageHeader>

    <!-- Top KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="panel p-4 flex items-center gap-4 border-l-4 border-rose-500">
        <div class="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted">{{ $t('at_risk.high_risk') }}</p>
          <p class="text-2xl font-extrabold text-rose-500">
            {{ overview.highRiskCount }} <span class="text-xs font-normal text-ink-muted">{{ $t('at_risk.students_unit') }}</span>
          </p>
        </div>
      </div>

      <div class="panel p-4 flex items-center gap-4 border-l-4 border-amber-500">
        <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted">{{ $t('at_risk.medium_risk') }}</p>
          <p class="text-2xl font-extrabold text-amber-500">
            {{ overview.mediumRiskCount }} <span class="text-xs font-normal text-ink-muted">{{ $t('at_risk.students_unit') }}</span>
          </p>
        </div>
      </div>

      <div class="panel p-4 flex items-center gap-4 border-l-4 border-emerald-500">
        <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted">{{ $t('at_risk.low_risk') }}</p>
          <p class="text-2xl font-extrabold text-emerald-500">
            {{ overview.lowRiskCount }} <span class="text-xs font-normal text-ink-muted">{{ $t('at_risk.students_unit') }}</span>
          </p>
        </div>
      </div>

      <div class="panel p-4 flex items-center gap-4 border-l-4 border-teal-500">
        <div class="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted">{{ $t('at_risk.pending_interventions') }}</p>
          <p class="text-2xl font-extrabold text-teal-500">{{ overview.pendingInterventions }}</p>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="panel p-4 flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-3">
        <select v-model="riskFilter" class="input-field w-auto text-xs" @change="fetchAssessments">
          <option value="">{{ $t('at_risk.all_levels') }}</option>
          <option value="high">🚨 {{ $t('at_risk.high_risk') }}</option>
          <option value="medium">⚠️ {{ $t('at_risk.medium_risk') }}</option>
          <option value="low">✓ {{ $t('at_risk.low_risk') }}</option>
        </select>
      </div>

      <p class="text-xs text-ink-muted">
        {{ $t('at_risk.evaluation_footnote') }}
      </p>
    </div>

    <!-- At-Risk Student Table -->
    <section class="panel overflow-hidden">
      <div class="overflow-x-auto">
        <table class="data-table w-full">
          <thead>
            <tr>
              <th>{{ $t('transport.col_student') }}</th>
              <th>{{ $t('at_risk.col_class_teacher') }}</th>
              <th>{{ $t('at_risk.col_level') }}</th>
              <th>{{ $t('at_risk.col_score') }}</th>
              <th>{{ $t('at_risk.col_factors') }}</th>
              <th>{{ $t('at_risk.col_teacher_notified') }}</th>
              <th class="text-right">{{ $t('transport.col_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loadingAssessments">
              <td colspan="7" class="text-center py-10 text-ink-muted">{{ $t('common.loading') }}</td>
            </tr>
            <tr v-else-if="!assessments.length">
              <td colspan="7" class="text-center py-10 text-ink-muted">
                {{ $t('at_risk.empty_assessments') }}
              </td>
            </tr>
            <tr v-for="item in assessments" :key="item.assessmentId">
              <td>
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {{ (item.student.fullNameLo || item.student.fullNameEn || '?').charAt(0) }}
                  </div>
                  <div>
                    <p class="font-bold text-sm text-slate-800 dark:text-white">
                      {{ locale === 'lo' ? item.student.fullNameLo : (item.student.fullNameEn || item.student.fullNameLo) }}
                    </p>
                    <p class="text-xs text-ink-muted font-mono">
                      {{ item.student.studentCode }} • {{ locale === 'lo' ? item.student.fullNameEn : item.student.fullNameLo }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <p class="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {{ (locale === 'lo' ? item.student.classStudents[0]?.class?.nameLo : item.student.classStudents[0]?.class?.nameEn) || '—' }}
                </p>
                <p class="text-[11px] text-ink-muted">
                  {{ $t('classes.teacher') }}: {{ (locale === 'lo' ? item.student.classStudents[0]?.class?.homeroomTeacher?.fullNameLo : item.student.classStudents[0]?.class?.homeroomTeacher?.fullNameEn) || $t('at_risk.no_teacher') }}
                </p>
              </td>
              <td>
                <span
                  class="badge text-xs px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap"
                  :class="riskLevelBadgeClass(item.riskLevel)"
                >
                  {{ riskLevelLabel(item.riskLevel) }}
                </span>
              </td>
              <td>
                <div class="flex items-center gap-2">
                  <div class="w-16 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all"
                      :class="riskBarColor(item.riskScore)"
                      :style="{ width: `${item.riskScore}%` }"
                    ></div>
                  </div>
                  <span class="font-bold text-xs font-mono">{{ item.riskScore }}/100</span>
                </div>
              </td>
              <td>
                <div class="flex flex-col gap-1 max-w-xs">
                  <span
                    v-for="(factor, idx) in item.factors"
                    :key="idx"
                    class="text-[11px] inline-flex items-center gap-1 text-slate-700 dark:text-slate-300"
                  >
                    <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="factorDotClass(factor.severity)"></span>
                    {{ locale === 'lo' ? factor.messageLo : (factor.messageEn || factor.messageLo) }}
                  </span>
                  <span v-if="!item.factors || !item.factors.length" class="text-xs text-ink-muted">
                    {{ $t('at_risk.no_risk_factors') }}
                  </span>
                </div>
              </td>
              <td>
                <span v-if="item.teacherNotified" class="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                  ✓ {{ $t('at_risk.notified_yes') }}
                </span>
                <span v-else class="text-xs text-ink-muted">—</span>
              </td>
              <td class="text-right">
                <div class="inline-flex gap-2">
                  <button
                    type="button"
                    class="btn-secondary text-xs px-2.5 py-1"
                    @click="openDetail(item.student.studentId)"
                  >
                    {{ $t('at_risk.view_detail') }}
                  </button>
                  <button
                    type="button"
                    class="btn-primary text-xs px-2.5 py-1"
                    @click="openIntervention(item.student.studentId, item.assessmentId)"
                  >
                    {{ $t('at_risk.add_intervention') }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Detail Drawer / Modal -->
    <AppModal :open="detailModalOpen" :title="$t('at_risk.modal_detail_title')" @update:open="detailModalOpen = $event">
      <div v-if="selectedStudentDetail" class="flex flex-col gap-6">
        <!-- Student Info -->
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">
              {{ locale === 'lo' ? selectedStudentDetail.student.fullNameLo : (selectedStudentDetail.student.fullNameEn || selectedStudentDetail.student.fullNameLo) }}
            </h3>
            <p class="text-xs text-ink-muted font-mono">
              {{ selectedStudentDetail.student.studentCode }} • {{ locale === 'lo' ? selectedStudentDetail.student.fullNameEn : selectedStudentDetail.student.fullNameLo }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-xs text-ink-muted">{{ $t('at_risk.conduct_score_label') }}</p>
            <p class="text-xl font-extrabold text-teal-500">{{ selectedStudentDetail.conductSummary?.finalScore }}/100</p>
          </div>
        </div>

        <!-- Triggers List -->
        <div v-if="selectedStudentDetail.latestAssessment?.factors?.length">
          <h4 class="font-bold text-sm mb-2 text-rose-500">{{ $t('at_risk.triggers_detected') }}</h4>
          <div class="space-y-2">
            <div
              v-for="(f, i) in selectedStudentDetail.latestAssessment.factors"
              :key="i"
              class="p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-xs text-slate-800 dark:text-white"
            >
              <p class="font-semibold">{{ locale === 'lo' ? f.messageLo : (f.messageEn || f.messageLo) }}</p>
              <p class="text-ink-muted mt-0.5">{{ locale === 'lo' ? f.messageEn : f.messageLo }} (Score: +{{ f.score }})</p>
            </div>
          </div>
        </div>

        <!-- Interventions history -->
        <div>
          <h4 class="font-bold text-sm mb-2">{{ $t('at_risk.interventions_history') }}</h4>
          <div v-if="!selectedStudentDetail.interventions?.length" class="text-xs text-ink-muted py-2">
            {{ $t('at_risk.no_interventions') }}
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="inv in selectedStudentDetail.interventions"
              :key="inv.interventionId"
              class="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-center"
            >
              <div>
                <p class="font-bold">{{ inv.title }}</p>
                <p class="text-ink-muted">{{ inv.description }}</p>
              </div>
              <span class="badge text-xs px-2 py-0.5 rounded font-bold bg-teal-500/10 text-teal-400">
                {{ inv.status }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
          <button type="button" class="btn-secondary" @click="detailModalOpen = false">{{ $t('common.close') }}</button>
        </div>
      </div>
    </AppModal>

    <!-- Modal: Add Intervention -->
    <AppModal :open="interventionModalOpen" :title="$t('at_risk.intervention_title')" @update:open="interventionModalOpen = $event">
      <form class="flex flex-col gap-4" @submit.prevent="submitIntervention">
        <p class="text-xs text-ink-muted">
          {{ $t('at_risk.create_intervention_desc') }}
        </p>

        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('at_risk.intervention_title_label') }} *</label>
          <input
            v-model.trim="interventionForm.title"
            type="text"
            class="input-field"
            required
            :placeholder="$t('at_risk.intervention_title_ph')"
          />
        </div>

        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('at_risk.intervention_type_label') }} *</label>
          <select v-model="interventionForm.type" class="input-field" required>
            <option value="academic">{{ $t('at_risk.type_academic') }}</option>
            <option value="behavioral">{{ $t('at_risk.type_behavioral') }}</option>
            <option value="attendance">{{ $t('at_risk.type_attendance') }}</option>
            <option value="parent">{{ $t('at_risk.type_parent') }}</option>
          </select>
        </div>

        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('at_risk.description_label') }}</label>
          <textarea
            v-model.trim="interventionForm.description"
            class="input-field"
            rows="3"
            :placeholder="$t('at_risk.description_ph')"
          ></textarea>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button type="button" class="btn-secondary" @click="interventionModalOpen = false">{{ $t('common.cancel') }}</button>
          <button type="submit" class="btn-primary" :disabled="submittingIntervention">
            {{ submittingIntervention ? $t('common.loading') : $t('common.save') }}
          </button>
        </div>
      </form>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import PageHeader from '../../../components/PageHeader.vue';
import AppModal from '../../../components/AppModal.vue';
import { useApiClient } from '../../../infrastructure/api/apiClient';
import { API_ENDPOINTS } from '../../../infrastructure/api/endpoints';

definePageMeta({ layout: 'admin' });

const { locale, t } = useI18n();
const apiClient = useApiClient();

const overview = ref({
  totalAssessed: 0,
  highRiskCount: 0,
  mediumRiskCount: 0,
  lowRiskCount: 0,
  pendingInterventions: 0,
});

const assessments = ref<any[]>([]);
const riskFilter = ref('');
const loadingAssessments = ref(false);
const runningAssessment = ref(false);

const detailModalOpen = ref(false);
const selectedStudentDetail = ref<any>(null);

const interventionModalOpen = ref(false);
const submittingIntervention = ref(false);
const interventionForm = reactive({
  studentId: 0,
  assessmentId: undefined as number | undefined,
  title: '',
  description: '',
  type: 'academic',
});

const riskLevelLabel = (lvl: string) => {
  switch (lvl) {
    case 'high': return t('at_risk.high_risk');
    case 'medium': return t('at_risk.medium_risk');
    default: return t('at_risk.low_risk');
  }
};

const riskLevelBadgeClass = (lvl: string) => {
  switch (lvl) {
    case 'high': return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
    case 'medium': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
    default: return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
  }
};

const riskBarColor = (score: number) => {
  if (score >= 60) return 'bg-rose-500';
  if (score >= 35) return 'bg-amber-500';
  return 'bg-emerald-500';
};

const factorDotClass = (sev: string) => {
  switch (sev) {
    case 'high': return 'bg-rose-500';
    case 'medium': return 'bg-amber-500';
    default: return 'bg-blue-400';
  }
};

const fetchOverview = async () => {
  try {
    const res = await apiClient<any>(API_ENDPOINTS.analytics.atRiskOverview, { method: 'GET' });
    if (res?.data) overview.value = res.data;
    else if (res) overview.value = res;
  } catch (err) {
    console.error('Error fetching at-risk overview:', err);
  }
};

const fetchAssessments = async () => {
  loadingAssessments.value = true;
  try {
    const query: any = {};
    if (riskFilter.value) query.riskLevel = riskFilter.value;
    const res = await apiClient<any>(API_ENDPOINTS.analytics.atRisk, { method: 'GET', query });
    const list = res?.data?.assessments || res?.assessments;
    if (list) assessments.value = list;
  } catch (err) {
    console.error('Error fetching assessments:', err);
  } finally {
    loadingAssessments.value = false;
  }
};

const runAssessment = async () => {
  runningAssessment.value = true;
  try {
    const res = await apiClient<any>(API_ENDPOINTS.analytics.atRiskRun, { method: 'POST', body: {} });
    const count = res?.data?.count ?? res?.data?.totalAssessed ?? res?.count ?? res?.totalAssessed ?? 0;
    alert(t('at_risk.assessment_done', { count }));
    await fetchOverview();
    await fetchAssessments();
  } catch (err: any) {
    alert(err?.data?.message || err?.message || 'Error running assessment');
  } finally {
    runningAssessment.value = false;
  }
};

const openDetail = async (studentId: number) => {
  try {
    const res = await apiClient<any>(`${API_ENDPOINTS.analytics.atRisk}/${studentId}`, { method: 'GET' });
    const detail = res?.data || res;
    if (detail) {
      selectedStudentDetail.value = detail;
      detailModalOpen.value = true;
    }
  } catch (err) {
    console.error('Error fetching student risk detail:', err);
  }
};

const openIntervention = (studentId: number, assessmentId?: number) => {
  interventionForm.studentId = studentId;
  interventionForm.assessmentId = assessmentId;
  interventionForm.title = '';
  interventionForm.description = '';
  interventionForm.type = 'academic';
  interventionModalOpen.value = true;
};

const submitIntervention = async () => {
  submittingIntervention.value = true;
  try {
    await apiClient(API_ENDPOINTS.analytics.interventions, { method: 'POST', body: interventionForm });
    interventionModalOpen.value = false;
    await fetchOverview();
    if (detailModalOpen.value && selectedStudentDetail.value) {
      await openDetail(selectedStudentDetail.value.student.studentId);
    }
  } catch (err: any) {
    alert(err?.data?.message || 'Error creating intervention');
  } finally {
    submittingIntervention.value = false;
  }
};

onMounted(() => {
  fetchOverview();
  fetchAssessments();
});
</script>
