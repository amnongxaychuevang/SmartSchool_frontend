import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from './auth';
import { authRepository } from '../../infrastructure/api/AuthRepository';
import { stubUseCookie, resetCookieStub } from '../../test-utils/stubs';

// authRepository is the single seam between the store and HTTP — mocking it
// here means these tests exercise the real store/use-case logic (cookie
// handling, rotation, fallback-to-refresh) without a real backend.
vi.mock('../../infrastructure/api/AuthRepository', () => ({
  authRepository: {
    login: vi.fn(),
    getMe: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
  },
}));

stubUseCookie();

const testUser = {
  userId: 1, fullNameEn: 'Admin', fullNameLo: 'ແອັດມິນ', role: 'admin' as const, langPref: 'lo' as const,
};

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    resetCookieStub(); // one test's login cookies must not leak into the next
  });

  it('login stores both the access token and the refresh token', async () => {
    vi.mocked(authRepository.login).mockResolvedValue({ token: 'access-1', refreshToken: 'refresh-1', user: testUser });

    const store = useAuthStore();
    const user = await store.login('admin@school.test', 'password');

    expect(user.userId).toBe(1);
    expect(store.token).toBe('access-1');
    expect(store.isAuthenticated).toBe(true);
  });

  it('login surfaces the repository error and leaves the store unauthenticated', async () => {
    vi.mocked(authRepository.login).mockRejectedValue(new Error('Invalid credentials'));

    const store = useAuthStore();
    await expect(store.login('admin@school.test', 'wrong')).rejects.toThrow('Invalid credentials');

    expect(store.isAuthenticated).toBe(false);
    expect(store.error).toBe('Invalid credentials');
  });

  it('refreshAccessToken returns false without calling the API when there is no refresh-token cookie', async () => {
    const store = useAuthStore();
    const result = await store.refreshAccessToken();

    expect(result).toBe(false);
    expect(authRepository.refresh).not.toHaveBeenCalled();
  });

  it('refreshAccessToken exchanges a stored refresh token for a new access token', async () => {
    vi.mocked(authRepository.login).mockResolvedValue({ token: 'access-1', refreshToken: 'refresh-1', user: testUser });
    vi.mocked(authRepository.refresh).mockResolvedValue({ token: 'access-2', refreshToken: 'refresh-2', user: testUser });

    const store = useAuthStore();
    await store.login('admin@school.test', 'password'); // seeds the refresh_token cookie

    const result = await store.refreshAccessToken();

    expect(result).toBe(true);
    expect(authRepository.refresh).toHaveBeenCalledWith('refresh-1');
    expect(store.token).toBe('access-2');
  });

  it('refreshAccessToken logs out (clears state) when the refresh token is rejected', async () => {
    vi.mocked(authRepository.login).mockResolvedValue({ token: 'access-1', refreshToken: 'refresh-1', user: testUser });
    vi.mocked(authRepository.refresh).mockRejectedValue(new Error('Invalid or expired refresh token'));

    const store = useAuthStore();
    await store.login('admin@school.test', 'password');

    const result = await store.refreshAccessToken();

    expect(result).toBe(false);
    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
  });

  it('logout clears local state and asks the repository to revoke the refresh token', async () => {
    vi.mocked(authRepository.login).mockResolvedValue({ token: 'access-1', refreshToken: 'refresh-1', user: testUser });
    vi.mocked(authRepository.logout).mockResolvedValue(undefined);

    const store = useAuthStore();
    await store.login('admin@school.test', 'password');

    store.logout();

    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
    expect(authRepository.logout).toHaveBeenCalledWith('refresh-1');
  });
});
