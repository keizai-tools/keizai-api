import { User } from '../../domain/user.domain';
import { CreateUserDto } from '../dto/create_user.dto';
import { UpdateUserDto } from '../dto/update_user.dto';

export const USER_MAPPER = 'USER_MAPPER';

export interface IUserMapper {
  fromDtoToEntity(userDto: CreateUserDto | UpdateUserDto): User;
}
