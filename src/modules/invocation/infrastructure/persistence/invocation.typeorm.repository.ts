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
    await this.repository.save(invocation);
    return this.findOneByIds(invocation.id, invocation.userId);
  }

  async findAll(userId: string): Promise<Invocation[]> {
    return await this.repository.find({
      order: { createdAt: 'DESC' },
      relations: {
        folder: true,
        selectedMethod: true,
        methods: true,
      },
      where: {
        userId,
      },
    });
  }

  async findOne(id: string): Promise<Invocation> {
    return await this.repository.findOne({
      where: {
        id,
      },
    });
  }

  async findOneByIds(id: string, userId: string): Promise<Invocation> {
    return await this.repository.findOne({
      relations: {
        folder: true,
        selectedMethod: true,
        methods: true,
      },
      where: {
        id,
        userId,
      },
    });
  }

  async update(invocation: Invocation): Promise<Invocation> {
    return await this.repository.preload(invocation);
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
