import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ICollectionRepository } from '../../application/interface/collection.repository.interface';
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
        invocations: true,
        environments: true,
      },
      where: {
        id,
      },
    });
  }

  async findOneByCollectionAndUserId(
    id: string,
    userId: string,
  ): Promise<Collection> {
    return await this.repository.findOne({
      relations: {
        team: true,
        user: true,
        folders: { invocations: true },
        environments: true,
        invocations: true,
      },
      where: {
        id,
        userId,
      },
    });
  }

  async findOneByCollectionAndTeamId(
    id: string,
    teamId: string,
  ): Promise<Collection> {
    return await this.repository.findOne({
      relations: { folders: { invocations: true }, environments: true },
      where: {
        id,
        teamId,
      },
    });
  }

  async findAllByUser(userId: string): Promise<Collection[]> {
    return await this.repository.find({
      order: { createdAt: 'DESC' },
      relations: {
        environments: true,
        invocations: true,
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
        environments: true,
        folders: {
          invocations: { methods: true, selectedMethod: true },
        },
      },
      where: {
        teamId,
      },
    });
  }

  async findInvocationsByCollectionId(id: string): Promise<Collection> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const collection = await queryRunner.manager.findOne(Collection, {
        relations: {
          folders: { invocations: { methods: true, selectedMethod: true } },
          environments: true,
          invocations: { methods: true, selectedMethod: true },
        },
        where: { id },
        lock:
          process.env.NODE_ENV === 'automated_tests'
            ? undefined
            : { mode: 'pessimistic_read' },
      });

      await queryRunner.commitTransaction();
      return collection;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(collection: Collection): Promise<Collection> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const existingCollection = await queryRunner.manager.findOne(Collection, {
        where: { id: collection.id },
      });
      if (existingCollection)
        await queryRunner.manager.update(Collection, collection.id, collection);
      await queryRunner.commitTransaction();
      return await this.findOne(collection.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.findOne(id);
    if (result) {
      await this.repository.delete(id);
      return true;
    }
    return false;
  }

  async findAllInvocationsWithNetworkEphemeral(userId: string) {
    return await this.repository
      .createQueryBuilder('collection')
      .leftJoinAndSelect('collection.invocations', 'invocation')
      .where('collection.userId = :userId', { userId })
      .andWhere('invocation.network = :network', { network: 'EPHEMERAL' })
      .getMany();
  }
}
