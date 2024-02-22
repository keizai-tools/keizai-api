import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ITeamRepository } from '../../application/repository/team.repository';
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
      relations: { users: true, collections: true },
      where: [{ adminId: userId }, { users: { id: userId } }],
    });
  }

  async findOne(id: string): Promise<Team> {
    return await this.repository.findOne({
      relations: { users: true, collections: true },
      where: {
        id,
      },
    });
  }

  async findOneByIds(id: string, adminId: string): Promise<Team> {
    return await this.repository.findOne({
      relations: { users: true, collections: true },
      where: {
        id,
        adminId,
      },
    });
  }

  async update(team: Team): Promise<Team> {
    return await this.repository.preload(team);
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
