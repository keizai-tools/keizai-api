import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ITeamRepository } from '../../application/interface/team.repository.interface';
import { Team } from '../../domain/team.domain';
import { TeamSchema } from './team.schema';

export class TeamRepository implements ITeamRepository {
  constructor(
    @InjectRepository(TeamSchema)
    private readonly repository: Repository<Team>,
  ) {}

  async save(team: Team): Promise<Team> {
    return this.repository.save(team);
  }

  async findAllByUser(userId: string): Promise<Team[]> {
    return await this.repository.find({
      order: { createdAt: 'DESC' },
      relations: { userMembers: true, collections: true, invitations: true },
      where: [{ userMembers: { userId } }],
    });
  }

  async findOne(id: string): Promise<Team> {
    return await this.repository.findOne({
      relations: { userMembers: true, collections: true, invitations: true },
      where: {
        id,
      },
    });
  }

  async findOneByIds(id: string, userId: string): Promise<Team> {
    return await this.repository.findOne({
      relations: { userMembers: true, collections: true },
      where: {
        id,
        userMembers: { userId },
      },
    });
  }

  async update(team: Team): Promise<Team> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const existingCollection = await queryRunner.manager.findOne(Team, {
        where: { id: team.id },
      });
      if (existingCollection)
        await queryRunner.manager.update(Team, team.id, team);
      await queryRunner.commitTransaction();
      return await this.findOne(team.id);
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
