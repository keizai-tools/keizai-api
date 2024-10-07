import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { join } from 'path';

import { loadFixtures } from '@data/util/loader';

import { AppModule } from '@/app.module';
import { COGNITO_AUTH } from '@/common/cognito/application/interface/cognito.service.interface';
import { SuccessResponseInterceptor } from '@/common/response_service/interceptor/success_response.interceptor';
import { identityProviderServiceMock } from '@/test/test.module.bootstrapper';
import { createAccessToken, makeRequest } from '@/test/test.util';

describe('User - [/user]', () => {
  let app: INestApplication;

  const adminToken = createAccessToken({
    sub: '00000000-0000-0000-0000-00000000000X',
  });

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

  describe('Update one - [PUT /user]', () => {
    it('should update a user', async () => {
      const response = await makeRequest({
        app,
        method: 'put',
        authCode: adminToken,
        endpoint: '/user/update',
        data: {
          email: 'test@test.com',
        },
      });

      expect(response.body).toEqual({
        success: true,
        statusCode: 202,
        message: 'User updated',
        payload: {
          oldUser: {
            email: 'admin@test.com',
            externalId: '00000000-0000-0000-0000-00000000000X',
            memoId: '4027480759992350720',
            id: '30a21557-582a-4bb1-9158-59132bfca0a7',
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
          newUser: {
            email: 'test@test.com',
            externalId: '00000000-0000-0000-0000-00000000000X',
            memoId: '4027480759992350720',
            id: '30a21557-582a-4bb1-9158-59132bfca0a7',
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        },
        timestamp: expect.any(String),
        path: '/user/update',
      });
    });

    it('should update a user with the same email', async () => {
      const response = await makeRequest({
        app,
        method: 'put',
        authCode: adminToken,
        endpoint: '/user/update',
        data: {},
      });

      expect(response.body).toEqual({
        success: true,
        statusCode: 202,
        message: 'User updated',
        payload: {
          oldUser: {
            email: 'test@test.com',
            externalId: '00000000-0000-0000-0000-00000000000X',
            memoId: '4027480759992350720',
            id: '30a21557-582a-4bb1-9158-59132bfca0a7',
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
          newUser: {
            email: 'test@test.com',
            externalId: '00000000-0000-0000-0000-00000000000X',
            memoId: '4027480759992350720',
            id: '30a21557-582a-4bb1-9158-59132bfca0a7',
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        },
        timestamp: expect.any(String),
        path: '/user/update',
      });
    });

    it('should return 400 if email is not valid', async () => {
      const response = await makeRequest({
        app,
        method: 'put',
        authCode: adminToken,
        endpoint: '/user/update',
        data: {
          email: 'invalid-email',
        },
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        statusCode: 400,
        error: 'Bad Request',
        message:
          'The server could not understand the request due to invalid syntax.',
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
        timestamp: expect.any(String),
        path: '/user/update',
      });
    });

    it('should return 401 if unauthorized', async () => {
      const response = await makeRequest({
        app,
        method: 'put',
        endpoint: '/user/update',
        data: {
          email: 'test@test.com',
        },
      });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        statusCode: 401,
        error: 'Unauthorized',
        message:
          'The client must authenticate itself to get the requested response.',
        details: {
          description: 'Unauthorized',
          possibleCauses: ['Missing or invalid authentication token.'],
          suggestedFixes: [
            'Provide valid authentication token.',
            'Log in and try again.',
          ],
        },
        timestamp: expect.any(String),
        path: '/user/update',
      });
    });
  });

  describe('Get me - [GET /user/me]', () => {
    it('should return the current user', async () => {
      const response = await makeRequest({
        app,
        method: 'get',
        authCode: adminToken,
        endpoint: '/user/me',
      });

      expect(response.body).toEqual({
        success: true,
        statusCode: 200,
        message: 'User found',
        payload: {
          email: 'test@test.com',
          externalId: '00000000-0000-0000-0000-00000000000X',
          memoId: '4027480759992350720',
          id: '30a21557-582a-4bb1-9158-59132bfca0a7',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
        timestamp: expect.any(String),
        path: '/user/me',
      });
    });

    it('should return 401 if unauthorized', async () => {
      const response = await makeRequest({
        app,
        method: 'get',
        endpoint: '/user/me',
      });

      expect(response.body).toEqual({
        success: false,
        statusCode: 401,
        error: 'Unauthorized',
        message:
          'The client must authenticate itself to get the requested response.',
        details: {
          description: 'Unauthorized',
          possibleCauses: ['Missing or invalid authentication token.'],
          suggestedFixes: [
            'Provide valid authentication token.',
            'Log in and try again.',
          ],
        },
        timestamp: expect.any(String),
        path: '/user/me',
      });
    });
  });
});
