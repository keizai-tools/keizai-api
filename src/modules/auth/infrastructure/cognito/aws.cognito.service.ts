import { Injectable } from '@nestjs/common';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} from 'amazon-cognito-identity-js';

import { AuthRequestDto } from '../../interface/dto/auth-request.to.ts.js';

interface IRegisterResult {
  externalId: string;
  username: string;
}

@Injectable()
export class CognitoService {
  private userPool: CognitoUserPool;

  constructor() {
    this.userPool = new CognitoUserPool({
      UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
      ClientId: process.env.AWS_COGNITO_CLIENT_ID,
    });
  }

  async registerUser(
    registerRequestDto: AuthRequestDto,
  ): Promise<IRegisterResult> {
    const { email, password } = registerRequestDto;

    return new Promise((resolve, reject) => {
      this.userPool.signUp(email, password, null, null, (err, result) => {
        if (!result) {
          console.log(err);
          reject(err);
        } else {
          console.log(result);
          resolve({
            externalId: result.userSub,
            username: result.user.getUsername(),
          });
        }
      });
    });
  }

  async loginAccount(authLoginUserDto: AuthRequestDto) {
    const { email, password } = authLoginUserDto;
    const userData = {
      Username: email,
      Pool: this.userPool,
    };

    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const userCognito = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
      userCognito.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          resolve({
            accessToken: result.getAccessToken().getJwtToken(),
            refreshToken: result.getRefreshToken().getToken(),
          });
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }
}
