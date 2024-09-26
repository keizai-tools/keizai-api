import { AuthenticationResultType } from '@aws-sdk/client-cognito-identity-provider';

import { IPromiseResponse } from '@/common/response_service/interface/response.interface';

import { ChangePasswordDto } from '../dto/change_password.dto';
import { PasswordResetConfirmationDto } from '../dto/password_reset_confirmation.dto';
import { PasswordResetRequestDto } from '../dto/password_reset_request.dto';
import { ResendConfirmationDetailsDto } from '../dto/resend_confirmation_details.dto';
import { SessionRefreshDetailsDto } from '../dto/session_refresh_details.dto';
import { UserConfirmationDetailsDto } from '../dto/user_confirmation_details.dto';
import { UserLoginCredentialsDto } from '../dto/user_login_credentials.dto';
import { UserRegistrationDetailsDto } from '../dto/user_registration_details.dto';
import { ICognitoRefreshSessionResponse } from './cognito_refresh_session_response.interface';

export const COGNITO_AUTH = 'COGNITO_AUTH';

interface IRegisterUserResponse {
  userSub: string;
}

export interface ICognitoAuthService {
  registerUser(
    userRegistrationDetails: UserRegistrationDetailsDto,
  ): IPromiseResponse<IRegisterUserResponse>;
  loginUser(
    userLoginCredentials: UserLoginCredentialsDto,
  ): IPromiseResponse<AuthenticationResultType>;
  confirmUserRegistration(
    userConfirmationDetails: UserConfirmationDetailsDto,
  ): IPromiseResponse<void>;
  resendUserConfirmationCode(
    resendConfirmationDetails: ResendConfirmationDetailsDto,
  ): IPromiseResponse<void>;
  initiatePasswordReset(
    passwordResetRequest: PasswordResetRequestDto,
  ): IPromiseResponse<void>;
  confirmPasswordReset(
    passwordResetConfirmation: PasswordResetConfirmationDto,
  ): IPromiseResponse<void>;
  refreshSession(
    sessionRefreshDetails: SessionRefreshDetailsDto,
  ): IPromiseResponse<ICognitoRefreshSessionResponse>;
  getUserSub(email: string): IPromiseResponse<string | null>;
  changePassword(changePassword: ChangePasswordDto): IPromiseResponse<void>;
}
