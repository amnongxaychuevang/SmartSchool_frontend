<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ locale === 'lo' ? 'ສົກຮຽນ / ພາກຮຽນ' : 'Academic Terms' }}</h1>
      <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center" @click="openModal()">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        {{ locale === 'lo' ? 'ເພີ່ມພາກຮຽນ' : 'Add Term' }}
      </button>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead class="bg-slate-50 dark:bg-slate-800/50">
          <tr>
            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ locale === 'lo' ? 'ສົກຮຽນ' : 'Academic Year' }}</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ locale === 'lo' ? 'ຊື່ພາກຮຽນ' : 'Term Name' }}</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ locale === 'lo' ? 'ວັນທີເລີ່ມຕົ້ນ' : 'Start Date' }}</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ locale === 'lo' ? 'ວັນທີສິ້ນສຸດ' : 'End Date' }}</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ locale === 'lo' ? 'ສະຖານະ' : 'Status' }}</th>
            <th class="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ locale === 'lo' ? 'ຈັດການ' : 'Actions' }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
          <tr v-for="term in terms" :key="term.termId" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-medium">{{ term.academicYear }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
              {{ locale === 'lo' ? term.termNameLo : term.termNameEn }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">{{ formatDate(term.startDate) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">{{ formatDate(term.endDate) }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="statusClass(term.status)" class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border">
                {{ formatStatus(term.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4 transition-colors" @click="openModal(term)">{{ locale === 'lo' ? 'ແກ້ໄຂ' : 'Edit' }}</button>
              <button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors" @click="deleteTerm(term.termId)">{{ locale === 'lo' ? 'ລຶບ' : 'Delete' }}</button>
            </td>
          </tr>
          <tr v-if="terms.length === 0">
            <td colspan="6" class="px-6 py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
              {{ locale === 'lo' ? 'ບໍ່ມີຂໍ້ມູນພາກຮຽນ' : 'No academic terms found' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
const { $api } = useNuxtApp();
const { locale } = useI18n();

const terms = ref([]);
const isModalOpen = ref(false);

const fetchTerms = async () => {
  try {
    const { data } = await $api.get('/api/academic-terms');
    if (data.success) {
      terms.value = data.data.terms;
    }
  } catch (error) {
    console.error('Error fetching academic terms', error);
  }
};

const deleteTerm = async (id) => {
  const msg = locale.value === 'lo' ? 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບພາກຮຽນນີ້?' : 'Are you sure you want to delete this term?';
  if (confirm(msg)) {
    try {
      await $api.delete(`/api/academic-terms/${id}`);
      await fetchTerms();
    } catch (error) {
      console.error('Error deleting term', error);
    }
  }
};

const openModal = (term = null) => {
  // Modal logic to be implemented
  console.log('Open modal', term);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString(locale.value === 'lo' ? 'lo-LA' : 'en-US');
};

const formatStatus = (status) => {
  if (locale.value === 'lo') {
    if (status === 'active') return 'ກຳລັງເປີດຮຽນ';
    if (status === 'upcoming') return 'ກຳລັງຈະມາເຖິງ';
    if (status === 'completed') return 'ສຳເລັດແລ້ວ';
  }
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const statusClass = (status) => {
  if (status === 'active') return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
  if (status === 'upcoming') return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
  return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
};

onMounted(() => {
  fetchTerms();
});
</script>
