import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { join } from 'path';
import * as request from 'supertest';

import { loadFixtures } from '@data/util/loader';

import { AppModule } from '@/app.module';
import { COGNITO_SERVICE } from '@/modules/auth/application/repository/cognito.interface.service';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guard/policy-auth.guard';
import { JwtStrategy } from '@/modules/auth/infrastructure/jwt/jwt.strategy';

import { PARAM_RESPONSE } from '../../application/exceptions/param-response.enum';

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

describe('Parameter - [/param]', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
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

  describe('Create one - [POST /param]', () => {
    it('Should create a new parameter', async () => {
      const responseExpected = expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        value: expect.any(String),
      });
      const response = await request(app.getHttpServer())
        .post('/param')
        .send({
          name: 'test',
          value: 'test',
          invocationId: 'invocation0',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual(responseExpected);
    });
    it('Should throw error when try to create a new param not associated with an invocation', async () => {
      const response = await request(app.getHttpServer())
        .post('/param')
        .send({
          name: 'test',
          value: 'test',
          invocationId: 'invocation',
        })
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        PARAM_RESPONSE.PARAM_INVOCATION_NOT_FOUND,
      );
    });
  });
  describe('Get all - [GET /param]', () => {
    it('Should get all parameters associated with a user', async () => {
      const responseExpected = expect.arrayContaining([
        expect.objectContaining({ id: expect.any(String) }),
        expect.objectContaining({ id: 'param0' }),
      ]);
      const response = await request(app.getHttpServer())
        .get('/param')
        .expect(HttpStatus.OK);

      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(responseExpected);
    });
    it('Should only get parameters associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .get('/param')
        .expect(HttpStatus.OK);

      expect(response.body).toHaveLength(2);
    });
  });
  describe('Get one - [GET /param/:id]', () => {
    it('Should get one parameter associated with a user', async () => {
      const responseExpected = expect.objectContaining({
        id: 'param0',
        name: expect.any(String),
        value: expect.any(String),
      });

      const response = await request(app.getHttpServer())
        .get('/param/param0')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(responseExpected);
    });
    it('Should throw error when try to get one parameter not associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .get('/param/param1')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        PARAM_RESPONSE.PARAM_NOT_FOUND_BY_USER_AND_ID,
      );
    });
  });
  describe('Update one  - [PUT /param/:id]', () => {
    it('Should update one parameter associated with a user', async () => {
      const responseExpected = expect.objectContaining({
        id: 'param0',
        name: 'param updated',
      });
      const response = await request(app.getHttpServer())
        .patch('/param')
        .send({
          name: 'param updated',
          id: 'param0',
        })
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(responseExpected);
    });
    it('Should throw error when try to update a param not associated with an invocation', async () => {
      const response = await request(app.getHttpServer())
        .patch('/param')
        .send({
          name: 'param updated',
          id: 'param',
        })
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        PARAM_RESPONSE.PARAM_NOT_FOUND_BY_USER_AND_ID,
      );
    });
  });

  describe('Delete one  - [DELETE /param/:id]', () => {
    it('Should delete one parameter associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/param/param0')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({});
    });

    it('Should throw error when try to delete one param not associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/param/param1')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        PARAM_RESPONSE.PARAM_NOT_FOUND_BY_USER_AND_ID,
      );
    });
  });
});
