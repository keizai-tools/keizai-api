# Method Module Documentation

## Overview

The `method` module is responsible for managing methods within the application. It includes functionalities for creating, updating, retrieving, and deleting methods. This module interacts with the `invocation` module to ensure methods are properly associated with invocations.

## Components

### Controllers

#### MethodUserController

This controller handles HTTP requests related to methods for authenticated users. It includes endpoints for creating, retrieving, updating, and deleting methods.

- `POST /method`: Creates a new method.
- `GET /method/:id`: Retrieves a method by its ID.
- `PATCH /method`: Updates an existing method.
- `DELETE /method/:id`: Deletes a method by its ID.

### Services

#### MethodService

This service contains the business logic for managing methods. It includes methods for creating, updating, retrieving, and deleting methods. It also handles interactions with the `invocation` module.

- `createByUser(createMethodDto, userId)`: Creates a method for a user.
- `createByTeam(createMethodDto, teamId)`: Creates a method for a team.
- `findOneByMethodAndUserId(methodId, userId)`: Retrieves a method by its ID and user ID.
- `findOneByMethodAndTeamId(methodId, teamId)`: Retrieves a method by its ID and team ID.
- `updateByUser(updateMethodDto, userId)`: Updates a method for a user.
- `updateByTeam(updateMethodDto, teamId)`: Updates a method for a team.
- `deleteByUser(methodId, userId)`: Deletes a method for a user.
- `deleteByTeam(methodId, teamId)`: Deletes a method for a team.

### Repositories

#### MethodRepository

This repository handles database operations for methods. It uses TypeORM to interact with the database.

- `save(method)`: Saves a method to the database.
- `findAllByInvocationId(invocationId)`: Retrieves all methods associated with a specific invocation ID.
- `findOne(id)`: Retrieves a method by its ID.
- `update(method)`: Updates an existing method.
- `delete(id)`: Deletes a method by its ID.

### Schemas

#### MethodSchema

This schema defines the structure of the `Method` entity in the database. It includes fields such as `name`, `invocationId`, `inputs`, `outputs`, `params`, and `docs`.

### Mappers

#### MethodMapper

This mapper converts between different representations of methods, such as DTOs and entities.

- `fromDtoToEntity(createMethodDto)`: Converts a DTO to an entity.
- `fromEntityToDto(method)`: Converts an entity to a DTO.
- `fromUpdateDtoToEntity(updateParamDto)`: Converts an update DTO to an entity.

## Usage

### Creating a Method

To create a method, send a `POST` request to `/method` with the necessary data in the request body. The `MethodService` will handle the creation logic and save the method to the database.

### Retrieving a Method

To retrieve a method, send a `GET` request to `/method/:id` with the method ID as a URL parameter. The `MethodService` will fetch the method from the database and return it.

### Updating a Method

To update a method, send a `PATCH` request to `/method` with the updated data in the request body. The `MethodService` will handle the update logic and save the changes to the database.

### Deleting a Method

To delete a method, send a `DELETE` request to `/method/:id` with the method ID as a URL parameter. The `MethodService` will handle the deletion logic and remove the method from the database.

## Error Handling

The `MethodService` includes error handling to manage various exceptions that may occur during method operations. It uses the `responseService` to create appropriate responses for different error scenarios.

## Conclusion

The `method` module provides a comprehensive set of functionalities for managing methods within the application. It ensures methods are properly associated with invocations and includes robust error handling to manage various scenarios.
