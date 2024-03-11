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
    it('should create a new folder', async () => {
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
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_USER_AND_ID,
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
    it('should throw error when try to get one folder not exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/folder/folder')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_USER_ID,
      );
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
  describe('Get all invocations - [GET /folder/:id/invocations]', () => {
    it('should get all invocations associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .get('/folder/folder0/invocations')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'invocation0',
            folderId: 'folder0',
            network: 'FUTURENET',
            id: 'invocation0',
          }),
        ]),
      );
    });
    it('should throw error when try to get all invocations not associated with the user', async () => {
      const response = await request(app.getHttpServer())
        .get('/folder/folder1/invocations')
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
          id: 'folder',
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
        .delete('/folder/folder')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_USER_ID,
      );
    });
  });

  describe('By Team - [/team/:teamId/folder]', () => {
    const validRoute = '/team/team0/folder';
    const invalidRoute = '/team/team1/folder';
    const unauthorizeRoute = '/team/team2/folder';

    describe('Create one  - [POST /folder]', () => {
      it('should create a new folder with a team', async () => {
        const response = await request(app.getHttpServer())
          .post(`${validRoute}`)
          .send({
            name: 'test',
            collectionId: 'collection2',
          })
          .expect(HttpStatus.CREATED);

        expect(response.body).toEqual({ name: 'test', id: expect.any(String) });
      });
      it('should throw error when try to create a new folder not associated with the team and collections', async () => {
        const response = await request(app.getHttpServer())
          .post(`${invalidRoute}`)
          .send({
            name: 'test',
            collectionId: 'collection2',
          })
          .expect(HttpStatus.NOT_FOUND);

        expect(response.body.message).toEqual(
          COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_TEAM,
        );
      });
      it('should throw an unauthorized error when trying to create a new folder with a user without the required role', async () => {
        const response = await request(app.getHttpServer())
          .post(`${unauthorizeRoute}`)
          .send({
            name: 'test',
            collectionId: 'collection4',
          })
          .expect(HttpStatus.UNAUTHORIZED);

        expect(response.body.message).toEqual(
          AUTH_RESPONSE.USER_ROLE_NOT_AUTHORIZED,
        );
      });
    });
    describe('Get one  - [GET /folder/:id]', () => {
      it('should get one folder associated with a team', async () => {
        const response = await request(app.getHttpServer())
          .get(`${validRoute}/folder2`)
          .expect(HttpStatus.OK);

        expect(response.body).toEqual({
          id: 'folder2',
          name: 'folder2',
          invocations: expect.any(Array),
        });
      });
      it('should throw error when try to get one folder not exist', async () => {
        const response = await request(app.getHttpServer())
          .get(`${invalidRoute}/folder`)
          .expect(HttpStatus.NOT_FOUND);

        expect(response.body.message).toEqual(
          FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_TEAM_ID,
        );
      });
      it('should throw error when try to get one folder not associated with a team', async () => {
        const response = await request(app.getHttpServer())
          .get(`${invalidRoute}/folder1`)
          .expect(HttpStatus.NOT_FOUND);

        expect(response.body.message).toEqual(
          FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_TEAM_ID,
        );
      });
    });
    describe('Get all invocations - [GET /folder/:id/invocations]', () => {
      it('should get all invocations associated with a team', async () => {
        const response = await request(app.getHttpServer())
          .get(`${validRoute}/folder2/invocations`)
          .expect(HttpStatus.OK);

        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'invocation2',
              folderId: 'folder2',
              network: 'FUTURENET',
              id: 'invocation2',
            }),
          ]),
        );
      });
      it('should throw error when try to get all invocations not associated with the team', async () => {
        const response = await request(app.getHttpServer())
          .get(`${validRoute}/folder/invocations`)
          .expect(HttpStatus.NOT_FOUND);

        expect(response.body.message).toEqual(
          FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_TEAM_ID,
        );
      });
    });
    describe('Update one  - [PUT /folder/:id]', () => {
      it('should update one folder associated with a team', async () => {
        const response = await request(app.getHttpServer())
          .patch(`${validRoute}`)
          .send({
            name: 'folder2 updated',
            id: 'folder2',
          })
          .expect(HttpStatus.OK);

        expect(response.body).toEqual({
          id: 'folder2',
          name: 'folder2 updated',
        });
      });
      it('should throw error when try to update one folder not associated with a team', async () => {
        const response = await request(app.getHttpServer())
          .patch(`${invalidRoute}`)
          .send({
            name: 'folder updated',
            id: 'folder',
          })
          .expect(HttpStatus.NOT_FOUND);

        expect(response.body.message).toEqual(
          FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_TEAM_ID,
        );
      });
      it('should throw an unauthorized error when try to update a new folder with a user without the required role', async () => {
        const response = await request(app.getHttpServer())
          .patch(`${unauthorizeRoute}`)
          .send({
            name: 'folder updated',
            id: 'folder4',
          })
          .expect(HttpStatus.UNAUTHORIZED);

        expect(response.body.message).toEqual(
          AUTH_RESPONSE.USER_ROLE_NOT_AUTHORIZED,
        );
      });
    });
    describe('Delete one  - [DELETE /folder/:id]', () => {
      it('should delete one folder associated with a team', async () => {
        const response = await request(app.getHttpServer())
          .delete(`${validRoute}/folder2`)
          .expect(HttpStatus.OK);

        expect(response.body).toEqual({});
      });
      it('should throw error when try to delete one folder not associated with a team', async () => {
        const response = await request(app.getHttpServer())
          .delete(`${invalidRoute}/folder1`)
          .expect(HttpStatus.NOT_FOUND);

        expect(response.body.message).toEqual(
          FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_TEAM_ID,
        );
      });
      it('should throw an unauthorized error when try to delete a new folder with a user without the required role', async () => {
        const response = await request(app.getHttpServer())
          .delete(`${unauthorizeRoute}/folder4`)
          .expect(HttpStatus.UNAUTHORIZED);

        expect(response.body.message).toEqual(
          AUTH_RESPONSE.USER_ROLE_NOT_AUTHORIZED,
        );
      });
    });
  });
});
