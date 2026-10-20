<template>
  <div class="flex flex-col gap-2 md:gap-3">
    <!-- Header/Welcome Area -->
    <div
      class="page-enter flex justify-between items-end px-2 sm:px-0"
      style="animation-delay: 0.05s"
    >
      <div>
        <h1
          class="text-xl sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 drop-shadow-md"
        >
          {{ $t("admin.dashboard") }}
        </h1>
        <p class="text-slate-400 mt-0.5 sm:mt-1 text-xs sm:text-sm">
          {{ $t("admin.welcome_message") }}
        </p>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2 md:gap-3">
      <StatCard
        class="page-enter hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300"
        style="animation-delay: 0.1s"
        :title="$t('admin.total_students')"
        :value="
          adminStore.statsLoading
            ? '...'
            : (adminStore.stats?.totalStudents ?? '—')
        "
        color-class="bg-gradient-to-br from-blue-500 to-indigo-600"
      >
        <template #icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </template>
      </StatCard>

      <StatCard
        class="page-enter hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300"
        style="animation-delay: 0.2s"
        :title="$t('admin.present_today')"
        :value="
          adminStore.statsLoading
            ? '...'
            : (adminStore.stats?.presentToday ?? '—')
        "
        color-class="bg-gradient-to-br from-teal-400 to-emerald-600"
      >
        <template #icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </template>
      </StatCard>

      <StatCard
        class="page-enter hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300"
        style="animation-delay: 0.3s"
        :title="$t('admin.absent_today')"
        :value="
          adminStore.statsLoading
            ? '...'
            : (adminStore.stats?.absentToday ?? '—')
        "
        color-class="bg-gradient-to-br from-orange-400 to-red-500"
      >
        <template #icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </template>
      </StatCard>

      <StatCard
        class="page-enter hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300"
        style="animation-delay: 0.4s"
        :title="$t('admin.transactions_today')"
        :value="transactionsTodayValue"
        color-class="bg-gradient-to-br from-purple-500 to-pink-600"
      >
        <template #icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </template>
      </StatCard>
    </div>

    <!-- 7-day trend charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-2 md:gap-3">
      <div
        class="glass-panel p-2 sm:p-3 flex flex-col gap-1.5 page-enter"
        style="animation-delay: 0.45s"
      >
        <h3 class="text-xs sm:text-sm font-semibold text-slate-300">
          {{ $t("admin.attendance_trend") }}
        </h3>
        <TrendBarChart
          :categories="attendanceTrendCategories"
          :series="attendanceTrendSeries"
          :height="180"
        />
      </div>
      <div
        class="glass-panel p-2 sm:p-3 flex flex-col gap-2 page-enter"
        style="animation-delay: 0.48s"
      >
        <h3 class="text-xs sm:text-sm font-semibold text-slate-300">
          {{ $t("admin.wallet_trend") }}
        </h3>
        <TrendBarChart
          :categories="walletTrendCategories"
          :series="walletTrendSeries"
          value-prefix="₭ "
          :height="180"
        />
      </div>
    </div>

    <!-- Live Feed -->
    <div
      class="lg:col-span-1 h-[250px] sm:h-[300px] page-enter"
      style="animation-delay: 0.5s"
    >
      <LiveFeed
        class="h-full rounded-2xl shadow-lg border border-slate-700/30 overflow-hidden"
      />
    </div>

    <!-- Finance Overview Cards -->
    <FinanceOverviewCards />

    <!-- Top Performers, Announcements & Upcoming Events (Term 2) -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2 md:gap-3">
      <!-- Top Performers -->
      <TopPerformers />

      <!-- Announcements -->
      <AnnouncementsSection />

      <!-- Upcoming Events (Term 2 Only) -->
      <UpcomingEvents />
    </div>

    <!-- Pending Top-Ups & Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-2 md:gap-3">
      <!-- Pending Top-Ups -->
      <div
        class="glass-panel p-3 flex flex-col gap-2 page-enter"
        style="animation-delay: 0.78s"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-white flex items-center gap-2">
            <span class="w-1.5 h-5 bg-amber-500 rounded-full" />
            {{ $t("admin.pending_topups") }}
          </h3>
          <NuxtLink
            to="/admin/finance/top-ups"
            class="text-xs text-teal-400 hover:text-teal-300 transition-colors"
            >{{ $t("admin.view_all") }} →</NuxtLink
          >
        </div>

        <LoadingSpinner v-if="pendingTopUpsLoading" size="sm" padding="py-8" />
        <div
          v-else-if="pendingTopUps.length === 0"
          class="text-center text-slate-500 py-8 text-sm"
        >
          {{ $t("admin.no_pending_topups") }}
        </div>
        <div v-else class="flex flex-col gap-3">
          <div
            v-for="req in pendingTopUps"
            :key="req.requestId"
            class="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/40"
          >
            <div class="min-w-0">
              <p class="text-sm font-medium text-white truncate">
                {{ req.student ? (locale === 'lo' ? req.student.fullNameLo : req.student.fullNameEn) : "—" }}
              </p>
              <p class="text-xs text-slate-500 capitalize">
                {{ (locale === 'lo' ? req.methodLabelLo : req.methodLabelEn) || $t(`topups.method.${req.method}`) }}
              </p>
            </div>
            <span class="text-sm font-semibold text-amber-400 whitespace-nowrap"
              >{{ f.kip(req.amount) }}</span
            >
          </div>
        </div>
      </div>

      <!-- Recent Activity (audit log) -->
      <div
        class="glass-panel p-3 flex flex-col gap-2 page-enter"
        style="animation-delay: 0.82s"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-white flex items-center gap-2">
            <span class="w-1.5 h-5 bg-indigo-500 rounded-full" />
            {{ $t("admin.recent_activity") }}
          </h3>
          <NuxtLink
            to="/admin/audit-logs"
            class="text-xs text-teal-400 hover:text-teal-300 transition-colors"
            >{{ $t("admin.view_all") }} →</NuxtLink
          >
        </div>

        <LoadingSpinner v-if="recentActivityLoading" size="sm" padding="py-8" />
        <div
          v-else-if="recentActivity.length === 0"
          class="text-center text-slate-500 py-8 text-sm"
        >
          {{ $t("admin.no_recent_activity") }}
        </div>
        <div v-else class="flex flex-col gap-3">
          <div
            v-for="log in recentActivity"
            :key="log.auditId"
            class="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40"
          >
            <p class="text-sm text-slate-200">
              <span class="font-medium">{{
                log.user && (locale === 'lo' ? log.user.fullNameLo : log.user.fullNameEn)
              }}</span>
              <span class="text-slate-500">
                — {{ te(`audit_admin.actions.${log.action}`) ? $t(`audit_admin.actions.${log.action}`) : log.action }} · {{ te(`audit_admin.entities.${log.entityType}`) ? $t(`audit_admin.entities.${log.entityType}`) : log.entityType }}</span
              >
            </p>
            <p class="text-xs text-slate-500 mt-0.5">
              {{ f.dateTime(log.createdAt) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TopUpRequest } from "../../domain/models/Finance";
import type { AuditLog } from "../../domain/models/School";
import { ref, onMounted, computed } from "vue";
import { useAdminStore } from "../../application/stores/admin";
import { financeRepository } from "../../infrastructure/api/FinanceRepository";
import { adminRepository } from "../../infrastructure/api/AdminRepository";
import StatCard from "../../components/StatCard.vue";
import { useFormat } from "../../composables/useFormat";
import LiveFeed from "../../components/LiveFeed.vue";
import TrendBarChart from "../../components/TrendBarChart.vue";
import FinanceOverviewCards from "../../components/dashboard/FinanceOverviewCards.vue";
import TopPerformers from "../../components/dashboard/TopPerformers.vue";
import AnnouncementsSection from "../../components/dashboard/AnnouncementsSection.vue";
import UpcomingEvents from "../../components/dashboard/UpcomingEvents.vue";

definePageMeta({ layout: "admin" });

const { t, te, locale } = useI18n();
const f = useFormat();

const adminStore = useAdminStore();

const transactionsTodayValue = computed(() =>
  adminStore.statsLoading
    ? "..."
    : f.kip(adminStore.stats?.transactionsToday?.totalAmount ?? 0),
);

// Colors validated against this app's dark glass-panel surface (~#0f172a)
// with the dataviz skill's palette validator — categorical pair (aqua/orange)
// passes CVD + contrast checks together; the lone amber passes on its own.
const COLOR_PRESENT = "#199e70";
const COLOR_ABSENT = "#d95926";
const COLOR_WALLET = "#c98500";

interface AttendanceTrendDay {
  date: string;
  present: number;
  absent: number;
}

interface WalletTrendDay {
  date: string;
  totalAmount: number;
}

function shortDayLabel(dateStr: string) {
  return f.weekdayShort(dateStr);
}

const attendanceTrend = computed<AttendanceTrendDay[]>(
  () => adminStore.stats?.attendanceTrend ?? [],
);
const attendanceTrendCategories = computed(() =>
  attendanceTrend.value.map((d) => shortDayLabel(d.date)),
);
const attendanceTrendSeries = computed(() => [
  {
    label: t('chart.present'),
    color: COLOR_PRESENT,
    data: attendanceTrend.value.map((d) => d.present),
  },
  {
    label: t('chart.absent'),
    color: COLOR_ABSENT,
    data: attendanceTrend.value.map((d) => d.absent),
  },
]);

const walletTrend = computed<WalletTrendDay[]>(
  () => adminStore.stats?.walletTrend ?? [],
);
const walletTrendCategories = computed(() =>
  walletTrend.value.map((d) => shortDayLabel(d.date)),
);
const walletTrendSeries = computed(() => [
  {
    label: t('chart.total'),
    color: COLOR_WALLET,
    data: walletTrend.value.map((d) => d.totalAmount),
  },
]);

useHead({ title: () => t('page_titles.dashboard') });

const pendingTopUps = ref<TopUpRequest[]>([]);
const pendingTopUpsLoading = ref(false);
const recentActivity = ref<AuditLog[]>([]);
const recentActivityLoading = ref(false);

async function fetchPendingTopUps() {
  pendingTopUpsLoading.value = true;
  try {
    const res = await financeRepository.getTopUpRequests({
      status: "pending",
      limit: 5,
    });
    pendingTopUps.value = res.requests || [];
  } catch (err) {
    console.error("Failed to fetch pending top-ups:", err);
  } finally {
    pendingTopUpsLoading.value = false;
  }
}

async function fetchRecentActivity() {
  recentActivityLoading.value = true;
  try {
    const res = await adminRepository.getAuditLogs({ limit: 5 });
    recentActivity.value = res.logs || [];
  } catch (err) {
    console.error("Failed to fetch recent activity:", err);
  } finally {
    recentActivityLoading.value = false;
  }
}

onMounted(() => {
  adminStore.fetchStats();
  fetchPendingTopUps();
  fetchRecentActivity();
});
</script>
