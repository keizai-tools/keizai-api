import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IFolderRepository } from '../../application/repository/folder.repository';
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
    return await this.repository.preload(folder);
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
