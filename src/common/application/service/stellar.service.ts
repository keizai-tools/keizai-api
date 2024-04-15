import {
  Inject,
  Injectable,
  RequestTimeoutException,
  UseInterceptors,
} from '@nestjs/common';
import { ResilienceInterceptor, RetryStrategy } from 'nestjs-resilience';
import { xdr } from 'stellar-sdk';

import { StellarAdapter } from '@/common/infrastructure/stellar/stellar.adapter';
import { MethodMapper } from '@/modules/method/application/mapper/method.mapper';
import { Method } from '@/modules/method/domain/method.domain';

import { StellarMapper } from '../mapper/contract.mapper';
import { IContractService } from '../repository/contract.interface.service';
import { CONTRACT_EXECUTABLE_TYPE, NETWORK } from '../types/soroban.enum';

export interface IGeneratedMethod {
  name: string;
  docs: string | null;
  inputs: { name: string; type: string }[];
  outputs: { type: string }[];
}

@Injectable()
export class StellarService implements IContractService {
  private SCSpecTypeMap: { [key: number]: string };
  private currentNetwork: string;
  constructor(
    @Inject(StellarAdapter) private readonly stellarAdapter: StellarAdapter,
    @Inject(MethodMapper) private readonly methodMapper: MethodMapper,
    @Inject(StellarMapper) private readonly stellarMapper: StellarMapper,
  ) {
    this.currentNetwork = NETWORK.SOROBAN_FUTURENET;
    this.SCSpecTypeMap = {
      0: 'SC_SPEC_TYPE_VAL',
      1: 'SC_SPEC_TYPE_BOOL',
      2: 'SC_SPEC_TYPE_VOID',
      3: 'SC_SPEC_TYPE_ERROR',
      4: 'SC_SPEC_TYPE_U32',
      5: 'SC_SPEC_TYPE_I32',
      6: 'SC_SPEC_TYPE_U64',
      7: 'SC_SPEC_TYPE_I64',
      8: 'SC_SPEC_TYPE_TIMEPOINT',
      9: 'SC_SPEC_TYPE_DURATION',
      10: 'SC_SPEC_TYPE_U128',
      11: 'SC_SPEC_TYPE_I128',
      12: 'SC_SPEC_TYPE_U256',
      13: 'SC_SPEC_TYPE_I256',
      14: 'SC_SPEC_TYPE_BYTES',
      16: 'SC_SPEC_TYPE_STRING',
      17: 'SC_SPEC_TYPE_SYMBOL',
      19: 'SC_SPEC_TYPE_ADDRESS',
      1000: 'SC_SPEC_TYPE_OPTION',
      1001: 'SC_SPEC_TYPE_RESULT',
      1002: 'SC_SPEC_TYPE_VEC',
      1004: 'SC_SPEC_TYPE_MAP',
      1005: 'SC_SPEC_TYPE_TUPLE',
      1006: 'SC_SPEC_TYPE_BYTES_N',
      2000: 'SC_SPEC_TYPE_UDT',
    };
  }

  verifyNetwork(selectedNetwork: string): void {
    if (selectedNetwork !== this.currentNetwork) {
      this.stellarAdapter.changeNetwork(selectedNetwork);
      this.currentNetwork = selectedNetwork;
    }
  }

  getStellarAssetContractFunctions(): IGeneratedMethod[] {
    return [
      {
        name: 'allowance',
        docs: null,
        inputs: [
          {
            name: 'from',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
          {
            name: 'spender',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
        ],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_I128',
          },
        ],
      },
      {
        name: 'authorized',
        docs: null,
        inputs: [
          {
            name: 'id',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
        ],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_BOOL',
          },
        ],
      },
      {
        name: 'approve',
        docs: null,
        inputs: [
          {
            name: 'from',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
          {
            name: 'spender',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
          {
            name: 'amount',
            type: 'SC_SPEC_TYPE_I128',
          },
          {
            name: 'expiration_ledger',
            type: 'SC_SPEC_TYPE_I32',
          },
        ],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_RESULT',
          },
        ],
      },
      {
        name: 'balance',
        docs: null,
        inputs: [
          {
            name: 'id',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
        ],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_I128',
          },
        ],
      },
      {
        name: 'burn',
        docs: null,
        inputs: [
          {
            name: 'from',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
          {
            name: 'amount',
            type: 'SC_SPEC_TYPE_I128',
          },
        ],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_RESULT',
          },
        ],
      },
      {
        name: 'burn_from',
        docs: null,
        inputs: [
          {
            name: 'spender',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
          {
            name: 'from',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
          {
            name: 'amount',
            type: 'SC_SPEC_TYPE_I128',
          },
        ],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_I128',
          },
        ],
      },
      {
        name: 'clawback',
        docs: null,
        inputs: [
          {
            name: 'from',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
          {
            name: 'amount',
            type: 'SC_SPEC_TYPE_I128',
          },
        ],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_I128',
          },
        ],
      },
      {
        name: 'decimals',
        docs: null,
        inputs: [],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_RESULT',
          },
        ],
      },
      {
        name: 'mint',
        docs: null,
        inputs: [
          {
            name: 'to',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
          {
            name: 'amount',
            type: 'SC_SPEC_TYPE_I128',
          },
        ],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_RESULT',
          },
        ],
      },
      {
        name: 'name',
        docs: null,
        inputs: [],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_STRING',
          },
        ],
      },
      {
        name: 'set_admin',
        docs: null,
        inputs: [
          {
            name: 'new_admin',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
        ],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_RESULT',
          },
        ],
      },
      {
        name: 'admin',
        docs: null,
        inputs: [],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_RESULT',
          },
        ],
      },
      {
        name: 'set_authorized',
        docs: null,
        inputs: [
          {
            name: 'id',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
          {
            name: 'authorize',
            type: 'SC_SPEC_TYPE_BOOL',
          },
        ],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_RESULT',
          },
        ],
      },
      {
        name: 'symbol',
        docs: null,
        inputs: [],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_STRING',
          },
        ],
      },
      {
        name: 'transfer',
        docs: null,
        inputs: [
          {
            name: 'from',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
          {
            name: 'to',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
          {
            name: 'amount',
            type: 'SC_SPEC_TYPE_I128',
          },
        ],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_RESULT',
          },
        ],
      },
      {
        name: 'transfer_from',
        docs: null,
        inputs: [
          {
            name: 'spender',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
          {
            name: 'from',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
          {
            name: 'to',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
          {
            name: 'amount',
            type: 'SC_SPEC_TYPE_I128',
          },
        ],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_RESULT',
          },
        ],
      },
    ];
  }

  async decodeContractSpecBuffer(
    buffer: ArrayBuffer,
  ): Promise<xdr.ScSpecEntry[]> {
    const arrayBuffer = new Uint8Array(buffer);
    const decodedData = [];
    let offset = 0;

    while (offset < arrayBuffer.length) {
      let success = false;
      for (let length = 1; length <= arrayBuffer.length - offset; length++) {
        const subArray = arrayBuffer.subarray(offset, offset + length) as any;
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
  }

  extractFunctionInfo(decodedSection): IGeneratedMethod {
    const functionObj = {
      name: '',
      docs: null,
      inputs: [],
      outputs: [],
    };

    if (decodedSection._switch.name === 'scSpecEntryFunctionV0') {
      // Extract and convert the name of the function to a string
      const functionNameBuffer = decodedSection._value._attributes.name;
      const functionName = functionNameBuffer.toString('utf-8');
      functionObj.name = functionName;

      // Extract and store the function documentation if available
      const functionDocBuffer = decodedSection._value._attributes.doc;
      const functionDoc = functionDocBuffer.toString('utf-8');
      if (functionDoc) {
        functionObj.docs = functionDoc;
      }

      // Initialize arrays for inputs and outputs
      functionObj.inputs = [];
      functionObj.outputs = [];

      // Process inputs
      const inputs = decodedSection._value._attributes.inputs;
      functionObj.inputs = inputs.map((input) => {
        const inputNameBuffer = input._attributes.name;
        const inputName = inputNameBuffer.toString('utf-8');
        const inputTypeValue = input._attributes.type._switch.value;
        const inputTypeName =
          this.SCSpecTypeMap[inputTypeValue] || 'Unknown Type';
        return { name: inputName, type: inputTypeName };
      });

      // Process outputs
      const outputs = decodedSection._value._attributes.outputs;
      functionObj.outputs = outputs.map((output) => {
        const outputTypeValue = output._switch.value;
        const outputTypeName =
          this.SCSpecTypeMap[outputTypeValue] || 'Unknown Type';
        return { type: outputTypeName };
      });
    }

    return functionObj;
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
      throw new Error(error);
    }
  }

  async getScValFromSmartContract(
    instanceValue: xdr.ContractExecutable,
    selectedMethod: Partial<Method>,
  ): Promise<xdr.ScVal[]> {
    const maxRetries = 7;
    let retries = 0;
    let specEntries;

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
      throw new RequestTimeoutException('Unable to get contract spec entries.');
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
  }

  async generateMethodsFromContractId(contractId: string) {
    try {
      const instanceValue = await this.stellarAdapter.getInstanceValue(
        contractId,
      );
      if (
        instanceValue.switch().name === CONTRACT_EXECUTABLE_TYPE.STELLAR_ASSET
      ) {
        return this.getStellarAssetContractFunctions();
      }

      const decodedSections = await this.getContractSpecEntries(instanceValue);

      return decodedSections
        .map((decodedSection) => this.extractFunctionInfo(decodedSection))
        .filter((f) => {
          return Object.keys(f).length > 0 && f.name.length > 0;
        });
    } catch (error) {
      throw new Error(error);
    }
  }

  async generateScArgsToFromContractId(
    contractId: string,
    selectedMethod: Partial<Method>,
  ): Promise<xdr.ScVal[]> {
    const instanceValue = await this.stellarAdapter.getInstanceValue(
      contractId,
    );

    if (
      instanceValue.switch().name === CONTRACT_EXECUTABLE_TYPE.STELLAR_ASSET
    ) {
      return this.stellarMapper.getScValFromStellarAssetContract(
        selectedMethod,
      );
    }

    return await this.getScValFromSmartContract(instanceValue, selectedMethod);
  }

  @UseInterceptors(
    ResilienceInterceptor(
      new RetryStrategy({
        maxRetries: 5,
      }),
    ),
  )
  async runInvocation(
    publicKey: string,
    secretKey: string,
    contractId: string,
    selectedMethod: Partial<Method>,
  ) {
    try {
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

      this.stellarAdapter.signTransaction(transaction, secretKey);

      const response = await this.stellarAdapter.rawSendTransaction(
        transaction,
      );

      if (response.status === 'ERROR') {
        return response;
      }

      let newresponse = await this.stellarAdapter.getTransaction(response.hash);

      while (newresponse.status === 'NOT_FOUND') {
        newresponse = await this.stellarAdapter.getTransaction(response.hash);

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const methodMapped = this.methodMapper.fromDtoToEntity(selectedMethod);

      if (newresponse.status === 'SUCCESS') {
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
        STATUS: rawResponse.status,
        // TODO Decode XDRs
        response: rawResponse,
        method: methodMapped,
      };
    } catch (e) {
      console.log(e);
      return e;
    }
  }
}
