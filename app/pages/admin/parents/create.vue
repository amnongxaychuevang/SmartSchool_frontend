<template>
  <div class="w-full flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <NuxtLink to="/admin/parents" class="btn-secondary !px-0 w-9" :aria-label="$t('common.back')">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
      </NuxtLink>
      <h1 class="text-xl font-bold text-ink leading-tight">{{ isEdit ? $t('parents.edit_parent') : $t('parents.add_parent') }}</h1>
    </div>

    <p v-if="errorMsg" role="alert" class="rounded border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger">{{ errorMsg }}</p>

    <LoadingSpinner v-if="loading" />

    <form v-else class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] gap-4 items-start" @submit.prevent="handleSubmit">
      <!-- ── Main column ── -->
      <div class="flex flex-col gap-4">
        <!-- Personal -->
        <section class="panel">
          <h2 class="card-title"><span class="card-icon bg-primary-soft text-primary-ink">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </span>{{ L('Personal details', 'ຂໍ້ມູນສ່ວນຕົວ') }}</h2>
          <div class="card-body grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3">
            <label class="field xl:col-span-2">
              <span class="field-label">{{ $t('users.full_name_lo') }} <b class="text-danger">*</b></span>
              <input v-model="form.fullNameLo" required maxlength="150" class="input-field" :placeholder="$t('forms.ph_full_name_lo')">
            </label>
            <label class="field xl:col-span-2">
              <span class="field-label">{{ $t('users.full_name_en') }} <b class="text-danger">*</b></span>
              <input v-model="form.fullNameEn" required maxlength="150" class="input-field" :placeholder="$t('forms.ph_full_name_en')">
            </label>
            <label class="field xl:col-span-2">
              <span class="field-label">{{ $t('parents.occupation') }}</span>
              <input v-model="form.occupation" maxlength="150" class="input-field" :placeholder="$t('parents.ph_occupation')">
            </label>
            <label class="field xl:col-span-2">
              <span class="field-label">{{ $t('users.phone') }} <b class="text-danger">*</b></span>
              <PhoneInput v-model="form.phoneNumber" required />
            </label>
            <label class="field xl:col-span-2">
              <span class="field-label">{{ $t('parents.emergency_contact') }}</span>
              <PhoneInput v-model="form.emergencyContact" />
            </label>
            <label class="field xl:col-span-2">
              <span class="field-label">{{ $t('parents.national_id') }}</span>
              <input v-model="form.nationalId" maxlength="30" autocomplete="off" class="input-field" :placeholder="$t('parents.ph_national_id')">
            </label>
          </div>
        </section>

        <!-- Address (same fields as the student form) -->
        <section class="panel">
          <h2 class="card-title"><span class="card-icon bg-primary-soft text-primary-ink">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </span>{{ $t('common.address') }}</h2>
          <div class="card-body grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <label class="field">
              <span class="field-label">{{ L('Province', 'ແຂວງ') }}</span>
              <select v-model.number="form.provinceId" class="input-field" @change="form.districtId = 0">
                <option :value="0">{{ L('Please select a province', 'ກະລຸນາເລືອກແຂວງ') }}</option>
                <option v-for="p in provinces" :key="p.provinceId" :value="p.provinceId">{{ placeName(p) }}</option>
              </select>
            </label>
            <label class="field">
              <span class="field-label">{{ L('District', 'ເມືອງ') }}</span>
              <select v-model.number="form.districtId" class="input-field" :disabled="!form.provinceId">
                <option :value="0">{{ form.provinceId ? L('Please select a district', 'ກະລຸນາເລືອກເມືອງ') : L('Please select a province first', 'ກະລຸນາເລືອກແຂວງກ່ອນ') }}</option>
                <option v-for="d in districtsOf(form.provinceId)" :key="d.districtId" :value="d.districtId">{{ placeName(d) }}</option>
              </select>
            </label>
            <label class="field">
              <span class="field-label">{{ L('Village', 'ບ້ານ') }}</span>
              <input v-model="form.village" maxlength="100" class="input-field">
            </label>
            <label class="field">
              <span class="field-label">{{ L('House no. / details', 'ເລກເຮືອນ / ລາຍລະອຽດ') }}</span>
              <input v-model="form.address" maxlength="100" class="input-field">
            </label>
          </div>
        </section>

        <!-- Linked students (links are made on the student form) -->
        <section v-if="isEdit" class="panel">
          <h2 class="card-title"><span class="card-icon bg-primary-soft text-primary-ink">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
          </span>{{ $t('parents.children') }}
          <span v-if="children.length" class="badge-neutral tnum">{{ children.length }}</span>
          <span class="ml-auto font-normal text-[11px] text-ink-subtle">{{ L('Linked from the student form', 'ເຊື່ອມໂຍງຈາກຟອມນັກຮຽນ') }}</span></h2>
          <div class="card-body">
            <div v-if="children.length" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <NuxtLink
                v-for="c in children"
                :key="c.student.studentId"
                :to="`/admin/students/create?id=${c.student.studentId}`"
                class="flex items-center gap-3 rounded border border-line px-3 py-2 hover:bg-surface-2 transition-colors"
              >
                <PersonAvatar :name="localName(c.student)" :photo-url="c.student.photoUrl" size="md" />
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-ink truncate">{{ localName(c.student) }}</p>
                  <p class="text-[11px] text-ink-subtle font-mono">{{ c.student.studentCode }}</p>
                </div>
                <div class="flex flex-col items-end gap-1 shrink-0">
                  <span class="badge-neutral">{{ $t(`relationship.${c.relationship}`) }}</span>
                  <span v-if="c.isPrimaryContact" class="badge-info">{{ L('Primary contact', 'ຜູ້ຕິດຕໍ່ຫຼັກ') }}</span>
                </div>
              </NuxtLink>
            </div>
            <p v-else class="text-sm text-ink-subtle text-center py-4 rounded border border-dashed border-line">
              {{ L('No students linked yet. Choose this parent on the student form.', 'ຍັງບໍ່ມີນັກຮຽນ. ເລືອກຜູ້ປົກຄອງຄົນນີ້ຢູ່ໃນຟອມນັກຮຽນ.') }}
            </p>
          </div>
        </section>
      </div>

      <!-- ── Side column: live summary + actions ── -->
      <div class="flex flex-col gap-4 lg:sticky lg:top-20">
        <section class="panel overflow-hidden">
          <div class="px-4 pt-5 pb-4 flex flex-col items-center text-center">
            <!-- Photo: click to choose; saved together with the parent -->
            <button
              type="button"
              class="group relative rounded-full ring-4 ring-[rgb(var(--surface))] focus-visible:outline-none focus-visible:ring-primary"
              :aria-label="shownPhoto ? L('Change photo', 'ປ່ຽນຮູບ') : L('Add photo', 'ເພີ່ມຮູບ')"
              @click="pickPhoto"
            >
              <PersonAvatar :name="form.fullNameLo || form.fullNameEn || '?'" :photo-url="shownPhoto" size="xl" />
              <span class="absolute inset-0 rounded-full bg-black/45 text-white flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {{ shownPhoto ? L('Change', 'ປ່ຽນ') : L('Add photo', 'ເພີ່ມຮູບ') }}
              </span>
            </button>
            <input ref="photoInput" type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" tabindex="-1" @change="onPhotoPicked">
            <p v-if="photoError" role="alert" class="mt-1.5 text-xs text-danger">{{ photoError }}</p>
            <button v-else-if="shownPhoto" type="button" class="mt-1.5 text-xs text-ink-subtle hover:text-danger" @click="removePhoto">
              {{ L('Remove photo', 'ລຶບຮູບ') }}
            </button>

            <p class="mt-2 text-base font-bold text-ink leading-tight break-words max-w-full">
              {{ form.fullNameLo || L('Parent name', 'ຊື່ຜູ້ປົກຄອງ') }}
            </p>
            <p class="text-xs text-ink-subtle break-words max-w-full">{{ form.fullNameEn || '—' }}</p>
            <div class="mt-3 flex flex-wrap justify-center gap-1.5">
              <span :class="isActive ? 'badge-success' : 'badge-danger'">{{ isActive ? $t('common.active') : $t('common.inactive') }}</span>
              <span v-if="form.occupation" class="badge-neutral">{{ form.occupation }}</span>
              <span v-if="isEdit" class="badge-neutral">{{ $t('parents.children') }} {{ children.length }}</span>
            </div>
          </div>
          <div class="px-4 py-3 border-t border-line grid grid-cols-2 gap-2">
            <NuxtLink to="/admin/parents" class="btn-secondary">{{ $t('common.cancel') }}</NuxtLink>
            <button type="submit" :disabled="isSubmitting" class="btn-primary">
              {{ isSubmitting ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
        </section>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAdminStore } from '../../../application/stores/admin';
import { adminRepository } from '../../../infrastructure/api/AdminRepository';
import { usePhotoPicker } from '../../../composables/usePhotoPicker';
import type { ParentChild } from '../../../domain/models/Parent';

definePageMeta({ layout: 'admin' });

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();
const dialog = useDialog();
const { locale, t } = useI18n();
const L = (en: string, lo: string) => (locale.value === 'lo' ? lo : en);

const editId = computed(() => (route.query.id ? Number(route.query.id) : null));
const isEdit = computed(() => editId.value !== null);
useHead({ title: computed(() => `${isEdit.value ? t('parents.edit_parent') : t('parents.add_parent')} — Smart School Admin`) });

const form = reactive({
  fullNameLo: '',
  fullNameEn: '',
  occupation: '',
  phoneNumber: '',
  nationalId: '',
  provinceId: 0,
  districtId: 0,
  village: '',
  address: '',
  emergencyContact: '',
});
// Shown only; status is changed from the parents list.
const isActive = ref(true);
const children = ref<ParentChild[]>([]);

const loading = ref(false);
const isSubmitting = ref(false);
const errorMsg = ref('');
const {
  input: photoInput,
  existingUrl: existingPhotoUrl,
  shown: shownPhoto,
  error: photoError,
  pick: pickPhoto,
  onPicked: onPhotoPicked,
  remove: removePhoto,
  persist: persistPhoto,
} = usePhotoPicker(L);

const { provinces, load: loadProvinces, name: placeName, districtsOf } = useProvinces();

const localName = (x: { fullNameLo?: string | null; fullNameEn?: string | null }) =>
  (locale.value === 'lo' ? x.fullNameLo || x.fullNameEn : x.fullNameEn || x.fullNameLo) || '';

const errorMessage = (err: unknown, fallback: string) => getErrorMessage(err, fallback);

onMounted(async () => {
  loading.value = true;
  try {
    await loadProvinces();
    if (!editId.value) return;
    const parent = await adminRepository.getParent(editId.value);
    Object.assign(form, {
      fullNameLo: parent.user?.fullNameLo ?? '',
      fullNameEn: parent.user?.fullNameEn ?? '',
      occupation: parent.occupation ?? '',
      phoneNumber: parent.user?.phoneNumber ?? '',
      nationalId: parent.nationalId ?? '',
      provinceId: parent.provinceId ?? 0,
      districtId: parent.districtId ?? 0,
      village: parent.village ?? '',
      address: parent.address ?? '',
      emergencyContact: parent.emergencyContact ?? '',
    });
    isActive.value = parent.user?.isActive ?? true;
    children.value = parent.studentLinks ?? [];
    existingPhotoUrl.value = parent.user?.avatarUrl ?? null;
  } catch (err) {
    errorMsg.value = errorMessage(err, 'Failed to load');
  } finally {
    loading.value = false;
  }
});

const handleSubmit = async () => {
  errorMsg.value = '';
  if (!form.phoneNumber.trim()) {
    errorMsg.value = L('Enter a phone number.', 'ກະລຸນາປ້ອນເບີໂທ.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  isSubmitting.value = true;
  try {
    // Empty optional fields are left out on create and cleared on edit.
    const payload: Record<string, unknown> = {
      fullNameLo: form.fullNameLo.trim(),
      fullNameEn: form.fullNameEn.trim(),
    };
    for (const key of ['phoneNumber', 'occupation', 'nationalId', 'village', 'address', 'emergencyContact'] as const) {
      const value = form[key].trim();
      if (value || isEdit.value) payload[key] = value;
    }
    // 0 = nothing picked; on edit that clears the saved value.
    for (const key of ['provinceId', 'districtId'] as const) {
      if (form[key]) payload[key] = form[key];
      else if (isEdit.value) payload[key] = null;
    }

    const saved = editId.value
      ? await adminStore.updateParent(editId.value, payload)
      : await adminStore.createParent(payload);

    // The parent is saved at this point; a failed photo step must not lose that.
    try {
      await persistPhoto(
        (file) => adminRepository.uploadParentPhoto(saved.parentId, file),
        () => adminRepository.deleteParentPhoto(saved.parentId),
      );
    } catch (err) {
      await dialog.warning(L('The parent was saved, but the photo could not be saved: ', 'ບັນທຶກຜູ້ປົກຄອງແລ້ວ ແຕ່ບັນທຶກຮູບບໍ່ສຳເລັດ: ') + errorMessage(err, ''));
    }
    router.push('/admin/parents');
  } catch (err) {
    errorMsg.value = errorMessage(err, L('Failed to save the parent. Please try again.', 'ບັນທຶກບໍ່ສຳເລັດ. ກະລຸນາລອງໃໝ່.'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped lang="postcss">
.card-title {
  @apply flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-ink border-b border-line;
}
.card-icon {
  @apply w-6 h-6 rounded flex items-center justify-center shrink-0;
}
.card-body {
  @apply p-4;
}
.field {
  @apply flex flex-col gap-1 min-w-0;
}
.field-label {
  @apply text-xs font-medium text-ink-muted;
}
</style>
