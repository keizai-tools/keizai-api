import { Inject, Injectable } from '@nestjs/common';

import { AuthRequestDto } from '@/modules/auth/interface/dto/auth-request.to.ts';

import { AuthMapper } from '../../interface/mapper/user.mapper';
import { ErrorMessage } from '../enum';
import {
  COGNITO_SERVICE,
  ICognitoService,
  IRegisterResult,
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

  async login(authLoginUserDto: AuthRequestDto) {
    const { username, password } = authLoginUserDto;
    try {
      return await this.cognitoService.loginAccount(username, password);
    } catch (error) {
      throw new Error(ErrorMessage.FAILED_LOGIN);
    }
  }

  async registerAccount(registerData: AuthRequestDto) {
    const { username, password } = registerData;
    let registeredUser: IRegisterResult;
    try {
      registeredUser = await this.cognitoService.registerAccount(
        username,
        password,
      );
    } catch (error) {
      console.log(error);
    }
    const newUser = {
      ...registeredUser,
    };
    const registeredUserDomain = this.authMapper.fromDtoToEntity(newUser);

    await this.userRepository.save(registeredUserDomain);

    return registeredUser;
  }

  async getOneByExternalId(id: number) {
    return await this.userRepository.findOne(id);
  }
}
