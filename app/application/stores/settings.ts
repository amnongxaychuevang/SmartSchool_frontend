import { defineStore } from "pinia";
import { settingsRepository, type SettingsData } from "../../infrastructure/api/SettingsRepository";

export interface SchoolInfo {
  schoolNameEn: string;
  schoolNameLo: string;
  contactEmail: string;
  contactPhone: string;
}

export interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

export interface NotificationChannelConfig {
  default: "whatsapp" | "email";
}

/** The school account parents transfer top-ups to. */
export interface PaymentInfo {
  bankName: string;
  accountName: string;
  accountNumber: string;
  qrUrl?: string;
  note?: string;
}

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    schoolInfo: {
      schoolNameEn: "",
      schoolNameLo: "",
      contactEmail: "",
      contactPhone: "",
    } as SchoolInfo,
    whatsapp: { phoneNumberId: "", accessToken: "" } as WhatsAppConfig,
    email: {
      host: "",
      port: 587,
      secure: false,
      user: "",
      pass: "",
      from: "",
    } as EmailConfig,
    notificationChannel: { default: "whatsapp" } as NotificationChannelConfig,
    paymentInfo: null as PaymentInfo | null,
    loaded: false,
  }),

  actions: {
    async loadSettings() {
      if (this.loaded) return;
      const res = await settingsRepository.getSettings();
      const data: SettingsData = res.data?.settings ?? {};
      if (data.schoolInfo) this.schoolInfo = { ...this.schoolInfo, ...data.schoolInfo };
      if (data.whatsapp) this.whatsapp = data.whatsapp as WhatsAppConfig;
      if (data.email) this.email = data.email as EmailConfig;
      if (data.notificationChannel)
        this.notificationChannel = data.notificationChannel as NotificationChannelConfig;
      if (data.paymentInfo) this.paymentInfo = data.paymentInfo as PaymentInfo;
      this.loaded = true;
    },

    async saveSchoolInfo(info: SchoolInfo) {
      await settingsRepository.updateSettings({ schoolInfo: info });
      this.schoolInfo = { ...info };
    },

    async savePaymentInfo(info: PaymentInfo) {
      await settingsRepository.updateSettings({ paymentInfo: info });
      this.paymentInfo = { ...info };
    },

    // Saves the chosen channel together with its connection details in one request.
    async saveNotificationSetup(
      setup: { channel: "whatsapp"; config: WhatsAppConfig } | { channel: "email"; config: EmailConfig },
    ) {
      const notificationChannel = { default: setup.channel };
      await settingsRepository.updateSettings({ notificationChannel, [setup.channel]: setup.config });
      this.notificationChannel = notificationChannel;
      if (setup.channel === "whatsapp") this.whatsapp = { ...setup.config };
      else this.email = { ...setup.config };
    },
  },
});
