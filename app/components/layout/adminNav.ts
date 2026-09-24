// The admin portal's navigation and the permission each page needs. The layout
// shows only the entries the signed-in role may use, and the route middleware
// uses the same table to keep people out of pages they cannot use. The server
// checks every request regardless; this keeps the UI honest about it.

export type AdminPermission = string;

export interface AdminNavItem {
  to: string;
  key: string;
  icon: string;
  /** Any one of these grants the page. */
  permission: AdminPermission | AdminPermission[];
}

export interface AdminNavSection {
  key: string;
  collapsible?: boolean;
  items: AdminNavItem[];
}

export const ADMIN_NAV: AdminNavSection[] = [
  { key: 'overview', items: [
    { to: '/admin', key: 'nav.dashboard', icon: 'IconDashboard', permission: 'dashboard.view' },
  ] },
  { key: 'people', items: [
    { to: '/admin/students', key: 'nav.students', icon: 'IconStudents', permission: 'students.view' },
    { to: '/admin/teachers', key: 'nav.teachers', icon: 'IconTeachers', permission: 'teachers.view' },
    { to: '/admin/parents', key: 'nav.parents', icon: 'IconParents', permission: 'parents.view' },
  ] },
  { key: 'attendance', items: [
    { to: '/admin/cards', key: 'nav.cards', icon: 'IconUsers', permission: 'cards.view' },
    { to: '/admin/attendance', key: 'nav.scanSimulator', icon: 'IconAttendance', permission: 'attendance.manual_tap' },
  ] },
  { key: 'academics', items: [
    { to: '/admin/classes', key: 'nav.classes', icon: 'IconClasses', permission: 'academics.view' },
    { to: '/admin/academics/subjects', key: 'nav.subjects', icon: 'IconReports', permission: 'academics.view' },
    { to: '/admin/academics/class-subjects', key: 'nav.classSubjects', icon: 'IconClasses', permission: 'academics.view' },
    { to: '/admin/academics/schedule', key: 'nav.schedule', icon: 'IconSchedule', permission: 'academics.view' },
    { to: '/admin/academics/grades', key: 'nav.grades', icon: 'IconReports', permission: 'grades.view' },
    { to: '/admin/settings/academic-terms', key: 'nav.academicTerms', icon: 'IconSchedule', permission: 'academics.view' },
  ] },
  { key: 'finance', items: [
    { to: '/admin/finance/top-ups', key: 'nav.topUps', icon: 'IconWallet', permission: 'finance.view' },
    { to: '/admin/finance', key: 'nav.wallets', icon: 'IconWallet', permission: 'finance.view' },
    { to: '/admin/finance/spending-limits', key: 'nav.spendingLimits', icon: 'IconSettings', permission: 'finance.view' },
    { to: '/admin/finance/shops', key: 'nav.shops', icon: 'IconDashboard', permission: 'finance.view' },
  ] },
  { key: 'fees', items: [
    { to: '/admin/fees', key: 'nav.invoices', icon: 'IconReports', permission: 'fees.view' },
    { to: '/admin/fees/structures', key: 'nav.feeStructures', icon: 'IconSettings', permission: 'fees.view' },
  ] },
  { key: 'communication', items: [
    { to: '/admin/announcements', key: 'nav.announcements', icon: 'IconNotifications', permission: 'announcements.manage' },
    { to: '/admin/notifications', key: 'nav.notifications', icon: 'IconNotifications', permission: 'notifications.manage' },
  ] },
  { key: 'reports', collapsible: true, items: [
    { to: '/admin/reports', key: 'nav.overview', icon: 'IconReports', permission: 'reports.view' },
    { to: '/admin/reports/attendance', key: 'nav.attendance', icon: 'IconAttendance', permission: 'reports.view' },
    { to: '/admin/reports/grades', key: 'nav.grades', icon: 'IconReports', permission: 'reports.view' },
    { to: '/admin/reports/students', key: 'nav.students', icon: 'IconStudents', permission: 'reports.view' },
    { to: '/admin/reports/wallet', key: 'nav.wallet', icon: 'IconWallet', permission: 'reports.view' },
    { to: '/admin/reports/fees', key: 'nav.fees', icon: 'IconWallet', permission: ['fees.view', 'reports.view'] },
  ] },
  { key: 'system', collapsible: true, items: [
    { to: '/admin/settings', key: 'nav.general', icon: 'IconSettings', permission: 'settings.manage' },
    { to: '/admin/users', key: 'nav.users', icon: 'IconUsers', permission: 'users.manage' },
    { to: '/admin/settings/permissions', key: 'nav.permissions', icon: 'IconSettings', permission: 'roles.manage' },
    { to: '/admin/settings/notifications', key: 'nav.notificationSettings', icon: 'IconNotifications', permission: 'settings.manage' },
    { to: '/admin/audit-logs', key: 'nav.auditLogs', icon: 'IconReports', permission: 'audit.view' },
  ] },
];

// Admin pages that are not menu entries.
const EXTRA_PAGES: { to: string; permission: AdminPermission }[] = [
  { to: '/admin/students/create', permission: 'students.manage' },
];

export const hasPermission = (granted: readonly string[], needed: AdminPermission | AdminPermission[]) =>
  (Array.isArray(needed) ? needed : [needed]).some((p) => granted.includes(p));

/** The permission a path needs: the most specific page whose path it falls under. */
export function permissionForPath(path: string): AdminPermission | AdminPermission[] | null {
  const pages = [...ADMIN_NAV.flatMap((s) => s.items), ...EXTRA_PAGES];
  const match = pages
    .filter((p) => path === p.to || path.startsWith(p.to + '/'))
    .sort((a, b) => b.to.length - a.to.length)[0];
  return match?.permission ?? null;
}

/** Where to send someone who opened a page they cannot use: their first allowed page. */
export function firstAllowedAdminPath(granted: readonly string[]): string | null {
  return ADMIN_NAV.flatMap((s) => s.items).find((i) => hasPermission(granted, i.permission))?.to ?? null;
}
