import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { join } from 'path';
import * as request from 'supertest';

import { loadFixtures } from '@data/util/loader';

import { AppModule } from '@/app.module';
import { AUTH_RESPONSE } from '@/modules/auth/application/exceptions/auth-error';
import { COGNITO_SERVICE } from '@/modules/auth/application/repository/cognito.interface.service';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guard/policy-auth.guard';
import { JwtStrategy } from '@/modules/auth/infrastructure/jwt/jwt.strategy';

import { TEAM_RESPONSE } from '../../application/exceptions/team-response.enum';

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

describe('Team - [/team]', () => {
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

  describe('Create one - [POST /team]', () => {
    it('should create a new team', async () => {
      const response = await request(app.getHttpServer())
        .post('/team')
        .send({
          name: 'test',
          usersEmails: [],
        })
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({
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

      const response = await request(app.getHttpServer())
        .get('/team')
        .expect(HttpStatus.OK);

      expect(response.body).toHaveLength(4);
      expect(response.body).toEqual(responseExpected);
    });
  });

  describe('Get one - [GET /team/:id]', () => {
    it('should get one team associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .get('/team/team0')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: 'team0',
          name: 'team0',
        }),
      );
    });
    it('should throw error when try to get one team not associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .get('/team/2')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(TEAM_RESPONSE.TEAM_NOT_FOUND_BY_ID);
    });
    it('should throw error when try to get one team with a user not associated a team', async () => {
      const response = await request(app.getHttpServer())
        .get('/team/team3')
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body.message).toEqual(AUTH_RESPONSE.USER_NOT_MEMBER_TEAM);
    });
  });

  describe('Update one - [PATCH /team]', () => {
    it('should update one team associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .patch('/team/team0')
        .send({
          name: 'team updated',
          usersEmails: ['user1'],
        })
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        name: 'team updated',
        id: 'team0',
      });
    });
    it('should throw error when try to update one team not associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .patch('/team/2')
        .send({
          name: 'team updated',
        })
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(TEAM_RESPONSE.TEAM_NOT_FOUND_BY_ID);
    });
    it('should throw error when try to update one team with a user without the admin role', async () => {
      const response = await request(app.getHttpServer())
        .patch('/team/team2')
        .send({
          name: 'team updated',
        })
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body.message).toEqual(
        AUTH_RESPONSE.USER_ROLE_NOT_AUTHORIZED,
      );
    });
  });

  describe('Delete one - [DELETE /team/:id]', () => {
    it('should delete one team with associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/team/team0')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({});
    });
    it('should throw error when try to delete one team not associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/team/2')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(TEAM_RESPONSE.TEAM_NOT_FOUND_BY_ID);
    });
    it('should throw error when try to delete one team with a user without the owner role', async () => {
      const response = await request(app.getHttpServer())
        .delete('/team/team1')
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body.message).toEqual(
        AUTH_RESPONSE.USER_ROLE_NOT_AUTHORIZED,
      );
    });
  });
});
