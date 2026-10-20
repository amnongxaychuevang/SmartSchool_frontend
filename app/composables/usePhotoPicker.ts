import { ref, computed, onBeforeUnmount } from 'vue';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Photo field for a person form: pick + preview locally, then upload after the
 * record is saved (a new record has no id until then). Validation mirrors the API.
 */
export function usePhotoPicker(L: (en: string, lo: string) => string) {
  const input = ref<HTMLInputElement | null>(null);
  const existingUrl = ref<string | null>(null);
  const file = ref<File | null>(null);
  const preview = ref<string | null>(null);
  const removed = ref(false);
  const error = ref('');

  const shown = computed(() => preview.value ?? (removed.value ? null : existingUrl.value));

  const clearPreview = () => {
    if (preview.value) URL.revokeObjectURL(preview.value);
    preview.value = null;
  };

  const pick = () => input.value?.click();

  const onPicked = (e: Event) => {
    const el = e.target as HTMLInputElement;
    const picked = el.files?.[0];
    el.value = ''; // allow picking the same file again
    if (!picked) return;
    error.value = '';
    if (!PHOTO_TYPES.includes(picked.type)) {
      error.value = L('Choose a JPG, PNG or WebP image', 'ກະລຸນາເລືອກຮູບ JPG, PNG ຫຼື WebP');
      return;
    }
    if (picked.size > MAX_PHOTO_BYTES) {
      error.value = L('The image must be 5 MB or smaller', 'ຮູບຕ້ອງບໍ່ເກີນ 5 MB');
      return;
    }
    clearPreview();
    file.value = picked;
    preview.value = URL.createObjectURL(picked);
    removed.value = false;
  };

  const remove = () => {
    clearPreview();
    file.value = null;
    removed.value = true;
    error.value = '';
  };

  /** Applies the pending change (new photo or removal) once the record exists. */
  const persist = async (upload: (f: File) => Promise<unknown>, destroy: () => Promise<unknown>) => {
    if (file.value) await upload(file.value);
    else if (removed.value && existingUrl.value) await destroy();
  };

  onBeforeUnmount(clearPreview);

  return { input, existingUrl, shown, error, pick, onPicked, remove, persist };
}
