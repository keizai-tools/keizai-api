import { User } from '../../domain/user.domain';

export interface IUserController {
  getMe(user: User): Promise<User>;
}
