<template>
  <div class="flex flex-col gap-2 md:gap-3">
    <!-- The topbar already shows the page name; keep a heading for screen readers only -->
    <h1 class="sr-only">{{ $t("admin.dashboard") }}</h1>

    <!-- Work waiting on the admin; each tile links to the page that resolves it -->
    <NeedsAttention
      class="page-enter"
      style="animation-delay: 0.08s"
      :items="adminStore.stats?.needsAttention ?? []"
      :loading="adminStore.statsLoading && !adminStore.stats"
    />

    <!-- Stats Row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
      <StatCard
        class="page-enter"
        style="animation-delay: 0.1s"
        :title="$t('admin.total_students')"
        :value="statValue(adminStore.stats?.totalStudents)"
        color-class="bg-primary"
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </template>
      </StatCard>

      <StatCard
        class="page-enter"
        style="animation-delay: 0.15s"
        :title="$t('admin.present_today')"
        :value="statValue(adminStore.stats?.presentToday)"
        :hint="attendanceHint(adminStore.stats?.presentToday)"
        color-class="bg-success"
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </template>
      </StatCard>

      <StatCard
        class="page-enter"
        style="animation-delay: 0.2s"
        :title="$t('admin.absent_today')"
        :value="statValue(adminStore.stats?.absentToday)"
        :hint="attendanceHint(adminStore.stats?.absentToday)"
        color-class="bg-danger"
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </template>
      </StatCard>

      <StatCard
        class="page-enter"
        style="animation-delay: 0.25s"
        :title="$t('admin.transactions_today')"
        :value="transactionsTodayValue"
        color-class="bg-warning"
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </template>
      </StatCard>
    </div>

    <!-- 7-day trend charts; an all-zero week reads as a message, not a flat line -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3">
      <div class="glass-panel p-2 sm:p-3 flex flex-col gap-1.5 page-enter" style="animation-delay: 0.3s">
        <h3 class="text-xs sm:text-sm font-semibold text-slate-300">
          {{ $t("admin.attendance_trend") }}
        </h3>
        <TrendBarChart
          v-if="hasAttendanceTrend"
          :categories="attendanceTrendCategories"
          :tooltip-titles="attendanceTrendTitles"
          :series="attendanceTrendSeries"
          :end-label="attendanceEndLabel"
          :height="200"
        />
        <p v-else class="h-[200px] flex items-center justify-center text-sm text-ink-muted text-center px-4">
          {{ adminStore.statsLoading ? '…' : $t("admin.no_attendance_data") }}
        </p>
      </div>
      <div class="glass-panel p-2 sm:p-3 flex flex-col gap-1.5 page-enter" style="animation-delay: 0.33s">
        <h3 class="text-xs sm:text-sm font-semibold text-slate-300">
          {{ $t("admin.wallet_trend") }}
        </h3>
        <TrendBarChart
          v-if="hasWalletTrend"
          :categories="walletTrendCategories"
          :tooltip-titles="walletTrendTitles"
          :series="walletTrendSeries"
          value-prefix="₭ "
          :height="200"
        />
        <p v-else class="h-[200px] flex items-center justify-center text-sm text-ink-muted text-center px-4">
          {{ adminStore.statsLoading ? '…' : $t("admin.no_wallet_activity") }}
        </p>
      </div>
    </div>

    <!-- Finance Overview Cards -->
    <FinanceOverviewCards />

    <!-- Live gate scans, pending top-ups & recent changes (latest 5 each).
         The two lists keep their natural height; the live feed takes no height of its
         own (absolute on md+) and fills whatever the row is, scrolling inside. -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
      <div class="relative h-[200px] md:h-auto page-enter" style="animation-delay: 0.4s">
        <LiveFeed class="h-full md:absolute md:inset-0" />
      </div>

      <!-- Pending Top-Ups -->
      <div class="glass-panel p-3 flex flex-col gap-2 self-start page-enter" style="animation-delay: 0.44s">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-white flex items-center gap-2">
            <span class="w-1.5 h-5 bg-amber-500 rounded-full" />
            {{ $t("admin.pending_topups") }}
          </h3>
          <NuxtLink to="/admin/finance/top-ups" class="text-xs text-teal-400 hover:text-teal-300 transition-colors">
            {{ $t("admin.view_all") }} →
          </NuxtLink>
        </div>

        <LoadingSpinner v-if="pendingTopUpsLoading" size="sm" padding="py-8" />
        <EmptyState v-else-if="pendingTopUps.length === 0" :title="$t('admin.no_pending_topups')" size="sm" />
        <div v-else class="flex flex-col gap-2 overflow-y-auto min-h-0">
          <!-- One line per request: name | method | amount -->
          <div
            v-for="req in pendingTopUps"
            :key="req.requestId"
            class="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/40 border border-slate-700/40"
          >
            <p class="text-sm font-medium text-white truncate">
              {{ req.student ? (locale === 'lo' ? req.student.fullNameLo : req.student.fullNameEn) : "—" }}
            </p>
            <span class="text-[11px] text-ink-muted bg-surface-2 border border-line rounded px-1.5 py-0.5 whitespace-nowrap">
              {{ $t(`topups.method.${req.method}`) }}
            </span>
            <span class="text-right text-sm font-semibold text-amber-400 whitespace-nowrap tnum">{{ f.kip(req.amount) }}</span>
          </div>
        </div>
      </div>

      <!-- Recent Activity (audit log, sign-ins excluded) -->
      <div class="glass-panel p-3 flex flex-col gap-2 self-start md:col-span-2 lg:col-span-1 page-enter" style="animation-delay: 0.48s">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-white flex items-center gap-2">
            <span class="w-1.5 h-5 bg-indigo-500 rounded-full" />
            {{ $t("admin.recent_activity") }}
          </h3>
          <NuxtLink to="/admin/audit-logs" class="text-xs text-teal-400 hover:text-teal-300 transition-colors">
            {{ $t("admin.view_all") }} →
          </NuxtLink>
        </div>

        <LoadingSpinner v-if="recentActivityLoading" size="sm" padding="py-8" />
        <EmptyState v-else-if="recentActivity.length === 0" :title="$t('admin.no_recent_activity')" size="sm" />
        <div v-else class="flex flex-col gap-2 overflow-y-auto min-h-0">
          <!-- One line per entry: who · what | when -->
          <div
            v-for="log in recentActivity"
            :key="log.auditId"
            class="flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg bg-slate-800/40 border border-slate-700/40"
          >
            <p class="min-w-0 text-sm text-slate-200 line-clamp-2">
              <span v-if="log.user" class="font-medium">{{ locale === 'lo' ? log.user.fullNameLo : log.user.fullNameEn }} · </span>
              <span class="text-slate-500">{{ te(`audit_admin.actions.${log.action}`) ? $t(`audit_admin.actions.${log.action}`) : log.action }} · {{ te(`audit_admin.entities.${log.entityType}`) ? $t(`audit_admin.entities.${log.entityType}`) : log.entityType }}</span>
            </p>
            <time :datetime="String(log.createdAt)" class="shrink-0 text-xs text-slate-500 tnum whitespace-nowrap">{{ f.dateTimeShort(log.createdAt) }}</time>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Performers (2/3, scrolls sideways through classes) | Announcements (1/3), same height -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-3">
      <TopPerformers class="lg:col-span-2" />
      <AnnouncementsSection />
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
import NeedsAttention from "../../components/dashboard/NeedsAttention.vue";

definePageMeta({ layout: "admin" });

const { t, te, locale } = useI18n();
const f = useFormat();

const adminStore = useAdminStore();

const statValue = (n: number | undefined) =>
  adminStore.statsLoading && !adminStore.stats ? "…" : (n ?? "—");

// "92% of students" under the attendance cards; on a weekend there's nothing to rate.
const attendanceHint = (n: number | undefined) => {
  const s = adminStore.stats;
  if (!s || n === undefined) return "";
  if (s.isSchoolDay === false) return t("admin.not_school_day");
  if (!s.totalStudents) return "";
  return t("admin.attendance_rate", { rate: Math.round((n / s.totalStudents) * 100) });
};

const transactionsTodayValue = computed(() =>
  adminStore.statsLoading && !adminStore.stats
    ? "…"
    : f.kip(adminStore.stats?.transactionsToday?.totalAmount ?? 0),
);

// Chart colors are the --viz-* tokens in TrendBarChart, validated per theme.
interface AttendanceTrendDay {
  date: string;
  present: number;
  excused?: number;
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
const attendanceTrendTitles = computed(() => attendanceTrend.value.map((d) => f.date(d.date)));
// Stacked bottom-up: present, excused, not present — each column is the whole roster.
const attendanceTrendSeries = computed(() => [
  { label: t("chart.present"), color: "var(--viz-present)", data: attendanceTrend.value.map((d) => d.present) },
  { label: t("chart.excused"), color: "var(--viz-excused)", data: attendanceTrend.value.map((d) => d.excused ?? 0) },
  { label: t("chart.absent"), color: "var(--viz-absent)", data: attendanceTrend.value.map((d) => d.absent) },
]);
// The one direct label: the latest day's attendance rate, above its column.
const attendanceEndLabel = computed(() => {
  const last = attendanceTrend.value[attendanceTrend.value.length - 1];
  const roster = last ? last.present + (last.excused ?? 0) + last.absent : 0;
  return last && roster ? `${Math.round((last.present / roster) * 100)}%` : "";
});

const hasAttendanceTrend = computed(() => attendanceTrend.value.some((d) => d.present > 0));

const walletTrend = computed<WalletTrendDay[]>(
  () => adminStore.stats?.walletTrend ?? [],
);
const walletTrendCategories = computed(() =>
  walletTrend.value.map((d) => shortDayLabel(d.date)),
);
const walletTrendTitles = computed(() => walletTrend.value.map((d) => f.date(d.date)));
const walletTrendSeries = computed(() => [
  { label: t("chart.total"), color: "var(--viz-money)", data: walletTrend.value.map((d) => d.totalAmount) },
]);

const hasWalletTrend = computed(() => walletTrend.value.some((d) => d.totalAmount > 0));

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
    const res = await adminRepository.getAuditLogs({ limit: 5, excludeAuth: true });
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
