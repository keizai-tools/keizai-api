import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { IUserResponse } from '@/modules/auth/infrastructure/decorators/auth.decorators';
import { CollectionService } from '@/modules/collection/application/service/collection.service';

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

  async createByTeam(
    createFolderDto: CreateFolderDto,
    teamId: string,
  ): Promise<FolderResponseDto> {
    await this.collectionService.findOneByCollectionAndTeamId(
      createFolderDto.collectionId,
      teamId,
    );
    return await this.create(createFolderDto);
  }

  async createByUser(
    createFolderDto: CreateFolderDto,
    user: IUserResponse,
  ): Promise<FolderResponseDto> {
    await this.collectionService.findOneByCollectionAndUserId(
      createFolderDto.collectionId,
      user.id,
    );
    return await this.create(createFolderDto);
  }

  async create(createFolderDto: CreateFolderDto): Promise<FolderResponseDto> {
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

  async findOneByFolderAndUserId(
    id: string,
    userId: string,
  ): Promise<FolderResponseDto> {
    const folder = await this.folderRepository.findOneByFolderAndUserId(
      id,
      userId,
    );
    if (!folder) {
      throw new NotFoundException(FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_USER_ID);
    }
    return this.folderMapper.fromEntityToDto(folder);
  }

  async findOneByFolderAndTeamId(
    folderId: string,
    teamId: string,
  ): Promise<FolderResponseDto> {
    const folder = await this.folderRepository.findOneByFolderAndTeamId(
      folderId,
      teamId,
    );
    if (!folder) {
      throw new NotFoundException(FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_TEAM_ID);
    }
    return this.folderMapper.fromEntityToDto(folder);
  }

  async updateByUser(
    updateFolderDto: UpdateFolderDto,
    userId: string,
  ): Promise<FolderResponseDto> {
    await this.findOneByFolderAndUserId(updateFolderDto.id, userId);

    if (updateFolderDto.collectionId) {
      await this.collectionService.findOneByCollectionAndUserId(
        updateFolderDto.collectionId,
        userId,
      );
    }
    return await this.update(updateFolderDto);
  }

  async updateByTeam(
    updateFolderDto: UpdateFolderDto,
    teamId: string,
  ): Promise<FolderResponseDto> {
    await this.findOneByFolderAndTeamId(updateFolderDto.id, teamId);

    if (updateFolderDto.collectionId) {
      await this.collectionService.findOneByCollectionAndTeamId(
        updateFolderDto.id,
        teamId,
      );
    }
    return await this.update(updateFolderDto);
  }

  async update(updateFolderDto: UpdateFolderDto): Promise<FolderResponseDto> {
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

  async deleteByUser(folderId: string, userId: string): Promise<boolean> {
    await this.findOneByFolderAndUserId(folderId, userId);
    return await this.delete(folderId);
  }

  async deleteByTeam(folderId: string, teamId: string): Promise<boolean> {
    await this.findOneByFolderAndTeamId(folderId, teamId);
    return await this.delete(folderId);
  }

  async delete(id: string): Promise<boolean> {
    const folderDeleted = this.folderRepository.delete(id);
    if (!folderDeleted) {
      throw new BadRequestException(FOLDER_RESPONSE.FOLDER_FAILED_DELETED);
    }

    return folderDeleted;
  }
}
