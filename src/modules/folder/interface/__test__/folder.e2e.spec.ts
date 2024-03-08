import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { join } from 'path';
import * as request from 'supertest';

import { loadFixtures } from '@data/util/loader';

import { AppModule } from '@/app.module';
import { COGNITO_SERVICE } from '@/modules/auth/application/repository/cognito.interface.service';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guard/policy-auth.guard';
import { JwtStrategy } from '@/modules/auth/infrastructure/jwt/jwt.strategy';
import { COLLECTION_RESPONSE } from '@/modules/collection/application/exceptions/collection-response.enum';

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
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_ID,
      );
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
    it('should get one folder associated with a team', async () => {
      const response = await request(app.getHttpServer())
        .get('/folder/folder2')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        id: 'folder2',
        name: 'folder2',
        invocations: expect.any(Array),
      });
    });
    it('should throw error when try to get one folder not exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/folder/folder')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(FOLDER_RESPONSE.FOLDER_NOT_FOUND);
    });
    it('should throw error when try to get one folder not associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .get('/folder/folder1')
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual(
        FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_COLLECTION_ID,
      );
    });
    it('should throw an error when trying to get a folder where the team admin does not match the user', async () => {
      const response = await request(app.getHttpServer())
        .get('/folder/folder3')
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual(
        FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_TEAM_ID,
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
          id: 'folder',
        })
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(FOLDER_RESPONSE.FOLDER_NOT_FOUND);
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
        .delete('/folder/folder')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(FOLDER_RESPONSE.FOLDER_NOT_FOUND);
    });
  });
});
