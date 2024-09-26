import { User } from '../../domain/user.domain';

export interface IUpdateUserResponse {
  oldUser: User;
  newUser: User;
}
