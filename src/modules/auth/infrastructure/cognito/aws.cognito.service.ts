import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} from 'amazon-cognito-identity-js';
import * as dotenv from 'dotenv';

import {
  ICognitoService,
  ILoginResult,
} from '../../application/repository/cognito.interface.service.js';

interface IRegisterResult {
  externalId: string;
  username: string;
}

dotenv.config();

@Injectable()
export class CognitoService implements ICognitoService {
  private userPool: CognitoUserPool;

  constructor(configService: ConfigService) {
    this.userPool = new CognitoUserPool({
      UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
      ClientId: process.env.AWS_COGNITO_CLIENT_ID,
      endpoint: configService.get('AWS_COGNITO_ENDPOINT'),
    });
  }
  registerAccount(email: string, password: string): Promise<IRegisterResult> {
    return new Promise((resolve, reject) => {
      this.userPool.signUp(email, password, null, null, (error, result) => {
        if (!result) {
          reject(error);
        } else {
          resolve({
            externalId: result.userSub,
            username: result.user.getUsername(),
          });
        }
      });
    });
  }

  loginAccount(email: string, password: string): Promise<ILoginResult> {
    const userData = {
      Username: email,
      Pool: this.userPool,
    };

    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const cognitoUser = new CognitoUser(userData);

    const authenticationFlowType = 'USER_PASSWORD_AUTH';

    return new Promise((resolve, reject) => {
      cognitoUser.setAuthenticationFlowType(authenticationFlowType);
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          resolve({
            accessToken: result.getAccessToken().getJwtToken(),
            refreshToken: result.getRefreshToken().getToken(),
          });
        },
        onFailure: (error) => {
          reject(error);
        },
      });
    });
  }
}
