<template>
  <div class="relative">
    <input
      :id="inputId"
      v-model="query"
      type="search"
      autocomplete="off"
      class="input-field"
      :placeholder="$t('common.student_search')"
      :aria-expanded="open"
      @focus="open = true"
      @input="onInput"
      @keydown.esc="open = false"
    >
    <ul
      v-if="open && (results.length || searched)"
      class="panel-float absolute z-20 mt-1 w-full max-h-60 overflow-y-auto py-1"
      role="listbox"
    >
      <li v-for="s in results" :key="s.studentId">
        <button
          type="button"
          role="option"
          :aria-selected="s.studentId === modelValue"
          class="w-full text-left px-3 py-2 text-sm hover:bg-surface-2"
          @mousedown.prevent="choose(s)"
        >
          <span class="font-semibold">{{ name(s) }}</span>
          <span class="ml-2 text-xs text-ink-subtle font-mono">{{ s.studentCode }}</span>
        </button>
      </li>
      <li v-if="searched && !results.length" class="px-3 py-2 text-sm text-ink-subtle">{{ $t('common.no_student_match') }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Student } from '../domain/models/Student';
import { adminRepository } from '../infrastructure/api/AdminRepository';

// Type-ahead student search against the API (name or code), for forms that
// need one student — instead of asking staff to type a numeric student ID.
const props = defineProps<{ modelValue: number | null; inputId?: string; initialLabel?: string }>();
const emit = defineEmits<{ (e: 'update:modelValue', id: number | null): void }>();

const { locale } = useI18n();
const name = (s: Student) => (locale.value === 'lo' ? s.fullNameLo : s.fullNameEn) || s.fullNameEn;

const query = ref(props.initialLabel ?? '');
const results = ref<Student[]>([]);
const searched = ref(false);
const open = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

function onInput() {
  emit('update:modelValue', null);
  clearTimeout(timer);
  const q = query.value.trim();
  if (!q) { results.value = []; searched.value = false; return; }
  timer = setTimeout(async () => {
    const res = await adminRepository.getStudents({ search: q, limit: 10, status: 'active' });
    results.value = res.students;
    searched.value = true;
  }, 250);
}

function choose(s: Student) {
  query.value = `${name(s)} · ${s.studentCode}`;
  emit('update:modelValue', s.studentId);
  open.value = false;
}

onBeforeUnmount(() => clearTimeout(timer));
</script>
