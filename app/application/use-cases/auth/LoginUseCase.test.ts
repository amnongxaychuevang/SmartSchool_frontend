import { describe, it, expect, vi } from 'vitest';
import { LoginUseCase } from './LoginUseCase';
import type { IAuthRepository } from '../../../domain/repositories/IAuthRepository';
import type { User } from '../../../domain/models/User';

function makeMockRepo(overrides: Partial<IAuthRepository> = {}): IAuthRepository {
  return {
    login: vi.fn(),
    getMe: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  };
}

const testUser: User = {
  userId: 1, fullNameEn: 'Admin', fullNameLo: 'ແອັດມິນ', role: 'admin', langPref: 'lo',
};

describe('LoginUseCase (frontend)', () => {
  it('delegates to the repository and returns its result on valid input', async () => {
    const repo = makeMockRepo({
      login: vi.fn().mockResolvedValue({ token: 't', refreshToken: 'r', user: testUser }),
    });
    const useCase = new LoginUseCase(repo);

    const result = await useCase.execute('admin@school.test', 'password');

    expect(repo.login).toHaveBeenCalledWith('admin@school.test', 'password');
    expect(result.user.userId).toBe(1);
    expect(result.refreshToken).toBe('r');
  });

  it('rejects before hitting the network when the identifier is empty', async () => {
    const repo = makeMockRepo();
    const useCase = new LoginUseCase(repo);

    await expect(useCase.execute('', 'password')).rejects.toThrow('required');
    expect(repo.login).not.toHaveBeenCalled();
  });

  it('rejects before hitting the network when the password is empty', async () => {
    const repo = makeMockRepo();
    const useCase = new LoginUseCase(repo);

    await expect(useCase.execute('admin@school.test', '')).rejects.toThrow('required');
    expect(repo.login).not.toHaveBeenCalled();
  });

  it('propagates a rejection from the repository (e.g. wrong password) unchanged', async () => {
    const repo = makeMockRepo({
      login: vi.fn().mockRejectedValue(new Error('Invalid credentials')),
    });
    const useCase = new LoginUseCase(repo);

    await expect(useCase.execute('admin@school.test', 'wrong')).rejects.toThrow('Invalid credentials');
  });
});
