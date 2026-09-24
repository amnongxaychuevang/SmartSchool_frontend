<template>
  <div class="min-h-screen flex bg-canvas text-ink">
    <!-- ══ Brand panel (desktop) ══ -->
    <aside class="hidden lg:flex lg:w-[44%] xl:w-1/2 flex-col justify-between bg-primary-hover text-white p-12 xl:p-16">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded bg-white/15 border border-white/25 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
        <div>
          <p class="text-lg font-bold leading-tight">{{ t('auth.title') }}</p>
          <p class="text-sm text-white/75">{{ t('auth.subtitle') }}</p>
        </div>
      </div>

      <div class="max-w-md">
        <h1 class="text-3xl xl:text-4xl font-bold leading-tight">{{ t('auth.subtitle') }}</h1>
        <p class="mt-3 text-white/80">{{ t('auth.tagline') }}</p>

        <ul class="mt-10 space-y-5">
          <li v-for="feature in features" :key="feature" class="flex gap-4">
            <span class="w-10 h-10 shrink-0 rounded bg-white/10 border border-white/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="featureIcons[feature]" />
              </svg>
            </span>
            <span>
              <span class="block font-semibold">{{ t(`auth.features.${feature}.title`) }}</span>
              <span class="block text-sm text-white/75">{{ t(`auth.features.${feature}.desc`) }}</span>
            </span>
          </li>
        </ul>
      </div>

      <p class="text-xs text-white/60">© {{ year }} {{ t('auth.title') }} · {{ t('auth.footer') }}</p>
    </aside>

    <!-- ══ Sign-in form ══ -->
    <main class="flex-1 flex flex-col">
      <div class="flex justify-end gap-2 p-4 sm:p-6">
        <LangSwitch />
        <ThemeSwitch />
      </div>

      <div class="flex-1 flex items-center justify-center px-4 pb-12">
        <div class="w-full max-w-sm">
          <!-- Compact brand (mobile) -->
          <div class="lg:hidden flex items-center gap-3 mb-8">
            <div class="w-10 h-10 rounded bg-primary text-white flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <div>
              <p class="font-bold leading-tight text-primary-ink">{{ t('auth.title') }}</p>
              <p class="text-xs text-ink-muted">{{ t('auth.subtitle') }}</p>
            </div>
          </div>

          <h2 class="text-2xl font-bold">{{ t('auth.welcome') }}</h2>
          <p class="mt-1 text-sm text-ink-muted">{{ t('auth.sign_in_desc') }}</p>

          <div
            v-if="authStore.error"
            role="alert"
            class="mt-6 flex items-start gap-2 rounded border border-danger-line bg-danger-soft px-3 py-2.5 text-sm text-danger"
          >
            <svg class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            {{ authStore.error }}
          </div>

          <form class="mt-6 space-y-4" novalidate @submit.prevent="handleLogin">
            <div>
              <label for="identifier" class="block mb-1.5 text-sm font-semibold">{{ t('auth.email_label') }}</label>
              <input
                id="identifier"
                v-model="loginIdentifier"
                type="text"
                required
                autocomplete="username"
                class="input-field h-10"
                :placeholder="t('auth.email_placeholder')"
              >
            </div>

            <div>
              <label for="password" class="block mb-1.5 text-sm font-semibold">{{ t('auth.password_label') }}</label>
              <div class="relative">
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  autocomplete="current-password"
                  class="input-field h-10 pr-10"
                >
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 w-10 flex items-center justify-center text-ink-subtle hover:text-ink"
                  :aria-label="showPassword ? t('auth.hide_password') : t('auth.show_password')"
                  @click="showPassword = !showPassword"
                >
                  <svg v-if="!showPassword" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                </button>
              </div>
            </div>

            <button type="submit" class="btn-primary w-full h-10" :disabled="authStore.loading">
              <svg v-if="authStore.loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-opacity="0.25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ authStore.loading ? t('auth.signing_in') : t('auth.sign_in_btn') }}
            </button>
          </form>

          <p class="lg:hidden mt-10 text-center text-xs text-ink-subtle">© {{ year }} {{ t('auth.title') }} · {{ t('auth.footer') }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../application/stores/auth';
import LangSwitch from '../components/LangSwitch.vue';
import ThemeSwitch from '../components/ThemeSwitch.vue';
import { firstAllowedAdminPath } from '../components/layout/adminNav';

definePageMeta({ layout: 'default' });

const { t } = useI18n();
useHead({ title: () => t('auth.title') });

const loginIdentifier = ref('');
const password = ref('');
const showPassword = ref(false);
const authStore = useAuthStore();
const router = useRouter();
const year = new Date().getFullYear();

const features = ['attendance', 'wallet', 'academics'] as const;
const featureIcons: Record<(typeof features)[number], string> = {
  attendance: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  wallet: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  academics: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
};

const handleLogin = async () => {
  try {
    const user = await authStore.login(loginIdentifier.value, password.value);
    // Each portal has its own home; staff roles land on their first allowed admin page.
    const home = user?.portal === 'admin'
      ? firstAllowedAdminPath(user.permissions ?? [])
      : user?.portal ? `/${user.portal}` : null;
    if (home) await router.push(home);
  } catch {
    // The message is shown from authStore.error.
  }
};
</script>
