import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { join } from 'path';
import * as request from 'supertest';

import { loadFixtures } from '@data/util/loader';

import { AppModule } from '@/app.module';
import { COGNITO_SERVICE } from '@/modules/auth/application/repository/cognito.interface.service';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guard/policy-auth.guard';
import { JwtStrategy } from '@/modules/auth/infrastructure/jwt/jwt.strategy';

import { INVOCATION_RESPONSE } from '../../application/exceptions/invocation-response.enum.dto';

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

describe('Invocation - [/invocation]', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [],
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

  describe('Create one  - [POST /invocation]', () => {
    it('It should create a new invocation', async () => {
      const responseExpected = expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        secretKey: expect.any(String),
        publicKey: expect.any(String),
        contractId: expect.any(String),
      });
      const response = await request(app.getHttpServer())
        .post('/invocation')
        .send({
          name: 'test',
          folderId: 'folder0',
          secretKey: 'test',
          publicKey: 'test',
          contractId: 'test contract',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual(responseExpected);
    });
    it('should throw error when try to create a new invocation not associated with a folder', async () => {
      const response = await request(app.getHttpServer())
        .post('/invocation')
        .send({
          name: 'test',
          folderId: 'folder',
          secretKey: 'test',
          publicKey: 'test',
          contractId: 'test contract',
        })
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        INVOCATION_RESPONSE.INVOCATION_FOLDER_NOT_EXISTS,
      );
    });
  });

  describe('Get all  - [GET /invocation]', () => {
    it('should get all invocations associated with a user', async () => {
      const responseExpected = expect.arrayContaining([
        expect.objectContaining({ id: 'invocation0' }),
        expect.objectContaining({ id: expect.any(String) }),
      ]);
      const response = await request(app.getHttpServer())
        .get('/invocation')
        .expect(HttpStatus.OK);

      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(responseExpected);
    });
    it('should only get invocations associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .get('/invocation')
        .expect(HttpStatus.OK);

      expect(response.body).toHaveLength(2);
    });
  });

  describe('Get one  - [GET /invocation/:id]', () => {
    it('should get one invocation associated with a user', async () => {
      const responseExpected = expect.objectContaining({
        id: 'invocation0',
        name: expect.any(String),
        secretKey: null,
        publicKey: null,
        contractId: null,
      });

      const response = await request(app.getHttpServer())
        .get('/invocation/invocation0')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(responseExpected);
    });

    it('should throw error when try to get one invocation not associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .get('/invocation/invocation1')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        INVOCATION_RESPONSE.Invocation_NOT_FOUND_BY_USER_AND_ID,
      );
    });
  });

  describe('Update one  - [PUT /invocation/:id]', () => {
    it('should update one invocation associated with a user', async () => {
      const responseExpected = expect.objectContaining({
        id: 'invocation0',
        name: 'invocation updated',
      });
      const response = await request(app.getHttpServer())
        .patch('/invocation')
        .send({
          name: 'invocation updated',
          id: 'invocation0',
        })
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(responseExpected);
    });
    it('should asign new method and remove old params', async () => {
      const responseExpected = expect.objectContaining({
        id: 'invocation0',
        name: 'invocation updated',
        selectedMethod: expect.objectContaining({ id: 'method2' }),
        params: [],
      });
      const response = await request(app.getHttpServer())
        .patch('/invocation')
        .send({
          name: 'invocation updated',
          id: 'invocation0',
          selectedMethodId: 'method2',
        })
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(responseExpected);
    });
    it('should throw error when try to update an invocation not associated with a folder', async () => {
      const response = await request(app.getHttpServer())
        .patch('/invocation')
        .send({
          name: 'invocation updated',
          id: 'invocation',
        })
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        INVOCATION_RESPONSE.Invocation_NOT_FOUND_BY_USER_AND_ID,
      );
    });
  });

  describe('Delete one  - [DELETE /invocation/:id]', () => {
    it('should delete one invocation associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/invocation/invocation0')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({});
    });

    it('should throw error when try to delete one invocation not associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/invocation/invocation1')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        INVOCATION_RESPONSE.Invocation_NOT_FOUND_BY_USER_AND_ID,
      );
    });
  });
});
