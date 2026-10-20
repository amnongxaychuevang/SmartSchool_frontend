<template>
  <div class="w-full flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <NuxtLink
        to="/admin/classes"
        class="btn-secondary !px-0 w-9"
        :aria-label="$t('common.back')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </NuxtLink>
      <h1 class="text-xl font-bold text-ink leading-tight">
        {{ isEdit ? $t("classes.edit_class") : $t("classes.add_class") }}
      </h1>
    </div>

    <p
      v-if="errorMsg"
      role="alert"
      class="rounded border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger"
    >
      {{ errorMsg }}
    </p>

    <LoadingSpinner v-if="loading" />

    <form
      v-else
      class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] gap-4 items-start"
      @submit.prevent="handleSubmit"
    >
      <!-- ── Main column ── -->
      <div class="flex flex-col gap-4">
        <!-- Class details -->
        <section class="panel">
          <h2 class="card-title">
            <span class="card-icon bg-primary-soft text-primary-ink">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg> </span
            >{{ L("Class details", "ຂໍ້ມູນຫ້ອງຮຽນ") }}
          </h2>
          <div
            class="card-body grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3"
          >
            <label class="field">
              <span class="field-label"
                >{{ $t("classes.class_name_lo") }}
                <b class="text-danger">*</b></span
              >
              <input
                v-model="form.classNameLo"
                required
                maxlength="50"
                class="input-field"
                :placeholder="$t('classes.ph_name_lo')"
              />
            </label>
            <label class="field">
              <span class="field-label"
                >{{ $t("classes.class_name_en") }}
                <b class="text-danger">*</b></span
              >
              <input
                v-model="form.classNameEn"
                required
                maxlength="50"
                class="input-field"
                :placeholder="$t('classes.ph_name_en')"
              />
            </label>
            <label class="field">
              <span class="field-label"
                >{{ $t("classes.academic_year") }}
                <b class="text-danger">*</b></span
              >
              <select
                v-model="form.academicYear"
                required
                class="input-field tnum"
              >
                <option v-for="y in yearOptions" :key="y" :value="y">
                  {{ y }}
                </option>
              </select>
            </label>
            <label class="field">
              <span class="field-label">{{
                $t("classes.grade_level_lo")
              }}</span>
              <input
                v-model="form.gradeLevelLo"
                maxlength="20"
                class="input-field"
                :placeholder="$t('classes.ph_level_lo')"
              />
            </label>
            <label class="field">
              <span class="field-label">{{
                $t("classes.grade_level_en")
              }}</span>
              <input
                v-model="form.gradeLevelEn"
                maxlength="20"
                class="input-field"
                :placeholder="$t('classes.ph_level_en')"
              />
            </label>
            <label class="field">
              <span class="field-label">{{
                $t("classes.homeroom_teacher")
              }}</span>
              <select
                v-model.number="form.homeroomTeacherId"
                class="input-field"
              >
                <option :value="0">
                  {{ $t("classes.no_homeroom_teacher") }}
                </option>
                <option
                  v-for="tch in teacherChoices"
                  :key="tch.userId"
                  :value="tch.userId"
                >
                  {{ personName(tch) }}
                </option>
              </select>
            </label>
          </div>
        </section>

        <!-- Students in the class now (enrolment happens on the student form) -->
        <section v-if="isEdit" class="panel">
          <h2 class="card-title">
            <span class="card-icon bg-primary-soft text-primary-ink">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg> </span
            >{{ $t("classes.students") }}
            <span class="badge-neutral tnum">{{ students.length }}</span>
            <span class="ml-auto font-normal text-[11px] text-ink-subtle">{{
              L("Enrolled from the student form", "ລົງທະບຽນຈາກຟອມນັກຮຽນ")
            }}</span>
          </h2>
          <div class="card-body">
            <div
              v-if="students.length"
              class="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-2 max-h-[28rem] overflow-y-auto scrollbar-thin"
            >
              <NuxtLink
                v-for="s in students"
                :key="s.studentId"
                :to="`/admin/students/create?id=${s.studentId}`"
                class="flex items-center gap-3 rounded border border-line px-3 py-2 hover:bg-surface-2 transition-colors"
              >
                <PersonAvatar
                  :name="personName(s)"
                  :photo-url="s.photoUrl"
                  size="md"
                />
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-ink truncate">
                    {{ personName(s) }}
                  </p>
                  <p class="text-[11px] text-ink-subtle">
                    <span class="font-mono">{{ s.studentCode }}</span
                    ><template v-if="s.gender">
                      · {{ $t(`gender.${s.gender}`) }}</template
                    >
                  </p>
                </div>
              </NuxtLink>
            </div>
            <p
              v-else
              class="text-sm text-ink-subtle text-center py-4 rounded border border-dashed border-line"
            >
              {{
                L("No students in this class yet.", "ຍັງບໍ່ມີນັກຮຽນໃນຫ້ອງນີ້.")
              }}
            </p>
          </div>
        </section>

        <!-- Subjects this term (managed on the class-subjects page) -->
        <section v-if="isEdit" class="panel">
          <h2 class="card-title">
            <span class="card-icon bg-primary-soft text-primary-ink">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg> </span
            >{{ L("Subjects this term", "ວິຊາພາກຮຽນນີ້") }}
            <span class="badge-neutral tnum">{{ subjects.length }}</span>
            <NuxtLink
              to="/admin/academics/class-subjects"
              class="ml-auto font-normal text-[11px] text-primary-ink hover:underline"
              >{{ $t("nav.classSubjects") }} →</NuxtLink
            >
          </h2>
          <div class="card-body">
            <div
              v-if="subjects.length"
              class="divide-y divide-line rounded border border-line"
            >
              <div
                v-for="cs in subjects"
                :key="cs.id"
                class="flex items-center gap-3 px-3 py-2"
              >
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-ink truncate">
                    {{ subjectName(cs.subject) }}
                  </p>
                  <p
                    v-if="cs.subject.subjectCode"
                    class="text-[11px] text-ink-subtle font-mono"
                  >
                    {{ cs.subject.subjectCode }}
                  </p>
                </div>
                <span
                  class="text-xs shrink-0"
                  :class="cs.teacher ? 'text-ink-muted' : 'text-ink-subtle'"
                  >{{
                    cs.teacher
                      ? personName(cs.teacher)
                      : L("No teacher", "ຍັງບໍ່ມີຄູ")
                  }}</span
                >
              </div>
            </div>
            <p
              v-else
              class="text-sm text-ink-subtle text-center py-4 rounded border border-dashed border-line"
            >
              {{
                L(
                  "No subjects for the active term yet.",
                  "ຍັງບໍ່ມີວິຊາໃນພາກຮຽນນີ້.",
                )
              }}
            </p>
          </div>
        </section>
      </div>

      <!-- ── Side column: live summary + actions ── -->
      <div class="flex flex-col gap-4 lg:sticky lg:top-20">
        <section class="panel overflow-hidden">
          <div class="px-4 pt-5 pb-4 flex flex-col items-center text-center">
            <span
              class="w-20 h-20 rounded-2xl bg-primary-soft text-primary-ink flex items-center justify-center text-xl font-bold px-2 break-all leading-tight"
            >
              {{ form.classNameLo || form.classNameEn || "?" }}
            </span>
            <p
              class="mt-3 text-base font-bold text-ink leading-tight break-words max-w-full"
            >
              {{
                (locale === "lo"
                  ? form.classNameLo || form.classNameEn
                  : form.classNameEn || form.classNameLo) ||
                L("Class name", "ຊື່ຫ້ອງຮຽນ")
              }}
            </p>
            <p class="text-xs text-ink-subtle break-words max-w-full">
              {{
                (locale === "lo"
                  ? form.gradeLevelLo || form.gradeLevelEn
                  : form.gradeLevelEn || form.gradeLevelLo) || "—"
              }}
            </p>
            <div class="mt-3 flex flex-wrap justify-center gap-1.5">
              <span class="badge-neutral tnum">{{ form.academicYear }}</span>
            </div>

            <div v-if="isEdit" class="mt-4 w-full grid grid-cols-2 gap-2">
              <div class="rounded border border-line py-2">
                <p class="text-lg font-bold text-ink tnum">
                  {{ students.length }}
                </p>
                <p class="text-[11px] text-ink-subtle">
                  {{ $t("classes.students") }}
                </p>
              </div>
              <div class="rounded border border-line py-2">
                <p class="text-lg font-bold text-ink tnum">
                  {{ subjects.length }}
                </p>
                <p class="text-[11px] text-ink-subtle">
                  {{ $t("classes.subjects") }}
                </p>
              </div>
            </div>

            <div
              class="mt-3 w-full flex items-center gap-2.5 rounded border border-line px-3 py-2 text-left"
            >
              <PersonAvatar
                v-if="selectedTeacher"
                :name="personName(selectedTeacher)"
                :photo-url="selectedTeacher.avatarUrl"
                size="sm"
              />
              <div class="min-w-0">
                <p class="text-[11px] text-ink-subtle">
                  {{ $t("classes.homeroom_teacher") }}
                </p>
                <p class="text-sm text-ink truncate">
                  {{
                    selectedTeacher
                      ? personName(selectedTeacher)
                      : $t("classes.no_homeroom_teacher")
                  }}
                </p>
              </div>
            </div>
          </div>
          <div class="px-4 py-3 border-t border-line grid grid-cols-2 gap-2">
            <NuxtLink to="/admin/classes" class="btn-secondary">{{
              $t("common.cancel")
            }}</NuxtLink>
            <button type="submit" :disabled="isSubmitting" class="btn-primary">
              {{ isSubmitting ? $t("common.saving") : $t("common.save") }}
            </button>
          </div>
        </section>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAdminStore } from "../../../application/stores/admin";
import { adminRepository } from "../../../infrastructure/api/AdminRepository";
import type {
  SchoolClassDetail,
  TeacherOption,
} from "../../../domain/models/SchoolClass";

definePageMeta({ layout: "admin" });

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();
const { locale, t } = useI18n();
const L = (en: string, lo: string) => (locale.value === "lo" ? lo : en);

const editId = computed(() => (route.query.id ? Number(route.query.id) : null));
const isEdit = computed(() => editId.value !== null);
useHead({
  title: computed(
    () =>
      `${isEdit.value ? t("classes.edit_class") : t("classes.add_class")} — Smart School Admin`,
  ),
});

// School years run September → August, written "2026-2027" (same rule as the server).
const yearOf = (date = new Date()) => {
  const start =
    date.getMonth() >= 8 ? date.getFullYear() : date.getFullYear() - 1;
  return `${start}-${start + 1}`;
};
const shiftYear = (y: string, by: number) =>
  `${Number(y.slice(0, 4)) + by}-${Number(y.slice(0, 4)) + by + 1}`;

const form = reactive({
  classNameLo: "",
  classNameEn: "",
  gradeLevelLo: "",
  gradeLevelEn: "",
  academicYear: yearOf(),
  homeroomTeacherId: 0,
});
const students = ref<SchoolClassDetail["classStudents"][number]["student"][]>(
  [],
);
const subjects = ref<SchoolClassDetail["classSubjects"]>([]);
const teachers = ref<TeacherOption[]>([]);
const savedTeacher = ref<TeacherOption | null>(null);
const knownYears = ref<string[]>([]);

const loading = ref(false);
const isSubmitting = ref(false);
const errorMsg = ref("");

const personName = (p: {
  fullNameLo?: string | null;
  fullNameEn?: string | null;
}) =>
  (locale.value === "lo"
    ? p.fullNameLo || p.fullNameEn
    : p.fullNameEn || p.fullNameLo) || "";
const subjectName = (s: { subjectNameLo: string; subjectNameEn: string }) =>
  locale.value === "lo"
    ? s.subjectNameLo || s.subjectNameEn
    : s.subjectNameEn || s.subjectNameLo;

// Years already in use plus last/this/next school year, newest first.
const yearOptions = computed(() => {
  const current = yearOf();
  const all = new Set([
    ...knownYears.value,
    shiftYear(current, -1),
    current,
    shiftYear(current, 1),
    form.academicYear,
  ]);
  return [...all].sort().reverse();
});

// Active teachers, plus the saved homeroom teacher if they're no longer active.
const teacherChoices = computed(() =>
  savedTeacher.value &&
  !teachers.value.some((x) => x.userId === savedTeacher.value!.userId)
    ? [savedTeacher.value, ...teachers.value]
    : teachers.value,
);
const selectedTeacher = computed(
  () =>
    teacherChoices.value.find((x) => x.userId === form.homeroomTeacherId) ??
    null,
);

const errorMessage = (err: unknown, fallback: string) =>
  getErrorMessage(err, fallback);

onMounted(async () => {
  loading.value = true;
  try {
    const [teacherList, years, cls] = await Promise.all([
      adminRepository.getTeacherOptions(),
      adminRepository.getClassAcademicYears().catch(() => [] as string[]),
      editId.value
        ? adminRepository.getClass(editId.value)
        : Promise.resolve(null),
    ]);
    teachers.value = teacherList;
    knownYears.value = years;
    if (!cls) return;

    Object.assign(form, {
      classNameLo: cls.classNameLo,
      classNameEn: cls.classNameEn,
      gradeLevelLo: cls.gradeLevelLo ?? "",
      gradeLevelEn: cls.gradeLevelEn ?? "",
      academicYear: cls.academicYear,
      homeroomTeacherId: cls.homeroomTeacherId ?? 0,
    });
    students.value = cls.classStudents.map((cs) => cs.student);
    subjects.value = cls.classSubjects;
    if (cls.homeroomTeacher)
      savedTeacher.value = { ...cls.homeroomTeacher, employeeCode: "" };
  } catch (err) {
    errorMsg.value = errorMessage(err, "Failed to load");
  } finally {
    loading.value = false;
  }
});

const handleSubmit = async () => {
  errorMsg.value = "";
  isSubmitting.value = true;
  try {
    const payload: Record<string, unknown> = {
      classNameLo: form.classNameLo.trim(),
      classNameEn: form.classNameEn.trim(),
      gradeLevelLo: form.gradeLevelLo.trim(),
      gradeLevelEn: form.gradeLevelEn.trim(),
      academicYear: form.academicYear,
      homeroomTeacherId: form.homeroomTeacherId || null,
    };
    if (editId.value) await adminStore.updateClass(editId.value, payload);
    else await adminStore.createClass(payload);
    router.push("/admin/classes");
  } catch (err) {
    errorMsg.value = errorMessage(
      err,
      L(
        "Failed to save the class. Please try again.",
        "ບັນທຶກບໍ່ສຳເລັດ. ກະລຸນາລອງໃໝ່.",
      ),
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
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
