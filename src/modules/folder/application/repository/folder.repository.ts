import { IBaseRepository } from '@/common/application/base.repository';

import { Folder } from '../../domain/folder.domain';

export interface IFolderRepository extends IBaseRepository<Folder> {
  findAll(userId: number): Promise<Folder[]>;
  findOneByIds(id: number, userId: number): Promise<Folder>;
  update(folder: Folder): Promise<Folder>;
  delete(id: number): Promise<boolean>;
}

export const FOLDER_REPOSITORY = 'FOLDER_REPOSITORY';
