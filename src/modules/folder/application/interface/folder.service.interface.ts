import { IPromiseResponse } from '@/common/response_service/interface/response.interface';
import { Invocation } from '@/modules/invocation/domain/invocation.domain';
import { User } from '@/modules/user/domain/user.domain';

import { CreateFolderDto } from '../dto/create-folder.dto';
import { FolderResponseDto } from '../dto/folder-response.dto';
import { UpdateFolderDto } from '../dto/update-folder.dto';

export interface IFolderValues {
  name: string;
  collectionId: string;
}

export interface IUpdateFolderValues extends Partial<IFolderValues> {
  id: string;
}

export const FOLDER_SERVICE = 'FOLDER_SERVICE';

export interface IFolderService {
  createByTeam(
    createFolderDto: CreateFolderDto,
    teamId: string,
  ): IPromiseResponse<FolderResponseDto>;

  createByUser(
    createFolderDto: CreateFolderDto,
    user: User,
  ): IPromiseResponse<FolderResponseDto>;

  create(createFolderDto: CreateFolderDto): Promise<FolderResponseDto>;

  findOneByFolderAndUserId(
    id: string,
    userId: string,
  ): IPromiseResponse<FolderResponseDto>;

  findOneByFolderAndTeamId(
    folderId: string,
    teamId: string,
  ): IPromiseResponse<FolderResponseDto>;

  findAllInvocationsByUser(
    folderId: string,
    userId: string,
  ): IPromiseResponse<Invocation[]>;

  findAllInvocationsByTeam(
    folderId: string,
    teamId: string,
  ): IPromiseResponse<Invocation[]>;

  updateByUser(
    updateFolderDto: UpdateFolderDto,
    userId: string,
  ): IPromiseResponse<FolderResponseDto>;

  updateByTeam(
    updateFolderDto: UpdateFolderDto,
    teamId: string,
  ): IPromiseResponse<FolderResponseDto>;

  update(updateFolderDto: UpdateFolderDto): Promise<FolderResponseDto>;

  deleteByUser(folderId: string, userId: string): IPromiseResponse<boolean>;

  deleteByTeam(folderId: string, teamId: string): IPromiseResponse<boolean>;

  delete(id: string): Promise<boolean>;
}
