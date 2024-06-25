export enum NETWORK {
  SOROBAN_FUTURENET = 'FUTURENET',
  SOROBAN_TESTNET = 'TESTNET',
  SOROBAN_MAINNET = 'MAINNET',
}

export enum SOROBAN_SERVER {
  FUTURENET = 'https://rpc-futurenet.stellar.org',
  TESTNET = 'https://soroban-testnet.stellar.org',
  MAINNET = 'https://soroban-rpc.mainnet.stellar.gateway.fm',
  FRIENDBOT_TESNET = 'https://friendbot.stellar.org?addr=',
}

export enum CONTRACT_EXECUTABLE_TYPE {
  STELLAR_ASSET = 'contractExecutableStellarAsset',
  WASM = 'contractExecutableWasm',
}

export enum SC_VAL_TYPE {
  BOOL = 'scvBool',
  ERROR = 'scvError',
  U32 = 'scvU32',
  I32 = 'scvI32',
  U64 = 'scvU64',
  I64 = 'scvI64',
  TIMEPOINT = 'scvTimepoint',
  DURATION = 'scvDuration',
  U128 = 'scvU128',
  I128 = 'scvI128',
  U256 = 'scvU256',
  I256 = 'scvI256',
  BYTES = 'scvBytes',
  STRING = 'scvString',
  SYMBOL = 'scvSymbol',
  ADDRESS = 'scvAddress',
  VEC = 'scvVec',
  MAP = 'scvMap',
}

export enum SOROBAN_CONTRACT_ERROR {
  NO_ENTRIES_FOUND = "No entries found for this contract address",
  HOST_FAILED = 'host invocation failed',
  HOST_ERROR = 'HostError',
}

export enum GetTransactionStatus {
  SUCCESS = 'SUCCESS',
  NOT_FOUND = 'NOT_FOUND',
  FAILED = 'FAILED',
}

export enum SendTransactionStatus {
  ERROR = 'ERROR',
  PENDING = 'PENDING',
}
