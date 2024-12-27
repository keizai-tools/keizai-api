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
  private currentNetwork: NETWORK = NETWORK.SOROBAN_FUTURENET;
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
    if (selectedNetwork !== this.currentNetwork) {
      this.stellarAdapter.changeNetwork(selectedNetwork, userId);
      this.currentNetwork = selectedNetwork;
    }

    if (selectedNetwork === NETWORK.SOROBAN_AUTO_DETECT && contractId) {
      const response = await this.stellarAdapter.checkContractNetwork(
        contractId,
      );
      this.currentNetwork = response;
    }

    return this.currentNetwork;
  }

  public async generateMethodsFromContractId(
    contractId: string,
  ): Promise<IGeneratedMethod[]> {
    const instanceValue = await this.stellarAdapter.getInstanceValue(
      contractId,
      this.currentNetwork,
    );
    if (
      instanceValue.switch().name === CONTRACT_EXECUTABLE_TYPE.STELLAR_ASSET
    ) {
      return this.getStellarAssetContractFunctions();
    }

    const decodedSections = await this.getContractSpecEntries(instanceValue);
    return decodedSections
      .map((section) => this.extractFunctionInfo(section as IDecodedSection))
      .filter((f) => f && f.name.length > 0);
  }

  @UseInterceptors(
    ResilienceInterceptor(
      new RetryStrategy({
        maxRetries: 10,
      }),
    ),
  )
  public async runInvocation(
    runInvocationParams: IRunInvocationParams,
    userId: string,
  ): Promise<RunInvocationResponse | ContractErrorResponse> {
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
        const scArgs = await this.generateScArgsToFromContractId(
          contractId,
          selectedMethod,
        );

        transaction = await this.stellarAdapter.prepareTransaction(
          publicKey,
          userId,
          {
            contractId,
            methodName: selectedMethod.name,
            scArgs,
          },
        );
        const sourceKeypair = this.stellarAdapter.getKeypair(secretKey);
        this.stellarAdapter.signTransaction(transaction, sourceKeypair);
      } else if (signedTransactionXDR) {
        transaction = TransactionBuilder.fromXDR(
          signedTransactionXDR,
          Networks[this.currentNetwork],
        ) as Transaction;
      }
      const response: rpc.Api.RawSendTransactionResponse =
        await this.stellarAdapter.sendTransaction(transaction, true);
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

      const newResponse = await this.pollTransactionStatus(response.hash);
      if (newResponse.status === GetTransactionStatus.SUCCESS) {
        const events = await this.stellarAdapter.getContractEvents(contractId);
        return {
          method: methodMapped,
          response: this.stellarMapper.fromScValToDisplayValue(
            newResponse.returnValue,
          ),
          status: newResponse.status,
          events: this.stellarMapper.encodeEventToDisplayEvent(events),
        };
      }

      const rawResponse = (await this.stellarAdapter.getTransaction(
        response.hash,
        true,
      )) as rpc.Api.RawGetTransactionResponse;
      return {
        status: rawResponse.status,
        response: this.stellarMapper.fromTxResultToDisplayResponse(
          rawResponse.resultXdr,
        ),
        method: methodMapped,
      };
    } catch (error) {
      return this.handleInvocationError(error);
    }
  }

  public async getPreparedTransactionXDR(
    contractId: string,
    publicKey: string,
    selectedMethod: Partial<Method>,
    userId: string,
  ): Promise<string> {
    const scArgs: xdr.ScVal[] = await this.generateScArgsToFromContractId(
      contractId,
      selectedMethod,
    );
    const transaction = await this.stellarAdapter.prepareTransaction(
      publicKey,
      userId,
      { contractId, methodName: selectedMethod.name, scArgs },
    );
    return transaction.toXDR();
  }

  public async pollTransactionStatus(
    hash: string,
  ): Promise<
    | rpc.Api.GetSuccessfulTransactionResponse
    | rpc.Api.GetFailedTransactionResponse
  > {
    let response = (await this.stellarAdapter.getTransaction(
      hash,
      false,
    )) as rpc.Api.GetTransactionResponse;
    while (response.status === GetTransactionStatus.NOT_FOUND) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      response = (await this.stellarAdapter.getTransaction(
        hash,
        false,
      )) as rpc.Api.GetTransactionResponse;
    }
    return response;
  }

  public async generateScArgsToFromContractId(
    contractId: string,
    selectedMethod: Partial<Method>,
  ): Promise<xdr.ScVal[]> {
    const instanceValue = await this.stellarAdapter.getInstanceValue(
      contractId,
      this.currentNetwork,
    );

    if (
      instanceValue.switch().name === CONTRACT_EXECUTABLE_TYPE.STELLAR_ASSET
    ) {
      return this.stellarMapper.getScValFromStellarAssetContract(
        selectedMethod,
      );
    }

    return this.getScValFromSmartContract(instanceValue, selectedMethod);
  }

  public getStellarAssetContractFunctions(): IGeneratedMethod[] {
    return ContractFunctions;
  }

  private async decodeContractSpecBuffer(
    buffer: ArrayBuffer,
  ): Promise<xdr.ScSpecEntry[]> {
    const arrayBuffer = new Uint8Array(buffer);
    const decodedData: xdr.ScSpecEntry[] = [];
    let offset = 0;

    while (offset < arrayBuffer.length) {
      let success = false;
      for (let length = 1; length <= arrayBuffer.length - offset; length++) {
        const subArray = arrayBuffer.subarray(offset, offset + length);
        try {
          const partialDecodedData =
            this.stellarAdapter.getScSpecEntryFromXDR(subArray);
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

  public extractFunctionInfo(
    decodedSection: IDecodedSection,
  ): IGeneratedMethod {
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

  public async getContractSpecEntries(
    instanceValue: xdr.ContractExecutable,
  ): Promise<xdr.ScSpecEntry[]> {
    const contractCode = await this.stellarAdapter.getWasmCode(instanceValue);
    const wasmModule = new WebAssembly.Module(contractCode);
    const buffer = WebAssembly.Module.customSections(
      wasmModule,
      'contractspecv0',
    )[0];
    return this.decodeContractSpecBuffer(buffer);
  }

  public async getScValFromSmartContract(
    instanceValue: xdr.ContractExecutable,
    selectedMethod: Partial<Method>,
  ): Promise<xdr.ScVal[]> {
    const maxRetries = 7;
    let specEntries: xdr.ScSpecEntry[];

    for (let retries = 0; retries < maxRetries; retries++) {
      try {
        specEntries = await this.getContractSpecEntries(instanceValue);
        break;
      } catch (error) {
        if (retries === maxRetries - 1)
          throw new RequestTimeoutException(
            'Unable to get contract spec entries.',
          );
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const contractSpec = await this.stellarAdapter.createContractSpec(
      specEntries,
    );

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

  private handleInvocationError(error: Error): ContractErrorResponse {
    const errorMessage = typeof error === 'string' ? error : error.message;
    if (
      errorMessage.includes(SOROBAN_CONTRACT_ERROR.HOST_FAILED) ||
      errorMessage.includes(SOROBAN_CONTRACT_ERROR.HOST_ERROR)
    ) {
      return this.stellarMapper.fromContractErrorToDisplayResponse(
        errorMessage,
      );
    }
    this.handleError(error);
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
  }: {
    file?: Express.Multer.File;
    invocation?: Invocation;
    userId: string;
  }): Promise<string> {
    try {
      return await this.stellarAdapter.uploadWasm(
        file,
        userId,
        invocation.publicKey,
        invocation.secretKey,
      );
    } catch (error) {
      if (error instanceof HttpException) this.handleError(error);
      else this.handleError(error.message);
    }
  }

  async prepareUploadWASM({
    userId,
    file,
    publicKey,
    signedTransactionXDR,
  }: {
    userId: string;
    file?: Express.Multer.File;
    publicKey?: string;
    signedTransactionXDR?: string;
  }): Promise<string> {
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
          await this.stellarAdapter.executeTransactionWithRetry(transaction);
        const operation = this.stellarAdapter.createDeployContractOperation(
          newResponse,
          publicKey,
        );

        const account = await this.stellarAdapter.getAccountOrFund(
          publicKey,
          userId,
        );
        return (
          await this.stellarAdapter.prepareTransaction(
            account,
            userId,
            operation,
          )
        ).toXDR();
      }
      const response = await this.stellarAdapter.prepareUploadWASM(
        file,
        publicKey,
        userId,
      );
      return response;
    } catch (error) {
      if (error instanceof HttpException) this.handleError(error);
      else this.handleError(error.message);
    }
  }

  private getNetworkPassphrase(): string {
    const networkPassphraseMap: Partial<{ [key in NETWORK]: string }> = {
      [NETWORK.SOROBAN_MAINNET]: Networks.PUBLIC,
      [NETWORK.SOROBAN_TESTNET]: Networks.TESTNET,
      [NETWORK.SOROBAN_FUTURENET]: Networks.FUTURENET,
      [NETWORK.SOROBAN_EPHEMERAL]: Networks.STANDALONE,
    };
    const networkPassphrase = networkPassphraseMap[this.currentNetwork];

    if (!networkPassphrase) {
      throw new InternalServerErrorException(ErrorMessages.UNSUPPORTED_NETWORK);
    }

    return networkPassphrase;
  }
  async runUploadWASM(signedTransactionXDR: string): Promise<string> {
    try {
      const transaction: Transaction<
        Memo<MemoType>,
        Operation[]
      > = TransactionBuilder.fromXDR(
        signedTransactionXDR,
        this.getNetworkPassphrase(),
      ) as Transaction;
      const deployResponse =
        await this.stellarAdapter.executeTransactionWithRetry(transaction);
      return this.stellarAdapter.extractContractAddress(deployResponse);
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: Error): void {
    this.responseService.errorHandler({
      type: 'INTERNAL_SERVER_ERROR',
      error,
    });
  }
}
