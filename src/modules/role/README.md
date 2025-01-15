# Role Module

The Role module is responsible for managing user roles within teams. It includes functionalities for creating, updating, retrieving, and deleting user roles associated with teams. This module leverages NestJS and TypeORM for its implementation.

## Components

### Controllers

#### UserRoleToTeamController

This controller handles HTTP requests related to user roles on teams. It includes the following endpoints:

- `GET /role/`: Retrieves all roles associated with the current user.
- `GET /role/:id`: Retrieves a specific role by its ID and the current user's ID.
- `POST /role/`: Creates a new role for the current user.
- `PATCH /role/`: Updates an existing role for the current user.
- `DELETE /role/:id`: Deletes a specific role by its ID and the current user's ID.

### Services

#### UserRoleOnTeamService

This service contains the business logic for managing user roles on teams. It includes methods for:

- Finding all roles by team ID.
- Finding all roles by user ID.
- Finding a specific role by its ID and user ID.
- Creating a new role.
- Creating multiple roles.
- Updating an existing role.
- Deleting a role.

### Repositories

#### UserRoleToTeamRepository

This repository interacts with the database to perform CRUD operations on user roles. It includes methods for:

- Finding all roles by team ID.
- Finding all roles by user ID.
- Finding a specific role by its ID.
- Finding a specific role by its ID and user ID.
- Saving a role.
- Validating the existence of a user and a team.
- Saving multiple roles.
- Updating a role.
- Deleting a role.

### Schemas

#### UserRoleToTeamSchema

This schema defines the structure of the `UserRoleToTeam` entity in the database. It includes columns for:

- `role`: The role of the user.
- `userId`: The ID of the user.
- `teamId`: The ID of the team.

It also defines relationships with the `User` and `Team` entities.

### Mappers

#### UserRoleToTeamMapper

This mapper handles the conversion between DTOs and entities. It includes methods for:

- Converting from a DTO to an entity.
- Converting from an update DTO to an entity.
- Converting from an entity to a DTO.

## DTOs

### CreateUserRoleToTeamDto

This DTO is used for creating a new user role. It includes properties for:

- `teamId`: The ID of the team.
- `role`: The role of the user.

### UpdateUserRoleToTeamDto

This DTO is used for updating an existing user role. It includes properties for:

- `id`: The ID of the role.
- `teamId`: The ID of the team.
- `role`: The role of the user.

### ResponseUserRoletoTeamDto

This DTO is used for returning user role data in responses. It includes properties for:

- `id`: The ID of the role.
- `teamId`: The ID of the team.
- `userId`: The ID of the user.
- `role`: The role of the user.

## Enums

### ROLE_RESPONSE

This enum defines various response messages used throughout the module.

## Interfaces

### IResponse

This interface defines the structure of a response object.

### IPromiseResponse

This interface defines the structure of a promise response object.

### IUserRoleToTeamRepository

This interface defines the methods that the `UserRoleToTeamRepository` must implement.

### UserRoleToTeamData

This interface defines the structure of the data required for creating a user role.

### IUpdateUserRoleToTeamData

This interface defines the structure of the data required for updating a user role.

## Usage

To use the Role module, you need to import it into your NestJS application and configure the necessary dependencies. Here is an example of how to set up the module:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRoleToTeamController } from './interface/role.controller';
import { UserRoleOnTeamService } from './application/service/role.service';
import { UserRoleToTeamRepository } from './infrastructure/persistence/role.repository';
import { UserRoleToTeamSchema } from './infrastructure/persistence/role.schema';
import { UserRoleToTeamMapper } from './application/mapper/role.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([UserRoleToTeamSchema])],
  controllers: [UserRoleToTeamController],
  providers: [
    UserRoleOnTeamService,
    UserRoleToTeamRepository,
    UserRoleToTeamMapper,
  ],
})
export class RoleModule {}
```

This setup ensures that the Role module is properly integrated into your application, allowing you to manage user roles within teams effectively.
