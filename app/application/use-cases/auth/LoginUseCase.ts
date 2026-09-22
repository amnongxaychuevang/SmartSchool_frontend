import type { IAuthRepository } from '../../../domain/repositories/IAuthRepository';
import type { User } from '../../../domain/models/User';

// Encapsulates the login business flow.
// Depends only on the domain interface — never on HTTP details.
export class LoginUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(
    phoneOrEmail: string,
    password: string
  ): Promise<{ token: string; refreshToken: string; user: User }> {
    if (!phoneOrEmail || !password) {
      throw new Error('Phone/email and password are required');
    }

    return this.authRepo.login(phoneOrEmail, password);
  }
}
