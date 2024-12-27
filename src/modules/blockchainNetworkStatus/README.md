# Blockchain Network Status Module

## Overview

The `blockchainNetworkStatus` module is responsible for checking the health status of different Soroban blockchain networks. It provides an API endpoint to retrieve the status of the FutureNet, TestNet, and MainNet networks.

## Components

### Controller

The `BlockchainNetworkStatusController` handles incoming HTTP requests and returns the network status. It uses the `BlockchainNetworkStatusService` to get the status of the networks.

- **Endpoint**: `GET /blockchain_network_status/soroban_network`
- **Response**: 
  ```json
  {
    "futureNetwork": boolean,
    "testNetwork": boolean,
    "mainNetwork": boolean
  }
  ```

### Service

The `BlockchainNetworkStatusService` contains the business logic to check the health status of the Soroban networks. It makes HTTP requests to the respective network endpoints and processes the responses.

- **Method**: `getNetworkStatus()`
  - Checks the status of FutureNet, TestNet, and MainNet.
  - Returns a response indicating the health status of each network.

### Module

The `BlockchainNetworkStatusModule` imports necessary dependencies and provides the controller and service.

## Dependencies

- **HttpModule**: Used for making HTTP requests to the Soroban network endpoints.
- **CommonModule**: Provides common functionalities and services used across the application.

## Usage

To use this module, ensure it is imported in your main application module. The controller will be available to handle requests to the `/blockchain_network_status/soroban_network` endpoint.

## Example

Here is an example of how to call the endpoint and interpret the response:

```bash
curl -X GET http://your-api-url/blockchain_network_status/soroban_network
```

Response:
```json
{
  "futureNetwork": true,
  "testNetwork": false,
  "mainNetwork": true
}
```

In this example, the FutureNet and MainNet are healthy, while the TestNet is not.

## Error Handling

The service includes error handling to ensure that if a network check fails, it returns `false` for that network's status. This ensures that the API can still provide a response even if one or more network checks fail.

## Conclusion

The `blockchainNetworkStatus` module is a crucial part of the application, providing real-time health status of the Soroban blockchain networks. It is designed to be robust and handle errors gracefully, ensuring reliable information is always available.
