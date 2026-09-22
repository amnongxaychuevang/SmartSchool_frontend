// Central registry of all API endpoint paths.
// Change a path here once — every caller updates automatically.
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    me: '/auth/me',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },
  dashboard: {
    stats: '/dashboard/stats',
  },
  students: {
    list: '/students',
  },
  users: {
    list: '/users',
  },
  teachers: {
    list: '/teachers',
  },
  parents: {
    list: '/parents',
  },
  classes: {
    list: '/classes',
  },
  genders: {
    list: '/genders',
  },
  attendance: {
    base: '/attendance',
    scan: '/attendance/scan',
  },
  wallets: {
    list: '/wallets',
    student: '/wallets/student',
    topUp: '/wallets/:id/topup',
    status: '/wallets/:id/status'
  },
  topUps: {
    requests: '/topup-requests'
  },
  spendingLimits: {
    student: '/spending-limits/:studentId'
  },
  shops: {
    list: '/shops'
  },
  subjects: {
    list: '/subjects'
  },
  grades: {
    list: '/grades',
    types: '/grade-types'
  },
  cards: {
    list: '/cards'
  },
  notifications: {
    list: '/notifications'
  },
  settings: {
    list: '/settings'
  },
  roles: {
    list: '/roles'
  },
  announcements: {
    base: '/announcements'
  },
  schedules: {
    list: '/schedules'
  },
  leaveRequests: {
    list: '/leave-requests'
  },
  auditLogs: {
    list: '/audit-logs'
  }
} as const;
