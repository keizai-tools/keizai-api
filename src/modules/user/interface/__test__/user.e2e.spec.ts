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
import { AllExceptionsFilter } from '@/common/response_service/filter/all_exceptions.filter';
import { SuccessResponseInterceptor } from '@/common/response_service/interceptor/success_response.interceptor';
import { identityProviderServiceMock } from '@/test/test.module.bootstrapper';
import { createAccessToken, makeRequest } from '@/test/test.util';

jest.setTimeout(60000);

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
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
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
          email: 'admin@test.com',
          externalId: '00000000-0000-0000-0000-00000000000X',
          memoId: '4027480759992350720',
          balance: 0,
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

  describe('Get Fargate Time - [GET /user/fargate-time]', () => {
    it('should return the Fargate session time', async () => {
      const response = await makeRequest({
        app,
        method: 'get',
        authCode: adminToken,
        endpoint: '/user/fargate-time',
      });

      expect(response.body).toEqual({
        success: true,
        statusCode: 200,
        message: 'Fargate session time calculated successfully.',
        payload: {
          fargateTime: expect.any(Number),
        },
        timestamp: expect.any(String),
        path: '/user/fargate-time',
      });
    });

    it('should return 401 if unauthorized', async () => {
      const response = await makeRequest({
        app,
        method: 'get',
        endpoint: '/user/fargate-time',
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
        path: '/user/fargate-time',
      });
    });
  });

  describe('Get Fargate Cost Per Minute - [GET /user/fargate-cost-per-minute]', () => {
    it('should return the Fargate cost per minute', async () => {
      const response = await makeRequest({
        app,
        method: 'get',
        authCode: adminToken,
        endpoint: '/user/fargate-cost-per-minute',
      });

      expect(response.body).toEqual({
        success: true,
        statusCode: 200,
        message: 'Fargate cost per minute calculated successfully.',
        payload: {
          costPerMinute: expect.any(Number),
        },
        timestamp: expect.any(String),
        path: '/user/fargate-cost-per-minute',
      });
    });

    it('should return 401 if unauthorized', async () => {
      const response = await makeRequest({
        app,
        method: 'get',
        endpoint: '/user/fargate-cost-per-minute',
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
        path: '/user/fargate-cost-per-minute',
      });
    });
  });
});
