import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { IUserResponse } from '@/modules/auth/infrastructure/decorators/auth.decorators';

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
    } catch (e) {
      console.log({ e });
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
    await this.findOneByIds(collectionData.id, collectionData.userId);

    const collectionMapped =
      this.collectionMapper.fromUpdateDtoToEntity(collectionData);

    const collectionUpdated = await this.collectionRepository.update(
      collectionMapped,
    );
    if (!collectionUpdated) {
      throw new NotFoundException(COLLECTION_RESPONSE.COLLECTION_NOT_UPDATED);
    }
    const collectionSaved = await this.collectionRepository.save(
      collectionUpdated,
    );
    return this.collectionMapper.fromEntityToDto(collectionSaved);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const collection = await this.findOneByIds(id, userId);

    if (!collection) {
      throw new NotFoundException(COLLECTION_RESPONSE.COLLECTION_NOT_DELETED);
    }
    return this.collectionRepository.delete(id);
  }
}
