# Collection Module

## Overview

The Collection module is responsible for managing collections within the application. It provides functionalities to create, update, delete, and retrieve collections, as well as manage related entities such as environments, folders, and invocations.

## Components

### Controllers

- **CollectionController**: Handles HTTP requests related to collections. It includes endpoints for creating, updating, deleting, and retrieving collections, as well as managing environments, folders, and invocations associated with a collection.

### Services

- **CollectionService**: Contains the business logic for managing collections. It interacts with the repository to perform CRUD operations and handles the mapping between entities and DTOs.

### Repositories

- **CollectionRepository**: Provides methods to interact with the database for collection-related operations. It uses TypeORM to perform CRUD operations on the Collection entity.

### Schemas

- **CollectionSchema**: Defines the database schema for the Collection entity using TypeORM's EntitySchema.

### Mappers

- **CollectionMapper**: Responsible for mapping between Collection entities and DTOs. It ensures that the data is correctly transformed when moving between different layers of the application.

## Key Entities

### Collection

Represents a collection within the application. It includes properties such as `name`, `userId`, `teamId`, and relationships with other entities like `folders`, `environments`, and `invocations`.

### Environment

Represents an environment associated with a collection. It includes properties such as `name` and `variables`.

### Folder

Represents a folder within a collection. It includes properties such as `name` and relationships with invocations.

### Invocation

Represents an invocation within a collection. It includes properties such as `method`, `params`, and `selectedMethod`.

## Key DTOs

### CollectionResponseDto

Data Transfer Object for returning collection data in API responses. It includes properties such as `id`, `name`, `folders`, `environments`, and `invocations`.

### CreateCollectionDto

Data Transfer Object for creating a new collection. It includes properties such as `name`.

### UpdateCollectionDto

Data Transfer Object for updating an existing collection. It includes properties such as `id` and `name`.

## Example Usage

### Creating a Collection

To create a new collection, send a POST request to the `/collection` endpoint with the following payload:

```json
{
  "name": "New Collection"
}
```

### Retrieving Collections

To retrieve all collections for the current user, send a GET request to the `/collection` endpoint.

### Updating a Collection

To update an existing collection, send a PATCH request to the `/collection` endpoint with the following payload:

```json
{
  "id": "collection-id",
  "name": "Updated Collection Name"
}
```

### Deleting a Collection

To delete a collection, send a DELETE request to the `/collection/{id}` endpoint.

## Error Handling

The module uses custom exceptions and response services to handle errors and provide meaningful error messages to the client. Common exceptions include `NotFoundException` and `BadRequestException`.

## Detailed API Endpoints

### POST /collection

Creates a new collection.

**Request Body:**
- `name` (string): The name of the collection.

**Response:**
- `201 Created`: Returns the created collection.

### GET /collection

Retrieves all collections for the current user.

**Response:**
- `200 OK`: Returns an array of collections.

### GET /collection/:id

Retrieves a specific collection by its ID.

**Parameters:**
- `id` (string): The ID of the collection.

**Response:**
- `200 OK`: Returns the collection.

### PATCH /collection

Updates an existing collection.

**Request Body:**
- `id` (string): The ID of the collection.
- `name` (string): The updated name of the collection.

**Response:**
- `200 OK`: Returns the updated collection.

### DELETE /collection/:id

Deletes a specific collection by its ID.

**Parameters:**
- `id` (string): The ID of the collection.

**Response:**
- `200 OK`: Returns a boolean indicating the success of the deletion.

### POST /collection/:id/environments

Creates multiple environments for a collection.

**Parameters:**
- `id` (string): The ID of the collection.

**Request Body:**
- An array of `CreateEnvironmentsDto` objects.

**Response:**
- `201 Created`: Returns an array of created environments.

### GET /collection/:id/environments

Retrieves all environments for a specific collection.

**Parameters:**
- `id` (string): The ID of the collection.

**Response:**
- `200 OK`: Returns an array of environments.

### DELETE /collection/:id/environments

Deletes all environments for a specific collection.

**Parameters:**
- `id` (string): The ID of the collection.

**Response:**
- `200 OK`: Returns a boolean indicating the success of the deletion.

## Conclusion

The Collection module provides a comprehensive set of functionalities for managing collections within the application. It follows a clean architecture with well-defined layers and responsibilities, ensuring maintainability and scalability.
