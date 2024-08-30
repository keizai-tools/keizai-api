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
import { AUTH_RESPONSE } from '@/modules/authorization/infraestructure/policy/exceptions/auth-error';
import { ENVIROMENT_RESPONSE } from '@/modules/enviroment/application/exceptions/enviroment-response.enum';
import { TEAM_RESPONSE } from '@/modules/team/application/exceptions/team-response.enum';
import { identityProviderServiceMock } from '@/test/test.module.bootstrapper';
import { DataObject, createAccessToken, makeRequest } from '@/test/test.util';

import { COLLECTION_RESPONSE } from '../../application/exceptions/collection-response.enum';

describe('Collection - [/collection]', () => {
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

  describe('Create one  - [POST /collection]', () => {
    it('It should create a new collection', async () => {
      const response = await makeRequest({
        app,
        method: 'post',
        authCode: adminToken,
        endpoint: '/collection',
        data: {
          name: 'test',
        },
      });

      expect(response.body).toEqual({
        success: true,
        statusCode: 201,
        message: 'Collection created',
        payload: {
          id: expect.any(String),
          name: 'test',
        },
        timestamp: expect.any(String),
        path: '/collection',
      });
    });
  });

  describe('Create all - [POST /collection/:id]', () => {
    it('Should save many environments at once', async () => {
      const environments = [
        {
          name: 'inc4',
          value: '4',
        },
        {
          name: 'inc5',
          value: '5',
        },
        {
          name: 'inc6',
          value: '6',
        },
      ];

      const response = await makeRequest({
        app,
        method: 'post',
        authCode: adminToken,
        endpoint: '/collection/collection0/environments',
        data: environments as unknown as DataObject,
      });

      expect(response.body).toEqual({
        success: true,
        statusCode: 201,
        message: 'Environments created',
        payload: [
          {
            name: 'inc4',
            value: '4',
            id: expect.any(String),
          },
          {
            name: 'inc5',
            value: '5',
            id: expect.any(String),
          },
          {
            name: 'inc6',
            value: '6',
            id: expect.any(String),
          },
        ],
        timestamp: expect.any(String),
        path: '/collection/collection0/environments',
      });
    });
  });

  describe('Get all  - [GET /collection]', () => {
    it('should get all collections associated with a user', async () => {
      const responseExpected = expect.arrayContaining([
        expect.objectContaining({ id: 'collection0' }),
        expect.objectContaining({ id: expect.any(String) }),
      ]);

      const response = await makeRequest({
        app,
        endpoint: '/collection',
        authCode: adminToken,
      });

      expect(response.body.payload).toHaveLength(2);
      expect(response.body.payload).toEqual(responseExpected);
    });

    it('should only get collections associated with a user', async () => {
      const response = await makeRequest({
        app,
        endpoint: '/collection',
        authCode: adminToken,
      });

      expect(response.body.payload).toHaveLength(2);
    });

    it('should get folders by collections id', async () => {
      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/collection/collection0/folders',
      });

      expect(response.body.payload).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'folder0',
            name: 'folder0',
          }),
        ]),
      );
    });

    it('should get enviroments by collections id', async () => {
      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/collection/collection0/environments',
      });

      expect(response.body.payload).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
          }),
        ]),
      );
    });

    it('should get environment by collections id and environment name', async () => {
      const environmentName = 'enviroment0';
      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/collection/collection0/environment',
        query: { name: environmentName },
      });

      expect(response.body.payload).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: environmentName,
          value: expect.any(String),
        }),
      );
    });

    it('should throw error when try to get environment that not exists', async () => {
      const environmentName = 'enviroment33';
      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/collection/collection0/environment',
        query: { name: environmentName },
      });

      expect(response.body.details.description).toEqual(
        ENVIROMENT_RESPONSE.ENVIRONMENT_EXISTS,
      );
    });
  });

  describe('Get one  - [GET /collection/:id]', () => {
    it('should get one collection associated with a user', async () => {
      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/collection/collection0',
      });

      expect(response.body.payload).toEqual(
        expect.objectContaining({
          id: 'collection0',
          name: 'collection0',
        }),
      );
    });

    it('should throw error when try to get one collection not associated with a user', async () => {
      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/collection/2',
      });

      expect(response.body.details.description).toEqual(
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_USER_AND_ID,
      );
    });
  });

  describe.only('Get invocations from a collection  - [GET /collection/:id/invocations]', () => {
    it('should get invocations from a collection', async () => {
      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/collection/collection0/invocations',
      });

      expect(response.body.payload).toEqual(
        expect.objectContaining({
          id: 'collection0',
          name: 'collection0',
        }),
      );
    });

    it('should throw error when try to get invocations from a collection without id', async () => {
      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/collection/invocations',
      });

      expect(response.body.details.description).toEqual(
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_USER_AND_ID,
      );
    });
  });

  describe('Update one  - [PATCH /collection/:id]', () => {
    it('should update one collection associated with a user', async () => {
      const response = await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/collection',
        data: {
          name: 'collection updated',
          id: 'collection0',
        },
      });

      expect(response.body.payload).toEqual({
        id: 'collection0',
        name: 'collection updated',
        enviroments: expect.any(Array),
        folders: expect.any(Array),
      });
    });
  });

  describe('Delete one  - [DELETE /collection/:id]', () => {
    const collectionId = 'collection0';

    it('should delete all environments associated with a collection', async () => {
      const response = await makeRequest({
        app,
        method: 'delete',
        authCode: adminToken,
        endpoint: `/collection/${collectionId}/environments`,
      });
      expect(response.body).toEqual({
        success: true,
        statusCode: 200,
        message: 'Collection deleted',
        payload: true,
        timestamp: expect.any(String),
        path: '/collection/collection0/environments',
      });
    });

    it('should delete one collection associated with a user', async () => {
      const response = await makeRequest({
        app,
        method: 'delete',
        authCode: adminToken,
        endpoint: `/collection/${collectionId}`,
      });

      expect(response.body).toEqual({
        success: true,
        statusCode: 200,
        message: 'Collection deleted',
        payload: true,
        timestamp: expect.any(String),
        path: '/collection/collection0',
      });
    });

    it('should throw error when try to delete one collection not associated with a user', async () => {
      const response = await makeRequest({
        app,
        method: 'delete',
        authCode: adminToken,
        endpoint: `/collection/2`,
      });

      expect(response.body.details.description).toEqual(
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_ID,
      );
    });
  });

  describe('by Team - [/team/:teamId/collection]', () => {
    const team0Route = '/team/team0';

    describe('Create one  - [POST /collection]', () => {
      it('should create a new collection with a team id', async () => {
        const response = await makeRequest({
          app,
          method: 'post',
          authCode: adminToken,
          endpoint: `${team0Route}/collection`,
          data: {
            name: 'team test',
          },
        });

        expect(response.body.payload).toEqual({
          name: 'team test',
          id: expect.any(String),
        });
      });
    });

    describe('Create all - [POST /collection/:id]', () => {
      const environments = [
        {
          name: 'inc4',
          value: '4',
        },
        {
          name: 'inc5',
          value: '5',
        },
        {
          name: 'inc6',
          value: '6',
        },
      ];

      it('Should save many environments at once', async () => {
        const response = await makeRequest({
          app,
          method: 'post',
          authCode: adminToken,
          endpoint: `${team0Route}/collection/collection3/environments`,
          data: environments as unknown as DataObject,
        });

        expect(response.body.payload).toEqual([
          {
            name: 'inc4',
            value: '4',
            id: expect.any(String),
          },
          {
            name: 'inc5',
            value: '5',
            id: expect.any(String),
          },
          {
            name: 'inc6',
            value: '6',
            id: expect.any(String),
          },
        ]);
      });

      it('Should throw error when save many environments at once not associated with a collection', async () => {
        const response = await makeRequest({
          app,
          method: 'post',
          authCode: adminToken,
          endpoint: `${team0Route}/collection/collection2/environments`,
          data: environments as unknown as DataObject,
        });

        expect(response.body.details.description).toEqual(
          COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_TEAM,
        );
      });

      it('Should throw an unauthorize error when save many environments with a user without the required role', async () => {
        const response = await makeRequest({
          app,
          method: 'post',
          authCode: adminToken,
          endpoint: `/team/team1/collection/collection2/environments`,
          data: environments as unknown as DataObject,
        });

        expect(response.body.details.description).toEqual(
          AUTH_RESPONSE.USER_ROLE_NOT_AUTHORIZED,
        );
      });
    });

    describe('Get all - [GET - /collection]', () => {
      it('should get all collections associated with a team', async () => {
        const responseExpected = expect.arrayContaining([
          expect.objectContaining({ id: 'collection3' }),
          expect.objectContaining({ id: expect.any(String) }),
        ]);

        const response = await makeRequest({
          app,
          endpoint: `${team0Route}/collection`,
          authCode: adminToken,
        });

        expect(response.body.payload).toHaveLength(2);
        expect(response.body.payload).toEqual(responseExpected);
      });

      it('should get all folders by collections and team id', async () => {
        const response = await makeRequest({
          app,
          endpoint: '/team/team0/collection/collection3/folders',
          authCode: adminToken,
        });

        expect(response.body.payload).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: 'folder1',
              name: 'folder1',
            }),
          ]),
        );
      });

      it('should throw error when try to get collections with a team not associated a user', async () => {
        const response = await makeRequest({
          app,
          endpoint: '/team/team2/collection',
          authCode: adminToken,
        });

        expect(response.body.details.description).toEqual(
          AUTH_RESPONSE.USER_NOT_MEMBER_TEAM,
        );
      });

      it('should get enviroments by collections id', async () => {
        const response = await makeRequest({
          app,
          endpoint: `${team0Route}/collection/collection3/environments`,
          authCode: adminToken,
        });

        expect(response.body.payload).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              name: expect.any(String),
            }),
          ]),
        );
      });

      it('should get environment by collections id and environment name', async () => {
        const response = await makeRequest({
          app,
          endpoint: `${team0Route}/collection/collection3/environment`,
          authCode: adminToken,
          query: { name: 'enviroment2' },
        });

        expect(response.body.payload).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            name: 'enviroment2',
            value: expect.any(String),
          }),
        );
      });

      it('should throw error when try to get environment that not exists', async () => {
        const response = await makeRequest({
          app,
          authCode: adminToken,
          endpoint: '/collection/collection0/environment',
          query: { name: 'enviroment' },
        });

        expect(response.body.details.description).toEqual(
          ENVIROMENT_RESPONSE.ENVIRONMENT_EXISTS,
        );
      });
    });

    describe('Get one - [GET /:id]', () => {
      it('should get one collection associated with a team', async () => {
        const response = await makeRequest({
          app,
          authCode: adminToken,
          endpoint: `${team0Route}/collection/collection3`,
        });

        expect(response.body.payload).toEqual(
          expect.objectContaining({
            id: 'collection3',
            name: 'collection3',
          }),
        );
      });

      it('should throw error when try to get one collection not associated with a team', async () => {
        const response = await makeRequest({
          app,
          authCode: adminToken,
          endpoint: `/team/team1/collection/collection3`,
        });

        expect(response.body.details.description).toEqual(
          COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_TEAM,
        );
      });
    });

    describe('Update one - [PATCH /:id]', () => {
      it('should update one collection associated with a team', async () => {
        const response = await makeRequest({
          app,
          method: 'patch',
          authCode: adminToken,
          endpoint: `${team0Route}/collection`,
          data: {
            name: 'collection3 updated',
            id: 'collection3',
          },
        });

        expect(response.body.payload).toEqual({
          name: 'collection3 updated',
          id: 'collection3',
          enviroments: expect.any(Array),
          folders: expect.any(Array),
        });
      });

      it('should throw error when try to update one collection not associated with a team', async () => {
        const response = await makeRequest({
          app,
          method: 'patch',
          authCode: adminToken,
          endpoint: `/team/team0/collection`,
          data: {
            name: 'collection2 updated',
            id: 'collection2',
          },
        });

        expect(response.body.details.description).toEqual(
          COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_TEAM,
        );
      });
    });

    describe('Delete one - [Delete /:id]', () => {
      it('should delete all envionments associated with a collection', async () => {
        const response = await makeRequest({
          app,
          method: 'delete',
          authCode: adminToken,
          endpoint: `${team0Route}/collection/collection3/environments`,
        });

        expect(response.body).toEqual({
          success: true,
          statusCode: 200,
          message: 'Collection deleted',
          payload: true,
          timestamp: expect.any(String),
          path: '/team/team0/collection/collection3/environments',
        });
      });

      it('should delete one collection associated with a team', async () => {
        const response = await makeRequest({
          app,
          method: 'delete',
          authCode: adminToken,
          endpoint: `${team0Route}/collection/collection3`,
        });

        expect(response.body).toEqual({
          success: true,
          statusCode: 200,
          message: 'Collection deleted',
          payload: true,
          timestamp: expect.any(String),
          path: '/team/team0/collection/collection3',
        });
      });

      it('should throw error when try to delete one collection not associated with a team', async () => {
        const response = await makeRequest({
          app,
          method: 'delete',
          authCode: adminToken,
          endpoint: '/team/team/collection/collection3',
        });

        expect(response.body.details.description).toEqual(
          TEAM_RESPONSE.TEAM_NOT_FOUND_BY_ID,
        );
      });

      it('should throw error when delete all envionments not associated with a collection', async () => {
        const response = await makeRequest({
          app,
          method: 'delete',
          authCode: adminToken,
          endpoint: '/team/team0/collection/collection2/environments',
        });

        expect(response.body.details.description).toEqual(
          COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_TEAM,
        );
      });

      it('should throw error when try to delete one collection with a user without the required role', async () => {
        const response = await makeRequest({
          app,
          method: 'delete',
          authCode: adminToken,
          endpoint: '/team/team1/collection/collection3',
        });

        expect(response.body.details.description).toEqual(
          AUTH_RESPONSE.USER_ROLE_NOT_AUTHORIZED,
        );
      });
    });
  });
});
