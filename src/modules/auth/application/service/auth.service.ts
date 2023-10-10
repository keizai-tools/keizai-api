import { Inject, Injectable } from '@nestjs/common';

import { AuthRequestDto } from '@/modules/auth/interface/dto/auth-request.to.ts';

// import { mapRequestToEntity } from '../../interface/mapper/user.mapper';
import { ErrorMessage } from '../enum';
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
  ) {}

  async login(authLoginUserDto: AuthRequestDto) {
    try {
      return await this.cognitoService.loginAccount(authLoginUserDto);
    } catch (error) {
      throw new Error(ErrorMessage.FAILED_LOGIN);
    }
  }

  async register(authRegisterUserDto: AuthRequestDto) {
    try {
      const userCognito = await this.cognitoService.registerUser(
        authRegisterUserDto,
      );
      // return this.userRepository.save(mapRequestToEntity(userCognito));
      console.log('userCognito', '\n', userCognito);
      return userCognito;
    } catch (error) {
      // throw new Error(ErrorMessage.FAILED_REGISTER);
      console.log(error);
    }
  }

  async getOneByExternalId(id: number) {
    return await this.userRepository.findOne(id);
  }
}
