import type { User } from '../models/User';

// The contract that any auth data source must fulfil.
// Infrastructure implements this; Application depends on it.
export interface IAuthRepository {
  /**
   * Authenticate with credentials.
   * Returns a short-lived access token, a long-lived refresh token, and the
   * authenticated user on success.
   */
  login(phoneOrEmail: string, password: string): Promise<{ token: string; refreshToken: string; user: User }>;

  /**
   * Fetch the currently authenticated user using the stored token.
   */
  getMe(): Promise<User>;

  /**
   * Exchanges a still-valid refresh token for a new access token (and a
   * rotated refresh token — the old one stops working after this call).
   */
  refresh(refreshToken: string): Promise<{ token: string; refreshToken: string; user: User }>;

  /**
   * Revokes the given refresh token server-side, ending that session.
   */
  logout(refreshToken?: string | null): Promise<void>;
}
