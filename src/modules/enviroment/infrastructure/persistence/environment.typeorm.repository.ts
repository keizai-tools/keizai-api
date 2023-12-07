import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IEnvironmentRepository } from '../../application/repository/environment.repository';
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

  async findAll(userId: string): Promise<Environment[]> {
    return await this.repository.find({
      where: {
        userId,
      },
    });
  }

  async findOne(id: string): Promise<Environment> {
    return await this.repository.findOne({
      relations: { user: true },
      where: {
        id,
      },
    });
  }

  async findOneByIds(id: string, userId: string): Promise<Environment> {
    return await this.repository.findOne({
      where: {
        id,
        userId,
      },
    });
  }

  async update(environment: Environment): Promise<Environment> {
    return await this.repository.preload(environment);
  }

  async delete(id: string): Promise<boolean> {
    const environment = await this.findOne(id);
    if (environment) {
      await this.repository.delete(id);
      return true;
    }
    return false;
  }
}
