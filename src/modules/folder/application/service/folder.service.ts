import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';

import {
  IPromiseResponse,
  IResponseService,
  RESPONSE_SERVICE,
} from '@/common/response_service/interface/response.interface';
import { CollectionService } from '@/modules/collection/application/service/collection.service';
import { Invocation } from '@/modules/invocation/domain/invocation.domain';
import { User } from '@/modules/user/domain/user.domain';

import { CreateFolderDto } from '../dto/create-folder.dto';
import { FolderResponseDto } from '../dto/folder-response.dto';
import { UpdateFolderDto } from '../dto/update-folder.dto';
import { FOLDER_RESPONSE } from '../exceptions/folder-response.enum';
import {
  IFolderValues,
  IUpdateFolderValues,
} from '../interface/folder.base.interface';
import {
  FOLDER_REPOSITORY,
  IFolderRepository,
} from '../interface/folder.repository.interface';
import { FolderMapper } from '../mapper/folder.mapper';

@Injectable()
export class FolderService {
  constructor(
    private readonly folderMapper: FolderMapper,
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
    @Inject(FOLDER_REPOSITORY)
    private readonly folderRepository: IFolderRepository,
    @Inject(forwardRef(() => CollectionService))
    private readonly collectionService: CollectionService,
  ) {
    this.responseService.setContext(FolderService.name);
  }

  async createByTeam(
    createFolderDto: CreateFolderDto,
    teamId: string,
  ): IPromiseResponse<FolderResponseDto> {
    try {
      await this.collectionService.findOneByCollectionAndTeamId(
        createFolderDto.collectionId,
        teamId,
      );
      return this.responseService.createResponse({
        payload: await this.create(createFolderDto),
        message: FOLDER_RESPONSE.FOLDER_CREATED,
        type: 'CREATED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async createByUser(
    createFolderDto: CreateFolderDto,
    user: User,
  ): IPromiseResponse<FolderResponseDto> {
    try {
      await this.collectionService.findOneByCollectionAndUserId(
        createFolderDto.collectionId,
        user.id,
      );
      const folder = await this.create(createFolderDto);
      return this.responseService.createResponse({
        payload: folder,
        message: FOLDER_RESPONSE.FOLDER_CREATED,
        type: 'CREATED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async create(createFolderDto: CreateFolderDto): Promise<FolderResponseDto> {
    try {
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
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOneByFolderAndUserId(
    id: string,
    userId: string,
  ): IPromiseResponse<FolderResponseDto> {
    try {
      const folder = await this.folderRepository.findOneByFolderAndUserId(
        id,
        userId,
      );
      if (!folder) {
        throw new NotFoundException(
          FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_USER_ID,
        );
      }
      return this.responseService.createResponse({
        payload: this.folderMapper.fromEntityToDto(folder),
        message: FOLDER_RESPONSE.FOLDER_FOUND,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOneByFolderAndTeamId(
    folderId: string,
    teamId: string,
  ): IPromiseResponse<FolderResponseDto> {
    try {
      const folder = await this.folderRepository.findOneByFolderAndTeamId(
        folderId,
        teamId,
      );
      if (!folder) {
        throw new NotFoundException(
          FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_TEAM_ID,
        );
      }
      return this.responseService.createResponse({
        payload: this.folderMapper.fromEntityToDto(folder),
        message: FOLDER_RESPONSE.FOLDER_FOUND,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAllInvocationsByUser(
    folderId: string,
    userId: string,
  ): IPromiseResponse<Invocation[]> {
    try {
      const folder = await this.folderRepository.findOneByFolderAndUserId(
        folderId,
        userId,
      );
      if (!folder) {
        throw new NotFoundException(
          FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_USER_ID,
        );
      }
      return this.responseService.createResponse({
        payload: folder.invocations,
        message: FOLDER_RESPONSE.INVOCATIONS_FOUND,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAllInvocationsByTeam(
    folderId: string,
    teamId: string,
  ): IPromiseResponse<Invocation[]> {
    try {
      const folder = await this.folderRepository.findOneByFolderAndTeamId(
        folderId,
        teamId,
      );
      if (!folder) {
        throw new NotFoundException(
          FOLDER_RESPONSE.FOLDER_NOT_FOUND_BY_TEAM_ID,
        );
      }
      return this.responseService.createResponse({
        payload: folder.invocations,
        message: FOLDER_RESPONSE.FOLDER_FOUND,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateByUser(
    updateFolderDto: UpdateFolderDto,
    userId: string,
  ): IPromiseResponse<FolderResponseDto> {
    try {
      await this.findOneByFolderAndUserId(updateFolderDto.id, userId);

      if (updateFolderDto.collectionId) {
        await this.collectionService.findOneByCollectionAndUserId(
          updateFolderDto.collectionId,
          userId,
        );
      }
      const updatedFolder = await this.update(updateFolderDto);
      return this.responseService.createResponse({
        payload: updatedFolder,
        message: FOLDER_RESPONSE.FOLDER_UPDATED,
        type: 'ACCEPTED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateByTeam(
    updateFolderDto: UpdateFolderDto,
    teamId: string,
  ): IPromiseResponse<FolderResponseDto> {
    try {
      await this.findOneByFolderAndTeamId(updateFolderDto.id, teamId);

      if (updateFolderDto.collectionId) {
        await this.collectionService.findOneByCollectionAndTeamId(
          updateFolderDto.id,
          teamId,
        );
      }
      return this.responseService.createResponse({
        payload: await this.update(updateFolderDto),
        message: FOLDER_RESPONSE.FOLDER_UPDATED,
        type: 'ACCEPTED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(updateFolderDto: UpdateFolderDto): Promise<FolderResponseDto> {
    try {
      const folderValues: IUpdateFolderValues = {
        name: updateFolderDto.name,
        collectionId: updateFolderDto.collectionId,
        id: updateFolderDto.id,
      };
      const folderMapped =
        this.folderMapper.fromUpdateDtoToEntity(folderValues);
      const folderUpdated = await this.folderRepository.update(folderMapped);
      if (!folderUpdated) {
        throw new BadRequestException(FOLDER_RESPONSE.FOLDER_FAILED_UPDATED);
      }

      return this.folderMapper.fromEntityToDto(folderUpdated);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteByUser(
    folderId: string,
    userId: string,
  ): IPromiseResponse<boolean> {
    try {
      await this.findOneByFolderAndUserId(folderId, userId);
      const deleted = await this.delete(folderId);
      return this.responseService.createResponse({
        payload: deleted,
        message: FOLDER_RESPONSE.FOLDER_DELETED,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteByTeam(
    folderId: string,
    teamId: string,
  ): IPromiseResponse<boolean> {
    try {
      await this.findOneByFolderAndTeamId(folderId, teamId);
      return this.responseService.createResponse({
        payload: await this.delete(folderId),
        message: FOLDER_RESPONSE.FOLDER_DELETED,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const folderDeleted = await this.folderRepository.delete(id);
      if (!folderDeleted) {
        throw new BadRequestException(FOLDER_RESPONSE.FOLDER_FAILED_DELETED);
      }
      return folderDeleted;
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: Error): void {
    this.responseService.errorHandler({
      type: 'INTERNAL_SERVER_ERROR',
      error,
    });
  }
}
