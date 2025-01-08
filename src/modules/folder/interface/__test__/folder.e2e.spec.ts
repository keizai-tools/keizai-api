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
import { AUTH_RESPONSE } from '@/modules/authorization/infraestructure/policy/exceptions/auth-error';
import { COLLECTION_RESPONSE } from '@/modules/collection/application/exceptions/collection-response.enum';
import { identityProviderServiceMock } from '@/test/test.module.bootstrapper';
import { createAccessToken, makeRequest } from '@/test/test.util';

import { FOLDER_RESPONSE } from '../../application/exceptions/folder-response.enum';

describe('Folder - [/folder]', () => {
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

  describe('Create one  - [POST /folder]', () => {
    it('should create a new folder', async () => {
      const response = await makeRequest({
        app,
        method: 'post',
        authCode: adminToken,
        endpoint: '/folder',
        data: {
          name: 'test',
          collectionId: 'collection0',
        },
      });

      expect(response.body.payload).toEqual({
        name: 'test',
        id: expect.any(String),
      });
    });

    it('should throw error when try to create a new folder not associated with the user and collections', async () => {
      const response = await makeRequest({
        app,
        method: 'post',
        authCode: adminToken,
        endpoint: '/folder',
        data: {
          name: 'test',
          collectionId: 'collection',
        },
      });

      expect(response.body.details.description).toEqual(
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_USER_AND_ID,
      );
    });
  });

  describe('Get one  - [GET /folder/:id]', () => {
    it('should get one folder associated with a user', async () => {
      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/folder/folder0',
      });

      expect(response.body.payload).toEqual({
        id: 'folder0',
        name: 'folder0',
        invocations: expect.any(Array),
      });
    });

    it('should throw error when try to get one folder not exist', async () => {
      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/folder/folder',
      });

      expect(response.body.details.description).toEqual(
        FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_USER_ID,
      );
    });

    it('should throw error when try to get one folder not associated with a user', async () => {
      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/folder/folder1',
      });

      expect(response.body.details.description).toEqual(
        FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_USER_ID,
      );
    });
  });

  describe('Get all invocations - [GET /folder/:id/invocations]', () => {
    it('should get all invocations associated with a user', async () => {
      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/folder/folder0/invocations',
      });

      expect(response.body.payload).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'invocation0',
            folderId: 'folder0',
            network: 'FUTURENET',
            id: 'invocation0',
          }),
        ]),
      );
    });

    it('should throw error when try to get all invocations not associated with the user', async () => {
      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/folder/folder1/invocations',
      });

      expect(response.body.details.description).toEqual(
        FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_USER_ID,
      );
    });
  });

  describe('Update one  - [PUT /folder/:id]', () => {
    it('should update one folder associated with a user', async () => {
      const response = await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/folder',
        data: {
          name: 'folder updated',
          id: 'folder0',
        },
      });

      expect(response.body.payload).toEqual({
        id: 'folder0',
        name: 'folder updated',
      });
    });

    it('should throw error when try to update one folder not associated with a user', async () => {
      const response = await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/folder',
        data: {
          name: 'folder updated',
          id: 'folder',
        },
      });

      expect(response.body.details.description).toEqual(
        FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_USER_ID,
      );
    });
  });

  describe('Delete one  - [DELETE /folder/:id]', () => {
    it('should delete one folder associated with a user', async () => {
      const response = await makeRequest({
        app,
        method: 'delete',
        authCode: adminToken,
        endpoint: '/folder/folder0',
      });

      expect(response.body).toEqual({
        success: true,
        statusCode: 200,
        message: 'Folder deleted',
        payload: true,
        timestamp: expect.any(String),
        path: '/folder/folder0',
      });
    });

    it('should throw error when try to delete one folder not associated with a user', async () => {
      const response = await makeRequest({
        app,
        method: 'delete',
        authCode: adminToken,
        endpoint: '/folder/folder',
      });

      expect(response.body.details.description).toEqual(
        FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_USER_ID,
      );
    });
  });

  describe('By Team - [/team/:teamId/folder]', () => {
    const validRoute = '/team/team0/folder';
    const invalidRoute = '/team/team1/folder';
    const unauthorizeRoute = '/team/team2/folder';

    describe('Create one  - [POST /folder]', () => {
      it('should create a new folder with a team', async () => {
        const response = await makeRequest({
          app,
          method: 'post',
          authCode: adminToken,
          endpoint: `${validRoute}`,
          data: {
            name: 'test',
            collectionId: 'collection2',
          },
        });

        expect(response.body.payload).toEqual({
          name: 'test',
          id: expect.any(String),
        });
      });

      it('should throw error when try to create a new folder not associated with the team and collections', async () => {
        const response = await makeRequest({
          app,
          method: 'post',
          authCode: adminToken,
          endpoint: `${invalidRoute}`,
          data: {
            name: 'test',
            collectionId: 'collection2',
          },
        });

        expect(response.body.details.description).toEqual(
          COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_TEAM,
        );
      });

      it('should throw an unauthorized error when trying to create a new folder with a user without the required role', async () => {
        const response = await makeRequest({
          app,
          method: 'post',
          authCode: adminToken,
          endpoint: `${unauthorizeRoute}`,
          data: {
            name: 'test',
            collectionId: 'collection4',
          },
        });

        expect(response.body.details.description).toEqual(
          AUTH_RESPONSE.USER_ROLE_NOT_AUTHORIZED,
        );
      });
    });

    describe('Get one  - [GET /folder/:id]', () => {
      it('should get one folder associated with a team', async () => {
        const response = await makeRequest({
          app,
          authCode: adminToken,
          endpoint: `${validRoute}/folder2`,
        });

        expect(response.body.payload).toEqual({
          id: 'folder2',
          name: 'folder2',
          invocations: expect.any(Array),
        });
      });

      it('should throw error when try to get one folder not exist', async () => {
        const response = await makeRequest({
          app,
          authCode: adminToken,
          endpoint: `${invalidRoute}/folder`,
        });

        expect(response.body.details.description).toEqual(
          FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_TEAM_ID,
        );
      });

      it('should throw error when try to get one folder not associated with a team', async () => {
        const response = await makeRequest({
          app,
          authCode: adminToken,
          endpoint: `${invalidRoute}/folder1`,
        });

        expect(response.body.details.description).toEqual(
          FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_TEAM_ID,
        );
      });
    });

    describe('Get all invocations - [GET /folder/:id/invocations]', () => {
      it('should get all invocations associated with a team', async () => {
        const response = await makeRequest({
          app,
          authCode: adminToken,
          endpoint: `${validRoute}/folder2/invocations`,
        });

        expect(response.body.payload).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'invocation2',
              folderId: 'folder2',
              network: 'FUTURENET',
              id: 'invocation2',
            }),
          ]),
        );
      });

      it('should throw error when try to get all invocations not associated with the team', async () => {
        const response = await makeRequest({
          app,
          authCode: adminToken,
          endpoint: `${validRoute}/folder/invocations`,
        });

        expect(response.body.details.description).toEqual(
          FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_TEAM_ID,
        );
      });
    });

    describe('Update one  - [PATCH /folder/:id]', () => {
      it('should update one folder associated with a team', async () => {
        const response = await makeRequest({
          app,
          method: 'patch',
          authCode: adminToken,
          endpoint: `${validRoute}`,
          data: {
            name: 'folder2 updated',
            id: 'folder2',
          },
        });

        expect(response.body.payload).toEqual({
          id: 'folder2',
          name: 'folder2 updated',
        });
      });

      it('should throw error when try to update one folder not associated with a team', async () => {
        const response = await makeRequest({
          app,
          method: 'patch',
          authCode: adminToken,
          endpoint: `${invalidRoute}`,
          data: {
            name: 'folder updated',
            id: 'folder',
          },
        });

        expect(response.body.details.description).toEqual(
          FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_TEAM_ID,
        );
      });

      it('should throw an unauthorized error when try to update a new folder with a user without the required role', async () => {
        const response = await makeRequest({
          app,
          method: 'patch',
          authCode: adminToken,
          endpoint: `${unauthorizeRoute}`,
          data: {
            name: 'folder updated',
            id: 'folder4',
          },
        });

        expect(response.body.details.description).toEqual(
          AUTH_RESPONSE.USER_ROLE_NOT_AUTHORIZED,
        );
      });
    });

    describe('Delete one  - [DELETE /folder/:id]', () => {
      it('should delete one folder associated with a team', async () => {
        const response = await makeRequest({
          app,
          method: 'delete',
          authCode: adminToken,
          endpoint: `${validRoute}/folder2`,
        });

        expect(response.body).toEqual({
          success: true,
          statusCode: 200,
          message: 'Folder deleted',
          payload: true,
          timestamp: expect.any(String),
          path: '/team/team0/folder/folder2',
        });
      });

      it('should throw error when try to delete one folder not associated with a team', async () => {
        const response = await makeRequest({
          app,
          method: 'delete',
          authCode: adminToken,
          endpoint: `${invalidRoute}/folder1`,
        });

        expect(response.body.details.description).toEqual(
          FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_TEAM_ID,
        );
      });

      it('should throw an unauthorized error when try to delete a new folder with a user without the required role', async () => {
        const response = await makeRequest({
          app,
          method: 'delete',
          authCode: adminToken,
          endpoint: `${unauthorizeRoute}/folder4`,
        });

        expect(response.body.details.description).toEqual(
          AUTH_RESPONSE.USER_ROLE_NOT_AUTHORIZED,
        );
      });
    });
  });
});
