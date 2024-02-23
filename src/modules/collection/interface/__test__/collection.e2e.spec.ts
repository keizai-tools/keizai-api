import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { join } from 'path';
import * as request from 'supertest';

import { loadFixtures } from '@data/util/loader';

import { AppModule } from '@/app.module';
import { COGNITO_SERVICE } from '@/modules/auth/application/repository/cognito.interface.service';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guard/policy-auth.guard';
import { JwtStrategy } from '@/modules/auth/infrastructure/jwt/jwt.strategy';
import { ENVIROMENT_RESPONSE } from '@/modules/enviroment/application/exceptions/enviroment-response.enum';

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
      id: 'user0',
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

      expect(response.body).toEqual({ name: 'test', id: expect.any(String) });
    });
    it('It should create a new collection with a team id', async () => {
      const response = await request(app.getHttpServer())
        .post('/collection')
        .send({
          name: 'team test',
          teamId: 'team1',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({
        name: 'team test',
        id: expect.any(String),
      });
    });
  });

  describe('Create all - [POST /collection/:id]', () => {
    it('Should save many environments at once', async () => {
      const environments = [
        {
          name: 'inc4',
          value: '4',
        },
        {
          name: 'inc5',
          value: '5',
        },
        {
          name: 'inc6',
          value: '6',
        },
      ];

      const response = await request(app.getHttpServer())
        .post('/collection/collection0/environments')
        .send(environments)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual([
        {
          name: 'inc4',
          value: '4',
          id: expect.any(String),
        },
        {
          name: 'inc5',
          value: '5',
          id: expect.any(String),
        },
        {
          name: 'inc6',
          value: '6',
          id: expect.any(String),
        },
      ]);
    });
  });

  describe('Get all  - [GET /collection]', () => {
    it('should get all collections associated with a user', async () => {
      const responseExpected = expect.arrayContaining([
        expect.objectContaining({ id: 'collection0' }),
        expect.objectContaining({ id: expect.any(String) }),
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
    it('should get folders by collections id', async () => {
      const response = await request(app.getHttpServer())
        .get('/collection/collection0/folders')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
          }),
        ]),
      );
    });
    it('should get enviroments by collections id', async () => {
      const response = await request(app.getHttpServer())
        .get('/collection/collection0/environments')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
          }),
        ]),
      );
    });

    it('should get environment by collections id and environment name', async () => {
      const environmentName = 'enviroment0';
      const response = await request(app.getHttpServer())
        .get('/collection/collection0/environment')
        .query({ name: environmentName })
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: environmentName,
          value: expect.any(String),
        }),
      );
    });

    it('should throw error when try to get environment that not exists', async () => {
      const environmentName = 'enviroment33';
      const response = await request(app.getHttpServer())
        .get('/collection/collection0/environment')
        .query({ name: environmentName })
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        ENVIROMENT_RESPONSE.ENVIRONMENT_EXISTS,
      );
    });
  });

  describe('Get one  - [GET /collection/:id]', () => {
    it('should get one collection associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .get('/collection/collection0')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: 'collection0',
          name: 'collection0',
        }),
      );
    });

    it('should get one collection associated with a team', async () => {
      const response = await request(app.getHttpServer())
        .get('/collection/collection2')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: 'collection2',
          name: 'collection2',
        }),
      );
    });

    it('should throw error when try to get one collection not associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .get('/collection/2')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_ID,
      );
    });
  });

  describe('Update one  - [PUT /collection/:id]', () => {
    it('should update one collection associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .patch('/collection')
        .send({
          name: 'collection updated',
          id: 'collection0',
        })
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        id: 'collection0',
        name: 'collection updated',
      });
    });
    it('should update one collection associated with a team', async () => {
      const response = await request(app.getHttpServer())
        .patch('/collection')
        .send({
          name: 'team collection updated',
          id: 'collection2',
          teamId: 'team1',
        })
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        id: 'collection2',
        name: 'team collection updated',
      });
    });
  });

  describe('Delete one  - [DELETE /collection/:id]', () => {
    const collectionId = 'collection0';
    it('should delete one collection associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/collection/${collectionId}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({});
    });

    it('should throw error when try to delete one collection not associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/collection/2')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_ID,
      );
    });
  });
  it('should delete all environments associated with a collection', async () => {
    const collectionId = 'collection1';
    const response = await request(app.getHttpServer())
      .delete(`/collection/${collectionId}/environments`)
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({});
  });
});
