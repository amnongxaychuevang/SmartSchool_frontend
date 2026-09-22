import type { IAuthRepository } from '../../../domain/repositories/IAuthRepository';
import type { User } from '../../../domain/models/User';

// Encapsulates fetching the authenticated user's profile.
export class FetchMeUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(): Promise<User> {
    return this.authRepo.getMe();
  }
}
