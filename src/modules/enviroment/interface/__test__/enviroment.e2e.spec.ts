import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { join } from 'path';
import * as request from 'supertest';

import { loadFixtures } from '@data/util/loader';

import { AppModule } from '@/app.module';
import { COGNITO_SERVICE } from '@/modules/auth/application/repository/cognito.interface.service';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guard/policy-auth.guard';
import { JwtStrategy } from '@/modules/auth/infrastructure/jwt/jwt.strategy';

import { ENVIROMENT_RESPONSE } from '../../application/exceptions/enviroment-response.enum';

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

describe('Environment - [/environment]', () => {
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

  describe('Create one - [POST /environment]', () => {
    const enviromentDto = {
      name: 'test',
      value: 'test',
    };
    it('should create a new environment', async () => {
      const response = await request(app.getHttpServer())
        .post('/environment')
        .send({ ...enviromentDto, collectionId: 'collection0' })
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({
        ...enviromentDto,
        id: expect.any(String),
      });
    });
    it('should throw error when try to create a new environment not associated with the user and collections', async () => {
      const response = await request(app.getHttpServer())
        .post('/environment')
        .send({ ...enviromentDto, collectionId: 'collection' })
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        ENVIROMENT_RESPONSE.ENVIROMENT_NOT_FOUND_BY_COLLECTION_AND_USER,
      );
    });
  });
  describe('Get all  - [GET /environment]', () => {
    it('should get all environments associated with a collection', async () => {
      const responseExpected = expect.arrayContaining([
        expect.objectContaining({ id: 'enviroment0' }),
        expect.objectContaining({ id: expect.any(String) }),
      ]);
      const response = await request(app.getHttpServer())
        .get('/environment')
        .expect(HttpStatus.OK);

      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(responseExpected);
    });
  });

  describe('Get one - [GET /environment/:id]', () => {
    it('should get one environment associated with a collection', async () => {
      const response = await request(app.getHttpServer())
        .get('/environment/enviroment0')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        id: 'enviroment0',
        name: 'enviroment0',
        value: 'enviroment0',
      });
    });
    it('should throw error when try to get one environment not associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .get('/environment/enviroment1')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        ENVIROMENT_RESPONSE.ENVIROMENT_NOT_FOUND_BY_USER_ID,
      );
    });
  });

  describe('Update one  - [PUT /environment/:id]', () => {
    it('should update one enviroment associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .patch('/environment')
        .send({
          name: 'enviroment updated',
          id: 'enviroment0',
        })
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        id: 'enviroment0',
        name: 'enviroment updated',
        value: 'enviroment0',
      });
    });
    it('should throw error when try to update one environment not associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .patch('/environment')
        .send({
          name: 'enviroment updated',
          id: 'enviroment1',
        })
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        ENVIROMENT_RESPONSE.ENVIROMENT_NOT_FOUND_BY_USER_ID,
      );
    });
  });

  describe('Delete one  - [DELETE /environment/:id]', () => {
    it('should delete one environment associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/environment/enviroment0')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({});
    });

    it('should delete on environment searched by name and collection', async () => {
      const response = await request(app.getHttpServer())
        .delete('/environment')
        .query({
          name: 'enviroment1',
          collectionId: 'collection1',
        })
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({});
    });

    it('should throw error when try to delete one environment not associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/environment/enviroment1')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        ENVIROMENT_RESPONSE.ENVIROMENT_NOT_FOUND_BY_USER_ID,
      );
    });
  });
});
