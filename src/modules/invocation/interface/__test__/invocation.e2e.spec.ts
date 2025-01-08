import {
  ClassSerializerInterceptor,
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { join } from 'path';

import { loadFixtures } from '@data/util/loader';

import { AppModule } from '@/app.module';
import { COGNITO_AUTH } from '@/common/cognito/application/interface/cognito.service.interface';
import { AllExceptionsFilter } from '@/common/response_service/filter/all_exceptions.filter';
import { SuccessResponseInterceptor } from '@/common/response_service/interceptor/success_response.interceptor';
import { CONTRACT_SERVICE } from '@/common/stellar_service/application/interface/contract.service.interface';
import { AUTH_RESPONSE } from '@/modules/authorization/infraestructure/policy/exceptions/auth-error';
import { FOLDER_RESPONSE } from '@/modules/folder/application/exceptions/folder-response.enum';
import { METHOD_RESPONSE } from '@/modules/method/application/exceptions/method-response.enum';
import {
  identityProviderServiceMock,
  mockedContractService,
} from '@/test/test.module.bootstrapper';
import { createAccessToken, makeRequest } from '@/test/test.util';

import { INVOCATION_RESPONSE } from '../../application/exceptions/invocation-response.enum.dto';

describe('Invocation - [/invocation]', () => {
  let app: INestApplication;

  const adminToken = createAccessToken({
    sub: '00000000-0000-0000-0000-00000000000X',
  });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(COGNITO_AUTH)
      .useValue(identityProviderServiceMock)
      .overrideProvider(CONTRACT_SERVICE)
      .useValue(mockedContractService)
      .compile();

    await loadFixtures({
      fixturesPath: `${__dirname}/fixture`,
      dataSourcePath: join(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'configuration/orm.configuration.ts',
      ),
    });

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    app.useGlobalInterceptors(new SuccessResponseInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
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

      const response = await makeRequest({
        app,
        method: 'post',
        authCode: adminToken,
        endpoint: '/invocation',
        data: {
          name: 'test',
          folderId: 'folder0',
          secretKey: 'test',
          publicKey: 'test',
          contractId: 'test contract',
        },
      });

      expect(response.body.payload).toEqual(responseExpected);
    });

    it('should throw error when try to create a new invocation not associated with a folder', async () => {
      const response = await makeRequest({
        app,
        method: 'post',
        authCode: adminToken,
        endpoint: '/invocation',
        data: {
          name: 'test',
          folderId: 'folder',
          secretKey: 'test',
          publicKey: 'test',
          contractId: 'test contract',
        },
      });

      expect(response.body.details.description).toEqual(
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

      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/invocation/invocation0',
      });

      expect(response.body.payload).toEqual(responseExpected);
    });

    it('should throw error when try to get one invocation not associated with a user', async () => {
      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/invocation/invocation',
      });

      expect(response.body.details.description).toEqual(
        INVOCATION_RESPONSE.INVOCATION_UNAVAILABLE,
      );
    });
  });

  describe('Get all methods - [GET /invocation/:id/methods]', () => {
    it('should get all methods associated with a user', async () => {
      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/invocation/invocation0/methods',
      });

      expect(response.body.payload).toEqual(
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
      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/invocation/invocation1',
      });

      expect(response.body.details.description).toEqual(
        INVOCATION_RESPONSE.INVOCATION_NOT_FOUND_FOR_USER_AND_ID,
      );
    });
  });

  describe('Update one  - [PATCH /invocation/:id]', () => {
    it('should update one invocation associated with a user', async () => {
      const responseExpected = expect.objectContaining({
        id: 'invocation0',
        name: 'invocation updated',
      });

      const response = await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/invocation',
        data: {
          name: 'invocation updated',
          id: 'invocation0',
        },
      });

      expect(response.body.payload).toEqual(responseExpected);
    });

    it('should mock generateMethodsFromContractId function', async () => {
      const spy = jest
        .spyOn(mockedContractService, 'generateMethodsFromContractId')
        .mockResolvedValue([]);

      await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/invocation',
        data: {
          name: 'invocation updated',
          id: 'invocation0',
          contractId: 'test contract',
        },
      });

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

      const response = await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/invocation',
        data: {
          id: 'invocation0',
          contractId: 'contract test',
        },
      });

      expect(response.body.payload).toEqual(expectedResponse);

      expect(response.body.payload.methods).toHaveLength(1);

      const responseMethod2 = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/method/method2',
      });

      expect(responseMethod2.body.details.description).toEqual(
        METHOD_RESPONSE.METHOD_NOT_FOUND,
      );

      const responseMethod0 = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: '/method/method0',
      });

      expect(responseMethod0.body.details.description).toEqual(
        METHOD_RESPONSE.METHOD_NOT_FOUND,
      );
    });

    it('should throw error when try to update selected method and contract at the same time', async () => {
      const response = await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/invocation',
        data: {
          name: 'invocation updated',
          id: 'invocation0',
          contractId: 'test contract',
          selectedMethodId: 'method2',
        },
      });

      expect(response.body.details.description).toEqual(
        INVOCATION_RESPONSE.INVOCATION_FAIL_WITH_NEW_CONTRACT_AND_NEW_METHOD,
      );
    });

    it('should throw error when try to update an invocation not associated with a folder', async () => {
      const response = await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/invocation',
        data: {
          name: 'invocation updated',
          id: 'invocation',
        },
      });

      expect(response.body.details.description).toEqual(
        INVOCATION_RESPONSE.INVOCATION_UNAVAILABLE,
      );
    });

    it('should throw error when try to update and invocation with an invalid contract id', async () => {
      jest
        .spyOn(mockedContractService, 'generateMethodsFromContractId')
        .mockRejectedValue(
          new NotFoundException(
            INVOCATION_RESPONSE.INVOCATION_FAIL_GENERATE_METHODS_WITH_CONTRACT_ID,
          ),
        );

      const response = await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/invocation',
        data: {
          name: 'invocation updated',
          id: 'invocation0',
          contractId: 'invalid contract id',
        },
      });

      expect(response.body.details.description).toEqual(
        INVOCATION_RESPONSE.INVOCATION_FAIL_GENERATE_METHODS_WITH_CONTRACT_ID,
      );
    });

    it('should retry 5 times if generateMethodsFromContractId throws an error', async () => {
      jest
        .spyOn(mockedContractService, 'generateMethodsFromContractId')
        .mockResolvedValue([]);

      await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/invocation',
        data: {
          name: 'invocation updated',
          id: 'invocation0',
          contractId: 'test contract',
        },
      });
    });

    it('should update contract id with a selected method', async () => {
      jest
        .spyOn(mockedContractService, 'generateMethodsFromContractId')
        .mockResolvedValue([]);

      const response = await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/invocation',
        data: {
          name: 'invocation updated',
          id: 'invocation0',
          contractId: 'new test contract',
        },
      });

      expect(response.body.payload.contractId).toEqual('new test contract');
    });

    it('should update contract id with a environment', async () => {
      jest
        .spyOn(mockedContractService, 'generateMethodsFromContractId')
        .mockResolvedValue([]);

      const contractId = '{{contract_id}}';

      const response = await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/invocation',
        data: {
          id: 'invocation0',
          contractId,
        },
      });

      expect(response.body.payload.contractId).toEqual(contractId);
    });

    it('should update secretKey without removing publicKey', async () => {
      const response = await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/invocation',
        data: {
          name: 'invocation updated',
          id: 'invocation2',
          secretKey: 'newSecretKey',
        },
      });

      expect(response.body.payload.publicKey).toEqual('publicKey2');
      expect(response.body.payload.secretKey).toEqual('newSecretKey');
    });

    it('should update pre invocation code', async () => {
      const preInvocationValue = 'console.log("pre invocation")';
      const response = await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/invocation',
        data: {
          preInvocation: preInvocationValue,
          id: 'invocation2',
        },
      });

      expect(response.body.payload.preInvocation).toEqual(preInvocationValue);
    });

    it('should update post invocation code', async () => {
      const postInvocationValue = 'console.log("post invocation")';
      const response = await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/invocation',
        data: {
          preInvocation: postInvocationValue,
          id: 'invocation2',
        },
      });

      expect(response.body.payload.preInvocation).toEqual(postInvocationValue);
    });
  });

  describe('Update Network - [PATCH /invocation]', () => {
    it('should throw error when the invocation id is incorrect', async () => {
      const response = await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/invocation',
        data: { network: 'TESTNET', id: 'invocation' },
      });

      expect(response.body.details.description).toEqual(
        INVOCATION_RESPONSE.INVOCATION_UNAVAILABLE,
      );
    });

    it('should change network when contractId exists', async () => {
      const responseExpected = expect.objectContaining({
        contractId: '{{contract_id}}',
        folder: {
          id: 'folder0',
          name: 'folder0',
        },
        folderId: 'folder0',
        id: 'invocation0',
        methods: [],
        name: 'invocation updated',
        network: 'FUTURENET',
        postInvocation: null,
        preInvocation: null,
        publicKey: null,
        secretKey: null,
        selectedMethod: null,
      });

      const response = await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/invocation',
        data: {
          network: 'TESTNET',
          id: 'invocation0',
        },
      });

      expect(response.body.payload).toEqual(responseExpected);
    });

    it('should change to FUTURENET network', async () => {
      const responseExpected = expect.objectContaining({
        contractId: '{{contract_id}}',
        folder: {
          id: 'folder0',
          name: 'folder0',
        },
        id: 'invocation0',
        methods: [],
        name: 'invocation updated',
        network: 'FUTURENET',
        postInvocation: null,
        preInvocation: null,
        publicKey: null,
        secretKey: null,
        selectedMethod: null,
      });

      const response = await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/invocation',
        data: { network: 'FUTURENET', id: 'invocation0' },
      });

      expect(response.body.payload).toEqual(responseExpected);
    });

    it('create a new invocation and should change to TESTNET network', async () => {
      const responseExpected = expect.objectContaining({
        name: 'test',
        secretKey: 'test',
        publicKey: 'test',
        preInvocation: null,
        postInvocation: null,
        contractId: null,
        network: 'TESTNET',
        id: expect.any(String),
        folder: { name: 'folder0', id: 'folder0' },
        folderId: 'folder0',
        methods: [],
        selectedMethod: null,
      });

      const responseMakeInvocation = await makeRequest({
        app,
        method: 'post',
        authCode: adminToken,
        endpoint: '/invocation',
        data: {
          name: 'test',
          folderId: 'folder0',
          secretKey: 'test',
          publicKey: 'test',
        },
      });

      const response = await makeRequest({
        app,
        method: 'patch',
        authCode: adminToken,
        endpoint: '/invocation',
        data: {
          network: 'TESTNET',
          id: responseMakeInvocation.body.payload.id,
        },
      });

      expect(response.body.payload).toEqual(responseExpected);
    });
  });

  describe('Run all - [POST /invocation/run]', () => {
    it('should run correctly the invocation', async () => {
      const invocationId = 'invocation5';
      const response = await makeRequest({
        app,
        method: 'post',
        authCode: adminToken,
        endpoint: `/invocation/${invocationId}/run`,
      });

      expect(response.body).toEqual({
        success: true,
        statusCode: 200,
        message: 'Invocation run',
        timestamp: expect.any(String),
        path: `/invocation/${invocationId}/run`,
      });
    });

    it('should run correctly the invocation with a signed xdr', async () => {
      const invocationId = 'invocation12';
      const response = await makeRequest({
        app,
        authCode: adminToken,
        endpoint: `/invocation/${invocationId}/run`,
        data: { signedTransactionXDR: 'xdr' },
        method: 'post',
      });

      expect(response.body).toEqual({
        success: true,
        statusCode: 200,
        message: 'Invocation run',
        timestamp: expect.any(String),
        path: `/invocation/${invocationId}/run`,
      });
    });
  });

  describe('Delete one  - [DELETE /invocation/:id]', () => {
    it('should delete one invocation associated with a user', async () => {
      const response = await makeRequest({
        app,
        method: 'delete',
        authCode: adminToken,
        endpoint: '/invocation/invocation0',
      });

      expect(response.body).toEqual({
        success: true,
        statusCode: 202,
        message: 'Invocation deleted',
        payload: true,
        timestamp: expect.any(String),
        path: '/invocation/invocation0',
      });
    });

    it('should throw error when try to delete one invocation not associated with a user', async () => {
      const response = await makeRequest({
        app,
        method: 'delete',
        authCode: adminToken,
        endpoint: '/invocation/invocation',
      });

      expect(response.body.details.description).toEqual(
        INVOCATION_RESPONSE.INVOCATION_UNAVAILABLE,
      );
    });
  });

  describe('Run one  - [POST /invocation/:id/run]', () => {
    it('should validate all required fields', async () => {
      const response = await makeRequest({
        app,
        method: 'post',
        authCode: adminToken,
        endpoint: '/invocation/invocation4/run',
      });

      expect(response.body.details.description).toEqual(
        INVOCATION_RESPONSE.INVOCATION_FAILED_TO_RUN_WITHOUT_KEYS_OR_SELECTED_METHOD,
      );
    });

    it('should validate missing params', async () => {
      const response = await makeRequest({
        app,
        method: 'post',
        authCode: adminToken,
        endpoint: '/invocation/invocation4/run',
      });

      expect(response.body.details.description).toEqual(
        INVOCATION_RESPONSE.INVOCATION_FAILED_TO_RUN_WITHOUT_KEYS_OR_SELECTED_METHOD,
      );
    });

    it('should validate missing params', async () => {
      const response = await makeRequest({
        app,
        method: 'post',
        authCode: adminToken,
        endpoint: '/invocation/invocation4/run',
      });

      expect(response.body.details.description).toEqual(
        INVOCATION_RESPONSE.INVOCATION_FAILED_TO_RUN_WITHOUT_KEYS_OR_SELECTED_METHOD,
      );
    });
  });

  describe('Upload wasm  - [POST /invocation/:id/upload/wasm]', () => {
    it('should deploy a new contract', async () => {
      const response = await makeRequest({
        app,
        method: 'post',
        authCode: adminToken,
        endpoint: '/invocation/invocation15/upload/wasm',
        files: {
          wasm: Buffer.from('Ambassador'),
        },
      });

      expect(response.body).toEqual({
        success: true,
        statusCode: 202,
        message: 'Wasm file uploaded',
        timestamp: expect.any(String),
        path: '/invocation/invocation15/upload/wasm',
      });
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

        const response = await makeRequest({
          app,
          method: 'post',
          authCode: adminToken,
          endpoint: `${validRoute}`,
          data: {
            name: 'test',
            folderId: 'folder2',
            secretKey: 'test',
            publicKey: 'test',
            contractId: 'test contract',
          },
        });

        expect(response.body.payload).toEqual(responseExpected);
      });

      it('should throw error when try to create a new invocation not associated with a team', async () => {
        const response = await makeRequest({
          app,
          method: 'post',
          authCode: adminToken,
          endpoint: `${invalidRoute}`,
          data: {
            name: 'test',
            folderId: 'folder2',
            secretKey: 'test',
            publicKey: 'test',
            contractId: 'test contract',
          },
        });

        expect(response.body.details.description).toEqual(
          FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_TEAM_ID,
        );
      });

      it('should throw an unauthorize error when try to create a new invocation with a user without the required role', async () => {
        const response = await makeRequest({
          app,
          method: 'post',
          authCode: adminToken,
          endpoint: `${unauthorizeRoute}`,
          data: {
            name: 'test',
            folderId: 'folder2',
            secretKey: 'test',
            publicKey: 'test',
            contractId: 'test contract',
          },
        });

        expect(response.body.details.description).toEqual(
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

        const response = await makeRequest({
          app,
          authCode: adminToken,
          endpoint: `${validRoute}/invocation6`,
        });

        expect(response.body.payload).toEqual(responseExpected);
      });

      it('should throw error when try to get one invocation not associated with a team', async () => {
        const response = await makeRequest({
          app,
          authCode: adminToken,
          endpoint: `${invalidRoute}/invocation7`,
        });

        expect(response.body.details.description).toEqual(
          INVOCATION_RESPONSE.INVOCATION_NOT_FOUND_FOR_TEAM_AND_ID,
        );
      });
    });

    describe('Get all methods - [GET /invocation/:id/methods]', () => {
      it('should get all methods associated with a team', async () => {
        const response = await makeRequest({
          app,
          authCode: adminToken,
          endpoint: `${validRoute}/invocation6/methods`,
        });

        expect(response.body.payload).toEqual(
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
        const response = await makeRequest({
          app,
          authCode: adminToken,
          endpoint: `${invalidRoute}/invocation7/methods`,
        });

        expect(response.body.details.description).toEqual(
          INVOCATION_RESPONSE.INVOCATION_NOT_FOUND_FOR_TEAM_AND_ID,
        );
      });
    });

    describe('Update one  - [PATCH /invocation]', () => {
      it('should update one invocation associated with a TEAM', async () => {
        const responseExpected = expect.objectContaining({
          id: 'invocation6',
          name: 'invocation updated',
        });

        const response = await makeRequest({
          app,
          method: 'patch',
          authCode: adminToken,
          endpoint: `${validRoute}`,
          data: {
            name: 'invocation updated',
            id: 'invocation6',
          },
        });

        expect(response.body.payload).toEqual(responseExpected);
      });

      it('should mock generateMethodsFromContractId function', async () => {
        const spy = jest
          .spyOn(mockedContractService, 'generateMethodsFromContractId')
          .mockResolvedValue([]);

        await makeRequest({
          app,
          method: 'patch',
          authCode: adminToken,
          endpoint: `${validRoute}`,
          data: {
            name: 'invocation updated',
            id: 'invocation6',
            contractId: 'test contract',
          },
        });

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

        const response = await makeRequest({
          app,
          method: 'patch',
          authCode: adminToken,
          endpoint: `${validRoute}`,
          data: {
            id: 'invocation6',
            contractId: 'contract test',
          },
        });

        expect(response.body.payload).toEqual(expectedResponse);

        expect(response.body.payload.methods).toHaveLength(1);

        const responseMethod5 = await makeRequest({
          app,
          authCode: adminToken,
          endpoint: '/method/method5',
        });

        expect(responseMethod5.body.details.description).toEqual(
          METHOD_RESPONSE.METHOD_NOT_FOUND,
        );

        const responseMethod7 = await makeRequest({
          app,
          authCode: adminToken,
          endpoint: '/method/method7',
        });

        expect(responseMethod7.body.details.description).toEqual(
          METHOD_RESPONSE.METHOD_NOT_FOUND,
        );
      });

      it('should throw error when try to update selected method and contract at the same time', async () => {
        const response = await makeRequest({
          app,
          method: 'patch',
          authCode: adminToken,
          endpoint: `${validRoute}`,
          data: {
            name: 'invocation updated',
            id: 'invocation6',
            contractId: 'test contract',
            selectedMethodId: 'method7',
          },
        });

        expect(response.body.details.description).toEqual(
          INVOCATION_RESPONSE.INVOCATION_FAIL_WITH_NEW_CONTRACT_AND_NEW_METHOD,
        );
      });

      it('should throw error when try to update an invocation not associated with a folder', async () => {
        const response = await makeRequest({
          app,
          method: 'patch',
          authCode: adminToken,
          endpoint: `${validRoute}`,
          data: {
            name: 'invocation updated',
            id: 'invocation',
          },
        });

        expect(response.body.details.description).toEqual(
          INVOCATION_RESPONSE.INVOCATION_UNAVAILABLE,
        );
      });

      it('should throw error when try to update and invocation with an invalid contract id', async () => {
        jest
          .spyOn(mockedContractService, 'generateMethodsFromContractId')
          .mockRejectedValue(
            new NotFoundException(
              INVOCATION_RESPONSE.INVOCATION_FAIL_GENERATE_METHODS_WITH_CONTRACT_ID,
            ),
          );

        const response = await makeRequest({
          app,
          method: 'patch',
          authCode: adminToken,
          endpoint: `${validRoute}`,
          data: {
            name: 'invocation updated',
            id: 'invocation6',
            contractId: 'invalid contract id',
          },
        });

        expect(response.body.details.description).toEqual(
          INVOCATION_RESPONSE.INVOCATION_FAIL_GENERATE_METHODS_WITH_CONTRACT_ID,
        );
      });

      it('should retry 5 times if generateMethodsFromContractId throws an error', async () => {
        jest
          .spyOn(mockedContractService, 'generateMethodsFromContractId')
          .mockRejectedValue([]);

        const response = await makeRequest({
          app,
          method: 'patch',
          authCode: adminToken,
          endpoint: `${validRoute}`,
          data: {
            name: 'invocation updated',
            id: 'invocation6',
            contractId: 'test contract',
          },
        });

        expect(response.body.details.description).toEqual(
          INVOCATION_RESPONSE.INVOCATION_FAIL_GENERATE_METHODS_WITH_CONTRACT_ID,
        );
      });

      it('should update contract id with a selected method', async () => {
        jest
          .spyOn(mockedContractService, 'generateMethodsFromContractId')
          .mockResolvedValue([]);

        const response = await makeRequest({
          app,
          method: 'patch',
          authCode: adminToken,
          endpoint: `${validRoute}`,
          data: {
            name: 'invocation updated',
            id: 'invocation6',
            contractId: 'new test contract',
          },
        });

        expect(response.body.payload.contractId).toEqual('new test contract');
      });

      it('should update contract id with a environment', async () => {
        jest
          .spyOn(mockedContractService, 'generateMethodsFromContractId')
          .mockResolvedValue([]);

        const contractId = '{{contract_id}}';

        const response = await makeRequest({
          app,
          method: 'patch',
          authCode: adminToken,
          endpoint: `${validRoute}`,
          data: {
            id: 'invocation6',
            contractId,
          },
        });

        expect(response.body.payload.contractId).toEqual(contractId);
      });

      it('should update secretKey without removing publicKey', async () => {
        const response = await makeRequest({
          app,
          method: 'patch',
          authCode: adminToken,
          endpoint: `${validRoute}`,
          data: {
            name: 'invocation updated',
            id: 'invocation8',
            secretKey: 'newSecretKey',
          },
        });

        expect(response.body.payload.publicKey).toEqual('publicKey2');
        expect(response.body.payload.secretKey).toEqual('newSecretKey');
      });

      it('should update pre invocation code', async () => {
        const preInvocationValue = 'console.log("pre invocation")';

        const response = await makeRequest({
          app,
          method: 'patch',
          authCode: adminToken,
          endpoint: `${validRoute}`,
          data: {
            preInvocation: preInvocationValue,
            id: 'invocation6',
          },
        });

        expect(response.body.payload.preInvocation).toEqual(preInvocationValue);
      });

      it('should update post invocation code', async () => {
        const postInvocationValue = 'console.log("post invocation")';

        const response = await makeRequest({
          app,
          method: 'patch',
          authCode: adminToken,
          endpoint: `${validRoute}`,
          data: {
            preInvocation: postInvocationValue,
            id: 'invocation6',
          },
        });

        expect(response.body.payload.preInvocation).toEqual(
          postInvocationValue,
        );
      });
    });

    describe('Update Network - [PATCH /invocation]', () => {
      it('should throw error when the invocation id is incorrect', async () => {
        const response = await makeRequest({
          app,
          method: 'patch',
          authCode: adminToken,
          endpoint: `${validRoute}`,
          data: { network: 'TESTNET', id: 'invocation' },
        });

        expect(response.body.details.description).toEqual(
          INVOCATION_RESPONSE.INVOCATION_UNAVAILABLE,
        );
      });

      it('should change network when contractId exists', async () => {
        const responseExpected = expect.objectContaining({
          contractId: '{{contract_id}}',
          folder: {
            id: 'folder2',
            name: 'folder2',
          },
          id: 'invocation6',
          methods: [],
          name: 'invocation updated',
          network: 'FUTURENET',
          postInvocation: null,
          preInvocation: 'console.log("post invocation")',
          publicKey: null,
          secretKey: null,
          selectedMethod: null,
        });

        const response = await makeRequest({
          app,
          method: 'patch',
          authCode: adminToken,
          endpoint: `${validRoute}`,
          data: {
            network: 'TESTNET',
            id: 'invocation6',
          },
        });

        expect(response.body.payload).toEqual(responseExpected);
      });

      it('should change to FUTURENET network', async () => {
        const responseExpected = expect.objectContaining({
          network: 'FUTURENET',
          id: 'invocation6',
        });

        const response = await makeRequest({
          app,
          method: 'patch',
          authCode: adminToken,
          endpoint: `${validRoute}`,
          data: { network: 'FUTURENET', id: 'invocation6' },
        });

        expect(response.body.payload).toEqual(responseExpected);
      });
    });

    describe('Run one  - [POST /invocation/:id/run]', () => {
      it('should run correctly the invocation', async () => {
        const response = await makeRequest({
          app,
          method: 'post',

          authCode: adminToken,
          endpoint: `${validRoute}/invocation11/run`,
        });

        expect(response.body).toEqual({
          success: true,
          statusCode: 200,
          message: 'Invocation run',
          timestamp: expect.any(String),
          path: `${validRoute}/invocation11/run`,
        });
      });

      it('should validate all required fields', async () => {
        const response = await makeRequest({
          app,
          method: 'post',
          authCode: adminToken,
          endpoint: `${validRoute}/invocation10/run`,
        });

        expect(response.body.details.description).toEqual(
          INVOCATION_RESPONSE.INVOCATION_FAILED_TO_RUN_WITHOUT_KEYS_OR_SELECTED_METHOD,
        );
      });
    });

    describe('Delete one  - [DELETE /invocation/:id]', () => {
      it('should delete one invocation associated with a team', async () => {
        const response = await makeRequest({
          app,
          method: 'delete',
          authCode: adminToken,
          endpoint: `${validRoute}/invocation6`,
        });

        expect(response.body).toEqual({
          success: true,
          statusCode: 202,
          message: 'Invocation deleted',
          payload: true,
          timestamp: expect.any(String),
          path: '/team/team0/invocation/invocation6',
        });
      });

      it('should throw error when try to delete one invocation not associated with a team', async () => {
        const response = await makeRequest({
          app,
          method: 'delete',
          authCode: adminToken,
          endpoint: `${invalidRoute}/invocation7`,
        });

        expect(response.body.details.description).toEqual(
          INVOCATION_RESPONSE.INVOCATION_NOT_FOUND_FOR_TEAM_AND_ID,
        );
      });

      it('should throw an unauthorize error when try to delete an invocation with a user without the required role', async () => {
        const response = await makeRequest({
          app,
          method: 'delete',
          authCode: adminToken,
          endpoint: `${unauthorizeRoute}/invocation11`,
        });

        expect(response.body.details.description).toEqual(
          AUTH_RESPONSE.USER_ROLE_NOT_AUTHORIZED,
        );
      });
    });
  });
});
