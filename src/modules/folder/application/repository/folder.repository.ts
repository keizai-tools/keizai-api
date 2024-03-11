import { IBaseRepository } from '@/common/application/base.repository';

import { Folder } from '../../domain/folder.domain';

export interface IFolderRepository extends IBaseRepository<Folder> {
  findOneByFolderAndUserId(id: string, userId: string): Promise<Folder>;
  findOneByFolderAndTeamId(id: string, teamId: string): Promise<Folder>;
  update(folder: Folder): Promise<Folder>;
  delete(id: string): Promise<boolean>;
}

export const FOLDER_REPOSITORY = 'FOLDER_REPOSITORY';
