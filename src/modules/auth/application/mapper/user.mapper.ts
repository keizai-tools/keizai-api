import { User } from '../../domain/user.domain';
import { IRegisterResult } from '../repository/cognito.interface.service.js';

export class AuthMapper {
  fromDtoToEntity(userData: IRegisterResult) {
    const { externalId, username } = userData;
    return new User(username, externalId);
  }
}
