import { IPromiseResponse } from '@/common/response_service/interface/response.interface';

export const FILE_UPLOAD_SERVICE = 'FILE_UPLOAD_SERVICE';

export interface IUploadFileResponse {
  location: string;
  key: string;
}

export interface IFileUploadService {
  uploadFile({
    file,
  }: {
    file: Express.Multer.File;
  }): IPromiseResponse<IUploadFileResponse>;

  deleteFile({ key }: { key: string }): IPromiseResponse<boolean>;
}
