import { useAuthStore } from '../application/stores/auth';
import { permissionForPath, hasPermission, firstAllowedAdminPath } from '../components/layout/adminNav';

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();

  // On first load (or a full page refresh) restore the session from cookies,
  // refreshing an expired access token if needed, before any route checks.
  if (!authStore.initialized) {
    await authStore.init();
  }

  const publicRoutes = ['/']; // Add any other public routes here

  // If user is not authenticated and trying to access a protected route
  if (!authStore.isAuthenticated && !publicRoutes.includes(to.path)) {
    return navigateTo('/');
  }

  // Signed in: each role has one portal (admin, teacher or parent). Staff roles
  // such as a bursar use the admin portal, limited to the pages they have permission for.
  if (authStore.isAuthenticated) {
    const portal = authStore.portal;
    const home = portal === 'admin' ? firstAllowedAdminPath(authStore.permissions) : portal ? `/${portal}` : null;

    if (to.path === '/') return home ? navigateTo(home) : undefined;

    const section = ['admin', 'teacher', 'parent'].find((p) => to.path === `/${p}` || to.path.startsWith(`/${p}/`));
    if (section && section !== portal) return navigateTo(home ?? '/');

    if (section === 'admin') {
      const needed = permissionForPath(to.path);
      if (needed && !hasPermission(authStore.permissions, needed)) {
        return navigateTo(home && home !== to.path ? home : '/');
      }
    }
  }
});
