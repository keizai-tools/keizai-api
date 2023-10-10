import { CreateUserDto } from '../../application/dto/create-user.dto.js';
import { User } from '../../domain/user.entity.js';

export class AuthMapper {
  fromDtoToEntity(userData: CreateUserDto) {
    const { externalId, username } = userData;
    return new User(username, externalId);
  }
}
