import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { IUserResponse } from '@/modules/auth/infrastructure/decorators/auth.decorators';
import {
  COLLECTION_REPOSITORY,
  ICollectionRepository,
} from '@/modules/collection/application/repository/collection.repository';

import { CreateFolderDto } from '../dto/create-folder.dto';
import { FolderResponseDto } from '../dto/folder-response.dto';
import { UpdateFolderDto } from '../dto/update-folder.dto';
import { FOLDER_RESPONSE } from '../exceptions/folder-response.enum';
import { FolderMapper } from '../mapper/folder.mapper';
import {
  FOLDER_REPOSITORY,
  IFolderRepository,
} from '../repository/folder.repository';

export interface IFolderValues {
  name: string;
  collectionId: string;
  userId: string;
  id?: string;
}

@Injectable()
export class FolderService {
  constructor(
    @Inject(FolderMapper)
    private readonly folderMapper: FolderMapper,
    @Inject(FOLDER_REPOSITORY)
    private readonly folderRepository: IFolderRepository,
    @Inject(COLLECTION_REPOSITORY)
    private readonly collectionRepository: ICollectionRepository,
  ) {}

  async create(
    createFolderDto: CreateFolderDto,
    user: IUserResponse,
  ): Promise<FolderResponseDto> {
    const collection = await this.collectionRepository.findOne(
      createFolderDto.collectionId,
    );

    if (!(collection?.user.id === user.id)) {
      throw new NotFoundException(
        FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_COLLECTION_AND_USER,
      );
    }

    const foldervalues: IFolderValues = {
      name: createFolderDto.name,
      collectionId: createFolderDto.collectionId,
      userId: user.id,
    };
    const folder = this.folderMapper.fromDtoToEntity(foldervalues);

    const folderSaved = await this.folderRepository.save(folder);
    return this.folderMapper.fromEntityToDto(folderSaved);
  }

  async findAll(user: IUserResponse): Promise<FolderResponseDto[]> {
    const folders = await this.folderRepository.findAll(user.id);
    if (!folders) {
      throw new NotFoundException(FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_USER_ID);
    }
    return folders.map((folder) => this.folderMapper.fromEntityToDto(folder));
  }

  async findOneByIds(
    user: IUserResponse,
    id: string,
  ): Promise<FolderResponseDto> {
    const folder = await this.folderRepository.findOneByIds(id, user.id);
    if (!folder) {
      throw new NotFoundException(FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_USER_ID);
    }
    return this.folderMapper.fromEntityToDto(folder);
  }

  async update(
    updateFolderDto: UpdateFolderDto,
    user: IUserResponse,
  ): Promise<FolderResponseDto> {
    const folder = await this.folderRepository.findOneByIds(
      updateFolderDto.id,
      user.id,
    );

    if (!folder) {
      throw new NotFoundException(FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_USER_ID);
    }

    if (updateFolderDto.collectionId) {
      const collection = await this.collectionRepository.findOneByIds(
        updateFolderDto.collectionId,
        user.id,
      );

      if (!collection) {
        throw new NotFoundException(
          FOLDER_RESPONSE.FOLDER_COLLECTION_NOT_FOUND,
        );
      }
    }

    const folderValues: IFolderValues = {
      name: updateFolderDto.name,
      collectionId: updateFolderDto.collectionId,
      userId: user.id,
      id: updateFolderDto.id,
    };
    const folderMapped = this.folderMapper.fromUpdateDtoToEntity(folderValues);
    const folderUpdated = await this.folderRepository.update(folderMapped);
    const folderSaved = await this.folderRepository.save(folderUpdated);

    return this.folderMapper.fromEntityToDto(folderSaved);
  }

  async delete(user: IUserResponse, id: string): Promise<boolean> {
    const folder = await this.folderRepository.findOneByIds(id, user.id);
    if (!folder) {
      throw new NotFoundException(FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_USER_ID);
    }
    return this.folderRepository.delete(id);
  }
}
