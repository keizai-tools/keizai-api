import { Injectable } from '@nestjs/common';

import { User } from '../../domain/user.domain';
import { CreateUserDto } from '../dto/create_user.dto';
import { IUserMapper } from '../interfaces/user.mapper.interfaces';

@Injectable()
export class UserMapper implements IUserMapper {
  fromDtoToEntity(userDto: CreateUserDto): User {
    const newUser = new User(userDto.email, userDto.externalId);
    newUser.externalId = userDto.externalId;
    return newUser;
  }
}
