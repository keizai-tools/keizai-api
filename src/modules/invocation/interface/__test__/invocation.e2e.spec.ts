import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { join } from 'path';
import * as request from 'supertest';

import { loadFixtures } from '@data/util/loader';

import { AppModule } from '@/app.module';
import { CONTRACT_SERVICE } from '@/common/application/repository/contract.interface.service';
import { AUTH_RESPONSE } from '@/modules/auth/application/exceptions/auth-error';
import { COGNITO_SERVICE } from '@/modules/auth/application/repository/cognito.interface.service';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guard/policy-auth.guard';
import { JwtStrategy } from '@/modules/auth/infrastructure/jwt/jwt.strategy';
import { FOLDER_RESPONSE } from '@/modules/folder/application/exceptions/folder-response.enum';

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
  verifyNetwork: jest.fn(),
  changeNetwork: jest.fn(),
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Create one  - [POST /invocation]', () => {
    it('It should create a new invocation', async () => {
      const responseExpected = expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        secretKey: expect.any(String),
        publicKey: expect.any(String),
        contractId: expect.any(String),
        network: expect.any(String),
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
        FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_USER_ID,
      );
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
        .get('/invocation/invocation')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        INVOCATION_RESPONSE.Invocation_NOT_FOUND,
      );
    });
  });
  describe('Get all methods - [GET /invocation/:id/methods]', () => {
    it('should get all methods associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .get('/invocation/invocation0/methods')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'method0',
            invocationId: 'invocation0',
            id: 'method0',
          }),
          expect.objectContaining({
            name: 'method2',
            invocationId: 'invocation0',
            id: 'method2',
          }),
        ]),
      );
    });
    it('should throw error when try to get all methods not associated with a user', async () => {
      const response = await request(app.getHttpServer())
        .get('/invocation/invocation1')
        .expect(HttpStatus.BAD_REQUEST);

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

    it('should remove methods associated with an invocation when update the contract', async () => {
      jest
        .spyOn(mockedContractService, 'generateMethodsFromContractId')
        .mockResolvedValue([
          {
            name: 'method3',
            inputs: [],
            outputs: [],
            docs: 'doc0',
          },
        ]);

      const expectedResponse = expect.objectContaining({
        id: 'invocation0',
        selectedMethod: null,
        contractId: 'contract test',
        methods: expect.arrayContaining([
          expect.objectContaining({
            name: 'method3',
          }),
        ]),
      });
      const response = await request(app.getHttpServer())
        .patch('/invocation')
        .send({
          id: 'invocation0',
          contractId: 'contract test',
        })
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(expectedResponse);

      expect(response.body.methods).toHaveLength(1);

      await request(app.getHttpServer())
        .get('/method/method2')
        .expect(HttpStatus.NOT_FOUND);

      await request(app.getHttpServer())
        .get('/method/method0')
        .expect(HttpStatus.NOT_FOUND);
    });
    it('should throw error when try to update selected method and contract at the same time', async () => {
      const response = await request(app.getHttpServer())
        .patch('/invocation')
        .send({
          name: 'invocation updated',
          id: 'invocation0',
          contractId: 'test contract',
          selectedMethodId: 'method2',
        })
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        INVOCATION_RESPONSE.INVOCATION_FAIL_WITH_NEW_CONTRACT_AND_NEW_METHOD,
      );
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
        INVOCATION_RESPONSE.Invocation_NOT_FOUND,
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
      jest
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
    it('should update contract id with a environment', async () => {
      jest
        .spyOn(mockedContractService, 'generateMethodsFromContractId')
        .mockResolvedValue([]);
      const contractId = '{{contract_id}}';
      const response = await request(app.getHttpServer())
        .patch('/invocation')
        .send({
          id: 'invocation0',
          contractId,
        })
        .expect(HttpStatus.OK);

      expect(response.body.contractId).toEqual(contractId);
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

    it('should update pre invocation code', async () => {
      const preInvocationValue = 'console.log("pre invocation")';
      const response = await request(app.getHttpServer())
        .patch('/invocation')
        .send({
          preInvocation: preInvocationValue,
          id: 'invocation2',
        })
        .expect(HttpStatus.OK);

      expect(response.body.preInvocation).toEqual(preInvocationValue);
    });

    it('should update post invocation code', async () => {
      const postInvocationValue = 'console.log("post invocation")';
      const response = await request(app.getHttpServer())
        .patch('/invocation')
        .send({
          preInvocation: postInvocationValue,
          id: 'invocation2',
        })
        .expect(HttpStatus.OK);

      expect(response.body.preInvocation).toEqual(postInvocationValue);
    });
  });

  describe('Update Network - [PUT /invocation]', () => {
    it('should throw error when the invocation id is incorrect', async () => {
      const response = await request(app.getHttpServer())
        .patch('/invocation')
        .send({ network: 'TESTNET', id: 'invocation' })
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        INVOCATION_RESPONSE.Invocation_NOT_FOUND,
      );
    });
    it('should change to TESTNET network', async () => {
      const responseExpected = expect.objectContaining({
        secretKey: null,
        publicKey: null,
        preInvocation: null,
        postInvocation: null,
        contractId: null,
        network: 'TESTNET',
        id: 'invocation0',
        methods: [],
        selectedMethod: null,
      });

      const response = await request(app.getHttpServer())
        .patch('/invocation')
        .send({ network: 'TESTNET', id: 'invocation0' })
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(responseExpected);
    });
    it('should change to FUTURENET network', async () => {
      const responseExpected = expect.objectContaining({
        secretKey: null,
        publicKey: null,
        preInvocation: null,
        postInvocation: null,
        contractId: null,
        network: 'FUTURENET',
        id: 'invocation0',
        methods: [],
        selectedMethod: null,
      });

      const response = await request(app.getHttpServer())
        .patch('/invocation')
        .send({ network: 'FUTURENET', id: 'invocation0' })
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(responseExpected);
    });
  });

  describe('Run all - [GET /invocation/run]', () => {
    it('should run correctly the invocation', async () => {
      const invocationId = 'invocation5';
      await request(app.getHttpServer())
        .get(`/invocation/${invocationId}/run`)
        .expect(HttpStatus.OK);
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
        .delete('/invocation/invocation')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual(
        INVOCATION_RESPONSE.Invocation_NOT_FOUND,
      );
    });
  });

  describe('Run one  - [GET /invocation/:id/run]', () => {
    it('should validate all required fields', async () => {
      const response = await request(app.getHttpServer())
        .get('/invocation/invocation4/run')
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual(
        INVOCATION_RESPONSE.INVOCATION_FAILED_TO_RUN_WITHOUT_KEYS_OR_SELECTED_METHOD,
      );
    });
    it('should validate missing params', async () => {
      const response = await request(app.getHttpServer())
        .get('/invocation/invocation4/run')
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual(
        INVOCATION_RESPONSE.INVOCATION_FAILED_TO_RUN_WITHOUT_KEYS_OR_SELECTED_METHOD,
      );
    });
  });
  describe('By Team - [/team/:teamId/invocation]', () => {
    const validRoute = '/team/team0/invocation';
    const invalidRoute = '/team/team1/invocation';
    const unauthorizeRoute = '/team/team2/invocation';

    describe('Create one  - [POST /invocation]', () => {
      it('should create a new invocation', async () => {
        const responseExpected = expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          secretKey: expect.any(String),
          publicKey: expect.any(String),
          contractId: expect.any(String),
          network: expect.any(String),
        });
        const response = await request(app.getHttpServer())
          .post(`${validRoute}`)
          .send({
            name: 'test',
            folderId: 'folder2',
            secretKey: 'test',
            publicKey: 'test',
            contractId: 'test contract',
          })
          .expect(HttpStatus.CREATED);

        expect(response.body).toEqual(responseExpected);
      });
      it('should throw error when try to create a new invocation not associated with a team', async () => {
        const response = await request(app.getHttpServer())
          .post(`${invalidRoute}`)
          .send({
            name: 'test',
            folderId: 'folder2',
            secretKey: 'test',
            publicKey: 'test',
            contractId: 'test contract',
          })
          .expect(HttpStatus.NOT_FOUND);

        expect(response.body.message).toEqual(
          FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_TEAM_ID,
        );
      });
      it('should throw an unauthorize error when try to create a new invocation with a user without the required role', async () => {
        const response = await request(app.getHttpServer())
          .post(`${unauthorizeRoute}`)
          .send({
            name: 'test',
            folderId: 'folder2',
            secretKey: 'test',
            publicKey: 'test',
            contractId: 'test contract',
          })
          .expect(HttpStatus.UNAUTHORIZED);

        expect(response.body.message).toEqual(
          AUTH_RESPONSE.USER_ROLE_NOT_AUTHORIZED,
        );
      });
    });
    describe('Get one  - [GET /invocation/:id]', () => {
      it('should get one invocation associated with a team', async () => {
        const responseExpected = expect.objectContaining({
          id: 'invocation6',
          name: expect.any(String),
          secretKey: null,
          publicKey: null,
          contractId: null,
        });

        const response = await request(app.getHttpServer())
          .get(`${validRoute}/invocation6`)
          .expect(HttpStatus.OK);

        expect(response.body).toEqual(responseExpected);
      });
      it('should throw error when try to get one invocation not associated with a team', async () => {
        const response = await request(app.getHttpServer())
          .get(`${invalidRoute}/invocation7`)
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body.message).toEqual(
          INVOCATION_RESPONSE.Invocation_NOT_FOUND_BY_TEAM_AND_ID,
        );
      });
    });
    describe('Get all methods - [GET /invocation/:id/methods]', () => {
      it('should get all methods associated with a team', async () => {
        const response = await request(app.getHttpServer())
          .get(`${validRoute}/invocation6/methods`)
          .expect(HttpStatus.OK);

        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'method5',
              invocationId: 'invocation6',
              id: 'method5',
            }),
            expect.objectContaining({
              name: 'method7',
              invocationId: 'invocation6',
              id: 'method7',
            }),
          ]),
        );
      });
      it('should throw error when try to get all methods not associated with a team', async () => {
        const response = await request(app.getHttpServer())
          .get(`${invalidRoute}/invocation7/methods`)
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body.message).toEqual(
          INVOCATION_RESPONSE.Invocation_NOT_FOUND_BY_TEAM_AND_ID,
        );
      });
    });
    describe('Update one  - [PUT /invocation]', () => {
      it('should update one invocation associated with a TEAM', async () => {
        const responseExpected = expect.objectContaining({
          id: 'invocation6',
          name: 'invocation updated',
        });
        const response = await request(app.getHttpServer())
          .patch(`${validRoute}`)
          .send({
            name: 'invocation updated',
            id: 'invocation6',
          })
          .expect(HttpStatus.OK);

        expect(response.body).toEqual(responseExpected);
      });
      it('should mock generateMethodsFromContractId function', async () => {
        const spy = jest
          .spyOn(mockedContractService, 'generateMethodsFromContractId')
          .mockResolvedValue([]);
        await request(app.getHttpServer())
          .patch(`${validRoute}`)
          .send({
            name: 'invocation updated',
            id: 'invocation6',
            contractId: 'test contract',
          })
          .expect(HttpStatus.OK);
        expect(spy.mock.calls).toHaveLength(1);
      });
      it('should remove methods associated with an invocation when update the contract', async () => {
        jest
          .spyOn(mockedContractService, 'generateMethodsFromContractId')
          .mockResolvedValue([
            {
              name: 'method5',
              inputs: [],
              outputs: [],
              docs: 'doc0',
            },
          ]);

        const expectedResponse = expect.objectContaining({
          id: 'invocation6',
          selectedMethod: null,
          contractId: 'contract test',
          methods: expect.arrayContaining([
            expect.objectContaining({
              name: 'method5',
            }),
          ]),
        });
        const response = await request(app.getHttpServer())
          .patch(`${validRoute}`)
          .send({
            id: 'invocation6',
            contractId: 'contract test',
          })
          .expect(HttpStatus.OK);

        expect(response.body).toEqual(expectedResponse);

        expect(response.body.methods).toHaveLength(1);

        await request(app.getHttpServer())
          .get('/method/method5')
          .expect(HttpStatus.NOT_FOUND);

        await request(app.getHttpServer())
          .get('/method/method7')
          .expect(HttpStatus.NOT_FOUND);
      });
      it('should throw error when try to update selected method and contract at the same time', async () => {
        const response = await request(app.getHttpServer())
          .patch(`${validRoute}`)
          .send({
            name: 'invocation updated',
            id: 'invocation6',
            contractId: 'test contract',
            selectedMethodId: 'method7',
          })
          .expect(HttpStatus.NOT_FOUND);

        expect(response.body.message).toEqual(
          INVOCATION_RESPONSE.INVOCATION_FAIL_WITH_NEW_CONTRACT_AND_NEW_METHOD,
        );
      });
      it('should throw error when try to update an invocation not associated with a folder', async () => {
        const response = await request(app.getHttpServer())
          .patch(`${validRoute}`)
          .send({
            name: 'invocation updated',
            id: 'invocation',
          })
          .expect(HttpStatus.NOT_FOUND);

        expect(response.body.message).toEqual(
          INVOCATION_RESPONSE.Invocation_NOT_FOUND,
        );
      });
      it('should throw error when try to update and invocation with an invalid contract id', async () => {
        jest
          .spyOn(mockedContractService, 'generateMethodsFromContractId')
          .mockResolvedValue(new Error());

        const response = await request(app.getHttpServer())
          .patch(`${validRoute}`)
          .send({
            name: 'invocation updated',
            id: 'invocation6',
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
          .patch(`${validRoute}`)
          .send({
            name: 'invocation updated',
            id: 'invocation6',
            contractId: 'test contract',
          })
          .expect(HttpStatus.NOT_FOUND);
      });
      it('should update contract id with a selected method', async () => {
        jest
          .spyOn(mockedContractService, 'generateMethodsFromContractId')
          .mockResolvedValue([]);
        const response = await request(app.getHttpServer())
          .patch(`${validRoute}`)
          .send({
            name: 'invocation updated',
            id: 'invocation6',
            contractId: 'new test contract',
          })
          .expect(HttpStatus.OK);

        expect(response.body.contractId).toEqual('new test contract');
      });
      it('should update contract id with a environment', async () => {
        jest
          .spyOn(mockedContractService, 'generateMethodsFromContractId')
          .mockResolvedValue([]);
        const contractId = '{{contract_id}}';
        const response = await request(app.getHttpServer())
          .patch(`${validRoute}`)
          .send({
            id: 'invocation6',
            contractId,
          })
          .expect(HttpStatus.OK);

        expect(response.body.contractId).toEqual(contractId);
      });
      it('should update secretKey without removing publicKey', async () => {
        const response = await request(app.getHttpServer())
          .patch(`${validRoute}`)
          .send({
            name: 'invocation updated',
            id: 'invocation8',
            secretKey: 'newSecretKey',
          })
          .expect(HttpStatus.OK);

        expect(response.body.publicKey).toEqual('publicKey2');
        expect(response.body.secretKey).toEqual('newSecretKey');
      });
      it('should update pre invocation code', async () => {
        const preInvocationValue = 'console.log("pre invocation")';
        const response = await request(app.getHttpServer())
          .patch(`${validRoute}`)
          .send({
            preInvocation: preInvocationValue,
            id: 'invocation6',
          })
          .expect(HttpStatus.OK);

        expect(response.body.preInvocation).toEqual(preInvocationValue);
      });
      it('should update post invocation code', async () => {
        const postInvocationValue = 'console.log("post invocation")';
        const response = await request(app.getHttpServer())
          .patch(`${validRoute}`)
          .send({
            preInvocation: postInvocationValue,
            id: 'invocation6',
          })
          .expect(HttpStatus.OK);

        expect(response.body.preInvocation).toEqual(postInvocationValue);
      });
    });
    describe('Update Network - [PUT /invocation]', () => {
      it('should throw error when the invocation id is incorrect', async () => {
        const response = await request(app.getHttpServer())
          .patch(`${validRoute}`)
          .send({ network: 'TESTNET', id: 'invocation' })
          .expect(HttpStatus.NOT_FOUND);

        expect(response.body.message).toEqual(
          INVOCATION_RESPONSE.Invocation_NOT_FOUND,
        );
      });
      it('should change to TESTNET network', async () => {
        const responseExpected = expect.objectContaining({
          network: 'TESTNET',
          id: 'invocation6',
          methods: [],
        });

        const response = await request(app.getHttpServer())
          .patch(`${validRoute}`)
          .send({ network: 'TESTNET', id: 'invocation6' })
          .expect(HttpStatus.OK);

        expect(response.body).toEqual(responseExpected);
      });
      it('should change to FUTURENET network', async () => {
        const responseExpected = expect.objectContaining({
          network: 'FUTURENET',
          id: 'invocation6',
        });

        const response = await request(app.getHttpServer())
          .patch(`${validRoute}`)
          .send({ network: 'FUTURENET', id: 'invocation6' })
          .expect(HttpStatus.OK);

        expect(response.body).toEqual(responseExpected);
      });
    });
    describe('Run one  - [GET /invocation/:id/run]', () => {
      it('should run correctly the invocation', async () => {
        await request(app.getHttpServer())
          .get(`${validRoute}/invocation11/run`)
          .expect(HttpStatus.OK);
      });
      it('should validate all required fields', async () => {
        const response = await request(app.getHttpServer())
          .get(`${validRoute}/invocation10/run`)
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body.message).toEqual(
          INVOCATION_RESPONSE.INVOCATION_FAILED_TO_RUN_WITHOUT_KEYS_OR_SELECTED_METHOD,
        );
      });
    });
    describe('Delete one  - [DELETE /invocation/:id]', () => {
      it('should delete one invocation associated with a team', async () => {
        const response = await request(app.getHttpServer())
          .delete(`${validRoute}/invocation6`)
          .expect(HttpStatus.OK);

        expect(response.body).toEqual({});
      });
      it('should throw error when try to delete one invocation not associated with a team', async () => {
        const response = await request(app.getHttpServer())
          .delete(`${invalidRoute}/invocation7`)
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body.message).toEqual(
          INVOCATION_RESPONSE.Invocation_NOT_FOUND_BY_TEAM_AND_ID,
        );
      });
      it('should throw an unauthorize error when try to delete an invocation with a user without the required role', async () => {
        const response = await request(app.getHttpServer())
          .delete(`${unauthorizeRoute}/invocation11`)
          .expect(HttpStatus.UNAUTHORIZED);

        expect(response.body.message).toEqual(
          AUTH_RESPONSE.USER_ROLE_NOT_AUTHORIZED,
        );
      });
    });
  });
});
