import { Inject } from '@nestjs/common';
import { type AWSError, S3 } from 'aws-sdk';
import type { PromiseResult } from 'aws-sdk/lib/request';
import * as crypto from 'crypto';

import { ENVIRONMENT } from '@/common/base/enum/common.enum';
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
      accessKeyId:
        process.env.NODE_ENV === ENVIRONMENT.DEVELOPMENT
          ? 'fakeAccessKeyId'
          : process.env.AWS_ACCESS_KEY,
      secretAccessKey:
        process.env.NODE_ENV === ENVIRONMENT.DEVELOPMENT
          ? 'fakeSecretAccessKey'
          : process.env.AWS_SECRET_KEY,
      endpoint:
        process.env.NODE_ENV === ENVIRONMENT.DEVELOPMENT
          ? process.env.AWS_S3_LOCAL_ENDPOINT
          : undefined,
      s3ForcePathStyle: process.env.NODE_ENV === ENVIRONMENT.DEVELOPMENT,
    });

    if (process.env.NODE_ENV === ENVIRONMENT.DEVELOPMENT) {
      this.validateLocalS3();
      this.createBucketIfNotExists();
    }
  }

  private async validateLocalS3(): Promise<void> {
    try {
      await this.s3.listBuckets().promise();
      this.responseService.log('Local S3 is running and configured correctly.');
    } catch (error) {
      this.responseService.error(
        'Local S3 is not running or not configured correctly:',
        error,
      );
      throw new Error('Local S3 is not running or not configured correctly.');
    }
  }

  private async createBucketIfNotExists(): Promise<void> {
    try {
      await this.s3.headBucket({ Bucket: this.bucket }).promise();
    } catch (error) {
      if (error.code === 'NotFound') {
        try {
          await this.s3.createBucket({ Bucket: this.bucket }).promise();
          this.responseService.log(
            `Bucket ${this.bucket} created successfully.`,
          );
        } catch (createError) {
          if (createError.code === 'BucketAlreadyOwnedByYou') {
            this.responseService.log(
              `Bucket ${this.bucket} already exists and is owned by you.`,
            );
          } else {
            this.responseService.error('Error creating bucket:', createError);
            throw new Error('Error creating bucket.');
          }
        }
      } else {
        this.responseService.error('Error checking bucket:', error);
        throw new Error('Error checking bucket.');
      }
    }
  }

  async checkFileExists(fileHash: string, userId: string): Promise<boolean> {
    const existingFile = await this.s3
      .listObjectsV2({
        Bucket: this.bucket,
        Prefix: fileHash,
      })
      .promise();

    if (existingFile.Contents && existingFile.Contents.length > 0) {
      const key = existingFile.Contents[0].Key;
      if (key) {
        const headObject = await this.s3
          .headObject({
            Bucket: this.bucket,
            Key: key,
          })
          .promise();

        return headObject.Metadata.userId === userId;
      }
    }

    return false;
  }

  async uploadFile({
    file,
    userId,
  }: {
    file: Express.Multer.File;
    userId: string;
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
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentEncoding: '7bit',
        Metadata: {
          userId: userId,
          originalname: file.originalname,
          size: file.size.toString(),
        },
      };
      const { Location } = await this.s3.upload(params).promise();
      if (!Location) {
        throw new Error('Failed to upload file');
      }
      return this.responseService.createResponse({
        type: 'CREATED',
        message: ServiceMessageFileUpload.FILE_UPLOADED_SUCCESSFULLY,
        payload: { key: file.originalname },
      });
    } catch (error) {
      this.responseService.error('Error in uploadFile:', error);
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

  async generatePresignedUrl(key: string, userId: string): Promise<string> {
    const metadata = await this.getFileMetadata(key);
    if (metadata.userId !== userId) {
      throw new Error('User does not have permission to access this file.');
    }

    const params = {
      Bucket: this.bucket,
      Key: key,
      Expires: 60 * 60,
    };

    const url = await this.s3.getSignedUrlPromise('getObject', params);
    return url;
  }

  async listWasmFiles() {
    try {
      const params: S3.Types.ListObjectsV2Request = {
        Bucket: this.bucket,
      };

      const data = await this.s3.listObjectsV2(params).promise();

      return (data.Contents || []).map((item) => item.Key || '');
    } catch (error) {
      throw new Error('Failed to list Wasm files');
    }
  }

  async getFileMetadata(key: string): Promise<{ [key: string]: string }> {
    try {
      const params: S3.Types.HeadObjectRequest = {
        Bucket: this.bucket,
        Key: key.toString(),
      };
      const headObject = await this.s3.headObject(params).promise();
      if (headObject.Metadata['userid'] || headObject.Metadata['userId']) {
        return {
          userId:
            headObject.Metadata['userid'] || headObject.Metadata['userId'],
        };
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async downloadFile(
    key: string,
    userId: string,
  ): Promise<PromiseResult<S3.GetObjectOutput, AWSError>> {
    const metadata = await this.getFileMetadata(key);
    if (metadata.userId !== userId) {
      throw new Error('User does not have permission to access this file.');
    }

    const params: S3.Types.GetObjectRequest = {
      Bucket: this.bucket,
      Key: key,
      Range: null,
      ResponseContentType: 'application/wasm',
    };

    return await this.s3.getObject(params).promise();
  }

  private handleError(error: Error): void {
    this.responseService.errorHandler({
      type: 'INTERNAL_SERVER_ERROR',
      error,
    });
  }
}
