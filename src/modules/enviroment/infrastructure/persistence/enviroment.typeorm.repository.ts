import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

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

  async findAll(userId: string): Promise<Enviroment[]> {
    return await this.repository.find({
      where: {
        userId,
      },
    });
  }

  async findOne(id: string): Promise<Enviroment> {
    return await this.repository.findOne({
      relations: { user: true },
      where: {
        id,
      },
    });
  }

  async findOneByIds(id: string, userId: string): Promise<Enviroment> {
    return await this.repository.findOne({
      where: {
        id,
        userId,
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
}
