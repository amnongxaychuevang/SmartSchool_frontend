import { defineStore } from 'pinia';
import { settingsRepository } from '../../infrastructure/api/SettingsRepository';

export interface SchoolInfo {
  schoolNameEn: string;
  schoolNameLo: string;
  contactEmail: string;
  contactPhone: string;
}

export interface AcademicSettings {
  currentYear: string;
  activeTerm: string;
}

export interface PermissionItem {
  key: string;
  label: string;
  desc: string;
  enabled: boolean;
}

export interface PermissionCategory {
  name: string;
  items: PermissionItem[];
}

export type PermissionsMap = Record<string, PermissionCategory[]>;

const defaultSchoolInfo: SchoolInfo = {
  schoolNameEn: 'Smart School Academy',
  schoolNameLo: 'ໂຮງຮຽນ ສະມາດ ສະຄູນ',
  contactEmail: 'contact@smartschool.com',
  contactPhone: '+856 20 5555 6666'
};

const defaultAcademicSettings: AcademicSettings = {
  currentYear: '2025 - 2026',
  activeTerm: 'Semester 1'
};

const defaultPermissionsMap: PermissionsMap = {
  admin: [
    {
      name: 'Student Management',
      items: [
        { key: 'std_view', label: 'View Student Directory', desc: 'Can browse student details and profiles', enabled: true },
        { key: 'std_write', label: 'Add/Edit Students', desc: 'Can insert new student entries and modify profiles', enabled: true },
        { key: 'std_delete', label: 'Delete Student Records', desc: 'Can purge student accounts from database', enabled: true },
      ]
    },
    {
      name: 'Academics & Grading',
      items: [
        { key: 'class_manage', label: 'Manage Classes & Rooms', desc: 'Can create classes, sections and assign homerooms', enabled: true },
        { key: 'grade_write', label: 'Edit Academic Scores', desc: 'Can modify exam grades and gradebooks', enabled: true },
      ]
    },
    {
      name: 'Financial Audit',
      items: [
        { key: 'fee_write', label: 'Manage Fees & Invoices', desc: 'Can issue invoices and adjust tuition fees', enabled: true },
        { key: 'trans_view', label: 'View Collection Logs', desc: 'Can review payment transaction logs', enabled: true },
      ]
    }
  ],
  teacher: [
    {
      name: 'Student Management',
      items: [
        { key: 'std_view', label: 'View Student Directory', desc: 'Can browse student details and profiles', enabled: true },
        { key: 'std_write', label: 'Add/Edit Students', desc: 'Can insert new student entries and modify profiles', enabled: false },
        { key: 'std_delete', label: 'Delete Student Records', desc: 'Can purge student accounts from database', enabled: false },
      ]
    },
    {
      name: 'Academics & Grading',
      items: [
        { key: 'class_manage', label: 'Manage Classes & Rooms', desc: 'Can create classes, sections and assign homerooms', enabled: false },
        { key: 'grade_write', label: 'Edit Academic Scores', desc: 'Can modify exam grades and gradebooks', enabled: true },
      ]
    },
    {
      name: 'Financial Audit',
      items: [
        { key: 'fee_write', label: 'Manage Fees & Invoices', desc: 'Can issue invoices and adjust tuition fees', enabled: false },
        { key: 'trans_view', label: 'View Collection Logs', desc: 'Can review payment transaction logs', enabled: false },
      ]
    }
  ],
  parent: [
    {
      name: 'Student Management',
      items: [
        { key: 'std_view', label: 'View Child Profile', desc: 'Can view details of linked children', enabled: true },
        { key: 'std_write', label: 'Edit Child Profile', desc: 'Can edit basic details of linked children', enabled: false },
      ]
    },
    {
      name: 'Academics & Grading',
      items: [
        { key: 'grade_view', label: 'View Child Report Card', desc: 'Can check grading logs and exam reports', enabled: true },
      ]
    },
    {
      name: 'Financial Audit',
      items: [
        { key: 'fee_pay', label: 'Online Tuition Payments', desc: 'Can pay outstanding invoices online', enabled: true },
      ]
    }
  ],
  student: [
    {
      name: 'Student Profile',
      items: [
        { key: 'std_view_self', label: 'View Self Profile', desc: 'Can view personal academic info', enabled: true },
      ]
    },
    {
      name: 'Academics & Grades',
      items: [
        { key: 'grade_view_self', label: 'View Self Report Card', desc: 'Can review own exam score logs', enabled: true },
      ]
    }
  ]
};

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    schoolInfo: { ...defaultSchoolInfo } as SchoolInfo,
    academicSettings: { ...defaultAcademicSettings } as AcademicSettings,
    permissionsMap: JSON.parse(JSON.stringify(defaultPermissionsMap)) as PermissionsMap,
    loaded: false
  }),

  actions: {
    async loadSettings() {
      if (this.loaded) return;
      try {
        const res = await settingsRepository.getSettings();
        if (res.data) {
          if (res.data.schoolInfo) this.schoolInfo = res.data.schoolInfo;
          if (res.data.academicSettings) this.academicSettings = res.data.academicSettings;
          if (res.data.permissionsMap) this.permissionsMap = res.data.permissionsMap;
        }
      } catch (err) {
        console.warn('Failed to load settings from API, falling back to localStorage:', err);
        if (!import.meta.client) return;
        const cachedSchool = localStorage.getItem('school_info');
        if (cachedSchool) this.schoolInfo = JSON.parse(cachedSchool);

        const cachedAcademic = localStorage.getItem('academic_settings');
        if (cachedAcademic) this.academicSettings = JSON.parse(cachedAcademic);

        const cachedPermissions = localStorage.getItem('permissions_map');
        if (cachedPermissions) this.permissionsMap = JSON.parse(cachedPermissions);
      } finally {
        this.loaded = true;
      }
    },

    async saveSchoolInfo(info: SchoolInfo) {
      this.schoolInfo = { ...info };
      try {
        await settingsRepository.updateSettings({ schoolInfo: this.schoolInfo });
      } catch (e) {
        console.error('Failed to sync to API', e);
      }
      if (import.meta.client) {
        localStorage.setItem('school_info', JSON.stringify(this.schoolInfo));
      }
    },

    async saveAcademicSettings(settings: AcademicSettings) {
      this.academicSettings = { ...settings };
      try {
        await settingsRepository.updateSettings({ academicSettings: this.academicSettings });
      } catch (e) {
        console.error('Failed to sync to API', e);
      }
      if (import.meta.client) {
        localStorage.setItem('academic_settings', JSON.stringify(this.academicSettings));
      }
    },

    savePermissions(permissions: PermissionsMap) {
      this.permissionsMap = JSON.parse(JSON.stringify(permissions));
      if (import.meta.client) {
        localStorage.setItem('permissions_map', JSON.stringify(this.permissionsMap));
      }
    },

    resetPermissions() {
      this.permissionsMap = JSON.parse(JSON.stringify(defaultPermissionsMap));
      if (import.meta.client) {
        localStorage.setItem('permissions_map', JSON.stringify(this.permissionsMap));
      }
    }
  }
});
