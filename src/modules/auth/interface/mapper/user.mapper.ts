import { ISignUpResult } from 'amazon-cognito-identity-js';

import { User } from '../../domain/user.entity.js';

export function fromDtoToEntity(req: ISignUpResult): User {
  const user = new User();
  user.email = req.user.getUsername();
  user.externalId = req.userSub;

  return user;
}
