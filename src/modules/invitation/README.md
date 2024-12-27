# Invitation Module

The Invitation module is responsible for managing invitations within the application. This includes creating, updating, retrieving, and deleting invitations. Below is a detailed explanation of the components and their roles within the module.

## Components

### 1. Invitation Module
The `InvitationModule` is the main entry point for the invitation functionality. It imports necessary modules and provides the required services and controllers.

### 2. Invitation Controller
The `InvitationController` handles HTTP requests related to invitations. It includes endpoints for creating, updating, retrieving, and deleting invitations.

#### Endpoints:
- `GET /invitation/`: Retrieves all invitations for the current user.
- `GET /invitation/:id`: Retrieves a specific invitation by ID.
- `POST /invitation/`: Creates a new invitation.
- `PATCH /invitation/`: Updates an existing invitation.
- `DELETE /invitation/:id`: Deletes an invitation by ID.

#### Methods:
- `findAllByUserId(@CurrentUser() data: IResponse<User>)`: Retrieves all invitations for the current user.
- `findOne(@CurrentUser() _user: User, @Param('id') id: string)`: Retrieves a specific invitation by ID.
- `create(@Body() invitationDto: CreateInvitationDto)`: Creates a new invitation.
- `update(@Body() invitationDto: UpdateInvitationDto)`: Updates an existing invitation.
- `delete(@CurrentUser() _user: User, @Param('id') id: string)`: Deletes an invitation by ID.

### 3. Invitation Service
The `InvitationService` contains the business logic for managing invitations. It interacts with the repository to perform CRUD operations and handles any necessary data transformations.

#### Methods:
- `findAllByUserId(userId: string)`: Retrieves all invitations for a specific user.
- `findOne(id: string)`: Retrieves a specific invitation by ID.
- `create(invitationDto: CreateInvitationDto)`: Creates a new invitation.
- `update(invitationDto: UpdateInvitationDto)`: Updates an existing invitation.
- `delete(id: string)`: Deletes an invitation by ID.

#### Error Handling:
The service includes error handling to manage common issues such as not found exceptions and bad request exceptions. These errors are handled in the service layer and appropriate responses are returned to the client.

### 4. Invitation Repository
The `InvitationRepository` is responsible for interacting with the database. It uses TypeORM to perform CRUD operations on the `Invitation` entity.

### 5. Invitation Schema
The `InvitationSchema` defines the structure of the `Invitation` entity in the database. It includes columns for `teamId`, `fromUserId`, `toUserId`, and `status`, as well as relationships to the `Team` and `User` entities.

## Example Usage

### Creating an Invitation
To create an invitation, send a POST request to `/invitation/` with the necessary data:
```json
{
  "teamId": "team-id",
  "fromUserId": "user-id",
  "toUserId": "user-id",
  "status": "pending"
}
```

### Retrieving Invitations
To retrieve all invitations for the current user, send a GET request to `/invitation/`.

### Updating an Invitation
To update an invitation, send a PATCH request to `/invitation/` with the updated data:
```json
{
  "id": "invitation-id",
  "status": "accepted"
}
```

### Deleting an Invitation
To delete an invitation, send a DELETE request to `/invitation/:id`.

## Error Handling
The module includes error handling to manage common issues such as not found exceptions and bad request exceptions. These errors are handled in the service layer and appropriate responses are returned to the client.

## Conclusion
The Invitation module provides a comprehensive set of functionalities for managing invitations within the application. By following the provided endpoints and using the service methods, you can easily integrate invitation management into your application.
