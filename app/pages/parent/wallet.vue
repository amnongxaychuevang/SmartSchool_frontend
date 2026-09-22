<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-bold text-white">{{ $t('parentPortal.childs_wallet') }}</h1>
        <select
v-model="selectedChildId" class="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-pink-500"
          @change="loadWallet"
        >
          <option value="">{{ $t('parentPortal.select_child') }}</option>
          <option v-for="child in parentStore.children" :key="child.studentId" :value="child.studentId">
            {{ child.user?.fullNameEn || `Student #${child.studentId}` }}
          </option>
        </select>
      </div>
      <button :disabled="!selectedChildId" class="px-4 py-2.5 bg-pink-500 hover:bg-pink-400 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" @click="topUpModal.open = true">
        {{ $t('parentPortal.top_up') }}
      </button>
    </div>

    <div v-if="parentStore.loadingWallet" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"/>
    </div>
    
    <template v-else-if="parentStore.wallet">
      <div class="glass-panel p-6 rounded-2xl flex flex-col gap-4">
        <div class="flex justify-between items-center">
          <p class="text-slate-400 font-medium">{{ $t('parentPortal.current_balance') }}</p>
          <div class="flex items-center gap-2">
            <button class="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-slate-300 transition-colors" :title="$t('parentPortal.spending_limits')" @click="openLimitsModal">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            <div class="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <h2 class="text-3xl font-bold text-white">₭ {{ parentStore.wallet.balance?.toLocaleString() || 0 }}</h2>
        <div v-if="parentStore.spendingLimits?.dailyMax" class="text-sm text-slate-400 mt-1">
          {{ $t('parentPortal.daily_max') }}: ₭ {{ parentStore.spendingLimits.dailyMax.toLocaleString() }}
        </div>
      </div>

      <div class="glass-panel overflow-hidden">
        <div class="p-4 border-b border-slate-800 bg-slate-900/50">
          <h2 class="text-lg font-semibold text-white">{{ $t('parentPortal.recent_transactions') }}</h2>
        </div>
        <div v-if="!parentStore.wallet.transactions || parentStore.wallet.transactions.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-500">
          <p>{{ $t('parentPortal.no_transactions') }}</p>
        </div>
        <table v-else class="w-full">
          <thead>
            <tr class="border-b border-slate-800">
              <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('parentPortal.date') }}</th>
              <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('parentPortal.type') }}</th>
              <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('parentPortal.amount') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            <tr v-for="tx in parentStore.wallet.transactions" :key="tx.transactionId" class="hover:bg-slate-800/40 transition-colors">
              <td class="px-6 py-4 text-sm text-white">{{ new Date(tx.createdAt).toLocaleString() }}</td>
              <td class="px-6 py-4 text-sm text-slate-400 capitalize">{{ tx.transactionType }}</td>
              <td class="px-6 py-4 text-sm font-bold" :class="tx.transactionType === 'top_up' ? 'text-teal-400' : 'text-pink-400'">
                {{ tx.transactionType === 'top_up' ? '+' : '-' }}₭ {{ tx.amount.toLocaleString() }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    
    <div v-else class="glass-panel p-12 text-center text-slate-500 rounded-2xl">
      {{ $t('parentPortal.please_select_child') }}
    </div>
  </div>

  <Teleport to="body">
    <Transition name="modal">
      <div v-if="topUpModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="topUpModal.open = false"/>
        <div class="relative glass-panel rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-5">
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 class="text-xl font-bold text-white">{{ $t('parentPortal.request_top_up') }}</h2>
            <button class="text-slate-400 hover:text-white" @click="topUpModal.open = false">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <form class="flex flex-col gap-4" @submit.prevent="handleTopUp">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('parentPortal.amount') }}</label>
              <input v-model.number="topUpModal.form.amount" type="number" required min="1000" step="1000" class="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-pink-500" placeholder="e.g. 50000" >
            </div>
            
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('parentPortal.proof_of_payment') }}</label>
              <input v-model="topUpModal.form.proofOfPayment" type="text" required class="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-pink-500" placeholder="Transaction Ref or Image URL" >
            </div>
            
            <div class="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button type="button" class="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors" @click="topUpModal.open = false">{{ $t('common.cancel') }}</button>
              <button type="submit" :disabled="topUpModal.saving" class="px-4 py-2 rounded-lg text-sm font-semibold bg-pink-500 hover:bg-pink-400 text-white transition-colors disabled:opacity-50">
                {{ topUpModal.saving ? $t('common.saving') : $t('parentPortal.submit_request') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>

  <Teleport to="body">
    <Transition name="modal">
      <div v-if="limitsModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="limitsModal.open = false"/>
        <div class="relative glass-panel rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-5">
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 class="text-xl font-bold text-white">{{ $t('parentPortal.spending_limits') }}</h2>
            <button class="text-slate-400 hover:text-white" @click="limitsModal.open = false">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <form class="flex flex-col gap-4" @submit.prevent="handleSaveLimits">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('parentPortal.daily_max') }}</label>
              <input v-model.number="limitsModal.form.dailyMax" type="number" min="0" step="1000" class="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-pink-500" placeholder="e.g. 50000" >
              <span class="text-xs text-slate-500">{{ $t('parentPortal.no_limit') }}: {{ limitsModal.form.dailyMax ? '' : '✓' }}</span>
            </div>
            
            <div class="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button type="button" class="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors" @click="limitsModal.open = false">{{ $t('common.cancel') }}</button>
              <button type="submit" :disabled="limitsModal.saving" class="px-4 py-2 rounded-lg text-sm font-semibold bg-pink-500 hover:bg-pink-400 text-white transition-colors disabled:opacity-50">
                {{ limitsModal.saving ? $t('common.saving') : $t('parentPortal.save_limits') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { useParentStore } from '../../application/stores/parent';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

definePageMeta({ layout: 'parent' });
useHead({ title: computed(() => `${t('parentPortal.childs_wallet')} — ${t('parentPortal.title')}`) });

const parentStore = useParentStore();
const selectedChildId = ref<number | ''>('');

const topUpModal = reactive({
  open: false,
  saving: false,
  form: {
    amount: 50000,
    proofOfPayment: ''
  }
});

const limitsModal = reactive({
  open: false,
  saving: false,
  form: {
    dailyMax: null as number | null
  }
});

onMounted(async () => {
  await parentStore.fetchChildren();
  if (parentStore.children.length > 0) {
    selectedChildId.value = parentStore.children[0].studentId;
    loadWallet();
  }
});

const loadWallet = async () => {
  if (selectedChildId.value) {
    const studentId = Number(selectedChildId.value);
    await Promise.all([
      parentStore.fetchChildWallet(studentId),
      parentStore.fetchSpendingLimits(studentId)
    ]);
  }
};

const openLimitsModal = () => {
  if (parentStore.spendingLimits) {
    limitsModal.form.dailyMax = parentStore.spendingLimits.dailyMax ? Number(parentStore.spendingLimits.dailyMax) : null;
  } else {
    limitsModal.form.dailyMax = null;
  }
  limitsModal.open = true;
};

const handleSaveLimits = async () => {
  if (!selectedChildId.value) return;
  limitsModal.saving = true;
  try {
    await parentStore.updateSpendingLimits(Number(selectedChildId.value), {
      dailyMax: limitsModal.form.dailyMax || null,
      weeklyMax: null,
      perTransactionMax: null,
      alertThreshold: null
    });
    limitsModal.open = false;
    alert(t('parentPortal.limits_updated'));
    await parentStore.fetchSpendingLimits(Number(selectedChildId.value));
  } catch (err: any) {
    alert(err.message || 'Failed to update limits');
  } finally {
    limitsModal.saving = false;
  }
};

const handleTopUp = async () => {
  if (!parentStore.wallet?.walletId) return;
  topUpModal.saving = true;
  try {
    // TopUp logic typically requires walletId
    await parentStore.requestTopUp(topUpModal.form.amount, topUpModal.form.proofOfPayment);
    alert('Top up request submitted successfully! Pending admin approval.');
    topUpModal.open = false;
    topUpModal.form.amount = 50000;
    topUpModal.form.proofOfPayment = '';
    // Optionally reload wallet if it updates pending state
    loadWallet();
  } catch (err: any) {
    alert(err.message || 'Failed to request top up');
  } finally {
    topUpModal.saving = false;
  }
};
</script>
