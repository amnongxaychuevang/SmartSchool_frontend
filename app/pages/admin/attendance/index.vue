<template>
  <div class="flex flex-col gap-6">
    <PageHeader
      :eyebrow="$t('nav.attendance')"
      :title="$t('attendance_simulator.title')"
      :subtitle="$t('attendance_simulator.subtitle')"
    />

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <!-- Tap form -->
      <form
        class="panel p-5 lg:col-span-2 flex flex-col gap-4"
        @submit.prevent="tap"
      >
        <div>
          <label for="card-search" class="block mb-1.5 text-sm font-semibold">{{
            $t("attendance_simulator.card")
          }}</label>
          <input
            id="card-search"
            v-model="search"
            type="search"
            class="input-field mb-2"
            :placeholder="$t('attendance_simulator.search_card')"
          >
          <select
            v-model="selectedCardId"
            class="input-field"
            required
            :disabled="!cards.length"
          >
            <option :value="null" disabled>
              {{
                cards.length
                  ? $t("attendance_simulator.choose_card")
                  : $t("attendance_simulator.no_cards")
              }}
            </option>
            <option
              v-for="c in filteredCards"
              :key="c.cardId"
              :value="c.cardId"
            >
              {{ studentName(c) }} · {{ c.student?.studentCode }} ·
              {{ c.cardUid }}
            </option>
          </select>
        </div>

        <div>
          <label for="gate" class="block mb-1.5 text-sm font-semibold">{{
            $t("attendance_simulator.gate_optional")
          }}</label>
          <input
            id="gate"
            v-model.trim="gate"
            type="text"
            maxlength="50"
            class="input-field"
            :placeholder="$t('attendance_simulator.gate_placeholder')"
          >
        </div>

        <p class="text-xs text-ink-subtle">
          {{ $t("attendance_simulator.auto_direction") }}
        </p>

        <button
          type="submit"
          class="btn-primary"
          :disabled="!selectedCard || scanning"
        >
          {{
            scanning
              ? $t("attendance_simulator.scanning")
              : $t("attendance_simulator.simulate_tap")
          }}
        </button>

        <p
          v-if="error"
          role="alert"
          class="rounded border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          {{ $t("attendance_simulator.scan_failed") }}: {{ error }}
        </p>
      </form>

      <!-- Taps recorded in this session -->
      <section class="panel lg:col-span-3 overflow-hidden">
        <h3 class="px-5 pt-5 pb-3 font-bold">
          {{ $t("attendance_simulator.history") }}
        </h3>
        <p v-if="!history.length" class="px-5 pb-8 text-sm text-ink-subtle">
          {{ $t("attendance_simulator.history_empty") }}
        </p>
        <ul v-else class="divide-y divide-line border-t border-line">
          <li
            v-for="h in history"
            :key="`${h.cardId}:${h.time}`"
            class="flex items-center justify-between gap-4 px-5 py-3"
          >
            <div class="min-w-0">
              <p class="font-semibold truncate">{{ h.name }}</p>
              <p class="text-xs text-ink-subtle font-mono">
                {{ h.code }} · {{ h.cardUid
                }}<template v-if="h.gate"> · {{ h.gate }}</template>
              </p>
            </div>
            <div class="text-right shrink-0">
              <span
                :class="
                  h.logType === 'check_in' ? 'badge-success' : 'badge-info'
                "
              >
                {{
                  h.logType === "check_in"
                    ? $t("attendance_simulator.check_in")
                    : $t("attendance_simulator.check_out")
                }}
              </span>
              <p class="mt-1 text-xs text-ink-subtle tnum">
                {{ f.timeWithSeconds(h.time) }}
              </p>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { ApiResponse } from "../../../infrastructure/api/types";
import type { ScanResult } from "../../../domain/models/School";
import type { Card } from "../../../domain/models/Academics";
import PageHeader from "../../../components/PageHeader.vue";
import { useFormat } from "../../../composables/useFormat";
import { getErrorMessage } from "../../../utils/errors";
import { useApiClient } from "../../../infrastructure/api/apiClient";
import { API_ENDPOINTS } from "../../../infrastructure/api/endpoints";
import { academicsRepository } from "../../../infrastructure/api/AcademicsRepository";

definePageMeta({ layout: "admin" });

const { t, locale } = useI18n();
const f = useFormat();
useHead({ title: () => t("attendance_simulator.title") });

// Only active cards can be tapped; lost or deactivated cards are refused by the server anyway.
const cards = ref<Card[]>([]);
const search = ref("");
const selectedCardId = ref<number | null>(null);
const gate = ref("");
const scanning = ref(false);
const error = ref("");

const studentName = (c: Card) =>
  (locale.value === "lo" ? c.student?.fullNameLo : c.student?.fullNameEn) ||
  c.student?.fullNameEn ||
  "";
const filteredCards = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return cards.value;
  return cards.value.filter((c) =>
    [
      c.cardUid,
      c.student?.studentCode,
      c.student?.fullNameEn,
      c.student?.fullNameLo,
    ].some((v) => v?.toLowerCase().includes(q)),
  );
});
const selectedCard = computed(
  () => cards.value.find((c) => c.cardId === selectedCardId.value) ?? null,
);

onMounted(async () => {
  try {
    const res = await academicsRepository.getCards({
      status: "active",
      limit: 500,
    });
    cards.value = res.cards;
  } catch (err) {
    error.value = getErrorMessage(err);
  }
});

const history = ref<
  {
    cardId: number;
    cardUid: string;
    name: string;
    code: string;
    gate: string;
    logType: ScanResult["logType"];
    time: string;
  }[]
>([]);

async function tap() {
  const card = selectedCard.value;
  if (!card) return;
  scanning.value = true;
  error.value = "";
  try {
    // The server looks the card up, decides check-in vs check-out and records it —
    // exactly what a gate reader does, authenticated as this admin instead of a device key.
    const res = await useApiClient()<ApiResponse<ScanResult>>(
      API_ENDPOINTS.attendance.scanManual,
      {
        method: "POST",
        body: {
          cardUid: card.cardUid,
          ...(gate.value ? { gateLocation: gate.value } : {}),
        },
      },
    );
    history.value.unshift({
      cardId: card.cardId,
      cardUid: card.cardUid,
      name: studentName(card),
      code: card.student?.studentCode ?? "",
      gate: gate.value,
      logType: res.data.logType,
      time: res.data.time,
    });
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    scanning.value = false;
  }
}
</script>
