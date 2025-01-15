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

import { INVITATION_RESPONSE } from '../../application/exceptions/invitation.enum';

jest.setTimeout(60000);

describe('Invitation - [/invitation]', () => {
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

  describe('Create - [POST /invitation]', () => {
    it('Should create a new invitation', async () => {
      const response = await makeRequest({
        app,
        method: 'post',
        authCode: adminToken,
        endpoint: '/invitation',
        data: {
          teamId: 'team1',
          fromUserId: 'user0',
          toUserId: 'user1',
          status: 'PENDING',
        },
      });

      expect(response.body.payload).toEqual({
        id: expect.any(String),
        teamId: 'team1',
        fromUserId: 'user0',
        toUserId: 'user1',
        status: 'PENDING',
      });
    });
  });

  describe('Get all - [GET /invitation]', () => {
    it('Should get all invitations associated with a user', async () => {
      const expectedResponse = [
        {
          id: 'invitation1',
          teamId: 'team1',
          fromUserId: 'user1',
          toUserId: 'user0',
          status: 'PENDING',
        },
      ];

      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/invitation',
      });

      expect(response.body.payload).toHaveLength(1);
      expect(response.body.payload).toEqual(expectedResponse);
    });
  });

  describe('Get one - [GET /invitation/:id]', () => {
    it('Should get one invitation associated with a user', async () => {
      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/invitation/invitation0',
      });

      expect(response.body.payload).toEqual({
        id: 'invitation0',
        teamId: 'team0',
        fromUserId: 'user0',
        toUserId: 'user1',
        status: 'PENDING',
      });
    });

    it('Should throw error when try to get one invitation not associated with a user', async () => {
      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/invitation/1',
      });

      expect(response.body.details.description).toEqual(
        INVITATION_RESPONSE.INVITATION_NOT_FOUND,
      );
    });
  });

  describe('Update - [PATCH /invitation]', () => {
    it('Should update one invitation associated with a user', async () => {
      const response = await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/invitation',
        data: {
          id: 'invitation0',
          teamId: 'team0',
          fromUserId: 'user0',
          toUserId: 'user1',
          status: 'ACCEPT',
        },
      });

      expect(response.body.payload).toEqual({
        id: 'invitation0',
        teamId: 'team0',
        fromUserId: 'user0',
        toUserId: 'user1',
        status: 'ACCEPT',
      });
    });
  });

  describe('Delete - [DELETE /invitation/:id]', () => {
    it('Should delete one invitation with associated with a user', async () => {
      const response = await makeRequest({
        app,
        method: 'delete',
        authCode: adminToken,
        endpoint: '/invitation/invitation0',
      });

      expect(response.body).toEqual({
        success: true,
        statusCode: 202,
        message: 'Invitation deleted',
        payload: true,
        timestamp: expect.any(String),
        path: '/invitation/invitation0',
      });
    });

    it('Should throw error when try to delete one invitation not associated with a user', async () => {
      const response = await makeRequest({
        app,
        method: 'delete',
        authCode: adminToken,
        endpoint: '/invitation/0',
      });

      expect(response.body.details.description).toEqual(
        INVITATION_RESPONSE.INVITATION_NOT_FOUND,
      );
    });
  });
});
