import type { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import type { User } from '../../domain/models/User';
import { useApiClient } from './apiClient'; // Import the composable
import { API_ENDPOINTS } from './endpoints';

// Concrete HTTP implementation of the auth repository contract.
// This is the ONLY file that knows about HTTP / $fetch / apiClient.
export class AuthRepository implements IAuthRepository {
  async login(phoneOrEmail: string, password: string): Promise<{ token: string; refreshToken: string; user: User }> {
    const apiClient = useApiClient();
    let res: any;
    try {
      res = await apiClient<{ success: boolean; data: { token: string; refreshToken: string; user: User } }>(
        API_ENDPOINTS.auth.login,
        {
          method: 'POST',
          body: { phoneOrEmail, password },
        }
      );
    } catch (error: any) {
      // Extract the backend error message if available
      if (error.response?._data?.message) {
        throw new Error(error.response._data.message);
      }
      throw error;
    }

    if (!res.success) {
      throw new Error(res.message || 'Login failed');
    }

    return { token: res.data.token, refreshToken: res.data.refreshToken, user: res.data.user };
  }

  async getMe(): Promise<User> {
        // Token is injected automatically by useApiClient's onRequest interceptor.
    const apiClient = useApiClient();
    const res = await apiClient<{ success: boolean; data: { user: User } }>(
      API_ENDPOINTS.auth.me,
      { method: 'GET' }
    );

    if (!res.success) {
      throw new Error('Failed to fetch user profile');
    }

    return res.data.user;
  }

  async refresh(refreshToken: string): Promise<{ token: string; refreshToken: string; user: User }> {
    const apiClient = useApiClient();
    const res = await apiClient<{ success: boolean; data: { token: string; refreshToken: string; user: User } }>(
      API_ENDPOINTS.auth.refresh,
      { method: 'POST', body: { refreshToken } }
    );

    if (!res.success) {
      throw new Error('Failed to refresh session');
    }

    return { token: res.data.token, refreshToken: res.data.refreshToken, user: res.data.user };
  }

  async logout(refreshToken?: string | null): Promise<void> {
    // Call logout endpoint; swallow failures — logging out client-side must
    // succeed even if this request fails (offline, server error, etc.), and
    // callers (the auth store) call this without awaiting it, so a rejection
    // here would otherwise surface as an unhandled promise rejection.
    const apiClient = useApiClient();
    try {
      await apiClient<void>(API_ENDPOINTS.auth.logout, {
        method: 'POST',
        body: refreshToken ? { refreshToken } : {},
      });
    } catch (error) {
      console.warn('Server logout request failed:', error);
    }
  }
}

// Singleton instance — import this everywhere instead of constructing a new one.
export const authRepository = new AuthRepository();
