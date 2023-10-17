import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { join } from 'path';
import * as request from 'supertest';

import { loadFixtures } from '@data/util/loader';

import { AppModule } from '@/app.module';
import { COGNITO_SERVICE } from '@/modules/auth/application/repository/cognito.interface.service';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guard/policy-auth.guard';
import { JwtStrategy } from '@/modules/auth/infrastructure/jwt/jwt.strategy';

import { COLLECTION_RESPONSE } from '../../application/exceptions/collection-response.enum';

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
      id: 1,
    };
    return true;
  },
};

describe('Collection - [/collection]', () => {
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

  describe('Create one  - [POST /collection]', () => {
    it('It should create a new collection', async () => {
      const response = await request(app.getHttpServer())
        .post('/collection')
        .send({
          name: 'test',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({ name: 'test', id: expect.any(Number) });
    });
  });

  describe('Get all  - [GET /collection]', () => {
    it('should get all collections associated with a user', async () => {
      const responseExpected = expect.arrayContaining([
        expect.objectContaining({ id: 1 }),
        expect.objectContaining({ id: 3 }),
      ]);
      const response = await request(app.getHttpServer())
        .get('/collection')
        .expect(HttpStatus.OK);

      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(responseExpected);
    });
    it('should only get collections associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .get('/collection')
        .expect(HttpStatus.OK);

      expect(response.body).toHaveLength(2);
    });
  });

  describe('Get one  - [GET /collection/:id]', () => {
    it('should get one collection associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .get('/collection/1')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: 1,
          name: 'collection1',
        }),
      );
    });

    it('should throw error when try to get one collection not associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .get('/collection/2')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_USER_AND_ID,
      );
    });
  });

  describe('Update one  - [PUT /collection/:id]', () => {
    it('should update one collection associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .patch('/collection')
        .send({
          name: 'collection updated',
          id: 1,
        })
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        id: 1,
        name: 'collection updated',
      });
    });
  });

  describe('Delete one  - [DELETE /collection/:id]', () => {
    it('should delete one collection associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/collection/3')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({});
    });

    it('should throw error when try to delete one collection not associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/collection/2')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_USER_AND_ID,
      );
    });
  });
});
