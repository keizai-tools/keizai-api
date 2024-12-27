# Authentication Module

This module handles all authentication-related functionalities, including user registration, login, password management, and token validation. It leverages AWS Cognito for user management and JWT for token-based authentication.

## Components

### Controllers

#### AuthController

The `AuthController` is responsible for handling HTTP requests related to authentication. It provides endpoints for user registration, login, password reset, and token validation.

- **registerUser**: Registers a new user.
- **loginUser**: Logs in an existing user.
- **confirmUserRegistration**: Confirms user registration using a confirmation code.
- **resendUserConfirmationCode**: Resends the confirmation code to the user.
- **initiatePasswordReset**: Initiates the password reset process.
- **confirmPasswordReset**: Confirms the password reset using a confirmation code.
- **refreshUserSession**: Refreshes the user session and provides a new access token.
- **changePassword**: Changes the user's password.
- **validateToken**: Validates the provided access token.

### Services

#### AuthService

The `AuthService` contains the business logic for authentication. It interacts with AWS Cognito and the user service to perform various authentication tasks.

- **registerUser**: Registers a new user in both the local database and Cognito.
- **loginUser**: Logs in an existing user and returns authentication tokens.
- **resendUserConfirmationCode**: Resends the confirmation code to the user.
- **initiatePasswordReset**: Initiates the password reset process.
- **confirmPasswordReset**: Confirms the password reset using a confirmation code.
- **confirmUserRegistration**: Confirms user registration using a confirmation code.
- **refreshUserSession**: Refreshes the user session and provides a new access token.
- **changePassword**: Changes the user's password.

### Strategies

#### JwtStrategy

The `JwtStrategy` is used to validate JWT tokens. It uses the `passport-jwt` library and integrates with AWS Cognito for token validation.

### Guards

#### AuthenticationGuard

The `AuthenticationGuard` is a custom guard that determines the authentication strategy to use based on the `AuthType` metadata.

#### AccessTokenGuard

The `AccessTokenGuard` is a guard that uses the JWT strategy to validate access tokens.

### Decorators

#### Auth

The `Auth` decorator is used to specify the authentication type required for a route. It sets the `AUTH_TYPE_KEY` metadata.

#### AccessToken

The `AccessToken` decorator extracts the access token from the request headers.

## Usage

To use the authentication module, import it into your main application module and configure the necessary environment variables for AWS Cognito.

```typescript
import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [AuthModule],
})
export class AppModule {}
```

Ensure that the following environment variables are set:

- `AWS_COGNITO_COGNITO_CLIENT_ID`
- `AWS_COGNITO_AUTHORITY`
- `JWT_AUTOMATED_TESTS_SECRET`

These variables are used for configuring the JWT strategy and interacting with AWS Cognito.

## Conclusion

The authentication module provides a comprehensive solution for managing user authentication in a NestJS application. It integrates with AWS Cognito for user management and uses JWT for token-based authentication, ensuring secure and scalable authentication processes.
