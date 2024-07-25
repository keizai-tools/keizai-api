import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, In, Repository } from 'typeorm';

import { IEnviromentRepository } from '../../application/repository/enviroment.repository';
import { Enviroment } from '../../domain/enviroment.domain';
import { EnviromentSchema } from './enviroment.schema';

@Injectable()
export class EnviromentRepository implements IEnviromentRepository {
  constructor(
    @InjectRepository(EnviromentSchema)
    private readonly repository: Repository<Enviroment>,
  ) {}

  async save(enviroment: Enviroment): Promise<Enviroment> {
    return this.repository.save(enviroment);
  }

  async saveAll(environment: Enviroment[]): Promise<Enviroment[]> {
    return this.repository.save(environment);
  }

  async findOne(id: string): Promise<Enviroment> {
    return await this.repository.findOne({
      where: {
        id,
      },
    });
  }

  async findOneByName(name: string, collectionId: string): Promise<Enviroment> {
    return await this.repository.findOne({
      where: {
        name,
        collectionId,
      },
    });
  }

  async findOneByEnvAndUserId(id: string, userId: string): Promise<Enviroment> {
    return await this.repository.findOne({
      where: {
        id,
        collection: { userId },
      },
    });
  }

  async findOneByEnvAndTeamId(id: string, teamId: string): Promise<Enviroment> {
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
  ): Promise<Enviroment[]> {
    return this.repository.find({ where: { name: In(names), collectionId } });
  }

  async update(enviroment: Enviroment): Promise<Enviroment> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const existingCollection = await queryRunner.manager.findOne(Enviroment, {
        where: { id: enviroment.id },
      });
      if (existingCollection)
        await queryRunner.manager.update(Enviroment, enviroment.id, enviroment);
      await queryRunner.commitTransaction();
      return await this.findOne(enviroment.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: string): Promise<boolean> {
    const enviroment = await this.findOne(id);
    if (enviroment) {
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
