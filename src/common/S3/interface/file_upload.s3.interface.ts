import { IPromiseResponse } from '@/common/response_service/interface/response.interface';

export const FILE_UPLOAD_SERVICE = 'FILE_UPLOAD_SERVICE';

export interface IUploadFileResponse {
  key: string;
}

export interface IFileUploadService {
  uploadFile({
    file,
    userId,
  }: {
    file: Express.Multer.File;
    userId: string;
  }): IPromiseResponse<IUploadFileResponse>;

  deleteFile({ key }: { key: string }): IPromiseResponse<boolean>;
}
