import { Body, Controller, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ChangePasswordDto } from '@/common/cognito/application/dto/change_password.dto';
import { PasswordResetConfirmationDto } from '@/common/cognito/application/dto/password_reset_confirmation.dto';
import { PasswordResetRequestDto } from '@/common/cognito/application/dto/password_reset_request.dto';
import { ResendConfirmationDetailsDto } from '@/common/cognito/application/dto/resend_confirmation_details.dto';
import { SessionRefreshDetailsDto } from '@/common/cognito/application/dto/session_refresh_details.dto';
import { UserConfirmationDetailsDto } from '@/common/cognito/application/dto/user_confirmation_details.dto';
import { UserLoginCredentialsDto } from '@/common/cognito/application/dto/user_login_credentials.dto';
import { UserRegistrationDetailsDto } from '@/common/cognito/application/dto/user_registration_details.dto';
import { IPromiseResponse } from '@/common/response_service/interface/response.interface';
import { Auth } from '@/modules/auth/application/decorator/auth.decorator';
import { User } from '@/modules/user/domain/user.domain';

import { AuthenticationService } from '../application/service/authentication.service';
import { AuthType } from '../domain/auth_type.enum';

@Controller('auth')
@ApiTags('auth')
@Auth(AuthType.None)
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @Post('/register')
  async registerUser(
    @Body() userRegistrationDetails: UserRegistrationDetailsDto,
  ): IPromiseResponse<User> {
    return this.authenticationService.registerUser(userRegistrationDetails);
  }

  @Post('/login')
  async loginUser(
    @Body() userLoginCredentials: UserLoginCredentialsDto,
  ): IPromiseResponse<{
    accessToken: string;
    refreshToken: string;
    idToken: string;
    user: User;
  }> {
    return this.authenticationService.loginUser(userLoginCredentials);
  }

  @Post('/confirm-registration')
  async confirmUserRegistration(
    @Body() userConfirmationDetails: UserConfirmationDetailsDto,
  ): IPromiseResponse<User> {
    return this.authenticationService.confirmUserRegistration(
      userConfirmationDetails,
    );
  }

  @Post('/resend-confirmation-code')
  async resendUserConfirmationCode(
    @Body() resendConfirmationDetails: ResendConfirmationDetailsDto,
  ): IPromiseResponse<void> {
    return this.authenticationService.resendUserConfirmationCode(
      resendConfirmationDetails,
    );
  }

  @Post('/forgot-password')
  async initiatePasswordReset(
    @Body() passwordResetRequest: PasswordResetRequestDto,
  ): IPromiseResponse<void> {
    return this.authenticationService.initiatePasswordReset(
      passwordResetRequest,
    );
  }

  @Post('/confirm-password')
  async confirmPasswordReset(
    @Body() passwordResetConfirmation: PasswordResetConfirmationDto,
  ): IPromiseResponse<void> {
    return this.authenticationService.confirmPasswordReset(
      passwordResetConfirmation,
    );
  }

  @Post('/refresh')
  async refreshUserSession(
    @Body() sessionRefreshDetails: SessionRefreshDetailsDto,
  ): IPromiseResponse<{
    accessToken: string;
  }> {
    return this.authenticationService.refreshUserSession(sessionRefreshDetails);
  }

  @Patch('/change-password')
  async changePassword(
    @Body() changePassword: ChangePasswordDto,
  ): IPromiseResponse<void> {
    return this.authenticationService.changePassword(changePassword);
  }
}
