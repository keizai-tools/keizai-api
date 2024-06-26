import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';

import { IUserResponse } from '@/modules/auth/infrastructure/decorators/auth.decorators';
import { CreateEnvironmentsDto } from '@/modules/enviroment/application/dto/create-all-environments.dto';
import { EnviromentResponseDto } from '@/modules/enviroment/application/dto/enviroment-response.dto';
import { ENVIROMENT_RESPONSE } from '@/modules/enviroment/application/exceptions/enviroment-response.enum';
import { EnviromentService } from '@/modules/enviroment/application/service/enviroment.service';
import { FolderResponseDto } from '@/modules/folder/application/dto/folder-response.dto';

import { Collection } from '../../domain/collection.domain';
import { CollectionResponseDto } from '../dto/collection-response.dto';
import { CreateCollectionDto } from '../dto/create-collection.dto';
import { UpdateCollectionDto } from '../dto/update-collection.dto';
import { COLLECTION_RESPONSE } from '../exceptions/collection-response.enum';
import { CollectionMapper } from '../mapper/collection.mapper';
import {
  COLLECTION_REPOSITORY,
  ICollectionRepository,
} from '../repository/collection.repository';

export interface ICollectionValues {
  name: string;
  userId?: string;
  teamId?: string;
}

export interface IUpdateCollectionValues extends ICollectionValues {
  id: string;
}

@Injectable()
export class CollectionService {
  constructor(
    private readonly collectionMapper: CollectionMapper,
    @Inject(COLLECTION_REPOSITORY)
    private readonly collectionRepository: ICollectionRepository,
    @Inject(forwardRef(() => EnviromentService))
    private readonly environmentService: EnviromentService,
  ) {}

  async findAllByUser(id: string): Promise<CollectionResponseDto[]> {
    const collections = await this.collectionRepository.findAllByUser(id);
    if (!collections) {
      throw new NotFoundException(COLLECTION_RESPONSE.COLLECTIONS_NOT_FOUND);
    }

    return collections.map((collection) =>
      this.collectionMapper.fromEntityToDto(collection),
    );
  }

  async findAllByTeam(teamId: string): Promise<CollectionResponseDto[]> {
    const collections = await this.collectionRepository.findAllByTeam(teamId);

    if (!collections) {
      throw new NotFoundException(COLLECTION_RESPONSE.COLLECTIONS_NOT_FOUND);
    }

    return collections.map((collection) =>
      this.collectionMapper.fromEntityToDto(collection),
    );
  }

  async findOne(id: string): Promise<CollectionResponseDto> {
    const collection = await this.collectionRepository.findOne(id);
    if (!collection) {
      throw new NotFoundException(
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_ID,
      );
    }
    return this.collectionMapper.fromEntityToDto(collection);
  }

  async findOneByCollectionAndTeamId(
    id: string,
    teamId: string,
  ): Promise<CollectionResponseDto> {
    const collection =
      await this.collectionRepository.findOneByCollectionAndTeamId(id, teamId);
    if (!collection) {
      throw new NotFoundException(
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_TEAM,
      );
    }
    return this.collectionMapper.fromEntityToDto(collection);
  }

  async findOneByCollectionAndUserId(
    id: string,
    userId: string,
  ): Promise<CollectionResponseDto> {
    const collection =
      await this.collectionRepository.findOneByCollectionAndUserId(id, userId);
    if (!collection) {
      throw new NotFoundException(
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_USER_AND_ID,
      );
    }
    return this.collectionMapper.fromEntityToDto(collection);
  }

  async findEnvironmentsByCollectionAndUserId(
    collectionId: string,
    userId: string,
  ): Promise<EnviromentResponseDto[]> {
    const collection = await this.findOneByCollectionAndUserId(
      collectionId,
      userId,
    );
    if (!collection) {
      throw new NotFoundException(
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_USER_AND_ID,
      );
    }
    return collection.enviroments;
  }

  async findEnvironmentsByCollectionAndTeamId(
    collectionId: string,
    teamId: string,
  ): Promise<EnviromentResponseDto[]> {
    const collection = await this.findOneByCollectionAndTeamId(
      collectionId,
      teamId,
    );
    if (!collection) {
      throw new NotFoundException(
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_TEAM,
      );
    }
    return collection.enviroments;
  }

  async findEnvironmentByCollectionId(
    collectionId: string,
    environmentName: string,
  ) {
    const environment = await this.environmentService.findByNames(
      [environmentName],
      collectionId,
    );
    if (!environment || environment.length === 0) {
      throw new NotFoundException(ENVIROMENT_RESPONSE.ENVIRONMENT_EXISTS);
    }
    return environment[0];
  }

  async findFoldersByCollectionUserId(
    id: string,
    userId: string,
  ): Promise<FolderResponseDto[]> {
    const collection = await this.findOneByCollectionAndUserId(id, userId);
    if (!collection) {
      throw new NotFoundException(
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_USER_AND_ID,
      );
    }

    return collection.folders;
  }

  async findFoldersByCollectionTeamId(
    collectionId: string,
    teamId: string,
  ): Promise<FolderResponseDto[]> {
    const collection = await this.findOneByCollectionAndTeamId(
      collectionId,
      teamId,
    );
    if (!collection) {
      throw new NotFoundException(
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_TEAM,
      );
    }

    return collection.folders;
  }

  async createByUser(
    collectionDto: CreateCollectionDto,
    user: IUserResponse,
  ): Promise<CollectionResponseDto> {
    const collectionData: ICollectionValues = {
      name: collectionDto.name,
      userId: user.id,
      teamId: null,
    };
    return this.create(collectionData);
  }

  async createByTeam(
    collectionDto: CreateCollectionDto,
    teamId: string,
  ): Promise<CollectionResponseDto> {
    const collectionData: ICollectionValues = {
      name: collectionDto.name,
      userId: null,
      teamId,
    };
    return this.create(collectionData);
  }

  async create(
    collectionData: ICollectionValues,
  ): Promise<CollectionResponseDto> {
    const collection = this.collectionMapper.fromDtoToEntity(collectionData);
    try {
      const collectionSaved = await this.collectionRepository.save(collection);
      return this.collectionMapper.fromEntityToDto(collectionSaved);
    } catch (error) {
      throw new BadRequestException(COLLECTION_RESPONSE.COLLECTION_FAILED_SAVE);
    }
  }

  async createAllEnvironmentsByUser(
    collectionId: string,
    createEnvironmentsDto: CreateEnvironmentsDto[],
    userId: string,
  ): Promise<EnviromentResponseDto[]> {
    await this.findOneByCollectionAndUserId(collectionId, userId);
    return await this.environmentService.createAll(
      createEnvironmentsDto,
      collectionId,
    );
  }

  async createAllEnvironmentsByTeam(
    collectionId: string,
    createEnvironmentsDto: CreateEnvironmentsDto[],
    teamId: string,
  ): Promise<EnviromentResponseDto[]> {
    await this.findOneByCollectionAndTeamId(collectionId, teamId);
    return await this.environmentService.createAll(
      createEnvironmentsDto,
      collectionId,
    );
  }

  async updateCollectionUser(
    collectionDto: UpdateCollectionDto,
    userId: string,
  ) {
    const collectionData: IUpdateCollectionValues = {
      name: collectionDto.name,
      userId,
      id: collectionDto.id,
    };

    const collection =
      await this.collectionRepository.findOneByCollectionAndUserId(
        collectionData.id,
        userId,
      );

    if (!collection) {
      throw new NotFoundException(
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_USER_AND_ID,
      );
    }

    const collectionMapped =
      this.collectionMapper.fromUpdateDtoToEntity(collectionData);

    return await this.update(collectionMapped);
  }

  async updateCollectionTeam(
    collectionDto: UpdateCollectionDto,
    teamId: string,
  ) {
    const collectionData: IUpdateCollectionValues = {
      name: collectionDto.name,
      teamId,
      id: collectionDto.id,
    };

    const collection =
      await this.collectionRepository.findOneByCollectionAndTeamId(
        collectionData.id,
        teamId,
      );

    if (!collection) {
      throw new NotFoundException(
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_TEAM,
      );
    }

    const collectionMapped =
      this.collectionMapper.fromUpdateDtoToEntity(collectionData);

    return await this.update(collectionMapped);
  }

  async update(collectionMapped: Collection): Promise<CollectionResponseDto> {
    const collectionUpdated = await this.collectionRepository.update(
      collectionMapped,
    );
    if (!collectionUpdated) {
      throw new BadRequestException(
        COLLECTION_RESPONSE.COLLECTION_FAILED_UPDATED,
      );
    }
    const collectionSaved = await this.collectionRepository.save(
      collectionUpdated,
    );
    if (!collectionSaved) {
      throw new BadRequestException(COLLECTION_RESPONSE.COLLECTION_FAILED_SAVE);
    }
    return this.collectionMapper.fromEntityToDto(collectionSaved);
  }

  async delete(collectionId: string): Promise<boolean> {
    const collection = await this.collectionRepository.findOne(collectionId);
    if (!collection) {
      throw new NotFoundException(
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_ID,
      );
    }
    const collectionDeleted = await this.collectionRepository.delete(
      collectionId,
    );
    if (!collectionDeleted) {
      throw new BadRequestException(
        COLLECTION_RESPONSE.COLLECTION_FAILED_DELETED,
      );
    }
    return collectionDeleted;
  }

  async deleteAllEnvironmentsByUser(
    collectionId: string,
    userId: string,
  ): Promise<boolean> {
    const collection =
      await this.collectionRepository.findOneByCollectionAndUserId(
        collectionId,
        userId,
      );

    if (!collection) {
      throw new NotFoundException(
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_USER_AND_ID,
      );
    }

    return await this.environmentService.deleteAll(collection.enviroments);
  }

  async deleteAllEnvironmentsByTeam(collectionId: string, teamId: string) {
    const collection =
      await this.collectionRepository.findOneByCollectionAndTeamId(
        collectionId,
        teamId,
      );

    if (!collection) {
      throw new NotFoundException(
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_TEAM,
      );
    }

    return await this.environmentService.deleteAll(collection.enviroments);
  }
}
