import { IPromiseResponse } from '@/common/response_service/interface/response.interface';
import { CreateEnvironmentsDto } from '@/modules/enviroment/application/dto/create-all-environments.dto';
import { EnviromentResponseDto } from '@/modules/enviroment/application/dto/enviroment-response.dto';
import { FolderResponseDto } from '@/modules/folder/application/dto/folder-response.dto';
import { User } from '@/modules/user/domain/user.domain';

import { Collection } from '../../domain/collection.domain';
import { CollectionResponseDto } from '../dto/collection-response.dto';
import { CreateCollectionDto } from '../dto/create-collection.dto';
import { UpdateCollectionDto } from '../dto/update-collection.dto';

export interface ICollectionValues {
  name: string;
  userId?: string;
  teamId?: string;
}

export interface IUpdateCollectionValues extends ICollectionValues {
  id: string;
}

export const COLLECTION_SERVICE = 'COLLECTION_SERVICE';

export interface ICollectionService {
  findAllByUser(id: string): IPromiseResponse<CollectionResponseDto[]>;
  findAllByTeam(teamId: string): IPromiseResponse<CollectionResponseDto[]>;
  findOne(id: string): Promise<CollectionResponseDto>;
  findOneByCollectionAndTeamId(
    id: string,
    teamId: string,
  ): IPromiseResponse<CollectionResponseDto>;
  findOneByCollectionAndUserId(
    id: string,
    userId: string,
  ): IPromiseResponse<CollectionResponseDto>;
  findEnvironmentsByCollectionAndUserId(
    collectionId: string,
    userId: string,
  ): IPromiseResponse<EnviromentResponseDto[]>;
  findEnvironmentsByCollectionAndTeamId(
    collectionId: string,
    teamId: string,
  ): IPromiseResponse<EnviromentResponseDto[]>;
  findEnvironmentByCollectionId(
    collectionId: string,
    environmentName: string,
  ): IPromiseResponse<EnviromentResponseDto>;
  findFoldersByCollectionUserId(
    id: string,
    userId: string,
  ): IPromiseResponse<FolderResponseDto[]>;
  findFoldersByCollectionTeamId(
    collectionId: string,
    teamId: string,
  ): IPromiseResponse<FolderResponseDto[]>;
  createByUser(
    collectionDto: CreateCollectionDto,
    user: User,
  ): IPromiseResponse<CollectionResponseDto>;
  createByTeam(
    collectionDto: CreateCollectionDto,
    teamId: string,
  ): IPromiseResponse<CollectionResponseDto>;
  create(collectionData: ICollectionValues): Promise<CollectionResponseDto>;
  createAllEnvironmentsByUser(
    collectionId: string,
    createEnvironmentsDto: CreateEnvironmentsDto[],
    userId: string,
  ): IPromiseResponse<EnviromentResponseDto[]>;
  createAllEnvironmentsByTeam(
    collectionId: string,
    createEnvironmentsDto: CreateEnvironmentsDto[],
    teamId: string,
  ): IPromiseResponse<EnviromentResponseDto[]>;
  updateCollectionUser(
    collectionDto: UpdateCollectionDto,
    userId: string,
  ): IPromiseResponse<CollectionResponseDto>;
  updateCollectionTeam(
    collectionDto: UpdateCollectionDto,
    teamId: string,
  ): IPromiseResponse<CollectionResponseDto>;
  update(collectionMapped: Collection): Promise<CollectionResponseDto>;
  delete(collectionId: string): IPromiseResponse<boolean>;
  deleteAllEnvironmentsByUser(
    collectionId: string,
    userId: string,
  ): IPromiseResponse<boolean>;
  deleteAllEnvironmentsByTeam(
    collectionId: string,
    teamId: string,
  ): IPromiseResponse<boolean>;
}
