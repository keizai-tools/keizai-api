import { Inject, Injectable, RequestTimeoutException } from '@nestjs/common';

import { StellarAdapter } from '@/common/infrastructure/stellar/stellar.adapter';
import { Method } from '@/modules/method/domain/method.domain';

import { ISmartContractService } from '../repository/smart-contract.interface.service';
import { ContractExecutable, ScSpecEntry, ScVal } from '../types/soroban';
import { IGeneratedMethod } from './contract.service';

@Injectable()
export class SmartContractService implements ISmartContractService {
  private SCSpecTypeMap: { [key: number]: string };
  constructor(
    @Inject(StellarAdapter) private readonly stellarAdapter: StellarAdapter,
  ) {
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

  async decodeContractSpecBuffer(buffer: ArrayBuffer): Promise<ScSpecEntry[]> {
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
          throw new RequestTimeoutException(
            'Unable to decode contract spec buffer.',
          );
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
      functionObj.inputs = inputs.map((input) => {
        const inputNameBuffer = input._attributes.name;
        const inputName = inputNameBuffer.toString('utf-8');
        const inputTypeValue = input._attributes.type._switch.value;
        const inputTypeName =
          this.SCSpecTypeMap[inputTypeValue] || 'Unknown Type';
        return { name: inputName, type: inputTypeName };
      });

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
    instanceValue: ContractExecutable,
  ): Promise<ScSpecEntry[]> {
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
    instanceValue: ContractExecutable,
    selectedMethod: Partial<Method>,
  ): Promise<ScVal[]> {
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

  async getSmartContractFunctions(
    instanceValue: ContractExecutable,
  ): Promise<IGeneratedMethod[]> {
    const decodedSections = await this.getContractSpecEntries(instanceValue);

    return decodedSections
      .map((decodedSection) => this.extractFunctionInfo(decodedSection))
      .filter((f) => {
        return Object.keys(f).length > 0 && f.name.length > 0;
      });
  }
}
