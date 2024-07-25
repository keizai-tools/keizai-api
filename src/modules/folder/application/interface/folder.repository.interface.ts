import { Folder } from '../../domain/folder.domain';

export const FOLDER_REPOSITORY = 'FOLDER_REPOSITORY';

export interface IFolderRepository {
  save(folder: Folder): Promise<Folder>;
  findOne(id: string): Promise<Folder>;
  findOneByFolderAndUserId(id: string, userId: string): Promise<Folder>;
  findOneByFolderAndTeamId(id: string, teamId: string): Promise<Folder>;
  update(folder: Folder): Promise<Folder>;
  delete(id: string): Promise<boolean>;
}
