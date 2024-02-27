import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, In, Repository } from 'typeorm';

import { IMethodRepository } from '../../application/repository/method.interface.repository';
import { Method } from '../../domain/method.domain';
import { MethodSchema } from './method.schema';

@Injectable()
export class MethodRepository implements IMethodRepository {
  constructor(
    @InjectRepository(MethodSchema)
    private readonly repository: Repository<Method>,
  ) {}

  async save(method: Method): Promise<Method> {
    return this.repository.save(method);
  }

  async saveAll(methods: Method[]): Promise<Method[]> {
    return this.repository.save(methods);
  }

  async findAll(invocationId: string): Promise<Method[]> {
    return await this.repository.find({
      relations: { invocation: true },
      where: {
        invocationId,
      },
    });
  }

  async findAllByInvocationId(invocationId: string): Promise<Method[]> {
    return await this.repository.find({
      where: {
        invocationId,
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

  async findOneByIds(id: string, invocationId: string): Promise<Method> {
    return await this.repository.findOne({
      where: {
        id,
        invocationId,
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

  async deleteAll(ids: string[]): Promise<DeleteResult> {
    return await this.repository.delete({
      id: In(ids),
    });
  }
}
