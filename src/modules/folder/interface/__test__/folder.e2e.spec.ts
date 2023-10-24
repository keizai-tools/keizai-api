import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { join } from 'path';
import * as request from 'supertest';

import { loadFixtures } from '@data/util/loader';

import { AppModule } from '@/app.module';
import { COGNITO_SERVICE } from '@/modules/auth/application/repository/cognito.interface.service';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guard/policy-auth.guard';
import { JwtStrategy } from '@/modules/auth/infrastructure/jwt/jwt.strategy';

import { FOLDER_RESPONSE } from '../../application/exceptions/folder-response.enum';

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

describe('Folder - [/folder]', () => {
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

  describe('Create one  - [POST /folder]', () => {
    it('It should create a new folder', async () => {
      const response = await request(app.getHttpServer())
        .post('/folder')
        .send({
          name: 'test',
          collectionId: 'collection0',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({ name: 'test', id: expect.any(String) });
    });
    it('should throw error when try to create a new folder not associated with the user and collections', async () => {
      const response = await request(app.getHttpServer())
        .post('/folder')
        .send({
          name: 'test',
          collectionId: 'collection',
        })
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_COLLECTION_AND_USER,
      );
    });
  });

  describe('Get all  - [GET /folder]', () => {
    it('should get all folders associated with a user', async () => {
      const responseExpected = expect.arrayContaining([
        expect.objectContaining({ id: 'folder0' }),
        expect.objectContaining({ id: expect.any(String) }),
      ]);
      const response = await request(app.getHttpServer())
        .get('/folder')
        .expect(HttpStatus.OK);

      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(responseExpected);
    });
    it('should only get folders associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .get('/folder')
        .expect(HttpStatus.OK);

      expect(response.body).toHaveLength(2);
    });
  });

  describe('Get one  - [GET /folder/:id]', () => {
    it('should get one folder associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .get('/folder/folder0')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        id: 'folder0',
        name: 'folder0',
        invocations: expect.any(Array),
      });
    });

    it('should throw error when try to get one folder not associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .get('/folder/folder1')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_USER_ID,
      );
    });
  });

  describe('Update one  - [PUT /folder/:id]', () => {
    it('should update one folder associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .patch('/folder')
        .send({
          name: 'folder updated',
          id: 'folder0',
        })
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        id: 'folder0',
        name: 'folder updated',
      });
    });
    it('should throw error when try to update one folder not associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .patch('/folder')
        .send({
          name: 'folder updated',
          id: 'folder1',
        })
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_USER_ID,
      );
    });
  });

  describe('Delete one  - [DELETE /folder/:id]', () => {
    it('should delete one folder associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/folder/folder0')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({});
    });

    it('should throw error when try to delete one folder not associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/folder/folder1')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_USER_ID,
      );
    });
  });
});
