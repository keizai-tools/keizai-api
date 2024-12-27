# Response Service

## Overview

The response service is designed to handle and format responses for the Keizai API. It includes utilities for generating error messages, interceptors for transforming responses, and filters for handling exceptions.

## Files

### 1. `utils/utils.ts`

This file contains utility functions for generating error messages.

#### Key Function:
- `generateErrorMessages(code: number, response: string | string[] | object)`: Generates a formatted error message based on the provided status code and response.

### 2. `service/response.service.ts`

This file defines the `ResponseService` class, which extends `ConsoleLogger` and implements `IResponseService`.

#### Key Methods:
- `createResponse`: Creates a standardized response object.
- `errorHandler`: Handles errors and throws appropriate HTTP exceptions.
- `handleError`: Logs error messages.
- `createHttpException`: Creates an `HttpException` with detailed error information.

### 3. `interceptor/success_response.interceptor.ts`

This file defines the `SuccessResponseInterceptor` class, which implements `NestInterceptor`.

#### Key Methods:
- `intercept`: Intercepts the response and adds additional metadata such as timestamp and request path.
- `transformBigInt`: Transforms `BigInt` values to a JSON-compatible format.
- `removeTypeFirstLayer`: Removes the `type` property from the response object.

### 4. `filter/all_exceptions.filter.ts`

This file defines the `AllExceptionsFilter` class, which extends `BaseExceptionFilter`.

#### Key Methods:
- `catch`: Catches exceptions and generates a formatted error response.
- `removeDuplicateValues`: Removes duplicate values from the exception response.

### 5. `domain/http_status.domain.ts`

This file contains mappings and functions related to HTTP status codes.

#### Key Exports:
- `HttpStatusFormatted`: A mapping of HTTP status codes to their descriptions.
- `causesError`: Functions that return possible causes for each HTTP status code.
- `messageError`: Functions that return error messages for each HTTP status code.
- `fixesError`: Functions that return suggested fixes for each HTTP status code.

## Usage

To use the response service, import the necessary classes and functions from the respective files and integrate them into your NestJS application.

```typescript
import { ResponseService } from './service/response.service';
import { SuccessResponseInterceptor } from './interceptor/success_response.interceptor';
import { AllExceptionsFilter } from './filter/all_exceptions.filter';
import { generateErrorMessages } from './utils/utils';
```

## License

This project is licensed under the MIT License.
