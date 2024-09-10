export enum NETWORK {
  SOROBAN_FUTURENET = 'FUTURENET',
  SOROBAN_TESTNET = 'TESTNET',
  SOROBAN_MAINNET = 'MAINNET',
  SOROBAN_AUTO_DETECT = 'AUTO_DETECT',
}

export enum SOROBAN_SERVER {
  FUTURENET = 'https://rpc-futurenet.stellar.org',
  TESTNET = 'https://soroban-testnet.stellar.org',
  MAINNET = 'https://soroban-rpc.mainnet.stellar.gateway.fm',
  FRIENDBOT_TESNET = 'https://friendbot.stellar.org?addr=',
  FRIENDBOT_FUTURENET = 'https://friendbot-futurenet.stellar.org/?addr=',
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
  NO_ENTRIES_FOUND = 'No entries found for this contract address',
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
  SUCCESS = 'SUCCESS',
}

export enum ContractMethods {
  DEPLOY = 'deploy',
}

export enum ErrorMessages {
  TRANSACTION_NOT_FOUND = 'Transaction not found',
  CONTRACT_NOT_FOUND = 'Contract not found',
  CONTRACT_ALREADY_EXISTS = 'Contract already exists',
  ACCOUNT_NOT_FOUND_ON_MAINNET = 'Account does not exist on mainnet.',
  FAILED_TO_FUND_ACCOUNT = 'Failed to fund account using Friendbot.',
  ERROR_SENDING_TRANSACTION = 'Error sending transaction',
  UNSUPPORTED_NETWORK = 'Unsupported network',
  UNKNOWN_TYPE = 'Unknown Type',
  UNABLE_TO_GET_CONTRACT_SPEC_ENTRIES = 'Unable to get contract spec entries.',
}
