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

  async findAll(collectionId: string): Promise<Enviroment[]> {
    return await this.repository.find({
      where: {
        collectionId,
      },
    });
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

  async findOneByIds(id: string, collectionId: string): Promise<Enviroment> {
    return await this.repository.findOne({
      where: {
        id,
        collectionId,
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
    return await this.repository.preload(enviroment);
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
