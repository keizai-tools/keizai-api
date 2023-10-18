import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IInvocationRepository } from '../../application/repository/invocation.repository';
import { Invocation } from '../../domain/invocation.domain';
import { InvocationSchema } from './invocation.schema';

@Injectable()
export class InvocationRepository implements IInvocationRepository {
  constructor(
    @InjectRepository(InvocationSchema)
    private readonly repository: Repository<Invocation>,
  ) {}

  async save(invocation: Invocation): Promise<Invocation> {
    return this.repository.save(invocation);
  }

  async findAll(userId: number): Promise<Invocation[]> {
    return await this.repository.find({
      relations: { folder: true },
      where: {
        userId,
      },
    });
  }

  async findOne(id: number): Promise<Invocation> {
    return await this.repository.findOne({
      where: {
        id,
      },
    });
  }

  async findOneByIds(id: number, userId: number): Promise<Invocation> {
    return await this.repository.findOne({
      where: {
        id,
        userId,
      },
    });
  }

  async update(invocation: Invocation): Promise<Invocation> {
    return await this.repository.preload(invocation);
  }

  async delete(id: number): Promise<boolean> {
    const folder = await this.findOne(id);
    if (folder) {
      await this.repository.delete(id);
      return true;
    }
    return false;
  }
}
