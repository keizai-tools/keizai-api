import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

import { AppModule } from '@/app.module';

import { COGNITO_SERVICE } from '../../application/repository/cognito.interface.service';

const mockedCognitoService = {
  registerAccount: jest.fn(),
  loginAccount: jest.fn(),
};

describe('Auth - [/auth]', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(COGNITO_SERVICE)
      .useValue(mockedCognitoService)
      .compile();

    app = moduleRef.createNestApplication();

    await app.init();
  });

  describe('Create one - [POST /signup]', () => {
    it('It should create a new user', async () => {
      const resolvedValue = {
        externalId: '123-123-123-123-123',
        username: 'fakeEmail@email.com',
        userConfirm: true,
      };

      jest
        .spyOn(mockedCognitoService, 'registerAccount')
        .mockResolvedValueOnce(resolvedValue);

      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'fakeEmail@email.com', password: 'Pass123&' })
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          expect(body.externalId).toBe(resolvedValue.externalId),
            expect(body.username).toBe(resolvedValue.username);
        });
    });
  });

  describe('Login One - [POST /signin]', () => {
    it('It should return an access and a refresh token when an user is logged in', async () => {
      enum LOGIN_RESULT {
        ACCESS_TOKEN = 'accessToken123',
        REFRESH_TOKEN = 'refreshToken123',
      }

      const resolvedValue = {
        accessToken: LOGIN_RESULT.ACCESS_TOKEN,
        refreshToken: LOGIN_RESULT.REFRESH_TOKEN,
      };

      jest
        .spyOn(mockedCognitoService, 'loginAccount')
        .mockResolvedValueOnce(resolvedValue);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'fakeEmail@email.com',
          password: 'Pass123&',
        })
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          expect(body.accessToken).toBe(LOGIN_RESULT.ACCESS_TOKEN),
            expect(body.refreshToken).toBe(LOGIN_RESULT.REFRESH_TOKEN);
        });
    });
  });

  afterAll(async () => {
    app.close();
  });
});
