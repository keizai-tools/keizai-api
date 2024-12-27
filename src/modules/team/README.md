# Team Module Documentation

## Overview

The Team module is responsible for managing teams within the application. It includes functionalities for creating, updating, deleting, and retrieving teams. The module also handles team memberships, invitations, and collections associated with teams.

## Structure

The module is structured into several key components:

1. **Controller**: Handles incoming HTTP requests and delegates them to the appropriate service methods.
2. **Service**: Contains the business logic for managing teams.
3. **Repository**: Interacts with the database to perform CRUD operations.
4. **Schema**: Defines the database schema for the Team entity.
5. **Mapper**: Transforms data between different layers of the application.

## Components

### Controller

The `TeamController` handles HTTP requests related to teams. It includes endpoints for creating, updating, deleting, and retrieving teams. The controller uses guards to enforce role-based access control.

Example:
```typescript
@Get('/')
async findAllByUser(@CurrentUser() data: IResponse<User>): IPromiseResponse<TeamResponseDto[]> {
  return this.teamService.findAllByUser(data.payload.id);
}
```

### Service

The `TeamService` contains the business logic for managing teams. It interacts with the repository to perform CRUD operations and handles additional logic such as creating invitations and user roles.

Example:
```typescript
async create(createTeamDto: CreateTeamDto, user: User): IPromiseResponse<TeamResponseDto> {
  // Business logic for creating a team
}
```

### Repository

The `TeamRepository` interacts with the database to perform CRUD operations on the Team entity. It uses TypeORM for database interactions.

Example:
```typescript
async findAllByUser(userId: string): Promise<Team[]> {
  return await this.repository.find({
    order: { createdAt: 'DESC' },
    relations: { userMembers: true, collections: true, invitations: true },
    where: [{ userMembers: { userId } }],
  });
}
```

### Schema

The `TeamSchema` defines the database schema for the Team entity using TypeORM's `EntitySchema`.

Example:
```typescript
export const TeamSchema = new EntitySchema<Team>({
  name: 'Team',
  target: Team,
  columns: {
    ...baseColumnSchemas,
    name: {
      type: 'varchar',
      name: 'name',
    },
  },
  relations: {
    userMembers: {
      target: 'UserRoleToTeam',
      type: 'one-to-many',
      inverseSide: 'team',
    },
    invitations: {
      target: 'Invitation',
      type: 'one-to-many',
      joinColumn: {
        name: 'team_id',
      },
      inverseSide: 'team',
    },
    collections: {
      target: 'Collection',
      type: 'one-to-many',
      joinColumn: {
        name: 'team_id',
      },
      inverseSide: 'team',
    },
  },
});
```

### Mapper

The `TeamMapper` transforms data between different layers of the application. It converts data transfer objects (DTOs) to entities and vice versa.

Example:
```typescript
fromEntityToDto(team: Team): TeamResponseDto {
  const { name, id, invitations, collections, userMembers } = team;
  // Mapping logic
  return new TeamResponseDto(name, id, userMembersMapped, invitationsMapped, collectionsMapped);
}
```

## Usage

To use the Team module, you need to inject the `TeamService` into your controller or other services where you need to manage teams. The service provides methods for creating, updating, deleting, and retrieving teams.

Example:
```typescript
@Injectable()
export class SomeOtherService {
  constructor(private readonly teamService: TeamService) {}

  async someMethod() {
    const teams = await this.teamService.findAllByUser('user-id');
    // Do something with the teams
  }
}
```

## Conclusion

The Team module provides a comprehensive set of functionalities for managing teams within the application. By following the structure and examples provided in this documentation, you can effectively integrate and utilize the Team module in your application.
