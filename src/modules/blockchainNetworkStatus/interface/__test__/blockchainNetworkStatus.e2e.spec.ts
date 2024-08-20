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

describe('Blockchain Network Status - [/blockchain-network-status]', () => {
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

  describe('GET /blockchain-network-status', () => {
    it('should return the blockchain network status', async () => {
      try {
        const response = await makeRequest({
          app,
          endpoint: '/blockchain_network_status/soroban_network',
          method: 'get',
          authCode: adminToken,
        });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          success: true,
          statusCode: 200,
          message: 'Network status',
          payload: {
            futureNetwork: true,
            testNetwork: true,
            mainNetwork: true,
          },
          timestamp: expect.any(String),
          path: '/blockchain_network_status/soroban_network',
        });
      } catch (error) {
        if (
          error.code === 'ECONNREFUSED' ||
          error.message.includes('ENOTFOUND')
        ) {
          console.warn('Skipping test due to network connectivity issues.');
          return;
        }
        throw error;
      }
    }, 50000);
  });
});
