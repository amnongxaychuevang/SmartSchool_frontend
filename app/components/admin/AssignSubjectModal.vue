<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-4"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-4"
    >
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" @click="closeModal"/>
        <form class="relative glass-panel w-full max-w-md p-6 flex flex-col gap-5 shadow-2xl" @submit.prevent="create">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ $t('classes.assign_subject') }}</h2>
            <button type="button" class="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors p-1" @click="closeModal">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div v-if="error" class="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {{ error }}
          </div>
          
          <div class="field relative" :class="classDropdownOpen ? 'z-50' : 'z-30'">
            <span>{{ $t('common.class') }} *</span>
            <div class="relative">
              <button
                type="button"
                class="modal-input flex items-center justify-between transition-colors"
                :class="classDropdownOpen ? 'border-teal-500 bg-white dark:bg-slate-800' : ''"
                @click="classDropdownOpen = !classDropdownOpen"
              >
                <span :class="form.classId === 0 ? 'text-slate-500 dark:text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'" class="truncate pr-2 text-left">
                  {{ form.classId === 0 ? $t('classes.select_class') : className(termClasses.find(c => c.classId === form.classId)) }}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 transition-transform" :class="classDropdownOpen ? 'rotate-180 text-teal-400' : 'text-slate-600 dark:text-slate-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </button>

              <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                <div v-if="classDropdownOpen" class="absolute left-0 top-full mt-2 w-full max-h-60 overflow-y-auto glass-panel !p-1 border border-slate-200 dark:border-slate-700 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] z-50">
                  <button
                    type="button"
                    v-for="c in termClasses"
                    :key="c.classId"
                    class="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 rounded-lg"
                    :class="form.classId === c.classId ? 'bg-teal-500/10 text-teal-400 font-medium' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:text-white'"
                    @click="form.classId = c.classId; classDropdownOpen = false"
                  >
                    <div class="w-1.5 h-1.5 rounded-full shrink-0" :class="form.classId === c.classId ? 'bg-teal-500' : 'bg-transparent'"/>
                    <span class="truncate">{{ className(c) }}</span>
                  </button>
                </div>
              </Transition>
            </div>
            <div v-if="classDropdownOpen" class="fixed inset-0 z-40" @click="classDropdownOpen = false"/>
          </div>
          
          <div class="field relative" :class="subjectDropdownOpen ? 'z-50' : 'z-20'">
            <span>{{ $t('classes.subject') }} *</span>
            <div class="relative">
              <button
                type="button"
                class="modal-input flex items-center justify-between transition-colors"
                :class="subjectDropdownOpen ? 'border-teal-500 bg-white dark:bg-slate-800' : ''"
                @click="subjectDropdownOpen = !subjectDropdownOpen"
              >
                <span :class="form.subjectId === 0 ? 'text-slate-500 dark:text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'" class="truncate pr-2 text-left">
                  {{ form.subjectId === 0 ? $t('classes.select_subject') : getSubjectName(form.subjectId) }}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 transition-transform" :class="subjectDropdownOpen ? 'rotate-180 text-teal-400' : 'text-slate-600 dark:text-slate-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </button>

              <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                <div v-if="subjectDropdownOpen" class="absolute left-0 top-full mt-2 w-full max-h-60 overflow-y-auto glass-panel !p-1 border border-slate-200 dark:border-slate-700 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] z-50">
                  <button
                    type="button"
                    v-for="s in subjects"
                    :key="s.subjectId"
                    class="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 rounded-lg"
                    :class="form.subjectId === s.subjectId ? 'bg-teal-500/10 text-teal-400 font-medium' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:text-white'"
                    @click="form.subjectId = s.subjectId; subjectDropdownOpen = false"
                  >
                    <div class="w-1.5 h-1.5 rounded-full shrink-0" :class="form.subjectId === s.subjectId ? 'bg-teal-500' : 'bg-transparent'"/>
                    <span class="truncate">{{ locale === 'lo' ? s.subjectNameLo : s.subjectNameEn }}</span>
                  </button>
                </div>
              </Transition>
            </div>
            <div v-if="subjectDropdownOpen" class="fixed inset-0 z-40" @click="subjectDropdownOpen = false"/>
          </div>
          
          <div class="field relative" :class="teacherDropdownOpen ? 'z-50' : 'z-10'">
            <span>{{ $t('classes.teacher') }}</span>
            <div class="relative">
              <button
                type="button"
                class="modal-input flex items-center justify-between transition-colors"
                :class="teacherDropdownOpen ? 'border-teal-500 bg-white dark:bg-slate-800' : ''"
                @click="teacherDropdownOpen = !teacherDropdownOpen"
              >
                <span :class="form.teacherId === 0 ? 'text-slate-500 dark:text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'" class="truncate pr-2 text-left">
                  {{ form.teacherId === 0 ? $t('classes.assign_later') : personName(teachers.find(t => t.userId === form.teacherId)) }}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 transition-transform" :class="teacherDropdownOpen ? 'rotate-180 text-teal-400' : 'text-slate-600 dark:text-slate-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </button>

              <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                <div v-if="teacherDropdownOpen" class="absolute left-0 top-full mt-2 w-full max-h-60 overflow-y-auto glass-panel !p-1 border border-slate-200 dark:border-slate-700 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] z-50">
                  <button
                    type="button"
                    class="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 rounded-lg"
                    :class="form.teacherId === 0 ? 'bg-teal-500/10 text-teal-400 font-medium' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:text-white'"
                    @click="form.teacherId = 0; teacherDropdownOpen = false"
                  >
                    <div class="w-1.5 h-1.5 rounded-full shrink-0" :class="form.teacherId === 0 ? 'bg-teal-500' : 'bg-transparent'"/>
                    <span class="truncate">{{ $t('classes.assign_later') }}</span>
                  </button>
                  <button
                    type="button"
                    v-for="t in teachers"
                    :key="t.userId"
                    class="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 rounded-lg"
                    :class="form.teacherId === t.userId ? 'bg-teal-500/10 text-teal-400 font-medium' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:text-white'"
                    @click="form.teacherId = t.userId; teacherDropdownOpen = false"
                  >
                    <div class="w-1.5 h-1.5 rounded-full shrink-0" :class="form.teacherId === t.userId ? 'bg-teal-500' : 'bg-transparent'"/>
                    <span class="truncate">{{ personName(t) }}</span>
                  </button>
                </div>
              </Transition>
            </div>
            <div v-if="teacherDropdownOpen" class="fixed inset-0 z-40" @click="teacherDropdownOpen = false"/>
          </div>
          
          <div class="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700 mt-2">
            <button type="button" class="btn-secondary" :disabled="saving" @click="closeModal">{{ $t('common.cancel') }}</button>
            <button type="submit" :disabled="saving || !form.classId || !form.subjectId" class="btn-primary">
              <svg v-if="saving" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
              {{ saving ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
        </form>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { academicsRepository } from '~/infrastructure/api/AcademicsRepository';

const props = defineProps<{
  modelValue: boolean;
  termId: number;
  initialClassId: number;
  termClasses: any[];
  subjects: any[];
  teachers: any[];
}>();

const emit = defineEmits(['update:modelValue', 'saved']);
const { locale } = useI18n();

const saving = ref(false);
const error = ref('');
const form = ref({ classId: 0, subjectId: 0, teacherId: 0 });

const classDropdownOpen = ref(false);
const subjectDropdownOpen = ref(false);
const teacherDropdownOpen = ref(false);

const personName = (p?: any) => (p ? (locale.value === 'lo' ? p.fullNameLo : p.fullNameEn) || p.fullNameEn : '—');
const className = (c: any) => (locale.value === 'lo' ? c.classNameLo : c.classNameEn) || c.classNameEn;
const getSubjectName = (id: number) => {
  const s = props.subjects.find(x => x.subjectId === id);
  if (!s) return '';
  return locale.value === 'lo' ? s.subjectNameLo : s.subjectNameEn;
};
const errorMessage = (err: unknown, fallback: string) =>
  (err as { data?: { message?: string } })?.data?.message || (err instanceof Error && err.message) || fallback;

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    form.value = { classId: props.initialClassId, subjectId: 0, teacherId: 0 };
    error.value = '';
  }
});

const closeModal = () => emit('update:modelValue', false);

const create = async () => {
  saving.value = true;
  error.value = '';
  try {
    await academicsRepository.createClassSubject({
      classId: form.value.classId,
      subjectId: form.value.subjectId,
      termId: props.termId,
      teacherId: form.value.teacherId || null,
    });
    closeModal();
    emit('saved');
  } catch (err) {
    error.value = errorMessage(err, 'Failed to assign');
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped lang="postcss">
.field {
  @apply flex flex-col gap-1.5;
}
.field span {
  @apply text-sm font-medium text-slate-700 dark:text-slate-300 ml-1;
}
.modal-input {
  @apply w-full h-10 pl-4 pr-3 bg-white dark:bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-none text-slate-900 dark:text-white text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:bg-white dark:bg-slate-800 transition-colors;
}
</style>

