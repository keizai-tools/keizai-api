export enum CognitoMessage {
  INVALID_REFRESH_TOKEN_ERROR = 'Invalid refresh token',
  PASSWORD_VALIDATION_ERROR = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character',
  EXPIRED_CODE_ERROR = 'Code has expired',
  CODE_MISMATCH_ERROR = 'Code does not match',
  NEW_PASSWORD_REQUIRED_ERROR = 'New password required',
  INVALID_PASSWORD_ERROR = 'Incorrect email or password',
  USER_NOT_CONFIRMED_ERROR = 'User is not confirmed',
  INVALID_CODE_ERROR = 'Incorrect email or code',
  USER_EXISTS_ERROR = 'User already exists',
  USER_REGISTERED_SUCCESS = 'User registered successfully',
  USER_AUTHENTICATED_SUCCESS = 'User authenticated successfully',
  USER_REGISTRATION_CONFIRMED_SUCCESS = 'User registration confirmed successfully',
  CONFIRMATION_CODE_RESENT_SUCCESS = 'Confirmation code resent successfully',
  PASSWORD_RESET_SUCCESS = 'Password reset successfully',
  PASSWORD_RESET_CONFIRMATION_SUCCESS = 'Password reset confirmation successfully',
  SESSION_REFRESHED_SUCCESS = 'Session refreshed successfully',
}

export enum CognitoError {
  INVALID_PASSWORD_EXCEPTION = 'InvalidPasswordException',
  USERNAME_EXISTS_EXCEPTION = 'UsernameExistsException',
  USER_NOT_CONFIRMED_EXCEPTION = 'UserNotConfirmedException',
  NOT_AUTHORIZED_EXCEPTION = 'NotAuthorizedException',
  PASSWORD_RESET_REQUIRED_EXCEPTION = 'PasswordResetRequiredException',
  CODE_MISMATCH_EXCEPTION = 'CodeMismatchException',
  EXPIRED_CODE_EXCEPTION = 'ExpiredCodeException',
}