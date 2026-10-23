<template>
  <div class="flex flex-col gap-6">
    <!-- Screen-only toolbar -->
    <div class="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <NuxtLink to="/admin/cards" class="btn-secondary !px-0 w-9" :aria-label="$t('common.back')">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </NuxtLink>
        <div>
          <h1 class="text-xl font-bold text-ink leading-tight">
            {{ $t('card_print.title') }}
          </h1>
          <p class="text-xs text-ink-muted">
            {{ $t('card_print.subtitle') }}
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!-- Class filter -->
        <select v-model.number="selectedClassId" class="input-field text-sm w-auto" @change="onClassChange">
          <option :value="0">{{ $t('card_print.all_classes') }}</option>
          <option v-for="c in classes" :key="c.classId" :value="c.classId">
            {{ locale === 'lo' ? c.classNameLo : c.classNameEn }} ({{ c.academicYear }})
          </option>
        </select>

        <!-- Card side selector -->
        <select v-model="cardSide" class="input-field text-sm w-auto">
          <option value="both">{{ $t('card_print.side_both') }}</option>
          <option value="front">{{ $t('card_print.side_front') }}</option>
          <option value="back">{{ $t('card_print.side_back') }}</option>
        </select>

        <!-- Print button -->
        <button
          type="button"
          class="btn-primary flex items-center gap-2 px-5 py-2 text-sm font-bold shadow-md shadow-teal-500/20 active:scale-95 transition-all"
          :disabled="loading || !cards.length"
          @click="handlePrint"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>{{ $t('card_print.btn_print', { count: cards.length }) }}</span>
        </button>
      </div>
    </div>

    <!-- Print info notice -->
    <div class="print:hidden p-3.5 rounded-xl border border-teal-500/20 bg-teal-50/50 dark:bg-teal-950/20 text-xs text-teal-800 dark:text-teal-300 flex items-center gap-3">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <span class="font-semibold">{{ $t('card_print.tip_title') }}</span>
        {{ $t('card_print.tip_desc') }}
      </div>
    </div>

    <LoadingSpinner v-if="loading" class="py-16 print:hidden" />

    <div v-else-if="!cards.length" class="panel p-16 text-center text-sm text-ink-subtle print:hidden">
      {{ $t('card_print.empty') }}
    </div>

    <!-- Printable Cards Sheet Grid -->
    <div v-else id="print-sheet" class="cards-grid">
      <template v-for="card in cards" :key="card.cardId">
        <!-- FRONT SIDE -->
        <div
          v-if="cardSide === 'both' || cardSide === 'front'"
          class="id-card id-card-front"
        >
          <!-- Top Header Strip -->
          <div class="card-header">
            <div class="flex items-center gap-2">
              <img src="/logo.png" alt="Logo" class="w-7 h-7 rounded-full bg-white object-contain p-0.5 shadow-sm shrink-0" />
              <div class="min-w-0">
                <p class="text-[10px] font-extrabold uppercase tracking-wider text-white leading-tight truncate">
                  {{ schoolNameLo }}
                </p>
                <p class="text-[7px] text-teal-100 font-semibold uppercase tracking-widest truncate">
                  {{ schoolNameEn }}
                </p>
              </div>
            </div>
            <span class="badge-tag">{{ $t('card_print.badge_student') }}</span>
          </div>

          <!-- Body with Photo & Details -->
          <div class="card-body">
            <!-- Student Photo -->
            <div class="photo-wrapper">
              <img
                v-if="card.student?.photoUrl"
                :src="card.student.photoUrl"
                alt="Student Photo"
                class="student-photo"
              />
              <div v-else class="fallback-photo">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>

            <!-- Student Info -->
            <div class="student-info">
              <p class="student-name-lo">{{ card.student?.fullNameLo || card.student?.fullNameEn }}</p>
              <p class="student-name-en">{{ card.student?.fullNameEn }}</p>

              <div class="info-row">
                <span class="info-label">{{ $t('card_print.code_label') }}:</span>
                <span class="info-value font-mono">{{ card.student?.studentCode }}</span>
              </div>

              <div class="info-row">
                <span class="info-label">{{ $t('card_print.class_label') }}:</span>
                <span class="info-value font-semibold text-teal-700">
                  {{ studentClassName(card) }}
                </span>
              </div>
            </div>

            <!-- QR Code -->
            <div class="qr-wrapper" v-html="generateQr(card.cardUid)"></div>
          </div>

          <!-- Bottom Footer Barcode -->
          <div class="card-footer">
            <div class="barcode-container" v-html="generateBarcode(card.cardUid)"></div>
            <div class="card-meta">
              <span class="font-mono text-[8px] text-slate-600 font-bold tracking-wider">{{ card.cardUid }}</span>
              <span class="text-[7px] text-slate-400">SMART CAMPUS PASS</span>
            </div>
          </div>
        </div>

        <!-- BACK SIDE -->
        <div
          v-if="cardSide === 'both' || cardSide === 'back'"
          class="id-card id-card-back"
        >
          <!-- Back Top -->
          <div class="back-header">
            <p class="text-[9px] font-bold text-slate-800 uppercase tracking-wider">
              {{ $t('card_print.terms_title') }}
            </p>
          </div>

          <!-- Rules & Info -->
          <div class="back-body">
            <ul class="rules-list">
              <li>{{ $t('card_print.rule_1') }}</li>
              <li>{{ $t('card_print.rule_2') }}</li>
              <li>{{ $t('card_print.rule_3') }}</li>
            </ul>

            <div class="medical-emergency-grid">
              <div class="emergency-box">
                <span class="em-label">{{ $t('card_print.blood_label') }}</span>
                <span class="em-value font-bold text-red-600">{{ card.student?.bloodType || '—' }}</span>
              </div>
              <div class="emergency-box">
                <span class="em-label">{{ $t('card_print.emergency_label') }}</span>
                <span class="em-value font-mono">{{ emergencyPhone(card) }}</span>
              </div>
              <div class="emergency-box">
                <span class="em-label">{{ $t('card_print.expires_label') }}</span>
                <span class="em-value font-mono">{{ card.expiredDate ? f.date(card.expiredDate) : '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Back Footer -->
          <div class="back-footer">
            <div class="text-[7px] text-slate-500 leading-tight">
              <p class="font-semibold text-slate-700">{{ schoolNameLo }}</p>
              <p>{{ schoolPhone }} &middot; {{ schoolEmail }}</p>
            </div>
            <div class="signature-box">
              <div class="sig-line"></div>
              <span class="text-[6px] text-slate-400 uppercase">{{ $t('card_print.signature_label') }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { academicsRepository } from '../../../infrastructure/api/AcademicsRepository';
import { adminRepository } from '../../../infrastructure/api/AdminRepository';
import { useSettingsStore } from '../../../application/stores/settings';
import { useFormat } from '../../../composables/useFormat';
import { generateBarcodeSvg, generateQrCodeSvg } from '../../../utils/barcode';
import type { Card } from '../../../domain/models/Academics';
import type { SchoolClass } from '../../../domain/models/SchoolClass';

definePageMeta({ layout: 'admin' });

const { t, locale } = useI18n();
const route = useRoute();
const f = useFormat();
const settingsStore = useSettingsStore();

useHead({ title: () => `${t('card_print.title')} — Smart School` });

const loading = ref(true);
const cards = ref<Card[]>([]);
const classes = ref<SchoolClass[]>([]);
const selectedClassId = ref<number>(0);
const cardSide = ref<'both' | 'front' | 'back'>('both');

const schoolNameLo = computed(() => settingsStore.schoolInfo.schoolNameLo || 'ໂຮງຮຽນ ສະມາດສະກູນ');
const schoolNameEn = computed(() => settingsStore.schoolInfo.schoolNameEn || 'SMART SCHOOL ACADEMY');
const schoolPhone = computed(() => settingsStore.schoolInfo.contactPhone || '+856 20 5555 1234');
const schoolEmail = computed(() => settingsStore.schoolInfo.contactEmail || 'info@smartschool.la');

onMounted(async () => {
  try {
    const classRes = await adminRepository.getClasses({ limit: 100 });
    classes.value = classRes.classes || [];
  } catch {}

  const targetCardId = route.query.cardId ? Number(route.query.cardId) : null;
  const targetClassId = route.query.classId ? Number(route.query.classId) : 0;
  if (targetClassId) selectedClassId.value = targetClassId;

  await loadCards(targetCardId);
});

async function loadCards(singleCardId?: number | null) {
  loading.value = true;
  try {
    const res = await academicsRepository.getCards({
      classId: selectedClassId.value || undefined,
      limit: 100,
    });
    let list = res.cards || [];
    if (singleCardId) {
      list = list.filter((c: Card) => c.cardId === singleCardId);
    }
    cards.value = list;
  } catch (err) {
    console.error('Failed to load cards for printing:', err);
  } finally {
    loading.value = false;
  }
}

function onClassChange() {
  loadCards();
}

function studentClassName(card: any): string {
  const c = card.student?.classStudents?.[0]?.class;
  if (!c) return '—';
  return (locale.value === 'lo' ? c.classNameLo : c.classNameEn) || c.classNameEn || '—';
}

function emergencyPhone(card: any): string {
  const p = card.student?.parentStudents?.[0]?.parent?.phoneNumber;
  return p || schoolPhone.value;
}

function generateBarcode(uid: string): string {
  return generateBarcodeSvg(uid, 30);
}

function generateQr(uid: string): string {
  return generateQrCodeSvg(uid, 48);
}

function handlePrint() {
  window.print();
}
</script>

<style scoped>
/* Standard CR80 PVC badge dimensions: 85.6mm x 53.98mm (~3.370 × 2.125 inches) */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(85.6mm, 1fr));
  gap: 6mm;
  justify-content: center;
  padding: 4px;
}

.id-card {
  width: 85.6mm;
  height: 54mm;
  border-radius: 3.5mm;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  color: #0f172a;
  display: flex;
  flex-direction: column;
  position: relative;
  page-break-inside: avoid;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}

/* Card Front Styling */
.card-header {
  height: 14mm;
  background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
  padding: 1.5mm 3mm;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #ffffff;
}

.badge-tag {
  font-size: 6.5px;
  font-weight: 800;
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 1px 4px;
  border-radius: 2mm;
  letter-spacing: 0.5px;
}

.card-body {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 2.5mm;
  padding: 2mm 3mm;
  background: #ffffff;
}

.photo-wrapper {
  width: 20mm;
  height: 25mm;
  border-radius: 2mm;
  overflow: hidden;
  border: 1.5px solid #0f766e;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  background-color: #f1f5f9;
  flex-shrink: 0;
}

.student-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fallback-photo {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
}

.student-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.student-name-lo {
  font-size: 9.5px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.student-name-en {
  font-size: 7.5px;
  color: #64748b;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 1.5mm;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-row {
  display: flex;
  align-items: baseline;
  gap: 2px;
  font-size: 7.5px;
  line-height: 1.3;
}

.info-label {
  color: #64748b;
  font-weight: 600;
  width: 12mm;
  flex-shrink: 0;
}

.info-value {
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qr-wrapper {
  width: 13mm;
  height: 13mm;
  padding: 0.5mm;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1mm;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-footer {
  height: 12.5mm;
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 1mm 3mm;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.barcode-container {
  height: 6mm;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  color: #0f172a;
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5mm;
}

/* Card Back Styling */
.id-card-back {
  background-color: #ffffff;
  border: 1px dashed #94a3b8;
}

.back-header {
  height: 7mm;
  background-color: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  padding: 0 3mm;
}

.back-body {
  flex: 1;
  padding: 2mm 3mm;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.rules-list {
  font-size: 6.5px;
  color: #475569;
  line-height: 1.35;
  list-style: none;
  padding: 0;
  margin: 0;
}

.medical-emergency-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2mm;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 1.5mm;
  padding: 1.5mm;
  margin-top: 1mm;
}

.emergency-box {
  display: flex;
  flex-direction: column;
}

.em-label {
  font-size: 6px;
  color: #64748b;
  text-transform: uppercase;
}

.em-value {
  font-size: 7.5px;
  color: #0f172a;
}

.back-footer {
  height: 10mm;
  border-top: 1px solid #e2e8f0;
  padding: 1mm 3mm;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f8fafc;
}

.signature-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 25mm;
}

.sig-line {
  width: 100%;
  border-bottom: 1px solid #94a3b8;
  margin-bottom: 1px;
}

/* Printable Layout Settings */
@media print {
  @page {
    size: A4 portrait;
    margin: 8mm 6mm;
  }

  body {
    background: #ffffff !important;
  }

  .print\:hidden {
    display: none !important;
  }

  .cards-grid {
    display: grid !important;
    grid-template-columns: 85.6mm 85.6mm !important;
    gap: 4mm 4mm !important;
    justify-content: center !important;
    padding: 0 !important;
  }

  .id-card {
    box-shadow: none !important;
    border: 1px solid #94a3b8 !important;
    margin: 0 !important;
    page-break-inside: avoid !important;
  }
}
</style>
