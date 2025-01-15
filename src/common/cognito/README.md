# Cognito Service

This module provides an interface to interact with AWS Cognito for user authentication and management. It includes functionalities for user registration, login, password reset, and session management.

## Installation

Ensure you have the necessary environment variables set up in your `.env` file:

```env
AWS_COGNITO_REGION=your-region
AWS_COGNITO_ACCESS_KEY=your-access-key
AWS_COGNITO_SECRET_KEY=your-secret-key
AWS_COGNITO_CLIENT_ID=your-client-id
AWS_COGNITO_USER_POOL_ID=your-user-pool-id
AWS_COGNITO_ENDPOINT=your-endpoint
COGNITO_LOCAL_PATH=path-to-local-cognito-data
```

## Usage

### Register User

To register a new user:

```typescript
const userRegistrationDetails: UserRegistrationDetailsDto = {
  email: 'user@example.com',
  password: 'Password123!',
};

const response = await cognitoService.registerUser(userRegistrationDetails);
```

### Confirm User Registration

To confirm a user's registration:

```typescript
const userConfirmationDetails: UserConfirmationDetailsDto = {
  email: 'user@example.com',
  confirmationCode: '123456',
};

const response = await cognitoService.confirmUserRegistration(userConfirmationDetails);
```

### Login User

To login a user:

```typescript
const userLoginCredentials: UserLoginCredentialsDto = {
  email: 'user@example.com',
  password: 'Password123!',
};

const response = await cognitoService.loginUser(userLoginCredentials);
```

### Resend Confirmation Code

To resend the confirmation code:

```typescript
const resendConfirmationDetails: ResendConfirmationDetailsDto = {
  email: 'user@example.com',
};

const response = await cognitoService.resendUserConfirmationCode(resendConfirmationDetails);
```

### Initiate Password Reset

To initiate a password reset:

```typescript
const passwordResetRequest: PasswordResetRequestDto = {
  email: 'user@example.com',
};

const response = await cognitoService.initiatePasswordReset(passwordResetRequest);
```

### Confirm Password Reset

To confirm a password reset:

```typescript
const passwordResetConfirmation: PasswordResetConfirmationDto = {
  email: 'user@example.com',
  newPassword: 'NewPassword123!',
  code: '123456',
};

const response = await cognitoService.confirmPasswordReset(passwordResetConfirmation);
```

### Change Password

To change a user's password:

```typescript
const changePasswordDto: ChangePasswordDto = {
  accessToken: 'user-access-token',
  previousPassword: 'OldPassword123!',
  proposedPassword: 'NewPassword123!',
};

const response = await cognitoService.changePassword(changePasswordDto);
```

### Refresh Session

To refresh a user's session:

```typescript
const sessionRefreshDetails: SessionRefreshDetailsDto = {
  refreshToken: 'user-refresh-token',
};

const response = await cognitoService.refreshSession(sessionRefreshDetails);
```

## Error Handling

The service includes comprehensive error handling for various Cognito errors. Ensure to catch and handle these errors appropriately in your application.

```typescript
try {
  const response = await cognitoService.loginUser(userLoginCredentials);
} catch (error) {
  // Handle error
}
```

## License

This project is licensed under the MIT License.
