import { ref, computed } from 'vue';
import type { Province } from '../domain/models/Student';
import { adminRepository } from '../infrastructure/api/AdminRepository';

// Loaded once per session and shared by every page: the list never changes at runtime.
const provinces = ref<Province[]>([]);
let loading: Promise<void> | null = null;

export function useProvinces() {
  const { locale } = useI18n();

  const load = () => {
    if (provinces.value.length) return Promise.resolve();
    loading ??= adminRepository.getProvinces()
      .then((list) => { provinces.value = list; })
      .finally(() => { loading = null; });
    return loading;
  };

  const name = (x: { nameLo: string; nameEn: string } | null | undefined) =>
    x ? (locale.value === 'lo' ? x.nameLo : x.nameEn) || x.nameLo : '';

  const districtsOf = (provinceId: number | null | undefined) =>
    provinces.value.find((p) => p.provinceId === provinceId)?.districts ?? [];

  return { provinces: computed(() => provinces.value), load, name, districtsOf };
}
