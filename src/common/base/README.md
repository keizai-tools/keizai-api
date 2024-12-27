# Common Base Module

This module contains common base functionalities and utilities used across the application.

## Files

### `interface/common.interface.ts`

This file defines common interfaces used for database queries and responses.

- `IFindAllOptions`: Interface for pagination options with `take` and `skip` properties.
- `IFindAllResponse<T>`: Generic interface for paginated responses, containing `data`, `total`, `take`, and `skip` properties.

### `infrastructure/persistence/base.schema.ts`

This file defines the base schema for database entities using TypeORM.

- `baseColumnSchemas`: Object containing common column definitions such as `id`, `createdAt`, and `updatedAt`.

### `enum/common.enum.ts`

This file defines common enums used across the application.

- `ENVIRONMENT`: Enum representing different environments like `PRODUCTION`, `STAGING`, `DEVELOPMENT`, and `AUTOMATED_TEST`.

### `domain/base.domain.ts`

This file defines the base domain model.

- `Base`: Class representing the base domain model with optional properties `id`, `createdAt`, and `updatedAt`.

### `application/pipe/wasm-file-validation.pipe.ts`

This file defines a custom validation pipe for WebAssembly (WASM) files.

- `WasmFileValidationPipe`: Injectable class implementing `PipeTransform` to validate WASM files based on type and size.

### `application/dto/pagination.dto.ts`

This file defines a Data Transfer Object (DTO) for pagination.

- `PaginationDto`: Class with optional properties `take` and `skip`, both validated to be numbers and greater than or equal to 0.
