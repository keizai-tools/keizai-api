# Invocation Module

The Invocation module is responsible for managing invocations within the application. It includes functionalities for creating, updating, deleting, and running invocations, as well as handling related entities such as methods and folders.

## Components

### Controllers

- **InvocationUserController**: Handles HTTP requests related to invocations for authenticated users. It includes endpoints for creating, retrieving, updating, and deleting invocations, as well as running and preparing invocations. This controller ensures that only authenticated users can perform operations on invocations.

### Services

- **InvocationService**: Contains the business logic for managing invocations. It interacts with repositories to perform CRUD operations and handles the preparation and execution of invocation transactions. The service is responsible for validating data, preparing transactions, and interacting with external services such as the Stellar network.

### Repositories

- **InvocationRepository**: Provides methods for interacting with the database to perform CRUD operations on invocations. It uses TypeORM for database interactions and ensures that data is persisted correctly.

### Schemas

- **InvocationSchema**: Defines the database schema for the Invocation entity using TypeORM's `EntitySchema`. It includes columns and relations for the Invocation entity, ensuring that the data structure is consistent and relational integrity is maintained.

### Mappers

- **InvocationMapper**: Responsible for mapping between DTOs and entities. It converts data transfer objects to entities and vice versa, ensuring that data is correctly transformed between different layers of the application.

## Key Functionalities

### Creating an Invocation

To create an invocation, the `create` method in `InvocationUserController` is used. It accepts a `CreateInvocationDto` and the current user data, and calls the `createByUser` method in `InvocationService`. The service validates the data, creates the invocation entity, and saves it to the database.

### Running an Invocation

The `runInvocation` method in `InvocationUserController` handles running an invocation. It accepts the invocation ID, user data, and a signed transaction XDR. It calls the `runInvocationByUser` method in `InvocationService`, which prepares and executes the transaction on the Stellar network.

### Preparing an Invocation

The `prepareInvocation` method in `InvocationUserController` prepares an invocation for execution. It accepts the invocation ID and user data, and calls the `prepareInvocationByUser` method in `InvocationService`. The service prepares the transaction by validating the invocation and generating the necessary transaction data.

### Uploading WASM Files

The module supports uploading WASM files for invocations. The `uploadWASM` method in `InvocationUserController` handles the file upload, and the `prepareUploadWASM` method prepares the upload. The `InvocationService` interacts with the `FileUploadService` to manage file uploads, ensuring that files are correctly stored and accessible.

## Example Usage

### Creating an Invocation

```typescript
@Post()
async create(
  @CurrentUser() data: IResponse<User>,
  @Body() createInvocationDto: CreateInvocationDto,
): IPromiseResponse<InvocationResponseDto> {
  return this.invocationService.createByUser(createInvocationDto, data.payload.id);
}
```

### Running an Invocation

```typescript
@Post('/:id/run')
runInvocation(
  @CurrentUser() data: IResponse<User>,
  @Param('id') id: string,
  @Body() { signedTransactionXDR }: { signedTransactionXDR?: string },
): IPromiseResponse<RunInvocationResponse | ContractErrorResponse> {
  return this.invocationService.runInvocationByUser(id, data.payload.id, signedTransactionXDR);
}
```

### Uploading a WASM File

```typescript
@Post('/:id/upload/wasm')
@UseInterceptors(FileInterceptor('wasm'))
async uploadWASM(
  @CurrentUser() data: IResponse<User>,
  @Param('id') id: string,
  @UploadedFile(WasmFileValidationPipe) wasm: Express.Multer.File,
): IPromiseResponse<string | ContractErrorResponse> {
  return await this.invocationService.uploadWASM(id, data.payload.id, wasm);
}
```

## Detailed Explanation of Service and Controller

### InvocationUserController

The `InvocationUserController` is a NestJS controller that handles HTTP requests related to invocations. It uses decorators such as `@Post`, `@Get`, `@Patch`, and `@Delete` to define endpoints for various operations. The controller methods are responsible for receiving requests, validating input data, and calling the appropriate service methods to perform the requested operations.

Key methods in `InvocationUserController` include:

- `create`: Creates a new invocation.
- `findOne`: Retrieves a specific invocation by ID.
- `runInvocation`: Runs an invocation by executing a transaction.
- `prepareInvocation`: Prepares an invocation for execution.
- `uploadWASM`: Handles the upload of WASM files.
- `prepareUploadWASM`: Prepares the upload of WASM files.
- `runUploadWASM`: Executes the upload of WASM files.

### InvocationService

The `InvocationService` contains the business logic for managing invocations. It interacts with repositories to perform CRUD operations and handles the preparation and execution of invocation transactions. The service methods are responsible for validating data, preparing transactions, and interacting with external services such as the Stellar network.

Key methods in `InvocationService` include:

- `createByUser`: Creates a new invocation for a user.
- `runInvocationByUser`: Runs an invocation for a user by executing a transaction.
- `prepareInvocationByUser`: Prepares an invocation for a user by generating the necessary transaction data.
- `uploadWASM`: Handles the upload of WASM files.
- `prepareUploadWASM`: Prepares the upload of WASM files.
- `runUploadWASM`: Executes the upload of WASM files.
- `findOneByInvocationAndUserId`: Retrieves a specific invocation by ID and user ID.
- `findAllMethodsByUser`: Retrieves all methods associated with an invocation for a user.
- `updateByUser`: Updates an invocation for a user.
- `deleteByUser`: Deletes an invocation for a user.

The service also includes private methods for handling errors and interacting with external services.

## Error Handling

The `InvocationService` includes a `handleError` method to handle errors consistently. It uses the `responseService` to create error responses, ensuring that errors are logged and appropriate error messages are returned to the client.

```typescript
private handleError(error: Error): void {
  this.responseService.errorHandler({
    type: 'INTERNAL_SERVER_ERROR',
    error,
  });
}
```

## Conclusion

The Invocation module provides a comprehensive set of functionalities for managing invocations within the application. It includes controllers, services, repositories, schemas, and mappers to handle various aspects of invocations, from creation to execution and file uploads. The module ensures that invocations are managed securely and efficiently, providing a robust foundation for building complex applications.
