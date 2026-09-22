import { useAuthStore } from '../application/stores/auth';

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();

  // On first load, if we have a token but no user, try to fetch the user
  if (authStore.token && !authStore.user) {
    await authStore.fetchUser();
  }

  const publicRoutes = ['/']; // Add any other public routes here

  // If user is not authenticated and trying to access a protected route
  if (!authStore.isAuthenticated && !publicRoutes.includes(to.path)) {
    return navigateTo('/');
  }

  // If user is authenticated, handle role-based redirects
  if (authStore.isAuthenticated) {
    const role = authStore.userRole;

    // If they are on the login page (or root), redirect to their dashboard
    if (to.path === '/') {
      if (role === 'admin') return navigateTo('/admin');
      if (role === 'teacher') return navigateTo('/teacher');
      if (role === 'parent') return navigateTo('/parent');
    }

    // Basic role protection for specific routes
    if (to.path.startsWith('/admin') && role !== 'admin') {
      return navigateTo('/');
    }
    if (to.path.startsWith('/teacher') && role !== 'teacher') {
      return navigateTo('/');
    }
    if (to.path.startsWith('/parent') && role !== 'parent') {
      return navigateTo('/');
    }
  }
});
