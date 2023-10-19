import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ICollectionRepository } from '../../application/repository/collection.repository';
import { Collection } from '../../domain/collection.domain';
import { CollectionSchema } from './collection.schema';

@Injectable()
export class CollectionRepository implements ICollectionRepository {
  constructor(
    @InjectRepository(CollectionSchema)
    private readonly repository: Repository<Collection>,
  ) {}

  async save(collection: Collection): Promise<Collection> {
    return this.repository.save(collection);
  }

  async findOne(id: string): Promise<Collection> {
    return await this.repository.findOne({
      relations: { user: true },
      where: {
        id,
      },
    });
  }

  async findOneByIds(id: string, userId: string): Promise<Collection> {
    return await this.repository.findOne({
      relations: { folders: true },
      where: {
        id,
        userId,
      },
    });
  }

  async findAllByUser(userId: string): Promise<Collection[]> {
    return await this.repository.find({
      relations: {
        folders: {
          invocations: { params: true, methods: true, selectedMethod: true },
        },
      },
      where: {
        user: {
          id: userId,
        },
      },
    });
  }

  async update(collection: Collection): Promise<Collection> {
    return await this.repository.preload(collection);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.findOne(id);
    if (result) {
      await this.repository.delete(id);
      return true;
    }
    return false;
  }
}
