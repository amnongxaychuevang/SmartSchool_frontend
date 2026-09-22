<template>
  <div class="login-root">
    <!-- Animated background particles -->
    <div class="particles">
      <span v-for="n in 15" :key="n" class="particle" :style="particleStyle(n)" />
    </div>

    <!-- ══ LEFT PANEL (50%) ══ -->
    <div class="brand-panel">
      <div class="blob blob-1" />
      <div class="blob blob-2" />



      <div class="brand-content">
        <!-- Logo icon -->
        <div class="brand-icon">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="16" fill="url(#grad)" />
            <path d="M12 28 L32 16 L52 28 V44 C52 46.2 50.2 48 48 48 H16 C13.8 48 12 46.2 12 44 V28Z" fill="white" fill-opacity="0.15" />
            <path d="M20 48 V34 H44 V48" fill="white" fill-opacity="0.2" />
            <rect x="26" y="34" width="12" height="14" rx="2" fill="white" fill-opacity="0.4" />
            <path d="M12 28 L32 16 L52 28" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop stop-color="#0d9488" />
                <stop offset="1" stop-color="#0891b2" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <!-- Title -->
        <h1 class="brand-title">Smart School System</h1>
        <p class="brand-lao">{{ t('auth.subtitle') }}</p>
        <p class="brand-lao-sub">{{ t('auth.tagline') }}</p>

        <!-- Divider -->
        <div class="brand-divider">
          <span /><span class="brand-divider-dot" /><span />
        </div>

        <!-- Stats -->
        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-num">1,200+</span>
            <span class="stat-label">{{ t('stats.students') }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">85+</span>
            <span class="stat-label">{{ t('stats.teachers') }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">40+</span>
            <span class="stat-label">{{ t('stats.classes') }}</span>
          </div>
        </div>
      </div>

      <div class="wave-bottom">
        <svg viewBox="0 0 800 80" preserveAspectRatio="none">
          <path d="M0,40 C200,80 600,0 800,40 L800,80 L0,80 Z" fill="rgba(13,148,136,0.1)" />
          <path d="M0,55 C240,10 560,70 800,30 L800,80 L0,80 Z" fill="rgba(8,145,178,0.07)" />
        </svg>
      </div>
    </div>

    <!-- ══ RIGHT PANEL (50%) ══ -->
    <div class="form-panel">
      <!-- Language switcher — top-right of the form panel -->
      <div class="lang-switcher-wrap">
        <LangSwitch />
      </div>

      <div class="form-card">
        <div class="card-glow" />

        <!-- Header -->
        <div class="form-header">
          <h2>{{ t('auth.welcome') }}</h2>
          <p class="form-sub">{{ t('auth.sign_in_desc') }}</p>
        </div>

        <!-- Error -->
        <transition name="fade-slide">
          <div v-if="authStore.error" class="error-alert">
            <svg class="alert-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            {{ authStore.error }}
          </div>
        </transition>

        <form class="login-form" novalidate @submit.prevent="handleLogin">
          <!-- Email / Phone -->
          <div class="field-group" :class="{ focused: focusedField === 'id', filled: loginIdentifier }">
            <label for="identifier">{{ t('auth.email_label') }}</label>
            <div class="input-wrap">
              <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <input
                id="identifier"
                v-model="loginIdentifier"
                type="text"
                required
                autocomplete="username"
                :placeholder="t('auth.email_placeholder')"
                @focus="focusedField = 'id'"
                @blur="focusedField = ''"
              >
            </div>
          </div>

          <!-- Password -->
          <div class="field-group" :class="{ focused: focusedField === 'pw', filled: password }">
            <label for="password">{{ t('auth.password_label') }}</label>
            <div class="input-wrap">
              <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
              </svg>
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                placeholder="••••••••"
                @focus="focusedField = 'pw'"
                @blur="focusedField = ''"
              >
              <button type="button" class="eye-btn" tabindex="-1" @click="showPassword = !showPassword">
                <svg v-if="!showPassword" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                </svg>
                <svg v-else viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Forgot password -->
          <div class="form-meta">
            <a href="#" class="forgot-link">{{ t('auth.forgot_password') }}</a>
          </div>

          <!-- Submit -->
          <button type="submit" class="submit-btn" :disabled="authStore.loading">
            <span v-if="!authStore.loading" class="btn-content">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              {{ t('auth.sign_in_btn') }}
            </span>
            <span v-else class="btn-loading">
              <svg class="spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-opacity="0.25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ t('auth.signing_in') }}
            </span>
          </button>
        </form>

        <div class="form-footer">
          © {{ new Date().getFullYear() }} Smart School System · {{ t('auth.footer') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../application/stores/auth';

definePageMeta({ layout: 'default' });

const { t, locale } = useI18n();

useHead({
  title: 'Smart School System',
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Phetsarath:wght@400;700&display=swap',
    },
  ],
});

const loginIdentifier = ref('admin@smartschool.com');
const password        = ref('password123');
const showPassword    = ref(false);
const focusedField    = ref('');
const authStore       = useAuthStore();
const router          = useRouter();

const particleStyle = (n: number) => ({
  left:             `${(n * 73) % 100}%`,
  top:              `${(n * 47) % 100}%`,
  width:            `${4 + (n % 5) * 4}px`,
  height:           `${4 + (n % 5) * 4}px`,
  animationDelay:   `${(n * 0.4) % 5}s`,
  animationDuration:`${5 + (n % 4) * 2}s`,
  opacity:          `${0.05 + (n % 4) * 0.03}`,
});

const handleLogin = async () => {
  try {
    const user = await authStore.login(loginIdentifier.value, password.value);
    console.log('Login successful, user:', user);
    if (user?.role === 'admin')        await router.push('/admin');
    else if (user?.role === 'teacher') await router.push('/teacher');
    else if (user?.role === 'parent')  await router.push('/parent');
  } catch (err) {
    console.error('Login error:', err);
    // error shown via authStore.error
  }
};
</script>

<style scoped>
:root {
  --font-lao:     'Phetsarath', 'Phetsarath OT', sans-serif;
  --font-heading: 'Times New Roman', 'Georgia', serif;
  --font-body:    'Inter', 'Segoe UI', sans-serif;
}

/* ─── Root: true 50/50 split ─────────────────────── */
.login-root {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  overflow: hidden;
  background: #0b1120;
  font-family: var(--font-lao);
}

/* ─── Particles ───────────────────────────────────── */
.particles { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.particle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, #0d9488, #06b6d4);
  animation: floatUp linear infinite;
}
@keyframes floatUp {
  0%   { transform: translateY(0)     scale(1);    }
  50%  { transform: translateY(-28px) scale(1.12); }
  100% { transform: translateY(0)     scale(1);    }
}

/* ══ LEFT PANEL — 50% ═══════════════════════════════ */
.brand-panel {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(145deg, #0d1f2d 0%, #091824 55%, #07131e 100%);
  overflow: hidden;
  z-index: 1;
}
@media (max-width: 700px) { .brand-panel { display: none; } }

/* Lang switcher positions */
.lang-switcher-wrap {
  position: absolute;
  top: 24px; right: 24px;
  z-index: 10;
}

/* Glowing blobs */
.blob { position: absolute; border-radius: 50%; filter: blur(90px); pointer-events: none; }
.blob-1 {
  width: 480px; height: 480px;
  background: radial-gradient(circle, rgba(13,148,136,0.22), transparent 70%);
  top: -120px; left: -100px;
  animation: pulsate 8s ease-in-out infinite;
}
.blob-2 {
  width: 360px; height: 360px;
  background: radial-gradient(circle, rgba(8,145,178,0.16), transparent 70%);
  bottom: -80px; right: -60px;
  animation: pulsate 10s ease-in-out infinite reverse;
}
@keyframes pulsate {
  0%, 100% { transform: scale(1);     }
  50%       { transform: scale(1.18); }
}

.brand-content {
  position: relative; z-index: 2;
  display: flex; flex-direction: column;
  align-items: center; text-align: center;
  gap: 14px; padding: 48px 40px; width: 100%;
}

/* Logo */
.brand-icon svg {
  width: 96px; height: 96px;
  filter: drop-shadow(0 0 28px rgba(13,148,136,0.65));
  animation: iconFloat 4s ease-in-out infinite;
}
@keyframes iconFloat {
  0%, 100% { transform: translateY(0);     }
  50%       { transform: translateY(-12px); }
}

/* Typography */
.brand-title {
  font-family: var(--font-heading);
  font-size: 2rem; font-weight: 700; line-height: 1.2;
  color: #ffffff; margin: 4px 0 0;
}
.brand-lao {
  font-family: var(--font-lao);
  font-size: 1.2rem; font-weight: 700;
  color: #e2e8f0; margin: 0;
}
.brand-lao-sub {
  font-family: var(--font-lao);
  font-size: 0.9rem; color: #94a3b8; margin: -4px 0 0;
}

/* Divider */
.brand-divider {
  display: flex; align-items: center; gap: 10px;
  width: 60%; margin: 4px 0;
}
.brand-divider span {
  flex: 1; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(45,212,191,0.3), transparent);
}
.brand-divider-dot {
  flex: unset; width: 6px; height: 6px;
  border-radius: 50%; background: #2dd4bf; flex-shrink: 0;
}

/* Stats */
.stats-row {
  display: flex; gap: 12px;
  flex-wrap: wrap; justify-content: center; margin-top: 8px;
}
.stat-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px; padding: 14px 20px;
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  backdrop-filter: blur(8px);
  transition: transform 0.3s, border-color 0.3s; min-width: 88px;
}
.stat-card:hover { transform: translateY(-5px); border-color: rgba(45,212,191,0.4); }
.stat-num {
  font-family: var(--font-heading);
  font-size: 1.5rem; font-weight: 700;
  background: linear-gradient(90deg, #2dd4bf, #22d3ee);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.stat-label {
  font-family: var(--font-lao);
  font-size: 0.72rem; color: #64748b; text-align: center;
}

/* Wave */
.wave-bottom { position: absolute; bottom: 0; left: 0; width: 100%; height: 80px; }
.wave-bottom svg { width: 100%; height: 100%; }

/* ══ RIGHT PANEL — 50% ════════════════════════════ */
.form-panel {
  position: relative; z-index: 2;
  flex: 1 1 0; min-width: 0;
  display: flex; align-items: center; justify-content: center;
  padding: 32px 24px;
  background: linear-gradient(160deg, #0d1827 0%, #0b1120 100%);
  border-left: 1px solid rgba(255,255,255,0.05);
}
@media (max-width: 700px) { .form-panel { flex: unset; width: 100%; border-left: none; } }

/* Card */
.form-card {
  position: relative; width: 100%; max-width: 440px;
  background: rgba(255,255,255,0.035);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 26px; padding: 44px 40px 36px;
  backdrop-filter: blur(24px);
  box-shadow: 0 30px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06);
}
.card-glow {
  position: absolute; inset: -1px; border-radius: 27px;
  background: linear-gradient(135deg, rgba(13,148,136,0.28), transparent 50%, rgba(8,145,178,0.18));
  z-index: -1; pointer-events: none;
}

/* Form header */
.form-header { text-align: center; margin-bottom: 28px; }
.form-header h2 {
  font-family: var(--font-lao);
  font-size: 1.9rem; font-weight: 700;
  color: #f1f5f9; margin: 0 0 6px;
}
.form-sub {
  font-family: var(--font-lao);
  font-size: 0.85rem; color: #64748b; margin: 0;
}

/* Error */
.error-alert {
  display: flex; align-items: center; gap: 8px;
  background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
  color: #fca5a5; padding: 10px 14px; border-radius: 10px;
  font-family: var(--font-lao); font-size: 0.85rem; margin-bottom: 18px;
}
.alert-icon { width: 16px; height: 16px; flex-shrink: 0; }

.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.3s ease; }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(-8px); }

/* Form */
.login-form { display: flex; flex-direction: column; gap: 20px; }

.field-group { display: flex; flex-direction: column; gap: 7px; }
.field-group label {
  font-family: var(--font-lao);
  font-size: 0.85rem; font-weight: 600;
  color: #94a3b8; transition: color 0.2s;
}
.field-group.focused label { color: #2dd4bf; }

.input-wrap { position: relative; display: flex; align-items: center; }
.input-icon {
  position: absolute; left: 14px; width: 16px; height: 16px;
  color: #475569; pointer-events: none; transition: color 0.2s;
}
.field-group.focused .input-icon { color: #2dd4bf; }

.input-wrap input {
  width: 100%; background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1); border-radius: 13px;
  padding: 13px 42px; font-family: var(--font-body);
  font-size: 0.9rem; color: #f1f5f9; outline: none;
  transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
  caret-color: #2dd4bf;
}
.input-wrap input::placeholder { color: #475569; }
.input-wrap input:focus {
  border-color: rgba(45,212,191,0.5);
  background: rgba(45,212,191,0.04);
  box-shadow: 0 0 0 4px rgba(45,212,191,0.08);
}

/* Eye */
.eye-btn {
  position: absolute; right: 13px; background: none; border: none;
  cursor: pointer; padding: 4px; color: #475569;
  display: flex; align-items: center; transition: color 0.2s;
}
.eye-btn:hover { color: #2dd4bf; }
.eye-btn svg { width: 16px; height: 16px; }

/* Forgot */
.form-meta { display: flex; justify-content: flex-end; margin-top: -8px; }
.forgot-link {
  font-family: var(--font-lao); font-size: 0.82rem;
  color: #2dd4bf; text-decoration: none; transition: opacity 0.2s;
}
.forgot-link:hover { opacity: 0.7; }

/* Submit */
.submit-btn {
  width: 100%; padding: 14px; border: none; border-radius: 13px;
  background: linear-gradient(135deg, #0d9488, #0891b2);
  color: #fff; font-family: var(--font-lao); font-size: 1rem; font-weight: 700;
  cursor: pointer; position: relative; overflow: hidden;
  transition: opacity 0.25s, transform 0.2s, box-shadow 0.25s;
  box-shadow: 0 4px 24px rgba(13,148,136,0.42); margin-top: 4px;
}
.submit-btn::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, #14b8a6, #06b6d4);
  opacity: 0; transition: opacity 0.3s;
}
.submit-btn:hover:not(:disabled)::before { opacity: 1; }
.submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(13,148,136,0.58); }
.submit-btn:active:not(:disabled) { transform: translateY(0); }
.submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-content, .btn-loading {
  position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.btn-content svg { width: 18px; height: 18px; }
.spin { width: 18px; height: 18px; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Footer */
.form-footer {
  text-align: center; margin-top: 26px;
  font-family: var(--font-lao); font-size: 0.72rem; color: #334155;
}
</style>
