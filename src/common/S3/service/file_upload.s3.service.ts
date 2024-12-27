import { Inject } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import * as crypto from 'crypto';

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

  async checkFileExists(fileHash: string): Promise<boolean> {
    const existingFile = await this.s3
      .listObjectsV2({
        Bucket: this.bucket,
        Prefix: fileHash,
      })
      .promise();

    return existingFile.Contents && existingFile.Contents.length > 0;
  }

  async uploadFile({
    file,
  }: {
    file: Express.Multer.File;
  }): IPromiseResponse<IUploadFileResponse> {
    try {
      const fileHash = crypto
        .createHash('md5')
        .update(file.buffer)
        .digest('hex');
      const existingFile = await this.s3
        .listObjectsV2({
          Bucket: this.bucket,
          Prefix: fileHash,
        })
        .promise();
      if (existingFile.Contents && existingFile.Contents.length > 0) {
        return this.responseService.createResponse({
          type: 'OK',
          message: ServiceMessageFileUpload.FILE_ALREADY_EXISTS,
          payload: {
            location: `https://${this.bucket}.s3.amazonaws.com/${fileHash}`,
            key: fileHash,
            exists: true,
          },
        });
      }

      const params: S3.Types.PutObjectRequest = {
        Bucket: this.bucket,
        Key: fileHash,
        Body: file.buffer,
        ContentType: 'application/wasm',
      };
      const { Location } = await this.s3.upload(params).promise();
      return this.responseService.createResponse({
        type: 'CREATED',
        message: ServiceMessageFileUpload.FILE_UPLOADED_SUCCESSFULLY,
        payload: { location: Location, key: fileHash },
      });
    } catch (error) {
      console.error('Error en uploadFile:', error);
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

  async generatePresignedUrl(key: string): Promise<string> {
    const params = {
      Bucket: this.bucket,
      Key: key,
    };

    const url = await this.s3.getSignedUrlPromise('getObject', params);
    return url;
  }

  async listWasmFiles(): Promise<string[]> {
    try {
      const params = {
        Bucket: this.bucket,
      };

      const data = await this.s3.listObjectsV2(params).promise();

      const wasmFiles = (data.Contents || []).map((item) => item.Key || '');

      return wasmFiles;
    } catch (error) {
      throw new Error('Failed to list Wasm files');
    }
  }
  private handleError(error: Error): void {
    this.responseService.errorHandler({
      type: 'INTERNAL_SERVER_ERROR',
      error,
    });
  }
}
