# Stellar Service Module

This README provides a comprehensive overview of the Stellar Service module, detailing its components, functionality, and internal flow. The module is designed to interact with the Stellar blockchain, specifically focusing on contract management and transaction handling.

## Table of Contents

1. [Overview](#overview)
2. [Components](#components)
   - [Stellar Service](#stellar-service)
   - [Stellar Adapter](#stellar-adapter)
   - [Mappers](#mappers)
   - [Interfaces](#interfaces)
   - [Domain](#domain)
3. [Internal Flow](#internal-flow)
   - [Network Management](#network-management)
   - [Contract Management](#contract-management)
   - [Transaction Handling](#transaction-handling)
4. [Detailed File Descriptions](#detailed-file-descriptions)

---

## Overview

The Stellar Service module is responsible for managing interactions with the Stellar blockchain. It includes functionalities for verifying networks, generating methods from contract IDs, running invocations, preparing transactions, and handling contract deployments. The module is composed of several key components, including services, adapters, mappers, interfaces, and domain definitions.

## Components

### Stellar Service

The `StellarService` class is the main service that provides various methods to interact with the Stellar blockchain. It includes methods for verifying networks, generating methods from contract IDs, running invocations, preparing transactions, and deploying contracts.

### Stellar Adapter

The `StellarAdapter` class is responsible for low-level interactions with the Stellar blockchain. It handles network changes, contract existence checks, transaction preparation, and execution. The adapter abstracts the complexity of interacting with the Stellar SDK and provides a simplified interface for the service layer.

### Mappers

Mappers are responsible for converting data between different formats. The `StellarMapper` class, for example, converts Stellar-specific data structures into application-specific formats and vice versa.

### Interfaces

Interfaces define the contracts for the services and adapters. They ensure that the implementations adhere to the expected methods and properties. Key interfaces include `IStellarService`, `IStellarAdapter`, and `IStellarMapper`.

### Domain

The domain layer includes enums, constants, and type definitions that are used throughout the module. This layer defines the core concepts and values that the module operates on.

## Internal Flow

### Network Management

1. **Change Network**: The `changeNetwork` method in `StellarAdapter` allows switching between different Stellar networks (e.g., FUTURENET, TESTNET, MAINNET).
2. **Validate Ephemeral Network**: Ensures that the selected network is valid and, if necessary, configures the network for ephemeral environments.

### Contract Management

1. **Verify Network**: The `verifyNetwork` method in `StellarService` checks if the selected network matches the current network and updates it if necessary.
2. **Generate Methods from Contract ID**: The `generateMethodsFromContractId` method retrieves contract specifications and decodes them to generate method definitions.
3. **Deploy WASM File**: The `deployWasmFile` method handles the deployment of WebAssembly (WASM) files to the Stellar blockchain.

### Transaction Handling

1. **Run Invocation**: The `runInvocation` method prepares and executes a transaction based on the provided invocation parameters.
2. **Prepare Transaction**: The `prepareTransaction` method in `StellarAdapter` constructs a transaction object with the necessary operations and signs it if required.
3. **Send Transaction**: The `sendTransaction` method sends the prepared transaction to the Stellar network and handles the response.

## Detailed File Descriptions

### /src/common/stellar_service/service/stellar.service.ts

This file contains the `StellarService` class, which provides high-level methods for interacting with the Stellar blockchain. Key methods include:

- `verifyNetwork`
- `generateMethodsFromContractId`
- `runInvocation`
- `deployWasmFile`
- `prepareUploadWASM`
- `runUploadWASM`
- `getPreparedTransactionXDR`
- `pollTransactionStatus`
- `generateScArgsToFromContractId`
- `getStellarAssetContractFunctions`
- `decodeContractSpecBuffer`
- `extractFunctionInfo`
- `getContractSpecEntries`
- `getScValFromSmartContract`

### /src/common/stellar_service/adapter/stellar.adapter.ts

This file contains the `StellarAdapter` class, which handles low-level interactions with the Stellar blockchain. Key methods include:

- `changeNetwork`
- `getInstanceValue`
- `prepareTransaction`
- `sendTransaction`
- `uploadWasm`
- `deployContract`
- `executeTransactionWithRetry`
- `verifyNetwork`
- `getScSpecEntryFromXDR`
- `createContractSpec`
- `contractExists`
- `getWasmCode`
- `getContractEvents`
- `getKeypair`
- `getTransaction`
- `submitSignedTransaction`
- `prepareUploadWASM`
- `signTransaction`
- `streamTransactionsByMemoId`
- `buildAndSendTransaction`
- `createTransaction`
- `getOperationDetails`
- `validateEphemeralNetwork`
- `setNetwork`
- `updateUserBalance`
- `getAccountOrFund`
- `fundAccount`
- `createDeployContractOperation`
- `extractContractAddress`
- `fetchFromServer`
- `checkContractNetwork`
- `findNetworkWithContract`
