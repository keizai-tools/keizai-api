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
import { INVOCATION_RESPONSE } from '@/modules/invocation/application/exceptions/invocation-response.enum.dto';
import { identityProviderServiceMock } from '@/test/test.module.bootstrapper';
import { createAccessToken, makeRequest } from '@/test/test.util';

import { METHOD_RESPONSE } from '../../application/exceptions/method-response.enum';

describe('Parameter - [/param]', () => {
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

  describe('Create one - [POST /method]', () => {
    it('Should create a new method', async () => {
      const responseExpected = expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
      });

      const response = await makeRequest({
        app,
        method: 'post',
        authCode: adminToken,
        endpoint: '/method',
        data: {
          name: 'test',
          inputs: [],
          outputs: [],
          params: [
            {
              name: 'param0',
              value: 'value',
            },
          ],
          invocationId: 'invocation0',
        },
      });

      expect(response.body.payload).toEqual(responseExpected);
    });

    it('should throw error when try to create a new method not associated with an invocation ', async () => {
      const response = await makeRequest({
        app,
        method: 'post',
        authCode: adminToken,
        endpoint: '/method',
        data: {
          name: 'test',
          invocationId: 'invocation',
          inputs: [],
          outputs: [],
          params: [
            {
              name: 'param0',
              value: 'value',
            },
          ],
        },
      });

      expect(response.body.details.description).toEqual(
        METHOD_RESPONSE.METHOD_INVOCATION_NOT_FOUND,
      );
    });
  });

  describe('Get one - [GET /method/:id]', () => {
    it('Should get one method associated with a user', async () => {
      const responseExpected = expect.objectContaining({
        id: 'method0',
        name: expect.any(String),
      });

      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/method/method0',
      });

      expect(response.body.payload).toEqual(responseExpected);
    });

    it('Should throw error when try to get one parameter not associated with a user', async () => {
      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/method/method',
      });

      expect(response.body.details.description).toEqual(
        METHOD_RESPONSE.METHOD_NOT_FOUND,
      );
    });
  });

  describe('Update one  - [PUT /method/:id]', () => {
    it('Should update one method associated with a user', async () => {
      const responseExpected = expect.objectContaining({
        id: 'method0',
        name: 'method updated',
      });

      const response = await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/method',
        data: {
          name: 'method updated',
          id: 'method0',
        },
      });

      expect(response.body.payload).toEqual(responseExpected);
    });

    it('should throw error when try to update a method not associated with a user', async () => {
      const response = await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/method',
        data: {
          name: 'method updated',
          id: 'method',
        },
      });
      expect(response.body.details.description).toEqual(
        METHOD_RESPONSE.METHOD_NOT_FOUND,
      );
    });
  });

  describe('Delete one  - [DELETE /method/:id]', () => {
    it('Should delete one method associated with a user', async () => {
      const response = await makeRequest({
        app,
        method: 'delete',
        authCode: adminToken,
        endpoint: '/method/method0',
      });

      expect(response.body).toEqual({
        success: true,
        statusCode: 202,
        message: 'Method deleted',
        payload: true,
        timestamp: expect.any(String),
        path: '/method/method0',
      });
    });

    it('Should throw error when try to delete one param not associated with a user', async () => {
      const response = await makeRequest({
        app,
        method: 'delete',
        authCode: adminToken,
        endpoint: '/method/method',
      });

      expect(response.body.details.description).toEqual(
        METHOD_RESPONSE.METHOD_NOT_FOUND,
      );
    });
  });

  describe('By Team - [/team/:teamId/method]', () => {
    const validRoute = '/team/team0/method';
    const invalidRoute = '/team/team1/method';

    describe('Create one - [POST /method]', () => {
      it('Should create a new method', async () => {
        const responseExpected = expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
        });

        const response = await makeRequest({
          app,
          method: 'post',
          authCode: adminToken,
          endpoint: `${validRoute}`,
          data: {
            name: 'test',
            inputs: [],
            outputs: [],
            params: [],
            invocationId: 'invocation2',
          },
        });

        expect(response.body.payload).toEqual(responseExpected);
      });

      it('should throw error when try to create a new method not associated with an invocation ', async () => {
        const response = await makeRequest({
          app,
          method: 'post',
          authCode: adminToken,
          endpoint: `${invalidRoute}`,
          data: {
            name: 'test',
            invocationId: 'invocation2',
            inputs: [],
            outputs: [],
            params: [],
          },
        });

        expect(response.body.details.description).toEqual(
          INVOCATION_RESPONSE.Invocation_NOT_FOUND_BY_TEAM_AND_ID,
        );
      });
    });

    describe('Get one - [GET /method/:id]', () => {
      it('Should get one method associated with a team', async () => {
        const responseExpected = expect.objectContaining({
          id: 'method2',
          name: expect.any(String),
        });

        const response = await makeRequest({
          app,
          authCode: adminToken,
          endpoint: `${validRoute}/method2`,
        });

        expect(response.body.payload).toEqual(responseExpected);
      });

      it('Should throw error when try to get one parameter not associated with a team', async () => {
        const response = await makeRequest({
          app,
          authCode: adminToken,
          endpoint: `${invalidRoute}/method2`,
        });

        expect(response.body.details.description).toEqual(
          METHOD_RESPONSE.METHOD_NOT_FOUND_BY_TEAM_AND_ID,
        );
      });
    });

    describe('Update one  - [PUT /method/:id]', () => {
      it('Should update one method associated with a team', async () => {
        const responseExpected = expect.objectContaining({
          id: 'method2',
          name: 'method updated',
        });

        const response = await makeRequest({
          app,
          method: 'patch',
          authCode: adminToken,
          endpoint: `${validRoute}`,
          data: {
            name: 'method updated',
            id: 'method2',
            invocationId: 'invocation2',
          },
        });

        expect(response.body.payload).toEqual(responseExpected);
      });

      it('should throw error when try to update a method not associated with a team', async () => {
        const response = await makeRequest({
          app,
          method: 'patch',
          authCode: adminToken,
          endpoint: `${invalidRoute}`,
          data: {
            name: 'method updated',
            id: 'method2',
          },
        });

        expect(response.body.details.description).toEqual(
          METHOD_RESPONSE.METHOD_NOT_FOUND_BY_TEAM_AND_ID,
        );
      });
    });

    describe('Delete one  - [DELETE /method/:id]', () => {
      it('Should delete one method associated with a team', async () => {
        const response = await makeRequest({
          app,
          method: 'delete',
          authCode: adminToken,
          endpoint: `${validRoute}/method2`,
        });

        expect(response.body).toEqual({
          success: true,
          statusCode: 202,
          message: 'Method deleted',
          payload: true,
          timestamp: expect.any(String),
          path: '/team/team0/method/method2',
        });
      });

      it('Should throw error when try to delete one param not associated with a team', async () => {
        const response = await makeRequest({
          app,
          method: 'delete',
          authCode: adminToken,
          endpoint: `${validRoute}/method3`,
        });

        expect(response.body.details.description).toEqual(
          METHOD_RESPONSE.METHOD_NOT_FOUND_BY_TEAM_AND_ID,
        );
      });
    });
  });
});
