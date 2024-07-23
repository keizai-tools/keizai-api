import { User } from '@/modules/auth/domain/user.domain';

export interface IUpdateUserResponse {
  oldUser: User;
  newUser: User;
}
