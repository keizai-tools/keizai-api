import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  ISignUpResult,
} from 'amazon-cognito-identity-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

import {
  ICognitoService,
  ILoginResult,
} from '../../application/repository/cognito.interface.service.js';

interface IRegisterResult {
  externalId: string;
  username: string;
}

dotenv.config();

enum ENVIRONMENT {
  DEVELOPMENT = 'development',
}

@Injectable()
export class CognitoService implements ICognitoService {
  private userPool: CognitoUserPool;

  constructor(configService: ConfigService) {
    this.userPool = new CognitoUserPool({
      UserPoolId: configService.get('AWS_COGNITO_USER_POOL_ID'),
      ClientId: configService.get('AWS_COGNITO_CLIENT_ID'),
      endpoint: configService.get('AWS_COGNITO_ENDPOINT'),
    });
  }
  async registerAccount(
    email: string,
    password: string,
  ): Promise<IRegisterResult> {
    try {
      const signUpResult: ISignUpResult = await new Promise(
        (resolve, reject) => {
          this.userPool.signUp(email, password, null, null, (err, result) => {
            if (!result) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        },
      );

      if (process.env.NODE_ENV === ENVIRONMENT.DEVELOPMENT) {
        this.confirmAccount(email, signUpResult);
      }

      return {
        externalId: signUpResult.userSub,
        username: email,
      };
    } catch (error) {
      return error;
    }
  }

  async confirmAccount(
    email: string,
    signUpResult: ISignUpResult,
  ): Promise<void> {
    const userConfirmationCode = await this.getConfirmationCodeFromLocalPool(
      email,
    );
    if (userConfirmationCode) {
      signUpResult.user.confirmRegistration(
        userConfirmationCode,
        false,
        function (err, result) {
          if (err) {
            throw err;
          }
          return result;
        },
      );
    }
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

  private async getConfirmationCodeFromLocalPool(
    email: string,
  ): Promise<string | undefined> {
    try {
      const data: string = fs.readFileSync(
        process.env.COGNITO_LOCAL_PATH,
        'utf-8',
      );
      const jsonData: any = JSON.parse(data);
      const code: string | undefined =
        jsonData.Users?.[email]?.ConfirmationCode;
      return code;
    } catch (err) {
      throw err;
    }
  }
}
