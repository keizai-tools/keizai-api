import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IInvocationRepository } from '../../application/interface/invocation.repository.interface';
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
    return this.findOne(invocation.id);
  }

  async findAll(folderId: string): Promise<Invocation[]> {
    return await this.repository.find({
      order: { createdAt: 'DESC' },
      relations: {
        folder: true,
        selectedMethod: true,
        methods: true,
      },
      where: {
        folderId,
      },
    });
  }

  async findOne(id: string): Promise<Invocation> {
    return await this.repository.findOne({
      relations: {
        folder: {
          collection: true,
        },
        selectedMethod: true,
        methods: true,
        collection: true,
      },
      where: {
        id,
      },
    });
  }

  async findOneByIds(id: string, folderId: string): Promise<Invocation> {
    return await this.repository.findOne({
      relations: {
        folder: true,
        selectedMethod: true,
        methods: true,
      },
      where: {
        id,
        folderId,
      },
    });
  }

  async update(invocation: Invocation): Promise<Invocation> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const existingCollection = await queryRunner.manager.findOne(Invocation, {
        where: { id: invocation.id },
      });

      if (existingCollection)
        await queryRunner.manager.update(Invocation, invocation.id, invocation);
      await queryRunner.commitTransaction();
      return await this.findOne(invocation.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: string): Promise<boolean> {
    const invocation = await this.findOne(id);
    if (invocation) {
      await this.repository.delete(id);
      return true;
    }
    return false;
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    if (ids.length === 0) return true;
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.delete(Invocation, ids);
      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
