/**
 * useLocale — global language switcher composable
 * Supports: 'lo' (Lao) | 'en' (English)
 * Persisted to localStorage so the choice survives page reloads.
 */
import { ref, computed } from 'vue';

type Lang = 'lo' | 'en';

// Shared reactive state (module-level singleton)
const locale = ref<Lang>('lo');

// Attempt to restore saved preference on client
if (import.meta.client) {
  const saved = localStorage.getItem('locale') as Lang | null;
  if (saved === 'lo' || saved === 'en') locale.value = saved;
}

export const useLocale = () => {
  const isLao = computed(() => locale.value === 'lo');

  const setLocale = (lang: Lang) => {
    locale.value = lang;
    if (import.meta.client) localStorage.setItem('locale', lang);
  };

  const toggle = () => setLocale(locale.value === 'lo' ? 'en' : 'lo');

  /**
   * t() — return the right string based on current locale.
   * Usage: t('ຍິນດີຕ້ອນຮັບ', 'Welcome')
   */
  const t = (lao: string, en: string) => (locale.value === 'lo' ? lao : en);

  return { locale, isLao, setLocale, toggle, t };
};
