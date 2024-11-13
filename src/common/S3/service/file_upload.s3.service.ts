import { Inject } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import * as uuid from 'uuid';

import {
  IPromiseResponse,
  type IResponseService,
  RESPONSE_SERVICE,
} from '@/common/response_service/interface/response.interface';

import {
  IFileUploadService,
  IUploadFileResponse,
} from '../interface/file_upload.s3.interface';
import { ServiceMessageFileUpload } from '../message/file_upload.s3.message';

export class FileUploadService implements IFileUploadService {
  private readonly bucket: string;
  private readonly s3: S3;

  constructor(
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
  ) {
    this.responseService.setContext(FileUploadService.name);
    this.bucket = process.env.AWS_S3_BUCKET;
    this.s3 = new S3({
      accessKeyId: process.env.AWS_S3_ACCESS_KEY,
      secretAccessKey: process.env.AWS_S3_SECRET_KEY,
    });
  }

  async uploadFile({
    file,
  }: {
    file: Express.Multer.File;
  }): IPromiseResponse<IUploadFileResponse> {
    try {
      const fileKey = uuid.v4();
      const params: S3.Types.PutObjectRequest = {
        Bucket: this.bucket,
        Key: fileKey,
        Body: file.buffer,
        ContentType: 'application/wasm',
      };

      const { Location } = await this.s3.upload(params).promise();
      return this.responseService.createResponse({
        type: 'CREATED',
        message: ServiceMessageFileUpload.FILE_UPLOADED_SUCCESSFULLY,
        payload: { location: Location, key: fileKey },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteFile({ key }: { key: string }): IPromiseResponse<boolean> {
    try {
      const params: S3.Types.DeleteObjectRequest = {
        Bucket: this.bucket,
        Key: key,
      };

      await this.s3.deleteObject(params).promise();
      return this.responseService.createResponse({
        type: 'OK',
        message: ServiceMessageFileUpload.FILE_DELETED_SUCCESSFULLY,
        payload: true,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: Error): void {
    this.responseService.errorHandler({
      type: 'INTERNAL_SERVER_ERROR',
      error,
    });
  }
}
