# Ephemeral Environment Module

This README provides a comprehensive overview of the Ephemeral Environment module, detailing its components, functionality, and internal flow. The module is designed to manage ephemeral environments using AWS Fargate, specifically focusing on task management and network configuration.

## Table of Contents

1. [Overview](#overview)
2. [Components](#components)
   - [Ephemeral Environment Service](#ephemeral-environment-service)
   - [Ephemeral Environment Controller](#ephemeral-environment-controller)
   - [Guards](#guards)
3. [Internal Flow](#internal-flow)
   - [Task Management](#task-management)
   - [Network Configuration](#network-configuration)
4. [Detailed File Descriptions](#detailed-file-descriptions)

---

## Overview

The Ephemeral Environment module is responsible for managing ephemeral environments using AWS Fargate. It includes functionalities for starting and stopping tasks, configuring network settings, and handling task status. The module is composed of several key components, including services, controllers, and guards.

## Components

### Ephemeral Environment Service

The `EphemeralEnvironmentService` class provides methods to manage AWS Fargate tasks. It includes methods for starting tasks, stopping tasks, configuring network settings, and retrieving task status.

### Ephemeral Environment Controller

The `EphemeralEnvironmentController` class handles HTTP requests related to ephemeral environments. It includes endpoints for starting tasks, stopping tasks, retrieving task status, and funding accounts.

### Guards

Guards are used to protect certain routes and ensure that the user has the necessary permissions to perform specific actions. The module includes the `FargateStartGuard` and `FargateStopGuard` to control access to task management endpoints.

## Internal Flow

### Task Management

1. **Start Task**: The `startTask` method in `EphemeralEnvironmentService` starts a new AWS Fargate task. It configures the task with the necessary network settings and environment variables, and sets up a CloudWatch rule to stop the task after a specified interval.
2. **Stop Task**: The `stopTask` method stops a running AWS Fargate task. It removes the associated CloudWatch rule and permissions, and updates the user's balance based on the remaining time.
3. **Get Task Status**: The `getTaskStatus` method retrieves the status of a running AWS Fargate task, including its public IP address and execution interval.

### Network Configuration

1. **Validate Ephemeral Network**: Ensures that the selected network is valid and configures the network for ephemeral environments if necessary.
2. **Get Task Public IP**: The `getTaskPublicIp` method retrieves the public IP address of a running AWS Fargate task.
3. **Check Stellar Container Status**: The `checkStellarContainerStatus` method checks the status of the Stellar container running on the ephemeral environment.

## Detailed File Descriptions

### /src/modules/ephemeralEnvironment/application/service/ephemeralEnvironment.service.ts

This file contains the `EphemeralEnvironmentService` class, which provides methods for managing AWS Fargate tasks. Key methods include:

- `startTask`: Starts a new AWS Fargate task with the specified configuration.
- `stopTask`: Stops a running AWS Fargate task and cleans up associated resources.
- `getTaskStatus`: Retrieves the status of a running AWS Fargate task.
- `getTaskPublicIp`: Retrieves the public IP address of a running AWS Fargate task.
- `checkStellarContainerStatus`: Checks the status of the Stellar container running on the ephemeral environment.
- `configureFargateStopRule`: Configures a CloudWatch rule to stop the task after a specified interval.
- `createCloudWatchRule`: Creates a CloudWatch rule with the specified cron expression.
- `addLambdaPermission`: Adds permission for the CloudWatch rule to invoke the Lambda function.
- `addCloudWatchTarget`: Adds the Lambda function as a target for the CloudWatch rule.
- `handleCommand`: Handles the execution of AWS SDK commands with error handling.
- `getClientTask`: Retrieves the AWS Fargate task associated with the specified client ID.
- `waitForTaskToRun`: Waits for the AWS Fargate task to transition to the RUNNING state.
- `waitForTaskToStop`: Waits for the AWS Fargate task to transition to the STOPPED state.
- `getAccountOrFund`: Retrieves or funds a Stellar account.
- `fetchWithRetry`: Fetches a URL with retry logic.

### /src/modules/ephemeralEnvironment/interface/ephemeralEnvironment.controller.ts

This file contains the `EphemeralEnvironmentController` class, which handles HTTP requests related to ephemeral environments. Key endpoints include:

- `handleStartFargate`: Starts a new AWS Fargate task.
- `handleStopFargate`: Stops a running AWS Fargate task.
- `handleGetTaskStatus`: Retrieves the status of a running AWS Fargate task.
- `handleGetAccountOrFund`: Retrieves or funds a Stellar account.

### /src/modules/ephemeralEnvironment/application/guard/fargateStopGuard.guard.ts

This file contains the `FargateStopGuard` class, which ensures that the user has the necessary permissions to stop a running AWS Fargate task.

### /src/modules/ephemeralEnvironment/application/guard/fargateAccessGuard.guard.ts

This file contains the `FargateStartGuard` class, which ensures that the user has the necessary permissions to start a new AWS Fargate task.

---

This README provides a comprehensive overview of the Ephemeral Environment module, detailing its components, functionality, and internal flow. For further information, refer to the individual files and their respective methods.
