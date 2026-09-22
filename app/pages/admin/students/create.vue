<template>
  <div class="relative w-full max-w-5xl mx-auto flex flex-col gap-8 pb-12">
    <!-- Ambient Background Glow -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-teal-500/10 blur-[100px] rounded-full pointer-events-none -z-10"/>

    <!-- Header Area -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-5">
        <NuxtLink to="/admin/students" class="group flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-teal-500/50 hover:shadow-[0_0_15px_rgba(20,184,166,0.15)] transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </NuxtLink>
        <div>
          <h1 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">{{ $t('students.add_student') }}</h1>
          <p class="text-slate-400 mt-1 text-sm font-medium">{{ $t('auth.tagline') }}</p>
        </div>
      </div>
    </div>

    <!-- Error Alert -->
    <transition name="fade">
      <div v-if="errorMsg" class="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 shadow-lg shadow-red-500/5 backdrop-blur-md text-red-400">
        <div class="p-1 rounded-full bg-red-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="pt-0.5 text-sm font-medium">{{ errorMsg }}</div>
      </div>
    </transition>

    <!-- Form Section -->
    <form class="relative group" @submit.prevent="handleSubmit">
      <!-- Gradient Border effect -->
      <div class="gradient-border absolute -inset-[1px] bg-gradient-to-b from-slate-700/80 to-slate-800/20 rounded-[2rem] z-0 opacity-50 group-hover:from-teal-500/30 group-hover:to-slate-800/20 transition-all duration-500"/>
      
      <div class="relative glass-panel create-panel p-8 sm:p-10 rounded-[2rem] z-10 shadow-2xl flex flex-col gap-10">
        
        <!-- Section: Basic Details -->
        <div class="flex flex-col gap-6">
          <div class="flex items-center gap-3 pb-4 border-b border-slate-800/60">
            <div class="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-white tracking-wide">{{ $t('common.code') }}</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Student Code -->
            <div class="input-group">
              <label>{{ $t('students.student_code') }} <span class="text-teal-400">*</span></label>
              <div class="relative">
                <div class="input-icon">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <input v-model="form.studentCode" type="text" required placeholder="e.g. STD-2026-001" class="input-element" >
              </div>
            </div>

            <!-- Status -->
            <div class="input-group">
              <label>{{ $t('common.status') }}</label>
              <div class="relative">
                <div class="input-icon">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <select v-model="form.status" class="input-element appearance-none pr-10">
                  <option value="active">{{ $t('common.active') }}</option>
                  <option value="graduated">{{ $t('students.graduated') }}</option>
                  <option value="transferred">{{ $t('students.transferred') }}</option>
                </select>
                <div class="select-chevron">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Personal Info -->
        <div class="flex flex-col gap-6">
          <div class="flex items-center gap-3 pb-4 border-b border-slate-800/60">
            <div class="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-white tracking-wide">{{ $t('common.user') }}</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Full Name (EN) -->
            <div class="input-group">
              <label>{{ $t('students.full_name_en') }} <span class="text-teal-400">*</span></label>
              <div class="relative">
                <div class="input-icon">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
                <input v-model="form.fullNameEn" type="text" required placeholder="John Doe" class="input-element" >
              </div>
            </div>

            <!-- Full Name (LO) -->
            <div class="input-group">
              <label>{{ $t('students.full_name_lo') }} <span class="text-teal-400">*</span></label>
              <div class="relative">
                <div class="input-icon">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
                <input v-model="form.fullNameLo" type="text" required placeholder="ຈອນ ໂດ" class="input-element" >
              </div>
            </div>

            <!-- Gender -->
            <div class="input-group">
              <label>{{ $t('common.gender') }} <span class="text-teal-400">*</span></label>
              <div class="relative">
                <div class="input-icon">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <select v-model="form.gender" required class="input-element appearance-none pr-10" :class="{ 'text-slate-500': form.gender === '' }">
                  <option value="" disabled>{{ locale === 'lo' ? 'ເລືອກເພດ...' : 'Select gender...' }}</option>
                  <option v-for="g in adminStore.genders" :key="g.code" :value="g.code">
                    {{ locale === 'lo' ? g.nameLo : g.nameEn }}
                  </option>
                </select>
                <div class="select-chevron">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="mt-4 pt-8 border-t border-slate-800/60 flex items-center justify-end gap-5">
          <NuxtLink to="/admin/students" class="px-6 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cancel-btn">
            {{ $t('common.cancel') }}
          </NuxtLink>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="group relative px-8 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-400 overflow-hidden shadow-[0_4px_20px_rgba(20,184,166,0.3)] hover:shadow-[0_8px_30px_rgba(20,184,166,0.5)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <!-- Hover sheen effect -->
            <div class="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"/>
            
            <div class="relative z-10 flex items-center gap-3">
              <svg v-if="isSubmitting" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <svg v-else class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span class="tracking-wide">{{ isSubmitting ? $t('common.loading') : $t('common.save') }}</span>
            </div>
          </button>
        </div>

      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAdminStore } from '../../../application/stores/admin';
import { useRouter } from 'vue-router';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Add Student — Smart School Admin' });

const adminStore = useAdminStore();
const router = useRouter();
const { locale } = useI18n();

const isSubmitting = ref(false);
const errorMsg = ref('');

const form = reactive({
  studentCode: '',
  fullNameEn: '',
  fullNameLo: '',
  gender: '',
  status: 'active'
});

onMounted(() => {
  adminStore.fetchGenders();
});

const handleSubmit = async () => {
  errorMsg.value = '';
  isSubmitting.value = true;
  
  try {
    await adminStore.createStudent({ ...form });
    router.push('/admin/students');
  } catch (err: any) {
    errorMsg.value = err.message || 'Failed to create student. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped lang="postcss">
:global(html.light) .create-panel {
  background-color: #ffffff !important;
  border-color: #f1f5f9 !important;
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.05) !important;
}

:global(html.light) .gradient-border {
  display: none !important;
}

:global(html.light) .input-element {
  background-color: #f8fafc !important;
  border-color: #e2e8f0 !important;
  color: #0f172a !important;
  box-shadow: none !important;
}

:global(html.light) .input-element:focus {
  background-color: #ffffff !important;
  border-color: #0d9488 !important;
  box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1) !important;
}

:global(html.light) .input-icon, 
:global(html.light) .select-chevron {
  color: #94a3b8 !important;
}

:global(html.light) .input-element:focus ~ .input-icon {
  color: #0d9488 !important;
}

.input-group {
  @apply flex flex-col gap-2.5;
}

.input-group label {
  @apply text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 tracking-wide;
}

.input-element {
  @apply w-full pl-12 pr-4 py-3.5 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/10 transition-all duration-300 shadow-inner;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.input-icon {
  @apply absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none transition-colors duration-300;
}

.input-element:focus ~ .input-icon,
.input-element:focus-within ~ .input-icon {
  @apply text-teal-400;
}

.select-chevron {
  @apply absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none;
}

:global(html.light) h1.text-transparent {
  background-image: linear-gradient(to right, #0f172a, #475569) !important;
  -webkit-background-clip: text !important;
  color: transparent !important;
}

:global(html.light) p.text-slate-400 {
  color: #475569 !important;
}

:global(html.light) h3.text-white {
  color: #0f172a !important;
}

:global(html.light) .cancel-btn {
  color: #475569 !important;
}

:global(html.light) .cancel-btn:hover {
  color: #0f172a !important;
  background-color: #f1f5f9 !important;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
