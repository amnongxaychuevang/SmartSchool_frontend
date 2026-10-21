<template>
  <div class="flex flex-col gap-6 page-enter">
    <PageHeader
      :eyebrow="$t('nav.settings')"
      :title="$t('notification_settings.title')"
      :subtitle="$t('notification_settings.subtitle')"
    />

    <p v-if="pageError" role="alert" class="panel border-danger-line bg-danger-soft text-danger px-4 py-3 text-sm">
      {{ pageError }}
    </p>

    <form class="panel p-6 flex flex-col gap-5 max-w-3xl" @submit.prevent="handleSave">
      <div class="flex flex-col gap-1.5 sm:max-w-xs">
        <label for="default-channel" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">
          {{ $t("notification_settings.default_channel") }}
        </label>
        <select id="default-channel" v-model="channel" class="input-field">
          <option value="whatsapp">{{ $t("notification_settings.channel_whatsapp") }}</option>
          <option value="email">{{ $t("notification_settings.channel_email") }}</option>
        </select>
      </div>

      <!-- WhatsApp -->
      <section v-if="channel === 'whatsapp'" class="flex flex-col gap-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="text-sm font-semibold text-ink uppercase tracking-wider">{{ $t("notification_settings.whatsapp_config") }}</h3>
            <p class="text-xs text-ink-muted mt-1">{{ $t("notification_settings.whatsapp_desc") }}</p>
          </div>
          <span :class="['shrink-0', isConfigured('whatsapp') ? 'badge-success' : 'badge-slate']">{{ statusText('whatsapp') }}</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label for="wa-phone-id" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t("notification_settings.phone_number_id") }}</label>
            <input id="wa-phone-id" v-model="waForm.phoneNumberId" type="text" required maxlength="50" class="input-field" placeholder="123456789012345">
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="wa-token" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t("notification_settings.access_token") }}</label>
            <div class="relative">
              <input id="wa-token" v-model="waForm.accessToken" :type="showSecret ? 'text' : 'password'" required maxlength="500" class="input-field pr-10" placeholder="EAAxxxxxxx...">
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-ink-subtle hover:text-ink transition-colors"
                :aria-label="showSecret ? $t('notification_settings.hide_token') : $t('notification_settings.show_token')"
                :title="showSecret ? $t('notification_settings.hide_token') : $t('notification_settings.show_token')"
                @click="showSecret = !showSecret"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="showSecret ? EYE_OFF_ICON : EYE_ICON" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Email SMTP -->
      <section v-else class="flex flex-col gap-4">
        <div class="flex items-start justify-between gap-3">
          <h3 class="text-sm font-semibold text-ink uppercase tracking-wider">{{ $t("notification_settings.smtp_title") }}</h3>
          <span :class="['shrink-0', isConfigured('email') ? 'badge-success' : 'badge-slate']">{{ statusText('email') }}</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label for="smtp-host" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t("notification_settings.smtp_host") }}</label>
            <input id="smtp-host" v-model="emailForm.host" type="text" required maxlength="255" class="input-field" placeholder="smtp.gmail.com">
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="smtp-port" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t("notification_settings.smtp_port") }}</label>
            <input id="smtp-port" v-model.number="emailForm.port" type="number" min="1" max="65535" class="input-field" placeholder="587">
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="smtp-user" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t("notification_settings.smtp_username") }}</label>
            <input id="smtp-user" v-model="emailForm.user" type="text" required maxlength="255" class="input-field" placeholder="noreply@school.com">
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="smtp-pass" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t("notification_settings.smtp_password") }}</label>
            <div class="relative">
              <input id="smtp-pass" v-model="emailForm.pass" :type="showSecret ? 'text' : 'password'" required maxlength="255" class="input-field pr-10" placeholder="••••••••">
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-ink-subtle hover:text-ink transition-colors"
                :aria-label="showSecret ? $t('notification_settings.hide_password') : $t('notification_settings.show_password')"
                :title="showSecret ? $t('notification_settings.hide_password') : $t('notification_settings.show_password')"
                @click="showSecret = !showSecret"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="showSecret ? EYE_OFF_ICON : EYE_ICON" />
                </svg>
              </button>
            </div>
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="smtp-from" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t("notification_settings.smtp_from") }}</label>
            <input id="smtp-from" v-model="emailForm.from" type="text" required maxlength="255" class="input-field" placeholder="noreply@school.com">
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="smtp-secure" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t("notification_settings.smtp_secure") }}</label>
            <select id="smtp-secure" v-model="emailForm.secure" class="input-field">
              <option :value="false">{{ $t("notification_settings.smtp_secure_no") }}</option>
              <option :value="true">{{ $t("notification_settings.smtp_secure_yes") }}</option>
            </select>
          </div>
        </div>
      </section>

      <div class="flex items-center justify-end gap-3">
        <span v-if="success" class="text-xs text-success">{{ $t("notification_settings.saved") }}</span>
        <button type="submit" :disabled="saving" class="btn-primary">
          {{ saving ? $t("common.saving") : $t("common.save") }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { useSettingsStore } from "../../../application/stores/settings";

type Channel = "whatsapp" | "email";

const EYE_ICON =
  "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z";
const EYE_OFF_ICON =
  "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21";

definePageMeta({ layout: "admin" });
const { t } = useI18n();
useHead({ title: () => t("page_titles.notifications") });

const settingsStore = useSettingsStore();

const channel = ref<Channel>("whatsapp");
const waForm = reactive({ phoneNumberId: "", accessToken: "" });
const emailForm = reactive({ host: "", port: 587, secure: false, user: "", pass: "", from: "" });
const showSecret = ref(false);
const saving = ref(false);
const success = ref(false);
const pageError = ref("");

// Status comes from what is saved, not from unsaved edits in the form.
const isConfigured = (c: Channel) =>
  c === "whatsapp"
    ? Boolean(settingsStore.whatsapp.phoneNumberId && settingsStore.whatsapp.accessToken)
    : Boolean(settingsStore.email.host && settingsStore.email.user && settingsStore.email.from);
const statusText = (c: Channel) => (isConfigured(c) ? t("settings_ui.configured") : t("settings_ui.not_configured"));

onMounted(async () => {
  try {
    await settingsStore.loadSettings();
  } catch (err) {
    pageError.value = getErrorMessage(err);
    return;
  }
  // An older save may still hold "app_push", which is no longer offered.
  channel.value = settingsStore.notificationChannel.default === "email" ? "email" : "whatsapp";
  Object.assign(waForm, {
    phoneNumberId: settingsStore.whatsapp.phoneNumberId || "",
    accessToken: settingsStore.whatsapp.accessToken || "",
  });
  Object.assign(emailForm, {
    host: settingsStore.email.host || "",
    port: Number(settingsStore.email.port ?? 587),
    secure: Boolean(settingsStore.email.secure ?? false),
    user: settingsStore.email.user || "",
    pass: settingsStore.email.pass || "",
    from: settingsStore.email.from || "",
  });
});

const handleSave = async () => {
  saving.value = true;
  success.value = false;
  pageError.value = "";
  try {
    await settingsStore.saveNotificationSetup(
      channel.value === "whatsapp"
        ? { channel: "whatsapp", config: { ...waForm } }
        : { channel: "email", config: { ...emailForm } },
    );
    success.value = true;
    setTimeout(() => {
      success.value = false;
    }, 3000);
  } catch (err) {
    pageError.value = getErrorMessage(err, t("settings_ui.save_error"));
  } finally {
    saving.value = false;
  }
};
</script>
