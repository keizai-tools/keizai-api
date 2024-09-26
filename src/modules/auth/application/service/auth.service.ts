import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';

import { PasswordResetConfirmationDto } from '@/common/cognito/application/dto/password_reset_confirmation.dto';
import { PasswordResetRequestDto } from '@/common/cognito/application/dto/password_reset_request.dto';
import { ResendConfirmationDetailsDto } from '@/common/cognito/application/dto/resend_confirmation_details.dto';
import { SessionRefreshDetailsDto } from '@/common/cognito/application/dto/session_refresh_details.dto';
import { UserConfirmationDetailsDto } from '@/common/cognito/application/dto/user_confirmation_details.dto';
import { UserLoginCredentialsDto } from '@/common/cognito/application/dto/user_login_credentials.dto';
import { UserRegistrationDetailsDto } from '@/common/cognito/application/dto/user_registration_details.dto';
import { CognitoMessage } from '@/common/cognito/application/enum/cognito.enum';
import {
  COGNITO_AUTH,
  ICognitoAuthService,
} from '@/common/cognito/application/interface/cognito.service.interface';
import { ICognitoRefreshSessionResponse } from '@/common/cognito/application/interface/cognito_refresh_session_response.interface';
import {
  IPromiseResponse,
  IResponseService,
  RESPONSE_SERVICE,
} from '@/common/response_service/interface/response.interface';
import {
  IUserService,
  USER_SERVICE,
} from '@/modules/user/application/interfaces/user.service.interfaces';
import { User } from '@/modules/user/domain/user.domain';

import { ChangePasswordDto } from '../dto/change_password.dto';
import { LoginResponse } from '../interface/authentication.service.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject(COGNITO_AUTH)
    private readonly identityProviderService: ICognitoAuthService,
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
    @Inject(USER_SERVICE)
    private readonly userService: IUserService,
  ) {
    this.responseService.setContext(AuthService.name);
  }

  async changePassword(
    changePasswordDetails: ChangePasswordDto,
    user: User,
    accessToken: string,
  ): IPromiseResponse<void> {
    try {
      await this.userService.getUserByEmail(user.email);

      const { message, type, payload } =
        await this.identityProviderService.changePassword({
          ...changePasswordDetails,
          accessToken,
        });

      return this.responseService.createResponse({
        type,
        message,
        payload,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async registerUser(
    userRegistrationDetails: UserRegistrationDetailsDto,
  ): IPromiseResponse<User> {
    try {
      const { email, password } = userRegistrationDetails;
      const userExists = await this.validateUserExists({ email });
      const { payload } = await this.handleUserRegistration({
        email,
        userExists,
        password,
      });
      return this.responseService.createResponse({
        type: 'CREATED',
        message: CognitoMessage.USER_REGISTRATION_SUCCESS,
        payload,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async loginUser({
    email,
    password,
  }: UserLoginCredentialsDto): IPromiseResponse<LoginResponse> {
    try {
      const userExists = await this.validateUserExists({ email });

      await this.handleUserRegistration({
        email,
        userExists,
        password,
        login: true,
      });
      const { payload: user } = await this.userService.getUserByEmail(email);
      const { payload, type, message } =
        await this.identityProviderService.loginUser({
          email,
          password,
        });
      return this.responseService.createResponse({
        type,
        message,
        payload: {
          accessToken: payload.AccessToken,
          expiresIn: payload.ExpiresIn,
          tokenType: payload.TokenType,
          refreshToken: payload.RefreshToken,
          idToken: payload.IdToken,
          newDeviceMetadata: payload.NewDeviceMetadata,
          user,
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async resendUserConfirmationCode(
    resendConfirmationDetails: ResendConfirmationDetailsDto,
  ): IPromiseResponse<void> {
    try {
      const { email } = resendConfirmationDetails;
      await this.userService.getUserByEmail(email);

      const { message, type } =
        await this.identityProviderService.resendUserConfirmationCode(
          resendConfirmationDetails,
        );

      return this.responseService.createResponse({
        type,
        message,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async initiatePasswordReset(
    passwordResetRequest: PasswordResetRequestDto,
  ): IPromiseResponse<void> {
    try {
      const { email } = passwordResetRequest;
      await this.userService.getUserByEmail(email);

      const { message, type } =
        await this.identityProviderService.initiatePasswordReset(
          passwordResetRequest,
        );
      return this.responseService.createResponse({
        type,
        message,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async confirmPasswordReset(
    passwordResetConfirmation: PasswordResetConfirmationDto,
  ): IPromiseResponse<void> {
    try {
      const { email } = passwordResetConfirmation;
      await this.userService.getUserByEmail(email);

      const { message, type } =
        await this.identityProviderService.confirmPasswordReset(
          passwordResetConfirmation,
        );
      return this.responseService.createResponse({
        type,
        message,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async confirmUserRegistration(
    userConfirmationDetails: UserConfirmationDetailsDto,
  ): IPromiseResponse<User> {
    try {
      const { email, confirmationCode } = userConfirmationDetails;
      await this.userService.getUserByEmail(email);
      await this.identityProviderService.confirmUserRegistration({
        email,
        confirmationCode,
      });

      const { payload } = await this.userService.getUserByEmail(email);

      return this.responseService.createResponse({
        type: 'OK',
        message: 'User successfully confirmed',
        payload: payload,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async refreshUserSession(
    sessionRefreshDetails: SessionRefreshDetailsDto,
  ): IPromiseResponse<ICognitoRefreshSessionResponse> {
    try {
      const { email } = sessionRefreshDetails;
      await this.userService.getUserByEmail(email);

      const { payload, type, message } =
        await this.identityProviderService.refreshSession(
          sessionRefreshDetails,
        );

      return this.responseService.createResponse({
        type,
        message,
        payload,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  private async validateUserExists({
    email,
  }: {
    email: string;
  }): Promise<{ cognito: boolean; local: boolean }> {
    const localUser = await this.userService.getUserByEmail(email);
    const cognitoUserSub = await this.identityProviderService.getUserSub(email);
    return {
      local: !!localUser?.payload,
      cognito: !!cognitoUserSub?.payload,
    };
  }

  private async handleUserRegistration({
    email,
    userExists: { cognito, local },
    password,
    login = false,
  }: {
    email: string;
    userExists: { cognito: boolean; local: boolean };
    password: string;
    login?: boolean;
  }): IPromiseResponse<User> {
    try {
      if (cognito && local && !login) {
        throw new ConflictException('User already exists');
      }
      if (cognito && !local) {
        return await this.userService.createUser({
          email,
          externalId: (
            await this.identityProviderService.getUserSub(email)
          ).payload,
        });
      }

      if (local && !cognito) {
        const response = await this.identityProviderService.registerUser({
          email,
          password,
        });
        const userSub = response?.payload?.userSub;

        if (!userSub) {
          throw new BadRequestException('User not registered in Cognito');
        }
        const localUser = await this.userService.getUserByEmail(email);

        await this.userService.updateUser(
          { email, externalId: userSub },
          localUser.payload,
        );

        return await this.userService.getUserByEmail(email);
      }

      if (login) {
        return await this.userService.getUserByEmail(email);
      }

      return await this.registerUserInBothProviders({ email, password });
    } catch (error) {
      this.handleError(error);
    }
  }

  private async registerUserInBothProviders({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<IPromiseResponse<User>> {
    try {
      const response = await this.identityProviderService.registerUser({
        email,
        password,
      });

      const userSub = response.payload.userSub;

      await this.userService.createUser({
        email,
        externalId: userSub,
      });

      return await this.userService.getUserByEmail(email);
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: Error): void {
    this.responseService.errorHandler({
      type: 'INTERNAL_SERVER_ERROR',
      error,
    });
  }
}
