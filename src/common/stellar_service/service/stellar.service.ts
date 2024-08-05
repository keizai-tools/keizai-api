import {
  Inject,
  Injectable,
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
  xdr,
} from '@stellar/stellar-sdk';
import { ResilienceInterceptor, RetryStrategy } from 'nestjs-resilience';

import {
  IResponseService,
  RESPONSE_SERVICE,
} from '@/common/response_service/interface/response.interface';
import { MethodMapper } from '@/modules/method/application/mapper/method.mapper';
import { Method } from '@/modules/method/domain/method.domain';

import { ContractFunctions } from '../application/domain/ContractFunctions.array';
import { SCSpecTypeMap } from '../application/domain/SCSpecTypeMap.object';
import {
  CONTRACT_EXECUTABLE_TYPE,
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
import {
  CONTRACT_ADAPTER,
  IStellarAdapter,
} from '../application/interface/stellar.adapter.interface';
import {
  CONTRACT_MAPPER,
  IStellarMapper,
} from '../application/interface/stellar.mapper.interface';

@Injectable()
export class StellarService implements IStellarService {
  private SCSpecTypeMap: { [key: number]: string };
  private currentNetwork: string;
  constructor(
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
    @Inject(CONTRACT_ADAPTER)
    private readonly stellarAdapter: IStellarAdapter,
    @Inject(CONTRACT_MAPPER)
    private readonly stellarMapper: IStellarMapper,
    @Inject(forwardRef(() => MethodMapper))
    private readonly methodMapper: MethodMapper,
  ) {
    this.responseService.setContext(StellarService.name);
    this.currentNetwork = NETWORK.SOROBAN_FUTURENET;
    this.SCSpecTypeMap = SCSpecTypeMap;
  }

  async verifyNetwork(
    selectedNetwork: string,
    contractId?: string,
  ): Promise<string> {
    try {
      if (selectedNetwork !== this.currentNetwork) {
        this.stellarAdapter.changeNetwork(selectedNetwork);
        this.currentNetwork = selectedNetwork;
      }

      if (selectedNetwork === NETWORK.SOROBAN_AUTO_DETECT && contractId) {
        const response = await this.stellarAdapter.checkContractNetwork(
          contractId,
        );
        this.currentNetwork = response;
      }
      return this.currentNetwork;
    } catch (error) {
      this.handleError(error);
    }
  }

  getStellarAssetContractFunctions(): IGeneratedMethod[] {
    return ContractFunctions;
  }

  async decodeContractSpecBuffer(
    buffer: ArrayBuffer,
  ): Promise<xdr.ScSpecEntry[]> {
    try {
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
            // Log or handle the error
          }
        }
        if (!success) {
          console.log('Failed to decode further. Stopping.');
          break;
        }
        if (offset >= arrayBuffer.length) {
          break;
        }
      }
      return decodedData;
    } catch (error) {
      this.handleError(error);
      return [];
    }
  }

  extractFunctionInfo(decodedSection: IDecodedSection): IGeneratedMethod {
    try {
      const functionObj = {
        name: '',
        docs: null,
        inputs: [],
        outputs: [],
      };

      if (decodedSection._switch.name === 'scSpecEntryFunctionV0') {
        const functionNameBuffer = decodedSection._value._attributes.name;
        const functionName = functionNameBuffer.toString('utf-8');
        functionObj.name = functionName;

        const functionDocBuffer = decodedSection._value._attributes.doc;
        const functionDoc = functionDocBuffer.toString('utf-8');
        if (functionDoc) {
          functionObj.docs = functionDoc;
        }

        functionObj.inputs = [];
        functionObj.outputs = [];

        const inputs = decodedSection._value._attributes.inputs;
        functionObj.inputs = inputs.map(
          (input: {
            _attributes: { name: Buffer; type: { _switch: { value: number } } };
          }) => {
            const inputNameBuffer = input._attributes.name;
            const inputName = inputNameBuffer.toString('utf-8');
            const inputTypeValue = input._attributes.type._switch.value;
            const inputTypeName =
              this.SCSpecTypeMap[inputTypeValue] || 'Unknown Type';
            return { name: inputName, type: inputTypeName };
          },
        );

        const outputs = decodedSection._value._attributes.outputs;
        functionObj.outputs = outputs.map((output) => {
          const outputTypeValue = output._switch.value;
          const outputTypeName =
            this.SCSpecTypeMap[outputTypeValue] || 'Unknown Type';
          return { type: outputTypeName };
        });
      }

      return functionObj;
    } catch (error) {
      this.handleError(error);
      return null;
    }
  }

  async getContractSpecEntries(
    instanceValue: xdr.ContractExecutable,
  ): Promise<xdr.ScSpecEntry[]> {
    try {
      const contractCode = await this.stellarAdapter.getWasmCode(instanceValue);
      const wasmModule = new WebAssembly.Module(contractCode);
      const buffer = WebAssembly.Module.customSections(
        wasmModule,
        'contractspecv0',
      )[0];
      return await this.decodeContractSpecBuffer(buffer);
    } catch (error) {
      this.handleError(error);
      return [];
    }
  }

  async getScValFromSmartContract(
    instanceValue: xdr.ContractExecutable,
    selectedMethod: Partial<Method>,
  ): Promise<xdr.ScVal[]> {
    try {
      const maxRetries = 7;
      let retries = 0;
      let specEntries: xdr.ScSpecEntry[];

      while (retries < maxRetries) {
        try {
          specEntries = await this.getContractSpecEntries(instanceValue);
          break;
        } catch (error) {
          console.log(
            `Error getting contract spec entries (Retry ${retries + 1}): ${
              error.message
            }`,
          );
          retries++;
        }
      }

      if (retries === maxRetries) {
        throw new RequestTimeoutException(
          'Unable to get contract spec entries.',
        );
      }

      const contractSpec = this.stellarAdapter.getContractSpec(specEntries);

      const params = selectedMethod.params.reduce((acc, param) => {
        const paramValue = selectedMethod.inputs.find(
          (input) => input.name === param.name,
        );
        const isU32 = paramValue?.type.includes('U32');
        return {
          ...acc,
          [param.name]: isU32 ? parseInt(param.value) : param.value,
        };
      }, {});

      return contractSpec.funcArgsToScVals(selectedMethod.name, params);
    } catch (error) {
      this.handleError(error);
      return [];
    }
  }

  async generateMethodsFromContractId(contractId: string) {
    try {
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
        .map((decodedSection) =>
          this.extractFunctionInfo(decodedSection as IDecodedSection),
        )
        .filter((f) => {
          return Object.keys(f).length > 0 && f.name.length > 0;
        });
    } catch (error) {
      this.handleError(error);
      return [];
    }
  }

  async generateScArgsToFromContractId(
    contractId: string,
    selectedMethod: Partial<Method>,
  ): Promise<xdr.ScVal[]> {
    try {
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

      return await this.getScValFromSmartContract(
        instanceValue,
        selectedMethod,
      );
    } catch (error) {
      this.handleError(error);
      return [];
    }
  }

  @UseInterceptors(
    ResilienceInterceptor(
      new RetryStrategy({
        maxRetries: 5,
      }),
    ),
  )
  async runInvocation(
    runInvocationParams: IRunInvocationParams,
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
          contractId,
          selectedMethod.name,
          scArgs,
        );
        this.stellarAdapter.signTransaction(transaction, secretKey);
      }

      if (signedTransactionXDR) {
        const netWorkPassphrase = Networks[this.currentNetwork];

        transaction = TransactionBuilder.fromXDR(
          signedTransactionXDR,
          netWorkPassphrase,
        ) as Transaction;
      }

      const response = await this.stellarAdapter.rawSendTransaction(
        transaction,
      );

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

      let newresponse = await this.stellarAdapter.getTransaction(response.hash);

      while (newresponse.status === GetTransactionStatus.NOT_FOUND) {
        newresponse = await this.stellarAdapter.getTransaction(response.hash);

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (newresponse.status === GetTransactionStatus.SUCCESS) {
        const events = await this.stellarAdapter.getContractEvents(contractId);
        return {
          method: methodMapped,
          response: this.stellarMapper.fromScValToDisplayValue(
            newresponse.returnValue,
          ),
          status: newresponse.status,
          events: this.stellarMapper.encodeEventToDisplayEvent(events),
        };
      }

      const rawResponse = await this.stellarAdapter.rawGetTransaction(
        response.hash,
      );

      return {
        status: rawResponse.status,
        response: this.stellarMapper.fromTxResultToDisplayResponse(
          rawResponse.resultXdr,
        ),
        method: methodMapped,
      };
    } catch (error) {
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
    }
  }

  async getPreparedTransactionXDR(
    contractId: string,
    publicKey: string,
    selectedMethod: Partial<Method>,
  ): Promise<string> {
    const scArgs = await this.generateScArgsToFromContractId(
      contractId,
      selectedMethod,
    );

    const transaction = await this.stellarAdapter.prepareTransaction(
      publicKey,
      contractId,
      selectedMethod.name,
      scArgs,
    );

    return transaction.toXDR();
  }

  private handleError(error: Error): void {
    this.responseService.errorHandler({
      type: 'INTERNAL_SERVER_ERROR',
      error,
    });
  }
}
