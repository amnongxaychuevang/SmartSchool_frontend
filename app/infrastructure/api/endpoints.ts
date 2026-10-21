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
    financeOverview: '/dashboard/finance/overview',
    topPerformers: '/dashboard/classes/top-performers',
    announcements: '/dashboard/announcements',
    upcomingEvents: '/dashboard/events/upcoming',
  },
  students: {
    list: '/students',
    metaStatuses: '/students/meta/statuses',
    metaBloodTypes: '/students/meta/blood-types',
  },
  users: {
    list: '/users',
    teacherCandidates: '/users/teacher-candidates',
    teacherAccount: '/users/teacher-account',
  },
  teachers: {
    list: '/teachers',
    options: '/teachers/options',
  },
  ethnicities: '/ethnicities',
  provinces: '/provinces',
  parents: {
    list: '/parents',
    options: '/parents/options',
  },
  classes: {
    list: '/classes',
    academicYears: '/classes/academic-years',
  },
  attendance: {
    base: '/attendance',
    scan: '/attendance/scan',
    scanManual: '/attendance/scan/manual',
    daily: '/attendance/daily',
  },
  wallets: {
    list: '/wallets',
    student: '/wallets/student',
    topUp: '/wallets/:id/topup',
    status: '/wallets/:id/status',
    process: '/wallet/process',
    card: '/wallet/card',
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
  classSubjects: {
    list: '/class-subjects'
  },
  academicTerms: {
    list: '/academic-terms'
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
    list: '/settings',
    paymentQr: '/settings/payment-qr'
  },
  roles: {
    list: '/roles',
    permissions: '/permissions'
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
  reports: {
    attendance: '/reports/attendance',
    notifyAbsence: '/reports/attendance/notify',
    shopSales: '/reports/shop-sales',
  },
  auditLogs: {
    list: '/audit-logs'
  },
  uploads: {
    slip: '/uploads/slip',
  },
  fees: {
    types: '/fee-types',
    structures: '/fee-structures',
    invoices: '/invoices',
  }
} as const;
