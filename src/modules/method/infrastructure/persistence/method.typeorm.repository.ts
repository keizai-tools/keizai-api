import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IMethodRepository } from '../../application/repository/method.interface.repository';
import { Method } from '../../domain/method.domain';
import { MethodSchema } from './method.schema';

@Injectable()
export class MethodRepository implements IMethodRepository {
  constructor(
    @InjectRepository(MethodSchema)
    private readonly repository: Repository<Method>,
  ) {}

  async save(param: Method): Promise<Method> {
    return this.repository.save(param);
  }

  async findAll(userId: string): Promise<Method[]> {
    return await this.repository.find({
      relations: { invocation: true },
      where: {
        userId,
      },
    });
  }

  async findOne(id: string): Promise<Method> {
    return await this.repository.findOne({
      where: {
        id,
      },
    });
  }

  async findOneByIds(id: string, userId: string): Promise<Method> {
    return await this.repository.findOne({
      where: {
        id,
        userId,
      },
    });
  }

  async update(param: Method): Promise<Method> {
    return await this.repository.preload(param);
  }

  async delete(id: string): Promise<boolean> {
    const method = await this.findOne(id);
    if (method) {
      await this.repository.delete(id);
      return true;
    }
    return false;
  }

  async deleteByInvocationId(invocationId: string): Promise<boolean> {
    const method = await this.repository.find({
      where: {
        invocation: {
          id: invocationId,
        },
      },
    });

    if (method.length > 0) {
      await this.repository.remove(method);
      return true;
    }

    return false;
  }
}
