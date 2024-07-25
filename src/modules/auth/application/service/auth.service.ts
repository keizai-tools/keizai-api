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
import {
  COGNITO_AUTH,
  ICognitoAuthService,
} from '@/common/cognito/application/interface/cognito.service.interface';
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

import { IAuthService } from '../interface/auth.service.interface';

@Injectable()
export class AuthService implements IAuthService {
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

  async registerUser(
    userRegistrationDetails: UserRegistrationDetailsDto,
  ): IPromiseResponse<User> {
    try {
      const { email, password } = userRegistrationDetails;
      const { payload } = await this.userService.getUserByEmail(email);
      if (payload !== null) {
        throw new ConflictException('User already exists');
      }
      const result = await this.identityProviderService.registerUser({
        email,
        password,
      });

      return await this.userService.createUser({
        ...userRegistrationDetails,
        externalId: result.payload.userSub,
      });
    } catch (error) {
      if (error.message !== 'User not found') {
        this.handleError(error);
      }
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

  async loginUser(
    userLoginCredentials: UserLoginCredentialsDto,
  ): IPromiseResponse<{
    accessToken: string;
    refreshToken: string;
    user: User;
  }> {
    try {
      const { email, password } = userLoginCredentials;
      const { payload: user } = await this.userService.getUserByEmail(email);

      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (!user.isVerified) {
        throw new ConflictException('User not verified');
      }

      const { payload, type, message } =
        await this.identityProviderService.loginUser({
          email,
          password,
        });

      return this.responseService.createResponse({
        type,
        message,
        payload: {
          accessToken: payload.getAccessToken().getJwtToken(),
          refreshToken: payload.getRefreshToken().getToken(),
          user,
        },
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

      const { payload, type, message } = await this.userService.updateUser({
        email: email,
        isVerified: true,
      });

      return this.responseService.createResponse({
        type,
        message,
        payload: payload.newUser,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async refreshUserSession(
    sessionRefreshDetails: SessionRefreshDetailsDto,
  ): IPromiseResponse<{
    accessToken: string;
  }> {
    try {
      const { email } = sessionRefreshDetails;
      await this.userService.getUserByEmail(email);

      const { payload, type, message } =
        await this.identityProviderService.refreshUserSession(
          sessionRefreshDetails,
        );

      return this.responseService.createResponse({
        type,
        message,
        payload: {
          accessToken: payload.idToken.jwtToken,
        },
      });
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
