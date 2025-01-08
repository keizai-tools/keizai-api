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

import { ROLE_RESPONSE } from '../../application/exceptions/role-response.enum';

describe('UserRoleToTeam - [/role]', () => {
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

  describe('Create one - [POST /role]', () => {
    it('should create a new user role', async () => {
      const response = await makeRequest({
        app,
        method: 'post',
        authCode: adminToken,
        endpoint: '/role',
        data: {
          teamId: 'team0',
          role: 'ADMIN',
        },
      });

      expect(response.body.payload).toEqual(
        expect.objectContaining({
          teamId: 'team0',
          userId: 'user0',
          role: 'ADMIN',
          id: expect.any(String),
        }),
      );
    });

    it('should throw error when try to create one user role', async () => {
      const response = await makeRequest({
        app,
        method: 'post',
        authCode: adminToken,
        endpoint: '/role',
        data: {
          teamId: 'team',
          role: 'ADMIN',
        },
      });

      expect(response.body.details.description).toEqual(
        ROLE_RESPONSE.USER_OR_TEAM_NOT_FOUND,
      );
    });
  });

  describe('Get all - [GET /role]', () => {
    it('should get all teams with user role associated with a user', async () => {
      const expectedResponse = expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          teamId: 'team0',
          userId: 'user0',
          role: 'ADMIN',
        }),
        expect.objectContaining({
          id: expect.any(String),
          teamId: 'team0',
          userId: 'user0',
          role: 'ADMIN',
        }),
      ]);

      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/role',
      });

      expect(response.body.payload).toEqual(expectedResponse);
    });
  });

  describe('Get one - [GET /role/:id]', () => {
    it('should get one user role associated with a user', async () => {
      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/role/role0',
      });

      expect(response.body.payload).toEqual({
        id: 'role0',
        teamId: 'team0',
        userId: 'user0',
        role: 'ADMIN',
      });
    });

    it('should throw error when try to get one user role not associated with a user', async () => {
      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/role/role',
      });

      expect(response.body.details.description).toEqual(
        ROLE_RESPONSE.USER_NOT_FOUND_BY_USER_AND_ID,
      );
    });
  });

  describe('Update one - [PATCH /role/:id]', () => {
    it('should update a user role', async () => {
      const response = await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/role',
        data: {
          id: 'role0',
          teamId: 'team0',
          role: 'OWNER',
        },
      });

      expect(response.body.payload).toEqual(
        expect.objectContaining({
          id: 'role0',
          teamId: 'team0',
          role: 'OWNER',
        }),
      );
    });

    it('should throw error when try to update one user role not associated with a user', async () => {
      const response = await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/role',
        data: {
          id: 'role',
          teamId: 'team0',
          role: 'REGULAR',
        },
      });

      expect(response.body.details.description).toEqual(
        ROLE_RESPONSE.USER_NOT_FOUND_BY_USER_AND_ID,
      );
    });
  });

  describe('Delete one - [DELETE /role/:id]', () => {
    it('should update a user role', async () => {
      const response = await makeRequest({
        app,
        method: 'delete',
        authCode: adminToken,
        endpoint: '/role/role0',
      });

      expect(response.body).toEqual({
        success: true,
        statusCode: 200,
        message: 'Role deleted successfully',
        payload: true,
        timestamp: expect.any(String),
        path: '/role/role0',
      });
    });

    it('should throw error when try to delete one user role not associated with a user', async () => {
      const response = await makeRequest({
        app,
        method: 'delete',
        authCode: adminToken,
        endpoint: '/role/role',
      });

      expect(response.body.details.description).toEqual(
        ROLE_RESPONSE.USER_NOT_FOUND_BY_USER_AND_ID,
      );
    });
  });
});
