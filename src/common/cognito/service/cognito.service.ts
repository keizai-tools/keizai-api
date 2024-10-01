import {
  AdminGetUserCommand,
  AuthFlowType,
  AuthenticationResultType,
  ChangePasswordCommand,
  ChangePasswordCommandInput,
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmForgotPasswordCommandInput,
  ConfirmSignUpCommand,
  ConfirmSignUpCommandInput,
  ForgotPasswordCommand,
  InitiateAuthCommand,
  InitiateAuthCommandInput,
  ResendConfirmationCodeCommand,
  SignUpCommand,
  SignUpCommandInput,
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
import { promises as fs } from 'fs';
import {
  IPromiseResponse,
  IResponseService,
  RESPONSE_SERVICE,
} from '@/common/response_service/interface/response.interface';

import { ChangePasswordDto } from '../application/dto/change_password.dto';
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
  private readonly cognitoClient: CognitoIdentityProviderClient;

  constructor(
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
  ) {
    this.responseService.setContext(CognitoService.name);
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_COGNITO_REGION,
      credentials: {
        accessKeyId: process.env.AWS_COGNITO_ACCESS_KEY,
        secretAccessKey: process.env.AWS_COGNITO_SECRET_KEY,
      },
      endpoint: process.env.AWS_COGNITO_ENDPOINT,
    });
  }

  async registerUser(
    userRegistrationDetails: UserRegistrationDetailsDto,
  ): IPromiseResponse<{ userSub: string }> {
    const { email, password } = userRegistrationDetails;

    if (!email || !password) {
      return this.responseService.createResponse({
        message: CognitoMessage.INVALID_PARAMETERS_ERROR,
        type: 'BAD_REQUEST',
      });
    }

    const signUpParams: SignUpCommandInput = {
      ClientId: process.env.AWS_COGNITO_CLIENT_ID,
      Username: email,
      Password: password,
      ValidationData: [{ Name: 'email', Value: email }],
      UserAttributes: [{ Name: 'email', Value: email }],
    };

    try {
      await this.cognitoClient.send(new SignUpCommand(signUpParams));

      const { payload } = await this.getUserSub(email);

      if (process.env.AWS_COGNITO_REGION === 'local')
        await this.confirmUserRegistration({
          email,
          confirmationCode: await this.getConfirmationCodeFromLocalPool(email),
        });

      return this.responseService.createResponse({
        message: CognitoMessage.USER_REGISTRATION_SUCCESS,
        type: 'CREATED',
        payload: {
          userSub: payload,
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async getUserSub(email: string): IPromiseResponse<string | null> {
    const params = {
      UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
      Username: email,
    };

    if (process.env.AWS_COGNITO_REGION === 'local') {
      const sub = await this.getUserSubLocal(email);
      if (sub) {
        return this.responseService.createResponse({
          message: CognitoMessage.USER_EXISTS,
          payload: sub,
          type: 'OK',
        });
      } else {
        return this.responseService.createResponse({
          message: CognitoMessage.USER_DOES_NOT_HAVE_A_SUB_ATTRIBUTE,
          payload: null,
          type: 'NOT_FOUND',
        });
      }
    }

    try {
      const command = new AdminGetUserCommand(params);
      const response = await this.cognitoClient.send(command);

      const subAttribute = response.UserAttributes?.find(
        (attribute) => attribute.Name === 'sub',
      );

      if (subAttribute) {
        return this.responseService.createResponse({
          message: CognitoMessage.USER_EXISTS,
          payload: subAttribute.Value,
          type: 'OK',
        });
      } else {
        return this.responseService.createResponse({
          message: CognitoMessage.USER_DOES_NOT_HAVE_A_SUB_ATTRIBUTE,
          payload: null,
          type: 'NOT_FOUND',
        });
      }
    } catch (error) {
      if (error.name === CognitoError.USER_NOT_FOUND_EXCEPTION) {
        return this.responseService.createResponse({
          message: CognitoMessage.USER_NOT_FOUND_ERROR,
          payload: null,
          type: 'NOT_FOUND',
        });
      } else {
        this.handleError(error);
      }
    }
  }

  async loginUser(
    userLoginCredentials: UserLoginCredentialsDto,
  ): IPromiseResponse<AuthenticationResultType> {
    const { email, password } = userLoginCredentials;
    const params: InitiateAuthCommandInput = {
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      ClientId: process.env.AWS_COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };

    try {
      const response = await this.cognitoClient.send(
        new InitiateAuthCommand(params),
      );
      return this.responseService.createResponse({
        message: CognitoMessage.USER_AUTHENTICATED_SUCCESS,
        payload: response.AuthenticationResult,
        type: 'OK',
      });
    } catch (error) {
      if (error.name === CognitoError.USER_NOT_CONFIRMED_EXCEPTION) {
        this.resendUserConfirmationCode({ email });
        throw new ForbiddenException(CognitoMessage.USER_NOT_CONFIRMED_ERROR);
      } else if (error.name === CognitoError.INVALID_PASSWORD_EXCEPTION) {
        throw new UnauthorizedException(CognitoMessage.INVALID_PASSWORD_ERROR);
      } else if (error.name === CognitoError.NOT_AUTHORIZED_EXCEPTION) {
        throw new BadRequestException(CognitoMessage.INVALID_PASSWORD_ERROR);
      } else if (
        error.name === CognitoError.PASSWORD_RESET_REQUIRED_EXCEPTION
      ) {
        throw new UnauthorizedException(
          CognitoMessage.NEW_PASSWORD_REQUIRED_ERROR,
        );
      } else if (error.name === CognitoError.USER_NOT_FOUND_EXCEPTION) {
        throw new UnauthorizedException(CognitoMessage.USER_NOT_FOUND_ERROR);
      } else {
        this.handleError(error);
      }
    }
  }

  async confirmUserRegistration(
    userConfirmationDetails: UserConfirmationDetailsDto,
  ): IPromiseResponse<void> {
    const { email, confirmationCode } = userConfirmationDetails;
    const params: ConfirmSignUpCommandInput = {
      ClientId: process.env.AWS_COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: confirmationCode,
    };

    try {
      await this.cognitoClient.send(new ConfirmSignUpCommand(params));
      return this.responseService.createResponse({
        message: CognitoMessage.USER_REGISTRATION_CONFIRMED_SUCCESS,
        type: 'OK',
      });
    } catch (error) {
      if (error.name === CognitoError.CODE_MISMATCH_EXCEPTION) {
        throw new UnauthorizedException(CognitoMessage.CODE_MISMATCH_ERROR);
      } else if (error.name === CognitoError.EXPIRED_CODE_EXCEPTION) {
        throw new BadRequestException(CognitoMessage.EXPIRED_CODE_ERROR);
      } else if (error.name === CognitoError.NOT_AUTHORIZED_EXCEPTION) {
        throw new BadRequestException(CognitoMessage.INVALID_CODE_ERROR);
      } else {
        this.handleError(error);
      }
    }
  }

  async resendUserConfirmationCode(
    resendConfirmationDetails: ResendConfirmationDetailsDto,
  ): IPromiseResponse<void> {
    const { email } = resendConfirmationDetails;
    const params = {
      ClientId: process.env.AWS_COGNITO_CLIENT_ID,
      Username: email,
    };

    try {
      const userStatus = await this.checkUserConfirmationStatus(email);
      if (userStatus === 'CONFIRMED') {
        return this.responseService.createResponse({
          message: CognitoMessage.USER_ALREADY_CONFIRMED,
          type: 'OK',
        });
      }

      await this.cognitoClient.send(new ResendConfirmationCodeCommand(params));
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
    const params = {
      ClientId: process.env.AWS_COGNITO_CLIENT_ID,
      Username: email,
    };

    try {
      await this.cognitoClient.send(new ForgotPasswordCommand(params));
      return this.responseService.createResponse({
        message: CognitoMessage.PASSWORD_RESET_INITIATED_SUCCESS,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async confirmPasswordReset(
    passwordResetConfirmation: PasswordResetConfirmationDto,
  ): IPromiseResponse<void> {
    const { email, newPassword, code } = passwordResetConfirmation;
    const params: ConfirmForgotPasswordCommandInput = {
      ClientId: process.env.AWS_COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
    };

    try {
      await this.cognitoClient.send(new ConfirmForgotPasswordCommand(params));
      return this.responseService.createResponse({
        message: CognitoMessage.PASSWORD_RESET_CONFIRMED_SUCCESS,
        type: 'OK',
      });
    } catch (error) {
      if (error.name === CognitoError.CODE_MISMATCH_EXCEPTION) {
        throw new UnauthorizedException(CognitoMessage.CODE_MISMATCH_ERROR);
      } else if (error.name === CognitoError.EXPIRED_CODE_EXCEPTION) {
        throw new BadRequestException(CognitoMessage.EXPIRED_CODE_ERROR);
      } else if (error.name === CognitoError.NOT_AUTHORIZED_EXCEPTION) {
        throw new BadRequestException(CognitoMessage.INVALID_CODE_ERROR);
      } else {
        this.handleError(error);
      }
    }
  }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
  ): IPromiseResponse<void> {
    const { accessToken, previousPassword, proposedPassword } =
      changePasswordDto;
    const params: ChangePasswordCommandInput = {
      AccessToken: accessToken,
      PreviousPassword: previousPassword,
      ProposedPassword: proposedPassword,
    };

    try {
      await this.cognitoClient.send(new ChangePasswordCommand(params));
      return this.responseService.createResponse({
        message: CognitoMessage.PASSWORD_CHANGED_SUCCESS,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async refreshSession(
    sessionRefreshDetails: SessionRefreshDetailsDto,
  ): IPromiseResponse<ICognitoRefreshSessionResponse> {
    const { refreshToken } = sessionRefreshDetails;
    const params: InitiateAuthCommandInput = {
      AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
      ClientId: process.env.AWS_COGNITO_CLIENT_ID,
      AuthParameters: { REFRESH_TOKEN: refreshToken },
    };

    try {
      const response = await this.cognitoClient.send(
        new InitiateAuthCommand(params),
      );
      return this.responseService.createResponse({
        message: CognitoMessage.SESSION_REFRESH_SUCCESS,
        payload: {
          accessToken: response.AuthenticationResult.AccessToken,
          idToken: response.AuthenticationResult.IdToken,
          refreshToken: response.AuthenticationResult.RefreshToken,
        },
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: ICognitoRequestError) {
    try {
      const { code, message } = error;

      if (message.includes(CognitoError.COGNITO_LOCAL_UNSUPPORTED)) {
        this.responseService.debug(message);
      } else if (code === CognitoError.LIMIT_EXCEEDED_EXCEPTION) {
        throw new InternalServerErrorException(
          CognitoMessage.LIMIT_EXCEEDED_ERROR,
        );
      } else if (code === CognitoError.INVALID_PARAMETER_EXCEPTION) {
        throw new BadRequestException(CognitoMessage.INVALID_PARAMETERS_ERROR);
      } else if (code === CognitoError.NOT_AUTHORIZED_EXCEPTION) {
        throw new UnauthorizedException(message);
      } else if (code === CognitoError.USER_NOT_FOUND_EXCEPTION) {
        throw new UnauthorizedException(CognitoMessage.USER_NOT_FOUND_ERROR);
      } else if (code === CognitoError.INVALID_PASSWORD_EXCEPTION) {
        throw new UnauthorizedException(CognitoMessage.INVALID_PASSWORD_ERROR);
      } else if (code === CognitoError.USERNAME_EXISTS_EXCEPTION) {
        throw new ConflictException(CognitoMessage.USERNAME_EXISTS_ERROR);
      } else {
        throw new InternalServerErrorException(CognitoMessage.GENERIC_ERROR);
      }
    } catch (err) {
      this.responseService.errorHandler({
        type: 'INTERNAL_SERVER_ERROR',
        error,
      });
    }
  }

  private async checkUserConfirmationStatus(email: string): Promise<string> {
    const params = {
      UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
      Username: email,
    };

    const user = await this.cognitoClient.send(new AdminGetUserCommand(params));
    return user.UserStatus;
  }

  private async getConfirmationCodeFromLocalPool(
    email: string,
  ): Promise<string | undefined> {
    try {
      const data: string = await fs.readFile(
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

  private async getUserSubLocal(email: string): Promise<string | null> {
    try {
      const data: string = await fs.readFile(
        process.env.COGNITO_LOCAL_PATH,
        'utf-8',
      );
      const jsonData: {
        Users: {
          [key: string]: {
            Attributes: Array<{
              Name: string;
              Value: string;
            }>;
          };
        };
      } = JSON.parse(data);

      const userAttributes = jsonData.Users?.[email]?.Attributes;

      const subAttribute = userAttributes?.find((attr) => attr.Name === 'sub');

      return subAttribute?.Value || null;
    } catch (err) {
      this.handleError(err);
    }
  }
}
