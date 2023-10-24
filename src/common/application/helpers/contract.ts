import { Address, Contract, Server, xdr } from 'soroban-client';

interface IGeneratedMethod {
  name: string;
  docs: string | null;
  inputs: { name: string; type: string }[];
  outputs: { type: string }[];
}

const SCSpecTypeMap = {
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

function getLedgerKeyContractCode(contractId: string) {
  const ledgerKey = xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: new Address(contractId).toScAddress(),
      key: xdr.ScVal.scvLedgerKeyContractInstance(),
      durability: xdr.ContractDataDurability.persistent(),
    }),
  );

  return ledgerKey;
}

function getLedgerKeyWasmId(contractCodeLedgerEntryData: string) {
  const entry = xdr.LedgerEntryData.fromXDR(
    contractCodeLedgerEntryData,
    'base64',
  );

  const instance = new xdr.ScContractInstance({
    executable: entry.contractData().val() as any,
    storage: [],
  });

  const ledgerKey = xdr.LedgerKey.contractCode(
    new xdr.LedgerKeyContractCode({
      hash: (
        xdr.ContractExecutable.contractExecutableWasm(
          instance.executable() as any,
        ) as any
      )
        .wasmHash()
        .instance()
        .executable()
        .wasmHash(),
    }),
  );

  return ledgerKey;
}

async function decodeContractSpecBuffer(buffer) {
  const arrayBuffer = new Uint8Array(buffer);
  const decodedData = [];
  let offset = 0;

  while (offset < arrayBuffer.length) {
    let success = false;
    for (let length = 1; length <= arrayBuffer.length - offset; length++) {
      const subArray = arrayBuffer.subarray(offset, offset + length) as any;
      try {
        const partialDecodedData = xdr.ScSpecEntry.fromXDR(subArray, 'base64');

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
      console.log('Successfully decoded the entire buffer.');
      break;
    }
  }
  return decodedData;
}

const extractFunctionInfo = (decodedSection, SCSpecTypeMap) => {
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
};

export async function generateMethodsFromContractId(contractId: string) {
  try {
    const contract = new Contract(contractId);

    const ledgerKeys = await contract.getFootprint();

    const server = new Server('https://soroban-testnet.stellar.org');

    const { entries } = await server.getLedgerEntries(...ledgerKeys);

    const entry = entries?.[0];
    if (!entry) {
      throw new Error('No entry found for the given hash');
    }

    const wasmLedgerKey = getLedgerKeyWasmId(entry.val.toXDR('base64'));

    const wasmResponse = await server.getLedgerEntries(wasmLedgerKey);

    const wasmEntry = wasmResponse.entries?.[0];
    if (!wasmEntry) {
      throw new Error('No entry found for the given wasmLedgerKey');
    }

    const entryData = xdr.LedgerEntryData.fromXDR(
      wasmEntry.val.toXDR('base64'),
      'base64',
    );

    const contractCode = entryData.contractCode().code();

    const wasmModule = new WebAssembly.Module(contractCode);

    const buffer = WebAssembly.Module.customSections(
      wasmModule,
      'contractspecv0',
    )[0];

    const decodedSections = await decodeContractSpecBuffer(buffer);

    const functions = decodedSections
      .map((decodedSection) =>
        extractFunctionInfo(decodedSection, SCSpecTypeMap),
      )
      .filter((f) => Object.keys(f).length > 0);

    return functions;
  } catch (error) {
    throw new Error(error);
  }
}