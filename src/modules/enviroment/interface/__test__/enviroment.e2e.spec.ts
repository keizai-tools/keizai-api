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
import { AUTH_RESPONSE } from '@/modules/auth/application/exceptions/auth-error';
import { COLLECTION_RESPONSE } from '@/modules/collection/application/exceptions/collection-response.enum';
import { identityProviderServiceMock } from '@/test/test.module.bootstrapper';
import { createAccessToken, makeRequest } from '@/test/test.util';

import { ENVIROMENT_RESPONSE } from '../../application/exceptions/enviroment-response.enum';

describe('Environment - [/environment]', () => {
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

  describe('Create one - [POST /environment]', () => {
    const enviromentDto = {
      name: 'test',
      value: 'test',
    };

    it('should create a new environment', async () => {
      const response = await makeRequest({
        app,
        method: 'post',
        authCode: adminToken,
        endpoint: '/environment',
        data: { ...enviromentDto, collectionId: 'collection0' },
      });

      expect(response.body.payload).toEqual({
        ...enviromentDto,
        id: expect.any(String),
      });
    });

    it('should throw error when try to create a new environment not associated with the user and collections', async () => {
      const response = await makeRequest({
        app,
        method: 'post',
        authCode: adminToken,
        endpoint: '/environment',
        data: { ...enviromentDto, collectionId: 'collection' },
      });

      expect(response.body.details.description).toEqual(
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_USER_AND_ID,
      );
    });

    it('should update value of an environment if it already exists with the same name', async () => {
      const responseExpected = expect.objectContaining({
        ...enviromentDto,
        id: expect.any(String),
      });
      const response = await makeRequest({
        app,
        method: 'post',
        authCode: adminToken,
        endpoint: '/environment',
        data: { ...enviromentDto, collectionId: 'collection0' },
      });

      expect(response.body.payload).toEqual(responseExpected);
    });
  });

  describe('Get one - [GET /environment/:id]', () => {
    it('should get one environment associated with a collection', async () => {
      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/environment/enviroment0',
      });

      expect(response.body.payload).toEqual({
        id: 'enviroment0',
        name: 'enviroment0',
        value: 'enviroment0',
      });
    });

    it('should throw error when try to get one environment not associated with a user', async () => {
      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/environment/enviroment',
      });

      expect(response.body.details.description).toEqual(
        ENVIROMENT_RESPONSE.ENVIROMENT_NOT_FOUND_BY_USER_ID,
      );
    });
  });

  describe('Update one  - [PATCH /environment/:id]', () => {
    it('should update one enviroment associated with a user', async () => {
      const response = await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/environment',
        data: {
          name: 'enviroment updated',
          id: 'enviroment0',
        },
      });

      expect(response.body.payload).toEqual({
        id: 'enviroment0',
        name: 'enviroment updated',
        value: 'enviroment0',
      });
    });

    it('should throw error when try to update one environment not associated with a user', async () => {
      const response = await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/environment',
        data: {
          name: 'enviroment updated',
          id: 'enviroment',
        },
      });

      expect(response.body.details.description).toEqual(
        ENVIROMENT_RESPONSE.ENVIROMENT_NOT_FOUND_BY_USER_ID,
      );
    });
  });

  describe('Delete one  - [DELETE /environment/:id]', () => {
    it('should delete one environment associated with a user', async () => {
      const response = await makeRequest({
        app,
        method: 'delete',
        authCode: adminToken,
        endpoint: '/environment/enviroment0',
      });

      expect(response.body).toEqual({
        success: true,
        statusCode: 200,
        message: 'Variable deleted',
        payload: true,
        timestamp: expect.any(String),
        path: '/environment/enviroment0',
      });
    });

    it('should delete on environment searched by name and collection', async () => {
      const response = await makeRequest({
        app,
        method: 'delete',
        authCode: adminToken,
        endpoint: '/environment',
        query: {
          name: 'enviroment1',
          collectionId: 'collection1',
        },
      });

      expect(response.body).toEqual({
        success: true,
        statusCode: 200,
        message: 'Variable deleted',
        payload: true,
        timestamp: expect.any(String),
        path: '/environment?name=enviroment1&collectionId=collection1',
      });
    });

    it('should throw error when try to delete one environment not associated with a user', async () => {
      const response = await makeRequest({
        app,
        method: 'delete',
        authCode: adminToken,
        endpoint: '/environment/enviroment',
      });

      expect(response.body.details.description).toEqual(
        ENVIROMENT_RESPONSE.ENVIROMENT_NOT_FOUND_BY_USER_ID,
      );
    });
  });

  describe('By Team - [/team/:teamId/environment]', () => {
    const validTeamRoute = '/team/team0';
    const invalidTeamRoute = '/team/team1';
    const unauthorizeRoute = '/team/team2';

    describe('Create one - [POST /environment]', () => {
      const enviromentDto = {
        name: 'test',
        value: 'test',
      };

      it('should create a new environment by team id', async () => {
        const response = await makeRequest({
          app,
          method: 'post',
          authCode: adminToken,
          endpoint: `${validTeamRoute}/environment/`,
          data: { ...enviromentDto, collectionId: 'collection3' },
        });

        expect(response.body.payload).toEqual({
          ...enviromentDto,
          id: expect.any(String),
        });
      });

      it('should throw error when try to create a new environment not associated with the team and collections', async () => {
        const response = await makeRequest({
          app,
          method: 'post',
          authCode: adminToken,
          endpoint: `${invalidTeamRoute}/environment/`,
          data: { ...enviromentDto, collectionId: 'collection' },
        });

        expect(response.body.details.description).toEqual(
          COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_TEAM,
        );
      });

      it('should update value of an environment if it already exists with the same name', async () => {
        const responseExpected = expect.objectContaining({
          ...enviromentDto,
          id: expect.any(String),
        });

        const response = await makeRequest({
          app,
          method: 'post',
          authCode: adminToken,
          endpoint: `${validTeamRoute}/environment/`,
          data: { ...enviromentDto, collectionId: 'collection3' },
        });

        expect(response.body.payload).toEqual(responseExpected);
      });

      it('should throw error when try to create one environment with a user without the required role', async () => {
        const response = await makeRequest({
          app,
          method: 'post',
          authCode: adminToken,
          endpoint: `${unauthorizeRoute}/environment/`,
          data: { ...enviromentDto, collectionId: 'collection2' },
        });

        expect(response.body.details.description).toEqual(
          AUTH_RESPONSE.USER_ROLE_NOT_AUTHORIZED,
        );
      });
    });

    describe('Get one - [GET /environment/:id]', () => {
      it('should get one environment associated with a collection and team', async () => {
        const response = await makeRequest({
          app,
          authCode: adminToken,
          endpoint: `${validTeamRoute}/environment/enviroment2`,
        });

        expect(response.body.payload).toEqual({
          id: 'enviroment2',
          name: 'enviroment2',
          value: 'enviroment2',
        });
      });

      it('should throw error when try to get one environment not associated with a team', async () => {
        const response = await makeRequest({
          app,
          authCode: adminToken,
          endpoint: `${invalidTeamRoute}/environment/enviroment3`,
        });

        expect(response.body.details.description).toEqual(
          ENVIROMENT_RESPONSE.ENVIROMENT_NOT_FOUND_BY_TEAM_ID,
        );
      });
    });

    describe('Update one  - [PATCH /environment/:id]', () => {
      it('should update one enviroment associated with a team', async () => {
        const response = await makeRequest({
          app,
          method: 'patch',
          authCode: adminToken,
          endpoint: `${validTeamRoute}/environment`,
          data: {
            name: 'enviroment updated',
            id: 'enviroment2',
          },
        });

        expect(response.body.payload).toEqual({
          id: 'enviroment2',
          name: 'enviroment updated',
          value: 'enviroment2',
        });
      });

      it('should throw error when try to update one environment not associated with a team', async () => {
        const response = await makeRequest({
          app,
          method: 'patch',
          authCode: adminToken,
          endpoint: `${invalidTeamRoute}/environment`,
          data: {
            name: 'enviroment updated',
            id: 'enviroment3',
          },
        });

        expect(response.body.details.description).toEqual(
          ENVIROMENT_RESPONSE.ENVIROMENT_NOT_FOUND_BY_TEAM_ID,
        );
      });

      it('should throw error when try to update one environment with a user without the required role', async () => {
        const response = await makeRequest({
          app,
          method: 'patch',
          authCode: adminToken,
          endpoint: `${unauthorizeRoute}/environment`,
          data: {
            name: 'enviroment updated',
            id: 'enviroment3',
          },
        });

        expect(response.body.details.description).toEqual(
          AUTH_RESPONSE.USER_ROLE_NOT_AUTHORIZED,
        );
      });
    });

    describe('Delete one  - [DELETE /environment/:id]', () => {
      it('should delete one environment associated with a team', async () => {
        const response = await makeRequest({
          app,
          method: 'delete',
          authCode: adminToken,
          endpoint: `${validTeamRoute}/environment/enviroment2`,
        });

        expect(response.body).toEqual({
          success: true,
          statusCode: 200,
          message: 'Variable deleted',
          payload: true,
          timestamp: expect.any(String),
          path: '/team/team0/environment/enviroment2',
        });
      });

      it('should delete on environment searched by name and collection', async () => {
        const response = await makeRequest({
          app,
          method: 'delete',
          authCode: adminToken,
          endpoint: `${validTeamRoute}/environment/`,
          query: {
            name: 'enviroment4',
            collectionId: 'collection3',
          },
        });

        expect(response.body).toEqual({
          success: true,
          statusCode: 200,
          message: 'Variable deleted',
          payload: true,
          timestamp: expect.any(String),
          path: '/team/team0/environment/?name=enviroment4&collectionId=collection3',
        });
      });

      it('should throw error when try to delete one environment not associated with a team', async () => {
        const response = await makeRequest({
          app,
          method: 'delete',
          authCode: adminToken,
          endpoint: `${invalidTeamRoute}/environment/enviroment3`,
        });

        expect(response.body.details.description).toEqual(
          ENVIROMENT_RESPONSE.ENVIROMENT_NOT_FOUND_BY_TEAM_ID,
        );
      });

      it('should throw error when try to delete one environment with a user without the required role', async () => {
        const response = await makeRequest({
          app,
          method: 'delete',
          authCode: adminToken,
          endpoint: `${unauthorizeRoute}/environment/enviroment3`,
        });

        expect(response.body.details.description).toEqual(
          AUTH_RESPONSE.USER_ROLE_NOT_AUTHORIZED,
        );
      });
    });
  });
});
