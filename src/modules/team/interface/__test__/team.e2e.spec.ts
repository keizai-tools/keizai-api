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
import { identityProviderServiceMock } from '@/test/test.module.bootstrapper';
import { createAccessToken, makeRequest } from '@/test/test.util';

import { TEAM_RESPONSE } from '../../application/exceptions/team-response.enum';

describe('Team - [/team]', () => {
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

  describe('Create one - [POST /team]', () => {
    it('should create a new team', async () => {
      const response = await makeRequest({
        app,
        method: 'post',
        authCode: adminToken,
        endpoint: '/team',
        data: {
          name: 'test',
          usersEmails: [],
        },
      });

      expect(response.body.payload).toEqual({
        name: 'test',
        id: expect.any(String),
      });
    });
  });

  describe('Get all - [GET /team]', () => {
    it('should get all teams associated with a user', async () => {
      const responseExpected = expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          userMembers: expect.arrayContaining([
            expect.objectContaining({ userId: 'user0' }),
          ]),
        }),
        expect.objectContaining({
          id: expect.any(String),
          userMembers: expect.arrayContaining([
            expect.objectContaining({ userId: 'user0' }),
          ]),
        }),
        expect.objectContaining({
          id: expect.any(String),
          userMembers: expect.arrayContaining([
            expect.objectContaining({ userId: 'user0' }),
          ]),
        }),
        expect.objectContaining({
          id: expect.any(String),
          userMembers: expect.arrayContaining([
            expect.objectContaining({ userId: 'user0' }),
          ]),
        }),
      ]);

      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/team',
      });

      expect(response.body.payload).toHaveLength(4);
      expect(response.body.payload).toEqual(responseExpected);
    });
  });

  describe('Get one - [GET /team/:id]', () => {
    it('should get one team associated with a user', async () => {
      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/team/team0',
      });

      expect(response.body.payload).toEqual(
        expect.objectContaining({
          id: 'team0',
          name: 'team0',
        }),
      );
    });

    it('should throw error when try to get one team not associated with a user', async () => {
      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/team/2',
      });

      expect(response.body.details.description).toEqual(
        TEAM_RESPONSE.TEAM_NOT_FOUND_BY_ID,
      );
    });

    it('should throw error when try to get one team with a user not associated a team', async () => {
      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/team/team3',
      });

      expect(response.body.details.description).toEqual(
        AUTH_RESPONSE.USER_NOT_MEMBER_TEAM,
      );
    });
  });

  describe('Update one - [PATCH /team]', () => {
    it('should update one team associated with a user', async () => {
      const response = await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/team/team0',
        data: {
          name: 'team updated',
          usersEmails: ['user1'],
          id: 'team0',
        },
      });
      expect(response.body.payload).toEqual({
        name: 'team updated',
        id: 'team0',
        collections: expect.any(Array),
        invitations: expect.any(Array),
        userMembers: expect.any(Array),
      });
    });

    it('should throw error when try to update one team not associated with a user', async () => {
      const response = await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/team/2',
        data: {
          name: 'team updated',
        },
      });

      expect(response.body.details.description).toEqual(
        TEAM_RESPONSE.TEAM_NOT_FOUND_BY_ID,
      );
    });

    it('should throw error when try to update one team with a user without the admin role', async () => {
      const response = await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/team/team2',
        data: {
          name: 'team updated',
        },
      });

      expect(response.body.details.description).toEqual(
        AUTH_RESPONSE.USER_ROLE_NOT_AUTHORIZED,
      );
    });
  });

  describe('Delete one - [DELETE /team/:id]', () => {
    it('should delete one team with associated with a user', async () => {
      const response = await makeRequest({
        app,
        method: 'delete',
        authCode: adminToken,
        endpoint: '/team/team0',
      });

      expect(response.body).toEqual({
        success: true,
        statusCode: 202,
        message: 'Team deleted',
        payload: true,
        timestamp: expect.any(String),
        path: '/team/team0',
      });
    });

    it('should throw error when try to delete one team not associated with a user', async () => {
      const response = await makeRequest({
        app,
        method: 'delete',
        authCode: adminToken,
        endpoint: '/team/2',
      });

      expect(response.body.details.description).toEqual(
        TEAM_RESPONSE.TEAM_NOT_FOUND_BY_ID,
      );
    });

    it('should throw error when try to delete one team with a user without the owner role', async () => {
      const response = await makeRequest({
        app,
        method: 'delete',
        authCode: adminToken,
        endpoint: '/team/team1',
      });

      expect(response.body.details.description).toEqual(
        AUTH_RESPONSE.USER_ROLE_NOT_AUTHORIZED,
      );
    });
  });
});
