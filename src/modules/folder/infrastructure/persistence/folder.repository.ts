import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IFolderRepository } from '../../application/interface/folder.repository.interface';
import { Folder } from '../../domain/folder.domain';
import { FolderSchema } from './folder.schema';

@Injectable()
export class FolderRepository implements IFolderRepository {
  constructor(
    @InjectRepository(FolderSchema)
    private readonly repository: Repository<Folder>,
  ) {}

  async save(folder: Folder): Promise<Folder> {
    return this.repository.save(folder);
  }

  async findOne(id: string): Promise<Folder> {
    return await this.repository.findOne({
      where: {
        id,
      },
    });
  }

  async findOneByFolderAndUserId(id: string, userId: string): Promise<Folder> {
    return await this.repository.findOne({
      relations: {
        collection: true,
        invocations: { selectedMethod: true },
      },
      where: {
        id,
        collection: {
          userId,
        },
      },
    });
  }

  async findOneByFolderAndTeamId(id: string, teamId: string): Promise<Folder> {
    return await this.repository.findOne({
      relations: {
        collection: true,
        invocations: { selectedMethod: true },
      },
      where: {
        id,
        collection: {
          teamId,
        },
      },
    });
  }

  async update(folder: Folder): Promise<Folder> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const existingCollection = await queryRunner.manager.findOne(Folder, {
        where: { id: folder.id },
      });
      if (existingCollection)
        await queryRunner.manager.update(Folder, folder.id, folder);
      await queryRunner.commitTransaction();
      return await this.findOne(folder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: string): Promise<boolean> {
    const folder = await this.findOne(id);
    if (folder) {
      await this.repository.delete(id);
      return true;
    }
    return false;
  }
}
