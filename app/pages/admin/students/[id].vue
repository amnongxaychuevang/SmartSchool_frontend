<template>
  <div class="w-full flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <NuxtLink to="/admin/students" class="btn-secondary !px-0 w-9" :aria-label="$t('students.back_to_list')">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
      </NuxtLink>
      <h1 class="text-xl font-bold text-ink leading-tight">{{ editing ? $t('students.edit_title') : $t('students.detail_title') }}</h1>
      <button v-if="!loading && !editing && student" type="button" class="ml-auto btn-secondary flex items-center gap-1.5" @click="startEditing">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        {{ $t('common.edit') }}
      </button>
    </div>

    <p v-if="errorMsg" role="alert" class="rounded border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger">{{ errorMsg }}</p>

    <LoadingSpinner v-if="loading" />

    <!-- ═══════ VIEW MODE ═══════ -->
    <template v-else-if="student && !editing">
      <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] gap-4 items-start">
        <!-- Main column -->
        <div class="flex flex-col gap-4">
          <!-- Personal details -->
          <section class="panel">
            <h2 class="card-title"><span class="card-icon bg-primary-soft text-primary-ink">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </span>{{ $t('students.personal_details') }}</h2>
            <div class="card-body grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="field col-span-2">
                <span class="field-label">{{ $t('students.full_name_lo') }}</span>
                <p class="field-value">{{ student.fullNameLo || dash }}</p>
              </div>
              <div class="field col-span-2">
                <span class="field-label">{{ $t('students.full_name_en') }}</span>
                <p class="field-value">{{ student.fullNameEn || dash }}</p>
              </div>
              <div class="field">
                <span class="field-label">{{ $t('common.gender') }}</span>
                <p class="field-value">{{ student.gender ? $t(`gender.${student.gender}`) : dash }}</p>
              </div>
              <div class="field">
                <span class="field-label">{{ L('Date of birth', 'ວັນເດືອນປີເກີດ') }}</span>
                <p class="field-value">{{ student.dateOfBirth ? formatDate(student.dateOfBirth) : dash }}</p>
              </div>
              <div class="field">
                <span class="field-label">{{ L('Ethnicity', 'ຊົນເຜົ່າ') }}</span>
                <p class="field-value">{{ ethnicityName || dash }}</p>
              </div>
              <div class="field">
                <span class="field-label">{{ L('Blood type', 'ກຸ່ມເລືອດ') }}</span>
                <p class="field-value">{{ student.bloodType || dash }}</p>
              </div>
              <div class="field col-span-2">
                <span class="field-label">{{ $t('common.class') }}</span>
                <p class="field-value">{{ viewClassName || dash }}</p>
              </div>
              <div class="field col-span-2">
                <span class="field-label">{{ L('Birthplace', 'ບ້ານເກີດ') }}</span>
                <p class="field-value">{{ student.birthPlace || dash }}</p>
              </div>
            </div>
          </section>

          <!-- Address -->
          <section class="panel">
            <h2 class="card-title"><span class="card-icon bg-primary-soft text-primary-ink">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </span>{{ $t('common.address') }}</h2>
            <div class="card-body grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <div class="field">
                <span class="field-label">{{ L('Province', 'ແຂວງ') }}</span>
                <p class="field-value">{{ placeName(student.province) || dash }}</p>
              </div>
              <div class="field">
                <span class="field-label">{{ L('District', 'ເມືອງ') }}</span>
                <p class="field-value">{{ placeName(student.district) || dash }}</p>
              </div>
              <div class="field">
                <span class="field-label">{{ L('Village', 'ບ້ານ') }}</span>
                <p class="field-value">{{ student.village || dash }}</p>
              </div>
              <div class="field">
                <span class="field-label">{{ L('House no. / details', 'ເລກເຮືອນ / ລາຍລະອຽດ') }}</span>
                <p class="field-value">{{ student.address || dash }}</p>
              </div>
            </div>
          </section>

          <!-- Background & health -->
          <section class="panel">
            <h2 class="card-title"><span class="card-icon bg-primary-soft text-primary-ink">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </span>{{ $t('students.background_health') }}</h2>
            <div class="card-body grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="field">
                <span class="field-label">{{ L('Previous school', 'ໂຮງຮຽນເກົ່າ') }}</span>
                <p class="field-value">{{ student.previousSchool || dash }}</p>
              </div>
              <div class="field">
                <span class="field-label">{{ L('Allergies / medical conditions', 'ການແພ້ / ພະຍາດປະຈຳຕົວ') }}</span>
                <p class="field-value">{{ student.medicalNotes || dash }}</p>
              </div>
              <div class="field">
                <span class="field-label">{{ $t('common.notes') }}</span>
                <p class="field-value">{{ student.notes || dash }}</p>
              </div>
            </div>
          </section>
        </div>

        <!-- Side column: summary + parents (read-only) -->
        <div class="flex flex-col gap-4 lg:sticky lg:top-20">
          <section class="panel overflow-hidden">
            <div class="px-4 pt-5 pb-4 flex flex-col items-center text-center">
              <PersonAvatar :name="studentDisplayName" :photo-url="student.photoUrl" size="xl" />
              <p class="mt-2 text-base font-bold text-ink leading-tight break-words max-w-full">
                {{ locale === 'lo' ? (student.fullNameLo || student.fullNameEn) : (student.fullNameEn || student.fullNameLo) }}
              </p>
              <p class="text-xs text-ink-subtle break-words max-w-full">{{ locale === 'lo' ? student.fullNameEn : student.fullNameLo }}</p>
              <p v-if="student.studentCode" class="mt-1 text-xs font-mono text-ink-muted">{{ student.studentCode }}</p>
              <div class="mt-3 flex flex-wrap justify-center gap-1.5">
                <span :class="STATUS_BADGE[student.status]">{{ statusLabel(student.status) }}</span>
                <span class="badge-neutral">{{ viewClassName || L('No class', 'ບໍ່ມີຫ້ອງ') }}</span>
                <span v-if="student.gender" class="badge-neutral">{{ $t(`gender.${student.gender}`) }}</span>
                <span v-if="student.dateOfBirth" class="badge-neutral">{{ studentAge(student.dateOfBirth) }} {{ $t('common.years_old') }}</span>
              </div>
            </div>
            <div class="px-4 py-3 border-t border-line grid grid-cols-2 gap-2">
              <NuxtLink to="/admin/students" class="btn-secondary">{{ $t('students.back_to_list') }}</NuxtLink>
              <button type="button" class="btn-primary" @click="startEditing">
                {{ $t('common.edit') }}
              </button>
            </div>
          </section>

          <!-- Parents (view mode) -->
          <section class="panel">
            <h2 class="card-title">
              <span class="card-icon bg-primary-soft text-primary-ink">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </span>
              {{ $t('nav.parents') }}
              <span v-if="student.parentStudents && student.parentStudents.length" class="ml-auto badge-neutral tnum">{{ student.parentStudents.length }}</span>
            </h2>
            <div class="card-body">
              <p v-if="!student.parentStudents || !student.parentStudents.length" class="text-sm text-ink-subtle text-center py-4 rounded border border-dashed border-line">
                {{ L('No parents linked.', 'ບໍ່ມີຜູ້ປົກຄອງທີ່ເຊື່ອມຕໍ່.') }}
              </p>
              <ul v-else class="flex flex-col gap-2">
                <li
                  v-for="ps in student.parentStudents"
                  :key="ps.parentUserId"
                  :class="['rounded border p-2.5 flex items-center gap-2.5', ps.isPrimaryContact ? 'border-primary bg-primary-soft/40' : 'border-line']"
                >
                  <span class="avatar-sm bg-surface-2 text-ink-muted shrink-0">{{ personName(ps.parent)[0] }}</span>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-ink truncate">{{ personName(ps.parent) }}</p>
                    <p class="text-[11px] text-ink-subtle tnum">{{ ps.parent.phoneNumber || dash }}</p>
                  </div>
                  <span class="text-[11px] text-ink-muted whitespace-nowrap">{{ $t(`relationship.${ps.relationship}`) }}</span>
                  <span v-if="ps.isPrimaryContact" class="shrink-0 text-[10px] font-semibold text-primary">{{ L('Primary', 'ຫຼັກ') }}</span>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </template>

    <!-- ═══════ EDIT MODE ═══════ -->
    <form v-else-if="student && editing" class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] gap-4 items-start" @submit.prevent="handleSubmit">
      <!-- Main column -->
      <div class="flex flex-col gap-4">
        <!-- Personal (+ enrolment) -->
        <section class="panel">
          <h2 class="card-title"><span class="card-icon bg-primary-soft text-primary-ink">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </span>{{ $t('students.personal_details') }}</h2>
          <div class="card-body grid grid-cols-2 sm:grid-cols-4 gap-3">
            <label class="field col-span-2">
              <span class="field-label">{{ $t('students.full_name_lo') }} <b class="text-danger">*</b></span>
              <input v-model="form.fullNameLo" required maxlength="150" class="input-field" :placeholder="$t('forms.ph_full_name_lo')">
            </label>
            <label class="field col-span-2">
              <span class="field-label">{{ $t('students.full_name_en') }} <b class="text-danger">*</b></span>
              <input v-model="form.fullNameEn" required maxlength="150" class="input-field" :placeholder="$t('forms.ph_full_name_en')">
            </label>
            <label class="field">
              <span class="field-label">{{ $t('common.gender') }}</span>
              <select v-model="form.gender" class="input-field">
                <option value="">{{ L('Please select a gender', 'ກະລຸນາເລືອກເພດ') }}</option>
                <option v-for="g in GENDERS" :key="g" :value="g">{{ $t(`gender.${g}`) }}</option>
              </select>
            </label>
            <label class="field">
              <span class="field-label">{{ L('Date of birth', 'ວັນເດືອນປີເກີດ') }}</span>
              <input v-model="form.dateOfBirth" type="date" class="input-field">
            </label>
            <label class="field">
              <span class="field-label">{{ L('Ethnicity', 'ຊົນເຜົ່າ') }}</span>
              <select v-model.number="form.ethnicityId" class="input-field">
                <option :value="0">{{ L('Please select an ethnicity', 'ກະລຸນາເລືອກຊົນເຜົ່າ') }}</option>
                <option v-for="e in ethnicities" :key="e.ethnicityId" :value="e.ethnicityId">{{ locale === 'lo' ? e.nameLo : e.nameEn }}</option>
              </select>
            </label>
            <label class="field">
              <span class="field-label">{{ L('Blood type', 'ກຸ່ມເລືອດ') }}</span>
              <select v-model="form.bloodType" class="input-field">
                <option value="">{{ L('Please select a blood type', 'ກະລຸນາເລືອກກຸ່ມເລືອດ') }}</option>
                <optgroup :label="L('With Rh factor', 'ມີ Rh')">
                  <option v-for="b in bloodTypes.filter((x) => x.rh)" :key="b.code" :value="b.code">{{ b.code }}</option>
                </optgroup>
                <optgroup :label="L('Rh not tested', 'ຍັງບໍ່ໄດ້ກວດ Rh')">
                  <option v-for="b in bloodTypes.filter((x) => !x.rh)" :key="b.code" :value="b.code">{{ b.code }}</option>
                </optgroup>
              </select>
            </label>
            <label class="field col-span-2">
              <span class="field-label">{{ $t('common.class') }} <span class="text-ink-subtle font-normal">({{ currentYear }})</span></span>
              <select v-model.number="form.classId" class="input-field">
                <option :value="0">{{ L('Please select a class', 'ກະລຸນາເລືອກຫ້ອງຮຽນ') }}</option>
                <option v-for="c in currentClasses" :key="c.classId" :value="c.classId">{{ locale === 'lo' ? c.classNameLo : c.classNameEn }}</option>
              </select>
            </label>
            <label class="field col-span-2">
              <span class="field-label">{{ L('Birthplace', 'ບ້ານເກີດ') }}</span>
              <input v-model="form.birthPlace" maxlength="150" class="input-field">
            </label>
          </div>
        </section>

        <!-- Address -->
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
            <label class="field"><span class="field-label">{{ L('Village', 'ບ້ານ ') }}</span><input v-model="form.village" maxlength="100" class="input-field"></label>
            <label class="field">
              <span class="field-label">{{ L('House no. / details', 'ເລກເຮືອນ / ລາຍລະອຽດ') }}</span>
              <input v-model="form.address" maxlength="100" class="input-field">
            </label>
          </div>
        </section>

        <!-- Background & health -->
        <section class="panel">
          <h2 class="card-title"><span class="card-icon bg-primary-soft text-primary-ink">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </span>{{ $t('students.background_health') }}</h2>
          <div class="card-body grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label class="field">
              <span class="field-label">{{ L('Previous school', 'ໂຮງຮຽນເກົ່າ') }}</span>
              <textarea v-model="form.previousSchool" rows="1" maxlength="150" class="input-field resize-y" />
            </label>
            <label class="field">
              <span class="field-label">{{ L('Allergies / medical conditions', 'ການແພ້ / ພະຍາດປະຈຳຕົວ') }}</span>
              <textarea v-model="form.medicalNotes" rows="1" class="input-field resize-y" />
            </label>
            <label class="field">
              <span class="field-label">{{ $t('common.notes') }}</span>
              <textarea v-model="form.notes" rows="1" class="input-field resize-y" />
            </label>
          </div>
        </section>
      </div>

      <!-- Side column: photo + summary + actions, then parents -->
      <div class="flex flex-col gap-4 lg:sticky lg:top-20">
        <section class="panel overflow-hidden">
          <div class="px-4 pt-5 pb-4 flex flex-col items-center text-center">
            <!-- Photo: click to change -->
            <button
              type="button"
              class="group relative rounded-full ring-4 ring-[rgb(var(--surface))] focus-visible:outline-none focus-visible:ring-primary"
              :aria-label="shownPhoto ? L('Change photo', 'ປ່ຽນຮູບ') : L('Add photo', 'ເພີ່ມຮູບ')"
              @click="pickPhoto"
            >
              <PersonAvatar :name="form.fullNameLo || form.fullNameEn || '?'" :photo-url="shownPhoto" size="xl" />
              <span class="absolute inset-0 rounded-full bg-black/45 text-white flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {{ shownPhoto ? L('Change', 'ປ່ຽນຮູບ') : L('Add photo', 'ເພີ່ມຮູບ') }}
              </span>
              <span class="absolute bottom-0.5 right-0.5 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center ring-2 ring-[rgb(var(--surface))]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
              </span>
            </button>
            <input ref="photoInput" type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" tabindex="-1" @change="onPhotoPicked">
            <p v-if="photoError" role="alert" class="mt-1.5 text-xs text-danger">{{ photoError }}</p>
            <button v-else-if="shownPhoto" type="button" class="mt-1.5 text-xs text-ink-subtle hover:text-danger" @click="removePhoto">
              {{ L('Remove photo', 'ລຶບຮູບ') }}
            </button>
            <p class="mt-2 text-base font-bold text-ink leading-tight break-words max-w-full">
              {{ form.fullNameLo || L('Student name', 'ຊື່ນັກຮຽນ') }}
            </p>
            <p class="text-xs text-ink-subtle break-words max-w-full">{{ form.fullNameEn || dash }}</p>
            <p v-if="form.studentCode" class="mt-1 text-xs font-mono text-ink-muted">{{ form.studentCode }}</p>
            <div class="mt-3 flex flex-wrap justify-center gap-1.5">
              <span :class="STATUS_BADGE[form.status]">{{ statusLabel(form.status) }}</span>
              <span class="badge-neutral">{{ selectedClassName || L('No class', 'ບໍ່ມີຫ້ອງ') }}</span>
              <span v-if="form.gender" class="badge-neutral">{{ $t(`gender.${form.gender}`) }}</span>
            </div>
          </div>
          <div class="px-4 py-3 border-t border-line grid grid-cols-2 gap-2">
            <button type="button" class="btn-secondary" @click="cancelEditing">{{ $t('common.cancel') }}</button>
            <button type="submit" :disabled="isSubmitting" class="btn-primary">
              {{ isSubmitting ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
        </section>

        <!-- Parents (editable) -->
        <section class="panel">
          <h2 class="card-title">
            <span class="card-icon bg-primary-soft text-primary-ink">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </span>
            {{ $t('nav.parents') }}
            <span v-if="form.parents.length" class="ml-auto badge-neutral tnum">{{ form.parents.length }}</span>
          </h2>

          <div class="card-body flex flex-col gap-3">
            <!-- Picker: every parent, filtered as you type -->
            <div class="relative">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                v-model="parentQuery"
                role="combobox"
                aria-autocomplete="list"
                :aria-expanded="pickerOpen"
                aria-controls="parent-listbox"
                :aria-activedescendant="activeDescendant"
                class="input-field pl-9"
                :placeholder="L(`Select a parent (${allParents.length})`, `ເລືອກຜູ້ປົກຄອງ (${allParents.length} ຄົນ)`)"
                @focus="openPicker"
                @click="openPicker"
                @input="openPicker"
                @blur="pickerOpen = false"
                @keydown.down.prevent="moveActive(1)"
                @keydown.up.prevent="moveActive(-1)"
                @keydown.enter.prevent="pickActive"
                @keydown.esc="pickerOpen = false"
              >
              <ul
                v-if="pickerOpen"
                id="parent-listbox"
                ref="listbox"
                role="listbox"
                class="absolute z-30 mt-1 w-full panel-float py-1 max-h-72 overflow-y-auto scrollbar-thin"
              >
                <li
                  v-for="(p, i) in availableParents"
                  :id="`parent-opt-${p.userId}`"
                  :key="p.userId"
                  role="option"
                  :aria-selected="i === activeIndex"
                  :class="['px-3 py-1.5 cursor-pointer flex items-center gap-2.5', i === activeIndex ? 'bg-primary-soft' : '']"
                  @mousedown.prevent="addParent(p)"
                  @mousemove="activeIndex = i"
                >
                  <span class="avatar-sm bg-surface-2 text-ink-muted shrink-0">{{ personName(p)[0] }}</span>
                  <span class="min-w-0">
                    <span class="block text-sm text-ink truncate">{{ personName(p) }}</span>
                    <span class="block text-[11px] text-ink-subtle tnum">{{ p.phoneNumber || dash }}</span>
                  </span>
                </li>
                <li v-if="availableParents.length === 0" class="px-3 py-3 text-sm text-ink-subtle text-center">
                  {{ parentQuery ? L('No parent matches', 'ບໍ່ພົບຜູ້ປົກຄອງ') : L('All parents are linked', 'ເຊື່ອມຜູ້ປົກຄອງໝົດແລ້ວ') }}
                </li>
              </ul>
            </div>

            <!-- Linked parents -->
            <p v-if="form.parents.length === 0" class="text-sm text-ink-subtle text-center py-4 rounded border border-dashed border-line">
              {{ L('No parents linked yet.', 'ຍັງບໍ່ໄດ້ເຊື່ອມຜູ້ປົກຄອງ.') }}
            </p>
            <ul v-else class="flex flex-col gap-2">
              <li
                v-for="(p, i) in form.parents"
                :key="p.parentUserId"
                :class="['rounded border p-2.5 flex flex-col gap-2', p.isPrimaryContact ? 'border-primary bg-primary-soft/40' : 'border-line']"
              >
                <div class="flex items-center gap-2.5">
                  <span class="avatar-sm bg-surface-2 text-ink-muted shrink-0">{{ p.name[0] }}</span>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-ink truncate">{{ p.name }}</p>
                    <p class="text-[11px] text-ink-subtle tnum">{{ p.phone || dash }}</p>
                  </div>
                  <button
                    type="button"
                    class="w-7 h-7 shrink-0 rounded flex items-center justify-center text-ink-subtle hover:text-danger hover:bg-danger-soft"
                    :aria-label="`${$t('common.delete')} ${p.name}`"
                    @click="removeParent(i)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div class="flex items-center gap-2">
                  <select v-model="p.relationship" class="input-field !min-h-8 !py-1 text-xs flex-1" :aria-label="L('Relationship', 'ຄວາມສຳພັນ')">
                    <option v-for="r in RELATIONSHIPS" :key="r" :value="r">{{ relationshipLabel(r) }}</option>
                  </select>
                  <label class="flex items-center gap-1.5 text-xs text-ink-muted cursor-pointer whitespace-nowrap">
                    <input type="radio" name="primaryContact" :checked="p.isPrimaryContact" class="accent-[rgb(var(--primary))]" @change="setPrimary(i)">
                    {{ L('Primary', 'ຜູ້ຕິດຕໍ່ຫຼັກ') }}
                  </label>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { GENDERS } from '../../../domain/models/Gender';
import type { Student, BloodTypeOption, Ethnicity } from '../../../domain/models/Student';
import type { ParentOption } from '../../../domain/models/Parent';
import { useAdminStore } from '../../../application/stores/admin';
import { adminRepository } from '../../../infrastructure/api/AdminRepository';
import { academicsRepository } from '../../../infrastructure/api/AcademicsRepository';
import { usePhotoPicker } from '../../../composables/usePhotoPicker';

definePageMeta({ layout: 'admin' });

const route = useRoute();
const adminStore = useAdminStore();
const { locale, t } = useI18n();
const L = (en: string, lo: string) => (locale.value === 'lo' ? lo : en);
const dash = '—';

const studentId = computed(() => Number(route.params.id));

const student = ref<Student | null>(null);
const loading = ref(true);
const editing = ref(false);
useHead({ title: computed(() => `${editing.value ? t('students.edit_title') : t('students.detail_title')} — Smart School Admin`) });
const isSubmitting = ref(false);
const errorMsg = ref('');

const statusLabel = (s: string) =>
  ({ active: t('common.active'), inactive: t('common.inactive'), graduated: t('students.graduated'), transferred: t('students.transferred') })[s] ?? s;

const STATUS_BADGE: Record<Student['status'], string> = {
  active: 'badge-success',
  inactive: 'badge-danger',
  graduated: 'badge-info',
  transferred: 'badge-neutral',
};

const bloodTypes = ref<BloodTypeOption[]>([]);
const ethnicities = ref<Ethnicity[]>([]);
const { provinces, load: loadProvinces, name: placeName, districtsOf } = useProvinces();
const RELATIONSHIPS = ['father', 'mother', 'guardian', 'grandparent', 'sibling', 'uncle_aunt', 'other'] as const;
type Relationship = (typeof RELATIONSHIPS)[number];
const relationshipLabel = (r: Relationship) => t(`relationship.${r}`);

type Named = { fullNameEn: string; fullNameLo: string; phoneNumber?: string | null };
const personName = (p: Named) => (locale.value === 'lo' ? p.fullNameLo : p.fullNameEn) || p.fullNameEn;

// ── Classes ──
type ClassOption = { classId: number; classNameEn: string; classNameLo: string; academicYear: string };
const classes = ref<ClassOption[]>([]);
const currentYear = ref('');
const currentClasses = computed(() => classes.value.filter((c) => c.academicYear === currentYear.value));
const selectedClassName = computed(() => {
  const c = classes.value.find((x) => x.classId === form.classId);
  return c ? (locale.value === 'lo' ? c.classNameLo : c.classNameEn) : '';
});

// View-mode class name from the student object directly
const viewClassName = computed(() => {
  const cls = student.value?.classStudents?.[0]?.class;
  if (!cls) return '';
  return (locale.value === 'lo' ? cls.classNameLo : cls.classNameEn) || cls.classNameEn || '';
});

// View-mode ethnicity name
const ethnicityName = computed(() => {
  if (!student.value?.ethnicityId || !ethnicities.value.length) return '';
  const e = ethnicities.value.find((x) => x.ethnicityId === student.value!.ethnicityId);
  return e ? (locale.value === 'lo' ? e.nameLo : e.nameEn) : '';
});

const studentDisplayName = computed(() => {
  if (!student.value) return '?';
  return (locale.value === 'lo' ? student.value.fullNameLo : student.value.fullNameEn) || student.value.fullNameLo || student.value.fullNameEn || '?';
});

const calendarAcademicYear = () => {
  const d = new Date();
  const start = d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1;
  return `${start}-${start + 1}`;
};

const studentAge = (dob?: string) => {
  if (!dob) return dash;
  const birthDate = new Date(dob);
  const diff = Date.now() - birthDate.getTime();
  const age = new Date(diff);
  return Math.abs(age.getUTCFullYear() - 1970);
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return dash;
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB');
};

// ── Form state (used only in edit mode) ──
type ParentLink = { parentUserId: number; name: string; phone: string | null; relationship: Relationship; isPrimaryContact: boolean };

const form = reactive({
  studentCode: '',
  status: 'active' as Student['status'],
  classId: 0,
  fullNameEn: '',
  fullNameLo: '',
  gender: '',
  dateOfBirth: '',
  ethnicityId: 0,
  bloodType: '',
  birthPlace: '',
  village: '',
  provinceId: 0,
  districtId: 0,
  address: '',
  previousSchool: '',
  medicalNotes: '',
  notes: '',
  parents: [] as ParentLink[],
});

// ── Photo ──
const dialog = useDialog();
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

const populateForm = (s: Student) => {
  existingPhotoUrl.value = s.photoUrl ?? null;
  Object.assign(form, {
    studentCode: s.studentCode,
    status: s.status,
    classId: s.classStudents?.[0]?.class?.classId ?? 0,
    fullNameEn: s.fullNameEn,
    fullNameLo: s.fullNameLo,
    gender: s.gender ?? '',
    dateOfBirth: s.dateOfBirth ? s.dateOfBirth.slice(0, 10) : '',
    ethnicityId: s.ethnicityId ?? 0,
    bloodType: s.bloodType ?? '',
    birthPlace: s.birthPlace ?? '',
    village: s.village ?? '',
    provinceId: s.provinceId ?? 0,
    districtId: s.districtId ?? 0,
    address: s.address ?? '',
    previousSchool: s.previousSchool ?? '',
    medicalNotes: s.medicalNotes ?? '',
    notes: s.notes ?? '',
    parents: (s.parentStudents ?? []).map((ps) => ({
      parentUserId: ps.parentUserId,
      name: personName(ps.parent),
      phone: ps.parent.phoneNumber ?? null,
      relationship: ps.relationship as Relationship,
      isPrimaryContact: ps.isPrimaryContact,
    })),
  });
};

// ── Load ──
onMounted(async () => {
  try {
    const [c, terms, s, blood, ethnicityList] = await Promise.all([
      adminRepository.getClasses({ limit: 500 }),
      academicsRepository.getTerms(),
      adminRepository.getStudent(studentId.value),
      adminRepository.getBloodTypes(),
      adminRepository.getEthnicities(),
      loadProvinces(),
    ]);
    classes.value = c.classes;
    bloodTypes.value = blood;
    ethnicities.value = ethnicityList;
    currentYear.value = terms.find((x) => x.status === 'active')?.academicYear ?? calendarAcademicYear();
    student.value = s;
    populateForm(s);
  } catch (err) {
    errorMsg.value = errorMessage(err, L('Failed to load student', 'ໂຫຼດຂໍ້ມູນນັກຮຽນບໍ່ສຳເລັດ'));
  } finally {
    loading.value = false;
  }
});

// ── Edit toggle ──
const startEditing = () => {
  if (student.value) populateForm(student.value);
  editing.value = true;
};

const cancelEditing = () => {
  editing.value = false;
  errorMsg.value = '';
};

// ── Parent picker ──
const allParents = ref<ParentOption[]>([]);
const parentQuery = ref('');
const pickerOpen = ref(false);
const activeIndex = ref(0);
const listbox = ref<HTMLUListElement | null>(null);

const loadParents = async () => {
  if (allParents.value.length) return;
  allParents.value = await adminRepository.getParentOptions();
};

// Lazy-load parent options when entering edit mode
watch(editing, async (val) => {
  if (val) await loadParents();
});

const availableParents = computed(() => {
  const linked = new Set(form.parents.map((p) => p.parentUserId));
  const q = parentQuery.value.trim().toLowerCase();
  return allParents.value.filter((p) =>
    !linked.has(p.userId) &&
    (!q || p.fullNameLo.toLowerCase().includes(q) || p.fullNameEn.toLowerCase().includes(q) || (p.phoneNumber ?? '').replace(/\s/g, '').includes(q.replace(/\s/g, ''))),
  );
});

const activeDescendant = computed(() => {
  const p = availableParents.value[activeIndex.value];
  return pickerOpen.value && p ? `parent-opt-${p.userId}` : undefined;
});

const openPicker = () => {
  pickerOpen.value = true;
  activeIndex.value = 0;
};

const moveActive = async (step: number) => {
  if (!pickerOpen.value) return openPicker();
  const count = availableParents.value.length;
  if (!count) return;
  activeIndex.value = (activeIndex.value + step + count) % count;
  await nextTick();
  listbox.value?.children[activeIndex.value]?.scrollIntoView({ block: 'nearest' });
};

const pickActive = () => {
  const p = availableParents.value[activeIndex.value];
  if (pickerOpen.value && p) addParent(p);
};

const addParent = (p: ParentOption) => {
  form.parents.push({
    parentUserId: p.userId,
    name: personName(p),
    phone: p.phoneNumber,
    relationship: 'guardian',
    isPrimaryContact: form.parents.length === 0,
  });
  parentQuery.value = '';
  activeIndex.value = 0;
};

const setPrimary = (index: number) => form.parents.forEach((p, i) => (p.isPrimaryContact = i === index));

const removeParent = (index: number) => {
  const [removed] = form.parents.splice(index, 1);
  const first = form.parents[0];
  if (removed?.isPrimaryContact && first) first.isPrimaryContact = true;
};

// ── Save ──
const errorMessage = (err: unknown, fallback: string) =>
  (err as { data?: { message?: string } })?.data?.message || (err instanceof Error && err.message) || fallback;

const OPTIONAL_TEXT = ['gender', 'dateOfBirth', 'bloodType', 'birthPlace', 'village',
  'address', 'previousSchool', 'medicalNotes', 'notes'] as const;

const handleSubmit = async () => {
  errorMsg.value = '';
  isSubmitting.value = true;
  try {
    const { parents, classId, ethnicityId, provinceId, districtId, studentCode: _code, status: _status, ...fields } = form;
    const optional = new Set<string>(OPTIONAL_TEXT);
    const payload: Record<string, unknown> = Object.fromEntries(
      Object.entries({
        ...fields,
        classId: classId || null,
        ethnicityId: ethnicityId || null,
        provinceId: provinceId || null,
        districtId: districtId || null,
      })
        .filter(([k, v]) => !(optional.has(k) && v === '')),
    );
    payload.parents = parents.map(({ parentUserId, relationship, isPrimaryContact }) => ({ parentUserId, relationship, isPrimaryContact }));

    const saved = await adminStore.updateStudent(studentId.value, payload);

    // Photo step
    try {
      await persistPhoto(
        (file) => adminRepository.uploadStudentPhoto(saved.studentId, file),
        () => adminRepository.deleteStudentPhoto(saved.studentId),
      );
    } catch (err) {
      await dialog.warning(
        L('The student was saved, but the photo could not be saved: ', 'ບັນທຶກນັກຮຽນແລ້ວ ແຕ່ບັນທຶກຮູບບໍ່ສຳເລັດ: ') + errorMessage(err, ''),
      );
    }

    // Reload the student to reflect saved data
    student.value = await adminRepository.getStudent(studentId.value);
    populateForm(student.value);
    editing.value = false;
  } catch (err) {
    errorMsg.value = errorMessage(err, L('Failed to save student. Please try again.', 'ບັນທຶກບໍ່ສຳເລັດ. ກະລຸນາລອງໃໝ່.'));
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
.field-value {
  @apply text-sm text-ink break-words;
}
</style>
