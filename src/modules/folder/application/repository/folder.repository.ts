import { IBaseRepository } from '@/common/application/base.repository';

import { Folder } from '../../domain/folder.domain';

export interface IFolderRepository extends IBaseRepository<Folder> {
  findAll(userId: string): Promise<Folder[]>;
  findOneByIds(id: string, userId: string): Promise<Folder>;
  update(folder: Folder): Promise<Folder>;
  delete(id: string): Promise<boolean>;
}

export const FOLDER_REPOSITORY = 'FOLDER_REPOSITORY';
