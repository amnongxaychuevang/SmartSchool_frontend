<template>
  <div class="flex flex-col gap-6">
    <!-- Stat cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="panel p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted">{{ $t('transport.vehicles_count') }}</p>
          <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ vehicles.length }}</p>
        </div>
      </div>

      <div class="panel p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted">{{ $t('transport.routes_count') }}</p>
          <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ routes.length }}</p>
        </div>
      </div>

      <div class="panel p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted">{{ $t('transport.enrolled_students') }}</p>
          <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ busStudents.length }}</p>
        </div>
      </div>

      <div class="panel p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted">{{ $t('transport.onboard_live') }}</p>
          <p class="text-2xl font-bold text-emerald-500">{{ liveData.currentlyOnboard }}</p>
        </div>
      </div>
    </div>

    <!-- Tabs with Action Button on the Right -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex gap-6 overflow-x-auto">
        <button
          type="button"
          class="pb-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap"
          :class="activeTab === 'manifest' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'"
          @click="activeTab = 'manifest'"
        >
          {{ $t('transport.tab_manifest') }}
        </button>
        <button
          type="button"
          class="pb-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap"
          :class="activeTab === 'map' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'"
          @click="activeTab = 'map'"
        >
          {{ $t('transport.tab_map') }}
        </button>
        <button
          type="button"
          class="pb-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap"
          :class="activeTab === 'vehicles' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'"
          @click="activeTab = 'vehicles'"
        >
          {{ $t('transport.tab_vehicles') }}
        </button>
        <button
          type="button"
          class="pb-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap"
          :class="activeTab === 'students' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'"
          @click="activeTab = 'students'"
        >
          {{ $t('transport.tab_students') }}
        </button>
        <button
          type="button"
          class="pb-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap"
          :class="activeTab === 'logs' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'"
          @click="activeTab = 'logs'"
        >
          {{ $t('transport.tab_logs') }}
        </button>
      </div>

      <div class="pb-2.5 sm:pb-2 sm:ml-auto shrink-0 flex items-center gap-2">
        <!-- Vehicles Tab Action -->
        <button
          v-if="activeTab === 'vehicles'"
          type="button"
          class="btn-primary inline-flex items-center gap-1.5"
          @click="openVehicleModal()"
        >
          <span>+ {{ $t('transport.add_vehicle') }}</span>
        </button>

        <!-- Students Tab Action -->
        <button
          v-else-if="activeTab === 'students'"
          type="button"
          class="btn-primary inline-flex items-center gap-1.5"
          @click="openAssignModal"
        >
          <span>+ {{ $t('transport.assign_student') }}</span>
        </button>

        <!-- Logs Tab Action -->
        <template v-else-if="activeTab === 'logs'">
          <button
            type="button"
            class="btn-secondary inline-flex items-center gap-1.5"
            @click="fetchLogs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{{ $t('transport.refresh') }}</span>
          </button>
          <button
            type="button"
            class="btn-primary inline-flex items-center gap-1.5"
            @click="scanModalOpen = true"
          >
            <span>{{ $t('transport.tap_card') }}</span>
          </button>
        </template>

        <!-- Manifest / Map Tab Action -->
        <button
          v-else
          type="button"
          class="btn-primary inline-flex items-center gap-1.5"
          @click="scanModalOpen = true"
        >
          <span>{{ $t('transport.tap_card') }}</span>
        </button>
      </div>
    </div>

    <!-- TAB 1: LIVE MANIFEST -->
    <section v-if="activeTab === 'manifest'" class="panel p-6 flex flex-col gap-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 class="font-bold text-base text-slate-800 dark:text-white">{{ $t('transport.manifest_title') }}</h3>
          <p class="text-xs text-ink-muted">{{ $t('transport.manifest_subtitle') }}</p>
        </div>
        <button type="button" class="btn-secondary text-xs flex items-center gap-1.5" @click="fetchManifest">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ $t('transport.refresh') }}
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="item in liveData.manifest"
          :key="item.student.studentId"
          class="p-4 rounded-xl border flex flex-col justify-between gap-3"
          :class="manifestCardClass(item.status)"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-bold text-sm text-slate-800 dark:text-white">
                {{ locale === 'lo' ? item.student.fullNameLo : (item.student.fullNameEn || item.student.fullNameLo) }}
              </p>
              <p class="text-xs text-ink-muted font-mono">{{ item.student.studentCode }}</p>
              <p class="text-xs text-slate-600 dark:text-slate-300 mt-1">
                {{ (locale === 'lo' ? item.route?.routeNameLo : item.route?.routeNameEn) || item.route?.routeNameLo || $t('transport.no_route') }}
              </p>
            </div>
            <span
              class="badge text-xs px-2 py-0.5 rounded font-semibold whitespace-nowrap"
              :class="statusBadgeClass(item.status)"
            >
              {{ statusLabel(item.status) }}
            </span>
          </div>

          <div class="text-xs text-ink-muted border-t border-slate-200/50 dark:border-slate-800/50 pt-2 flex items-center justify-between">
            <span>{{ $t('transport.pickup_label') }}: {{ item.pickupStop || '—' }}</span>
            <span v-if="item.lastLog" class="font-mono text-teal-500 font-semibold">
              {{ formatTime(item.lastLog.logTime) }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB: LIVE FLEET GPS MAP -->
    <section v-if="activeTab === 'map'">
      <AdminFleetMap />
    </section>

    <!-- TAB 2: VEHICLES & ROUTES -->
    <section v-if="activeTab === 'vehicles'" class="panel p-6 flex flex-col gap-8">
      <!-- Vehicles -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-base text-slate-800 dark:text-white">{{ $t('transport.fleet_title') }}</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="v in vehicles" :key="v.vehicleId" class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-base font-bold text-teal-500 tracking-wide">{{ v.plateNumber }}</span>
                <span
                  class="badge text-xs px-2 py-0.5 rounded font-semibold"
                  :class="v.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'"
                >
                  {{ v.status === 'active' ? $t('transport.status_active') : $t('transport.status_maintenance') }}
                </span>
              </div>
              <p class="font-bold text-sm text-slate-800 dark:text-white">{{ v.model || 'Van/Bus' }}</p>
              <p class="text-xs text-ink-muted mt-1">{{ $t('transport.capacity_label') }}: {{ v.capacity }} {{ $t('transport.seats') }}</p>
              <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <p class="text-ink-muted">{{ $t('transport.driver') }}: <span class="font-semibold text-slate-700 dark:text-slate-300">{{ v.driverName }}</span></p>
                <p class="text-ink-muted mt-0.5">{{ $t('transport.phone') }}: <span class="font-medium text-slate-700 dark:text-slate-300 tnum">{{ v.driverPhone }}</span></p>
              </div>
            </div>
            <div class="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button type="button" class="btn-secondary text-xs px-2.5 py-1" @click="openVehicleModal(v)">
                {{ $t('common.edit') }}
              </button>
              <button type="button" class="btn-danger text-xs px-2.5 py-1" @click="deleteVehicle(v.vehicleId)">
                {{ $t('common.delete') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Routes -->
      <div class="border-t border-slate-200 dark:border-slate-800 pt-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-base text-slate-800 dark:text-white">{{ $t('transport.routes_title') }}</h3>
          <button type="button" class="btn-secondary text-xs" @click="openRouteModal()">
            + {{ $t('transport.add_route') }}
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="r in routes" :key="r.routeId" class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col">
            <h4 class="font-bold text-base text-slate-800 dark:text-white">
              {{ locale === 'lo' ? r.routeNameLo : (r.routeNameEn || r.routeNameLo) }}
            </h4>
            <p class="text-xs text-ink-muted">
              {{ locale === 'lo' ? r.routeNameEn : r.routeNameLo }}
            </p>
            <p v-if="r.vehicle" class="text-xs font-semibold text-teal-500 mt-2">
              {{ $t('transport.assigned_vehicle') }}: {{ r.vehicle.plateNumber }} ({{ r.vehicle.model }})
            </p>
            <div v-if="r.stops && r.stops.length" class="mt-3 text-xs space-y-1">
              <p class="font-semibold text-slate-700 dark:text-slate-300">{{ $t('transport.stops_label') }}:</p>
              <div v-for="(stop, idx) in r.stops" :key="idx" class="flex items-center gap-2 text-ink-muted">
                <span class="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                <span>{{ locale === 'lo' ? stop.nameLo : (stop.nameEn || stop.nameLo) }} ({{ stop.time }})</span>
              </div>
            </div>
            <div class="flex justify-end gap-2 mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
              <button type="button" class="btn-secondary text-xs px-2.5 py-1" @click="openRouteModal(r)">
                {{ $t('common.edit') }}
              </button>
              <button type="button" class="btn-danger text-xs px-2.5 py-1" @click="deleteRoute(r)">
                {{ $t('common.delete') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 3: ASSIGNED STUDENTS -->
    <section v-if="activeTab === 'students'" class="panel overflow-hidden">
      <div class="overflow-x-auto">
        <table class="data-table w-full">
          <thead>
            <tr>
              <th>{{ $t('transport.col_student') }}</th>
              <th>{{ $t('transport.col_class') }}</th>
              <th>{{ $t('transport.col_card') }}</th>
              <th>{{ $t('transport.col_route') }}</th>
              <th>{{ $t('transport.col_pickup') }}</th>
              <th>{{ $t('transport.col_dropoff') }}</th>
              <th class="text-right">{{ $t('transport.col_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!busStudents.length">
              <td colspan="7" class="text-center py-10 text-ink-muted">{{ $t('transport.empty_students') }}</td>
            </tr>
            <tr v-for="bs in busStudents" :key="bs.id">
              <td>
                <p class="font-semibold text-sm text-slate-800 dark:text-white">
                  {{ locale === 'lo' ? bs.student.fullNameLo : (bs.student.fullNameEn || bs.student.fullNameLo) }}
                </p>
                <p class="text-xs text-ink-muted font-mono">{{ bs.student.studentCode }}</p>
              </td>
              <td class="text-xs">
                {{ (locale === 'lo' ? bs.student.classStudents[0]?.class?.classNameLo : bs.student.classStudents[0]?.class?.classNameEn) || '—' }}
              </td>
              <td class="text-xs">
                <span v-if="bs.student.cards[0]" class="font-mono text-teal-500 font-bold">
                  {{ bs.student.cards[0].cardUid }}
                </span>
                <span v-else class="text-ink-subtle">
                  {{ $t('transport.no_card') }}
                </span>
              </td>
              <td class="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {{ (locale === 'lo' ? bs.route?.routeNameLo : bs.route?.routeNameEn) || bs.route?.routeNameLo }}
              </td>
              <td class="text-xs text-ink-muted">{{ bs.pickupStop || '—' }}</td>
              <td class="text-xs text-ink-muted">{{ bs.dropoffStop || '—' }}</td>
              <td class="text-right">
                <button type="button" class="btn-danger text-xs px-2.5 py-1" @click="removeBusStudent(bs.studentId)">
                  {{ $t('common.delete') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- TAB 4: SCAN LOGS -->
    <section v-if="activeTab === 'logs'" class="panel overflow-hidden">
      <div class="overflow-x-auto">
        <table class="data-table w-full">
          <thead>
            <tr>
              <th>{{ $t('transport.col_time') }}</th>
              <th>{{ $t('transport.col_student') }}</th>
              <th>{{ $t('transport.col_action') }}</th>
              <th>{{ $t('transport.col_direction') }}</th>
              <th>{{ $t('transport.col_vehicle') }}</th>
              <th>{{ $t('transport.col_location') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!logs.length">
              <td colspan="6" class="text-center py-10 text-ink-muted">{{ $t('transport.empty_logs') }}</td>
            </tr>
            <tr v-for="log in logs" :key="log.logId">
              <td class="text-xs text-ink-muted font-mono whitespace-nowrap">
                {{ formatDateTime(log.logTime) }}
              </td>
              <td>
                <p class="font-semibold text-sm text-slate-800 dark:text-white">
                  {{ locale === 'lo' ? log.student.fullNameLo : (log.student.fullNameEn || log.student.fullNameLo) }}
                </p>
                <p class="text-xs text-ink-muted font-mono">{{ log.student.studentCode }}</p>
              </td>
              <td>
                <span
                  class="badge text-xs px-2 py-0.5 rounded font-bold"
                  :class="log.logType === 'board' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'"
                >
                  {{ log.logType === 'board' ? $t('transport.board_action') : $t('transport.alight_action') }}
                </span>
              </td>
              <td class="text-xs">
                {{ log.direction === 'to_school' ? $t('transport.to_school') : $t('transport.to_home') }}
              </td>
              <td class="text-xs font-semibold text-amber-500">
                {{ log.vehicle?.plateNumber || '—' }}
              </td>
              <td class="text-xs text-ink-muted">{{ log.location || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Modal: Card Tap Simulator -->
    <AppModal :open="scanModalOpen" :title="$t('transport.modal_simulator')" @update:open="scanModalOpen = $event">
      <form class="flex flex-col gap-4" @submit.prevent="submitCardScan">
        <div class="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-600 dark:text-teal-400">
          💡 {{ $t('transport.simulator_tip') }}
        </div>

        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('transport.select_vehicle') }} *</label>
          <select v-model="scanForm.vehicleId" class="input-field" required>
            <option v-for="v in vehicles" :key="v.vehicleId" :value="v.vehicleId">
              {{ v.plateNumber }} ({{ v.model }}) - {{ $t('transport.driver') }}: {{ v.driverName }}
            </option>
          </select>
        </div>

        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('transport.card_uid') }} *</label>
          <input
            v-model.trim="scanForm.cardUid"
            type="text"
            class="input-field"
            required
            :placeholder="$t('transport.card_uid_ph')"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-1.5 text-sm font-semibold">{{ $t('transport.col_action') }} *</label>
            <select v-model="scanForm.logType" class="input-field" required>
              <option value="board">{{ $t('transport.board_action') }}</option>
              <option value="alight">{{ $t('transport.alight_action') }}</option>
            </select>
          </div>
          <div>
            <label class="block mb-1.5 text-sm font-semibold">{{ $t('transport.col_direction') }} *</label>
            <select v-model="scanForm.direction" class="input-field" required>
              <option value="to_school">{{ $t('transport.to_school') }}</option>
              <option value="to_home">{{ $t('transport.to_home') }}</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('transport.location') }}</label>
          <input v-model.trim="scanForm.location" type="text" class="input-field" :placeholder="$t('transport.location_ph')" />
        </div>

        <div v-if="scanFeedback" class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 font-semibold">
          {{ scanFeedback }}
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button type="button" class="btn-secondary" @click="scanModalOpen = false">{{ $t('common.close') }}</button>
          <button type="submit" class="btn-primary" :disabled="scanning">
            {{ scanning ? $t('common.loading') : $t('transport.tap_card') }}
          </button>
        </div>
      </form>
    </AppModal>

    <!-- Modal: Add Vehicle -->
    <AppModal :open="vehicleModalOpen" :title="editingVehicleId ? $t('transport.modal_edit_vehicle') : $t('transport.modal_add_vehicle')" @update:open="vehicleModalOpen = $event">
      <form class="flex flex-col gap-4" @submit.prevent="submitVehicle">
        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('transport.plate_number') }} *</label>
          <input v-model.trim="vehicleForm.plateNumber" type="text" class="input-field" required :placeholder="$t('transport.plate_ph')" />
        </div>
        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('transport.model') }}</label>
          <input v-model.trim="vehicleForm.model" type="text" class="input-field" :placeholder="$t('transport.model_ph')" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-1.5 text-sm font-semibold">{{ $t('transport.capacity') }} *</label>
            <input v-model.number="vehicleForm.capacity" type="number" min="5" max="60" class="input-field" required />
          </div>
          <div>
            <label class="block mb-1.5 text-sm font-semibold">{{ $t('transport.col_status') }} *</label>
            <select v-model="vehicleForm.status" class="input-field" required>
              <option value="active">{{ $t('transport.status_active') }}</option>
              <option value="maintenance">{{ $t('transport.status_maintenance') }}</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('transport.driver_name') }} *</label>
          <input v-model.trim="vehicleForm.driverName" type="text" class="input-field" required :placeholder="$t('transport.driver_name_ph')" />
        </div>
        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('transport.driver_phone') }} *</label>
          <input v-model.trim="vehicleForm.driverPhone" type="text" class="input-field" required :placeholder="$t('transport.driver_phone_ph')" />
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button type="button" class="btn-secondary" @click="vehicleModalOpen = false">{{ $t('common.cancel') }}</button>
          <button type="submit" class="btn-primary">{{ $t('common.save') }}</button>
        </div>
      </form>
    </AppModal>

    <!-- Modal: Add Route -->
    <AppModal :open="routeModalOpen" :title="editingRouteId ? $t('transport.modal_edit_route') : $t('transport.modal_add_route')" @update:open="routeModalOpen = $event">
      <form class="flex flex-col gap-4" @submit.prevent="submitRoute">
        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('transport.route_name_lo') }} *</label>
          <input v-model.trim="routeForm.routeNameLo" type="text" class="input-field" required :placeholder="$t('transport.route_name_lo_ph')" />
        </div>
        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('transport.route_name_en') }} *</label>
          <input v-model.trim="routeForm.routeNameEn" type="text" class="input-field" required :placeholder="$t('transport.route_name_en_ph')" />
        </div>
        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('transport.assigned_vehicle') }}</label>
          <select v-model="routeForm.vehicleId" class="input-field">
            <option :value="undefined">{{ $t('transport.select_vehicle_ph') }}</option>
            <option v-for="v in vehicles" :key="v.vehicleId" :value="v.vehicleId">
              {{ v.plateNumber }} ({{ v.model }})
            </option>
          </select>
        </div>
        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('transport.route_desc') }}</label>
          <textarea v-model.trim="routeForm.description" class="input-field" rows="2"></textarea>
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button type="button" class="btn-secondary" @click="routeModalOpen = false">{{ $t('common.cancel') }}</button>
          <button type="submit" class="btn-primary">{{ $t('common.save') }}</button>
        </div>
      </form>
    </AppModal>

    <!-- Modal: Assign Student -->
    <AppModal :open="assignModalOpen" :title="$t('transport.modal_assign')" @update:open="assignModalOpen = $event">
      <form class="flex flex-col gap-4" @submit.prevent="submitAssign">
        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('transport.col_student') }} *</label>
          <StudentPicker v-model="assignForm.studentId" input-id="bus-student" />
        </div>
        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('transport.col_route') }} *</label>
          <select v-model="assignForm.routeId" class="input-field" required>
            <option v-for="r in routes" :key="r.routeId" :value="r.routeId">
              {{ locale === 'lo' ? r.routeNameLo : (r.routeNameEn || r.routeNameLo) }}
            </option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-1.5 text-sm font-semibold">{{ $t('transport.pickup_stop') }}</label>
            <input v-model.trim="assignForm.pickupStop" type="text" class="input-field" />
          </div>
          <div>
            <label class="block mb-1.5 text-sm font-semibold">{{ $t('transport.dropoff_stop') }}</label>
            <input v-model.trim="assignForm.dropoffStop" type="text" class="input-field" />
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button type="button" class="btn-secondary" @click="assignModalOpen = false">{{ $t('common.cancel') }}</button>
          <button type="submit" class="btn-primary">{{ $t('common.save') }}</button>
        </div>
      </form>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import AppModal from '../../../components/AppModal.vue';
import StudentPicker from '../../../components/StudentPicker.vue';
import AdminFleetMap from '../../../components/transport/AdminFleetMap.vue';
import { useApiClient } from '../../../infrastructure/api/apiClient';
import { API_ENDPOINTS } from '../../../infrastructure/api/endpoints';

definePageMeta({ layout: 'admin' });

const { locale, t } = useI18n();
const dialog = useDialog();
const apiClient = useApiClient();

const activeTab = ref<'manifest' | 'map' | 'vehicles' | 'students' | 'logs'>('manifest');

const vehicles = ref<any[]>([]);
const routes = ref<any[]>([]);
const busStudents = ref<any[]>([]);
const logs = ref<any[]>([]);
const liveData = ref<any>({ currentlyOnboard: 0, manifest: [] });

const scanModalOpen = ref(false);
const vehicleModalOpen = ref(false);
const routeModalOpen = ref(false);
const assignModalOpen = ref(false);

const scanning = ref(false);
const scanFeedback = ref('');

const scanForm = reactive({
  vehicleId: undefined as number | undefined,
  cardUid: '',
  logType: 'board' as 'board' | 'alight',
  direction: 'to_school' as 'to_school' | 'to_home',
  location: '',
});

const vehicleForm = reactive({
  plateNumber: '',
  model: '',
  capacity: 15,
  driverName: '',
  driverPhone: '',
  status: 'active',
});

const routeForm = reactive({
  routeNameLo: '',
  routeNameEn: '',
  vehicleId: undefined as number | undefined,
  description: '',
});

const assignForm = reactive({
  studentId: null as number | null,
  routeId: undefined as number | undefined,
  pickupStop: '',
  dropoffStop: '',
});

const formatTime = (dateStr: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${d.toLocaleDateString('en-GB')} ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
};

const statusLabel = (st: string) => {
  switch (st) {
    case 'onboard': return t('transport.status_onboard');
    case 'alighted': return t('transport.status_alighted');
    default: return t('transport.status_not_boarded');
  }
};

const statusBadgeClass = (st: string) => {
  switch (st) {
    case 'onboard': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'alighted': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
  }
};

const manifestCardClass = (st: string) => {
  switch (st) {
    case 'onboard': return 'border-emerald-500/30 bg-emerald-500/5 shadow-sm';
    case 'alighted': return 'border-blue-500/20 bg-blue-500/5';
    default: return 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40';
  }
};

const fetchVehicles = async () => {
  try {
    const res = await apiClient<any>(API_ENDPOINTS.bus.vehicles, { method: 'GET' });
    const list = res?.data?.vehicles || res?.vehicles;
    if (list) {
      vehicles.value = list;
      if (!scanForm.vehicleId && vehicles.value.length) {
        scanForm.vehicleId = vehicles.value[0].vehicleId;
      }
    }
  } catch (err) {
    console.error('Error fetching vehicles:', err);
  }
};

const fetchRoutes = async () => {
  try {
    const res = await apiClient<any>(API_ENDPOINTS.bus.routes, { method: 'GET' });
    const list = res?.data?.routes || res?.routes;
    if (list) routes.value = list;
  } catch (err) {
    console.error('Error fetching routes:', err);
  }
};

const fetchBusStudents = async () => {
  try {
    const res = await apiClient<any>(API_ENDPOINTS.bus.students, { method: 'GET' });
    const list = res?.data?.students || res?.students;
    if (list) busStudents.value = list;
  } catch (err) {
    console.error('Error fetching bus students:', err);
  }
};

const fetchManifest = async () => {
  try {
    const res = await apiClient<any>(API_ENDPOINTS.bus.manifest, { method: 'GET' });
    if (res?.data) liveData.value = res.data;
    else if (res) liveData.value = res;
  } catch (err) {
    console.error('Error fetching live manifest:', err);
  }
};

const fetchLogs = async () => {
  try {
    const res = await apiClient<any>(API_ENDPOINTS.bus.logs, { method: 'GET' });
    const list = res?.data?.logs || res?.logs;
    if (list) logs.value = list;
  } catch (err) {
    console.error('Error fetching bus logs:', err);
  }
};

const submitCardScan = async () => {
  scanning.value = true;
  scanFeedback.value = '';
  try {
    const res = await apiClient<any>(API_ENDPOINTS.bus.scan, { method: 'POST', body: scanForm });
    const log = res?.data?.log || res?.log;
    const studentName = locale.value === 'lo'
      ? (log?.student?.fullNameLo || log?.student?.fullNameEn || '')
      : (log?.student?.fullNameEn || log?.student?.fullNameLo || '');
    const actionName = scanForm.logType === 'board' ? t('transport.board_action') : t('transport.alight_action');
    scanFeedback.value = `✓ ${t('transport.tap_success', { name: studentName, action: actionName })}`;
    scanForm.cardUid = '';
    await fetchManifest();
    await fetchLogs();
  } catch (err: any) {
    scanFeedback.value = `❌ ${t('transport.error_scan')}: ${err?.data?.message || err?.message}`;
  } finally {
    scanning.value = false;
  }
};

// The same modal adds a vehicle or, given one, edits it.
const editingVehicleId = ref<number | null>(null);
const openVehicleModal = (v?: any) => {
  editingVehicleId.value = v?.vehicleId ?? null;
  vehicleForm.plateNumber = v?.plateNumber ?? '';
  vehicleForm.model = v?.model ?? '';
  vehicleForm.capacity = v?.capacity ?? 15;
  vehicleForm.driverName = v?.driverName ?? '';
  vehicleForm.driverPhone = v?.driverPhone ?? '';
  vehicleForm.status = v?.status ?? 'active';
  vehicleModalOpen.value = true;
};

const submitVehicle = async () => {
  try {
    if (editingVehicleId.value) {
      await apiClient(`${API_ENDPOINTS.bus.vehicles}/${editingVehicleId.value}`, { method: 'PUT', body: vehicleForm });
    } else {
      await apiClient(API_ENDPOINTS.bus.vehicles, { method: 'POST', body: vehicleForm });
    }
    vehicleModalOpen.value = false;
    await Promise.all([fetchVehicles(), fetchRoutes()]);
  } catch (err) {
    dialog.error(getErrorMessage(err));
  }
};

const deleteVehicle = (id: number) => {
  dialog.confirm({
    message: t('transport.confirm_delete_vehicle'),
    tone: 'danger',
    confirmLabel: t('common.delete'),
    onConfirm: async () => {
      await apiClient(`${API_ENDPOINTS.bus.vehicles}/${id}`, { method: 'DELETE' });
      await fetchVehicles();
    },
  });
};

const editingRouteId = ref<number | null>(null);
const openRouteModal = (r?: any) => {
  editingRouteId.value = r?.routeId ?? null;
  routeForm.routeNameLo = r?.routeNameLo ?? '';
  routeForm.routeNameEn = r?.routeNameEn ?? '';
  routeForm.vehicleId = r ? (r.vehicleId ?? undefined) : vehicles.value[0]?.vehicleId;
  routeForm.description = r?.description ?? '';
  routeModalOpen.value = true;
};

const submitRoute = async () => {
  try {
    if (editingRouteId.value) {
      await apiClient(`${API_ENDPOINTS.bus.routes}/${editingRouteId.value}`, { method: 'PUT', body: routeForm });
    } else {
      await apiClient(API_ENDPOINTS.bus.routes, { method: 'POST', body: routeForm });
    }
    routeModalOpen.value = false;
    await fetchRoutes();
  } catch (err) {
    dialog.error(getErrorMessage(err));
  }
};

const deleteRoute = (r: any) => {
  dialog.confirm({
    message: t('transport.confirm_delete_route', { name: locale.value === 'lo' ? r.routeNameLo : r.routeNameEn }),
    tone: 'danger',
    confirmLabel: t('common.delete'),
    onConfirm: async () => {
      await apiClient(`${API_ENDPOINTS.bus.routes}/${r.routeId}`, { method: 'DELETE' });
      await Promise.all([fetchRoutes(), fetchBusStudents()]);
    },
  });
};

const openAssignModal = () => {
  assignForm.studentId = null;
  assignForm.routeId = routes.value[0]?.routeId;
  assignForm.pickupStop = '';
  assignForm.dropoffStop = '';
  assignModalOpen.value = true;
};

const submitAssign = async () => {
  if (!assignForm.studentId) return;
  try {
    await apiClient(API_ENDPOINTS.bus.students, { method: 'POST', body: assignForm });
    assignModalOpen.value = false;
    await fetchBusStudents();
    await fetchManifest();
  } catch (err: any) {
    dialog.error(getErrorMessage(err));
  }
};

const removeBusStudent = (studentId: number) => {
  dialog.confirm({
    message: t('transport.confirm_remove_student'),
    tone: 'danger',
    confirmLabel: t('common.delete'),
    onConfirm: async () => {
      await apiClient(`${API_ENDPOINTS.bus.students}/${studentId}`, { method: 'DELETE' });
      await Promise.all([fetchBusStudents(), fetchManifest()]);
    },
  });
};

onMounted(() => {
  fetchVehicles();
  fetchRoutes();
  fetchBusStudents();
  fetchManifest();
  fetchLogs();
});
</script>
