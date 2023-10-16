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

  async findOne(id: number): Promise<Collection> {
    return await this.repository.findOne({
      where: {
        id,
      },
    });
  }

  async findOneByIds(id: number, userId: number): Promise<Collection> {
    return await this.repository.findOne({
      where: {
        id,
        userId,
      },
    });
  }

  async findAllByUser(userId: number): Promise<Collection[]> {
    return await this.repository.find({
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

  async delete(id: number): Promise<boolean> {
    const result = await this.findOne(id);
    if (result) {
      await this.repository.delete(id);
      return true;
    }
    return false;
  }
}
