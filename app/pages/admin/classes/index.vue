<template>
  <div class="flex flex-col gap-6">
    <!-- Search & Add -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-4">
      <div class="relative flex-1 max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
v-model="searchInput" type="text" :placeholder="$t('classes.search_placeholder')"
          class="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          @input="handleSearch" >
      </div>
      <div class="flex items-center gap-3">
        <button
class="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-[0_4px_14px_rgba(20,184,166,0.25)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.4)]"
          @click="openAddModal">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('classes.add_class') }}
        </button>
        <span v-if="adminStore.classesTotal > 0" class="text-slate-500 text-sm">{{ adminStore.classesTotal }} {{ $t('nav.classes') }}</span>
      </div>
    </div>

    <!-- Cards Grid -->
    <LoadingSpinner v-if="adminStore.classesLoading" />

    <div v-else-if="adminStore.classes.length === 0" class="glass-panel flex flex-col items-center justify-center py-20 text-slate-500">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <p>{{ $t('classes.no_classes') }}</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <div
v-for="cls in adminStore.classes" :key="cls.classId"
        class="glass-panel p-5 flex flex-col gap-4 hover:border-teal-500/30 transition-all cursor-pointer group">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h3 class="text-base font-semibold text-white group-hover:text-teal-400 transition-colors">{{ locale === 'lo' ? cls.classNameLo : cls.classNameEn }}</h3>
            <p class="text-xs text-slate-500 mt-0.5">{{ locale === 'lo' ? cls.classNameEn : cls.classNameLo }}</p>
          </div>
          <div class="flex flex-col items-end gap-2 shrink-0">
            <span class="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-md">{{ cls.academicYear }}</span>
            <div class="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
class="p-1 rounded bg-slate-800 text-slate-400 hover:text-teal-400 hover:bg-slate-750 transition-all"
                :title="$t('common.edit')"
                @click.stop="openEditModal(cls)">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
class="p-1 rounded bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-750 transition-all"
                :title="$t('common.delete')"
                @click.stop="openDeleteModal(cls)">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 text-sm text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{{ $t('classes.students_count', { count: cls._count?.classStudents ?? 0 }) }}</span>
        </div>

        <div class="flex items-center gap-2 text-sm">
          <div class="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
            {{ cls.homeroomTeacher ? (locale === 'lo' ? cls.homeroomTeacher.fullNameLo?.[0] : cls.homeroomTeacher.fullNameEn?.[0]) : '?' }}
          </div>
          <span class="text-slate-400 truncate">
            {{ cls.homeroomTeacher ? (locale === 'lo' ? (cls.homeroomTeacher.fullNameLo || cls.homeroomTeacher.fullNameEn) : (cls.homeroomTeacher.fullNameEn || cls.homeroomTeacher.fullNameLo)) : $t('classes.no_homeroom_teacher') }}
          </span>
        </div>

        <div class="flex items-center gap-2 mt-auto">
          <span
class="text-xs px-2 py-0.5 rounded-full"
            :class="cls.isActive ? 'bg-teal-500/20 text-teal-400' : 'bg-slate-700 text-slate-500'">
            {{ cls.isActive ? $t('common.active') : $t('common.inactive') }}
          </span>
          <span v-if="locale === 'lo' ? cls.gradeLevelLo : cls.gradeLevelEn" class="text-xs text-slate-500">{{ locale === 'lo' ? cls.gradeLevelLo : cls.gradeLevelEn }}</span>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2">
      <button
:disabled="adminStore.classesPage <= 1"
        class="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        @click="changePage(adminStore.classesPage - 1)">← Prev</button>
      <span class="text-sm text-slate-400">Page {{ adminStore.classesPage }} / {{ totalPages }}</span>
      <button
:disabled="adminStore.classesPage >= totalPages"
        class="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        @click="changePage(adminStore.classesPage + 1)">Next →</button>
    </div>


    <!-- Class Modal (Add & Edit) -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="classModal.open" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="classModal.open = false"/>
          <div class="relative glass-panel w-full max-w-2xl flex flex-col p-0 overflow-hidden">
            <div class="p-6 flex items-center justify-between border-b border-slate-800/50 bg-slate-900/20">
              <div>
                <h2 class="text-xl font-bold text-white flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {{ classModal.mode === 'add' ? $t('classes.add_class') : $t('classes.edit_class') }}
                </h2>
                <p class="text-xs text-slate-400 mt-1">Specify class name, grade level, and assign a homeroom teacher.</p>
              </div>
              <button class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" @click="classModal.open = false">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div v-if="classModal.error" class="m-6 mb-0 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{{ classModal.error }}</div>

            <form class="flex flex-col" @submit.prevent="handleClassSubmit">
              <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[60vh] overflow-y-auto pr-6 scrollbar-thin">
              
                <!-- Class Name EN -->
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    {{ $t('classes.class_name_en') }} <span class="text-teal-400">*</span>
                  </label>
                  <input v-model="classModal.form.classNameEn" required type="text" class="input-field" placeholder="e.g. Grade 10A" >
                </div>

                <!-- Class Name LO -->
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    {{ $t('classes.class_name_lo') }} <span class="text-teal-400">*</span>
                  </label>
                  <input v-model="classModal.form.classNameLo" required type="text" class="input-field" placeholder="ຕົວຢ່າງ: ມໍ 4ກ" >
                </div>

                <!-- Grade Level EN -->
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {{ $t('classes.grade_level_en') }}
                  </label>
                  <input v-model="classModal.form.gradeLevelEn" type="text" class="input-field" placeholder="e.g. Grade 10" >
                </div>

                <!-- Grade Level LO -->
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {{ $t('classes.grade_level_lo') }}
                  </label>
                  <input v-model="classModal.form.gradeLevelLo" type="text" class="input-field" placeholder="ຕົວຢ່າງ: ມໍ 4" >
                </div>

                <!-- Academic Year -->
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    {{ $t('classes.academic_year') }} <span class="text-teal-400">*</span>
                  </label>
                  <input v-model="classModal.form.academicYear" required type="text" class="input-field" placeholder="e.g. 2025-2026" >
                </div>

                <!-- Homeroom Teacher -->
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {{ $t('classes.homeroom_teacher') }}
                  </label>
                  <select v-model="classModal.form.homeroomTeacherId" class="input-field cursor-pointer">
                    <option :value="null">{{ $t('classes.no_homeroom_teacher') }}</option>
                    <option v-for="teacher in adminStore.teachers" :key="teacher.userId" :value="teacher.userId">
                      {{ locale === 'lo' ? (teacher.user?.fullNameLo || teacher.user?.fullNameEn) : (teacher.user?.fullNameEn || teacher.user?.fullNameLo) }}
                    </option>
                  </select>
                </div>

                <!-- Description EN -->
                <div class="flex flex-col gap-2 md:col-span-2">
                  <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('classes.description_en') }}</label>
                  <textarea v-model="classModal.form.descriptionEn" rows="2" class="input-field resize-none" placeholder="e.g. Science stream class"/>
                </div>

                <!-- Description LO -->
                <div class="flex flex-col gap-2 md:col-span-2">
                  <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('classes.description_lo') }}</label>
                  <textarea v-model="classModal.form.descriptionLo" rows="2" class="input-field resize-none" placeholder="ຕົວຢ່າງ: ຫ້ອງເນັ້ນວິທະຍາສາດທຳມະຊາດ"/>
                </div>

                <!-- Status Switch Row -->
                <div class="flex items-center justify-between p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl mt-2 md:col-span-2">
                  <div class="flex flex-col gap-1">
                    <span class="text-xs font-semibold text-white uppercase tracking-wider">{{ $t('common.status') }}</span>
                    <span class="text-xs text-slate-400">Toggle whether this class is active or inactive</span>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                     <input v-model="classModal.form.isActive" type="checkbox" class="sr-only peer" >
                     <div class="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-teal-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"/>
                  </label>
                </div>
              </div>

              <div class="p-6 pt-4 border-t border-slate-800/50 flex items-center justify-end gap-3 bg-slate-900/20">
                <button type="button" class="btn-ghost" @click="classModal.open = false">
                  {{ $t('common.cancel') }}
                </button>
                <button type="submit" :disabled="classModal.saving" class="btn-primary flex items-center gap-2">
                  <svg v-if="classModal.saving" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <span v-else>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {{ classModal.saving ? $t('common.saving') : $t('common.save') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirm Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="deleteModal.open" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="deleteModal.open = false"/>
          <div class="relative glass-panel w-full max-w-sm p-6 flex flex-col gap-6">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="flex flex-col gap-1 pt-1">
                <h2 class="text-lg font-bold text-white">{{ $t('classes.delete_confirm_title') }}</h2>
                <p class="text-sm text-slate-400">{{ $t('classes.delete_confirm_msg', { name: locale === 'lo' ? deleteModal.classObj?.classNameLo : deleteModal.classObj?.classNameEn }) }}</p>
              </div>
            </div>
            <div v-if="deleteModal.error" class="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{{ deleteModal.error }}</div>
            <div class="flex items-center justify-end gap-3 pt-2">
              <button class="btn-ghost" @click="deleteModal.open = false">{{ $t('common.cancel') }}</button>
              <button
  :disabled="deleteModal.deleting" class="px-5 py-2 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-400 text-white transition-all shadow-[0_4px_15px_rgba(239,68,68,0.3)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.4)] disabled:opacity-60 flex items-center gap-2"
                @click="handleDelete">
                <svg v-if="deleteModal.deleting" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {{ deleteModal.deleting ? $t('common.deleting') : $t('common.delete') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useAdminStore } from '../../../application/stores/admin';
import type { SchoolClass } from '../../../domain/models/SchoolClass';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Classes — Smart School Admin' });

const adminStore = useAdminStore();
const { locale } = useI18n();
const searchInput = ref('');
let searchTimeout: ReturnType<typeof setTimeout>;

const totalPages = computed(() => Math.ceil(adminStore.classesTotal / 15));

onMounted(() => {
  adminStore.fetchClasses();
  adminStore.fetchTeachers();
});

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    adminStore.fetchClasses({ search: searchInput.value, page: 1 });
  }, 400);
};

const changePage = (page: number) => {
  adminStore.fetchClasses({ page });
};

// ── Class Modal (Add + Edit) ──
const emptyClassForm = () => ({
  classNameEn: '',
  classNameLo: '',
  gradeLevelEn: '',
  gradeLevelLo: '',
  homeroomTeacherId: null as number | null,
  academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
  descriptionEn: '',
  descriptionLo: '',
  isActive: true
});

const classModal = reactive({
  open: false,
  mode: 'add' as 'add' | 'edit',
  saving: false,
  error: '',
  classId: null as number | null,
  form: emptyClassForm()
});

const openAddModal = () => {
  classModal.mode = 'add';
  classModal.classId = null;
  classModal.form = emptyClassForm();
  classModal.error = '';
  classModal.open = true;
};

const openEditModal = (cls: SchoolClass) => {
  classModal.mode = 'edit';
  classModal.classId = cls.classId;
  classModal.form = {
    classNameEn: cls.classNameEn,
    classNameLo: cls.classNameLo,
    gradeLevelEn: cls.gradeLevelEn || '',
    gradeLevelLo: cls.gradeLevelLo || '',
    homeroomTeacherId: cls.homeroomTeacherId || null,
    academicYear: cls.academicYear,
    descriptionEn: cls.descriptionEn || '',
    descriptionLo: cls.descriptionLo || '',
    isActive: cls.isActive ?? true
  };
  classModal.error = '';
  classModal.open = true;
};

const handleClassSubmit = async () => {
  classModal.saving = true;
  classModal.error = '';
  try {
    const payload = { ...classModal.form };
    if (classModal.mode === 'add') {
      await adminStore.createClass(payload);
    } else if (classModal.classId) {
      await adminStore.updateClass(classModal.classId, payload);
    }
    classModal.open = false;
  } catch (err) {
    classModal.error = getErrorMessage(err, 'Failed to save class');
  } finally {
    classModal.saving = false;
  }
};

// ── Delete Modal ──
const deleteModal = reactive({
  open: false,
  deleting: false,
  error: '',
  classObj: null as SchoolClass | null
});

const openDeleteModal = (cls: SchoolClass) => {
  deleteModal.classObj = cls;
  deleteModal.error = '';
  deleteModal.open = true;
};

const handleDelete = async () => {
  if (!deleteModal.classObj) return;
  deleteModal.deleting = true;
  deleteModal.error = '';
  try {
    await adminStore.deleteClass(deleteModal.classObj.classId);
    deleteModal.open = false;
  } catch (err) {
    deleteModal.error = getErrorMessage(err, 'Failed to delete class');
  } finally {
    deleteModal.deleting = false;
  }
};
</script>

<style scoped lang="postcss">

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
