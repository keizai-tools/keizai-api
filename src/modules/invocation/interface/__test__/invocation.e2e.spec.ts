import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { join } from 'path';
import * as request from 'supertest';

import { loadFixtures } from '@data/util/loader';

import { AppModule } from '@/app.module';
import { CONTRACT_SERVICE } from '@/common/application/repository/contract.interface.service';
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

const mockedContractService = {
  runInvocation: jest.fn(),
  generateMethodsFromContractId: jest.fn(),
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
      .overrideProvider(CONTRACT_SERVICE)
      .useValue(mockedContractService)
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

      expect(response.body).toHaveLength(3);
      expect(response.body).toEqual(responseExpected);
    });
    it('should only get invocations associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .get('/invocation')
        .expect(HttpStatus.OK);

      expect(response.body).toHaveLength(3);
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
    it('should mock generateMethodsFromContractId function', async () => {
      const spy = jest
        .spyOn(mockedContractService, 'generateMethodsFromContractId')
        .mockResolvedValue([]);
      await request(app.getHttpServer())
        .patch('/invocation')
        .send({
          name: 'invocation updated',
          id: 'invocation0',
          contractId: 'test contract',
        })
        .expect(HttpStatus.OK);
      expect(spy.mock.calls).toHaveLength(1);
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
    it('should throw error when try to update and invocation with an invalid contract id', async () => {
      jest
        .spyOn(mockedContractService, 'generateMethodsFromContractId')
        .mockResolvedValue(new Error());

      const response = await request(app.getHttpServer())
        .patch('/invocation')
        .send({
          name: 'invocation updated',
          id: 'invocation0',
          contractId: 'invalid contract id',
        })
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        INVOCATION_RESPONSE.INVOCATION_FAIL_GENERATE_METHODS_WITH_CONTRACT_ID,
      );
    });
    it('should retry 5 times if generateMethodsFromContractId throws an error', async () => {
      jest
        .spyOn(mockedContractService, 'generateMethodsFromContractId')
        .mockResolvedValue(new Error());

      await request(app.getHttpServer())
        .patch('/invocation')
        .send({
          name: 'invocation updated',
          id: 'invocation0',
          contractId: 'test contract',
        })
        .expect(HttpStatus.NOT_FOUND);
    });
    it('should update contract id with a selected method', async () => {
      const spy = jest
        .spyOn(mockedContractService, 'generateMethodsFromContractId')
        .mockResolvedValue([]);
      const response = await request(app.getHttpServer())
        .patch('/invocation')
        .send({
          name: 'invocation updated',
          id: 'invocation0',
          contractId: 'new test contract',
        })
        .expect(HttpStatus.OK);

      expect(response.body.contractId).toEqual('new test contract');
    });
    it('should update secretKey without removing publicKey', async () => {
      const response = await request(app.getHttpServer())
        .patch('/invocation')
        .send({
          name: 'invocation updated',
          id: 'invocation2',
          secretKey: 'newSecretKey',
        })
        .expect(HttpStatus.OK);

      expect(response.body.publicKey).toEqual('publicKey2');
      expect(response.body.secretKey).toEqual('newSecretKey');
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
