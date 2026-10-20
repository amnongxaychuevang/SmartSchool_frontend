<template>
  <div class="flex flex-col gap-6 page-enter">
    <PageHeader
      :eyebrow="$t('nav.settings')"
      :title="$t('notification_settings.title')"
      :subtitle="$t('notification_settings.subtitle')"
    />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Default Channel & Toggles -->
      <div class="panel p-6 flex flex-col gap-4">
        <div class="flex items-center gap-2 pb-2 border-b border-line">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 class="text-sm font-semibold text-ink uppercase tracking-wider">
            {{ $t("notification_settings.channels") }}
          </h3>
        </div>

        <form
          class="flex flex-col gap-5 mt-2"
          @submit.prevent="handleSaveChannel"
        >
          <!-- Default channel selector -->
          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-semibold text-ink-muted uppercase tracking-wider"
              >{{ $t("notification_settings.default_channel") }}</label
            >
            <select
              v-model="channelForm.default"
              class="input-field"
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="app_push">App Push</option>
            </select>
          </div>

          <!-- Push toggle -->
          <div class="flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-sm font-medium text-white">{{
                $t("notification_settings.push")
              }}</span>
              <span class="text-xs text-slate-400">{{
                $t("notification_settings.push_desc")
              }}</span>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="channelForm.pushEnabled"
                type="checkbox"
                class="sr-only peer"
              >
              <div
                class="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"
              />
            </label>
          </div>

          <!-- Email toggle -->
          <div class="flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-sm font-medium text-white">{{
                $t("notification_settings.email")
              }}</span>
              <span class="text-xs text-slate-400">{{
                $t("notification_settings.email_desc")
              }}</span>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="channelForm.emailEnabled"
                type="checkbox"
                class="sr-only peer"
              >
              <div
                class="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"
              />
            </label>
          </div>

          <div
            class="flex items-center justify-between pt-4 border-t border-line mt-2"
          >
            <span
              v-if="successChannel"
              class="text-xs text-teal-400 flex items-center gap-1.5 animate-pulse"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {{ $t("notification_settings.saved") }}
            </span>
            <span v-else />
            <button
              type="submit"
              :disabled="savingChannel"
              class="btn-primary flex items-center gap-2"
            >
              <svg
                v-if="savingChannel"
                class="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {{ savingChannel ? $t("common.saving") : $t("common.save") }}
            </button>
          </div>
        </form>
      </div>

      <!-- Email SMTP Configuration -->
      <div class="panel p-6 flex flex-col gap-4">
        <div class="flex items-center gap-2 pb-2 border-b border-line">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 class="text-sm font-semibold text-ink uppercase tracking-wider">
            {{ $t("notification_settings.smtp_title") }}
          </h3>
        </div>

        <form
          class="flex flex-col gap-4 mt-1"
          @submit.prevent="handleSaveEmail"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label
                class="text-xs font-semibold text-ink-muted uppercase tracking-wider"
                >{{ $t("notification_settings.smtp_host") }}</label
              >
              <input
                v-model="emailForm.host"
                type="text"
                class="input-field"
                placeholder="smtp.gmail.com"
              >
            </div>
            <div class="flex flex-col gap-1.5">
              <label
                class="text-xs font-semibold text-ink-muted uppercase tracking-wider"
                >{{ $t("notification_settings.smtp_port") }}</label
              >
              <input
                v-model.number="emailForm.port"
                type="number"
                class="input-field"
                placeholder="587"
              >
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label
                class="text-xs font-semibold text-ink-muted uppercase tracking-wider"
                >{{ $t("notification_settings.smtp_username") }}</label
              >
              <input
                v-model="emailForm.user"
                type="text"
                class="input-field"
                placeholder="noreply@school.com"
              >
            </div>
            <div class="flex flex-col gap-1.5">
              <label
                class="text-xs font-semibold text-ink-muted uppercase tracking-wider"
                >{{ $t("notification_settings.smtp_password") }}</label
              >
              <input
                v-model="emailForm.pass"
                :type="showEmailPass ? 'text' : 'password'"
                class="input-field"
                placeholder="••••••••"
              >
              <button
                type="button"
                class="text-xs text-teal-400 self-start hover:text-teal-300 transition-colors"
                @click="showEmailPass = !showEmailPass"
              >
                {{ showEmailPass ? $t("notification_settings.hide_password") : $t("notification_settings.show_password") }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label
                class="text-xs font-semibold text-ink-muted uppercase tracking-wider"
                >{{ $t("notification_settings.smtp_from") }}</label
              >
              <input
                v-model="emailForm.from"
                type="text"
                class="input-field"
                placeholder="noreply@school.com"
              >
            </div>
            <div class="flex flex-col gap-1.5">
              <label
                class="text-xs font-semibold text-ink-muted uppercase tracking-wider"
                >{{ $t("notification_settings.smtp_secure") }}</label
              >
              <select
                v-model="emailForm.secure"
                class="input-field"
              >
                <option :value="false">{{ $t("notification_settings.smtp_secure_no") }}</option>
                <option :value="true">{{ $t("notification_settings.smtp_secure_yes") }}</option>
              </select>
            </div>
          </div>

          <div
            class="flex items-center justify-between pt-4 border-t border-line mt-2"
          >
            <span
              v-if="successEmail"
              class="text-xs text-teal-400 flex items-center gap-1.5 animate-pulse"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {{ $t("notification_settings.saved") }}
            </span>
            <span v-else />
            <button
              type="submit"
              :disabled="
                savingEmail ||
                !emailForm.host ||
                !emailForm.user ||
                !emailForm.pass ||
                !emailForm.from
              "
              class="btn-primary flex items-center gap-2 disabled:opacity-40"
            >
              <svg
                v-if="savingEmail"
                class="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {{ savingEmail ? $t("common.saving") : $t("common.save") }}
            </button>
          </div>
        </form>
      </div>

      <!-- WhatsApp API Configuration -->
      <div class="panel p-6 flex flex-col gap-4">
        <div class="flex items-center gap-2 pb-2 border-b border-line">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <h3 class="text-sm font-semibold text-ink uppercase tracking-wider">
            {{ $t("notification_settings.whatsapp_config") }}
          </h3>
        </div>

        <p class="text-xs text-slate-400">
          {{ $t("notification_settings.whatsapp_desc") }}
        </p>

        <form
          class="flex flex-col gap-4 mt-1"
          @submit.prevent="handleSaveWhatsApp"
        >
          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-semibold text-ink-muted uppercase tracking-wider"
              >{{ $t("notification_settings.phone_number_id") }}</label
            >
            <input
              v-model="waForm.phoneNumberId"
              type="text"
              class="input-field"
              placeholder="e.g. 123456789012345"
            >
          </div>

          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-semibold text-ink-muted uppercase tracking-wider"
              >{{ $t("notification_settings.access_token") }}</label
            >
            <input
              v-model="waForm.accessToken"
              :type="showToken ? 'text' : 'password'"
              class="input-field"
              placeholder="EAAxxxxxxx..."
            >
            <button
              type="button"
              class="text-xs text-teal-400 self-start hover:text-teal-300 transition-colors"
              @click="showToken = !showToken"
            >
              {{
                showToken
                  ? $t("notification_settings.hide_token")
                  : $t("notification_settings.show_token")
              }}
            </button>
          </div>

          <div
            class="flex items-center justify-between pt-4 border-t border-line mt-2"
          >
            <span
              v-if="successWA"
              class="text-xs text-teal-400 flex items-center gap-1.5 animate-pulse"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {{ $t("notification_settings.saved") }}
            </span>
            <span v-else />
            <button
              type="submit"
              :disabled="
                savingWA || !waForm.phoneNumberId || !waForm.accessToken
              "
              class="btn-primary flex items-center gap-2 disabled:opacity-40"
            >
              <svg
                v-if="savingWA"
                class="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {{ savingWA ? $t("common.saving") : $t("common.save") }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import {
  useSettingsStore,
  type NotificationChannelConfig,
} from "../../../application/stores/settings";

definePageMeta({ layout: "admin" });
const { t } = useI18n();
useHead({ title: () => t("page_titles.notifications") });

const settingsStore = useSettingsStore();

const channelForm = reactive<NotificationChannelConfig & {
  pushEnabled: boolean;
  emailEnabled: boolean;
}>({
  default: "whatsapp",
  pushEnabled: true,
  emailEnabled: true,
});

const waForm = reactive({
  phoneNumberId: "",
  accessToken: "",
});

const emailForm = reactive({
  host: "",
  port: 587,
  secure: false,
  user: "",
  pass: "",
  from: "",
});

const showToken = ref(false);
const showEmailPass = ref(false);
const savingChannel = ref(false);
const successChannel = ref(false);
const savingWA = ref(false);
const successWA = ref(false);
const savingEmail = ref(false);
const successEmail = ref(false);

onMounted(async () => {
  await settingsStore.loadSettings();
  channelForm.default = settingsStore.notificationChannel.default || "whatsapp";
  waForm.phoneNumberId = settingsStore.whatsapp.phoneNumberId || "";
  waForm.accessToken = settingsStore.whatsapp.accessToken || "";
  emailForm.host = settingsStore.email.host || "";
  emailForm.port = Number(settingsStore.email.port ?? 587);
  emailForm.secure = Boolean(settingsStore.email.secure ?? false);
  emailForm.user = settingsStore.email.user || "";
  emailForm.pass = settingsStore.email.pass || "";
  emailForm.from = settingsStore.email.from || "";
});

const handleSaveChannel = async () => {
  savingChannel.value = true;
  successChannel.value = false;
  await settingsStore.saveNotificationChannel({
    default: channelForm.default,
  });
  savingChannel.value = false;
  successChannel.value = true;
  setTimeout(() => {
    successChannel.value = false;
  }, 3000);
};

const handleSaveWhatsApp = async () => {
  savingWA.value = true;
  successWA.value = false;
  await settingsStore.saveWhatsAppConfig({
    phoneNumberId: waForm.phoneNumberId,
    accessToken: waForm.accessToken,
  });
  savingWA.value = false;
  successWA.value = true;
  setTimeout(() => {
    successWA.value = false;
  }, 3000);
};

const handleSaveEmail = async () => {
  savingEmail.value = true;
  successEmail.value = false;
  await settingsStore.saveEmailConfig({
    host: emailForm.host,
    port: emailForm.port,
    secure: emailForm.secure,
    user: emailForm.user,
    pass: emailForm.pass,
    from: emailForm.from,
  });
  savingEmail.value = false;
  successEmail.value = true;
  setTimeout(() => {
    successEmail.value = false;
  }, 3000);
};
</script>
