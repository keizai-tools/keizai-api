# User Module Documentation

## Overview

The User module is responsible for managing user-related operations such as creating, updating, and retrieving user information. It includes controllers, services, repositories, and other necessary components to handle user data within the application.

## Components

### Controllers

#### UserController

The `UserController` handles HTTP requests related to user operations. It includes endpoints for updating user information, retrieving the current user's data, calculating Fargate session time, and updating user balance.

- **Endpoints:**
  - `PUT /user/update`: Updates user information.
  - `GET /user/me`: Retrieves the current user's information.
  - `GET /user/fargate-time`: Calculates and retrieves the Fargate session time for the current user.
  - `POST /user/update-balance`: Updates the user's balance based on a given interval.

### Services

#### UserService

The `UserService` contains the business logic for user operations. It interacts with the repository to perform CRUD operations and includes methods for creating users, updating user information, calculating Fargate session time, and updating user balance.

- **Methods:**
  - `createUser`: Creates a new user.
  - `getUserByEmail`: Retrieves a user by their email.
  - `getUserByMemoId`: Retrieves a user by their memo ID.
  - `getUserByExternalId`: Retrieves a user by their external ID.
  - `updateUser`: Updates user information.
  - `findAllByEmails`: Retrieves users by a list of emails.
  - `calculateFargateMinutes`: Calculates the Fargate session time based on the user's balance.
  - `getFargateSessionTime`: Retrieves the Fargate session time for a user.
  - `updateUserBalance`: Updates the user's balance based on a given interval.

### Repositories

#### UserRepository

The `UserRepository` handles database operations related to the `User` entity. It uses TypeORM to interact with the database and includes methods for creating, updating, deleting, and retrieving users.

- **Methods:**
  - `create`: Creates a new user in the database.
  - `update`: Updates user information in the database.
  - `delete`: Deletes a user from the database.
  - `findByEmail`: Retrieves a user by their email.
  - `saveOne`: Saves a user entity to the database.
  - `findByExternalId`: Retrieves a user by their external ID.
  - `findById`: Retrieves a user by their ID.
  - `findAllByEmails`: Retrieves users by a list of emails.
  - `findByMemoId`: Retrieves a user by their memo ID.

### Schemas

#### UserSchema

The `UserSchema` defines the structure of the `User` entity in the database. It includes columns for email, external ID, memo ID, balance, and relationships with other entities such as collections, folders, member teams, and invitations received.

### Mappers

#### UserMapper

The `UserMapper` is responsible for converting data transfer objects (DTOs) to entity objects and vice versa. It includes methods for mapping user DTOs to user entities.

### Decorators

#### CurrentUser

The `CurrentUser` decorator extracts the current user from the request object. It can be used to inject the current user's information into controller methods.

## Usage

### Example: Updating User Information

To update user information, send a `PUT` request to the `/user/update` endpoint with the updated user data in the request body.

```typescript
@Put('/update')
async updateUser(
  @Body() updateUserDto: UpdateUserDto,
  @CurrentUser() user: User,
): IPromiseResponse<IUpdateUserResponse> {
  return this.userService.updateUser(updateUserDto, user);
}
```

### Example: Retrieving Current User Information

To retrieve the current user's information, send a `GET` request to the `/user/me` endpoint.

```typescript
@Get('/me')
async getMe(@CurrentUser() user: User): Promise<User> {
  return user;
}
```

## Environment Variables

The `UserService` relies on the following environment variables for calculating Fargate session costs:

- `AWS_FARGATE_COST_PER_VCPU`: The cost per vCPU for AWS Fargate.
- `AWS_FARGATE_COST_PER_GB_RAM`: The cost per GB of RAM for AWS Fargate.

Ensure these variables are set in your environment configuration.

## Error Handling

The `UserService` and `UserRepository` include error handling mechanisms to manage exceptions and provide meaningful error messages. The `responseService` is used to create consistent response structures and handle errors.

## Conclusion

The User module provides a comprehensive set of functionalities for managing user data within the application. It leverages NestJS decorators, services, repositories, and TypeORM for efficient and scalable user management.
