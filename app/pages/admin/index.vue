<template>
  <div class="flex flex-col gap-8">
    <!-- Header/Welcome Area -->
    <div
      class="page-enter flex justify-between items-end"
      style="animation-delay: 0.05s"
    >
      <div>
        <h1
          class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 drop-shadow-md"
        >
          {{ $t("admin.dashboard") }}
        </h1>
        <p class="text-slate-400 mt-2 text-sm">
          {{ $t("admin.welcome_message") }}
        </p>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      <StatCard
        class="page-enter hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300"
        style="animation-delay: 0.1s"
        :title="$t('admin.total_students')"
        :value="adminStore.statsLoading ? '...' : (adminStore.stats?.totalStudents ?? '—')"
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
        :value="adminStore.statsLoading ? '...' : (adminStore.stats?.presentToday ?? '—')"
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
        :value="adminStore.statsLoading ? '...' : (adminStore.stats?.absentToday ?? '—')"
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
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div
        class="glass-panel p-4 flex flex-col gap-2 page-enter"
        style="animation-delay: 0.45s"
      >
        <h3 class="text-xs font-semibold text-slate-300">
          {{ $t("admin.attendance_trend") }}
        </h3>
        <TrendBarChart
          :categories="attendanceTrendCategories"
          :series="attendanceTrendSeries"
          :height="110"
        />
      </div>
      <div
        class="glass-panel p-4 flex flex-col gap-2 page-enter"
        style="animation-delay: 0.48s"
      >
        <h3 class="text-xs font-semibold text-slate-300">
          {{ $t("admin.wallet_trend") }}
        </h3>
        <TrendBarChart
          :categories="walletTrendCategories"
          :series="walletTrendSeries"
          value-prefix="₭ "
          :height="110"
        />
      </div>
    </div>

    <!-- Live Feed & Quick Links -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Live Feed -->
      <div
        class="lg:col-span-1 h-[560px] page-enter"
        style="animation-delay: 0.5s"
      >
        <LiveFeed
          class="h-full rounded-2xl shadow-lg border border-slate-700/30 overflow-hidden"
        />
      </div>

      <!-- Quick Links Panel -->
      <div
        class="lg:col-span-2 glass-panel-hover p-8 flex flex-col gap-6 page-enter relative overflow-hidden"
        style="animation-delay: 0.6s"
      >
        <!-- Decorative bg effect -->
        <div
          class="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"
        />
        <div
          class="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"
        />

        <h3
          class="text-xl font-bold text-white relative z-10 flex items-center gap-2"
        >
          <span class="w-1.5 h-6 bg-teal-500 rounded-full" />
          {{ $t("admin.quick_links") }}
        </h3>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-5 flex-1 relative z-10">
          <NuxtLink
            v-for="link in quickLinks"
            :key="link.to"
            :to="link.to"
            :class="[
              'flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 transition-all duration-300 group cursor-pointer hover:-translate-y-1',
              link.border,
            ]"
          >
            <div
              :class="[
                'w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-inner',
                link.iconBg,
                link.iconColor,
              ]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="link.icon"
                />
              </svg>
            </div>
            <span
              :class="[
                'text-sm font-semibold text-slate-200 transition-colors text-center',
                link.textHover,
              ]"
              >{{ $t(link.labelKey) }}</span
            >
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Pending Top-Ups & Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Pending Top-Ups -->
      <div
        class="glass-panel p-6 flex flex-col gap-4 page-enter"
        style="animation-delay: 0.7s"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-white flex items-center gap-2">
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
                {{ req.student && req.student.fullNameEn || "—" }}
              </p>
              <p class="text-xs text-slate-500 capitalize">
                {{ (req.method || "").replace("_", " ") }}
              </p>
            </div>
            <span class="text-sm font-semibold text-amber-400 whitespace-nowrap"
              >₭ {{ Number(req.amount).toLocaleString() }}</span
            >
          </div>
        </div>
      </div>

      <!-- Recent Activity (audit log) -->
      <div
        class="glass-panel p-6 flex flex-col gap-4 page-enter"
        style="animation-delay: 0.8s"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-white flex items-center gap-2">
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
              <span class="font-medium">{{ log.user && log.user.fullNameEn }}</span>
              <span class="text-slate-500">
                — {{ log.action.replace("_", " ") }} {{ log.entityType }}</span
              >
            </p>
            <p class="text-xs text-slate-500 mt-0.5">
              {{ new Date(log.createdAt).toLocaleString() }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TopUpRequest } from '../../domain/models/Finance';
import type { AuditLog } from '../../domain/models/School';
import { ref, onMounted, computed } from "vue";
import { useAdminStore } from "../../application/stores/admin";
import { financeRepository } from "../../infrastructure/api/FinanceRepository";
import { adminRepository } from "../../infrastructure/api/AdminRepository";
import StatCard from "../../components/StatCard.vue";
import LiveFeed from "../../components/LiveFeed.vue";
import TrendBarChart from "../../components/TrendBarChart.vue";

definePageMeta({ layout: "admin" });

const adminStore = useAdminStore();

const transactionsTodayValue = computed(() =>
  adminStore.statsLoading
    ? "..."
    : `₭ ${Number(adminStore.stats?.transactionsToday?.totalAmount ?? 0).toLocaleString()}`,
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
  return new Date(dateStr).toLocaleDateString(undefined, { weekday: "short" });
}

const attendanceTrend = computed<AttendanceTrendDay[]>(
  () => adminStore.stats?.attendanceTrend ?? [],
);
const attendanceTrendCategories = computed(() =>
  attendanceTrend.value.map((d) => shortDayLabel(d.date)),
);
const attendanceTrendSeries = computed(() => [
  {
    label: "Present",
    color: COLOR_PRESENT,
    data: attendanceTrend.value.map((d) => d.present),
  },
  {
    label: "Absent",
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
    label: "Total",
    color: COLOR_WALLET,
    data: walletTrend.value.map((d) => d.totalAmount),
  },
]);

useHead({ title: "Dashboard — Smart School Admin" });

const quickLinks = [
  {
    to: "/admin/students",
    labelKey: "admin.manage_students",
    iconBg: "bg-gradient-to-br from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-400",
    border: "hover:border-blue-500/50 hover:bg-blue-500/10",
    textHover: "group-hover:text-blue-400",
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  },
  {
    to: "/admin/teachers",
    labelKey: "admin.manage_teachers",
    iconBg: "bg-gradient-to-br from-emerald-500/20 to-green-500/20",
    iconColor: "text-emerald-400",
    border: "hover:border-emerald-500/50 hover:bg-emerald-500/10",
    textHover: "group-hover:text-emerald-400",
    icon: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
  },
  {
    to: "/admin/parents",
    labelKey: "admin.manage_parents",
    iconBg: "bg-gradient-to-br from-rose-500/20 to-pink-500/20",
    iconColor: "text-rose-400",
    border: "hover:border-rose-500/50 hover:bg-rose-500/10",
    textHover: "group-hover:text-rose-400",
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  },
  {
    to: "/admin/classes",
    labelKey: "admin.manage_classes",
    iconBg: "bg-gradient-to-br from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-400",
    border: "hover:border-purple-500/50 hover:bg-purple-500/10",
    textHover: "group-hover:text-purple-400",
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  },
  {
    to: "/admin/attendance",
    labelKey: "admin.manage_attendance",
    iconBg: "bg-gradient-to-br from-cyan-500/20 to-sky-500/20",
    iconColor: "text-cyan-400",
    border: "hover:border-cyan-500/50 hover:bg-cyan-500/10",
    textHover: "group-hover:text-cyan-400",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  },
  {
    to: "/admin/finance",
    labelKey: "admin.manage_wallet",
    iconBg: "bg-gradient-to-br from-amber-500/20 to-yellow-500/20",
    iconColor: "text-amber-400",
    border: "hover:border-amber-500/50 hover:bg-amber-500/10",
    textHover: "group-hover:text-amber-400",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  },
  {
    to: "/admin/users",
    labelKey: "admin.manage_users",
    iconBg: "bg-gradient-to-br from-teal-500/20 to-emerald-500/20",
    iconColor: "text-teal-400",
    border: "hover:border-teal-500/50 hover:bg-teal-500/10",
    textHover: "group-hover:text-teal-400",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    to: "/admin/audit-logs",
    labelKey: "admin.manage_audit_logs",
    iconBg: "bg-gradient-to-br from-indigo-500/20 to-blue-500/20",
    iconColor: "text-indigo-400",
    border: "hover:border-indigo-500/50 hover:bg-indigo-500/10",
    textHover: "group-hover:text-indigo-400",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    to: "/admin/reports",
    labelKey: "admin.manage_reports",
    iconBg: "bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20",
    iconColor: "text-fuchsia-400",
    border: "hover:border-fuchsia-500/50 hover:bg-fuchsia-500/10",
    textHover: "group-hover:text-fuchsia-400",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
];

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
