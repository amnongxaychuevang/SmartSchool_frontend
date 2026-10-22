<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="$t('assignments.title')" :subtitle="$t('assignments.parent_subtitle')">
      <select v-if="parentStore.children.length > 1" v-model="selectedChildId" class="input-field w-auto" :aria-label="$t('parentPortal.select_child')" @change="loadChild">
        <option v-for="child in parentStore.children" :key="child.studentId" :value="child.studentId">{{ personName(child) }}</option>
      </select>
    </PageHeader>

    <p v-if="loadError" role="alert" class="panel border-danger-line bg-danger-soft text-danger px-4 py-3 text-sm">{{ loadError }}</p>
    <LoadingSpinner v-if="loading" />

    <template v-else-if="selectedChildId">
      <p v-if="!assignments.length" class="panel p-12 text-center text-sm text-ink-subtle">{{ $t('assignments.empty') }}</p>
      <template v-for="group in groups" :key="group.id">
        <section v-if="group.items.length" class="panel overflow-hidden">
          <h2 class="px-5 py-4 text-sm font-semibold border-b border-line">{{ group.label }}</h2>
          <ul class="divide-y divide-line">
            <li v-for="a in group.items" :key="a.assignmentId" class="px-5 py-4 flex flex-col gap-3">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <p class="font-semibold text-base">{{ a.title }}</p>
                    <!-- Status Badge -->
                    <span
                      class="badge text-xs px-2 py-0.5"
                      :class="{
                        'badge-success': a.mySubmission?.status === 'graded',
                        'badge-info': a.mySubmission?.status === 'submitted',
                        'badge-warning': a.mySubmission?.status === 'late',
                        'badge-neutral': !a.mySubmission
                      }"
                    >
                      {{ a.mySubmission ? $t(`assignments.${a.mySubmission.status}`) : $t('assignments.not_submitted') }}
                    </span>
                  </div>
                  <p class="text-xs text-ink-muted mt-0.5">
                    {{ a.subject ? pick(a.subject.subjectNameLo, a.subject.subjectNameEn) : $t('assignments.no_subject') }}
                    <template v-if="a.creator"> · {{ pick(a.creator.fullNameLo, a.creator.fullNameEn) }}</template>
                  </p>
                  <p v-if="a.description" class="text-sm text-ink-muted mt-2 whitespace-pre-line">{{ a.description }}</p>
                </div>

                <div class="text-right shrink-0">
                  <p class="text-sm font-semibold tnum">{{ fmt.date(a.dueDate) }}</p>
                  <p class="text-xs" :class="group.id === 'upcoming' && daysLeft(a.dueDate) <= 1 ? 'text-danger font-semibold' : 'text-ink-muted'">{{ dueLabel(a.dueDate) }}</p>
                </div>
              </div>

              <!-- Submission details & actions card -->
              <div class="p-3 rounded-lg bg-surface-subtle border border-line flex flex-wrap items-center justify-between gap-3">
                <!-- If already submitted -->
                <div v-if="a.mySubmission" class="flex flex-col gap-1 text-xs">
                  <div class="flex items-center gap-2">
                    <span class="text-ink-muted">
                      {{ $t('assignments.submitted_on', { date: fmt.dateTime(a.mySubmission.submittedAt) }) }}
                    </span>
                    <a
                      :href="mediaUrl(a.mySubmission.fileUrl) ?? undefined"
                      target="_blank"
                      class="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      {{ a.mySubmission.fileName || $t('assignments.view_file') }}
                    </a>
                  </div>
                  <!-- Grade & Feedback if graded -->
                  <div v-if="a.mySubmission.status === 'graded'" class="flex items-center gap-2 mt-1">
                    <span class="font-bold text-success text-sm">
                      {{ $t('assignments.score') }}: {{ a.mySubmission.score }}/{{ a.mySubmission.maxScore || 100 }}
                    </span>
                    <span v-if="a.mySubmission.feedback" class="text-ink-muted italic">
                      — "{{ a.mySubmission.feedback }}"
                    </span>
                  </div>
                </div>

                <!-- If not submitted yet -->
                <div v-else class="text-xs text-ink-muted">
                  {{ $t('assignments.missing') }} — {{ $t('assignments.upload_file') }}
                </div>

                <!-- Action Button -->
                <div>
                  <button
                    type="button"
                    class="btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
                    :disabled="uploadingId === a.assignmentId"
                    @click="triggerUpload(a)"
                  >
                    <svg v-if="uploadingId !== a.assignmentId" xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <span v-if="uploadingId === a.assignmentId">{{ $t('common.loading') }}</span>
                    <span v-else>{{ a.mySubmission ? $t('assignments.resubmit') : $t('assignments.submit_homework') }}</span>
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </section>
      </template>
    </template>

    <!-- Hidden file input for homework upload -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*,application/pdf"
      class="hidden"
      @change="handleFileChange"
    >
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PageHeader from '../../components/PageHeader.vue';
import LoadingSpinner from '../../components/LoadingSpinner.vue';
import { useParentStore } from '../../application/stores/parent';
import { parentRepository, type ChildAssignment } from '../../infrastructure/api/ParentRepository';

definePageMeta({ layout: 'parent' });

const { t, locale } = useI18n();
const fmt = useFormat();
const dialog = useDialog();
const mediaUrl = useMediaUrl();
useHead({ title: () => `${t('assignments.title')} — ${t('parentPortal.title')}` });

const parentStore = useParentStore();
const selectedChildId = ref<number | null>(null);
const assignments = ref<ChildAssignment[]>([]);
const loading = ref(true);
const loadError = ref('');

const fileInputRef = ref<HTMLInputElement | null>(null);
const targetAssignment = ref<ChildAssignment | null>(null);
const uploadingId = ref<number | null>(null);

const personName = (p: { fullNameEn: string; fullNameLo: string }) => (locale.value === 'lo' ? p.fullNameLo : p.fullNameEn) || p.fullNameEn;
const pick = (lo?: string | null, en?: string | null) => (locale.value === 'lo' ? lo || en : en || lo) || '';

const daysLeft = (due: string) => {
  const d = new Date(due.slice(0, 10) + 'T00:00:00');
  return Math.round((d.getTime() - new Date(new Date().toDateString()).getTime()) / 86400000);
};
const dueLabel = (due: string) => {
  const n = daysLeft(due);
  if (n < 0) return t('assignments.overdue_by', { count: -n });
  if (n === 0) return t('assignments.due_today');
  return t('assignments.due_in', { count: n });
};
const groups = computed(() => [
  { id: 'upcoming', label: t('assignments.tab_upcoming'), items: assignments.value.filter((a) => daysLeft(a.dueDate) >= 0) },
  { id: 'past', label: t('assignments.tab_past'), items: assignments.value.filter((a) => daysLeft(a.dueDate) < 0) },
]);

async function loadChild() {
  if (!selectedChildId.value) return;
  loadError.value = '';
  try {
    assignments.value = await parentRepository.getChildAssignments(selectedChildId.value);
  } catch (err) {
    loadError.value = getErrorMessage(err);
  }
}

function triggerUpload(a: ChildAssignment) {
  targetAssignment.value = a;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
    fileInputRef.value.click();
  }
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !targetAssignment.value || !selectedChildId.value) return;

  // Validate size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    dialog.error('File size must be 10 MB or smaller');
    return;
  }

  const assignmentId = targetAssignment.value.assignmentId;
  uploadingId.value = assignmentId;

  try {
    await parentRepository.submitAssignment(assignmentId, selectedChildId.value, file);
    dialog.success(t('common.saved'));
    await loadChild();
  } catch (err) {
    dialog.error(getErrorMessage(err));
  } finally {
    uploadingId.value = null;
    targetAssignment.value = null;
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
