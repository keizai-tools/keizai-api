import {
  Inject,
  Injectable,
  RequestTimeoutException,
  UseInterceptors,
} from '@nestjs/common';
import { ResilienceInterceptor, RetryStrategy } from 'nestjs-resilience';
import {
  Address,
  BASE_FEE,
  Contract,
  ContractSpec,
  Keypair,
  Networks,
  SorobanRpc,
  TransactionBuilder,
  xdr,
} from 'stellar-sdk';

import { MethodMapper } from '@/modules/method/application/mapper/method.mapper';

import { IContractService } from '../repository/contract.interface.service';

export interface IGeneratedMethod {
  name: string;
  docs: string | null;
  inputs: { name: string; type: string }[];
  outputs: { type: string }[];
}

@Injectable()
export class StellarService implements IContractService {
  private SCSpecTypeMap: { [key: number]: string };
  private server: SorobanRpc.Server;
  constructor(
    @Inject(MethodMapper) private readonly methodMapper: MethodMapper,
  ) {
    this.server = new SorobanRpc.Server('https://rpc-futurenet.stellar.org');
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

  async decodeContractSpecBuffer(buffer) {
    const arrayBuffer = new Uint8Array(buffer);
    const decodedData = [];
    let offset = 0;

    while (offset < arrayBuffer.length) {
      let success = false;
      for (let length = 1; length <= arrayBuffer.length - offset; length++) {
        const subArray = arrayBuffer.subarray(offset, offset + length) as any;
        try {
          const partialDecodedData = xdr.ScSpecEntry.fromXDR(
            subArray,
            'base64',
          );

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

  extractFunctionInfo(decodedSection, SCSpecTypeMap) {
    const functionObj: IGeneratedMethod = {
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
        const inputTypeName = SCSpecTypeMap[inputTypeValue] || 'Unknown Type';
        return { name: inputName, type: inputTypeName };
      });

      // Process outputs
      const outputs = decodedSection._value._attributes.outputs;
      functionObj.outputs = outputs.map((output) => {
        const outputTypeValue = output._switch.value;
        const outputTypeName = SCSpecTypeMap[outputTypeValue] || 'Unknown Type';
        return { type: outputTypeName };
      });
    }

    return functionObj;
  }

  async getInstanceValue(contractId: string): Promise<xdr.ContractDataEntry> {
    try {
      const instanceKey = xdr.LedgerKey.contractData(
        new xdr.LedgerKeyContractData({
          contract: new Address(contractId).toScAddress(),
          key: xdr.ScVal.scvLedgerKeyContractInstance(),
          durability: xdr.ContractDataDurability.persistent(),
        }),
      );

      const response = await this.server.getLedgerEntries(instanceKey);
      const dataEntry = response.entries[0].val.contractData();
      return dataEntry;
    } catch (error) {
      console.log('Error while getting instance value: ', error);
    }
  }

  async getWasmCode(instance: xdr.ScContractInstance): Promise<Buffer> {
    try {
      const codeKey = xdr.LedgerKey.contractCode(
        new xdr.LedgerKeyContractCode({
          hash: instance.executable().wasmHash(),
        }),
      );

      const response = await this.server.getLedgerEntries(codeKey);
      const wasmCode = response.entries[0].val.contractCode().code();
      return wasmCode;
    } catch (error) {
      console.log('Error while getting wasm code: ', error);
    }
  }

  async getContractSpecEntries(contractId) {
    try {
      const instanceValue = await this.getInstanceValue(contractId);
      const contractCode = await this.getWasmCode(
        instanceValue.val().instance(),
      );

      const wasmModule = new WebAssembly.Module(contractCode);

      const buffer = WebAssembly.Module.customSections(
        wasmModule,
        'contractspecv0',
      )[0];

      const decodedSections = await this.decodeContractSpecBuffer(buffer);
      return decodedSections;
    } catch (error) {
      throw new Error(error);
    }
  }

  async generateMethodsFromContractId(contractId: string) {
    try {
      const decodedSections = await this.getContractSpecEntries(contractId);

      const functions = decodedSections
        .map((decodedSection) =>
          this.extractFunctionInfo(decodedSection, this.SCSpecTypeMap),
        )
        .filter((f) => {
          return Object.keys(f).length > 0 && f.name.length > 0;
        });

      return functions;
    } catch (error) {
      throw new Error(error);
    }
  }

  @UseInterceptors(
    ResilienceInterceptor(
      new RetryStrategy({
        maxRetries: 5,
      }),
    ),
  )
  async runInvocation(publicKey, secretKey, contractId, selectedMethod) {
    const account = await this.server.getAccount(publicKey);
    const contract = new Contract(contractId);

    const maxRetries = 7;
    let retries = 0;
    let specEntries;

    while (retries < maxRetries) {
      try {
        specEntries = await this.getContractSpecEntries(contractId);
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

    const contractSpec = new ContractSpec(specEntries);

    const params = selectedMethod.params.reduce(
      (acc, param) => ({
        ...acc,
        [param.name]: param.value,
      }),
      {},
    );

    const scArgs = contractSpec.funcArgsToScVals(selectedMethod.name, params);

    let transaction: any = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.FUTURENET,
    })
      .addOperation(contract.call(selectedMethod.name, ...scArgs))
      .setTimeout(60)
      .build();
    transaction = await this.server.prepareTransaction(transaction);
    transaction.sign(Keypair.fromSecret(secretKey));

    try {
      const response = await this.server._sendTransaction(transaction);

      if (response.status === 'ERROR') {
        return response;
      }

      let newresponse = await this.server.getTransaction(response.hash);

      while (newresponse.status === 'NOT_FOUND') {
        newresponse = await this.server.getTransaction(response.hash);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      const methodMapped = this.methodMapper.fromDtoToEntity(selectedMethod);
      if (newresponse.status === 'SUCCESS') {
        return {
          method: methodMapped,
          response: newresponse.returnValue.value(),
          status: newresponse.status,
        };
      }

      const rawResponse = await this.server._getTransaction(response.hash);
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
