import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IParamRepository } from '../../application/repository/param.repository';
import { Param } from '../../domain/param.domain';
import { ParamSchema } from './param.schema';

@Injectable()
export class ParamRepository implements IParamRepository {
  constructor(
    @InjectRepository(ParamSchema)
    private readonly repository: Repository<Param>,
  ) {}

  async save(param: Param): Promise<Param> {
    return this.repository.save(param);
  }

  async findAll(userId: string): Promise<Param[]> {
    return await this.repository.find({
      relations: { invocation: true },
      where: {
        userId,
      },
    });
  }

  async findOne(id: string): Promise<Param> {
    return await this.repository.findOne({
      where: {
        id,
      },
    });
  }

  async findOneByIds(id: string, userId: string): Promise<Param> {
    return await this.repository.findOne({
      where: {
        id,
        userId,
      },
    });
  }

  async update(param: Param): Promise<Param> {
    return await this.repository.preload(param);
  }

  async delete(id: string): Promise<boolean> {
    const invocation = await this.findOne(id);
    if (invocation) {
      await this.repository.delete(id);
      return true;
    }
    return false;
  }
}
