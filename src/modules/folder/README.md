# Folder Module

The Folder module is responsible for managing folders within the application. It includes functionality for creating, updating, retrieving, and deleting folders, as well as managing their associations with collections and invocations.

## Components

### Controllers

Controllers handle incoming HTTP requests and delegate the processing to the appropriate service methods. They are responsible for defining the routes and endpoints for the module.

- **FolderUserController**: Handles folder operations for individual users.
  - `@Post('') create(@CurrentUser() data: IResponse<User>, @Body() createFolderDto: CreateFolderDto)`: Creates a new folder for a user. It uses the `createByUser` method from the `FolderService`.
  - `@Get('/:id') findOne(@CurrentUser() data: IResponse<User>, @Param('id') id: string)`: Retrieves a folder by its ID for a user. It uses the `findOneByFolderAndUserId` method from the `FolderService`.
  - `@Get('/:id/invocations') findAllInvocations(@CurrentUser() data: IResponse<User>, @Param('id') id: string)`: Retrieves all invocations associated with a folder for a user. It uses the `findAllInvocationsByUser` method from the `FolderService`.
  - `@Patch() update(@CurrentUser() data: IResponse<User>, @Body() updateFolderDto: UpdateFolderDto)`: Updates a folder for a user. It uses the `updateByUser` method from the `FolderService`.
  - `@Delete('/:id') delete(@CurrentUser() data: IResponse<User>, @Param('id') id: string)`: Deletes a folder for a user. It uses the `deleteByUser` method from the `FolderService`.

### Services

Services contain the business logic for the module. They interact with repositories to perform CRUD operations and handle any additional processing required.

- **FolderService**: Contains the business logic for folder operations.
  - `createByTeam(createFolderDto: CreateFolderDto, teamId: string)`: Creates a folder for a team. It validates the collection ID and then calls the `create` method.
  - `createByUser(createFolderDto: CreateFolderDto, user: User)`: Creates a folder for a user. It validates the collection ID and then calls the `create` method.
  - `create(createFolderDto: CreateFolderDto)`: Creates a folder entity from the DTO and saves it to the repository.
  - `findOneByFolderAndUserId(id: string, userId: string)`: Retrieves a folder by its ID and user ID. It fetches the folder from the repository and maps it to a DTO.
  - `findOneByFolderAndTeamId(id: string, teamId: string)`: Retrieves a folder by its ID and team ID. It fetches the folder from the repository and maps it to a DTO.
  - `findAllInvocationsByUser(folderId: string, userId: string)`: Retrieves all invocations for a folder and user. It fetches the folder from the repository and returns its invocations.
  - `findAllInvocationsByTeam(folderId: string, teamId: string)`: Retrieves all invocations for a folder and team. It fetches the folder from the repository and returns its invocations.
  - `updateByUser(updateFolderDto: UpdateFolderDto, userId: string)`: Updates a folder for a user. It validates the collection ID and then calls the `update` method.
  - `updateByTeam(updateFolderDto: UpdateFolderDto, teamId: string)`: Updates a folder for a team. It validates the collection ID and then calls the `update` method.
  - `update(updateFolderDto: UpdateFolderDto)`: Updates a folder entity from the DTO and saves it to the repository.
  - `deleteByUser(folderId: string, userId: string)`: Deletes a folder for a user. It validates the folder ID and then calls the `delete` method.
  - `deleteByTeam(folderId: string, teamId: string)`: Deletes a folder for a team. It validates the folder ID and then calls the `delete` method.
  - `delete(id: string)`: Deletes a folder from the repository.

### Repositories

Repositories handle database operations for the module. They interact with the database using TypeORM and provide methods for CRUD operations.

- **FolderRepository**: Handles database operations for folders.
  - `save(folder: Folder)`: Saves a folder to the database.
  - `findOne(id: string)`: Finds a folder by its ID.
  - `findOneByFolderAndUserId(id: string, userId: string)`: Finds a folder by its ID and user ID.
  - `findOneByFolderAndTeamId(id: string, teamId: string)`: Finds a folder by its ID and team ID.
  - `update(folder: Folder)`: Updates a folder in the database.
  - `delete(id: string)`: Deletes a folder from the database.

### Mappers

Mappers convert between entities and DTOs. They ensure that data is correctly transformed between different layers of the application.

- **FolderMapper**: Maps between Folder entities and DTOs.
  - `fromDtoToEntity(createFolderDto: IFolderValues)`: Converts a DTO to a Folder entity.
  - `fromEntityToDto(folder: Folder)`: Converts a Folder entity to a DTO.
  - `fromUpdateDtoToEntity(updateFolderDto: IUpdateFolderValues)`: Converts an update DTO to a Folder entity.

### Schemas

Schemas define the database schema for the module. They specify the columns and relations for the entities.

- **FolderSchema**: Defines the database schema for folders.
  - Columns: `name`, `collectionId`
  - Relations: `collection` (many-to-one), `invocations` (one-to-many)

## Usage

### Creating a Folder

To create a folder, send a POST request to the `/folder` endpoint with the necessary data. For example:

```json
{
  "name": "New Folder",
  "collectionId": "12345"
}
```

### Retrieving a Folder

To retrieve a folder by its ID, send a GET request to the `/folder/:id` endpoint.

### Updating a Folder

To update a folder, send a PATCH request to the `/folder` endpoint with the updated data. For example:

```json
{
  "id": "12345",
  "name": "Updated Folder",
  "collectionId": "67890"
}
```

### Deleting a Folder

To delete a folder by its ID, send a DELETE request to the `/folder/:id` endpoint.

## Error Handling

The FolderService includes error handling to manage exceptions and provide meaningful error messages. Common errors include:

- `BadRequestException`: Thrown when a folder cannot be saved or updated.
- `NotFoundException`: Thrown when a folder cannot be found by its ID and user/team ID.

## Dependencies

The Folder module depends on several other modules:

- **CollectionModule**: For managing collections associated with folders.
- **InvocationModule**: For managing invocations associated with folders.
- **TeamModule**: For managing team-related folder operations.
- **CommonModule**: For common functionalities and services.

## Conclusion

The Folder module provides comprehensive functionality for managing folders within the application, including CRUD operations and associations with collections and invocations. It is designed to handle both user-specific and team-specific folder operations efficiently.
