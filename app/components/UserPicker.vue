<template>
  <div class="relative">
    <input
      :id="inputId"
      v-model="query"
      type="search"
      autocomplete="off"
      class="input-field"
      :placeholder="$t('notifications_admin.user_search')"
      :aria-expanded="open"
      @focus="open = true"
      @input="onInput"
      @keydown.esc="open = false"
    >
    <ul v-if="open && (results.length || searched)" class="panel-float absolute z-20 mt-1 w-full max-h-60 overflow-y-auto py-1" role="listbox">
      <li v-for="u in results" :key="u.userId">
        <button
          type="button"
          role="option"
          :aria-selected="u.userId === modelValue"
          class="w-full text-left px-3 py-2 text-sm hover:bg-surface-2"
          @mousedown.prevent="choose(u)"
        >
          <span class="font-semibold">{{ name(u) }}</span>
          <span class="ml-2 text-xs text-ink-subtle">{{ roleName(u) }} · {{ u.email || u.phoneNumber }}</span>
        </button>
      </li>
      <li v-if="searched && !results.length" class="px-3 py-2 text-sm text-ink-subtle">{{ $t('notifications_admin.no_user_match') }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import type { User } from '../domain/models/User';
import { adminRepository } from '../infrastructure/api/AdminRepository';

// Type-ahead user search (name, email or phone), optionally limited to a role.
const props = defineProps<{ modelValue: number | null; inputId?: string; role?: 'admin' | 'teacher' | 'parent' }>();
const emit = defineEmits<{ (e: 'update:modelValue', id: number | null): void }>();

const { t, locale } = useI18n();
const name = (u: User) => (locale.value === 'lo' ? u.fullNameLo : u.fullNameEn) || u.fullNameEn;
const roleName = (u: User) => {
  const code = typeof u.role === 'string' ? u.role : u.role?.code;
  return code ? t(`layout.role.${code}`) : '';
};

const query = ref('');
const results = ref<User[]>([]);
const searched = ref(false);
const open = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

function onInput() {
  emit('update:modelValue', null);
  clearTimeout(timer);
  const q = query.value.trim();
  if (!q) { results.value = []; searched.value = false; return; }
  timer = setTimeout(async () => {
    const res = await adminRepository.getUsers({ search: q, role: props.role, limit: 10 });
    results.value = res.users;
    searched.value = true;
  }, 250);
}

function choose(u: User) {
  query.value = name(u);
  emit('update:modelValue', u.userId);
  open.value = false;
}

onBeforeUnmount(() => clearTimeout(timer));
</script>
