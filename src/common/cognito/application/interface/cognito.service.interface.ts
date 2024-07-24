import { CognitoUserSession, ISignUpResult } from 'amazon-cognito-identity-js';

import { IPromiseResponse } from '@/common/response_service/interface/response.interface';

import { PasswordResetConfirmationDto } from '../dto/password_reset_confirmation.dto';
import { PasswordResetRequestDto } from '../dto/password_reset_request.dto';
import { ResendConfirmationDetailsDto } from '../dto/resend_confirmation_details.dto';
import { SessionRefreshDetailsDto } from '../dto/session_refresh_details.dto';
import { UserConfirmationDetailsDto } from '../dto/user_confirmation_details.dto';
import { UserLoginCredentialsDto } from '../dto/user_login_credentials.dto';
import { UserRegistrationDetailsDto } from '../dto/user_registration_details.dto';
import { ICognitoRefreshSessionResponse } from './cognito_refresh_session_response.interface';

export const COGNITO_AUTH = 'COGNITO_AUTH';

export interface ICognitoAuthService {
  registerUser(
    userRegistrationDetails: UserRegistrationDetailsDto,
  ): IPromiseResponse<ISignUpResult>;
  loginUser(
    userLoginCredentials: UserLoginCredentialsDto,
  ): IPromiseResponse<CognitoUserSession>;
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
  refreshUserSession(
    sessionRefreshDetails: SessionRefreshDetailsDto,
  ): IPromiseResponse<ICognitoRefreshSessionResponse>;
}
