import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, In, Repository } from 'typeorm';

import { IEnvironmentRepository } from '../../application/interface/environment.repository.interface';
import { Environment } from '../../domain/environment.domain';
import { EnvironmentSchema } from './environment.schema';

@Injectable()
export class EnvironmentRepository implements IEnvironmentRepository {
  constructor(
    @InjectRepository(EnvironmentSchema)
    private readonly repository: Repository<Environment>,
  ) {}

  async save(environment: Environment): Promise<Environment> {
    return this.repository.save(environment);
  }

  async saveAll(environment: Environment[]): Promise<Environment[]> {
    return this.repository.save(environment);
  }

  async findOne(id: string): Promise<Environment> {
    return await this.repository.findOne({
      where: {
        id,
      },
    });
  }

  async findOneByName(
    name: string,
    collectionId: string,
  ): Promise<Environment> {
    return await this.repository.findOne({
      where: {
        name,
        collectionId,
      },
    });
  }

  async findOneByEnvAndUserId(
    id: string,
    userId: string,
  ): Promise<Environment> {
    return await this.repository.findOne({
      where: {
        id,
        collection: { userId },
      },
    });
  }

  async findOneByEnvAndTeamId(
    id: string,
    teamId: string,
  ): Promise<Environment> {
    return await this.repository.findOne({
      where: {
        id,
        collection: { teamId },
      },
    });
  }

  async findByNames(
    names: string[],
    collectionId: string,
  ): Promise<Environment[]> {
    return this.repository.find({ where: { name: In(names), collectionId } });
  }

  async update(environment: Environment): Promise<Environment> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const existingCollection = await queryRunner.manager.findOne(
        Environment,
        {
          where: { id: environment.id },
        },
      );
      if (existingCollection)
        await queryRunner.manager.update(
          Environment,
          environment.id,
          environment,
        );
      await queryRunner.commitTransaction();
      return await this.findOne(environment.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: string): Promise<boolean> {
    const environment = await this.findOne(id);
    if (environment) {
      await this.repository.delete(id);
      return true;
    }
    return false;
  }

  async deleteAll(ids: string[]): Promise<DeleteResult> {
    return await this.repository.delete({
      id: In(ids),
    });
  }
}
