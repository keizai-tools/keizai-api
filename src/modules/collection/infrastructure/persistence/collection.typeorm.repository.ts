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
      relations: {
        team: true,
        user: true,
        folders: { invocations: true },
        enviroments: true,
      },
      where: {
        id,
      },
    });
  }

  async findOneByIds(id: string, userId: string): Promise<Collection> {
    return await this.repository.findOne({
      relations: { folders: { invocations: true }, enviroments: true },
      where: {
        id,
        userId,
      },
    });
  }

  async findAllByUser(userId: string): Promise<Collection[]> {
    return await this.repository.find({
      order: { createdAt: 'DESC' },
      relations: {
        enviroments: true,
        folders: {
          invocations: { methods: true, selectedMethod: true },
        },
      },
      where: {
        user: {
          id: userId,
        },
      },
    });
  }

  async findAllByTeam(teamId: string): Promise<Collection[]> {
    return await this.repository.find({
      order: { createdAt: 'DESC' },
      relations: {
        enviroments: true,
        folders: {
          invocations: { methods: true, selectedMethod: true },
        },
      },
      where: {
        teamId,
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
