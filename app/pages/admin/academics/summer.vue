<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-ink">{{ $t('summer.title') }}</h1>
        <p class="text-sm text-ink-muted mt-1">{{ $t('summer.subtitle') }}</p>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="btn-secondary text-sm flex items-center gap-2"
          @click="openCourseModal()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>{{ $t('summer.btn_add_course') }}</span>
        </button>

        <button
          type="button"
          class="btn-primary text-sm flex items-center gap-2 shadow-sm"
          @click="openRegisterModal()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span>{{ $t('summer.btn_register') }}</span>
        </button>
      </div>
    </div>

    <!-- Stat Cards Overview -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Students -->
      <div class="panel p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted uppercase tracking-wider font-semibold">{{ $t('summer.total_students') }}</p>
          <p class="text-2xl font-bold text-ink mt-0.5 tnum">{{ stats?.totalStudents || 0 }}</p>
        </div>
      </div>

      <!-- Total Registrations -->
      <div class="panel p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-500 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted uppercase tracking-wider font-semibold">{{ $t('summer.total_registrations') }}</p>
          <p class="text-2xl font-bold text-ink mt-0.5 tnum">{{ stats?.totalRegistrations || 0 }}</p>
        </div>
      </div>

      <!-- Total Revenue -->
      <div class="panel p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-500 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted uppercase tracking-wider font-semibold">{{ $t('summer.total_revenue') }}</p>
          <p class="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tnum">{{ f.kip(stats?.totalRevenue || 0) }}</p>
        </div>
      </div>

      <!-- Month Enrollment Breakdown -->
      <div class="panel p-5 flex flex-col justify-center">
        <p class="text-xs text-ink-muted uppercase tracking-wider font-semibold mb-2">{{ $t('summer.months_breakdown') }}</p>
        <div class="flex items-center gap-2">
          <span class="px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 text-xs font-semibold">
            M1: {{ stats?.monthCounts?.month1 || 0 }}
          </span>
          <span class="px-2 py-1 rounded-md bg-purple-500/10 text-purple-600 text-xs font-semibold">
            M2: {{ stats?.monthCounts?.month2 || 0 }}
          </span>
          <span class="px-2 py-1 rounded-md bg-amber-500/10 text-amber-600 text-xs font-semibold">
            M3: {{ stats?.monthCounts?.month3 || 0 }}
          </span>
        </div>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="flex border-b border-line gap-6">
      <button
        type="button"
        class="pb-3 text-sm font-semibold transition-colors border-b-2"
        :class="activeTab === 'registrations' ? 'border-primary text-primary' : 'border-transparent text-ink-muted hover:text-ink'"
        @click="activeTab = 'registrations'"
      >
        {{ $t('summer.tab_registrations') }}
      </button>

      <button
        type="button"
        class="pb-3 text-sm font-semibold transition-colors border-b-2"
        :class="activeTab === 'courses' ? 'border-primary text-primary' : 'border-transparent text-ink-muted hover:text-ink'"
        @click="activeTab = 'courses'"
      >
        {{ $t('summer.tab_courses') }} ({{ courses.length }})
      </button>

      <button
        type="button"
        class="pb-3 text-sm font-semibold transition-colors border-b-2"
        :class="activeTab === 'stats' ? 'border-primary text-primary' : 'border-transparent text-ink-muted hover:text-ink'"
        @click="activeTab = 'stats'"
      >
        {{ $t('summer.tab_stats') }}
      </button>
    </div>

    <!-- TAB 1: REGISTRATIONS -->
    <div v-if="activeTab === 'registrations'" class="flex flex-col gap-4">
      <!-- Search & Month Filters -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <!-- Month Pills -->
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            :class="selectedMonth === undefined ? 'bg-primary text-white' : 'bg-surface border border-line text-ink-muted hover:text-ink'"
            @click="setMonthFilter(undefined)"
          >
            {{ $t('summer.filter_all_months') }}
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            :class="selectedMonth === 1 ? 'bg-primary text-white' : 'bg-surface border border-line text-ink-muted hover:text-ink'"
            @click="setMonthFilter(1)"
          >
            {{ $t('summer.month_1') }}
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            :class="selectedMonth === 2 ? 'bg-primary text-white' : 'bg-surface border border-line text-ink-muted hover:text-ink'"
            @click="setMonthFilter(2)"
          >
            {{ $t('summer.month_2') }}
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            :class="selectedMonth === 3 ? 'bg-primary text-white' : 'bg-surface border border-line text-ink-muted hover:text-ink'"
            @click="setMonthFilter(3)"
          >
            {{ $t('summer.month_3') }}
          </button>
        </div>

        <!-- Search Bar -->
        <div class="relative w-full sm:w-72">
          <input
            v-model="searchInput"
            type="text"
            class="search-bar"
            :placeholder="$t('summer.search_placeholder')"
            @input="handleSearch"
          />
        </div>
      </div>

      <!-- Registrations Table -->
      <div class="panel overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-ink">
            <thead class="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-ink-muted uppercase border-b border-line">
              <tr>
                <th class="px-4 py-3">{{ $t('summer.student_name') }}</th>
                <th class="px-4 py-3">{{ $t('summer.parent_name') }} / {{ $t('summer.phone') }}</th>
                <th class="px-4 py-3">{{ $t('summer.courses') }}</th>
                <th class="px-4 py-3">{{ $t('summer.enrolled_months') }}</th>
                <th class="px-4 py-3 text-right">{{ $t('summer.total_amount') }}</th>
                <th class="px-4 py-3 text-center">{{ $t('summer.payment_status') }}</th>
                <th class="px-4 py-3 text-right">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line">
              <tr v-if="loadingRegistrations">
                <td colspan="7" class="py-12 text-center text-ink-muted">
                  <LoadingSpinner class="mx-auto" />
                </td>
              </tr>
              <tr v-else-if="registrations.length === 0">
                <td colspan="7" class="py-12 text-center text-ink-muted">
                  {{ $t('summer.no_registrations') }}
                </td>
              </tr>
              <tr
                v-for="reg in registrations"
                v-else
                :key="reg.registrationId"
                class="hover:bg-slate-500/5 transition-colors"
              >
                <!-- Student Name & Code -->
                <td class="px-4 py-3.5">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 font-bold flex items-center justify-center shrink-0 text-xs">
                      {{ (reg.student?.fullNameEn || 'S').charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <p class="font-semibold text-ink">{{ pick(reg.student?.fullNameLo, reg.student?.fullNameEn) }}</p>
                      <p class="text-xs text-ink-muted font-mono">{{ reg.student?.studentCode }} &bull; {{ reg.regNo }}</p>
                    </div>
                  </div>
                </td>

                <!-- Parent & Phone -->
                <td class="px-4 py-3.5">
                  <p class="font-medium text-ink">{{ reg.student?.parentName }}</p>
                  <p class="text-xs text-ink-muted">{{ reg.student?.phoneNumber }}</p>
                </td>

                <!-- Courses -->
                <td class="px-4 py-3.5">
                  <div class="flex flex-wrap gap-1 max-w-xs">
                    <span
                      v-for="course in getUniqueCourses(reg.items)"
                      :key="course.courseId"
                      class="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-line"
                    >
                      {{ pick(course.subjectNameLo, course.subjectNameEn) }}
                    </span>
                  </div>
                </td>

                <!-- Enrolled Months -->
                <td class="px-4 py-3.5">
                  <div class="flex gap-1">
                    <span
                      v-for="m in reg.monthsEnrolled"
                      :key="m"
                      class="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    >
                      M{{ m }}
                    </span>
                  </div>
                </td>

                <!-- Total Amount -->
                <td class="px-4 py-3.5 text-right font-bold text-ink tnum">
                  {{ f.kip(reg.paidAmount || reg.totalAmount) }}
                  <p class="text-[11px] font-normal text-ink-muted">
                    {{ reg.paymentMethod === 'cash' ? $t('summer.cash') : $t('summer.bank_transfer') }}
                  </p>
                </td>

                <!-- Payment Status -->
                <td class="px-4 py-3.5 text-center">
                  <span
                    class="px-2.5 py-1 rounded-full text-xs font-semibold"
                    :class="reg.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'"
                  >
                    {{ reg.paymentStatus === 'paid' ? $t('summer.paid') : $t('summer.unpaid') }}
                  </span>
                </td>

                <!-- Action Buttons: Pass & Receipt -->
                <td class="px-4 py-3.5 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <!-- Print Pass -->
                    <button
                      type="button"
                      class="btn-secondary text-xs px-2.5 py-1 flex items-center gap-1 text-blue-600 hover:bg-blue-500/10"
                      :title="$t('summer.btn_print_pass')"
                      @click="openPassModal(reg)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      <span>Pass</span>
                    </button>

                    <!-- Print Receipt -->
                    <button
                      type="button"
                      class="btn-secondary text-xs px-2.5 py-1 flex items-center gap-1 text-emerald-600 hover:bg-emerald-500/10"
                      :title="$t('summer.btn_print_receipt')"
                      @click="openReceiptModal(reg)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Receipt</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: SUMMER COURSES -->
    <div v-if="activeTab === 'courses'" class="flex flex-col gap-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="c in courses"
          :key="c.courseId"
          class="panel p-5 flex flex-col justify-between gap-4 border border-line hover:border-primary/50 transition-colors"
        >
          <div>
            <div class="flex items-start justify-between gap-2">
              <div>
                <h3 class="font-bold text-base text-ink">{{ pick(c.subjectNameLo, c.subjectNameEn) }}</h3>
                <p class="text-xs text-ink-muted">{{ c.subjectNameEn }}</p>
              </div>
              <span
                class="px-2 py-0.5 rounded text-[11px] font-semibold"
                :class="c.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-500/10 text-slate-500'"
              >
                {{ c.isActive ? $t('summer.active') : $t('summer.inactive') }}
              </span>
            </div>

            <div class="mt-4 flex flex-col gap-1.5 text-xs text-ink-muted">
              <p v-if="c.gradeLevel"><strong class="text-ink">{{ $t('summer.grade_level') }}:</strong> {{ c.gradeLevel }}</p>
              <p v-if="c.teacherName"><strong class="text-ink">{{ $t('summer.teacher') }}:</strong> {{ c.teacherName }}</p>
              <p v-if="c.timeSlot"><strong class="text-ink">{{ $t('summer.time_slot') }}:</strong> {{ c.timeSlot }}</p>
              <p v-if="c.roomNumber"><strong class="text-ink">{{ $t('summer.room') }}:</strong> {{ c.roomNumber }}</p>
            </div>
          </div>

          <div class="pt-3 border-t border-line flex items-center justify-between">
            <div>
              <p class="text-[11px] text-ink-muted">{{ $t('summer.monthly_fee') }}</p>
              <p class="text-base font-bold text-primary tnum">{{ f.kip(c.monthlyFee) }}</p>
            </div>
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="btn-secondary text-xs px-2.5 py-1"
                @click="openCourseModal(c)"
              >
                {{ $t('common.edit') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: STATS & REVENUE BREAKDOWN -->
    <div v-if="activeTab === 'stats'" class="flex flex-col gap-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Revenue by Subject Table -->
        <div class="panel p-5">
          <h3 class="text-base font-bold text-ink mb-4">{{ $t('summer.revenue_breakdown') }}</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-ink">
              <thead class="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-ink-muted uppercase border-b border-line">
                <tr>
                  <th class="px-3 py-2">{{ $t('summer.courses') }}</th>
                  <th class="px-3 py-2 text-center">{{ $t('summer.students_count') }}</th>
                  <th class="px-3 py-2 text-right">{{ $t('summer.total_revenue') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-line">
                <tr v-for="cs in stats?.courseStats || []" :key="cs.nameEn">
                  <td class="px-3 py-2.5 font-medium">{{ pick(cs.nameLo, cs.nameEn) }}</td>
                  <td class="px-3 py-2.5 text-center font-bold">{{ cs.count }}</td>
                  <td class="px-3 py-2.5 text-right font-bold text-emerald-600 tnum">{{ f.kip(cs.revenue) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Month Breakdown Cards -->
        <div class="panel p-5 flex flex-col justify-between">
          <div>
            <h3 class="text-base font-bold text-ink mb-4">{{ $t('summer.months_breakdown') }}</h3>
            <div class="flex flex-col gap-3">
              <div class="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-between">
                <div>
                  <p class="font-bold text-sm text-blue-600">{{ $t('summer.month_1') }}</p>
                  <p class="text-xs text-ink-muted">{{ stats?.monthCounts?.month1 || 0 }} {{ $t('summer.students_count') }}</p>
                </div>
                <p class="text-base font-bold text-ink tnum">{{ f.kip(stats?.monthRevenues?.month1 || 0) }}</p>
              </div>

              <div class="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 flex items-center justify-between">
                <div>
                  <p class="font-bold text-sm text-purple-600">{{ $t('summer.month_2') }}</p>
                  <p class="text-xs text-ink-muted">{{ stats?.monthCounts?.month2 || 0 }} {{ $t('summer.students_count') }}</p>
                </div>
                <p class="text-base font-bold text-ink tnum">{{ f.kip(stats?.monthRevenues?.month2 || 0) }}</p>
              </div>

              <div class="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <p class="font-bold text-sm text-amber-600">{{ $t('summer.month_3') }}</p>
                  <p class="text-xs text-ink-muted">{{ stats?.monthCounts?.month3 || 0 }} {{ $t('summer.students_count') }}</p>
                </div>
                <p class="text-base font-bold text-ink tnum">{{ f.kip(stats?.monthRevenues?.month3 || 0) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL 1: REGISTER STUDENT MODAL -->
    <div
      v-if="showRegisterModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
    >
      <div class="panel w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-5 my-8">
        <div class="flex items-center justify-between border-b border-line pb-3">
          <h2 class="text-lg font-bold text-ink">{{ $t('summer.btn_register') }}</h2>
          <button type="button" class="text-ink-muted hover:text-ink text-2xl font-bold leading-none" @click="showRegisterModal = false">&times;</button>
        </div>

        <form @submit.prevent="submitRegistration" class="flex flex-col gap-4">
          <!-- Student Info -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-ink-muted mb-1">{{ $t('summer.student_name_lo') }} *</label>
              <input v-model.trim="regForm.fullNameLo" type="text" class="input-text text-sm" required placeholder="ຕົວຢ່າງ: ທ້າວ ສົມພອນ ວົງສາ" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-ink-muted mb-1">{{ $t('summer.student_name_en') }} *</label>
              <input v-model.trim="regForm.fullNameEn" type="text" class="input-text text-sm" required placeholder="e.g. Somphone Vongsa" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-ink-muted mb-1">{{ $t('summer.parent_name') }} *</label>
              <input v-model.trim="regForm.parentName" type="text" class="input-text text-sm" required placeholder="ຕົວຢ່າງ: ທ່ານ ສົມຫວັງ (ພໍ່)" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-ink-muted mb-1">{{ $t('summer.phone') }} *</label>
              <input v-model.trim="regForm.phoneNumber" type="text" class="input-text text-sm" required placeholder="020 xxxx xxxx" />
            </div>
          </div>

          <!-- Select Enrolled Months -->
          <div class="border border-line rounded-xl p-4 bg-slate-500/5">
            <label class="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
              {{ $t('summer.select_months') }} *
            </label>
            <div class="grid grid-cols-3 gap-2">
              <label
                v-for="m in [1, 2, 3]"
                :key="m"
                class="flex items-center gap-2 p-2.5 rounded-lg border transition-colors cursor-pointer"
                :class="regForm.monthsEnrolled.includes(m) ? 'bg-primary/10 border-primary text-primary font-semibold' : 'bg-surface border-line text-ink'"
              >
                <input
                  type="checkbox"
                  :value="m"
                  v-model="regForm.monthsEnrolled"
                  class="rounded text-primary focus:ring-primary"
                />
                <span class="text-xs">{{ $t(`summer.month_${m}`) }}</span>
              </label>
            </div>
          </div>

          <!-- Select Courses -->
          <div class="border border-line rounded-xl p-4 bg-slate-500/5">
            <label class="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
              {{ $t('summer.select_courses') }} *
            </label>
            <div class="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              <label
                v-for="c in courses.filter(x => x.isActive)"
                :key="c.courseId"
                class="flex items-center justify-between p-2.5 rounded-lg border transition-colors cursor-pointer"
                :class="regForm.courseIds.includes(c.courseId) ? 'bg-primary/10 border-primary' : 'bg-surface border-line'"
              >
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    :value="c.courseId"
                    v-model="regForm.courseIds"
                    class="rounded text-primary focus:ring-primary"
                  />
                  <div>
                    <p class="text-xs font-semibold text-ink">{{ pick(c.subjectNameLo, c.subjectNameEn) }}</p>
                    <p class="text-[11px] text-ink-muted">{{ c.timeSlot || c.roomNumber || '' }}</p>
                  </div>
                </div>
                <span class="text-xs font-bold text-primary tnum">{{ f.kip(c.monthlyFee) }} / {{ $t('summer.month_short') }}</span>
              </label>
            </div>
          </div>

          <!-- Live Total Calculation Box -->
          <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">{{ $t('summer.total_amount') }}</p>
              <p class="text-xs text-ink-muted">
                {{ regForm.courseIds.length }} ວິຊາ &times; {{ regForm.monthsEnrolled.length }} ເດືອນ
              </p>
            </div>
            <p class="text-2xl font-black text-emerald-600 dark:text-emerald-400 tnum">
              {{ f.kip(calculatedTotal) }}
            </p>
          </div>

          <!-- Payment Method -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-ink-muted mb-1">{{ $t('summer.payment_method') }}</label>
              <select v-model="regForm.paymentMethod" class="input-text text-sm">
                <option value="cash">{{ $t('summer.cash') }}</option>
                <option value="bank_transfer">{{ $t('summer.bank_transfer') }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-ink-muted mb-1">{{ $t('summer.paid_amount') }}</label>
              <input v-model.number="regForm.paidAmount" type="number" class="input-text text-sm" />
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-line mt-2">
            <button type="button" class="btn-secondary text-sm" @click="showRegisterModal = false">
              {{ $t('common.cancel') }}
            </button>
            <button
              type="submit"
              class="btn-primary text-sm shadow-sm"
              :disabled="submitting || regForm.courseIds.length === 0 || regForm.monthsEnrolled.length === 0"
            >
              {{ submitting ? $t('common.saving') : $t('summer.btn_register') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 2: COURSE ADD/EDIT MODAL -->
    <div
      v-if="showCourseModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
    >
      <div class="panel w-full max-w-lg p-6 flex flex-col gap-4 my-8">
        <div class="flex items-center justify-between border-b border-line pb-3">
          <h2 class="text-lg font-bold text-ink">
            {{ editingCourseId ? $t('common.edit') : $t('summer.btn_add_course') }}
          </h2>
          <button type="button" class="text-ink-muted hover:text-ink text-2xl font-bold leading-none" @click="showCourseModal = false">&times;</button>
        </div>

        <form @submit.prevent="submitCourse" class="flex flex-col gap-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-ink-muted mb-1">{{ $t('summer.course_name_lo') }} *</label>
              <input v-model.trim="courseForm.subjectNameLo" type="text" class="input-text text-sm" required placeholder="ເຊັ່ນ: ຄະນິດສາດ" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-ink-muted mb-1">{{ $t('summer.course_name_en') }} *</label>
              <input v-model.trim="courseForm.subjectNameEn" type="text" class="input-text text-sm" required placeholder="e.g. Mathematics" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-ink-muted mb-1">{{ $t('summer.monthly_fee') }} (LAK) *</label>
              <input v-model.number="courseForm.monthlyFee" type="number" class="input-text text-sm" required min="1000" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-ink-muted mb-1">{{ $t('summer.grade_level') }}</label>
              <input v-model.trim="courseForm.gradeLevel" type="text" class="input-text text-sm" placeholder="ເຊັ່ນ: ປ.1 - ປ.5" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-ink-muted mb-1">{{ $t('summer.teacher') }}</label>
              <input v-model.trim="courseForm.teacherName" type="text" class="input-text text-sm" placeholder="ເຊັ່ນ: ອາຈານ ສົມສັກ" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-ink-muted mb-1">{{ $t('summer.room') }}</label>
              <input v-model.trim="courseForm.roomNumber" type="text" class="input-text text-sm" placeholder="ເຊັ່ນ: ຫ້ອງ 201" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-ink-muted mb-1">{{ $t('summer.time_slot') }}</label>
            <input v-model.trim="courseForm.timeSlot" type="text" class="input-text text-sm" placeholder="ເຊັ່ນ: 08:30 - 10:00 (ຈັນ - ສຸກ)" />
          </div>

          <div class="flex items-center gap-2 mt-2">
            <input id="course-active" type="checkbox" v-model="courseForm.isActive" class="rounded text-primary focus:ring-primary" />
            <label for="course-active" class="text-xs font-medium text-ink cursor-pointer">{{ $t('summer.active') }}</label>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-line mt-2">
            <button type="button" class="btn-secondary text-sm" @click="showCourseModal = false">
              {{ $t('common.cancel') }}
            </button>
            <button type="submit" class="btn-primary text-sm" :disabled="submittingCourse">
              {{ submittingCourse ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 3: PRINT CLASS PASS MODAL -->
    <div
      v-if="selectedRegForPass"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
    >
      <div class="panel w-full max-w-lg p-6 flex flex-col gap-4 my-8">
        <div class="flex items-center justify-between border-b border-line pb-3 no-print">
          <h2 class="text-base font-bold text-ink">{{ $t('summer.btn_print_pass') }}</h2>
          <button type="button" class="text-ink-muted hover:text-ink text-2xl font-bold leading-none" @click="selectedRegForPass = null">&times;</button>
        </div>

        <!-- The Printable Pass Card -->
        <div id="summer-pass-print" class="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/60 dark:from-slate-900 dark:to-slate-800 border-2 border-blue-500/30 flex flex-col gap-4 shadow-sm">
          <!-- Pass Header -->
          <div class="flex items-center justify-between border-b border-blue-500/20 pb-3">
            <div>
              <h3 class="font-black text-sm tracking-wide text-blue-900 dark:text-blue-300 uppercase">{{ $t('summer.pass_school') }}</h3>
              <p class="text-xs font-semibold text-blue-600 dark:text-blue-400">{{ $t('summer.pass_title') }} &bull; {{ selectedRegForPass.academicYear }}</p>
            </div>
            <span class="px-2.5 py-1 rounded-md bg-blue-600 text-white font-mono text-xs font-black">
              {{ selectedRegForPass.student?.studentCode }}
            </span>
          </div>

          <!-- Student Info Row -->
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow shrink-0">
              {{ (selectedRegForPass.student?.fullNameEn || 'S').charAt(0).toUpperCase() }}
            </div>
            <div>
              <h4 class="font-bold text-base text-ink leading-tight">{{ selectedRegForPass.student?.fullNameLo }}</h4>
              <p class="text-xs text-ink-muted font-medium">{{ selectedRegForPass.student?.fullNameEn }}</p>
              <p class="text-xs text-ink-muted mt-0.5">ຜູ້ປົກຄອງ: {{ selectedRegForPass.student?.parentName }} ({{ selectedRegForPass.student?.phoneNumber }})</p>
            </div>
          </div>

          <!-- Allowed Months Badges -->
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-ink-muted uppercase tracking-wider">{{ $t('summer.enrolled_months') }}:</span>
            <span
              v-for="m in selectedRegForPass.monthsEnrolled"
              :key="m"
              class="px-2 py-0.5 rounded text-xs font-bold bg-blue-600 text-white"
            >
              {{ $t(`summer.month_${m}`) }}
            </span>
          </div>

          <!-- Courses Table -->
          <div class="rounded-xl overflow-hidden border border-blue-500/20 bg-white/70 dark:bg-slate-800/70">
            <table class="w-full text-left text-xs text-ink">
              <thead class="bg-blue-500/10 font-bold border-b border-blue-500/20">
                <tr>
                  <th class="px-3 py-1.5">{{ $t('summer.courses') }}</th>
                  <th class="px-3 py-1.5">{{ $t('summer.time_slot') }}</th>
                  <th class="px-3 py-1.5 text-right">{{ $t('summer.room') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-blue-500/10">
                <tr v-for="c in getUniqueCourses(selectedRegForPass.items)" :key="c.courseId">
                  <td class="px-3 py-1.5 font-semibold text-blue-900 dark:text-blue-300">
                    {{ pick(c.subjectNameLo, c.subjectNameEn) }}
                  </td>
                  <td class="px-3 py-1.5 text-ink-muted">{{ c.timeSlot || '—' }}</td>
                  <td class="px-3 py-1.5 text-right font-medium">{{ c.roomNumber || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Notice & Footer -->
          <div class="pt-2 border-t border-blue-500/20 flex items-center justify-between text-[11px] text-ink-muted">
            <p>{{ $t('summer.pass_notice') }}</p>
            <p class="font-mono text-xs">{{ selectedRegForPass.regNo }}</p>
          </div>
        </div>

        <!-- Print Action -->
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-line no-print">
          <button type="button" class="btn-secondary text-sm" @click="selectedRegForPass = null">
            {{ $t('common.close') }}
          </button>
          <button type="button" class="btn-primary text-sm flex items-center gap-2" @click="printCard">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>{{ $t('summer.btn_print_pass') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 4: PRINT RECEIPT MODAL -->
    <div
      v-if="selectedRegForReceipt"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
    >
      <div class="panel w-full max-w-lg p-6 flex flex-col gap-4 my-8">
        <div class="flex items-center justify-between border-b border-line pb-3 no-print">
          <h2 class="text-base font-bold text-ink">{{ $t('summer.btn_print_receipt') }}</h2>
          <button type="button" class="text-ink-muted hover:text-ink text-2xl font-bold leading-none" @click="selectedRegForReceipt = null">&times;</button>
        </div>

        <!-- The Printable Receipt Voucher -->
        <div id="summer-receipt-print" class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-line flex flex-col gap-4 text-ink">
          <!-- Header -->
          <div class="text-center pb-3 border-b border-line">
            <h3 class="font-black text-base text-ink uppercase">{{ $t('summer.pass_school') }}</h3>
            <h4 class="font-bold text-sm text-emerald-600 mt-0.5">{{ $t('summer.receipt_title') }}</h4>
            <p class="text-xs text-ink-muted font-mono mt-1">
              {{ $t('summer.receipt_no') }}: {{ selectedRegForReceipt.receiptNo || selectedRegForReceipt.regNo }}
            </p>
          </div>

          <!-- Meta Details -->
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p class="text-ink-muted">{{ $t('summer.student_name') }}:</p>
              <p class="font-bold text-sm text-ink">{{ selectedRegForReceipt.student?.fullNameLo }}</p>
              <p class="text-ink-muted font-mono">ID: {{ selectedRegForReceipt.student?.studentCode }}</p>
            </div>
            <div class="text-right">
              <p class="text-ink-muted">{{ $t('summer.date') }}:</p>
              <p class="font-medium text-ink">{{ f.dateTime(selectedRegForReceipt.paidAt || selectedRegForReceipt.createdAt) }}</p>
              <p class="text-ink-muted">{{ selectedRegForReceipt.paymentMethod === 'cash' ? $t('summer.cash') : $t('summer.bank_transfer') }}</p>
            </div>
          </div>

          <!-- Items Table -->
          <div class="border border-line rounded-lg overflow-hidden">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 dark:bg-slate-800 font-bold border-b border-line">
                <tr>
                  <th class="px-3 py-2">{{ $t('summer.courses') }}</th>
                  <th class="px-3 py-2 text-center">{{ $t('summer.enrolled_months') }}</th>
                  <th class="px-3 py-2 text-right">{{ $t('summer.monthly_fee') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-line">
                <tr v-for="c in getUniqueCourses(selectedRegForReceipt.items)" :key="c.courseId">
                  <td class="px-3 py-2 font-medium">{{ pick(c.subjectNameLo, c.subjectNameEn) }}</td>
                  <td class="px-3 py-2 text-center">
                    {{ selectedRegForReceipt.monthsEnrolled.map(m => `M${m}`).join(', ') }}
                  </td>
                  <td class="px-3 py-2 text-right font-medium tnum">{{ f.kip(c.monthlyFee) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Total -->
          <div class="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span class="font-bold text-sm text-emerald-900 dark:text-emerald-300">{{ $t('summer.total_amount') }}</span>
            <span class="font-black text-xl text-emerald-600 dark:text-emerald-400 tnum">
              {{ f.kip(selectedRegForReceipt.paidAmount || selectedRegForReceipt.totalAmount) }}
            </span>
          </div>

          <!-- Signature Footer -->
          <div class="grid grid-cols-2 gap-8 pt-8 mt-2 text-center text-xs text-ink-muted">
            <div class="border-t border-line pt-1">
              <p>{{ $t('summer.parent_name') }}</p>
              <p class="font-medium text-ink">{{ selectedRegForReceipt.student?.parentName }}</p>
            </div>
            <div class="border-t border-line pt-1">
              <p>{{ $t('summer.received_by') }}</p>
              <p class="font-medium text-ink">{{ selectedRegForReceipt.recorder?.fullNameLo || 'Cashier' }}</p>
            </div>
          </div>
        </div>

        <!-- Action -->
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-line no-print">
          <button type="button" class="btn-secondary text-sm" @click="selectedRegForReceipt = null">
            {{ $t('common.close') }}
          </button>
          <button type="button" class="btn-primary text-sm flex items-center gap-2" @click="printCard">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>{{ $t('summer.btn_print_receipt') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import {
  summerRepository,
  type SummerCourse,
  type SummerRegistration,
  type SummerStats,
} from '../../../infrastructure/api/SummerRepository';
import { useFormat } from '../../../composables/useFormat';

definePageMeta({
  layout: 'admin',
  permission: 'academics.view',
});

const { t, locale } = useI18n();
const f = useFormat();
const pick = (lo?: string | null, en?: string | null) => (locale.value === 'lo' ? lo || en : en || lo) ?? '—';

useHead({ title: () => `${t('summer.title')} — Smart School` });

// State
const activeTab = ref<'registrations' | 'courses' | 'stats'>('registrations');
const courses = ref<SummerCourse[]>([]);
const registrations = ref<SummerRegistration[]>([]);
const stats = ref<SummerStats | null>(null);
const loadingRegistrations = ref(false);

const selectedMonth = ref<number | undefined>(undefined);
const searchInput = ref('');
let searchTimer: ReturnType<typeof setTimeout>;

// Modals
const showRegisterModal = ref(false);
const submitting = ref(false);
const regForm = ref({
  fullNameLo: '',
  fullNameEn: '',
  parentName: '',
  phoneNumber: '',
  academicYear: '2025-2026',
  monthsEnrolled: [1] as number[],
  courseIds: [] as number[],
  paymentMethod: 'cash',
  paidAmount: 0,
});

const showCourseModal = ref(false);
const submittingCourse = ref(false);
const editingCourseId = ref<number | null>(null);
const courseForm = ref({
  academicYear: '2025-2026',
  subjectNameLo: '',
  subjectNameEn: '',
  gradeLevel: '',
  monthlyFee: 200000,
  teacherName: '',
  roomNumber: '',
  timeSlot: '',
  isActive: true,
});

const selectedRegForPass = ref<SummerRegistration | null>(null);
const selectedRegForReceipt = ref<SummerRegistration | null>(null);

// Total price calculation
const calculatedTotal = computed(() => {
  const selectedCourseObjects = courses.value.filter((c) => regForm.value.courseIds.includes(c.courseId));
  const monthlySum = selectedCourseObjects.reduce((acc, c) => acc + Number(c.monthlyFee), 0);
  return monthlySum * regForm.value.monthsEnrolled.length;
});

// Load data
const loadCourses = async () => {
  try {
    courses.value = await summerRepository.getCourses({ includeInactive: true });
  } catch (e) {
    console.error('Failed to load courses', e);
  }
};

const loadRegistrations = async () => {
  loadingRegistrations.value = true;
  try {
    const res = await summerRepository.getRegistrations({
      month: selectedMonth.value,
      search: searchInput.value || undefined,
    });
    registrations.value = res.registrations;
  } catch (e) {
    console.error('Failed to load registrations', e);
  } finally {
    loadingRegistrations.value = false;
  }
};

const loadStats = async () => {
  try {
    stats.value = (await summerRepository.getStats()) || null;
  } catch (e) {
    console.error('Failed to load stats', e);
  }
};

const setMonthFilter = (m?: number) => {
  selectedMonth.value = m;
  loadRegistrations();
};

const handleSearch = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    loadRegistrations();
  }, 300);
};

// Course helpers
const getUniqueCourses = (items: any[]) => {
  const map = new Map<number, SummerCourse>();
  for (const item of items || []) {
    if (item.course && !map.has(item.course.courseId)) {
      map.set(item.course.courseId, item.course);
    }
  }
  return Array.from(map.values());
};

// Register modal actions
const openRegisterModal = () => {
  regForm.value = {
    fullNameLo: '',
    fullNameEn: '',
    parentName: '',
    phoneNumber: '',
    academicYear: '2025-2026',
    monthsEnrolled: [1],
    courseIds: courses.value.filter((c) => c.isActive).slice(0, 1).map((c) => c.courseId),
    paymentMethod: 'cash',
    paidAmount: 0,
  };
  regForm.value.paidAmount = calculatedTotal.value;
  showRegisterModal.value = true;
};

const submitRegistration = async () => {
  if (regForm.value.courseIds.length === 0 || regForm.value.monthsEnrolled.length === 0) return;
  submitting.value = true;
  try {
    const reg = await summerRepository.registerStudent({
      ...regForm.value,
      paidAmount: regForm.value.paidAmount || calculatedTotal.value,
    });
    showRegisterModal.value = false;
    await Promise.all([loadRegistrations(), loadStats()]);
    if (reg) {
      selectedRegForPass.value = reg;
    }
  } catch (e: any) {
    alert(e.message || 'Registration failed');
  } finally {
    submitting.value = false;
  }
};

// Course modal actions
const openCourseModal = (course?: SummerCourse) => {
  if (course) {
    editingCourseId.value = course.courseId;
    courseForm.value = {
      academicYear: course.academicYear,
      subjectNameLo: course.subjectNameLo,
      subjectNameEn: course.subjectNameEn,
      gradeLevel: course.gradeLevel || '',
      monthlyFee: Number(course.monthlyFee),
      teacherName: course.teacherName || '',
      roomNumber: course.roomNumber || '',
      timeSlot: course.timeSlot || '',
      isActive: course.isActive,
    };
  } else {
    editingCourseId.value = null;
    courseForm.value = {
      academicYear: '2025-2026',
      subjectNameLo: '',
      subjectNameEn: '',
      gradeLevel: '',
      monthlyFee: 200000,
      teacherName: '',
      roomNumber: '',
      timeSlot: '',
      isActive: true,
    };
  }
  showCourseModal.value = true;
};

const submitCourse = async () => {
  submittingCourse.value = true;
  try {
    if (editingCourseId.value) {
      await summerRepository.updateCourse(editingCourseId.value, courseForm.value);
    } else {
      await summerRepository.createCourse(courseForm.value);
    }
    showCourseModal.value = false;
    await loadCourses();
  } catch (e: any) {
    alert(e.message || 'Failed to save course');
  } finally {
    submittingCourse.value = false;
  }
};

// Print actions
const openPassModal = (reg: SummerRegistration) => {
  selectedRegForPass.value = reg;
};

const openReceiptModal = (reg: SummerRegistration) => {
  selectedRegForReceipt.value = reg;
};

const printCard = () => {
  window.print();
};

onMounted(() => {
  loadCourses();
  loadRegistrations();
  loadStats();
});
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
  body * {
    visibility: hidden;
  }
  #summer-pass-print,
  #summer-pass-print *,
  #summer-receipt-print,
  #summer-receipt-print * {
    visibility: visible;
  }
  #summer-pass-print,
  #summer-receipt-print {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 24px;
    border: none !important;
    box-shadow: none !important;
  }
}
</style>
