import {
  AdminGetUserCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AuthenticationDetails,
  CognitoRefreshToken,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
  ISignUpResult,
} from 'amazon-cognito-identity-js';
import * as fs from 'fs';

import { ENVIRONMENT } from '@/common/base/enum/common.enum';
import {
  IPromiseResponse,
  IResponseService,
  RESPONSE_SERVICE,
} from '@/common/response_service/interface/response.interface';

import { PasswordResetConfirmationDto } from '../application/dto/password_reset_confirmation.dto';
import { PasswordResetRequestDto } from '../application/dto/password_reset_request.dto';
import { ResendConfirmationDetailsDto } from '../application/dto/resend_confirmation_details.dto';
import { SessionRefreshDetailsDto } from '../application/dto/session_refresh_details.dto';
import { UserConfirmationDetailsDto } from '../application/dto/user_confirmation_details.dto';
import { UserLoginCredentialsDto } from '../application/dto/user_login_credentials.dto';
import { UserRegistrationDetailsDto } from '../application/dto/user_registration_details.dto';
import { CognitoError, CognitoMessage } from '../application/enum/cognito.enum';
import { ICognitoAuthService } from '../application/interface/cognito.service.interface';
import { ICognitoRefreshSessionResponse } from '../application/interface/cognito_refresh_session_response.interface';
import { ICognitoRequestError } from '../application/interface/cognito_request_error.interface';

@Injectable()
export class CognitoService implements ICognitoAuthService {
  private readonly userPool: CognitoUserPool;
  private readonly cognitoClient: CognitoIdentityProviderClient;

  constructor(
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
  ) {
    this.responseService.setContext(CognitoService.name);
    this.userPool = new CognitoUserPool({
      UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
      ClientId: process.env.AWS_COGNITO_CLIENT_ID,
      endpoint: process.env.AWS_COGNITO_ENDPOINT,
    });
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_COGNITO_REGION,
      credentials: {
        accessKeyId: process.env.AWS_COGNITO_ACCESS_KEY,
        secretAccessKey: process.env.AWS_COGNITO_SECRET_KEY,
      },
    });
  }

  async getUserSub(email: string): IPromiseResponse<string | null> {
    const params = {
      UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
      Username: email,
    };

    if (process.env.AWS_COGNITO_REGION === 'local') {
      return this.responseService.createResponse({
        message: 'User not found',
        payload: null,
        type: 'NOT_FOUND',
      });
    }
    try {
      const command = new AdminGetUserCommand(params);
      const response = await this.cognitoClient.send(command);

      const subAttribute = response.UserAttributes?.find(
        (attribute) => attribute.Name === 'sub',
      );

      if (subAttribute) {
        return this.responseService.createResponse({
          message: 'User exists',
          payload: subAttribute.Value,
          type: 'OK',
        });
      } else {
        return this.responseService.createResponse({
          message: 'User does not have a sub attribute',
          payload: null,
          type: 'NOT_FOUND',
        });
      }
    } catch (error) {
      if (error.name === 'UserNotFoundException') {
        return this.responseService.createResponse({
          message: 'User not found',
          payload: null,
          type: 'NOT_FOUND',
        });
      } else {
        this.handleError(error);
      }
    }
  }

  async registerUser(
    userRegistrationDetails: UserRegistrationDetailsDto,
  ): IPromiseResponse<ISignUpResult> {
    const { email, password } = userRegistrationDetails;
    const attributeList = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
    ];

    try {
      const result: ISignUpResult = await new Promise((resolve, reject) => {
        this.userPool.signUp(
          email,
          password,
          attributeList,
          null,
          (error: ICognitoRequestError | null, result) => {
            if (!error) {
              return resolve(result);
            } else if (error.code === CognitoError.INVALID_PASSWORD_EXCEPTION) {
              return reject(
                new BadRequestException(
                  CognitoMessage.PASSWORD_VALIDATION_ERROR,
                ),
              );
            } else if (error.code === CognitoError.USERNAME_EXISTS_EXCEPTION) {
              return reject(
                new ConflictException(CognitoMessage.USER_EXISTS_ERROR),
              );
            } else {
              return reject(new InternalServerErrorException(error.message));
            }
          },
        );
      });

      if (
        (process.env.NODE_ENV === ENVIRONMENT.DEVELOPMENT ||
          process.env.NODE_ENV === ENVIRONMENT.AUTOMATED_TEST) &&
        process.env.COGNITO_POOL_TYPE === ENVIRONMENT.DEVELOPMENT
      ) {
        this.confirmUserRegistration({
          email,
          confirmationCode: await this.getConfirmationCodeFromLocalPool(email),
        });
      }

      return this.responseService.createResponse({
        message: CognitoMessage.USER_REGISTERED_SUCCESS,
        payload: result,
        type: 'CREATED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async loginUser(
    userLoginCredentials: UserLoginCredentialsDto,
  ): IPromiseResponse<CognitoUserSession> {
    const { email, password } = userLoginCredentials;

    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const userCognito = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    try {
      userCognito.setAuthenticationFlowType('USER_PASSWORD_AUTH');

      const session: CognitoUserSession = await new Promise(
        (resolve, reject) => {
          userCognito.authenticateUser(authenticationDetails, {
            onSuccess: (result) => {
              return resolve(result);
            },
            onFailure: (error: ICognitoRequestError) => {
              if (error.code === CognitoError.USER_NOT_CONFIRMED_EXCEPTION) {
                return reject(
                  new ForbiddenException(
                    CognitoMessage.USER_NOT_CONFIRMED_ERROR,
                  ),
                );
              } else if (
                error.code === CognitoError.INVALID_PASSWORD_EXCEPTION
              ) {
                return reject(
                  new UnauthorizedException(
                    CognitoMessage.INVALID_PASSWORD_ERROR,
                  ),
                );
              } else if (error.code === CognitoError.NOT_AUTHORIZED_EXCEPTION) {
                return reject(
                  new BadRequestException(
                    CognitoMessage.INVALID_PASSWORD_ERROR,
                  ),
                );
              } else if (
                error.code === CognitoError.PASSWORD_RESET_REQUIRED_EXCEPTION
              ) {
                return reject(
                  new UnauthorizedException(
                    CognitoMessage.NEW_PASSWORD_REQUIRED_ERROR,
                  ),
                );
              } else if (error.code === CognitoError.USER_NOT_FOUND_EXCEPTION) {
                return reject(
                  new UnauthorizedException(
                    CognitoMessage.USER_NOT_FOUND_ERROR,
                  ),
                );
              } else if (
                error.code === CognitoError.INVALID_PARAMETER_EXCEPTION
              ) {
                return reject(
                  new UnauthorizedException(CognitoMessage.INVALID_CODE_ERROR),
                );
              } else {
                return reject(new InternalServerErrorException(error.code));
              }
            },
            newPasswordRequired: () => {
              return reject(
                new UnauthorizedException(
                  CognitoMessage.NEW_PASSWORD_REQUIRED_ERROR,
                ),
              );
            },
          });
        },
      );
      return this.responseService.createResponse({
        message: CognitoMessage.USER_AUTHENTICATED_SUCCESS,
        payload: session,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async confirmUserRegistration(
    userConfirmationDetails: UserConfirmationDetailsDto,
  ): IPromiseResponse<void> {
    const { email, confirmationCode } = userConfirmationDetails;

    const userCognito = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    try {
      await new Promise<void>((resolve, reject) => {
        userCognito.confirmRegistration(
          confirmationCode,
          true,
          (error: ICognitoRequestError | null) => {
            if (!error) {
              return resolve();
            } else if (error?.code === CognitoError.CODE_MISMATCH_EXCEPTION) {
              return reject(
                new UnauthorizedException(CognitoMessage.CODE_MISMATCH_ERROR),
              );
            } else if (error?.code === CognitoError.EXPIRED_CODE_EXCEPTION) {
              return reject(
                new BadRequestException(CognitoMessage.EXPIRED_CODE_ERROR),
              );
            } else if (error?.code === CognitoError.NOT_AUTHORIZED_EXCEPTION) {
              return reject(
                new BadRequestException(CognitoMessage.INVALID_CODE_ERROR),
              );
            } else {
              return reject(new InternalServerErrorException(error.code));
            }
          },
        );
      });
      return this.responseService.createResponse({
        message: CognitoMessage.USER_REGISTRATION_CONFIRMED_SUCCESS,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async resendUserConfirmationCode(
    resendConfirmationDetails: ResendConfirmationDetailsDto,
  ): IPromiseResponse<void> {
    const { email } = resendConfirmationDetails;

    const userCognito = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    try {
      await new Promise<void>((resolve, reject) => {
        userCognito.resendConfirmationCode(
          (err: ICognitoRequestError | null) => {
            if (err) {
              return reject(new InternalServerErrorException(err.code));
            }

            return resolve();
          },
        );
      });
      return this.responseService.createResponse({
        message: CognitoMessage.CONFIRMATION_CODE_RESENT_SUCCESS,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async initiatePasswordReset(
    passwordResetRequest: PasswordResetRequestDto,
  ): IPromiseResponse<void> {
    const { email } = passwordResetRequest;

    const userCognito = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    try {
      await new Promise<void>((resolve, reject) => {
        userCognito.forgotPassword({
          onSuccess: () => {
            return resolve();
          },
          onFailure: (error: ICognitoRequestError) => {
            return reject(new InternalServerErrorException(error.code));
          },
        });
      });
      return this.responseService.createResponse({
        message: CognitoMessage.PASSWORD_RESET_SUCCESS,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async confirmPasswordReset(
    passwordResetConfirmation: PasswordResetConfirmationDto,
  ): IPromiseResponse<void> {
    const { email, code, newPassword } = passwordResetConfirmation;
    const userCognito = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    try {
      await new Promise((resolve, reject) => {
        userCognito.confirmPassword(code, newPassword, {
          onSuccess: (result) => {
            return resolve(result);
          },
          onFailure: (error: ICognitoRequestError) => {
            if (error.code === CognitoError.CODE_MISMATCH_EXCEPTION) {
              return reject(
                new UnauthorizedException(CognitoMessage.CODE_MISMATCH_ERROR),
              );
            } else if (error.code === CognitoError.EXPIRED_CODE_EXCEPTION) {
              return reject(
                new BadRequestException(CognitoMessage.EXPIRED_CODE_ERROR),
              );
            } else if (error.code === CognitoError.INVALID_PASSWORD_EXCEPTION) {
              return reject(
                new BadRequestException(
                  CognitoMessage.PASSWORD_VALIDATION_ERROR,
                ),
              );
            } else {
              return reject(new InternalServerErrorException(error.code));
            }
          },
        });
      });
      return this.responseService.createResponse({
        message: CognitoMessage.PASSWORD_RESET_CONFIRMATION_SUCCESS,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async refreshUserSession(
    sessionRefreshDetails: SessionRefreshDetailsDto,
  ): IPromiseResponse<ICognitoRefreshSessionResponse> {
    const { email, refreshToken } = sessionRefreshDetails;
    try {
      const userData = {
        Username: email,
        Pool: this.userPool,
      };
      const userCognito: CognitoUser = new CognitoUser(userData);
      const token = new CognitoRefreshToken({ RefreshToken: refreshToken });

      const session: ICognitoRefreshSessionResponse = await new Promise(
        (resolve, reject) => {
          userCognito.refreshSession(
            token,
            (
              error: ICognitoRequestError | null,
              result: ICognitoRefreshSessionResponse,
            ) => {
              if (!error) {
                return resolve(result);
              } else if (error.code === CognitoError.NOT_AUTHORIZED_EXCEPTION) {
                return reject(
                  new UnauthorizedException(
                    CognitoMessage.INVALID_REFRESH_TOKEN_ERROR,
                  ),
                );
              } else {
                return reject(new InternalServerErrorException(error.code));
              }
            },
          );
        },
      );
      return this.responseService.createResponse({
        message: CognitoMessage.SESSION_REFRESHED_SUCCESS,
        payload: session,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  private async getConfirmationCodeFromLocalPool(
    email: string,
  ): Promise<string | undefined> {
    try {
      const data: string = fs.readFileSync(
        process.env.COGNITO_LOCAL_PATH,
        'utf-8',
      );
      const jsonData: {
        Users: {
          [key: string]: {
            ConfirmationCode: string;
          };
        };
      } = JSON.parse(data);
      const code: string | undefined =
        jsonData.Users?.[email]?.ConfirmationCode;
      return code;
    } catch (err) {
      this.handleError(err);
    }
  }

  private handleError(error: Error): void {
    this.responseService.errorHandler({
      type: 'INTERNAL_SERVER_ERROR',
      error,
    });
  }
}
