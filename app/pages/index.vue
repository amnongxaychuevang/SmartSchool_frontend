<template>
  <div class="min-h-screen flex bg-canvas text-ink">
    <!-- ══ Brand panel (desktop) ══ -->
    <aside class="hidden lg:flex lg:w-[44%] xl:w-1/2 flex-col justify-between bg-primary-hover text-white p-12 xl:p-16">
      <div class="flex items-center gap-3">
        <img src="/logo.png" alt="Smart School Logo" class="w-12 h-12 rounded-xl object-contain bg-white/95 p-1 shadow-md shadow-black/10" />
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
            <img src="/logo.png" alt="Smart School Logo" class="w-12 h-12 rounded-xl object-contain bg-white shadow-md p-1 border border-line" />
            <div>
              <p class="font-bold leading-tight text-primary-ink">{{ t('auth.title') }}</p>
              <p class="text-xs text-ink-muted">{{ t('auth.subtitle') }}</p>
            </div>
          </div>

          <!-- ══ Forgotten password: ask for a code, then set a new password ══ -->
          <template v-if="mode !== 'login'">
            <h2 class="text-2xl font-bold">{{ t('password.forgot_title') }}</h2>
            <p class="mt-1 text-sm text-ink-muted">
              {{ mode === 'forgot' ? t('password.forgot_desc') : t('password.reset_desc', { identifier: reset.identifier }) }}
            </p>

            <p v-if="reset.error" role="alert" class="mt-6 rounded border border-danger-line bg-danger-soft px-3 py-2.5 text-sm text-danger">{{ reset.error }}</p>

            <form v-if="mode === 'forgot'" class="mt-6 space-y-4" novalidate @submit.prevent="sendCode">
              <div>
                <label for="reset-identifier" class="block mb-1.5 text-sm font-semibold">{{ t('auth.email_label') }}</label>
                <input id="reset-identifier" v-model.trim="reset.identifier" type="text" required autocomplete="username" class="input-field h-10" :placeholder="t('auth.email_placeholder')">
              </div>
              <button type="submit" class="btn-primary w-full h-10" :disabled="reset.busy || reset.identifier.length < 3">
                {{ reset.busy ? t('password.sending') : t('password.send_code') }}
              </button>
            </form>

            <form v-else class="mt-6 space-y-4" novalidate @submit.prevent="submitReset">
              <div>
                <label for="reset-code" class="block mb-1.5 text-sm font-semibold">{{ t('password.code') }}</label>
                <input id="reset-code" v-model.trim="reset.code" type="text" inputmode="numeric" maxlength="6" required autocomplete="one-time-code" class="input-field h-10 tnum tracking-[0.4em]">
              </div>
              <div>
                <label for="reset-new" class="block mb-1.5 text-sm font-semibold">{{ t('password.new') }}</label>
                <input id="reset-new" v-model="reset.password" type="password" required minlength="6" autocomplete="new-password" class="input-field h-10">
                <p class="mt-1 text-xs text-ink-subtle">{{ t('password.min_length') }}</p>
              </div>
              <div>
                <label for="reset-confirm" class="block mb-1.5 text-sm font-semibold">{{ t('password.confirm') }}</label>
                <input id="reset-confirm" v-model="reset.confirm" type="password" required autocomplete="new-password" class="input-field h-10">
              </div>
              <button type="submit" class="btn-primary w-full h-10" :disabled="reset.busy || reset.code.length !== 6 || !reset.password">
                {{ reset.busy ? t('common.saving') : t('password.reset_btn') }}
              </button>
              <button type="button" class="w-full text-sm text-primary hover:underline" :disabled="reset.busy" @click="sendCode">{{ t('password.resend') }}</button>
            </form>

            <button type="button" class="mt-6 text-sm text-ink-muted hover:text-ink" @click="backToLogin">← {{ t('password.back_to_login') }}</button>
          </template>

          <template v-else>
          <h2 class="text-2xl font-bold">{{ t('auth.welcome') }}</h2>
          <p class="mt-1 text-sm text-ink-muted">{{ t('auth.sign_in_desc') }}</p>

          <p v-if="resetDone" role="status" class="mt-6 rounded border border-success-line bg-success-soft px-3 py-2.5 text-sm text-success">{{ t('password.reset_done') }}</p>

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
              <div class="flex items-baseline justify-between mb-1.5">
                <label for="password" class="block text-sm font-semibold">{{ t('auth.password_label') }}</label>
                <button type="button" class="text-xs text-primary hover:underline" @click="openForgot">{{ t('password.forgot_link') }}</button>
              </div>
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
          </template>

          <p class="lg:hidden mt-10 text-center text-xs text-ink-subtle">© {{ year }} {{ t('auth.title') }} · {{ t('auth.footer') }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../application/stores/auth';
import { authRepository } from '../infrastructure/api/AuthRepository';
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

// ── Forgotten password ──
const mode = ref<'login' | 'forgot' | 'reset'>('login');
const resetDone = ref(false);
const reset = reactive({ identifier: '', code: '', password: '', confirm: '', busy: false, error: '' });

const openForgot = () => {
  Object.assign(reset, { identifier: loginIdentifier.value.trim(), code: '', password: '', confirm: '', busy: false, error: '' });
  resetDone.value = false;
  mode.value = 'forgot';
};
const backToLogin = () => { mode.value = 'login'; };

const sendCode = async () => {
  reset.busy = true;
  reset.error = '';
  try {
    await authRepository.forgotPassword(reset.identifier);
    reset.code = '';
    mode.value = 'reset';
  } catch (err) {
    reset.error = passwordErrorMessage(err, t);
  } finally {
    reset.busy = false;
  }
};

const submitReset = async () => {
  if (reset.password.length < 6) { reset.error = t('password.min_length'); return; }
  if (reset.password !== reset.confirm) { reset.error = t('password.mismatch'); return; }
  reset.busy = true;
  reset.error = '';
  try {
    await authRepository.resetPassword(reset.identifier, reset.code, reset.password);
    loginIdentifier.value = reset.identifier;
    password.value = '';
    resetDone.value = true;
    mode.value = 'login';
  } catch (err) {
    reset.error = passwordErrorMessage(err, t);
  } finally {
    reset.busy = false;
  }
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
