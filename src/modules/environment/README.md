# Environment Module

## Overview

The Environment module is responsible for managing environment configurations within the application. It provides functionalities to create, update, delete, and retrieve environment settings associated with users and teams.

## Components

### Controllers

#### `EnvironmentUserController`

This controller handles HTTP requests related to environment operations for users. It includes endpoints for creating, updating, deleting, and retrieving environments.

- **POST `/environment`**: Create a new environment.
- **GET `/environment/:id`**: Retrieve an environment by its ID.
- **PATCH `/environment`**: Update an existing environment.
- **DELETE `/environment/:id`**: Delete an environment by its ID.
- **DELETE `/environment`**: Delete an environment by its name and collection ID.

### Services

#### `EnvironmentService`

This service contains the business logic for managing environments. It interacts with the repository to perform CRUD operations and handles any necessary validations and error handling.

- **createByUser**: Creates an environment for a user.
- **createByTeam**: Creates an environment for a team.
- **updateByUser**: Updates an environment for a user.
- **updateByTeam**: Updates an environment for a team.
- **deleteByUser**: Deletes an environment for a user.
- **deleteByTeam**: Deletes an environment for a team.
- **deleteByName**: Deletes an environment by its name and collection ID.

### Repositories

#### `EnvironmentRepository`

This repository handles database operations for the Environment entity using TypeORM. It provides methods to save, update, delete, and retrieve environments.

- **save**: Saves a new environment.
- **saveAll**: Saves multiple environments.
- **findOne**: Finds an environment by its ID.
- **findOneByName**: Finds an environment by its name and collection ID.
- **findOneByEnvAndUserId**: Finds an environment by its ID and user ID.
- **findOneByEnvAndTeamId**: Finds an environment by its ID and team ID.
- **findByNames**: Finds environments by their names and collection ID.
- **update**: Updates an existing environment.
- **delete**: Deletes an environment by its ID.
- **deleteAll**: Deletes multiple environments by their IDs.

### Mappers

#### `EnvironmentMapper`

This mapper is responsible for converting between different data representations, such as DTOs and entities.

- **fromDtoToEntity**: Converts a DTO to an entity.
- **fromEntityToDto**: Converts an entity to a DTO.
- **fromUpdateDtoToEntity**: Converts an update DTO to an entity.

### Schemas

#### `EnvironmentSchema`

This schema defines the structure of the Environment entity in the database using TypeORM.

- **Columns**: Defines the columns for the Environment entity, including `name`, `value`, and `collectionId`.
- **Relations**: Defines the relationships for the Environment entity, such as the many-to-one relationship with the Collection entity.

## Usage

To use the Environment module, you need to inject the necessary services and repositories into your controllers or other services. Below is an example of how to create a new environment:

```typescript
@Post('')
async create(
  @CurrentUser() data: IResponse<User>,
  @Body() createEnvironmentDto: CreateEnvironmentDto,
): IPromiseResponse<EnvironmentResponseDto> {
  return this.environmentService.createByUser(
    createEnvironmentDto,
    data.payload.id,
  );
}
```

This example shows how to handle a POST request to create a new environment for a user.

## Error Handling

The module includes comprehensive error handling to manage various scenarios, such as not found exceptions and bad request exceptions. The `handleError` method in the `EnvironmentService` is used to handle errors and create appropriate responses.

## Conclusion

The Environment module is a crucial part of the application, providing essential functionalities for managing environment configurations. By following the structure and examples provided in this documentation, you can effectively utilize the module in your application.
