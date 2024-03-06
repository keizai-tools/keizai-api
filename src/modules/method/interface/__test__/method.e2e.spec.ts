import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { join } from 'path';
import * as request from 'supertest';

import { loadFixtures } from '@data/util/loader';

import { AppModule } from '@/app.module';
import { COGNITO_SERVICE } from '@/modules/auth/application/repository/cognito.interface.service';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guard/policy-auth.guard';
import { JwtStrategy } from '@/modules/auth/infrastructure/jwt/jwt.strategy';

import { METHOD_RESPONSE } from '../../application/exceptions/method-response.enum';

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

  describe('Create one - [POST /method]', () => {
    it('Should create a new method', async () => {
      const responseExpected = expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
      });
      const response = await request(app.getHttpServer())
        .post('/method')
        .send({
          name: 'test',
          inputs: [],
          outputs: [],
          params: [],
          invocationId: 'invocation0',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual(responseExpected);
    });
    it('should throw error when try to create a new method not associated with an invocation ', async () => {
      const response = await request(app.getHttpServer())
        .post('/method')
        .send({
          name: 'test',
          invocationId: 'invocation',
        })
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        METHOD_RESPONSE.METHOD_INVOCATION_NOT_FOUND,
      );
    });
  });

  describe('Get one - [GET /method/:id]', () => {
    it('Should get one method associated with a user', async () => {
      const responseExpected = expect.objectContaining({
        id: 'method0',
        name: expect.any(String),
      });

      const response = await request(app.getHttpServer())
        .get('/method/method0')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(responseExpected);
    });
    it('Should throw error when try to get one parameter not associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .get('/method/method')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(METHOD_RESPONSE.METHOD_NOT_FOUND);
    });
  });

  describe('Update one  - [PUT /method/:id]', () => {
    it('Should update one method associated with a user', async () => {
      const responseExpected = expect.objectContaining({
        id: 'method0',
        name: 'method updated',
      });
      const response = await request(app.getHttpServer())
        .patch('/method')
        .send({
          name: 'method updated',
          id: 'method0',
        })
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(responseExpected);
    });
    it('should throw error when try to update a method not associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .patch('/method')
        .send({
          name: 'method updated',
          id: 'method',
        })
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(METHOD_RESPONSE.METHOD_NOT_FOUND);
    });
  });

  describe('Delete one  - [DELETE /method/:id]', () => {
    it('Should delete one method associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/method/method0')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({});
    });

    it('Should throw error when try to delete one param not associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/method/method')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(METHOD_RESPONSE.METHOD_NOT_FOUND);
    });
  });
});
