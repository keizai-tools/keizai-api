import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { IUserResponse } from '@/modules/auth/infrastructure/decorators/auth.decorators';
import { CollectionService } from '@/modules/collection/application/service/collection.service';

import { Folder } from '../../domain/folder.domain';
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
}

export interface IUpdateFolderValues extends Partial<IFolderValues> {
  id: string;
}

@Injectable()
export class FolderService {
  constructor(
    @Inject(FolderMapper)
    private readonly folderMapper: FolderMapper,
    @Inject(FOLDER_REPOSITORY)
    private readonly folderRepository: IFolderRepository,
    @Inject(CollectionService)
    private readonly collectionService: CollectionService,
  ) {}

  async create(createFolderDto: CreateFolderDto): Promise<FolderResponseDto> {
    const collection = await this.collectionService.findOne(
      createFolderDto.collectionId,
    );

    if (!collection) {
      throw new NotFoundException(FOLDER_RESPONSE.FOLDER_COLLECTION_NOT_FOUND);
    }

    const foldervalues: IFolderValues = {
      name: createFolderDto.name,
      collectionId: createFolderDto.collectionId,
    };
    const folder = this.folderMapper.fromDtoToEntity(foldervalues);

    const folderSaved = await this.folderRepository.save(folder);
    if (!folderSaved) {
      throw new BadRequestException(FOLDER_RESPONSE.FOLDER_FAILED_SAVE);
    }

    return this.folderMapper.fromEntityToDto(folderSaved);
  }

  async findAll(user: IUserResponse): Promise<FolderResponseDto[]> {
    const folders = await this.folderRepository.findAll(user.id);
    if (!folders) {
      throw new NotFoundException(FOLDER_RESPONSE.FOLDERS_NOT_FOUND);
    }
    return folders.map((folder) => this.folderMapper.fromEntityToDto(folder));
  }

  async findOne(id: string): Promise<FolderResponseDto> {
    const folder = await this.folderRepository.findOne(id);
    if (!folder) {
      throw new NotFoundException(FOLDER_RESPONSE.FOLDER_NOT_FOUND);
    }
    return this.folderMapper.fromEntityToDto(folder);
  }

  async findOneByIds(id: string, userId: string) {
    const folder = await this.folderRepository.findOne(id);
    await this.validateFolderByUser(folder, userId);
    return this.folderMapper.fromEntityToDto(folder);
  }

  async update(
    updateFolderDto: UpdateFolderDto,
    userId: string,
  ): Promise<FolderResponseDto> {
    await this.findOneByIds(updateFolderDto.id, userId);

    if (updateFolderDto.collectionId) {
      const collection = await this.collectionService.findOne(
        updateFolderDto.collectionId,
      );
      if (!collection) {
        throw new NotFoundException(
          FOLDER_RESPONSE.FOLDER_COLLECTION_NOT_FOUND,
        );
      }
    }

    const folderValues: IUpdateFolderValues = {
      name: updateFolderDto.name,
      collectionId: updateFolderDto.collectionId,
      id: updateFolderDto.id,
    };
    const folderMapped = this.folderMapper.fromUpdateDtoToEntity(folderValues);
    const folderUpdated = await this.folderRepository.update(folderMapped);
    if (!folderUpdated) {
      throw new BadRequestException(FOLDER_RESPONSE.FOLDER_FAILED_UPDATED);
    }

    const folderSaved = await this.folderRepository.save(folderUpdated);
    if (!folderSaved) {
      throw new BadRequestException(FOLDER_RESPONSE.FOLDER_FAILED_SAVE);
    }

    return this.folderMapper.fromEntityToDto(folderSaved);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    await this.findOneByIds(id, userId);

    const folderDeleted = this.folderRepository.delete(id);
    if (!folderDeleted) {
      throw new BadRequestException(FOLDER_RESPONSE.FOLDER_FAILED_DELETED);
    }

    return folderDeleted;
  }

  async validateFolderByUser(folder: Folder, userId: string) {
    if (!folder) {
      throw new NotFoundException(FOLDER_RESPONSE.FOLDER_NOT_FOUND);
    }

    const { collection } = folder;

    if (collection.team && collection.team.adminId !== userId) {
      throw new BadRequestException(
        FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_TEAM_ID,
      );
    }

    if (collection.user && collection.user.id !== userId) {
      throw new BadRequestException(
        FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_COLLECTION_ID,
      );
    }
  }
}
