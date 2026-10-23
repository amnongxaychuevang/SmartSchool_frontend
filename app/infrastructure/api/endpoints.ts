// Central registry of all API endpoint paths.
// Change a path here once — every caller updates automatically.
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    me: '/auth/me',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    changePassword: '/auth/change-password',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
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
  import: {
    students: '/import/students',
    teachers: '/import/teachers',
    parents: '/import/parents',
  },
  calendar: '/calendar',
  receipts: '/receipts',
  promotion: {
    preview: '/promotion/preview',
    apply: '/promotion/apply',
  },
  attendance: {
    base: '/attendance',
    scan: '/attendance/scan',
    scanManual: '/attendance/scan/manual',
    daily: '/attendance/daily',
    autoAbsenceRun: '/attendance/auto-absence/run',
  },
  wallets: {
    list: '/wallets',
    student: '/wallets/student',
    topUp: '/wallets/:id/topup',
    status: '/wallets/:id/status',
    process: '/wallet/process',
    card: '/wallet/card',
    transactions: '/wallets/:id/transactions',
    refund: '/wallet-transactions/:id/refund',
  },
  topUps: {
    requests: '/topup-requests'
  },
  spendingLimits: {
    student: '/spending-limits/:studentId'
  },
  shops: {
    list: '/shops',
    rentals: '/shops/rentals',
    rentalPay: (rentalId: number | string) => `/shops/rentals/${rentalId}/pay`,
    rentalSlip: (rentalId: number | string) => `/shops/rentals/${rentalId}/slip`,
    shopRentals: (shopId: number | string) => `/shops/${shopId}/rentals`,
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
    cashflow: '/reports/cashflow',
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
    runReminders: '/fees/reminders/run',
  },
  behavior: {
    overview: '/behavior/overview',
    categories: '/behavior/categories',
    records: '/behavior/records',
    students: '/behavior/students',
  },
  bus: {
    vehicles: '/bus/vehicles',
    routes: '/bus/routes',
    students: '/bus/students',
    scan: '/bus/scan',
    logs: '/bus/logs',
    manifest: '/bus/manifest',
    location: '/bus/location',
    fleetLocations: '/bus/fleet-locations',
    routeLocation: (routeId: number | string) => `/bus/routes/${routeId}/live`,
  },
  library: {
    overview: '/library/overview',
    categories: '/library/categories',
    books: '/library/books',
    loans: '/library/loans',
    borrow: '/library/borrow',
  },
  analytics: {
    atRiskOverview: '/analytics/at-risk/overview',
    atRisk: '/analytics/at-risk',
    atRiskRun: '/analytics/at-risk/run',
    interventions: '/analytics/at-risk/interventions',
  },
  chat: {
    conversations: '/chat/conversations',
    messages: (id: number | string) => `/chat/conversations/${id}/messages`,
    markRead: (id: number | string) => `/chat/conversations/${id}/read`,
    contacts: '/chat/contacts',
  },
  payroll: {
    periods: '/payroll/periods',
    period: (id: number | string) => `/payroll/periods/${id}`,
    generate: '/payroll/periods/generate',
    periodStatus: (id: number | string) => `/payroll/periods/${id}/status`,
    export: (id: number | string) => `/payroll/periods/${id}/export`,
    item: (id: number | string) => `/payroll/items/${id}`,
    itemSlip: (id: number | string) => `/payroll/items/${id}/slip`,
    myPayslips: '/payroll/my-payslips',
    myPayslip: (id: number | string) => `/payroll/my-payslips/${id}`,
  },
  expenses: {
    categories: '/expense-categories',
    category: (id: number | string) => `/expense-categories/${id}`,
    list: '/expenses',
    detail: (id: number | string) => `/expenses/${id}`,
    receipt: (id: number | string) => `/expenses/${id}/receipt`,
  },
} as const;

export const endpoints = API_ENDPOINTS;
export default API_ENDPOINTS;
