import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { IUserResponse } from '@/modules/auth/infrastructure/decorators/auth.decorators';
import { EnviromentResponseDto } from '@/modules/enviroment/application/dto/enviroment-response.dto';
import { FolderResponseDto } from '@/modules/folder/application/dto/folder-response.dto';

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
  userId: string;
}

export interface IUpdateCollectionValues extends ICollectionValues {
  id: string;
}

@Injectable()
export class CollectionService {
  constructor(
    @Inject(CollectionMapper)
    private readonly collectionMapper: CollectionMapper,
    @Inject(COLLECTION_REPOSITORY)
    private readonly collectionRepository: ICollectionRepository,
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

  async findOne(id: string): Promise<CollectionResponseDto> {
    const collection = await this.collectionRepository.findOne(id);
    if (!collection) {
      throw new NotFoundException(
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_ID,
      );
    }
    return this.collectionMapper.fromEntityToDto(collection);
  }

  async findOneByIds(
    id: string,
    userId: string,
  ): Promise<CollectionResponseDto> {
    const collection = await this.collectionRepository.findOneByIds(id, userId);
    if (!collection) {
      throw new NotFoundException(
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_USER_AND_ID,
      );
    }
    return this.collectionMapper.fromEntityToDto(collection);
  }

  async findEnvironmentsByCollectionId(
    collectionId: string,
    userId: string,
  ): Promise<EnviromentResponseDto[]> {
    const collection = await this.findOneByIds(collectionId, userId);
    if (!collection) {
      throw new NotFoundException(
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_USER_AND_ID,
      );
    }
    return collection.enviroments;
  }

  async findFoldersByCollectionId(
    id: string,
    userId: string,
  ): Promise<FolderResponseDto[]> {
    const collection = await this.findOneByIds(id, userId);
    if (!collection) {
      throw new NotFoundException(
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_USER_AND_ID,
      );
    }

    return collection.folders;
  }

  async create(
    collectionDto: CreateCollectionDto,
    user: IUserResponse,
  ): Promise<CollectionResponseDto> {
    const collectionData: ICollectionValues = {
      name: collectionDto.name,
      userId: user.id,
    };
    const collection = this.collectionMapper.fromDtoToEntity(collectionData);
    try {
      const collectionSaved = await this.collectionRepository.save(collection);
      return this.collectionMapper.fromEntityToDto(collectionSaved);
    } catch (error) {
      throw new BadRequestException(COLLECTION_RESPONSE.COLLECTION_FAILED_SAVE);
    }
  }

  async update(
    collectionDto: UpdateCollectionDto,
    userId: string,
  ): Promise<CollectionResponseDto> {
    const collectionData: IUpdateCollectionValues = {
      name: collectionDto.name,
      userId,
      id: collectionDto.id,
    };
    const collection = await this.findOneByIds(
      collectionData.id,
      collectionData.userId,
    );
    if (!collection) {
      throw new NotFoundException(
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_USER_AND_ID,
      );
    }

    const collectionMapped =
      this.collectionMapper.fromUpdateDtoToEntity(collectionData);

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

  async delete(id: string, userId: string): Promise<boolean> {
    const collection = await this.findOneByIds(id, userId);
    if (!collection) {
      throw new NotFoundException(
        COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_USER_AND_ID,
      );
    }
    const collectionDeleted = await this.collectionRepository.delete(id);
    if (!collectionDeleted) {
      throw new BadRequestException(
        COLLECTION_RESPONSE.COLLECTION_FAILED_DELETED,
      );
    }
    return collectionDeleted;
  }
}
