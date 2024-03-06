import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IUserRoleToTeamRepository } from '../../application/repository/role.repository';
import { UserRoleToTeam } from '../../domain/role.domain';
import { UserRoleToTeamSchema } from './role.schema';

export class UserRoleToTeamRepository implements IUserRoleToTeamRepository {
  constructor(
    @InjectRepository(UserRoleToTeamSchema)
    private readonly repository: Repository<UserRoleToTeam>,
  ) {}
  async findAllByTeamId(teamId: string): Promise<UserRoleToTeam[]> {
    return await this.repository.find({
      order: { createdAt: 'DESC' },
      relations: { user: true, team: true },
      where: {
        teamId,
      },
    });
  }

  async findAllByUserId(userId: string): Promise<UserRoleToTeam[]> {
    return await this.repository.find({
      order: { createdAt: 'DESC' },
      relations: { user: true, team: true },
      where: {
        userId,
      },
    });
  }

  async findOne(id: string): Promise<UserRoleToTeam> {
    return await this.repository.findOne({
      order: { createdAt: 'DESC' },
      relations: { user: true, team: true },
      where: {
        id,
      },
    });
  }

  async findOneByIds(id: string, userId: string): Promise<UserRoleToTeam> {
    return await this.repository.findOne({
      order: { createdAt: 'DESC' },
      relations: { user: true, team: true },
      where: {
        id,
        userId,
      },
    });
  }

  async save(entity: UserRoleToTeam): Promise<UserRoleToTeam> {
    return this.repository.save(entity);
  }

  async saveAll(entities: UserRoleToTeam[]): Promise<UserRoleToTeam[]> {
    return this.repository.save(entities);
  }

  async update(userRoleToTeam: UserRoleToTeam): Promise<UserRoleToTeam> {
    return await this.repository.preload(userRoleToTeam);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.findOne(id);

    if (result) {
      await this.repository.delete(id);
      return true;
    }
    return false;
  }
}
