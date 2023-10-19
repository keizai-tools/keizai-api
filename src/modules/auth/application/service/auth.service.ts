import { Inject, Injectable } from '@nestjs/common';

import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { COGNITO_RESPONSE } from '../enum/cognito.enum';
import { AuthMapper } from '../mapper/user.mapper';
import {
  COGNITO_SERVICE,
  ICognitoService,
} from '../repository/cognito.interface.service';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../repository/user.repository.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(COGNITO_SERVICE) private readonly cognitoService: ICognitoService,
    @Inject(AuthMapper) private readonly authMapper: AuthMapper,
  ) {}

  async login(authLoginUserDto: LoginUserDto) {
    const { username, password } = authLoginUserDto;
    try {
      return await this.cognitoService.loginAccount(username, password);
    } catch (error) {
      throw new Error(COGNITO_RESPONSE.FAILED_LOGIN);
    }
  }

  async registerAccount(registerData: CreateUserDto) {
    const { username, password } = registerData;
    try {
      const registeredUser = await this.cognitoService.registerAccount(
        username,
        password,
      );
      const userMapped = this.authMapper.fromDtoToEntity(registeredUser);

      await this.userRepository.save(userMapped);

      return registeredUser;
    } catch (error) {
      console.log(error);
    }
  }

  async findOneByexternalId(id: string) {
    const userResponse = await this.userRepository.findOneByexternalId(id);
    if (!userResponse) {
      throw new Error(COGNITO_RESPONSE.FAILED_LOGIN);
    }

    return userResponse;
  }
}
