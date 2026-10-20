<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="isOpen = false"/>
      <form class="relative bg-[#0d1626] border border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4" @submit.prevent="save">
        <h2 class="text-xl font-bold text-white">{{ scheduleId ? $t('schedule_admin.edit_slot') : $t('schedule_admin.add_slot') }}</h2>
        <div v-if="error" class="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{{ error }}</div>
        
        <label class="field">
          <span>{{ $t('schedule_admin.subject') }} *</span>
          <select v-model.number="form.classSubjectId" required class="modal-input">
            <option :value="0" disabled>—</option>
            <option v-for="cs in classSubjects" :key="cs.id" :value="cs.id">
              {{ nameOf(cs.subject, 'subjectName') }}{{ cs.teacher ? ` — ${nameOf(cs.teacher, 'fullName')}` : '' }}
            </option>
          </select>
        </label>
        
        <label class="field">
          <span>{{ $t('schedule_admin.day') }} *</span>
          <select v-model.number="form.dayOfWeek" class="modal-input">
            <option v-for="d in WEEK_DAYS" :key="d" :value="d">{{ dayName(d) }}</option>
          </select>
        </label>
        
        <div class="grid grid-cols-2 gap-3">
          <label class="field"><span>{{ $t('schedule_admin.start') }} *</span><input v-model="form.startTime" required type="time" class="modal-input" ></label>
          <label class="field"><span>{{ $t('schedule_admin.end') }} *</span><input v-model="form.endTime" required type="time" class="modal-input" ></label>
        </div>
        
        <label class="field">
          <span>{{ $t('schedule_admin.room') }}</span>
          <input v-model="form.roomNumber" maxlength="50" class="modal-input" placeholder="101" >
        </label>
        
        <div class="flex items-center gap-3 pt-2">
          <button v-if="scheduleId" type="button" class="px-4 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10" @click="remove">{{ $t('common.delete') }}</button>
          <span class="flex-1" />
          <button type="button" class="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800" @click="isOpen = false">{{ $t('common.cancel') }}</button>
          <button type="submit" :disabled="saving" class="px-5 py-2 rounded-lg text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-white disabled:opacity-60">
            {{ saving ? $t('common.saving') : $t('common.save') }}
          </button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { academicsRepository, type ClassSubject, type ScheduleSlot } from '../../infrastructure/api/AcademicsRepository';

const props = defineProps<{
  open: boolean;
  slotData: ScheduleSlot | null;
  classSubjects: ClassSubject[];
}>();

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void;
  (e: 'saved'): void;
}>();

const { t, locale } = useI18n();

const isOpen = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val)
});

const WEEK_DAYS = [1, 2, 3, 4, 5];
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_LO = ['ອາທິດ', 'ຈັນ', 'ອັງຄານ', 'ພຸດ', 'ພະຫັດ', 'ສຸກ', 'ເສົາ'];
const dayName = (d: number) => (locale.value === 'lo' ? DAYS_LO[d] : DAYS_EN[d]) ?? String(d);

const nameOf = (obj: object, base: string) => {
  const o = obj as Record<string, string | undefined>;
  return (locale.value === 'lo' ? o[`${base}Lo`] : o[`${base}En`]) || o[`${base}En`] || '';
};

const hhmm = (iso: string) => iso.slice(11, 16);
const errorMessage = (err: unknown, fallback: string) =>
  (err as { data?: { message?: string } })?.data?.message || (err instanceof Error && err.message) || fallback;

const scheduleId = ref<number | null>(null);
const saving = ref(false);
const error = ref('');

const form = reactive({
  classSubjectId: 0,
  dayOfWeek: 1,
  startTime: '08:00',
  endTime: '09:00',
  roomNumber: ''
});

watch(() => props.open, (newVal) => {
  if (newVal) {
    scheduleId.value = props.slotData?.scheduleId ?? null;
    if (props.slotData) {
      form.classSubjectId = props.slotData.classSubjectId;
      form.dayOfWeek = props.slotData.dayOfWeek;
      form.startTime = hhmm(props.slotData.startTime);
      form.endTime = hhmm(props.slotData.endTime);
      form.roomNumber = props.slotData.roomNumber ?? '';
    } else {
      form.classSubjectId = 0;
      form.dayOfWeek = 1;
      form.startTime = '08:00';
      form.endTime = '09:00';
      form.roomNumber = '';
    }
    error.value = '';
  }
});

const save = async () => {
  saving.value = true;
  error.value = '';
  try {
    await academicsRepository.saveSchedule(scheduleId.value, { ...form, roomNumber: form.roomNumber || null });
    isOpen.value = false;
    emit('saved');
  } catch (err) {
    error.value = errorMessage(err, 'Failed to save');
  } finally {
    saving.value = false;
  }
};

const remove = async () => {
  if (!scheduleId.value || !confirm(t('schedule_admin.delete_slot_confirm'))) return;
  try {
    await academicsRepository.deleteSchedule(scheduleId.value);
    isOpen.value = false;
    emit('saved');
  } catch (err) {
    error.value = errorMessage(err, 'Failed to delete');
  }
};
</script>

<style scoped lang="postcss">
.field {
  @apply flex flex-col gap-1.5;
}
.field > span {
  @apply text-xs font-semibold text-slate-400 uppercase tracking-wider;
}
.modal-input {
  @apply w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:border-teal-500 transition-all;
}
</style>
