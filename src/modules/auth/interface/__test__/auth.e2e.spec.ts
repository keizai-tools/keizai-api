import {
  BadRequestException,
  ClassSerializerInterceptor,
  ForbiddenException,
  INestApplication,
  NotFoundException,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { join } from 'path';

import { loadFixtures } from '@data/util/loader';

import { AppModule } from '@/app.module';
import { PasswordResetConfirmationDto } from '@/common/cognito/application/dto/password_reset_confirmation.dto';
import { PasswordResetRequestDto } from '@/common/cognito/application/dto/password_reset_request.dto';
import { ResendConfirmationDetailsDto } from '@/common/cognito/application/dto/resend_confirmation_details.dto';
import { SessionRefreshDetailsDto } from '@/common/cognito/application/dto/session_refresh_details.dto';
import { UserConfirmationDetailsDto } from '@/common/cognito/application/dto/user_confirmation_details.dto';
import { UserLoginCredentialsDto } from '@/common/cognito/application/dto/user_login_credentials.dto';
import { UserRegistrationDetailsDto } from '@/common/cognito/application/dto/user_registration_details.dto';
import { CognitoMessage } from '@/common/cognito/application/enum/cognito.enum';
import { COGNITO_AUTH } from '@/common/cognito/application/interface/cognito.service.interface';
import { ICognitoRefreshSessionResponse } from '@/common/cognito/application/interface/cognito_refresh_session_response.interface';
import { SuccessResponseInterceptor } from '@/common/response_service/interceptor/success_response.interceptor';
import { IResponse } from '@/common/response_service/interface/response.interface';
import { identityProviderServiceMock } from '@/test/test.module.bootstrapper';
import { DataObject, makeRequest } from '@/test/test.util';

describe('Authentication Module', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(COGNITO_AUTH)
      .useValue(identityProviderServiceMock)
      .compile();

    await loadFixtures({
      fixturesPath: `${__dirname}/fixture`,
      dataSourcePath: join(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'configuration/orm.configuration.ts',
      ),
    });

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    app.useGlobalInterceptors(new SuccessResponseInterceptor());

    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('API', () => {
    describe('POST - /auth/register', () => {
      it('should allow users to sign up when provided valid details', async () => {
        const externalId = '00000000-0000-0000-0000-000000000001';
        identityProviderServiceMock.registerUser.mockResolvedValueOnce({
          payload: {
            userSub: externalId,
            user: null,
            userConfirmed: false,
            codeDeliveryDetails: null,
          },
        });

        const userRegistrationDetails = {
          email: 'testing@testing.com',
          password: '123456789Testing*',
        } as UserRegistrationDetailsDto;

        const response = await makeRequest({
          app,
          endpoint: '/auth/register',
          method: 'post',
          data: userRegistrationDetails as unknown as DataObject,
        });

        expect(response.body).toEqual(
          expect.objectContaining({
            success: true,
            statusCode: 201,
            message: `User successfully registered`,
            payload: expect.objectContaining({
              email: 'testing@testing.com',
              externalId: '00000000-0000-0000-0000-000000000001',
              id: expect.any(String),
              updatedAt: expect.any(String),
            }),
            timestamp: expect.any(String),
          }),
        );
      });

      it('should return 400 when provided invalid details', async () => {
        const userRegistrationDetails = {
          email: '',
          password: '',
        } as UserRegistrationDetailsDto;

        const response = await makeRequest({
          app,

          endpoint: '/auth/register',
          method: 'post',
          data: userRegistrationDetails as unknown as DataObject,
        });

        expect(response.body).toEqual({
          details: {
            description: [
              'email must be longer than or equal to 1 characters',
              'email should not be empty',
              'invalid email address.',
              'password should not be empty',
              'password must contain at least 8 characters, including at least one lowercase letter, one uppercase letter, one number, and one special character.',
            ],
            possibleCauses: [
              'Invalid request syntax.',
              'Malformed request message.',
            ],
            suggestedFixes: [
              'Check request syntax.',
              'Ensure request message is well-formed.',
            ],
          },
          error: 'Bad Request',
          message:
            'The server could not understand the request due to invalid syntax.',
          path: '/auth/register',
          statusCode: 400,
          success: false,
          timestamp: expect.any(String),
        });
      });

      it('should return 400 when provided email already exists', async () => {
        identityProviderServiceMock.getUserSub.mockResolvedValueOnce({
          payload: '00000000-0000-0000-0000-00000000000X',
        });
        const userRegistrationDetails = {
          email: 'testing@testing.com',
          password: '123456789Testing*',
        } as UserRegistrationDetailsDto;

        const response = await makeRequest({
          app,

          endpoint: '/auth/register',
          method: 'post',
          data: userRegistrationDetails as unknown as DataObject,
        });

        expect(response.body).toEqual({
          statusCode: 409,
          details: {
            description: 'User already exists',
            possibleCauses: [
              'Resource conflict.',
              'State of resource does not allow request.',
            ],
            suggestedFixes: ['Resolve resource conflict and retry.'],
          },
          error: 'Conflict',
          message:
            'The request could not be completed due to a conflict with the current state of the target resource.',
          success: false,
          path: '/auth/register',
          timestamp: expect.any(String),
        });
      });

      it('should return 400 when provided invalid data', async () => {
        const userRegistrationDetails = {
          email: 'abc',
          password: 123456,
        };

        const response = await makeRequest({
          app,

          endpoint: '/auth/register',
          method: 'post',
          data: userRegistrationDetails as unknown as DataObject,
        });
        expect(response.body).toEqual({
          statusCode: 400,
          details: {
            description: [
              'invalid email address.',
              'password must contain at least 8 characters, including at least one lowercase letter, one uppercase letter, one number, and one special character.',
            ],
            possibleCauses: [
              'Invalid request syntax.',
              'Malformed request message.',
            ],
            suggestedFixes: [
              'Check request syntax.',
              'Ensure request message is well-formed.',
            ],
          },
          error: 'Bad Request',
          message:
            'The server could not understand the request due to invalid syntax.',
          path: '/auth/register',
          success: false,
          timestamp: expect.any(String),
        });
      });

      it('should return 400 for edge cases with invalid data', async () => {
        const userRegistrationDetails = {
          email: 'a'.repeat(256) + '@testing.com',
          password: 'short1*',
        };

        const response = await makeRequest({
          app,

          endpoint: '/auth/register',
          method: 'post',
          data: userRegistrationDetails as unknown as DataObject,
        });
        expect(response.body).toEqual({
          details: {
            description: [
              'email must be shorter than or equal to 50 characters',
              'invalid email address.',
              'password must contain at least 8 characters, including at least one lowercase letter, one uppercase letter, one number, and one special character.',
            ],
            possibleCauses: [
              'Invalid request syntax.',
              'Malformed request message.',
            ],
            suggestedFixes: [
              'Check request syntax.',
              'Ensure request message is well-formed.',
            ],
          },
          error: 'Bad Request',
          message:
            'The server could not understand the request due to invalid syntax.',
          statusCode: 400,
          success: false,
          timestamp: expect.any(String),
          path: '/auth/register',
        });
      });
    });

    describe('POST - /auth/confirm-registration', () => {
      it('Should confirm a user when provided a correct confirmation code', async () => {
        identityProviderServiceMock.confirmUserRegistration.mockResolvedValueOnce(
          {},
        );

        const confirmUserDto: UserConfirmationDetailsDto = {
          email: 'admin@test.com',
          confirmationCode: '123456',
        };
        const response = await makeRequest({
          app,
          endpoint: '/auth/confirm-registration',
          method: 'post',

          data: confirmUserDto as unknown as DataObject,
        });

        expect(response.body).toEqual({
          statusCode: 200,
          timestamp: expect.any(String),
          message: 'User successfully confirmed',
          path: '/auth/confirm-registration',
          success: true,
          payload: {
            id: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            email: 'admin@test.com',
            externalId: '00000000-0000-0000-0000-00000000000X',
          },
        });
      });

      it('Should return an error when provided an incorrect confirmation code', async () => {
        identityProviderServiceMock.confirmUserRegistration.mockRejectedValueOnce(
          new UnauthorizedException(CognitoMessage.CODE_MISMATCH_ERROR),
        );

        const confirmUserDto: UserConfirmationDetailsDto = {
          email: 'admin@test.com',
          confirmationCode: '123456',
        };
        const response = await makeRequest({
          app,
          endpoint: '/auth/confirm-registration',
          method: 'post',

          data: confirmUserDto as unknown as DataObject,
        });

        expect(response.body).toEqual({
          statusCode: 401,
          details: {
            description: 'Code does not match',
            possibleCauses: ['Missing or invalid authentication token.'],
            suggestedFixes: [
              'Provide valid authentication token.',
              'Log in and try again.',
            ],
          },
          error: 'Unauthorized',
          message:
            'The client must authenticate itself to get the requested response.',
          path: '/auth/confirm-registration',
          success: false,
          timestamp: expect.any(String),
        });
      });

      it('Should return an error when provided an invalid confirmation code', async () => {
        const confirmUserDto: UserConfirmationDetailsDto = {
          email: 'admin@test.com',
          confirmationCode: 'invalidcode',
        };
        const response = await makeRequest({
          app,
          endpoint: '/auth/confirm-registration',
          method: 'post',

          data: confirmUserDto as unknown as DataObject,
        });

        expect(response.body).toEqual({
          details: {
            description: ['invalid confirmation code.'],
            possibleCauses: [
              'Invalid request syntax.',
              'Malformed request message.',
            ],
            suggestedFixes: [
              'Check request syntax.',
              'Ensure request message is well-formed.',
            ],
          },
          error: 'Bad Request',
          success: false,
          message:
            'The server could not understand the request due to invalid syntax.',
          path: '/auth/confirm-registration',
          statusCode: 400,
          timestamp: expect.any(String),
        });
      });

      it('Should return an error when provided an expired confirmation code', async () => {
        identityProviderServiceMock.confirmUserRegistration.mockRejectedValueOnce(
          new BadRequestException(CognitoMessage.EXPIRED_CODE_ERROR),
        );

        const confirmUserDto: UserConfirmationDetailsDto = {
          email: 'admin@test.com',
          confirmationCode: '123456',
        };
        const response = await makeRequest({
          app,
          endpoint: '/auth/confirm-registration',
          method: 'post',

          data: confirmUserDto as unknown as DataObject,
        });

        expect(response.body).toEqual({
          details: {
            description: 'Code has expired',
            possibleCauses: [
              'Invalid request syntax.',
              'Malformed request message.',
            ],
            suggestedFixes: [
              'Check request syntax.',
              'Ensure request message is well-formed.',
            ],
          },
          error: 'Bad Request',
          message:
            'The server could not understand the request due to invalid syntax.',
          path: '/auth/confirm-registration',
          statusCode: 400,
          success: false,
          timestamp: expect.any(String),
        });
      });

      it('Should return an error when confirmation code is missing', async () => {
        const confirmUserDto: UserConfirmationDetailsDto = {
          email: 'admin@test.com',
          confirmationCode: '',
        };
        const response = await makeRequest({
          app,
          endpoint: '/auth/confirm-registration',
          method: 'post',

          data: confirmUserDto as unknown as DataObject,
        });

        expect(response.body).toEqual({
          details: {
            description: [
              'invalid confirmation code.',
              'confirmationCode should not be empty',
            ],
            possibleCauses: [
              'Invalid request syntax.',
              'Malformed request message.',
            ],
            suggestedFixes: [
              'Check request syntax.',
              'Ensure request message is well-formed.',
            ],
          },
          error: 'Bad Request',
          success: false,
          message:
            'The server could not understand the request due to invalid syntax.',
          path: '/auth/confirm-registration',
          statusCode: 400,
          timestamp: expect.any(String),
        });
      });

      it('Should return an error when email format is invalid', async () => {
        const confirmUserDto: UserConfirmationDetailsDto = {
          email: 'invalid-email',
          confirmationCode: '123456',
        };
        const response = await makeRequest({
          app,
          endpoint: '/auth/confirm-registration',
          method: 'post',

          data: confirmUserDto as unknown as DataObject,
        });

        expect(response.body).toEqual({
          details: {
            description: ['invalid email address.'],
            possibleCauses: [
              'Invalid request syntax.',
              'Malformed request message.',
            ],
            suggestedFixes: [
              'Check request syntax.',
              'Ensure request message is well-formed.',
            ],
          },
          error: 'Bad Request',
          message:
            'The server could not understand the request due to invalid syntax.',
          path: '/auth/confirm-registration',
          statusCode: 400,
          success: false,
          timestamp: expect.any(String),
        });
      });

      it('Should return an error when user is already confirmed', async () => {
        identityProviderServiceMock.confirmUserRegistration.mockRejectedValueOnce(
          new BadRequestException('User is already confirmed'),
        );

        const confirmUserDto: UserConfirmationDetailsDto = {
          email: 'admin@test.com',
          confirmationCode: '123456',
        };
        const response = await makeRequest({
          app,
          endpoint: '/auth/confirm-registration',
          method: 'post',

          data: confirmUserDto as unknown as DataObject,
        });

        expect(response.body).toEqual({
          details: {
            description: 'User is already confirmed',
            possibleCauses: [
              'Invalid request syntax.',
              'Malformed request message.',
            ],
            suggestedFixes: [
              'Check request syntax.',
              'Ensure request message is well-formed.',
            ],
          },
          error: 'Bad Request',
          path: '/auth/confirm-registration',
          statusCode: 400,
          success: false,
          message:
            'The server could not understand the request due to invalid syntax.',
          timestamp: expect.any(String),
        });
      });
    });

    describe('POST - /auth/login', () => {
      it('should allow users to login when provided valid details', async () => {
        identityProviderServiceMock.loginUser.mockResolvedValueOnce({
          statusCode: 200,
          type: 'OK',
          message: 'User authenticated successfully',
          payload: {
            getAccessToken: jest.fn().mockReturnValue({
              getJwtToken: jest.fn().mockReturnValue('access_token'),
            }),
            getIdToken: jest.fn().mockReturnValue({
              getJwtToken: jest.fn().mockReturnValue('id_token'),
            }),
            getRefreshToken: jest.fn().mockReturnValue({
              getToken: jest.fn().mockReturnValue('refresh_token'),
            }),
            isValid: jest.fn().mockReturnValue(true),
          },
        });
        identityProviderServiceMock.getUserSub.mockResolvedValueOnce({
          payload: '00000000-0000-0000-0000-000000000001',
        });

        const user = {
          email: 'testing@testing.com',
          password: '123456789Testing*',
        } as UserLoginCredentialsDto;

        const response = await makeRequest({
          app,

          endpoint: '/auth/login',
          method: 'post',
          data: user as unknown as DataObject,
        });

        expect(response.body).toEqual({
          success: true,
          statusCode: 200,
          message: 'User authenticated successfully',
          timestamp: expect.any(String),
          path: '/auth/login',
          payload: {
            accessToken: 'access_token',
            refreshToken: 'refresh_token',
            idToken: 'id_token',
            user: {
              externalId: '00000000-0000-0000-0000-000000000001',
              createdAt: expect.any(String),
              email: 'testing@testing.com',
              id: expect.any(String),
              updatedAt: expect.any(String),
            },
          },
        });
      });

      it('should return 400 when provided empty details', async () => {
        const user = {
          email: '',
          password: '',
        } as UserLoginCredentialsDto;

        const response = await makeRequest({
          app,

          endpoint: '/auth/login',
          method: 'post',
          data: user as unknown as DataObject,
        });

        expect(response.body).toEqual({
          details: {
            description: [
              'email must be longer than or equal to 1 characters',
              'email should not be empty',
              'invalid email address.',
              'password should not be empty',
              'password must contain at least 8 characters, including at least one lowercase letter, one uppercase letter, one number, and one special character.',
            ],
            possibleCauses: [
              'Invalid request syntax.',
              'Malformed request message.',
            ],
            suggestedFixes: [
              'Check request syntax.',
              'Ensure request message is well-formed.',
            ],
          },
          error: 'Bad Request',
          message:
            'The server could not understand the request due to invalid syntax.',
          path: '/auth/login',
          statusCode: 400,
          success: false,
          timestamp: expect.any(String),
        });
      });

      it('should return 400 when provided invalid data types', async () => {
        const user = {
          email: 'abc',
          password: 123456,
        };

        const response = await makeRequest({
          app,

          endpoint: '/auth/login',
          method: 'post',
          data: user as unknown as DataObject,
        });

        expect(response.body).toEqual({
          details: {
            description: [
              'invalid email address.',
              'password must contain at least 8 characters, including at least one lowercase letter, one uppercase letter, one number, and one special character.',
            ],
            possibleCauses: [
              'Invalid request syntax.',
              'Malformed request message.',
            ],
            suggestedFixes: [
              'Check request syntax.',
              'Ensure request message is well-formed.',
            ],
          },
          error: 'Bad Request',
          message:
            'The server could not understand the request due to invalid syntax.',
          path: '/auth/login',
          statusCode: 400,
          success: false,
          timestamp: expect.any(String),
        });
      });

      it('should return 401 when provided invalid credentials', async () => {
        identityProviderServiceMock.loginUser.mockRejectedValueOnce(
          new UnauthorizedException('Invalid credentials'),
        );
        identityProviderServiceMock.getUserSub.mockResolvedValueOnce({
          payload: '00000000-0000-0000-0000-000000000001',
        });

        const user = {
          email: 'testing@testing.com',
          password: '987654321*Testing',
        } as UserLoginCredentialsDto;

        const response = await makeRequest({
          app,
          endpoint: '/auth/login',
          method: 'post',
          data: user as unknown as DataObject,
        });

        expect(response.body).toEqual({
          details: {
            description: 'Invalid credentials',
            possibleCauses: ['Missing or invalid authentication token.'],
            suggestedFixes: [
              'Provide valid authentication token.',
              'Log in and try again.',
            ],
          },
          error: 'Unauthorized',
          message:
            'The client must authenticate itself to get the requested response.',
          path: '/auth/login',
          statusCode: 401,
          success: false,
          timestamp: expect.any(String),
        });
      });

      it('should return 400 for excessively long email', async () => {
        const user = {
          email: 'a'.repeat(256) + '@testing.com',
          password: 'short1*',
        };

        const response = await makeRequest({
          app,

          endpoint: '/auth/login',
          method: 'post',
          data: user as unknown as DataObject,
        });

        expect(response.body).toEqual({
          details: {
            description: [
              'email must be shorter than or equal to 50 characters',
              'invalid email address.',
              'password must contain at least 8 characters, including at least one lowercase letter, one uppercase letter, one number, and one special character.',
            ],
            possibleCauses: [
              'Invalid request syntax.',
              'Malformed request message.',
            ],
            suggestedFixes: [
              'Check request syntax.',
              'Ensure request message is well-formed.',
            ],
          },
          error: 'Bad Request',
          message:
            'The server could not understand the request due to invalid syntax.',
          path: '/auth/login',
          statusCode: 400,
          success: false,
          timestamp: expect.any(String),
        });
      });

      it('should return 403 when user is not confirmed', async () => {
        identityProviderServiceMock.loginUser.mockRejectedValueOnce(
          new ForbiddenException(CognitoMessage.USER_NOT_CONFIRMED_ERROR),
        );
        identityProviderServiceMock.getUserSub.mockResolvedValueOnce({
          payload: '00000000-0000-0000-0000-000000000001',
        });

        const user = {
          email: 'testing@testing.com',
          password: '123456789Testing*',
        } as UserLoginCredentialsDto;

        const response = await makeRequest({
          app,

          endpoint: '/auth/login',
          method: 'post',
          data: user as unknown as DataObject,
        });

        expect(response.body).toEqual({
          statusCode: 403,
          success: false,
          details: {
            description: 'User is not confirmed',
            possibleCauses: [
              'Client lacks permissions.',
              'Forbidden resource.',
            ],
            suggestedFixes: [
              'Check client permissions.',
              'Request access if necessary.',
            ],
          },
          message: 'The client does not have access rights to the content.',
          error: 'Forbidden',
          path: '/auth/login',
          timestamp: expect.any(String),
        });
      });

      it('should return 400 when password is invalid', async () => {
        identityProviderServiceMock.loginUser.mockRejectedValueOnce(
          new UnauthorizedException(CognitoMessage.INVALID_PASSWORD_ERROR),
        );

        const user = {
          email: 'testing@testing.com',
          password: 'wrongpassword',
        } as UserLoginCredentialsDto;

        const response = await makeRequest({
          app,

          endpoint: '/auth/login',
          method: 'post',
          data: user as unknown as DataObject,
        });

        expect(response.body).toEqual({
          statusCode: 400,
          details: {
            description: [
              'password must contain at least 8 characters, including at least one lowercase letter, one uppercase letter, one number, and one special character.',
            ],
            possibleCauses: [
              'Invalid request syntax.',
              'Malformed request message.',
            ],
            suggestedFixes: [
              'Check request syntax.',
              'Ensure request message is well-formed.',
            ],
          },
          error: 'Bad Request',
          message:
            'The server could not understand the request due to invalid syntax.',
          success: false,
          path: '/auth/login',
          timestamp: expect.any(String),
        });
      });

      it('should return 401 when password reset is required', async () => {
        identityProviderServiceMock.loginUser.mockRejectedValueOnce(
          new UnauthorizedException(CognitoMessage.NEW_PASSWORD_REQUIRED_ERROR),
        );
        identityProviderServiceMock.getUserSub.mockResolvedValueOnce({
          payload: '00000000-0000-0000-0000-000000000001',
        });

        const user = {
          email: 'testing@testing.com',
          password: '123456789Testing*',
        } as UserLoginCredentialsDto;

        const response = await makeRequest({
          app,

          endpoint: '/auth/login',
          method: 'post',
          data: user as unknown as DataObject,
        });

        expect(response.body).toEqual({
          statusCode: 401,
          success: false,
          details: {
            description: 'Incorrect email or password',
            possibleCauses: ['Missing or invalid authentication token.'],
            suggestedFixes: [
              'Provide valid authentication token.',
              'Log in and try again.',
            ],
          },
          error: 'Unauthorized',
          message:
            'The client must authenticate itself to get the requested response.',
          path: '/auth/login',
          timestamp: expect.any(String),
        });
      });

      it('should return 400 when email is excessively long', async () => {
        const user = {
          email: 'a'.repeat(300) + '@testing.com',
          password: '123456789Testing*',
        };

        const response = await makeRequest({
          app,

          endpoint: '/auth/login',
          method: 'post',
          data: user as unknown as DataObject,
        });

        expect(response.body).toEqual({
          statusCode: 400,
          details: {
            description: [
              'email must be shorter than or equal to 50 characters',
              'invalid email address.',
            ],
            possibleCauses: [
              'Invalid request syntax.',
              'Malformed request message.',
            ],
            suggestedFixes: [
              'Check request syntax.',
              'Ensure request message is well-formed.',
            ],
          },
          error: 'Bad Request',
          success: false,
          message:
            'The server could not understand the request due to invalid syntax.',
          path: '/auth/login',
          timestamp: expect.any(String),
        });
      });

      it('should return 400 when request body is empty', async () => {
        const response = await makeRequest({
          app,

          endpoint: '/auth/login',
          method: 'post',
          data: {} as DataObject,
        });

        expect(response.body).toEqual({
          statusCode: 400,
          details: {
            description: [
              'email must be shorter than or equal to 50 characters',
              'email must be longer than or equal to 1 characters',
              'email should not be empty',
              'invalid email address.',
              'password should not be empty',
              'password must contain at least 8 characters, including at least one lowercase letter, one uppercase letter, one number, and one special character.',
            ],
            possibleCauses: [
              'Invalid request syntax.',
              'Malformed request message.',
            ],
            suggestedFixes: [
              'Check request syntax.',
              'Ensure request message is well-formed.',
            ],
          },
          error: 'Bad Request',
          success: false,
          message:
            'The server could not understand the request due to invalid syntax.',
          path: '/auth/login',
          timestamp: expect.any(String),
        });
      });
    });

    describe('POST - /auth/resend-confirmation-code', () => {
      it('Should resend the confirmation code when requested', async () => {
        identityProviderServiceMock.resendUserConfirmationCode.mockResolvedValueOnce(
          {
            message: 'A new confirmation code has been sent',
            type: 'OK',
          },
        );

        const confirmPasswordDto: ResendConfirmationDetailsDto = {
          email: 'admin@test.com',
        };

        const response = await makeRequest({
          app,
          endpoint: '/auth/resend-confirmation-code',
          method: 'post',

          data: confirmPasswordDto as unknown as DataObject,
        });

        expect(response.body).toEqual({
          success: true,
          statusCode: 200,
          message: 'A new confirmation code has been sent',
          timestamp: expect.any(String),
          path: '/auth/resend-confirmation-code',
        });
      });

      it("Should respond with an UserNotFoundException when the user doesn't exist", async () => {
        identityProviderServiceMock.resendUserConfirmationCode.mockRejectedValueOnce(
          new NotFoundException('User not found'),
        );

        const confirmPasswordDto: ResendConfirmationDetailsDto = {
          email: 'nobody@test.com',
        };

        const response = await makeRequest({
          app,
          endpoint: '/auth/resend-confirmation-code',
          method: 'post',

          data: confirmPasswordDto as unknown as DataObject,
        });

        expect(response.body).toEqual({
          statusCode: 404,
          details: {
            description: 'User not found',
            possibleCauses: ['Resource does not exist.', 'Incorrect URL.'],
            suggestedFixes: ['Verify resource URL.', 'Ensure resource exists.'],
          },
          error: 'Not Found',
          success: false,
          message: 'The server can not find the requested resource.',
          path: '/auth/resend-confirmation-code',
          timestamp: expect.any(String),
        });
      });

      it('Should respond with an UnexpectedCodeError over unexpected errors', async () => {
        identityProviderServiceMock.resendUserConfirmationCode.mockRejectedValueOnce(
          new Error('Unexpected error'),
        );
        const confirmPasswordDto: ResendConfirmationDetailsDto = {
          email: 'admin@test.com',
        };

        const response = await makeRequest({
          app,
          endpoint: '/auth/resend-confirmation-code',
          method: 'post',

          data: confirmPasswordDto as unknown as DataObject,
        });

        expect(response.body).toEqual({
          details: {
            description: 'Unexpected error',
            possibleCauses: ['Server encountered an internal error.'],
            suggestedFixes: [
              'Investigate server logs for details on the internal error.',
            ],
          },
          error: 'Internal Server Error',
          message:
            'The server has encountered a situation it does not know how to handle.',
          path: '/auth/resend-confirmation-code',
          statusCode: 500,
          success: false,
          timestamp: expect.any(String),
        });
      });
    });

    describe('POST - /auth/forgot-password', () => {
      it('Should initiate the password reset process', async () => {
        identityProviderServiceMock.initiatePasswordReset.mockResolvedValueOnce(
          {
            success: true,
            type: 'OK',
            message: 'Password reset initiated',
          },
        );
        const passwordResetRequest: PasswordResetRequestDto = {
          email: 'admin@test.com',
        };

        const response = await makeRequest({
          app,
          endpoint: '/auth/forgot-password',
          method: 'post',

          data: passwordResetRequest as unknown as DataObject,
        });

        expect(response.body).toEqual({
          success: true,
          statusCode: 200,
          message: 'Password reset initiated',
          path: '/auth/forgot-password',
          timestamp: expect.any(String),
        });
      });

      it('Should respond with an UserNotFoundException when the user does not exist', async () => {
        identityProviderServiceMock.initiatePasswordReset.mockRejectedValueOnce(
          new NotFoundException('User not found'),
        );

        const passwordResetRequest: PasswordResetRequestDto = {
          email: 'nobody@test.com',
        };

        const response = await makeRequest({
          app,
          endpoint: '/auth/forgot-password',
          method: 'post',

          data: passwordResetRequest as unknown as DataObject,
        });

        expect(response.body).toEqual({
          success: false,
          details: {
            description: 'User not found',
            possibleCauses: ['Resource does not exist.', 'Incorrect URL.'],
            suggestedFixes: ['Verify resource URL.', 'Ensure resource exists.'],
          },
          error: 'Not Found',
          message: 'The server can not find the requested resource.',
          path: '/auth/forgot-password',
          statusCode: 404,
          timestamp: expect.any(String),
        });
      });

      it('Should respond with an UnexpectedCodeError over unexpected errors', async () => {
        identityProviderServiceMock.initiatePasswordReset.mockRejectedValueOnce(
          new Error('Unexpected error'),
        );
        const passwordResetRequest: PasswordResetRequestDto = {
          email: 'admin@test.com',
        };

        const response = await makeRequest({
          app,
          endpoint: '/auth/forgot-password',
          method: 'post',

          data: passwordResetRequest as unknown as DataObject,
        });

        expect(response.body).toEqual({
          details: {
            description: 'Unexpected error',
            possibleCauses: ['Server encountered an internal error.'],
            suggestedFixes: [
              'Investigate server logs for details on the internal error.',
            ],
          },
          error: 'Internal Server Error',
          message:
            'The server has encountered a situation it does not know how to handle.',
          timestamp: expect.any(String),
          path: '/auth/forgot-password',
          statusCode: 500,
          success: false,
        });
      });
    });

    describe('POST - /auth/confirm-password', () => {
      it('Should confirm the password reset process', async () => {
        identityProviderServiceMock.confirmPasswordReset.mockResolvedValueOnce({
          success: true,
          message: 'Password reset confirmed',
          type: 'OK',
        });
        const passwordResetConfirmation: PasswordResetConfirmationDto = {
          email: 'admin@test.com',
          code: '123456',
          newPassword: '123456789Testing*',
        };

        const response = await makeRequest({
          app,
          endpoint: '/auth/confirm-password',
          method: 'post',

          data: passwordResetConfirmation as unknown as DataObject,
        });

        expect(response.body).toEqual({
          message: 'Password reset confirmed',
          path: '/auth/confirm-password',
          statusCode: 200,
          success: true,
          timestamp: expect.any(String),
        });
      });

      it('Should respond with an UserNotFoundException when the user does not exist', async () => {
        identityProviderServiceMock.confirmPasswordReset.mockRejectedValueOnce(
          new NotFoundException('User not found'),
        );

        const passwordResetConfirmation: PasswordResetConfirmationDto = {
          email: 'nobody@test.com',
          code: '123456',
          newPassword: '123456789Testing*',
        };

        const response = await makeRequest({
          app,
          endpoint: '/auth/confirm-password',
          method: 'post',

          data: passwordResetConfirmation as unknown as DataObject,
        });

        expect(response.body).toEqual({
          success: false,
          statusCode: 404,
          details: {
            description: 'User not found',
            possibleCauses: ['Resource does not exist.', 'Incorrect URL.'],
            suggestedFixes: ['Verify resource URL.', 'Ensure resource exists.'],
          },
          error: 'Not Found',
          message: 'The server can not find the requested resource.',
          path: '/auth/confirm-password',
          timestamp: expect.any(String),
        });
      });

      it('Should respond with an UnexpectedCodeError over unexpected errors', async () => {
        identityProviderServiceMock.confirmPasswordReset.mockRejectedValueOnce(
          new Error('Unexpected error'),
        );
        const passwordResetConfirmation: PasswordResetConfirmationDto = {
          email: 'admin@test.com',
          code: '123456',
          newPassword: '123456789Testing*',
        };

        const response = await makeRequest({
          app,
          endpoint: '/auth/confirm-password',
          method: 'post',

          data: passwordResetConfirmation as unknown as DataObject,
        });

        expect(response.body).toEqual({
          details: {
            description: 'Unexpected error',
            possibleCauses: ['Server encountered an internal error.'],
            suggestedFixes: [
              'Investigate server logs for details on the internal error.',
            ],
          },
          error: 'Internal Server Error',
          message:
            'The server has encountered a situation it does not know how to handle.',
          path: '/auth/confirm-password',
          statusCode: 500,
          timestamp: expect.any(String),
          success: false,
        });
      });
    });

    describe('POST - /auth/refresh', () => {
      it('Should refresh the session when provided a valid refresh token', async () => {
        const successResponse: IResponse<ICognitoRefreshSessionResponse> = {
          payload: {
            idToken: {
              jwtToken: 'idToken',
              payload: {
                auth_time: 1610000000,
                client_id: 'client_id',
                event_id: 'event_id',
                exp: 1610000000,
                iat: 1610000000,
                iss: 'iss',
                jti: 'jti',
                origin_jti: 'origin_jti',
                scope: 'scope',
                sub: 'sub',
                token_use: 'token_use',
                username: 'admin@test.com',
              },
            },
          },
          message: 'Session refreshed successfully',
          type: 'OK',
        };
        identityProviderServiceMock.refreshUserSession.mockResolvedValueOnce(
          successResponse,
        );
        const refreshTokenDto: SessionRefreshDetailsDto = {
          refreshToken: 'refreshToken',
          email: 'admin@test.com',
        };

        const response = await makeRequest({
          app,
          endpoint: '/auth/refresh',
          method: 'post',

          data: refreshTokenDto as unknown as DataObject,
        });

        expect(response.body).toEqual({
          success: true,
          timestamp: expect.any(String),
          message: 'Session refreshed successfully',
          path: '/auth/refresh',
          payload: {
            accessToken: 'idToken',
          },
          statusCode: 200,
        });
      });

      it('Should respond with an InvalidRefreshTokenError when provided an invalid refresh token', async () => {
        identityProviderServiceMock.refreshUserSession.mockRejectedValueOnce(
          new UnauthorizedException('Invalid refresh token'),
        );
        const refreshTokenDto: SessionRefreshDetailsDto = {
          email: 'testing@gmail.com',
          refreshToken: 'invalid_refresh_token',
        };

        const response = await makeRequest({
          app,
          endpoint: '/auth/refresh',
          method: 'post',

          data: refreshTokenDto as unknown as DataObject,
        });

        expect(response.body).toEqual({
          success: false,
          timestamp: expect.any(String),
          details: {
            description: 'Invalid refresh token',
            possibleCauses: ['Missing or invalid authentication token.'],
            suggestedFixes: [
              'Provide valid authentication token.',
              'Log in and try again.',
            ],
          },
          error: 'Unauthorized',
          message:
            'The client must authenticate itself to get the requested response.',
          path: '/auth/refresh',
          statusCode: 401,
        });
      });

      it("Should respond with an UserNotFoundException when the user doesn't exist", async () => {
        identityProviderServiceMock.refreshUserSession.mockRejectedValueOnce(
          new NotFoundException('User not found'),
        );

        const refreshTokenDto: SessionRefreshDetailsDto = {
          email: 'testing@gmail.com',
          refreshToken: 'refresh',
        };

        const response = await makeRequest({
          app,
          endpoint: '/auth/refresh',
          method: 'post',

          data: refreshTokenDto as unknown as DataObject,
        });

        expect(response.body).toEqual({
          success: false,
          statusCode: 404,
          details: {
            description: 'User not found',
            possibleCauses: ['Resource does not exist.', 'Incorrect URL.'],
            suggestedFixes: ['Verify resource URL.', 'Ensure resource exists.'],
          },
          error: 'Not Found',
          message: 'The server can not find the requested resource.',
          path: '/auth/refresh',
          timestamp: expect.any(String),
        });
      });

      it('Should respond with an UnexpectedCodeError over unexpected errors', async () => {
        identityProviderServiceMock.refreshUserSession.mockRejectedValueOnce(
          new Error('Unexpected error'),
        );
        const refreshTokenDto: SessionRefreshDetailsDto = {
          email: 'admin@test.com',
          refreshToken: 'refreshToken',
        };

        const response = await makeRequest({
          app,
          endpoint: '/auth/refresh',
          method: 'post',

          data: refreshTokenDto as unknown as DataObject,
        });

        expect(response.body).toEqual({
          details: {
            description: 'Unexpected error',
            possibleCauses: ['Server encountered an internal error.'],
            suggestedFixes: [
              'Investigate server logs for details on the internal error.',
            ],
          },
          error: 'Internal Server Error',
          message:
            'The server has encountered a situation it does not know how to handle.',
          path: '/auth/refresh',
          statusCode: 500,
          success: false,
          timestamp: expect.any(String),
        });
      });
    });
  });
});
