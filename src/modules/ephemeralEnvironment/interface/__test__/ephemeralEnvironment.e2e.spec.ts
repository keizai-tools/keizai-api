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
import { IResponse } from '@/common/response_service/interface/response.interface';
import {
  ephemeralEnvironmentService,
  identityProviderServiceMock,
} from '@/test/test.module.bootstrapper';
import { createAccessToken, makeRequest } from '@/test/test.util';

import {
  EPHEMERAL_ENVIRONMENT_SERVICE,
  IEphemeralEnvironmentService,
  ITaskInfo,
} from '../../application/interface/ephemeralEnvironment.interface';

jest.setTimeout(60000);

describe('Ephemeral Environment - [/ephemeral-environment]', () => {
  let app: INestApplication;
  let service: IEphemeralEnvironmentService;

  const adminToken = createAccessToken({
    sub: '00000000-0000-0000-0000-00000000000X',
  });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(COGNITO_AUTH)
      .useValue(identityProviderServiceMock)
      .overrideProvider(EPHEMERAL_ENVIRONMENT_SERVICE)
      .useValue(ephemeralEnvironmentService)
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

    service = moduleRef.get<IEphemeralEnvironmentService>(
      EPHEMERAL_ENVIRONMENT_SERVICE,
    );

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

  describe('Start Fargate - [POST /ephemeral-environment/start]', () => {
    it('should return 401 if unauthorized', async () => {
      const response = await makeRequest({
        app,
        method: 'post',
        endpoint: '/ephemeral-environment/start',
        data: {
          interval: 10,
        },
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
        path: '/ephemeral-environment/start',
      });
    });
  });

  describe('Stop Fargate - [DELETE /ephemeral-environment/stop]', () => {
    it('should return 401 if unauthorized', async () => {
      const response = await makeRequest({
        app,
        method: 'delete',
        endpoint: '/ephemeral-environment/stop',
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
        path: '/ephemeral-environment/stop',
      });
    });
  });

  describe('Get Task Status - [GET /ephemeral-environment/status]', () => {
    it('should return the status of a Fargate task', async () => {
      const mockResponse: IResponse<ITaskInfo> = {
        payload: {
          status: 'RUNNING',
          taskArn: 'arn:aws:ecs:region:account-id:task/task-id',
          publicIp: '1.2.3.4',
          taskStartedAt: new Date(),
          taskStoppedAt: new Date(Date.now() + 10 * 60000),
          executionInterval: 10,
        },
        message: 'Task status retrieved successfully',
      };
      jest.spyOn(service, 'getTaskStatus').mockResolvedValue(mockResponse);

      const response = await makeRequest({
        app,
        method: 'get',
        authCode: adminToken,
        endpoint: '/ephemeral-environment/status',
      });

      expect(response.body).toEqual({
        path: expect.any(String),
        timestamp: expect.any(String),
        ...mockResponse,
        payload: {
          ...mockResponse.payload,
          taskStartedAt: expect.any(String),
          taskStoppedAt: expect.any(String),
        },
      });
    });

    it('should return 401 if unauthorized', async () => {
      const response = await makeRequest({
        app,
        method: 'get',
        endpoint: '/ephemeral-environment/status',
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
        path: '/ephemeral-environment/status',
      });
    });
  });

  describe('Get Account or Fund - [GET /ephemeral-environment/friendbot]', () => {
    it('should return account details or fund the account', async () => {
      const mockResponse: IResponse<void> = {
        message: 'Account funded successfully',
      };
      jest.spyOn(service, 'getAccountOrFund').mockResolvedValue(mockResponse);

      const response = await makeRequest({
        app,
        method: 'get',
        authCode: adminToken,
        endpoint: '/ephemeral-environment/friendbot',
        data: {
          addr: 'some-public-key',
        },
      });

      expect(response.body).toEqual({
        path: expect.any(String),
        timestamp: expect.any(String),
        ...mockResponse,
      });
    });

    it('should return 401 if unauthorized', async () => {
      const response = await makeRequest({
        app,
        method: 'get',
        endpoint: '/ephemeral-environment/friendbot',
        data: {
          addr: 'some-public-key',
        },
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
        path: '/ephemeral-environment/friendbot',
      });
    });
  });
});
