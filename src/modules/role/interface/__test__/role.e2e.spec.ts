import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { join } from 'path';
import * as request from 'supertest';

import { loadFixtures } from '@data/util/loader';

import { AppModule } from '@/app.module';
import { COGNITO_SERVICE } from '@/modules/auth/application/repository/cognito.interface.service';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guard/policy-auth.guard';
import { JwtStrategy } from '@/modules/auth/infrastructure/jwt/jwt.strategy';

import { ROLE_RESPONSE } from '../../application/exceptions/role-response.enum';

const mockedCognitoService = {
  registerAccount: jest.fn(),
  loginAccount: jest.fn(),
};

const mockedJwtStrategy = {
  validate: jest.fn(),
};

const mockedGuard = {
  canActivate: (context) => {
    const req = context.switchToHttp().getRequest();
    req.user = {
      id: 'user0',
    };
    return true;
  },
};

describe('UserRoleToTeam - [/role]', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(JwtStrategy)
      .useValue(mockedJwtStrategy)
      .overrideProvider(COGNITO_SERVICE)
      .useValue(mockedCognitoService)
      .overrideGuard(JwtAuthGuard)
      .useValue(mockedGuard)
      .compile();

    await loadFixtures(
      `${__dirname}/fixture`,
      join(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'configuration/orm.configuration.ts',
      ),
    );

    app = moduleRef.createNestApplication();

    await app.init();
  });

  describe('Create one - [POST /role]', () => {
    it('should create a new user role', async () => {
      const response = await request(app.getHttpServer())
        .post('/role')
        .send({
          teamId: 'team0',
          role: 'ADMIN',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual(
        expect.objectContaining({
          teamId: 'team0',
          userId: 'user0',
          role: 'ADMIN',
          id: expect.any(String),
        }),
      );
    });
    it('should throw error when try to create one user role', async () => {
      const response = await request(app.getHttpServer())
        .post('/role')
        .send({
          teamId: 'team',
          role: 'ADMIN',
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual(ROLE_RESPONSE.ROLE_FAILED_SAVED);
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

      const response = await request(app.getHttpServer())
        .get('/role')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(expectedResponse);
    });
  });

  describe('Get one - [GET /role/:id]', () => {
    it('should get one user role associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .get('/role/role0')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        id: 'role0',
        teamId: 'team0',
        userId: 'user0',
        role: 'ADMIN',
      });
    });
    it('should throw error when try to get one user role not associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .get('/role/role')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        ROLE_RESPONSE.USER_NOT_FOUND_BY_USER_AND_ID,
      );
    });
  });

  describe('Update one - [UPDATE /role/:id]', () => {
    it('should update a user role', async () => {
      const response = await request(app.getHttpServer())
        .patch('/role')
        .send({
          id: 'role0',
          teamId: 'team0',
          role: 'UPDATED',
        })
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: 'role0',
          teamId: 'team0',
          role: 'UPDATED',
        }),
      );
    });
    it('should throw error when try to update one user role not associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .patch('/role')
        .send({
          id: 'role',
          teamId: 'team0',
          role: 'UPDATED',
        })
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        ROLE_RESPONSE.USER_NOT_FOUND_BY_USER_AND_ID,
      );
    });
  });

  describe('Delete one - [DELETE /role/:id]', () => {
    it('should update a user role', async () => {
      const response = await request(app.getHttpServer())
        .delete('/role/role0')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({});
    });
    it('should throw error when try to delete one user role not associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/role/role')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        ROLE_RESPONSE.USER_NOT_FOUND_BY_USER_AND_ID,
      );
    });
  });
});
