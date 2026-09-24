<template>
  <div class="flex flex-col gap-6">
    <!-- Header + Search -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-4">
      <div class="relative flex-1 max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
v-model="searchInput" type="text" :placeholder="$t('parents.search')"
          class="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          @input="handleSearch" >
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Add Parent button -->
        <button
class="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-[0_4px_14px_rgba(20,184,166,0.25)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.4)]"
          @click="openAddModal">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('parents.add_parent') }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="glass-panel overflow-hidden">
      <LoadingSpinner v-if="adminStore.parentsLoading" />
      <div v-else-if="adminStore.parents.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p>{{ $t('parents.no_parents') }}</p>
      </div>
      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-slate-800">
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('common.user') }}</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('parents.occupation') }}</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3 hidden md:table-cell">{{ $t('parents.national_id') }}</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">{{ $t('users.contact') }}</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('common.status') }}</th>
            <th class="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60">
          <tr v-for="parent in adminStore.parents" :key="parent.parentId" class="hover:bg-slate-800/40 transition-colors">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm font-bold shrink-0">
                  {{ parent.user?.fullNameEn?.[0] ?? '?' }}
                </div>
                <div>
                  <p class="text-sm font-medium text-white">{{ parent.user?.fullNameEn }}</p>
                  <p class="text-xs text-slate-500">{{ parent.user?.fullNameLo }}</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-slate-300">{{ parent.occupation ?? '—' }}</td>
            <td class="px-6 py-4 text-sm text-slate-400 hidden md:table-cell">{{ parent.nationalId ?? '—' }}</td>
            <td class="px-6 py-4 hidden sm:table-cell">
              <p class="text-sm text-slate-300">{{ parent.user?.email ?? '—' }}</p>
              <p class="text-xs text-slate-500">{{ parent.user?.phoneNumber ?? '—' }}</p>
            </td>
            <td class="px-6 py-4">
              <span
class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                :class="parent.user?.isActive ? 'bg-teal-500/20 text-teal-400' : 'bg-red-500/20 text-red-400'">
                {{ parent.user?.isActive ? $t('common.active') : $t('common.inactive') }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-2">
                <button
class="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all"
                  :title="$t('common.edit')"
                  @click="openEditModal(parent)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <!-- Deactivate / reactivate (accounts are never deleted) -->
                <button
                  :disabled="togglingId === parent.parentId"
                  class="p-1.5 rounded-lg text-slate-400 transition-all disabled:opacity-40"
                  :class="parent.user?.isActive ? 'hover:text-red-400 hover:bg-red-500/10' : 'hover:text-teal-400 hover:bg-teal-500/10'"
                  :title="parent.user?.isActive ? $t('common.deactivate') : $t('common.reactivate')"
                  @click="toggleActive(parent)">
                  <svg v-if="parent.user?.isActive" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2">
      <button
:disabled="adminStore.parentsPage <= 1"
        class="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        @click="changePage(adminStore.parentsPage - 1)">← {{ $t('common.back') }}</button>
      <span class="text-sm text-slate-400">{{ adminStore.parentsPage }} / {{ totalPages }}</span>
      <button
:disabled="adminStore.parentsPage >= totalPages"
        class="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        @click="changePage(adminStore.parentsPage + 1)">Next →</button>
    </div>


    <Teleport to="body">
      <Transition name="modal">
        <div v-if="parentModal.open" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="parentModal.open = false"/>
          <div class="relative glass-panel w-full max-w-4xl flex flex-col p-0 overflow-hidden">
            <div class="p-6 flex items-center justify-between border-b border-slate-800/50 bg-slate-900/20">
              <div>
                <h2 class="text-xl font-bold text-white flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ parentModal.mode === 'add' ? $t('parents.add_parent') : $t('parents.edit_parent') }}
                </h2>
                <p class="text-xs text-slate-400 mt-1">Provide credential and profile details for this parent.</p>
              </div>
              <button class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" @click="parentModal.open = false">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div v-if="parentModal.error" class="m-6 mb-0 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{{ parentModal.error }}</div>

            <form class="flex flex-col" @submit.prevent="handleParentSubmit">
              <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto pr-6 scrollbar-thin">
              
                <!-- Column 1: Account Credentials -->
                <div class="flex flex-col gap-4 bg-slate-800/20 border border-slate-700/50 p-5 rounded-2xl">
                  <div class="flex items-center gap-2 pb-2 border-b border-slate-700/50">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 class="text-sm font-semibold text-white uppercase tracking-wider">Account Credentials</h3>
                  </div>

                  <!-- Full Name EN -->
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      {{ $t('users.full_name_en') }} <span class="text-teal-400">*</span>
                    </label>
                    <div class="relative">
                      <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </span>
                      <input v-model="parentModal.form.fullNameEn" required type="text" class="input-field pl-10" placeholder="e.g. Jane Doe" >
                    </div>
                  </div>

                  <!-- Full Name LO -->
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      {{ $t('users.full_name_lo') }} <span class="text-teal-400">*</span>
                    </label>
                    <div class="relative">
                      <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </span>
                      <input v-model="parentModal.form.fullNameLo" required type="text" class="input-field pl-10" placeholder="ຕົວຢ່າງ: ນາງ ສົມດີ" >
                    </div>
                  </div>

                  <!-- Email -->
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      {{ $t('users.email') }}
                    </label>
                    <div class="relative">
                      <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <input v-model="parentModal.form.email" type="email" autocomplete="email" class="input-field pl-10" placeholder="e.g. jane@example.com" >
                    </div>
                  </div>

                  <!-- Phone -->
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      {{ $t('users.phone') }} <span class="text-teal-400">*</span>
                    </label>
                    <div class="relative">
                      <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </span>
                      <input v-model="parentModal.form.phoneNumber" required type="text" autocomplete="tel" class="input-field pl-10" placeholder="e.g. +856 20 ..." >
                    </div>
                  </div>

                  <!-- Password -->
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      {{ $t('users.password') }}{{ parentModal.mode === 'add' ? ' *' : '' }}
                    </label>
                    <div class="relative">
                      <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <input
  v-model="parentModal.form.password"
                        :required="parentModal.mode === 'add'"
                        type="password"
                        autocomplete="new-password"
                        :placeholder="parentModal.mode === 'edit' ? $t('users.password_placeholder') : '••••••••'"
                        class="input-field pl-10" >
                    </div>
                  </div>

                  <!-- Status Switch Row -->
                  <div class="flex items-center justify-between p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl mt-2">
                    <div class="flex flex-col gap-1">
                      <span class="text-xs font-semibold text-white uppercase tracking-wider">{{ $t('common.status') }}</span>
                      <span class="text-xs text-slate-400">Toggle parent's login status</span>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input v-model="parentModal.form.isActive" type="checkbox" class="sr-only peer" >
                      <div class="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-teal-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"/>
                    </label>
                  </div>
                </div>

                <!-- Column 2: Parent Profile Details -->
                <div class="flex flex-col gap-4 bg-slate-800/20 border border-slate-700/50 p-5 rounded-2xl">
                  <div class="flex items-center gap-2 pb-2 border-b border-slate-700/50">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1" />
                    </svg>
                    <h3 class="text-sm font-semibold text-white uppercase tracking-wider">Parent Profile Details</h3>
                  </div>

                  <!-- Occupation EN & LO -->
                  <div class="grid grid-cols-2 gap-3">
                    <div class="flex flex-col gap-1.5">
                      <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {{ $t('parents.occupation') }}
                      </label>
                      <div class="relative">
                        <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01" />
                          </svg>
                        </span>
                        <input v-model="parentModal.form.occupation" type="text" placeholder="e.g. ຊາວນາ / Engineer" class="input-field pl-10" >
                      </div>
                    </div>

                  </div>

                  <!-- Emergency Contact & Line ID -->
                  <div class="grid grid-cols-2 gap-3">
                    <div class="flex flex-col gap-1.5">
                      <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {{ $t('parents.emergency_contact') }}
                      </label>
                      <div class="relative">
                        <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </span>
                        <input v-model="parentModal.form.emergencyContact" type="text" placeholder="e.g. +85620..." class="input-field pl-10" >
                      </div>
                    </div>

                    <div class="flex flex-col gap-1.5">
                      <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Line ID</label>
                      <div class="relative">
                        <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </span>
                        <input v-model="parentModal.form.lineId" type="text" placeholder="e.g. mylineid" class="input-field pl-10" >
                      </div>
                    </div>
                  </div>

                  <!-- National ID -->
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {{ $t('parents.national_id') }}
                    </label>
                    <div class="relative">
                      <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </span>
                      <input v-model="parentModal.form.nationalId" type="text" placeholder="e.g. N-12345" class="input-field pl-10" >
                    </div>
                  </div>

                  <!-- Address -->
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('common.address') }}</label>
                    <div class="relative">
                      <span class="absolute top-3 left-3 flex items-center pointer-events-none text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </span>
                      <textarea v-model="parentModal.form.address" rows="2" class="input-field pl-10 resize-none pt-2" placeholder="ບ້ານ, ເມືອງ, ແຂວງ"/>
                    </div>
                  </div>

                </div>

              </div>

              <div class="p-6 pt-4 border-t border-slate-800/50 flex items-center justify-end gap-3 bg-slate-900/20">
                <button type="button" class="btn-ghost" @click="parentModal.open = false">
                  {{ $t('common.cancel') }}
                </button>
                <button type="submit" :disabled="parentModal.saving" class="btn-primary flex items-center gap-2">
                  <svg v-if="parentModal.saving" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <span v-else>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {{ parentModal.saving ? $t('common.saving') : $t('common.save') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useAdminStore } from '../../../application/stores/admin';
import type { Parent } from '../../../domain/models/Parent';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Parents — Smart School Admin' });

const adminStore = useAdminStore();
const { locale, t } = useI18n();
const searchInput = ref('');
let searchTimeout: ReturnType<typeof setTimeout>;

const totalPages = computed(() => Math.ceil(adminStore.parentsTotal / 15));

onMounted(() => {
  adminStore.fetchParents();
});

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    adminStore.fetchParents({ search: searchInput.value, page: 1 });
  }, 400);
};

const changePage = (page: number) => {
  adminStore.fetchParents({ page });
};

// ── Parent Modal (Add + Edit) ──
const emptyParentForm = () => ({
  fullNameEn: '',
  fullNameLo: '',
  email: '',
  phoneNumber: '',
  password: '',
  isActive: true,
  occupation: '',
  emergencyContact: '',
  lineId: '',
  nationalId: '',
  address: ''
});

const parentModal = reactive({
  open: false,
  mode: 'add' as 'add' | 'edit',
  saving: false,
  error: '',
  parentId: null as number | null,
  form: emptyParentForm()
});

const openAddModal = () => {
  parentModal.mode = 'add';
  parentModal.parentId = null;
  parentModal.form = emptyParentForm();
  parentModal.error = '';
  parentModal.open = true;
};

const openEditModal = (parent: Parent) => {
  parentModal.mode = 'edit';
  parentModal.parentId = parent.parentId;
  parentModal.form = {
    fullNameEn: parent.user?.fullNameEn ?? '',
    fullNameLo: parent.user?.fullNameLo ?? '',
    email: parent.user?.email ?? '',
    phoneNumber: parent.user?.phoneNumber ?? '',
    password: '',
    isActive: parent.user?.isActive ?? true,
    occupation: parent.occupation ?? '',
    emergencyContact: parent.emergencyContact ?? '',
    lineId: parent.lineId ?? '',
    nationalId: parent.nationalId ?? '',
    address: parent.address ?? ''
  };
  parentModal.error = '';
  parentModal.open = true;
};

const handleParentSubmit = async () => {
  parentModal.saving = true;
  parentModal.error = '';
  try {
    const payload: Record<string, unknown> = { ...parentModal.form };
    // Don't send empty fields or empty password on edit
    if (parentModal.mode === 'edit' && !payload.password) {
      delete payload.password;
    }

    if (parentModal.mode === 'add') {
      await adminStore.createParent(payload);
    } else if (parentModal.parentId) {
      await adminStore.updateParent(parentModal.parentId, payload);
    }
    parentModal.open = false;
  } catch (err) {
    parentModal.error = getErrorMessage(err, 'Failed to save parent');
  } finally {
    parentModal.saving = false;
  }
};

// ── Deactivate / reactivate ──
// Accounts are never deleted: their top-up, leave and audit history must stay.
const togglingId = ref<number | null>(null);

const toggleActive = async (u: Parent) => {
  const makeActive = !u.user?.isActive;
  const name = (locale.value === 'lo' ? u.user?.fullNameLo : u.user?.fullNameEn) || u.user?.fullNameEn || '';
  if (!makeActive && !confirm(t('common.deactivate_confirm', { name }))) return;
  togglingId.value = u.parentId;
  try {
    await adminStore.updateParent(u.parentId, { isActive: makeActive });
  } catch (err) {
    alert((err instanceof Error && err.message) || 'Failed to update status');
  } finally {
    togglingId.value = null;
  }
};
</script>

<style scoped lang="postcss">

/* Fix Autofill styling in modern browsers to match dark mode */
.modal-input:-webkit-autofill,
.modal-input:-webkit-autofill:hover, 
.modal-input:-webkit-autofill:focus,
.modal-input:-webkit-autofill:active {
  -webkit-text-fill-color: #ffffff !important;
  -webkit-box-shadow: 0 0 0 1000px #080e1a inset !important;
  box-shadow: 0 0 0 1000px #080e1a inset !important;
  border-color: rgba(45, 212, 191, 0.4) !important;
  transition: background-color 5000s ease-in-out 0s;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
