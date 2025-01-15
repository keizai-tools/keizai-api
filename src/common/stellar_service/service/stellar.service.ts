import {
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  RequestTimeoutException,
  UseInterceptors,
  forwardRef,
} from '@nestjs/common';
import {
  Memo,
  MemoType,
  Networks,
  Operation,
  Transaction,
  TransactionBuilder,
  rpc,
  xdr,
} from '@stellar/stellar-sdk';
import { ResilienceInterceptor, RetryStrategy } from 'nestjs-resilience';

import {
  IResponseService,
  RESPONSE_SERVICE,
} from '@/common/response_service/interface/response.interface';
import { Invocation } from '@/modules/invocation/domain/invocation.domain';
import { MethodMapper } from '@/modules/method/application/mapper/method.mapper';
import { Method } from '@/modules/method/domain/method.domain';

import { StellarAdapter } from '../adapter/stellar.adapter';
import { ContractFunctions } from '../application/domain/ContractFunctions.array';
import { SCSpecTypeMap } from '../application/domain/SCSpecTypeMap.object';
import {
  CONTRACT_EXECUTABLE_TYPE,
  ErrorMessages,
  GetTransactionStatus,
  NETWORK,
  SOROBAN_CONTRACT_ERROR,
  SendTransactionStatus,
} from '../application/domain/soroban.enum';
import {
  IDecodedSection,
  IGeneratedMethod,
  IRunInvocationParams,
  IStellarService,
} from '../application/interface/contract.service.interface';
import {
  ContractErrorResponse,
  RunInvocationResponse,
} from '../application/interface/soroban';
import { CONTRACT_ADAPTER } from '../application/interface/stellar.adapter.interface';
import {
  CONTRACT_MAPPER,
  IStellarMapper,
} from '../application/interface/stellar.mapper.interface';

@Injectable()
export class StellarService implements IStellarService {
  private readonly SCSpecTypeMap: { [key: number]: string } = SCSpecTypeMap;
  constructor(
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
    @Inject(CONTRACT_ADAPTER)
    private readonly stellarAdapter: StellarAdapter,
    @Inject(CONTRACT_MAPPER)
    private readonly stellarMapper: IStellarMapper,
    @Inject(forwardRef(() => MethodMapper))
    private readonly methodMapper: MethodMapper,
  ) {
    this.responseService.setContext(StellarService.name);
  }

  public async verifyNetwork({
    selectedNetwork,
    contractId,
    userId,
  }: {
    selectedNetwork: NETWORK;
    contractId?: string;
    userId: string;
  }): Promise<NETWORK> {
    return this.stellarAdapter.verifyNetwork({
      selectedNetwork,
      contractId,
      userId,
    });
  }

  public async generateMethodsFromContractId({
    contractId,
    userId,
    currentNetwork,
  }: {
    contractId: string;
    userId: string;
    currentNetwork: NETWORK;
  }): Promise<IGeneratedMethod[]> {
    await this.stellarAdapter.changeNetwork({
      userId,
      selectedNetwork: currentNetwork,
    });
    const instanceValue = await this.stellarAdapter.getInstanceValue({
      contractId,
      currentNetwork: this.stellarAdapter.currentNetwork,
      userId,
    });
    if (
      instanceValue.switch().name === CONTRACT_EXECUTABLE_TYPE.STELLAR_ASSET
    ) {
      return this.getStellarAssetContractFunctions();
    }

    const decodedSections = await this.getContractSpecEntries({
      instanceValue,
      userId,
      currentNetwork,
    });
    return decodedSections
      .map((section) =>
        this.extractFunctionInfo({
          decodedSection: section as IDecodedSection,
        }),
      )
      .filter((f) => f && f.name.length > 0);
  }

  @UseInterceptors(
    ResilienceInterceptor(
      new RetryStrategy({
        maxRetries: 10,
      }),
    ),
  )
  public async runInvocation({
    runInvocationParams,
    userId,
    currentNetwork,
  }: {
    runInvocationParams: IRunInvocationParams;
    userId: string;
    currentNetwork: NETWORK;
  }): Promise<RunInvocationResponse | ContractErrorResponse> {
    await this.stellarAdapter.changeNetwork({
      userId,
      selectedNetwork: currentNetwork,
    });
    const {
      contractId,
      publicKey,
      secretKey,
      selectedMethod,
      signedTransactionXDR,
    } = runInvocationParams;

    try {
      let transaction: Transaction<Memo<MemoType>, Operation[]>;
      if (!signedTransactionXDR && secretKey) {
        const scArgs = await this.generateScArgsToFromContractId({
          contractId,
          selectedMethod,
          userId,
          currentNetwork,
        });
        transaction = await this.stellarAdapter.prepareTransaction({
          account: publicKey,
          userId,
          operationsOrContractId: {
            contractId,
            methodName: selectedMethod.name,
            scArgs,
          },
          currentNetwork,
        });
        const sourceKeypair = this.stellarAdapter.getKeypair({ secretKey });
        this.stellarAdapter.signTransaction({ transaction, sourceKeypair });
      } else if (signedTransactionXDR) {
        transaction = TransactionBuilder.fromXDR(
          signedTransactionXDR,
          Networks[this.stellarAdapter.currentNetwork],
        ) as Transaction;
      }
      const response: rpc.Api.RawSendTransactionResponse =
        await this.stellarAdapter.sendTransaction({
          transaction,
          userId,
          currentNetwork,
          useRaw: true,
        });
      const methodMapped = this.methodMapper.fromDtoToEntity(selectedMethod);
      if (response.status === SendTransactionStatus.ERROR) {
        return {
          status: response.status,
          response: this.stellarMapper.fromTxResultToDisplayResponse(
            response.errorResultXdr,
          ),
          method: methodMapped,
        };
      }
      const newResponse = await this.pollTransactionStatus({
        hash: response.hash,
        currentNetwork,
        userId,
      });
      if (newResponse.status === GetTransactionStatus.SUCCESS) {
        const events = await this.stellarAdapter.getContractEvents({
          contractId,
          currentNetwork,
          userId,
        });
        return {
          method: methodMapped,
          response: this.stellarMapper.fromScValToDisplayValue(
            newResponse.returnValue,
          ),
          status: newResponse.status,
          events: this.stellarMapper.encodeEventToDisplayEvent(events),
        };
      }

      const rawResponse = (await this.stellarAdapter.getTransaction({
        hash: response.hash,
        useRaw: true,
        currentNetwork,
        userId,
      })) as rpc.Api.RawGetTransactionResponse;
      return {
        status: rawResponse.status,
        response: this.stellarMapper.fromTxResultToDisplayResponse(
          rawResponse.resultXdr,
        ),
        method: methodMapped,
      };
    } catch (error) {
      return this.handleInvocationError({ error });
    }
  }

  public async getPreparedTransactionXDR({
    contractId,
    publicKey,
    selectedMethod,
    userId,
    currentNetwork,
  }: {
    contractId: string;
    publicKey: string;
    selectedMethod: Partial<Method>;
    userId: string;
    currentNetwork: NETWORK;
  }): Promise<string> {
    await this.stellarAdapter.changeNetwork({
      userId,
      selectedNetwork: currentNetwork,
    });
    const scArgs: xdr.ScVal[] = await this.generateScArgsToFromContractId({
      contractId,
      selectedMethod,
      userId,
      currentNetwork,
    });
    const transaction = await this.stellarAdapter.prepareTransaction({
      account: publicKey,
      currentNetwork,
      operationsOrContractId: {
        contractId,
        methodName: selectedMethod.name,
        scArgs,
      },
      userId,
    });
    return transaction.toXDR();
  }

  public async pollTransactionStatus({
    hash,
    userId,
    currentNetwork,
  }: {
    hash: string;
    userId: string;
    currentNetwork: NETWORK;
  }): Promise<
    | rpc.Api.GetSuccessfulTransactionResponse
    | rpc.Api.GetFailedTransactionResponse
  > {
    await this.stellarAdapter.changeNetwork({
      userId,
      selectedNetwork: currentNetwork,
    });
    let response = (await this.stellarAdapter.getTransaction({
      hash,
      useRaw: false,
      currentNetwork,
      userId,
    })) as rpc.Api.GetTransactionResponse;
    while (response.status === GetTransactionStatus.NOT_FOUND) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      response = (await this.stellarAdapter.getTransaction({
        hash,
        useRaw: false,
        currentNetwork,
        userId,
      })) as rpc.Api.GetTransactionResponse;
    }
    return response;
  }

  public async generateScArgsToFromContractId({
    contractId,
    selectedMethod,
    userId,
    currentNetwork,
  }: {
    contractId: string;
    selectedMethod: Partial<Method>;
    userId: string;
    currentNetwork: NETWORK;
  }): Promise<xdr.ScVal[]> {
    await this.stellarAdapter.changeNetwork({
      userId,
      selectedNetwork: currentNetwork,
    });
    const instanceValue = await this.stellarAdapter.getInstanceValue({
      contractId,
      currentNetwork: this.stellarAdapter.currentNetwork,
      userId,
    });

    if (
      instanceValue.switch().name === CONTRACT_EXECUTABLE_TYPE.STELLAR_ASSET
    ) {
      return this.stellarMapper.getScValFromStellarAssetContract(
        selectedMethod,
      );
    }

    return this.getScValFromSmartContract({
      currentNetwork,
      userId,
      instanceValue,
      selectedMethod,
    });
  }

  public getStellarAssetContractFunctions(): IGeneratedMethod[] {
    return ContractFunctions;
  }

  private async decodeContractSpecBuffer({
    buffer,
  }: {
    buffer: ArrayBuffer;
  }): Promise<xdr.ScSpecEntry[]> {
    const arrayBuffer = new Uint8Array(buffer);
    const decodedData: xdr.ScSpecEntry[] = [];
    let offset = 0;

    while (offset < arrayBuffer.length) {
      let success = false;
      for (let length = 1; length <= arrayBuffer.length - offset; length++) {
        const subArray = arrayBuffer.subarray(offset, offset + length);
        try {
          const partialDecodedData = this.stellarAdapter.getScSpecEntryFromXDR({
            input: subArray,
          });
          decodedData.push(partialDecodedData);
          offset += length;
          success = true;
          break;
        } catch (error) {
          this.responseService.error(
            `Failed to decode subArray of length ${length}:`,
            error,
          );
        }
      }
      if (!success) break;
    }
    return decodedData;
  }

  public extractFunctionInfo({
    decodedSection,
  }: {
    decodedSection: IDecodedSection;
  }): IGeneratedMethod {
    if (decodedSection._switch.name !== 'scSpecEntryFunctionV0') return null;

    const { name, doc, inputs, outputs } = decodedSection._value._attributes;

    return {
      name: name.toString('utf-8'),
      docs: doc?.toString('utf-8') || null,
      inputs: inputs.map((input) => ({
        name: input._attributes.name.toString('utf-8'),
        type:
          this.SCSpecTypeMap[input._attributes.type._switch.value] ||
          'Unknown Type',
      })),
      outputs: outputs.map((output) => ({
        type: this.SCSpecTypeMap[output._switch.value] || 'Unknown Type',
      })),
    };
  }

  public async getContractSpecEntries({
    instanceValue,
    userId,
    currentNetwork,
  }: {
    instanceValue: xdr.ContractExecutable;
    userId: string;
    currentNetwork: NETWORK;
  }): Promise<xdr.ScSpecEntry[]> {
    await this.stellarAdapter.changeNetwork({
      userId,
      selectedNetwork: currentNetwork,
    });
    const contractCode = await this.stellarAdapter.getWasmCode({
      currentNetwork,
      userId,
      instance: instanceValue,
    });
    const wasmModule = new WebAssembly.Module(contractCode);
    const buffer = WebAssembly.Module.customSections(
      wasmModule,
      'contractspecv0',
    )[0];
    return this.decodeContractSpecBuffer({ buffer });
  }

  public async getScValFromSmartContract({
    instanceValue,
    selectedMethod,
    userId,
    currentNetwork,
  }: {
    instanceValue: xdr.ContractExecutable;
    selectedMethod: Partial<Method>;
    userId: string;
    currentNetwork: NETWORK;
  }): Promise<xdr.ScVal[]> {
    await this.stellarAdapter.changeNetwork({
      userId,
      selectedNetwork: currentNetwork,
    });
    const maxRetries = 7;
    let specEntries: xdr.ScSpecEntry[];

    for (let retries = 0; retries < maxRetries; retries++) {
      try {
        specEntries = await this.getContractSpecEntries({
          instanceValue,
          currentNetwork,
          userId,
        });
        break;
      } catch (error) {
        if (retries === maxRetries - 1)
          throw new RequestTimeoutException(
            'Unable to get contract spec entries.',
          );
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const contractSpec = await this.stellarAdapter.createContractSpec({
      entries: specEntries,
    });

    const params = selectedMethod.params.reduce((acc, param) => {
      const paramValue = selectedMethod.inputs.find(
        (input) => input.name === param.name,
      );
      return {
        ...acc,
        [param.name]: paramValue?.type.includes('U32')
          ? parseInt(param.value)
          : param.value,
      };
    }, {});

    return contractSpec.funcArgsToScVals(selectedMethod.name, params);
  }

  private handleInvocationError({
    error,
  }: {
    error: Error;
  }): ContractErrorResponse {
    const errorMessage = typeof error === 'string' ? error : error.message;
    if (
      errorMessage.includes(SOROBAN_CONTRACT_ERROR.HOST_FAILED) ||
      errorMessage.includes(SOROBAN_CONTRACT_ERROR.HOST_ERROR)
    ) {
      return this.stellarMapper.fromContractErrorToDisplayResponse(
        errorMessage,
      );
    }
    this.handleError({ error });
    return {
      title: 'Internal Server Error',
      status: SendTransactionStatus.ERROR,
      response: 'Internal Server Error',
    };
  }

  async deployWasmFile({
    file,
    invocation,
    userId,
    currentNetwork,
  }: {
    currentNetwork: NETWORK;
    file?: Express.Multer.File;
    invocation?: Invocation;
    userId: string;
  }): Promise<string> {
    try {
      await this.stellarAdapter.changeNetwork({
        userId,
        selectedNetwork: currentNetwork,
      });
      return await this.stellarAdapter.uploadWasm({
        file,
        userId,
        currentNetwork,
        publicKey: invocation.publicKey,
        secretKey: invocation.secretKey,
      });
    } catch (error) {
      if (error instanceof HttpException) this.handleError({ error });
      else this.handleError({ error: error.message });
    }
  }

  async prepareUploadWASM({
    userId,
    file,
    publicKey,
    signedTransactionXDR,
    currentNetwork,
  }: {
    userId: string;
    file?: Express.Multer.File;
    publicKey?: string;
    signedTransactionXDR?: string;
    currentNetwork: NETWORK;
  }): Promise<string> {
    await this.stellarAdapter.changeNetwork({
      userId,
      selectedNetwork: currentNetwork,
    });
    try {
      if (signedTransactionXDR && publicKey) {
        const transaction: Transaction<
          Memo<MemoType>,
          Operation[]
        > = TransactionBuilder.fromXDR(
          signedTransactionXDR,
          this.getNetworkPassphrase(),
        ) as Transaction;

        const newResponse =
          await this.stellarAdapter.executeTransactionWithRetry({
            transaction,
          });
        const operation = this.stellarAdapter.createDeployContractOperation({
          response: newResponse,
          sourceKeypair: publicKey,
        });

        const account = await this.stellarAdapter.getAccountOrFund({
          publicKey,
          userId,
          currentNetwork,
        });
        return (
          await this.stellarAdapter.prepareTransaction({
            account,
            userId,
            currentNetwork,
            operationsOrContractId: operation,
          })
        ).toXDR();
      }
      const response = await this.stellarAdapter.prepareUploadWASM({
        file,
        publicKey: publicKey,
        currentNetwork,
        userId,
      });
      return response;
    } catch (error) {
      if (error instanceof HttpException) this.handleError({ error });
      else this.handleError({ error: error.message });
    }
  }

  public getNetworkPassphrase(): string {
    const networkPassphraseMap: Partial<{ [key in NETWORK]: string }> = {
      [NETWORK.SOROBAN_MAINNET]: Networks.PUBLIC,
      [NETWORK.SOROBAN_TESTNET]: Networks.TESTNET,
      [NETWORK.SOROBAN_FUTURENET]: Networks.FUTURENET,
      [NETWORK.SOROBAN_EPHEMERAL]: Networks.STANDALONE,
    };
    const networkPassphrase =
      networkPassphraseMap[this.stellarAdapter.currentNetwork];

    if (!networkPassphrase) {
      throw new InternalServerErrorException(ErrorMessages.UNSUPPORTED_NETWORK);
    }

    return networkPassphrase;
  }
  async runUploadWASM({
    signedTransactionXDR,
  }: {
    signedTransactionXDR: string;
  }): Promise<string> {
    try {
      const transaction: Transaction<
        Memo<MemoType>,
        Operation[]
      > = TransactionBuilder.fromXDR(
        signedTransactionXDR,
        this.getNetworkPassphrase(),
      ) as Transaction;
      const deployResponse =
        await this.stellarAdapter.executeTransactionWithRetry({ transaction });
      return this.stellarAdapter.extractContractAddress({
        responseDeploy: deployResponse,
      });
    } catch (error) {
      this.handleError({ error });
    }
  }

  private handleError({ error }: { error: Error }): void {
    this.responseService.errorHandler({
      type: 'INTERNAL_SERVER_ERROR',
      error,
    });
  }
}
