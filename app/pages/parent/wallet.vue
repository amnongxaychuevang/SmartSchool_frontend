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
            {{ ($i18n.locale === 'lo' ? child.fullNameLo : child.fullNameEn) || child.fullNameEn }}
          </option>
        </select>
      </div>
      <button :disabled="!selectedChildId" class="px-4 py-2.5 bg-pink-500 hover:bg-pink-400 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" @click="topUpModal.open = true">
        {{ $t('parentPortal.top_up') }}
      </button>
    </div>

    <LoadingSpinner v-if="parentStore.loadingWallet" color="pink" />
    
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
        <h2 class="text-3xl font-bold text-white">{{ fmt.kip(walletBalance) }}</h2>
        <div v-if="currentDailyMax" class="text-sm text-slate-400 mt-1">
          {{ $t('parentPortal.daily_max') }}: {{ fmt.kip(currentDailyMax) }}
        </div>
      </div>

      <div class="glass-panel overflow-x-auto">
        <div class="p-4 border-b border-slate-800 bg-slate-900/50">
          <h2 class="text-lg font-semibold text-white">{{ $t('parentPortal.recent_transactions') }}</h2>
        </div>
        <div v-if="!parentStore.wallet.transactions || parentStore.wallet.transactions.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-500">
          <p>{{ $t('parentPortal.no_transactions') }}</p>
        </div>
        <table v-else class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th>{{ $t('parentPortal.date') }}</th>
              <th>{{ $t('parentPortal.type') }}</th>
              <th>{{ $t('parentPortal.amount') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            <tr v-for="tx in parentStore.wallet.transactions" :key="tx.transactionId" class="hover:bg-slate-800/40 transition-colors">
              <td class="text-sm text-white">{{ fmt.dateTime(tx.createdAt) }}</td>
              <td class="text-sm text-slate-400 capitalize">{{ tx.transactionType }}</td>
              <td class="text-sm font-bold" :class="tx.transactionType === 'top_up' ? 'text-teal-400' : 'text-pink-400'">
                {{ tx.transactionType === 'top_up' ? '+' : '−' }}{{ fmt.kip(tx.amount) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    
    <div v-else class="glass-panel p-12 text-center text-slate-500 rounded-2xl">
      {{ $t('parentPortal.please_select_child') }}
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
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('parentPortal.top_up_method') }}</label>
                <select v-model="topUpModal.form.method" required class="input-field focus:border-pink-500">
                  <option value="mobile_banking">{{ $t('parentPortal.method_mobile_banking') }}</option>
                  <option value="cash">{{ $t('parentPortal.method_cash') }}</option>
                </select>
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('parentPortal.amount') }}</label>
                <input v-model.number="topUpModal.form.amount" type="number" required min="1000" step="1000" class="input-field focus:border-pink-500" :placeholder="$t('wallet_ui.ph_amount')" >
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('parentPortal.upload_slip') }}</label>
                <input ref="slipFileInput" type="file" accept="image/jpeg,image/png,image/webp" class="input-field focus:border-pink-500 file:mr-3 file:rounded file:border-0 file:bg-pink-500/20 file:px-3 file:py-1 file:text-sm file:text-pink-300" @change="onSlipFileChange">
                <img v-if="topUpModal.slipPreview" :src="topUpModal.slipPreview" alt="slip preview" class="mt-2 max-h-40 rounded-lg border border-slate-700 object-contain">
              </div>

              <p v-if="topUpModal.error" role="alert" class="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{{ topUpModal.error }}</p>

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
                <input v-model.number="limitsModal.form.dailyMax" type="number" min="0" step="1000" class="input-field focus:border-pink-500" :placeholder="$t('wallet_ui.ph_daily')">
                <span class="text-xs text-slate-500">{{ $t('parentPortal.no_limit') }}: {{ limitsModal.form.dailyMax ? '' : '✓' }}</span>
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('parentPortal.weekly_max') }}</label>
                <input v-model.number="limitsModal.form.weeklyMax" type="number" min="0" step="1000" class="input-field focus:border-pink-500" :placeholder="$t('wallet_ui.ph_weekly')">
                <span class="text-xs text-slate-500">{{ $t('parentPortal.no_limit') }}: {{ limitsModal.form.weeklyMax ? '' : '✓' }}</span>
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('parentPortal.per_transaction_max') }}</label>
                <input v-model.number="limitsModal.form.perTransactionMax" type="number" min="0" step="1000" class="input-field focus:border-pink-500" :placeholder="$t('wallet_ui.ph_per_tx')">
                <span class="text-xs text-slate-500">{{ $t('parentPortal.no_limit') }}: {{ limitsModal.form.perTransactionMax ? '' : '✓' }}</span>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { useParentStore } from '../../application/stores/parent';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const fmt = useFormat();

definePageMeta({ layout: 'parent' });
useHead({ title: computed(() => `${t('parentPortal.childs_wallet')} — ${t('parentPortal.title')}`) });

const parentStore = useParentStore();
const selectedChildId = ref<number | ''>('');

const slipFileInput = ref<HTMLInputElement | null>(null);
const slipFile = ref<File | null>(null);
const walletBalance = computed(() => parentStore.wallet ? Number(parentStore.wallet.balance) : 0);
const currentDailyMax = computed(() => parentStore.spendingLimits?.dailyMax ? Number(parentStore.spendingLimits.dailyMax) : 0);

const topUpModal = reactive({
  open: false,
  saving: false,
  error: '',
  slipPreview: '' as string,
  form: {
    amount: 50000,
    method: 'mobile_banking' as string,
  }
});

const limitsModal = reactive({
  open: false,
  saving: false,
  form: {
    dailyMax: null as number | null,
    weeklyMax: null as number | null,
    perTransactionMax: null as number | null,
  }
});

onMounted(async () => {
  await parentStore.fetchChildren();
  if (parentStore.children.length > 0) {
    selectedChildId.value = parentStore.children[0]!.studentId;
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

const onSlipFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;
  slipFile.value = file;
  if (file) {
    topUpModal.slipPreview = URL.createObjectURL(file);
  } else {
    topUpModal.slipPreview = '';
  }
};

const openLimitsModal = () => {
  const sl = parentStore.spendingLimits;
  limitsModal.form.dailyMax = sl?.dailyMax ? Number(sl.dailyMax) : null;
  limitsModal.form.weeklyMax = sl?.weeklyMax ? Number(sl.weeklyMax) : null;
  limitsModal.form.perTransactionMax = sl?.perTransactionMax ? Number(sl.perTransactionMax) : null;
  limitsModal.open = true;
};

const handleSaveLimits = async () => {
  if (!selectedChildId.value) return;
  limitsModal.saving = true;
  try {
    await parentStore.updateSpendingLimits(Number(selectedChildId.value), {
      dailyMax: limitsModal.form.dailyMax || null,
      weeklyMax: limitsModal.form.weeklyMax || null,
      perTransactionMax: limitsModal.form.perTransactionMax || null,
      alertThreshold: null
    });
    limitsModal.open = false;
    alert(t('parentPortal.limits_updated'));
    await parentStore.fetchSpendingLimits(Number(selectedChildId.value));
  } catch (err) {
    alert(getErrorMessage(err, 'Failed to update limits'));
  } finally {
    limitsModal.saving = false;
  }
};

const handleTopUp = async () => {
  if (!selectedChildId.value) return;
  topUpModal.saving = true;
  topUpModal.error = '';
  try {
    let slipUrl: string | undefined;
    if (slipFile.value) {
      const uploadRes = await parentStore.uploadSlip(slipFile.value);
      slipUrl = uploadRes.data.url;
    }
    await parentStore.requestTopUp({
      studentId: Number(selectedChildId.value),
      amount: topUpModal.form.amount,
      method: topUpModal.form.method,
      slipUrl,
    });
    topUpModal.open = false;
    topUpModal.form.amount = 50000;
    topUpModal.form.method = 'mobile_banking';
    topUpModal.slipPreview = '';
    slipFile.value = null;
    if (slipFileInput.value) slipFileInput.value.value = '';
    loadWallet();
  } catch (err) {
    topUpModal.error = getErrorMessage(err, 'Failed to request top up');
  } finally {
    topUpModal.saving = false;
  }
};
</script>
