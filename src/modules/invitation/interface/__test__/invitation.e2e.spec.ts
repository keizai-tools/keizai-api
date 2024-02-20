import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { join } from 'path';
import * as request from 'supertest';

import { loadFixtures } from '@data/util/loader';

import { AppModule } from '@/app.module';
import { COGNITO_SERVICE } from '@/modules/auth/application/repository/cognito.interface.service';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guard/policy-auth.guard';
import { JwtStrategy } from '@/modules/auth/infrastructure/jwt/jwt.strategy';

import { INVITATION_RESPONSE } from '../../application/exceptions/invitation.enum';

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

describe('Invitation - [/invitation]', () => {
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

  describe('Create - [POST /invitation]', () => {
    it('Should create a new invitation', async () => {
      const response = await request(app.getHttpServer())
        .post('/invitation')
        .send({
          teamId: 'team',
          fromUserId: 'user0',
          toUserId: 'user1',
          status: 'PENDING',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({
        id: expect.any(String),
        teamId: 'team',
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
          teamId: 'team',
          fromUserId: 'user1',
          toUserId: 'user0',
          status: 'PENDING',
        },
      ];
      const response = await request(app.getHttpServer())
        .get('/invitation')
        .expect(HttpStatus.OK);

      expect(response.body).toHaveLength(1);
      expect(response.body).toEqual(expectedResponse);
    });
  });

  describe('Get one - [GET /invitation/:id]', () => {
    it('Should get one invitation associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .get('/invitation/invitation0')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        id: 'invitation0',
        teamId: 'team',
        fromUserId: 'user0',
        toUserId: 'user1',
        status: 'PENDING',
      });
    });
    it('Should throw error when try to get one invitation not associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .get('/invitation/1')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        INVITATION_RESPONSE.INVITATION_NOT_FOUND,
      );
    });
  });

  describe('Update - [PATCH /invitation]', () => {
    it('Should update one invitation associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .patch('/invitation')
        .send({
          id: 'invitation0',
          teamId: 'team updated',
          fromUserId: 'user0',
          toUserId: 'user1',
          status: 'ACCEPT',
        })
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        id: 'invitation0',
        teamId: 'team updated',
        fromUserId: 'user0',
        toUserId: 'user1',
        status: 'ACCEPT',
      });
    });
  });

  describe('Delete - [DELETE /invitation/:id]', () => {
    it('Should delete one invitation with associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/invitation/invitation0')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({});
    });
    it('Should throw error when try to delete one invitation not associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/invitation/0')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        INVITATION_RESPONSE.INVITATION_NOT_FOUND,
      );
    });
  });
});
