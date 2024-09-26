import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Team } from '@/modules/team/domain/team.domain';
import { User } from '@/modules/user/domain/user.domain';

import { IUserRoleToTeamRepository } from '../../application/interface/role.repository.interface';
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

  async validateUserAndTeam(entity: UserRoleToTeam): Promise<boolean> {
    const user = await this.repository.manager.findOne(User, {
      where: { id: entity.userId },
    });
    const team = await this.repository.manager.findOne(Team, {
      where: { id: entity.teamId },
    });

    if (!user || !team) {
      return false;
    }
    return true;
  }

  async saveAll(entities: UserRoleToTeam[]): Promise<UserRoleToTeam[]> {
    return this.repository.save(entities);
  }

  async update(userRoleToTeam: UserRoleToTeam): Promise<UserRoleToTeam> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const existingCollection = await queryRunner.manager.findOne(
        UserRoleToTeam,
        {
          where: { id: userRoleToTeam.id },
        },
      );
      if (existingCollection)
        await queryRunner.manager.update(
          UserRoleToTeam,
          userRoleToTeam.id,
          userRoleToTeam,
        );
      await queryRunner.commitTransaction();
      return await this.findOne(userRoleToTeam.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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
