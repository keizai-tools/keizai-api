import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IPreInvocationRepository } from '../../application/repository/pre-invocation.repository';
import { PreInvocation } from '../../domain/pre-invocation.domain';
import { PreInvocationSchema } from './pre-invocation.schema';

@Injectable()
export class PreInvocationRepository implements IPreInvocationRepository {
  constructor(
    @InjectRepository(PreInvocationSchema)
    private readonly repository: Repository<PreInvocation>,
  ) {}

  async save(preInvocation: PreInvocation): Promise<PreInvocation> {
    return this.repository.save(preInvocation);
  }

  async findAll(userId: string): Promise<PreInvocation[]> {
    return this.repository.find({
      where: {
        userId,
      },
    });
  }

  async findOne(id: string): Promise<PreInvocation> {
    return this.repository.findOne({
      relations: { user: true },
      where: {
        id,
      },
    });
  }

  async findOneByIds(id: string, userId: string): Promise<PreInvocation> {
    return this.repository.findOne({
      where: {
        id,
        userId,
      },
    });
  }

  async update(preInvocation: PreInvocation): Promise<PreInvocation> {
    return this.repository.preload(preInvocation);
  }

  async delete(id: string): Promise<boolean> {
    const preInvocation = await this.findOne(id);
    if (preInvocation) {
      await this.repository.delete(id);
      return true;
    }
    return false;
  }
}
