# S3 File Upload Service

This module provides a service for uploading, deleting, and managing files in an AWS S3 bucket. It includes interfaces, messages, and the main service class.

## Files

### 1. `file_upload.s3.service.ts`

This file contains the `FileUploadService` class which implements the `IFileUploadService` interface. It provides methods to upload, delete, check existence, generate presigned URLs, and list WebAssembly (Wasm) files in the S3 bucket.

#### Methods:
- `checkFileExists(fileHash: string): Promise<boolean>`
- `uploadFile({ file }: { file: Express.Multer.File }): IPromiseResponse<IUploadFileResponse>`
- `deleteFile({ key }: { key: string }): IPromiseResponse<boolean>`
- `generatePresignedUrl(key: string): Promise<string>`
- `listWasmFiles(): Promise<string[]>`

### 2. `file_upload.s3.interface.ts`

This file defines the interfaces used by the `FileUploadService`.

#### Interfaces:
- `IUploadFileResponse`: Represents the response after a file is uploaded.
- `IFileUploadService`: Defines the methods that the `FileUploadService` must implement.

### 3. `file_upload.s3.message.ts`

This file contains the `ServiceMessageFileUpload` enum which defines various messages used in the `FileUploadService`.

#### Messages:
- `BUCKET_CREATED`
- `BUCKET_EXISTS`
- `BUCKET_CREATION_FAILED`
- `BUCKET_CHECK_FAILED`
- `FILE_UPLOADED_SUCCESSFULLY`
- `ERROR_UPLOADING_FILE`
- `FILE_DELETED_SUCCESSFULLY`
- `ERROR_DELETING_FILE`
- `FILE_URL_GENERATED_SUCCESSFULLY`
- `ERROR_GENERATING_FILE_URL`
- `NO_FILE_DELETED`
- `ALL_FILES_DELETED`
- `ERROR_DELETING_FILES`
- `FILE_ALREADY_EXISTS`

## Usage

To use the `FileUploadService`, inject it into your NestJS service or controller and call the desired methods. Ensure that your environment variables for AWS S3 are correctly set up.

```typescript
import { FileUploadService } from './file_upload.s3.service';

// Example usage
@Injectable()
export class SomeService {
  constructor(private readonly fileUploadService: FileUploadService) {}

  async uploadFile(file: Express.Multer.File) {
    return await this.fileUploadService.uploadFile({ file });
  }
}
```

Ensure you have the necessary AWS credentials and S3 bucket configured in your environment variables:

- `AWS_S3_BUCKET`
- `AWS_S3_ACCESS_KEY`
- `AWS_S3_SECRET_KEY`
